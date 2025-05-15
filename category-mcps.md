# Category MCPs

## Category MCPs

### Overview

Category Model Context Protocols (MCPs) specialize in analyzing specific token categories and ecosystems, applying specialized metrics relevant to each sector's unique characteristics and value drivers.

### Available Category Protocols

#### AI Tokens MCP

Tracks and analyzes AI-focused tokens with specialized attention to adoption metrics:

```javascript
const aiTokensMCP = new AITokensMCP({
  assets: ['FET', 'OCEAN', 'GRT', 'RNDR', 'INJ'],
  metrics: ['utilization', 'node-growth', 'developer-activity'],
  timeframe: '30d'
});

const aiAnalysis = await aiTokensMCP.process();
// Returns: AI-specific metrics and insights
```

Key capabilities:

* AI adoption tracking
* Token utility metrics
* Network growth analysis
* AI sector rotation patterns

#### DeFi Protocol MCP

Focuses on decentralized finance protocols with emphasis on financial metrics:

```javascript
const defiMCP = new DeFiProtocolMCP({
  protocols: ['uniswap', 'aave', 'curve', 'compound'],
  includeTokens: true,
  metrics: ['tvl', 'volume', 'fees', 'yields'],
  chainScope: ['ethereum', 'arbitrum', 'optimism']
});

const defiMetrics = await defiMCP.process();
// Returns: DeFi-specific performance metrics
```

Key capabilities:

* Total Value Locked (TVL) tracking
* Yield comparison and trends
* Protocol revenue analysis
* Cross-chain DeFi activity monitoring

#### Layer-1 MCP

Monitors major blockchains and their native tokens with focus on network metrics:

```javascript
const layer1MCP = new Layer1MCP({
  networks: ['ethereum', 'solana', 'avalanche', 'near'],
  metrics: ['tps', 'active-addresses', 'new-contracts', 'fee-revenue'],
  includeBridgeActivity: true
});

const networkMetrics = await layer1MCP.process();
// Returns: Layer-1 specific performance metrics
```

Key capabilities:

* Network performance tracking
* Validator economics analysis
* Cross-chain activity monitoring
* Network security assessment

#### MEV Protocol MCP

Specializes in Maximal Extractable Value analysis for relevant protocols:

```javascript
const mevMCP = new MEVProtocolMCP({
  networks: ['ethereum', 'arbitrum', 'optimism'],
  categories: ['frontrunning', 'backrunning', 'sandwich'],
  timeframe: '7d',
  minimalValue: 0.5  // ETH
});

const mevActivity = await mevMCP.process();
// Returns: MEV activity metrics and patterns
```

Key capabilities:

* MEV strategy classification
* Value extraction quantification
* MEV protection effectiveness
* Flashbots integration analysis

#### Gaming & Metaverse MCP

Analyzes gaming and metaverse tokens with specialized metrics:

```javascript
const gamingMCP = new GamingMetaverseMCP({
  projects: ['axie', 'sandbox', 'decentraland', 'illuvium'],
  metrics: ['users', 'transactions', 'nft-volume', 'retention'],
  includeSocialMetrics: true
});

const gamingMetrics = await gamingMCP.process();
// Returns: Gaming ecosystem metrics
```

Key capabilities:

* User acquisition and retention tracking
* NFT market analysis
* In-game economy monitoring
* Platform engagement metrics

#### Additional Category MCPs

* **Governance Token MCP**: Specializes in DAO and governance token analytics
* **Privacy Coin MCP**: Focuses on privacy-focused cryptocurrencies
* **Infrastructure MCP**: Analyzes blockchain infrastructure providers
* **Exchange Token MCP**: Specializes in exchange-native token analysis
* **RWA (Real World Asset) MCP**: Tracks tokenized real-world assets

### Integration Example

```javascript
// Multi-category analysis
const crossCategoryMCP = new CrossCategoryMCP({
  categories: [
    new AITokensMCP({ /* config */ }),
    new DeFiProtocolMCP({ /* config */ }),
    new GamingMetaverseMCP({ /* config */ })
  ],
  correlationAnalysis: true,
  rotationDetection: true
});

const categoryInsights = await crossCategoryMCP.process();
// Returns: Cross-category analysis with rotation and correlation metrics
```

This compositional approach enables comprehensive ecosystem analysis through the combination of specialized category protocols.
