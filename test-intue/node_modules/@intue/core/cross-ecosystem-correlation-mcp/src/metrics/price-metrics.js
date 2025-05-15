/**
 * Handles price metrics for assets and ecosystems
 */
class PriceMetrics {
  /**
   * Create price metrics handler
   * @param {Object} lunarcrushAdapter - LunarCrush adapter instance
   * @param {Object} cache - Cache instance
   */
  constructor(lunarcrushAdapter, cache) {
    this.lunarcrush = lunarcrushAdapter;
    this.cache = cache;
  }
  
  /**
   * Get price data for an ecosystem
   * @param {string} ecosystem - Ecosystem name
   * @param {string} timeframe - Time window
   * @returns {Promise<Array<number>>} - Normalized price data
   */
  async getEcosystemPriceData(ecosystem, timeframe) {
    const cacheKey = `ecosystem_price_${ecosystem}_${timeframe}`;
    
    // Check cache
    const cachedData = this.cache.get(cacheKey);
    if (cachedData) return cachedData;
    
    try {
      // Get top coins in the ecosystem
      const ecosystemCoins = await this.lunarcrush.getEcosystemCoins(ecosystem, 10);
      
      if (!ecosystemCoins || ecosystemCoins.length === 0) {
        throw new Error(`No coins found for ecosystem: ${ecosystem}`);
      }
      
      // Get price data for each coin
      const priceData = [];
      let totalMarketCap = 0;
      
      for (const coin of ecosystemCoins) {
        const symbol = coin.s || coin.symbol || coin;
        const marketCap = coin.mc || 1e9; // Use market cap for weighting
        totalMarketCap += marketCap;
        
        // Get time series data
        const timeSeries = await this.lunarcrush.getTimeSeries(
          symbol,
          '1d',
          this._periodToDays(timeframe)
        );
        
        // Extract and normalize price data
        if (timeSeries && timeSeries.length > 0) {
          // Get price data and normalize to percent changes
          const prices = timeSeries.map(d => d.p || 0).reverse(); // newest first
          const normalizedPrices = this._normalizeToPercentChanges(prices);
          
          // Store price data with weight
          priceData.push({
            symbol,
            marketCap,
            prices: normalizedPrices
          });
        }
      }
      
      // No data available
      if (priceData.length === 0) {
        throw new Error(`No price data available for ecosystem: ${ecosystem}`);
      }
      
      // Calculate weighted ecosystem price index
      const result = [];
      const firstDataLength = priceData[0].prices.length;
      
      for (let i = 0; i < firstDataLength; i++) {
        let weightedPrice = 0;
        let totalWeight = 0;
        
        for (const data of priceData) {
          if (i < data.prices.length) {
            const weight = data.marketCap / totalMarketCap;
            weightedPrice += data.prices[i] * weight;
            totalWeight += weight;
          }
        }
        
        if (totalWeight > 0) {
          result.push(weightedPrice / totalWeight);
        }
      }
      
      // Cache result
      this.cache.set(cacheKey, result);
      return result;
    } catch (error) {
      console.error(`Error getting ecosystem price data for ${ecosystem}:`, error);
      throw error;
    }
  }
  
  /**
   * Get price data for an asset
   * @param {string} asset - Asset symbol or name
   * @param {string} timeframe - Time window
   * @returns {Promise<Array<number>>} - Normalized price data
   */
  async getAssetPriceData(asset, timeframe) {
    const cacheKey = `asset_price_${asset}_${timeframe}`;
    
    // Check cache
    const cachedData = this.cache.get(cacheKey);
    if (cachedData) return cachedData;
    
    try {
      // Get time series data
      const timeSeries = await this.lunarcrush.getTimeSeries(
        asset,
        '1d',
        this._periodToDays(timeframe)
      );
      
      if (!timeSeries || timeSeries.length === 0) {
        throw new Error(`No time series data available for asset: ${asset}`);
      }
      
      // Extract price data
      const prices = timeSeries.map(d => d.p || 0).reverse(); // newest first
      
      // Normalize price data
      const normalizedPrices = this._normalizeToPercentChanges(prices);
      
      // Cache result
      this.cache.set(cacheKey, normalizedPrices);
      return normalizedPrices;
    } catch (error) {
      console.error(`Error getting asset price data for ${asset}:`, error);
      throw error;
    }
  }
  
  /**
   * Get ecosystem price time series
   * @param {string} ecosystem - Ecosystem name
   * @param {string} timeframe - Time window
   * @param {string} interval - Data interval
   * @returns {Promise<Array<number>>} - Price time series
   */
  async getEcosystemPriceTimeSeries(ecosystem, timeframe, interval) {
    const cacheKey = `ecosystem_price_ts_${ecosystem}_${timeframe}_${interval}`;
    
    // Check cache
    const cachedData = this.cache.get(cacheKey);
    if (cachedData) return cachedData;
    
    try {
      const ecosystemCoins = await this.lunarcrush.getEcosystemCoins(ecosystem, 5);
      
      if (!ecosystemCoins || ecosystemCoins.length === 0) {
        throw new Error(`No coins found for ecosystem: ${ecosystem}`);
      }
      
      // Get price data for each coin
      const prices = [];
      let totalMarketCap = 0;
      
      for (const coin of ecosystemCoins) {
        const symbol = coin.s || coin.symbol || coin;
        const marketCap = coin.mc || 1e9;
        totalMarketCap += marketCap;
        
        const timeSeries = await this.lunarcrush.getTimeSeries(
          symbol,
          interval,
          this._periodToDays(timeframe)
        );
        
        if (timeSeries && timeSeries.length > 0) {
          prices.push({
            symbol,
            marketCap,
            data: timeSeries.map(d => d.p || 0)
          });
        }
      }
      
      // Calculate weighted ecosystem price
      const result = [];
      const firstDataLength = prices[0]?.data.length || 0;
      
      for (let i = 0; i < firstDataLength; i++) {
        let weightedPrice = 0;
        let totalWeight = 0;
        
        for (const data of prices) {
          if (i < data.data.length) {
            const weight = data.marketCap / totalMarketCap;
            weightedPrice += data.data[i] * weight;
            totalWeight += weight;
          }
        }
        
        if (totalWeight > 0) {
          result.push(weightedPrice / totalWeight);
        }
      }
      
      // Cache result
      this.cache.set(cacheKey, result);
      return result;
    } catch (error) {
      console.error(`Error getting ecosystem price time series for ${ecosystem}:`, error);
      throw error;
    }
  }
  
  /**
   * Normalize prices to percent changes
   * @private
   * @param {Array<number>} prices - Raw price array
   * @returns {Array<number>} - Normalized price changes
   */
  _normalizeToPercentChanges(prices) {
    if (!prices || prices.length < 2) return prices;
    
    const result = [1]; // Start with 1 (100%) for the first point
    
    for (let i = 1; i < prices.length; i++) {
      if (prices[i-1] === 0) {
        result.push(1); // Avoid division by zero
      } else {
        const percentChange = prices[i] / prices[i-1];
        result.push(percentChange);
      }
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

module.exports = { PriceMetrics };