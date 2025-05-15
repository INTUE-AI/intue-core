/**
 * Default configuration for INTUE core components
 */
const config = {
  cache: {
    defaultTTL: 5 * 60 * 1000, // 5 minutes
    checkInterval: 60 * 1000,  // Clean expired items every minute
    maxSize: 1000,             // Maximum number of items in cache
  },
  api: {
    baseRetryDelay: 1000,      // Base delay for exponential backoff
    maxRetries: 3,             // Maximum number of retry attempts
    timeout: 10000,            // Request timeout in milliseconds
  },
  ecosystems: {
    'ai-agents': ['FET', 'OCEAN', 'RNDR', 'GRT', 'AGIX'],
    'defai': ['LINK', 'GRT', 'FET', 'OCEAN', 'AAVE'],
    'solana': ['SOL', 'RAY', 'JTO', 'BONK', 'PYTH'],
    'ethereum': ['ETH', 'ARB', 'OP', 'RPL', 'LDO'],
    'bitcoin': ['BTC', 'STX', 'ORDI', 'SATS', 'RUNE']
  }
};

module.exports = config;