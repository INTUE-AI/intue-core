const { calculateTrend } = require('../utils/scoring');

/**
 * Analyzer for market-based sentiment indicators
 */
class MarketSentimentAnalyzer {
  /**
   * Create a new market sentiment analyzer
   * @param {Object} lunarcrushAdapter - LunarCrush adapter instance
   * @param {Object} cache - Cache instance
   */
  constructor(lunarcrushAdapter, cache) {
    this.lunarcrush = lunarcrushAdapter;
    this.cache = cache;
  }
  
  /**
   * Analyze market sentiment for an asset
   * @param {string} asset - Asset symbol or name
   * @param {string} timeframe - Time window ('1d', '7d', etc.)
   * @returns {Promise<Object>} - Market sentiment analysis
   */
  async analyze(asset, timeframe) {
    if (!this.lunarcrush) {
      throw new Error('LunarCrush adapter is required for market sentiment analysis');
    }
    
    const cacheKey = `market_sentiment_${asset}_${timeframe}`;
    const cachedResult = this.cache.get(cacheKey);
    if (cachedResult) return cachedResult;
    
    try {
      // Get time series data to analyze market behavior
      const timeSeriesData = await this.lunarcrush.getTimeSeries(
        asset, 
        '1d', 
        this._periodToDays(timeframe)
      );
      
      if (!timeSeriesData || timeSeriesData.length === 0) {
        throw new Error(`No time series data available for ${asset}`);
      }
      
      // Extract price and volume data
      const priceData = timeSeriesData.map(d => d.p || 0);
      const volumeData = timeSeriesData.map(d => d.v || 0);
      
      // Calculate price volatility (standard deviation of % changes)
      const priceChanges = [];
      for (let i = 1; i < priceData.length; i++) {
        const change = (priceData[i] - priceData[i-1]) / priceData[i-1];
        priceChanges.push(change);
      }
      
      const volatility = this._calculateStandardDeviation(priceChanges);
      
      // Calculate volume trend
      const volumeTrend = calculateTrend(volumeData.reverse()); // Newest first
      
      // Calculate price-volume correlation
      const correlation = this._calculateCorrelation(priceData, volumeData);
      
      // Calculate a market sentiment score (0-100)
      // This is a simplified model combining multiple indicators
      const priceTrend = calculateTrend(priceData.reverse());
      const trendFactor = priceTrend === 'rising' ? 1.2 : priceTrend === 'falling' ? 0.8 : 1;
      const volatilityFactor = Math.max(0, 1 - volatility * 10); // Lower volatility → higher score
      const correlationFactor = (correlation + 1) / 2; // Remap from [-1,1] to [0,1]
      
      const marketSentiment = Math.min(100, Math.max(0, 
        50 * trendFactor * (volatilityFactor * 0.4 + correlationFactor * 0.6)
      ));
      
      const result = {
        score: marketSentiment,
        normalized: marketSentiment / 100, // Normalize to 0-1
        trend: priceTrend,
        volatility,
        volumeTrend,
        priceVolumeCorrelation: correlation,
        source: 'market'
      };
      
      this.cache.set(cacheKey, result);
      return result;
    } catch (error) {
      console.error(`Error analyzing market sentiment for ${asset}:`, error);
      throw error;
    }
  }
  
  /**
   * Calculate standard deviation of an array
   * @private
   * @param {Array<number>} values - Array of values
   * @returns {number} - Standard deviation
   */
  _calculateStandardDeviation(values) {
    const n = values.length;
    if (n === 0) return 0;
    
    const mean = values.reduce((sum, val) => sum + val, 0) / n;
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / n;
    
    return Math.sqrt(variance);
  }
  
  /**
   * Calculate correlation between two arrays
   * @private
   * @param {Array<number>} xValues - First array
   * @param {Array<number>} yValues - Second array
   * @returns {number} - Pearson correlation coefficient (-1 to 1)
   */
  _calculateCorrelation(xValues, yValues) {
    const n = Math.min(xValues.length, yValues.length);
    if (n < 2) return 0;
    
    // Calculate means
    const xMean = xValues.slice(0, n).reduce((sum, val) => sum + val, 0) / n;
    const yMean = yValues.slice(0, n).reduce((sum, val) => sum + val, 0) / n;
    
    // Calculate sums for correlation formula
    let numerator = 0;
    let xVariance = 0;
    let yVariance = 0;
    
    for (let i = 0; i < n; i++) {
      const xDiff = xValues[i] - xMean;
      const yDiff = yValues[i] - yMean;
      
      numerator += xDiff * yDiff;
      xVariance += xDiff * xDiff;
      yVariance += yDiff * yDiff;
    }
    
    // Prevent division by zero
    if (xVariance === 0 || yVariance === 0) return 0;
    
    return numerator / Math.sqrt(xVariance * yVariance);
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

module.exports = { MarketSentimentAnalyzer };