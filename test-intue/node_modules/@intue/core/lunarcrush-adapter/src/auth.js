const axios = require('axios');

/**
 * Handles LunarCrush authentication and API tier detection
 */
class LunarCrushAuth {
  /**
   * Create a new authentication handler
   * @param {string} apiKey - LunarCrush API key
   */
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.apiTier = null;
    this.lastTierCheck = null;
    this.tierCheckInterval = 24 * 60 * 60 * 1000; // 24 hours
    
    this.endpoints = {
      free: [
        '/public/topic/:topic/v1',
        '/public/coins/list/v1',
        '/public/categories/list/v1'
      ],
      paid: [
        '/public/coins/list/v2',
        '/public/coins/:coin/time-series/v2'
      ]
    };
  }
  
  /**
   * Detect the API tier based on access to paid endpoints
   * @returns {Promise<string>} - API tier (paid, free, invalid, unknown)
   */
  async detectApiTier() {
    // Only check once per day
    const now = Date.now();
    if (this.apiTier && this.lastTierCheck && (now - this.lastTierCheck < this.tierCheckInterval)) {
      return this.apiTier;
    }
    
    if (!this.apiKey) {
      this.apiTier = 'invalid';
      return this.apiTier;
    }
    
    // Try a paid endpoint to see if the API key has access
    try {
      const response = await axios.get('https://lunarcrush.com/api4/public/coins/list/v2', {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        },
        params: { limit: 1 }
      });
      
      if (response.status === 200) {
        this.apiTier = 'paid';
      } else {
        this.apiTier = 'unknown';
      }
    } catch (error) {
      if (error.response) {
        if (error.response.status === 402) {
          this.apiTier = 'free';
        } else if (error.response.status === 401) {
          this.apiTier = 'invalid';
        } else {
          this.apiTier = 'unknown';
        }
      } else {
        this.apiTier = 'unknown';
      }
    }
    
    this.lastTierCheck = now;
    return this.apiTier;
  }
  
  /**
   * Check if the API key can access a specific endpoint
   * @param {string} endpoint - API endpoint
   * @returns {Promise<boolean>} - Whether the endpoint can be accessed
   */
  async canAccessEndpoint(endpoint) {
    if (!this.apiTier) {
      await this.detectApiTier();
    }
    
    if (this.apiTier === 'paid') {
      return true; // Paid tier can access all endpoints
    }
    
    if (this.apiTier === 'invalid' || this.apiTier === 'unknown') {
      return false; // Invalid or unknown tier can't access any endpoints
    }
    
    // Check if the endpoint is available in free tier
    return this.endpoints.free.some(freeEndpoint => {
      // Convert path params to regex pattern
      const pattern = freeEndpoint.replace(/:[^\/]+/g, '[^\/]+');
      const regex = new RegExp(`^${pattern}$`);
      return regex.test(endpoint);
    });
  }
}

module.exports = LunarCrushAuth;