const axios = require('axios');
const { Cache } = require('@intue/core');
const LunarCrushAuth = require('./auth');
const mockData = require('./mock/data');
const helpers = require('./utils/helpers');

/**
 * LunarCrush API adapter for the INTUE ecosystem
 * Provides a consistent interface for accessing LunarCrush data
 */
class LunarCrushAdapter {
  /**
   * Create a new LunarCrush adapter
   * @param {Object} options - Configuration options
   * @param {string} options.apiKey - LunarCrush API key
   * @param {Object} [options.cache] - Optional cache instance
   * @param {number} [options.ttl] - Optional cache TTL in milliseconds
   */
  constructor(options = {}) {
    this.apiKey = options.apiKey;
    this.baseUrl = 'https://lunarcrush.com/api4';
    this.cache = options.cache || new Cache({ ttl: options.ttl });
    this.auth = new LunarCrushAuth(this.apiKey);
    
    if (!this.apiKey) {
      console.warn('LunarCrush API key not provided. Some endpoints may not work.');
    }
  }
  
  /**
   * Make a request to the LunarCrush API
   * @private
   * @param {string} endpoint - API endpoint
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} - API response
   */
  async _makeRequest(endpoint, params = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const cacheKey = `${endpoint}_${JSON.stringify(params)}`;
    
    // Check cache first
    const cachedData = this.cache.get(cacheKey);
    if (cachedData) return cachedData;
    
    // Check if we can access this endpoint with our API key
    const canAccess = await this.auth.canAccessEndpoint(endpoint);
    if (!canAccess) {
      return this._getFallbackData(endpoint, params);
    }
    
    try {
      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        },
        params
      });
      
      const data = response.data;
      this.cache.set(cacheKey, data);
      return data;
    } catch (error) {
      // Handle API limitations
      if (error.response && error.response.status === 402) {
        console.warn('LunarCrush API subscription required for this endpoint.');
        return this._getFallbackData(endpoint, params);
      }
      
      if (error.response && error.response.status === 429) {
        console.warn('LunarCrush API rate limit reached. Using cached or mock data.');
        return this._getFallbackData(endpoint, params);
      }
      
      throw error;
    }
  }
  
  /**
   * Get fallback data when API is unavailable
   * @private
   * @param {string} endpoint - API endpoint
   * @param {Object} params - Query parameters
   * @returns {Object} - Fallback data
   */
  async _getFallbackData(endpoint, params) {
    // Map paid endpoints to free endpoints where possible
    if (endpoint.includes('/coins/list/v2')) {
      try {
        return await this._makeRequest('/public/coins/list/v1', params);
      } catch (e) {
        // If that fails too, use mock data
      }
    }
    
    // For endpoints without free alternatives, use structured mock data
    return {
      data: this._getMockData(endpoint, params),
      meta: {
        using_mock_data: true,
        original_endpoint: endpoint
      }
    };
  }
  
  /**
   * Generate realistic mock data based on endpoint
   * @private
   * @param {string} endpoint - API endpoint
   * @param {Object} params - Query parameters
   * @returns {Array|Object} - Mock data
   */
  _getMockData(endpoint, params) {
    if (endpoint.includes('/coins/list')) {
      return mockData.getCoinsList(params.limit || 50);
    }
    
    if (endpoint.includes('/coins/')) {
      const coinSymbol = endpoint.split('/').slice(-2)[0];
      return mockData.getCoinData(coinSymbol);
    }
    
    if (endpoint.includes('/topic/')) {
      const topic = endpoint.split('/').slice(-2)[0];
      return mockData.getTopicData(topic);
    }
    
    return [];
  }
  
  /**
   * Get list of top coins
   * @param {number} [limit=50] - Number of coins to return
   * @returns {Promise<Array>} - List of coins
   */
  async getCoinsList(limit = 50) {
    const result = await this._makeRequest('/public/coins/list/v2', { limit });
    return result.data;
  }
  
  /**
   * Get detailed data for a specific coin
   * @param {string} coin - Coin symbol or name
   * @returns {Promise<Object>} - Coin data
   */
  async getCoinData(coin) {
    // Normalize coin name/symbol
    const normalizedCoin = helpers.normalizeCoinIdentifier(coin);
    const result = await this._makeRequest(`/public/coins/${normalizedCoin}/v1`);
    return result.data;
  }
  
  /**
   * Get sentiment for a specific topic
   * @param {string} topic - Topic to analyze
   * @param {number} [days=7] - Number of days to analyze
   * @returns {Promise<Object>} - Topic sentiment data
   */
  async getTopicSentiment(topic, days = 7) {
    // This endpoint should be available in free tier
    const result = await this._makeRequest(`/public/topic/${topic}/v1`);
    return result.data;
  }
  
  /**
   * Get historical time series data
   * @param {string} coin - Coin symbol or name
   * @param {string} [interval='1d'] - Time interval (1h, 1d, 7d, etc.)
   * @param {number} [limit=30] - Number of data points
   * @returns {Promise<Array>} - Time series data
   */
  async getTimeSeries(coin, interval = '1d', limit = 30) {
    const normalizedCoin = helpers.normalizeCoinIdentifier(coin);
    const result = await this._makeRequest(`/public/coins/${normalizedCoin}/time-series/v2`, {
      interval,
      limit
    });
    return result.data;
  }
  
  /**
   * Get coins in a specific ecosystem
   * @param {string} ecosystem - Ecosystem name
   * @param {number} [limit=15] - Number of coins to return
   * @returns {Promise<Array>} - List of coins in the ecosystem
   */
  async getEcosystemCoins(ecosystem, limit = 15) {
    // Map ecosystems to appropriate categories
    const categoryMap = {
      'ai-agents': 'ai',
      'defai': 'defi',
      'solana': 'solana',
      'ethereum': 'ethereum',
      'bitcoin': 'bitcoin'
    };
    
    const category = categoryMap[ecosystem] || ecosystem;
    
    // Try to get coins with category filter
    try {
      const allCoins = await this.getCoinsList(200);
      
      // Filter coins by category
      const filteredCoins = allCoins.filter(coin => {
        if (!coin.categories) return false;
        
        const categories = Array.isArray(coin.categories) 
          ? coin.categories 
          : String(coin.categories).split(',').map(c => c.trim());
        
        return categories.some(c => c.toLowerCase() === category.toLowerCase());
      }).slice(0, limit);
      
      return filteredCoins;
    } catch (error) {
      console.error('Error fetching ecosystem coins:', error);
      throw error;
    }
  }
  
  /**
   * Get social metrics for a specific coin
   * @param {string} coin - Coin symbol or name
   * @param {number} [days=7] - Number of days to analyze
   * @returns {Promise<Object>} - Social metrics
   */
  async getSocialMetrics(coin, days = 7) {
    try {
      // Use time-series endpoint to get social metrics over time
      const timeSeriesData = await this.getTimeSeries(coin, '1d', days);
      
      // Extract and process social metrics
      return {
        sentiment: this._calculateAverageSentiment(timeSeriesData),
        socialVolume: this._calculateTotalSocialVolume(timeSeriesData),
        engagement: this._calculateAverageEngagement(timeSeriesData),
        timeframe: `${days}d`,
        coin: coin
      };
    } catch (error) {
      console.error('Error fetching social metrics:', error);
      throw error;
    }
  }
  
  /**
   * Calculate average sentiment from time series data
   * @private
   * @param {Array} timeSeriesData - Time series data
   * @returns {number} - Average sentiment
   */
  _calculateAverageSentiment(timeSeriesData) {
    if (!timeSeriesData || timeSeriesData.length === 0) return 0;
    
    const sentiments = timeSeriesData.map(d => d.gs || 0); // Galaxy Score as sentiment
    const sum = sentiments.reduce((acc, val) => acc + val, 0);
    return sum / sentiments.length;
  }
  
  /**
   * Calculate total social volume from time series data
   * @private
   * @param {Array} timeSeriesData - Time series data
   * @returns {number} - Total social volume
   */
  _calculateTotalSocialVolume(timeSeriesData) {
    if (!timeSeriesData || timeSeriesData.length === 0) return 0;
    
    return timeSeriesData.reduce((acc, d) => acc + (d.sv || 0), 0);
  }
  
  /**
   * Calculate average engagement from time series data
   * @private
   * @param {Array} timeSeriesData - Time series data
   * @returns {number} - Average engagement
   */
  _calculateAverageEngagement(timeSeriesData) {
    if (!timeSeriesData || timeSeriesData.length === 0) return 0;
    
    const engagements = timeSeriesData.map(d => {
      const socialVolume = d.sv || 0;
      const socialContributors = d.sc || 1; // Avoid division by zero
      return socialVolume / socialContributors;
    });
    
    const sum = engagements.reduce((acc, val) => acc + val, 0);
    return sum / engagements.length;
  }
}

module.exports = LunarCrushAdapter;