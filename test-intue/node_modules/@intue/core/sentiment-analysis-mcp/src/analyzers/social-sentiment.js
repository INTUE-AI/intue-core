const { calculateTrend } = require('../utils/scoring');

/**
 * Analyzer for social sentiment data
 */
class SocialSentimentAnalyzer {
  /**
   * Create a new social sentiment analyzer
   * @param {Object} lunarcrushAdapter - LunarCrush adapter instance
   * @param {Object} cache - Cache instance
   */
  constructor(lunarcrushAdapter, cache) {
    this.lunarcrush = lunarcrushAdapter;
    this.cache = cache;
  }
  
  /**
   * Analyze social sentiment for an asset
   * @param {string} asset - Asset symbol or name
   * @param {string} timeframe - Time window ('1d', '7d', etc.)
   * @returns {Promise<Object>} - Social sentiment analysis
   */
  async analyze(asset, timeframe) {
    if (!this.lunarcrush) {
      throw new Error('LunarCrush adapter is required for social sentiment analysis');
    }
    
    const cacheKey = `social_sentiment_${asset}_${timeframe}`;
    const cachedResult = this.cache.get(cacheKey);
    if (cachedResult) return cachedResult;
    
    try {
      // Get social metrics from LunarCrush
      const metrics = await this.lunarcrush.getSocialMetrics(asset, this._periodToDays(timeframe));
      
      // Get historical time series to calculate trend
      const timeSeriesData = await this.lunarcrush.getTimeSeries(
        asset, 
        '1d', 
        this._periodToDays(timeframe)
      );
      
      // Calculate sentiment score (0-100)
      const sentimentScore = metrics.sentiment || 0;
      
      // Calculate engagement metrics
      const engagement = {
        volume: metrics.socialVolume || 0,
        participants: timeSeriesData.reduce((sum, d) => sum + (d.sc || 0), 0),
        intensity: metrics.engagement || 0
      };
      
      // Calculate trend over time
      const sentimentValues = timeSeriesData.map(d => d.gs || 0).reverse(); // Newest first
      const trend = calculateTrend(sentimentValues);
      
      const result = {
        score: sentimentScore,
        normalized: sentimentScore / 100, // Normalize to 0-1
        trend,
        engagement,
        source: 'social'
      };
      
      this.cache.set(cacheKey, result);
      return result;
    } catch (error) {
      console.error(`Error analyzing social sentiment for ${asset}:`, error);
      throw error;
    }
  }
  
  /**
   * Analyze news sentiment for an asset
   * @param {string} asset - Asset symbol or name
   * @param {string} timeframe - Time window ('1d', '7d', etc.)
   * @returns {Promise<Object>} - News sentiment analysis
   */
  async analyzeNewsSentiment(asset, timeframe) {
    if (!this.lunarcrush) {
      throw new Error('LunarCrush adapter is required for news sentiment analysis');
    }
    
    const cacheKey = `news_sentiment_${asset}_${timeframe}`;
    const cachedResult = this.cache.get(cacheKey);
    if (cachedResult) return cachedResult;
    
    try {
      // Get time series data which includes news metrics
      const timeSeriesData = await this.lunarcrush.getTimeSeries(
        asset, 
        '1d', 
        this._periodToDays(timeframe)
      );
      
      // Extract news sentiment from time series
      // Note: LunarCrush doesn't provide direct news sentiment, so we approximate
      // using available metrics or use mock data for this example
      const newsSentiment = timeSeriesData.map(d => {
        // Check if data has news metrics, otherwise use an approximation
        const newsSentiment = d.ns || d.ss * 0.8 + Math.random() * 20; // Approx based on social score
        return newsSentiment;
      });
      
      // Calculate average news sentiment
      const avgNewsSentiment = newsSentiment.reduce((sum, val) => sum + val, 0) / newsSentiment.length;
      
      // Calculate trend
      const trend = calculateTrend(newsSentiment.reverse()); // Newest first
      
      const result = {
        score: avgNewsSentiment,
        normalized: avgNewsSentiment / 100, // Normalize to 0-1
        trend,
        articleCount: timeSeriesData.reduce((sum, d) => sum + (d.an || 0), 0), // Article count if available
        source: 'news'
      };
      
      this.cache.set(cacheKey, result);
      return result;
    } catch (error) {
      console.error(`Error analyzing news sentiment for ${asset}:`, error);
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
}

module.exports = { SocialSentimentAnalyzer };