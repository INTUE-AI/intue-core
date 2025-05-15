# INTUE LunarCrush Adapter

A comprehensive adapter for the LunarCrush API, providing seamless integration with the INTUE ecosystem.

## Overview

The LunarCrush Adapter allows INTUE's Model Context Protocols (MCPs) to leverage LunarCrush's powerful crypto social intelligence. This adapter handles authentication, data fetching, caching, and error handling, providing a consistent interface for all LunarCrush API endpoints.

## Installation

```bash
npm install @intue/lunarcrush-adapter
Features

Complete API Coverage: Access to all LunarCrush endpoints
Authentication Management: Smart handling of API keys and rate limits
Intelligent Caching: Optimized data caching to minimize API calls
Error Handling: Robust error handling with fallback strategies
Mock Data: Development-friendly mock data for testing
Category Mapping: Intelligent ecosystem categorization

Usage
Basic Usage
javascriptconst { LunarCrushAdapter } = require('@intue/lunarcrush-adapter');

// Initialize with your API key
const lunarcrush = new LunarCrushAdapter({
  apiKey: 'YOUR_LUNARCRUSH_API_KEY'
});

// Get coin data
async function getCoinData() {
  const bitcoinData = await lunarcrush.getCoinData('bitcoin');
  console.log('Bitcoin data:', bitcoinData);
}

getCoinData();
Fetching Sentiment Data
javascript// Get social metrics for Bitcoin
const metrics = await lunarcrush.getSocialMetrics('bitcoin', 7); // 7 days

console.log('Sentiment score:', metrics.sentiment);
console.log('Social volume:', metrics.socialVolume);
console.log('Engagement:', metrics.engagement);
Working with Ecosystems
javascript// Get top coins in the AI ecosystem
const aiCoins = await lunarcrush.getEcosystemCoins('ai-agents', 10);
console.log('Top AI tokens:', aiCoins);
API Reference
Constructor Options

apiKey: Your LunarCrush API key
cache: Optional custom cache instance (defaults to internal cache)
ttl: Optional cache TTL in milliseconds (defaults to 5 minutes)

Methods

getCoinsList(limit): Get list of top coins
getCoinData(coin): Get detailed data for a specific coin
getTimeSeries(coin, interval, limit): Get historical data
getTopicSentiment(topic, days): Get sentiment for a specific topic
getEcosystemCoins(ecosystem, limit): Get coins in a specific ecosystem
getSocialMetrics(coin, days): Get comprehensive social metrics

Related Packages

@intue/core - Core utilities for the INTUE ecosystem
@intue/sentiment-analysis-mcp - Sentiment analysis MCP

License
MIT