const { Cache } = require('@intue/core');
const { SocialSentimentAnalyzer } = require('./analyzers/social-sentiment');
const { MarketSentimentAnalyzer } = require('./analyzers/market-sentiment');
const SentimentModel = require('./models/sentiment-model');

/**
 * Main Sentiment Analysis Model Context Protocol (MCP)
 * Integrates multiple sentiment analysis approaches into a unified model
 */
class SentimentAnalyzer {
  /**
   * Create a new Sentiment Analyzer
   * @param {Object} options - Configuration options
   * @param {Object} options.adapters - Data adapters
   * @param {Object} [options.weights] - Weights for different sentiment sources
   * @param {Object} [options.cache] - Optional cache instance
   * @param {number} [options.ttl] - Cache TTL in milliseconds
   */
  constructor(options = {}) {
    this.adapters = options.adapters || {};
    
    // Set default weights if not provided
    this.weights = options.weights || {
      social: 0.6,
      news: 0.3,
      market: 0.1
    };
    
    // Normalize weights to sum to 1
    const weightSum = Object.values(this.weights).reduce((sum, w) => sum + w, 0);
    for (const [key, value] of Object.entries(this.weights)) {
      this.weights[key] = value / weightSum;
    }
    
    // Initialize cache
    this.cache = options.cache || new Cache({ ttl: options.ttl });
    
    // Initialize analyzers
    this.socialAnalyzer = new SocialSentimentAnalyzer(this.adapters.lunarcrush, this.cache);
    this.marketAnalyzer = new MarketSentimentAnalyzer(this.adapters.lunarcrush, this.cache);
    
    // Initialize sentiment model
    this.model = new SentimentModel();
  }
  
  /**
   * Analyze sentiment for a specific asset
   * @param {string} asset - Asset symbol or name
   * @param {Object} [options] - Analysis options
   * @param {string} [options.timeframe='7d'] - Time window
   * @param {Array<string>} [options.sources=['social', 'news', 'market']] - Data sources
   * @returns {Promise<Object>} - Sentiment analysis results
   */
  async analyzeSentiment(asset, options = {}) {
    const timeframe = options.timeframe || '7d';
    const sources = options.sources || ['social', 'news', 'market'];
    
    const cacheKey = `sentiment_${asset}_${timeframe}_${sources.join('_')}`;
    const cachedResult = this.cache.get(cacheKey);
    if (cachedResult) return cachedResult;
    
    // Collect data from each requested source
    const sentimentData = {};
    let totalWeight = 0;
    
    if (sources.includes('social') && this.adapters.lunarcrush) {
      try {
        sentimentData.social = await this.socialAnalyzer.analyze(asset, timeframe);
        totalWeight += this.weights.social;
      } catch (error) {
        console.warn(`Error analyzing social sentiment for ${asset}:`, error.message);
      }
    }
    
    if (sources.includes('news') && this.adapters.lunarcrush) {
      try {
        // News sentiment is currently derived from social data in this implementation
        const newsData = await this.socialAnalyzer.analyzeNewsSentiment(asset, timeframe);
        sentimentData.news = newsData;
        totalWeight += this.weights.news;
      } catch (error) {
        console.warn(`Error analyzing news sentiment for ${asset}:`, error.message);
      }
    }
    
    if (sources.includes('market') && this.adapters.lunarcrush) {
      try {
        sentimentData.market = await this.marketAnalyzer.analyze(asset, timeframe);
        totalWeight += this.weights.market;
      } catch (error) {
        console.warn(`Error analyzing market sentiment for ${asset}:`, error.message);
      }
    }
    
    // If no data could be collected, return null
    if (Object.keys(sentimentData).length === 0) {
      return null;
    }
    
    // Process collected data through the sentiment model
    const result = this.model.process(sentimentData, this.weights, totalWeight);
    
    // Cache and return result
    this.cache.set(cacheKey, result);
    return result;
  }
  
  /**
   * Analyze sentiment across an ecosystem
   * @param {string} ecosystem - Ecosystem name
   * @param {Object} [options] - Analysis options
   * @param {string} [options.timeframe='7d'] - Time window
   * @param {number} [options.limit=10] - Number of assets to analyze
   * @returns {Promise<Object>} - Ecosystem sentiment analysis
   */
  async analyzeEcosystemSentiment(ecosystem, options = {}) {
    const timeframe = options.timeframe || '7d';
    const limit = options.limit || 10;
    
    const cacheKey = `ecosystem_sentiment_${ecosystem}_${timeframe}_${limit}`;
    const cachedResult = this.cache.get(cacheKey);
    if (cachedResult) return cachedResult;
    
    try {
      // Get top assets in the ecosystem
      const ecosystemAssets = await this.adapters.lunarcrush.getEcosystemCoins(ecosystem, limit);
      
      if (!ecosystemAssets || ecosystemAssets.length === 0) {
        throw new Error(`No assets found for ecosystem: ${ecosystem}`);
      }
      
      // Analyze sentiment for each asset
      const assetSentiments = [];
      let ecosystemScore = 0;
      
      for (const asset of ecosystemAssets) {
        const assetSymbol = asset.s || asset.symbol || asset;
        const sentiment = await this.analyzeSentiment(assetSymbol, {
          timeframe,
          sources: ['social', 'news', 'market']
        });
        
        if (sentiment) {
          assetSentiments.push({
            asset: assetSymbol,
            score: sentiment.score,
            trend: sentiment.trend
          });
          
          ecosystemScore += sentiment.score;
        }
      }
      
      // Calculate average ecosystem sentiment
      const avgEcosystemScore = assetSentiments.length > 0 
        ? ecosystemScore / assetSentiments.length 
        : 0;
      
      // Sort assets by sentiment score
      const topAssets = assetSentiments
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);
      
      // Determine overall trend
      const positiveCount = assetSentiments.filter(s => s.trend === 'rising').length;
      const negativeCount = assetSentiments.filter(s => s.trend === 'falling').length;
      const trend = positiveCount > negativeCount ? 'rising' : 
                   negativeCount > positiveCount ? 'falling' : 'stable';
      
      const result = {
        ecosystem,
        score: avgEcosystemScore,
        trend,
        topAssets,
        assetCount: assetSentiments.length
      };
      
      this.cache.set(cacheKey, result);
      return result;
    } catch (error) {
      console.error(`Error analyzing ecosystem sentiment for ${ecosystem}:`, error);
      throw error;
    }
  }
  
  /**
   * Analyze correlation between sentiment and price
   * @param {string} asset - Asset symbol or name
   * @param {Object} [options] - Analysis options
   * @param {string} [options.timeframe='90d'] - Time window
   * @param {string} [options.interval='1d'] - Data interval
   * @returns {Promise<Object>} - Correlation analysis
   */
  async analyzeSentimentPriceCorrelation(asset, options = {}) {
    const timeframe = options.timeframe || '90d';
    const interval = options.interval || '1d';
    
    const cacheKey = `correlation_${asset}_${timeframe}_${interval}`;
    const cachedResult = this.cache.get(cacheKey);
    if (cachedResult) return cachedResult;
    
    try {
      // Get historical data
      const timeSeries = await this.adapters.lunarcrush.getTimeSeries(
        asset, 
        interval,
        this._periodToDays(timeframe)
      );
      
      if (!timeSeries || timeSeries.length === 0) {
        throw new Error(`No time series data available for ${asset}`);
      }
      
      // Extract sentiment and price data
      const sentimentData = timeSeries.map(d => d.gs || 0); // Galaxy Score as sentiment
      const priceData = timeSeries.map(d => d.p || 0); // Price
      
      // Calculate correlations
      const correlation = this.model.calculateCorrelation(sentimentData, priceData);
      
      // Calculate lag effect (how many days sentiment leads/lags price)
      const lag = this.model.calculateOptimalLag(sentimentData, priceData, 7); // Max 7 days lag
      
      const result = {
        asset,
        coefficient: correlation,
        lag,
        significance: Math.abs(correlation) > 0.5 ? 'high' : 
                     Math.abs(correlation) > 0.3 ? 'medium' : 'low',
        interpretation: this._interpretCorrelation(correlation, lag)
      };
      
      this.cache.set(cacheKey, result);
      return result;
    } catch (error) {
      console.error(`Error analyzing sentiment-price correlation for ${asset}:`, error);
      throw error;
    }
  }
  
  /**
   * Convert time period string to days
   * @private
   * @param {string} period - Time period (e.g., '1d', '7d', '30d')
   * @returns {number} - Number of days
   */
  _periodToDays(period) {
    const match = period.match(/^(\d+)([hdwmy])$/);
    if (!match) return 7; // Default to 7 days
    
    const [, value, unit] = match;
    const numValue = parseInt(value, 10);
    
    switch (unit) {
      case 'h': return numValue / 24; // hours to days
      case 'd': return numValue; // already days
      case 'w': return numValue * 7; // weeks to days
      case 'm': return numValue * 30; // months to days (approx)
      case 'y': return numValue * 365; // years to days (approx)
      default: return 7;
    }
  }
  
  /**
   * Interpret correlation results
   * @private
   * @param {number} coefficient - Correlation coefficient
   * @param {number} lag - Time lag in days
   * @returns {string} - Interpretation
   */
  _interpretCorrelation(coefficient, lag) {
    const strength = Math.abs(coefficient) > 0.7 ? 'strong' : 
                     Math.abs(coefficient) > 0.5 ? 'moderate' : 
                     Math.abs(coefficient) > 0.3 ? 'weak' : 'very weak';
    
    const direction = coefficient > 0 ? 'positive' : 'negative';
    
    if (lag === 0) {
      return `Sentiment shows a ${strength} ${direction} correlation with price movements, occurring simultaneously.`;
    } else if (lag > 0) {
      return `Sentiment shows a ${strength} ${direction} correlation with price movements, leading by ${lag} day(s).`;
    } else {
      return `Sentiment shows a ${strength} ${direction} correlation with price movements, lagging by ${Math.abs(lag)} day(s).`;
    }
  }
}

module.exports = SentimentAnalyzer;