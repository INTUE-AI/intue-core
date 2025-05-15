# Developer Resources - Creating Custom Agents

## Creating Custom Agents

### Architecture Overview

Custom INTUE agents extend the base Agent interface, providing specialized market analysis capabilities while maintaining compatibility with the broader INTUE ecosystem.

```javascript
// Base Agent interface
interface Agent {
  // Core methods
  initialize(config: AgentConfig): Promise<void>;
  process(data: MarketData): Promise<SignalOutput>;
  getMetadata(): AgentMetadata;
  
  // Optional trading functionality
  initializeTrading?(options: TradingOptions): void;
  executeTrades?(options: TradeExecutionOptions): Promise<TradeResult[]>;
}
```

### Getting Started

#### Prerequisites

* Node.js 14.0+ and NPM 7.0+
* TypeScript 4.5+ (recommended)
* INTUE Core SDK (`@intue/core`)
* Exchange adapters for trading functionality

#### Basic Agent Structure

Create a new agent by extending the BaseAgent class:

```javascript
import { BaseAgent, AgentConfig, MarketData, SignalOutput } from '@intue/core';

export class CustomAgent extends BaseAgent {
  private sensitivity: number;
  private timeframes: string[];
  
  constructor(config: AgentConfig) {
    super(config);
    this.sensitivity = config.sensitivity || 0.5;
    this.timeframes = config.timeframes || ['1h', '4h', '1d'];
  }
  
  async initialize(config: AgentConfig): Promise<void> {
    // Load historical data, initialize models, etc.
    this.logger.info('Initializing custom agent');
    
    // Load required MCPs
    this.registerMCP('sentiment', new SentimentMCP(config.mcpOptions?.sentiment));
    this.registerMCP('volume', new VolumeMCP(config.mcpOptions?.volume));
    
    // Initialize internal state
    this.state = {
      lastUpdate: Date.now(),
      signalCache: new Map(),
      modelState: {}
    };
    
    this.logger.info('Custom agent initialized successfully');
  }
  
  async process(data: MarketData): Promise<SignalOutput> {
    this.logger.debug('Processing market data', { timeframe: data.timeframe });
    
    // Process market data using registered MCPs
    const sentimentSignals = await this.mcps.sentiment.process(data);
    const volumeSignals = await this.mcps.volume.process(data);
    
    // Combine signals based on agent logic
    const combinedSignals = this.combineSignals(sentimentSignals, volumeSignals);
    
    // Apply sensitivity filter
    const filteredSignals = this.filterByConfidence(combinedSignals, this.sensitivity);
    
    // Return processed signals
    return {
      timestamp: Date.now(),
      signals: filteredSignals,
      metadata: {
        processingTime: Date.now() - data.timestamp,
        signalCount: filteredSignals.length
      }
    };
  }
  
  private combineSignals(sentimentSignals, volumeSignals) {
    // Custom signal combination logic
    // ...
    return combinedSignals;
  }
  
  private filterByConfidence(signals, threshold) {
    return signals.filter(signal => signal.confidence >= threshold);
  }
  
  getMetadata(): AgentMetadata {
    return {
      name: 'Custom Agent',
      version: '1.0.0',
      capabilities: ['sentiment-analysis', 'volume-tracking'],
      author: 'Your Name',
      description: 'Custom agent for specialized market analysis',
      configuration: {
        sensitivity: this.sensitivity,
        timeframes: this.timeframes
      }
    };
  }
}
```

#### Adding Trading Functionality

Implement trading capabilities by adding the required methods:

```javascript
import { BaseAgent, AgentConfig, MarketData, SignalOutput } from '@intue/core';

export class CustomAgent extends BaseAgent {
  private sensitivity: number;
  private timeframes: string[];
  
  constructor(config: AgentConfig) {
    super(config);
    this.sensitivity = config.sensitivity || 0.5;
    this.timeframes = config.timeframes || ['1h', '4h', '1d'];
  }
  
  async initialize(config: AgentConfig): Promise<void> {
    // Load historical data, initialize models, etc.
    this.logger.info('Initializing custom agent');
    
    // Load required MCPs
    this.registerMCP('sentiment', new SentimentMCP(config.mcpOptions?.sentiment));
    this.registerMCP('volume', new VolumeMCP(config.mcpOptions?.volume));
    
    // Initialize internal state
    this.state = {
      lastUpdate: Date.now(),
      signalCache: new Map(),
      modelState: {}
    };
    
    this.logger.info('Custom agent initialized successfully');
  }
  
  async process(data: MarketData): Promise<SignalOutput> {
    this.logger.debug('Processing market data', { timeframe: data.timeframe });
    
    // Process market data using registered MCPs
    const sentimentSignals = await this.mcps.sentiment.process(data);
    const volumeSignals = await this.mcps.volume.process(data);
    
    // Combine signals based on agent logic
    const combinedSignals = this.combineSignals(sentimentSignals, volumeSignals);
    
    // Apply sensitivity filter
    const filteredSignals = this.filterByConfidence(combinedSignals, this.sensitivity);
    
    // Return processed signals
    return {
      timestamp: Date.now(),
      signals: filteredSignals,
      metadata: {
        processingTime: Date.now() - data.timestamp,
        signalCount: filteredSignals.length
      }
    };
  }
  
  private combineSignals(sentimentSignals, volumeSignals) {
    // Custom signal combination logic
    // ...
    return combinedSignals;
  }
  
  private filterByConfidence(signals, threshold) {
    return signals.filter(signal => signal.confidence >= threshold);
  }
  
  getMetadata(): AgentMetadata {
    return {
      name: 'Custom Agent',
      version: '1.0.0',
      capabilities: ['sentiment-analysis', 'volume-tracking'],
      author: 'Your Name',
      description: 'Custom agent for specialized market analysis',
      configuration: {
        sensitivity: this.sensitivity,
        timeframes: this.timeframes
      }
    };
  }
}
```

### Testing and Validation

#### Unit Testing

Create comprehensive unit tests for your agent:

```javascript
import { CustomAgent } from './custom-agent';
import { MockMCP } from '@intue/testing';

describe('CustomAgent', () => {
  let agent;
  let mockSentimentMCP;
  let mockVolumeMCP;
  
  beforeEach(() => {
    mockSentimentMCP = new MockMCP('sentiment');
    mockVolumeMCP = new MockMCP('volume');
    
    agent = new CustomAgent({
      sensitivity: 0.7,
      timeframes: ['1h', '4h']
    });
    
    // Mock the MCPs
    agent.registerMCP('sentiment', mockSentimentMCP);
    agent.registerMCP('volume', mockVolumeMCP);
  });
  
  test('initializes successfully', async () => {
    await agent.initialize({});
    expect(agent.getState().lastUpdate).toBeDefined();
  });
  
  test('processes market data correctly', async () => {
    // Set up mock MCP responses
    mockSentimentMCP.setResponse([{ asset: 'BTC', score: 0.8 }]);
    mockVolumeMCP.setResponse([{ asset: 'BTC', volumeIncrease: 0.5 }]);
    
    const result = await agent.process({
      timestamp: Date.now(),
      timeframe: '1h',
      data: { /* ... */ }
    });
    
    expect(result.signals).toHaveLength(1);
    expect(result.signals[0].asset).toBe('BTC');
    expect(result.signals[0].confidence).toBeGreaterThan(0.7);
  });
});
```

#### Backtesting

Validate your agent on historical data:

```javascript
import { backtestStrategy } from '@intue/backtest';
import { CustomAgent } from './custom-agent';

async function runBacktest() {
  const results = await backtestStrategy({
    agent: new CustomAgent({
      sensitivity: 0.7,
      timeframes: ['1h', '4h', '1d']
    }),
    assets: ['BTC', 'ETH', 'SOL'],
    initialCapital: 10000,
    startDate: '2023-01-01',
    endDate: '2023-06-01',
    riskPerTrade: 0.02
  });
  
  console.log('Backtest results:', results);
}

runBacktest();
```

### Deployment

#### Registering with INTUE Platform

To make your agent available on the INTUE platform:

1. Package your agent code according to platform standards:

```javascript
// package.json
{
  "name": "@yourname/custom-agent",
  "version": "1.0.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "files": ["dist", "README.md", "LICENSE"],
  "dependencies": {
    "@intue/core": "^1.0.0"
  },
  "peerDependencies": {
    "@intue/exchange-adapters": "^1.0.0"
  }
}
```

2. Create a manifest file describing your agent:

```json
{
  "name": "Custom Market Agent",
  "id": "custom-market-agent",
  "version": "1.0.0",
  "author": {
    "name": "Your Name",
    "email": "your.email@example.com",
    "url": "https://your-website.com"
  },
  "description": "A custom agent for specialized market analysis",
  "capabilities": ["sentiment-analysis", "volume-tracking"],
  "tradingCapable": true,
  "supportedExchanges": ["binance", "hyperliquid"],
  "parameters": [
    {
      "name": "sensitivity",
      "type": "float",
      "default": 0.7,
      "min": 0.1,
      "max": 1.0,
      "description
```

3. Submit for review through the INTUE Marketplace SDK:

```javascript
import { MarketplaceSDK } from '@intue/marketplace';

const marketplace = new MarketplaceSDK({
  apiKey: 'YOUR_API_KEY'
});

await marketplace.submitAgent({
  manifestPath: './agent-manifest.json',
  packagePath: './dist',
  documentation: './docs',
  samples: './examples'
});
```

#### Self-Hosting

For self-hosted deployments:

```javascript
import { AgentRuntime } from '@intue/runtime';
import { CustomAgent } from './custom-agent';
import { BinanceAdapter } from '@intue/exchange-adapters';

// Initialize exchange adapter
const binance = new BinanceAdapter({
  apiKey: process.env.BINANCE_API_KEY,
  secretKey: process.env.BINANCE_SECRET_KEY
});

// Initialize agent
const agent = new CustomAgent({
  sensitivity: 0.8,
  timeframes: ['1h', '4h', '1d']
});

// Initialize agent runtime
const runtime = new AgentRuntime({
  agent,
  dataProviders: {
    market: new MarketDataProvider(),
    sentiment: new SentimentDataProvider()
  }
});

// Initialize trading if needed
agent.initializeTrading({
  exchange: binance,
  riskManagement: {
    maxRiskPerTrade: 0.02,
    stopLossPercent: 0.05,
    takeProfitPercent: 0.1
  }
});

// Start the agent runtime
runtime.start({
  mode: 'continuous',
  interval: 60 * 60 * 1000,  // 1 hour
  execution: agent.tradingEnabled ? 'live' : 'simulation'
});
```

### Best Practices

1. **Modular Design**: Break complex logic into composable components
2. **Error Handling**: Implement robust error handling throughout
3. **Logging**: Use structured logging for easier debugging
4. **Performance Optimization**: Minimize computational overhead
5. **Testing**: Create comprehensive test coverage
6. **Documentation**: Document all public methods and parameters
7. **Versioning**: Follow semantic versioning for releases
