# INTUE Cross-Ecosystem Correlation MCP

A sophisticated Model Context Protocol (MCP) for analyzing correlations between crypto ecosystems and asset categories.

## Overview

The Cross-Ecosystem Correlation MCP enables deep analysis of relationships between different crypto ecosystems, revealing insights into capital flows, sentiment contagion, and market interdependencies. This MCP powers data-driven investment strategies by identifying emerging patterns across ecosystem boundaries.

## Installation

```bash
npm install @intue/cross-ecosystem-correlation-mcp
Features

Multi-Ecosystem Analysis: Compare relationships between defined crypto ecosystems (DeFi, AI, Gaming, etc.)
Correlation Matrix: Generate complete correlation matrices across ecosystems and assets
Network Mapping: Visualize ecosystem relationships as directed network graphs
Flow Detection: Identify capital and sentiment flows between ecosystems
Leading Indicators: Discover which ecosystems lead or lag others
Correlation Breakdowns: Analyze by volume, price movement, social sentiment, and more
Temporal Analysis: Track how correlations evolve over different timeframes

Usage
Basic Ecosystem Correlation
javascriptconst { EcosystemCorrelator } = require('@intue/cross-ecosystem-correlation-mcp');
const LunarCrushAdapter = require('@intue/lunarcrush-adapter');

// Initialize with adapters
const lunarcrush = new LunarCrushAdapter({ apiKey: 'YOUR_API_KEY' });
const correlator = new EcosystemCorrelator({
  adapters: { lunarcrush }
});

// Analyze correlations between ecosystems
async function analyzeEcosystems() {
  const correlations = await correlator.analyzeEcosystemCorrelations([
    'ai-agents', 
    'defi', 
    'gaming'
  ], { 
    timeframe: '30d',
    metric: 'price'
  });
  
  console.log('Correlation matrix:', correlations.matrix);
  console.log('Strongest correlation:', correlations.strongestPair);
  console.log('Network graph data:', correlations.networkData);
}

analyzeEcosystems();
Leading/Lagging Analysis
javascript// Analyze which ecosystems lead or lag others
async function analyzeLeadLag() {
  const leadLag = await correlator.analyzeLeadLagRelationships([
    'ai-agents', 
    'defi', 
    'layer1'
  ], {
    timeframe: '90d',
    interval: '1d',
    metric: 'price'
  });
  
  console.log('Leading ecosystems:', leadLag.leaders);
  console.log('Lagging ecosystems:', leadLag.laggers);
  console.log('Lead/lag matrix (days):', leadLag.lagMatrix);
}

analyzeLeadLag();
Capital Flow Analysis
javascript// Analyze capital flows between ecosystems
async function analyzeCapitalFlows() {
  const flows = await correlator.analyzeCapitalFlows([
    'ai-agents', 
    'defi', 
    'gaming',
    'layer1'
  ], {
    timeframe: '14d',
    minFlowPercentage: 5 // Only show significant flows (>5%)
  });
  
  console.log('Flow matrix:', flows.flowMatrix);
  console.log('Net inflows by ecosystem:', flows.netInflows);
  console.log('Strongest flows:', flows.significantFlows);
}

analyzeCapitalFlows();
API Reference
EcosystemCorrelator Constructor

adapters: Object containing data adapters (lunarcrush, etc.)
cache: Optional cache instance
ttl: Cache TTL in milliseconds

Main Methods

analyzeEcosystemCorrelations(ecosystems, options): Generate correlation matrix
analyzeAssetCorrelations(assets, options): Generate asset-to-asset correlations
analyzeLeadLagRelationships(ecosystems, options): Find leading/lagging relationships
analyzeCapitalFlows(ecosystems, options): Track capital movement between ecosystems
generateCorrelationMatrix(data, options): Create correlation matrix from any dataset
generateNetworkGraph(correlationMatrix, options): Convert matrix to network graph

Options

timeframe: Time window for analysis ('1d', '7d', '30d', etc.)
interval: Data resolution ('1h', '1d', '1w')
metric: Metric to correlate ('price', 'volume', 'sentiment', 'combined')
minCorrelation: Minimum correlation strength to include (0-1)
lagMax: Maximum lead/lag days to check

Related Packages

@intue/core - Core utilities for the INTUE ecosystem
@intue/lunarcrush-adapter - LunarCrush API adapter
@intue/sentiment-analysis-mcp - Sentiment analysis MCP

License
MIT