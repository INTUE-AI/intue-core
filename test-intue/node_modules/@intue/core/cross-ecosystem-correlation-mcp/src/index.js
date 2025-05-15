const { Cache } = require('@intue/core');
const { EcosystemCorrelator } = require('./correlator/ecosystem-correlator');
const { generateCorrelationMatrix, generateNetworkGraph } = require('./utils/matrix');

/**
 * Main entry point for the Cross-Ecosystem Correlation Model Context Protocol (MCP)
 * Provides methods for analyzing relationships between crypto ecosystems
 */
class CrossEcosystemCorrelation {
  /**
   * Create a new Cross-Ecosystem Correlation analyzer
   * @param {Object} options - Configuration options
   * @param {Object} options.adapters - Data adapters
   * @param {Object} [options.weights] - Weights for different metrics
   * @param {Object} [options.cache] - Optional cache instance
   * @param {number} [options.ttl] - Cache TTL in milliseconds
   */
  constructor(options = {}) {
    this.adapters = options.adapters || {};
    
    // Set default weights if not provided
    this.weights = options.weights || {
      price: 0.5,
      volume: 0.3,
      sentiment: 0.2
    };
    
    // Normalize weights to sum to 1
    const weightSum = Object.values(this.weights).reduce((sum, w) => sum + w, 0);
    for (const [key, value] of Object.entries(this.weights)) {
      this.weights[key] = value / weightSum;
    }
    
    // Initialize cache
    this.cache = options.cache || new Cache({ ttl: options.ttl });
    
    // Initialize correlator
    this.correlator = new EcosystemCorrelator(this.adapters, this.cache);
  }
  
  /**
   * Analyze correlations between multiple ecosystems
   * @param {Array<string>} ecosystems - List of ecosystem names to analyze
   * @param {Object} [options] - Analysis options
   * @param {string} [options.timeframe='30d'] - Time window
   * @param {string} [options.metric='combined'] - Metric to correlate
   * @param {number} [options.minCorrelation=0.5] - Minimum correlation to include
   * @returns {Promise<Object>} - Correlation analysis results
   */
  async analyzeEcosystemCorrelations(ecosystems, options = {}) {
    return this.correlator.analyzeEcosystemCorrelations(ecosystems, options);
  }
  
  /**
   * Analyze correlations between multiple assets
   * @param {Array<string>} assets - List of asset symbols or names
   * @param {Object} [options] - Analysis options
   * @param {string} [options.timeframe='30d'] - Time window
   * @param {string} [options.metric='price'] - Metric to correlate
   * @param {number} [options.minCorrelation=0.5] - Minimum correlation to include
   * @returns {Promise<Object>} - Correlation analysis results
   */
  async analyzeAssetCorrelations(assets, options = {}) {
    return this.correlator.analyzeAssetCorrelations(assets, options);
  }
  
  /**
   * Analyze which ecosystems lead or lag others
   * @param {Array<string>} ecosystems - List of ecosystem names
   * @param {Object} [options] - Analysis options
   * @param {string} [options.timeframe='90d'] - Time window
   * @param {string} [options.interval='1d'] - Data interval
   * @param {string} [options.metric='price'] - Metric to analyze
   * @param {number} [options.lagMax=14] - Maximum lag days to check
   * @returns {Promise<Object>} - Lead/lag analysis results
   */
  async analyzeLeadLagRelationships(ecosystems, options = {}) {
    return this.correlator.analyzeLeadLagRelationships(ecosystems, options);
  }
  
  /**
   * Analyze capital flows between ecosystems
   * @param {Array<string>} ecosystems - List of ecosystem names
   * @param {Object} [options] - Analysis options
   * @param {string} [options.timeframe='14d'] - Time window
   * @param {number} [options.minFlowPercentage=5] - Minimum flow to include
   * @returns {Promise<Object>} - Capital flow analysis
   */
  async analyzeCapitalFlows(ecosystems, options = {}) {
    return this.correlator.analyzeCapitalFlows(ecosystems, options);
  }
  
  /**
   * Create a correlation matrix from any dataset
   * @param {Object} data - Data to correlate
   * @param {Object} [options] - Correlation options
   * @returns {Object} - Correlation matrix and related data
   */
  generateCorrelationMatrix(data, options = {}) {
    return generateCorrelationMatrix(data, options);
  }
  
  /**
   * Convert a correlation matrix to a network graph
   * @param {Array<Array<number>>} matrix - Correlation matrix
   * @param {Array<string>} labels - Node labels
   * @param {Object} [options] - Graph options
   * @returns {Object} - Network graph data
   */
  generateNetworkGraph(matrix, labels, options = {}) {
    return generateNetworkGraph(matrix, labels, options);
  }
}

module.exports = {
  CrossEcosystemCorrelation,
  EcosystemCorrelator
};