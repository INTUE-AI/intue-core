# INTUE Momentum Agent

A custom momentum trading agent for the INTUE framework.

## Overview

This agent implements momentum-based trading strategies, identifying assets with strong price movement and generating trading signals.

## Usage

```javascript
import { MomentumAgent } from '@intue/my-momentum-agent';

// Create and configure the agent
const momentumAgent = new MomentumAgent({
  sensitivity: 0.7,
  timeframes: ['1h', '4h', '1d']
});

// Process market data
const signals = await momentumAgent.process(marketData);
console.log('Momentum signals:', signals);

3. For src/index.js:
```bash
cat > src/index.js << 'EOL'
// Export the momentum agent
export * from './momentum-agent.js';
