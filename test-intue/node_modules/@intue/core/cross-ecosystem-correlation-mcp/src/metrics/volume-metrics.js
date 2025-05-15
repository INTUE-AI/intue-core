/**
 * Handles volume metrics for assets and ecosystems
 */
class VolumeMetrics {
  /**
   * Create volume metrics handler
   * @param {Object} lunarcrushAdapter - LunarCrush adapter instance
   * @param {Object} cache - Cache instance
   */
  constructor(lunarcrushAdapter, cache) {
    this.lunarcrush = lunarcrushAdapter;
    this.cache = cache;
  }
  
  /**
   * Get volume data for an ecosystem
   * @param {string} ecosystem - Ecosystem name
   * @param {string} timeframe - Time window
   * @returns {Promise<Array<number>>} - Normalized volume data
   */
  async getEcosystemVolumeData(ecosystem, timeframe) {
    const cacheKey = `ecosystem_volume_${ecosystem}_${timeframe}`;
    
    // Check cache
    const cachedData = this.cache.get(cacheKey);
    if (cachedData) return cachedData;
    
    try {
      // Get top coins in the ecosystem
      const ecosystemCoins = await this.lunarcrush.getEcosystemCoins(ecosystem, 10);
      
      if (!ecosystemCoins || ecosystemCoins.length === 0) {
        throw new Error(`No coins found for ecosystem: ${ecosystem}`);
      }
      
      // Get volume data for each coin
      const volumeData = [];
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
        
        // Extract and store volume data with market cap weight
        if (timeSeries && timeSeries.length > 0) {
          // Store volume data with weight
          volumeData.push({
            symbol,
            marketCap,
            volumes: timeSeries.map(d => d.v || 0).reverse() // newest first
          });
        }
      }
      
      // No data available
      if (volumeData.length === 0) {
        throw new Error(`No volume data available for ecosystem: ${ecosystem}`);
      }
      
      // Calculate weighted ecosystem volume
      const result = [];
      const firstDataLength = volumeData[0].volumes.length;
      
      for (let i = 0; i < firstDataLength; i++) {
        let weightedVolume = 0;
        let totalWeight = 0;
        
        for (const data of volumeData) {
          if (i < data.volumes.length) {
            const weight = data.marketCap / totalMarketCap;
            weightedVolume += data.volumes[i] * weight;
            totalWeight += weight;
          }
        }
        
        if (totalWeight > 0) {
          result.push(weightedVolume / totalWeight);
        }
      }
      
      // Normalize the result
      const maxVolume = Math.max(...result);
      const normalizedResult = result.map(vol => vol / maxVolume);
      
      // Cache result
      this.cache.set(cacheKey, normalizedResult);
      return normalizedResult;
    } catch (error) {
      console.error(`Error getting ecosystem volume data for ${ecosystem}:`, error);
      throw error;
    }
  }
  
  /**
   * Get volume data for an asset
   * @param {string} asset - Asset symbol or name
   * @param {string} timeframe - Time window
   * @returns {Promise<Array<number>>} - Normalized volume data
   */
  async getAssetVolumeData(asset, timeframe) {
    const cacheKey = `asset_volume_${asset}_${timeframe}`;
    
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
      
      // Extract volume data
      const volumeData = timeSeries.map(d => d.v || 0).reverse(); // newest first
      
      // Normalize volume data
      const maxVolume = Math.max(...volumeData);
      const normalizedResult = volumeData.map(vol => vol / maxVolume);
      
      // Cache result
      this.cache.set(cacheKey, normalizedResult);
      return normalizedResult;
    } catch (error) {
      console.error(`Error getting asset volume data for ${asset}:`, error);
      throw error;
    }
  }
  
  /**
   * Get ecosystem volume time series
   * @param {string} ecosystem - Ecosystem name
   * @param {string} timeframe - Time window
   * @param {string} interval - Data interval
   * @returns {Promise<Array<number>>} - Volume time series
   */
  async getEcosystemVolumeTimeSeries(ecosystem, timeframe, interval) {
    const cacheKey = `ecosystem_volume_ts_${ecosystem}_${timeframe}_${interval}`;
    
    // Check cache
    const cachedData = this.cache.get(cacheKey);
    if (cachedData) return cachedData;
    
    try {
      const ecosystemCoins = await this.lunarcrush.getEcosystemCoins(ecosystem, 5);
      
      if (!ecosystemCoins || ecosystemCoins.length === 0) {
        throw new Error(`No coins found for ecosystem: ${ecosystem}`);
      }
      
      // Get volume data for each coin
      const volumes = [];
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
          volumes.push({
            symbol,
            marketCap,
            data: timeSeries.map(d => d.v || 0)
          });
        }
      }
      
      // Calculate weighted ecosystem volume
      const result = [];
      const firstDataLength = volumes[0]?.data.length || 0;
      
      for (let i = 0; i < firstDataLength; i++) {
        let weightedVolume = 0;
        let totalWeight = 0;
        
        for (const data of volumes) {
          if (i < data.data.length) {
            const weight = data.marketCap / totalMarketCap;
            weightedVolume += data.data[i] * weight;
            totalWeight += weight;
          }
        }
        
        if (totalWeight > 0) {
          result.push(weightedVolume / totalWeight);
        }
      }
      
      // Cache result
      this.cache.set(cacheKey, result);
      return result;
    } catch (error) {
      console.error(`Error getting ecosystem volume time series for ${ecosystem}:`, error);
      throw error;
    }
  }
  
  /**
   * Get volume change for an ecosystem
   * @param {string} ecosystem - Ecosystem name
   * @param {string} timeframe - Time window
   * @returns {Promise<Object>} - Volume change data
   */
  async getEcosystemVolumeChange(ecosystem, timeframe) {
    const cacheKey = `ecosystem_volume_change_${ecosystem}_${timeframe}`;
    
    // Check cache
    const cachedData = this.cache.get(cacheKey);
    if (cachedData) return cachedData;
    
    try {
      // Get volume data
      const volumeData = await this.getEcosystemVolumeData(ecosystem, timeframe);
      
      if (!volumeData || volumeData.length === 0) {
        throw new Error(`No volume data available for ecosystem: ${ecosystem}`);
      }
      
      // Calculate start and end volumes (denormalized)
      const startVolume = volumeData[volumeData.length - 1];
      const endVolume = volumeData[0];
      
      // Calculate change
      const change = endVolume - startVolume;
      const percentChange = (change / startVolume) * 100;
      
      const result = {
        ecosystem,
        startVolume,
        endVolume,
        change,
        percentChange,
        timeframe
      };
      
      // Cache result
      this.cache.set(cacheKey, result);
      return result;
    } catch (error) {
      console.error(`Error getting ecosystem volume change for ${ecosystem}:`, error);
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

module.exports = { VolumeMetrics };