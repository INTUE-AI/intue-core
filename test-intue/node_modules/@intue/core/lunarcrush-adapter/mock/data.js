/**
 * Mock data for LunarCrush API responses
 * Used when API is unavailable or during development
 */

/**
 * Generate mock coin data
 * @param {string} symbol - Coin symbol
 * @param {Object} overrides - Override default values
 * @returns {Object} - Mock coin data
 */
function generateCoinData(symbol, overrides = {}) {
  const defaultData = {
    s: symbol.toUpperCase(),
    n: getMockName(symbol),
    p: Math.random() * 50000, // price
    v: Math.random() * 1e10, // volume
    mc: Math.random() * 1e12, // market cap
    gs: 30 + Math.random() * 70, // galaxy score (sentiment)
    ss: 30 + Math.random() * 70, // social score
    sv: Math.random() * 1e6, // social volume
    sc: Math.random() * 10000, // social contributors
    categories: getRandomCategories(),
    rank: Math.floor(Math.random() * 100) + 1
  };
  
  return { ...defaultData, ...overrides };
}

/**
 * Get mock coin name from symbol
 * @param {string} symbol - Coin symbol
 * @returns {string} - Mock coin name
 */
function getMockName(symbol) {
  const knownCoins = {
    'BTC': 'Bitcoin',
    'ETH': 'Ethereum',
    'SOL': 'Solana',
    'FET': 'Fetch.ai',
    'OCEAN': 'Ocean Protocol',
    'RNDR': 'Render Token',
    'GRT': 'The Graph',
    'AGIX': 'SingularityNET',
    'LINK': 'Chainlink',
    'AAVE': 'Aave',
    'RAY': 'Raydium',
    'JTO': 'Jito',
    'BONK': 'Bonk',
    'PYTH': 'Pyth Network'
  };
  
  return knownCoins[symbol.toUpperCase()] || `${symbol.charAt(0).toUpperCase()}${symbol.slice(1).toLowerCase()} Coin`;
}

/**
 * Get random categories for mock data
 * @returns {Array} - Random categories
 */
function getRandomCategories() {
  const allCategories = ['defi', 'ai', 'layer-1', 'privacy', 'stablecoin', 'gaming', 'meme', 'ethereum', 'bitcoin', 'solana'];
  const numCategories = 1 + Math.floor(Math.random() * 3); // 1-3 categories
  const categories = [];
  
  for (let i = 0; i < numCategories; i++) {
    const randomIndex = Math.floor(Math.random() * allCategories.length);
    const category = allCategories.splice(randomIndex, 1)[0];
    categories.push(category);
  }
  
  return categories;
}

/**
 * Generate mock time series data
 * @param {string} symbol - Coin symbol
 * @param {number} days - Number of days
 * @returns {Array} - Mock time series data
 */
function generateTimeSeriesData(symbol, days) {
  const now = new Date();
  const result = [];
  
  // Base values for this coin
  const basePrice = (symbol === 'BTC') ? 40000 : (symbol === 'ETH') ? 2500 : Math.random() * 100;
  const baseSentiment = 40 + Math.random() * 30;
  const baseSocialVolume = 10000 + Math.random() * 90000;
  
  // Generate data for each day
  for (let i = 0; i < days; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    // Add some variance each day
    const priceVariance = 0.95 + (Math.random() * 0.1); // +/- 5%
    const sentimentVariance = 0.9 + (Math.random() * 0.2); // +/- 10%
    const volumeVariance = 0.8 + (Math.random() * 0.4); // +/- 20%
    
    result.push({
      t: date.getTime(), // timestamp
      s: symbol.toUpperCase(),
      p: basePrice * Math.pow(priceVariance, i), // price with trend
      gs: baseSentiment * Math.pow(sentimentVariance, i), // galaxy score
      ss: (baseSentiment - 5 + Math.random() * 10) * Math.pow(sentimentVariance, i), // social score
      sv: baseSocialVolume * Math.pow(volumeVariance, i), // social volume
      sc: Math.floor(baseSocialVolume / 100 * Math.pow(volumeVariance, i)), // social contributors
    });
  }
  
  return result;
}

// Predefined mock data
const mockCoins = {
  bitcoin: generateCoinData('BTC', { 
    n: 'Bitcoin', 
    p: 65000, 
    mc: 1.28e12, 
    gs: 75, 
    ss: 78, 
    sv: 950000,
    rank: 1,
    categories: ['bitcoin', 'layer-1']
  }),
  ethereum: generateCoinData('ETH', { 
    n: 'Ethereum', 
    p: 3500, 
    mc: 4.2e11, 
    gs: 72, 
    ss: 75, 
    sv: 750000,
    rank: 2,
    categories: ['ethereum', 'layer-1', 'defi']
  }),
  solana: generateCoinData('SOL', { 
    n: 'Solana', 
    p: 150, 
    mc: 6.5e10, 
    gs: 82, 
    ss: 80, 
    sv: 680000,
    rank: 5,
    categories: ['solana', 'layer-1']
  }),
  fetchai: generateCoinData('FET', { 
    n: 'Fetch.ai', 
    p: 2.1, 
    mc: 1.8e9, 
    gs: 88, 
    ss: 85, 
    sv: 320000,
    rank: 48,
    categories: ['ai', 'defi']
  }),
  ocean: generateCoinData('OCEAN', { 
    n: 'Ocean Protocol', 
    p: 0.8, 
    mc: 5.5e8, 
    gs: 79, 
    ss: 76, 
    sv: 180000,
    rank: 102,
    categories: ['ai', 'data']
  }),
  render: generateCoinData('RNDR', { 
    n: 'Render Token', 
    p: 7.2, 
    mc: 2.7e9, 
    gs: 77, 
    ss: 74, 
    sv: 210000,
    rank: 42,
    categories: ['ai', 'computing']
  })
};

// Ecosystem categorizations
const ecosystems = {
  'ai-agents': ['FET', 'OCEAN', 'RNDR', 'GRT', 'AGIX'],
  'defai': ['LINK', 'GRT', 'FET', 'OCEAN', 'AAVE'],
  'solana': ['SOL', 'RAY', 'JTO', 'BONK', 'PYTH']
};

// Public API methods for mock data
module.exports = {
  /**
   * Get mock list of coins
   * @param {number} limit - Maximum number of coins
   * @returns {Array} - Mock coin list
   */
  getCoinsList(limit = 50) {
    const result = [
      mockCoins.bitcoin,
      mockCoins.ethereum,
      mockCoins.solana,
      mockCoins.fetchai,
      mockCoins.ocean,
      mockCoins.render
    ];
    
    // Generate additional random coins if needed
    if (limit > result.length) {
      const symbols = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      for (let i = result.length; i < limit; i++) {
        const symbol = symbols[Math.floor(Math.random() * symbols.length)] + 
                      symbols[Math.floor(Math.random() * symbols.length)] + 
                      symbols[Math.floor(Math.random() * symbols.length)];
        result.push(generateCoinData(symbol, { rank: i + 1 }));
      }
    }
    
    return result.slice(0, limit);
  },
  
  /**
   * Get mock data for a specific coin
   * @param {string} coin - Coin symbol or name
   * @returns {Object} - Mock coin data
   */
  getCoinData(coin) {
    const normalizedCoin = coin.toLowerCase();
    
    // Check if we have predefined mock data
    if (mockCoins[normalizedCoin]) {
      return mockCoins[normalizedCoin];
    }
    
    // Handle by symbol
    for (const [_, coinData] of Object.entries(mockCoins)) {
      if (coinData.s.toLowerCase() === normalizedCoin) {
        return coinData;
      }
    }
    
    // Generate mock data for unknown coin
    return generateCoinData(normalizedCoin);
  },
  
  /**
   * Get mock time series data
   * @param {string} coin - Coin symbol
   * @param {number} days - Number of days
   * @returns {Array} - Mock time series data
   */
  getTimeSeriesData(coin, days = 7) {
    const symbol = typeof coin === 'string' ? coin : coin.s;
    return generateTimeSeriesData(symbol, days);
  },
  
  /**
   * Get mock topic data
   * @param {string} topic - Topic name
   * @returns {Object} - Mock topic data
   */
  getTopicData(topic) {
    return {
      topic: topic,
      sentiment: 30 + Math.random() * 70,
      volume: Math.floor(10000 + Math.random() * 90000),
      momentum: Math.random() > 0.5 ? 'rising' : 'falling',
      related_coins: this.getCoinsList(3)
    };
  },
  
  /**
   * Get coins for a specific ecosystem
   * @param {string} ecosystem - Ecosystem name
   * @param {number} limit - Maximum number of coins
   * @returns {Array} - Coins in the ecosystem
   */
  getEcosystemCoins(ecosystem, limit = 5) {
    if (ecosystems[ecosystem]) {
      return ecosystems[ecosystem]
        .slice(0, limit)
        .map(symbol => this.getCoinData(symbol));
    }
    
    // Generate random ecosystem
    return this.getCoinsList(limit);
  }
};