
![Screenshot 2025-05-14 at 5 43 58 PM](https://github.com/user-attachments/assets/9d780993-83c5-4735-9e4a-1af007a8bc0a)

# INTUE Core

Core utilities and shared components for the INTUE ecosystem - the intelligence layer for AI agents.

## Overview

INTUE is the intelligence layer for autonomous trading agents, a comprehensive framework designed for quantitative analysis of cryptocurrency markets using advanced AI protocols and agent-based architecture.
Our platform enables sophisticated signal detection, cross-ecosystem correlation analysis, and autonomous trade execution with unprecedented precision. By leveraging specialized Model Context Protocols (MCPs), INTUE bridges the gap between raw market data and actionable trading intelligence.

## Installation

Getting Started
System Requirements
Node.js: v14.0.0 or higher

NPM: v7.0.0 or higher

TypeScript: Recommended for full type support

Installation
INTUE can be installed directly via npm:

Copy
# Install the package
npm install @intue/core

# Create project directory (optional)
mkdir my-intue-project
cd my-intue-project
Basic Usage
Create a new file (e.g., index.ts or index.js):
 
typescript

Copy
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
Using Advanced Features
Sentiment Analysis
Copy
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
Ecosystem Correlation
Copy
import { EcosystemCorrelator } from '@intue/core';

// Create an ecosystem correlator
const correlator = new EcosystemCorrelator({
  timeframe: '1d',
  lookbackPeriod: 30
});

// Find correlations between assets
