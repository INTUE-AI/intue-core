---
coverY: 0
---

# Getting Started

### System Requirements

* **Node.js**: v14.0.0 or higher
* **NPM**: v7.0.0 or higher
* **TypeScript**: Recommended for full type support

### Installation

INTUE can be installed directly via npm:

```bash
# Install the package
npm install @intue/core

# Create project directory (optional)
mkdir my-intue-project
cd my-intue-project
```

### Basic Usage

Create a new file (e.g., `index.ts` or `index.js`):\
&#x20;\
typescript

```typescript
import { Runtime, Agent } from '@intue/core';

async function main() {
  // Initialize the runtime
  const runtime = await Runtime.init({
    agentName: 'my-first-agent',
    options: {
      logger: {
        level: 'debug'
      }
    }
  });
  
  // Start the runtime
  await runtime.start();
  
  // Get the agent instance
  const agent = runtime.getAgent();
  
  // Analyze some market data
  const result = agent.analyzeMarketData({
    price: 45000,
    volume: 1250000
  });
  
  console.log('Analysis result:', result);
  
  // Stop the runtime
  await runtime.stop();
}

// Run the example
main().catch(console.error);
```

### Using Advanced Features

#### Sentiment Analysis

```typescript
import { SentimentAnalyzer, LunarCrushProvider } from '@intue/core';

// Initialize the LunarCrush provider
const provider = new LunarCrushProvider({
  apiKey: process.env.LUNARCRUSH_API_KEY
});

// Create a sentiment analyzer
const analyzer = new SentimentAnalyzer();
analyzer.addProvider(provider);

// Analyze sentiment for Bitcoin
const sentiment = await analyzer.analyzeSocialSentiment('BTC');
console.log('BTC Sentiment:', sentiment);
```

#### Ecosystem Correlation

```
import { EcosystemCorrelator } from '@intue/core';

// Create an ecosystem correlator
const correlator = new EcosystemCorrelator({
  timeframe: '1d',
  lookbackPeriod: 30
});

// Find correlations between assets
const correlation = await correlator.analyzeCorrelation(['BTC', 'ETH', 'SOL', 'AVAX']);
console.log('Correlations:', correlation);
```

