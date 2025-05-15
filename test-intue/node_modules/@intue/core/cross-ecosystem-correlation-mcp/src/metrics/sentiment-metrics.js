/**
 * Handles sentiment metrics for assets and ecosystems
 */
class SentimentMetrics {
  /**
   * Create sentiment metrics handler
   * @param {Object} sentimentAnalyzer - Sentiment Analyzer instance
   * @param {Object} cache - Cache instance
   */
  constructor(sentimentAnalyzer, cache) {
    this.sentimentAnalyzer = sentimentAnalyzer;
    this.cache = cache;
  }
  
  /**
   * Get sentiment data for an ecosystem
   * @param {string} ecosystem - Ecosystem name
   * @param {string} timeframe - Time window
   * @returns {Promise<Array<number>>} - Normalized sentiment data
   */
  async getEcosystemSentimentData(ecosystem, timeframe) {
    const cacheKey = `ecosystem_sentiment_${ecosystem}_${timeframe}`;
    
    // Check cache
    const cachedData = this.cache.get(cacheKey);
    if (cachedData) return cachedData;
    
    try {
      // Get ecosystem sentiment
      const ecosystemSentiment = await this.sentimentAnalyzer.analyzeEcosystemSentiment(
        ecosystem,
        { timeframe, limit: 10 }
      );
      
      if (!ecosystemSentiment) {
        throw new Error(`No sentiment data available for ecosystem: ${ecosystem}`);
      }
      
      // Get sentiment for top assets in ecosystem
      const assetSentiments = [];
      let totalMarketCap = 0;
      
      for (const asset of ecosystemSentiment.topAssets) {
        const assetSymbol = asset.asset;
        
        // Get coin data for market cap
        const coinData = await this.sentimentAnalyzer.adapters.lunarcrush.getCoinData(assetSymbol);
        const marketCap = coinData.mc || 1e9;
        totalMarketCap += marketCap;
        
        // Get sentiment time series for this asset
        const timeSeries = await this._getAssetSentimentTimeSeries(assetSymbol, timeframe);
        
        if (timeSeries && timeSeries.length > 0) {
          assetSentiments.push({
            symbol: assetSymbol,
            marketCap,
            data: timeSeries
          });
        }
      }
      
      // No data available
      if (assetSentiments.length === 0) {
        // Return a flat line of the ecosystem sentiment score
        const days = this._periodToDays(timeframe);
        return Array(days).fill(ecosystemSentiment.score / 100);
      }
      
      // Calculate weighted ecosystem sentiment
      const result = [];
      const firstDataLength = assetSentiments[0].data.length;
      
      for (let i = 0; i < firstDataLength; i++) {
        let weightedSentiment = 0;
        let totalWeight = 0;
        
        for (const asset of assetSentiments) {
          if (i < asset.data.length) {
            const weight = asset.marketCap / totalMarketCap;
            weightedSentiment += asset.data[i] * weight;
            totalWeight += weight;
          }
        }
        
        if (totalWeight > 0) {
          result.push(weightedSentiment / totalWeight);
        }
      }
      
      // Normalize the result
      const normalizedResult = result.map(s => s / 100);
      
      // Cache result
      this.cache.set(cacheKey, normalizedResult);
      return normalizedResult;
    } catch (error) {
      console.error(`Error getting ecosystem sentiment data for ${ecosystem}:`, error);
      
      // Return default data
      const days = this._periodToDays(timeframe);
      const defaultData = Array(days).fill(0.5); // Default to neutral sentiment
      return defaultData;
    }
  }
  
  /**
   * Get sentiment data for an asset
   * @param {string} asset - Asset symbol or name
   * @param {string} timeframe - Time window
   * @returns {Promise<Array<number>>} - Normalized sentiment data
   */
  async getAssetSentimentData(asset, timeframe) {
    const cacheKey = `asset_sentiment_${asset}_${timeframe}`;
    
    // Check cache
    const cachedData = this.cache.get(cacheKey);
    if (cachedData) return cachedData;
    
    try {
      // Get asset sentiment
      const sentimentData = await this.sentimentAnalyzer.analyzeSentiment(
        asset,
        { timeframe, sources: ['social', 'news'] }
      );
      
      if (!sentimentData) {
        throw new Error(`No sentiment data available for asset: ${asset}`);
      }
      
      // Get sentiment time series
      const timeSeries = await this._getAssetSentimentTimeSeries(asset, timeframe);
      
      if (!timeSeries || timeSeries.length === 0) {
        // Return a flat line of the sentiment score
        const days = this._periodToDays(timeframe);
        return Array(days).fill(sentimentData.normalized);
      }
      
      // Normalize the result
      const normalizedResult = timeSeries.map(s => s / 100);
      
      // Cache result
      this.cache.set(cacheKey, normalizedResult);
      return normalizedResult;
    } catch (error) {
      console.error(`Error getting asset sentiment data for ${asset}:`, error);
      
      // Return default data
      const days = this._periodToDays(timeframe);
      const defaultData = Array(days).fill(0.5); // Default to neutral sentiment
      return defaultData;
    }
  }
  
  /**
   * Get sentiment time series for an asset
   * @private
   * @param {string} asset - Asset symbol or name
   * @param {string} timeframe - Time window
   * @returns {Promise<Array<number>>} - Sentiment time series
   */
  async _getAssetSentimentTimeSeries(asset, timeframe) {
    try {
      // Get time series data from LunarCrush
      const timeSeries = await this.sentimentAnalyzer.adapters.lunarcrush.getTimeSeries(
        asset,
        '1d',
        this._periodToDays(timeframe)
      );
      
      if (!timeSeries || timeSeries.length === 0) {
        return [];
      }
      
      // Extract galaxy score (sentiment) from time series
      return timeSeries.map(d => d.gs || 50).reverse(); // newest first
    } catch (error) {
      console.error(`Error getting asset sentiment time series for ${asset}:`, error);
      return [];
    }
  }
  
  /**
   * Get ecosystem sentiment time series
   * @param {string} ecosystem - Ecosystem name
   * @param {string} timeframe - Time window
   * @param {string} interval - Data interval
   * @returns {Promise<Array<number>>} - Sentiment time series
   */
  async getEcosystemSentimentTimeSeries(ecosystem, timeframe, interval) {
    const cacheKey = `ecosystem_sentiment_ts_${ecosystem}_${timeframe}_${interval}`;
    
    // Check cache
    const cachedData = this.cache.get(cacheKey);
    if (cachedData) return cachedData;
    
    try {
      const data = await this.getEcosystemSentimentData(ecosystem, timeframe);
      
      // If we have daily data but need a different interval, resample
      if (interval !== '1d' && data.length > 0) {
        return this._resampleTimeSeries(data, interval);
      }
      
      return data;
    } catch (error) {
      console.error(`Error getting ecosystem sentiment time series for ${ecosystem}:`, error);
      
      // Return default data
      const days = this._periodToDays(timeframe);
      return Array(days).fill(0.5); // Default to neutral sentiment
    }
  }
  
  /**
   * Resample a time series to a different interval
   * @private
   * @param {Array<number>} data - Original time series
   * @param {string} interval - Target interval
   * @returns {Array<number>} - Resampled time series
   */
  _resampleTimeSeries(data, interval) {
    if (!data || data.length === 0) return [];
    
    // Get period length in days
    const periodDays = this._periodToDays(interval);
    const periodsPerDay = 1 / periodDays;
    
    // If period is less than a day, we can't downsample from daily data
    if (periodDays < 1) return data;
    
    // Calculate number of periods
    const numPeriods = Math.ceil(data.length * periodDays);
    const result = [];
    
    // Downsample by averaging
    for (let i = 0; i < numPeriods; i++) {
      const startIdx = Math.floor(i / periodDays);
      const endIdx = Math.min(Math.floor((i + 1) / periodDays), data.length);
      
      let sum = 0;
      let count = 0;
      
      for (let j = startIdx; j < endIdx; j++) {
        sum += data[j];
        count++;
      }
      
      result.push(count > 0 ? sum / count : 0);
    }
    
    return result;
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

module.exports = { SentimentMetrics };