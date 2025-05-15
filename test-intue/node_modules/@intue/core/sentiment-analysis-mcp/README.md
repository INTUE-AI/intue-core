# INTUE Sentiment Analysis MCP

A sophisticated Model Context Protocol (MCP) for analyzing crypto asset sentiment across social, news, and market data sources.

## Overview

The Sentiment Analysis MCP integrates multiple data streams to provide a comprehensive view of sentiment across the crypto ecosystem. By processing social media signals, news coverage, and on-chain metrics, this MCP delivers deep insights into market sentiment at both asset-specific and ecosystem-wide levels.

## Installation

```bash
npm install @intue/sentiment-analysis-mcp
Features

Multi-Source Analysis: Combines data from social media, news outlets, and market behavior
Ecosystem Categorization: Maps sentiment across defined crypto ecosystems
Temporal Patterns: Detects sentiment shifts over time with configurable time windows
Sentiment Correlation: Identifies correlations between sentiment and price action
Anomaly Detection: Flags unusual sentiment patterns that may indicate market movements
Customizable Weights: Configure the importance of different sentiment signals

Usage
Basic Sentiment Analysis
javascriptconst { SentimentAnalyzer } = require('@intue/sentiment-analysis-mcp');
const LunarCrushAdapter = require('@intue/lunarcrush-adapter');

// Initialize with adapters
const lunarcrush = new LunarCrushAdapter({ apiKey: 'YOUR_API_KEY' });
const analyzer = new SentimentAnalyzer({
  adapters: { lunarcrush }
});

// Analyze a specific asset
async function analyzeBitcoin() {
  const btcSentiment = await analyzer.analyzeSentiment('bitcoin', { 
    timeframe: '7d',
    sources: ['social', 'news']
  });
  
  console.log('Bitcoin sentiment score:', btcSentiment.score);
  console.log('Sentiment breakdown:', btcSentiment.breakdown);
  console.log('Sentiment trend:', btcSentiment.trend);
}

analyzeBitcoin();
Ecosystem Sentiment Analysis
javascript// Analyze sentiment across an ecosystem
async function analyzeAIEcosystem() {
  const aiEcosystemSentiment = await analyzer.analyzeEcosystemSentiment('ai-agents', {
    timeframe: '30d',
    limit: 10 // Top 10 assets in ecosystem
  });
  
  console.log('AI Ecosystem Sentiment:', aiEcosystemSentiment.score);
  console.log('Leading assets by sentiment:', aiEcosystemSentiment.topAssets);
  console.log('Sentiment trend:', aiEcosystemSentiment.trend);
}

analyzeAIEcosystem();
Sentiment vs. Price Correlation
javascript// Analyze correlation between sentiment and price
async function analyzeCorrelation() {
  const correlation = await analyzer.analyzeSentimentPriceCorrelation('ethereum', {
    timeframe: '90d',
    interval: '1d'
  });
  
  console.log('Sentiment-price correlation:', correlation.coefficient);
  console.log('Lag effect (days):', correlation.lag);
  console.log('Significance:', correlation.significance);
}

analyzeCorrelation();
Configuration Options
SentimentAnalyzer Constructor

adapters: Object containing data adapters
weights: Custom weights for different sentiment sources
cache: Optional cache instance
ttl: Cache TTL in milliseconds

Analysis Methods Options

timeframe: Time window for analysis ('1d', '7d', '30d', etc.)
sources: Data sources to include ('social', 'news', 'market')
interval: Data resolution ('1h', '1d', '1w')
limit: Number of assets to include in ecosystem analysis

Related Packages

@intue/core - Core utilities for the INTUE ecosystem
@intue/lunarcrush-adapter - LunarCrush API adapter

License
MIT