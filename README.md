
![Screenshot 2025-05-14 at 5 43 58 PM](https://github.com/user-attachments/assets/9d780993-83c5-4735-9e4a-1af007a8bc0a)

# INTUE Core

Core utilities and shared components for the INTUE ecosystem - the intelligence layer for AI agents.

## Overview

INTUE is the intelligence layer for autonomous trading agents, a comprehensive framework designed for quantitative analysis of cryptocurrency markets using advanced AI protocols and agent-based architecture.
Our platform enables sophisticated signal detection, cross-ecosystem correlation analysis, and autonomous trade execution with unprecedented precision. By leveraging specialized Model Context Protocols (MCPs), INTUE bridges the gap between raw market data and actionable trading intelligence.

## Installation

```bash
npm install @intue/core
Features

Caching System: Efficient in-memory caching with configurable TTL
Type Definitions: Consistent types across the INTUE ecosystem
Configuration Management: Centralized configuration utilities
Common Interfaces: Standardized interfaces for all MCPs
Sentiment Analysis: Advanced crypto sentiment analysis tools
Ecosystem Correlation: Cross-ecosystem pattern detection
LunarCrush Integration: Social sentiment data adapter

Usage
Core Functionality
javascriptconst intue = require('@intue/core');

// Create a trading agent
const agent = intue.createAgent({
  type: 'momentum',
  threshold: 0.75
});

// Analyze market data
const signal = intue.analyzeMarketData({
  price: 45000,
  volume: 1250000
});

console.log('Agent:', agent);
console.log('Signal:', signal);
Accessing Sub-modules
javascriptconst intue = require('@intue/core');

// Use sentiment analysis functionality
const sentiment = intue.sentimentAnalysis;

// Use ecosystem correlation functionality
const correlator = intue.ecosystemCorrelator;

// Use LunarCrush adapter
const lunarcrush = intue.lunarcrushAdapter;
Documentation
For complete documentation, visit our GitBook.
Related Packages

@intue/lunarcrush-adapter - LunarCrush API adapter for social sentiment data
@intue/sentiment-analysis-mcp - Sentiment analysis for crypto assets
@intue/cross-ecosystem-correlation-mcp - Cross-ecosystem correlation analysis

About INTUE
INTUE derives from the Latin word intueri — to look at attentively, to gaze upon with purpose. This embodies our mission: creating an intelligence layer that sees deeply into the patterns and relationships across digital asset ecosystems. Just as human intuition arises from subconscious pattern recognition, INTUE transforms raw data into actionable insight, revealing the hidden correlations that drive markets.
The digital asset landscape pulses with millions of interconnected signals — price movements, social sentiment, developer activity, on-chain metrics — each telling a fragment of a larger story. INTUE provides a modular framework to parse this complexity, turning overwhelming data streams into coherent narratives through our specialized MCPs (Modular Crypto Protocols).
Contributing
Contributions are welcome! Please feel free to submit a Pull Request.
License
This project is licensed under the MIT License - see the LICENSE file for details.
