# Creating Custom MCPs

## Creating Custom MCPs

### Protocol Design Principles

Model Context Protocols (MCPs) are specialized data processing components that transform raw market data into contextually relevant signals. When designing custom MCPs, adhere to these core principles:

1. **Single Responsibility**: Each MCP should have a focused purpose
2. **Composability**: Design for integration with other protocols
3. **Standardized Interfaces**: Follow consistent input/output patterns
4. **Performance Optimization**: Minimize computational overhead
5. **Error Resilience**: Gracefully handle missing or invalid data

### MCP Framework Architecture

All MCPs extend the base `ModelContextProtocol` interface:

```typescript
interface ModelContextProtocol {
  // Core functionality
  process(data: RawData): Promise<Signal[]>;
  configure(options: ConfigOptions): void;
  getMetadata(): ProtocolMetadata;
  
  // State management
  getState(): ProtocolState;
  setState(state: ProtocolState): void;
  
  // Performance tracking
  getPerformanceMetrics(): PerformanceMetrics;
}
```

### Creating a Custom MCP

#### Basic Structure

Start by extending the `BaseMCP` class provided by the INTUE SDK:

```typescript
import { BaseMCP, ConfigOptions, RawData, Signal } from '@intue/core';

export class CustomMetricMCP extends BaseMCP {
  private sensitivity: number;
  private lookbackPeriod: number;
  private processingMethod: string;
  
  constructor(config: ConfigOptions = {}) {
    super('custom-metric');
    this.configure(config);
  }
  
  configure(options: ConfigOptions): void {
    this.sensitivity = options.sensitivity || 0.5;
    this.lookbackPeriod = options.lookbackPeriod || 30;
    this.processingMethod = options.processingMethod || 'default';
    
    this.logger.info('CustomMetricMCP configured', {
      sensitivity: this.sensitivity,
      lookbackPeriod: this.lookbackPeriod,
      processingMethod: this.processingMethod
    });
  }
  
  async process(data: RawData): Promise<Signal[]> {
    this.logger.debug('Processing data in CustomMetricMCP');
    
    // Validate input data
    if (!this._validateInput(data)) {
      throw new Error('Invalid input data format');
    }
    
    // Process data using selected method
    let processedSignals;
    switch (this.processingMethod) {
      case 'advanced':
        processedSignals = this._advancedProcessing(data);
        break;
      case 'experimental':
        processedSignals = this._experimentalProcessing(data);
        break;
      case 'default':
      default:
        processedSignals = this._defaultProcessing(data);
    }
    
    // Apply sensitivity filter
    const filteredSignals = this._applySensitivityFilter(processedSignals);
    
    // Update performance metrics
    this._updatePerformanceMetrics({
      processingTime: Date.now() - this.processingStartTime,
      signalCount: filteredSignals.length,
      dataPoints: data.length
    });
    
    return filteredSignals;
  }
  
  getMetadata(): ProtocolMetadata {
    return {
      name: 'Custom Metric MCP',
      version: '1.0.0',
      description: 'A custom metric processing protocol',
      author: 'Your Name',
      category: 'metric',
      parameters: {
        sensitivity: {
          description: 'Signal sensitivity threshold',
          type: 'number',
          range: [0, 1]
        },
        lookbackPeriod: {
          description: 'Historical data lookback period',
          type: 'number',
          range: [1, 365]
        },
        processingMethod: {
          description: 'Algorithm selection for processing',
          type: 'string',
          options: ['default', 'advanced', 'experimental']
        }
      }
    };
  }
  
  private _validateInput(data: RawData): boolean {
    // Input validation logic
    return true;
  }
  
  private _defaultProcessing(data: RawData): Signal[] {
    // Default processing implementation
    return [];
  }
  
  private _advancedProcessing(data: RawData): Signal[] {
    // Advanced processing implementation
    return [];
  }
  
  private _experimentalProcessing(data: RawData): Signal[] {
    // Experimental processing implementation
    return [];
  }
  
  private _applySensitivityFilter(signals: Signal[]): Signal[] {
    // Apply sensitivity threshold filtering
    return signals.filter(signal => signal.strength >= this.sensitivity);
  }
  
  private _updatePerformanceMetrics(metrics: any): void {
    // Update internal performance tracking
    this.performanceMetrics = {
      ...this.performanceMetrics,
      lastProcessingTime: metrics.processingTime,
      averageProcessingTime: (this.performanceMetrics.averageProcessingTime * this.performanceMetrics.processCount + metrics.processingTime) / (this.performanceMetrics.processCount + 1),
      processCount: this.performanceMetrics.processCount + 1,
      lastSignalCount: metrics.signalCount,
      totalSignalsGenerated: this.performanceMetrics.totalSignalsGenerated + metrics.signalCount
    };
  }
}
```

#### Specialized MCP Types

Depending on your needs, you might extend one of the specialized MCP base classes:

**Category MCP**

```typescript
import { CategoryMCP, CategoryData } from '@intue/core';

export class CustomCategoryMCP extends CategoryMCP {
  constructor(config) {
    super('defi-protocol', config);
  }
  
  async processCategory(data: CategoryData): Promise<Signal[]> {
    // Category-specific processing
    // ...
  }
}
```

**Correlation MCP**

```typescript
import { CorrelationMCP, CorrelationData } from '@intue/core';

export class CustomCorrelationMCP extends CorrelationMCP {
  constructor(config) {
    super('volume-sentiment', config);
  }
  
  async calculateCorrelation(data: CorrelationData): Promise<Signal[]> {
    // Correlation calculation
    // ...
  }
}
```

**Analysis MCP**

```typescript
import { AnalysisMCP, AnalysisData } from '@intue/core';

export class CustomAnalysisMCP extends AnalysisMCP {
  constructor(config) {
    super('pattern-recognition', config);
  }
  
  async analyzeData(data: AnalysisData): Promise<Signal[]> {
    // Advanced analysis implementation
    // ...
  }
}
```

### Data Processing Techniques

#### Time Series Analysis

```typescript
import { TimeSeries } from '@intue/analysis';

function analyzeTimeSeries(data: number[]): TimeSeriesAnalysis {
  const timeSeries = new TimeSeries(data);
  
  // Calculate moving averages
  const sma20 = timeSeries.sma(20);
  const ema50 = timeSeries.ema(50);
  
  // Calculate momentum indicators
  const rsi = timeSeries.rsi(14);
  const macd = timeSeries.macd({
    short: 12,
    long: 26,
    signal: 9
  });
  
  // Detect trends
  const adx = timeSeries.adx(14);
  const trendStrength = adx.map(value => value > 25 ? 'strong' : 'weak');
  
  // Detect crossovers
  const crossovers = timeSeries.detectCrossovers({
    fast: sma20,
    slow: ema50
  });
  
  return {
    movingAverages: {
      sma20,
      ema50
    },
    momentum: {
      rsi,
      macd
    },
    trends: {
      adx,
      trendStrength
    },
    signals: crossovers
  };
}
```

#### Statistical Analysis

```typescript
import { Statistics } from '@intue/analysis';

function performStatisticalAnalysis(data: number[]): StatisticalAnalysis {
  const stats = new Statistics(data);
  
  // Basic statistics
  const mean = stats.mean();
  const median = stats.median();
  const standardDeviation = stats.standardDeviation();
  
  // Normality tests
  const isNormal = stats.isNormallyDistributed(0.05);
  
  // Outlier detection
  const outliers = stats.detectOutliers({
    method: 'z-score',
    threshold: 2.5
  });
  
  // Correlation with other series
  const correlations = {};
  for (const [key, series] of Object.entries(otherSeries)) {
    correlations[key] = stats.correlation(series);
  }
  
  return {
    basicStats: {
      mean,
      median,
      standardDeviation
    },
    distribution: {
      isNormal
    },
    anomalies: outliers,
    relationships: correlations
  };
}
```

### Testing and Validation

#### Unit Testing

Create comprehensive tests for your custom MCP:

```typescript
import { CustomMetricMCP } from './custom-metric-mcp';
import { TestDataGenerator } from '@intue/testing';

describe('CustomMetricMCP', () => {
  let mcp;
  let testData;
  
  beforeEach(() => {
    mcp = new CustomMetricMCP({
      sensitivity: 0.7,
      lookbackPeriod: 14,
      processingMethod: 'default'
    });
    
    testData = TestDataGenerator.generateTimeSeries({
      length: 100,
      trend: 'upward',
      volatility: 'medium',
      outliers: 2
    });
  });
  
  test('processes data correctly', async () => {
    const signals = await mcp.process(testData);
    
    expect(signals).toBeDefined();
    expect(Array.isArray(signals)).toBe(true);
    expect(signals.length).toBeGreaterThan(0);
    
    // Verify signal structure
    signals.forEach(signal => {
      expect(signal).toHaveProperty('asset');
      expect(signal).toHaveProperty('strength');
      expect(signal).toHaveProperty('direction');
      expect(signal).toHaveProperty('timestamp');
    });
  });
  
  test('applies sensitivity filter correctly', async () => {
    // Test with low sensitivity
    mcp.configure({ sensitivity: 0.2 });
    const lowSensitivitySignals = await mcp.process(testData);
    
    // Test with high sensitivity
    mcp.configure({ sensitivity: 0.8 });
    const highSensitivitySignals = await mcp.process(testData);
    
    expect(lowSensitivitySignals.length).toBeGreaterThan(highSensitivitySignals.length);
  });
  
  test('handles invalid input gracefully', async () => {
    const invalidData = [null, undefined, []];
    
    for (const data of invalidData) {
      await expect(mcp.process(data)).rejects.toThrow();
    }
  });
});
```

#### Benchmark Testing

Evaluate MCP performance metrics:

```typescript
import { MCP_Benchmarker } from '@intue/testing';

async function benchmarkMCP() {
  const benchmarker = new MCP_Benchmarker({
    iterations: 100,
    dataSizes: [100, 1000, 10000],
    timeLimit: 60000  // ms
  });
  
  const customMCP = new CustomMetricMCP();
  const results = await benchmarker.benchmark(customMCP);
  
  console.log('Performance results:', results);
  
  // Check against performance requirements
  const meetsRequirements = results.averageProcessingTime < 100 &&  // 100ms
                           results.memoryUsage < 50 * 1024 * 1024;  // 50MB
  
  return {
    results,
    meetsRequirements
  };
}
```

### Protocol Integration

#### Composed Protocols

Combine multiple MCPs for enhanced functionality:

```typescript
import { ComposedMCP } from '@intue/core';

export class EnhancedAnalysisMCP extends ComposedMCP {
  constructor(config) {
    super('enhanced-analysis', config);
    
    // Register component protocols
    this.registerProtocol('sentiment', new SentimentMCP(config.sentiment));
    this.registerProtocol('volume', new VolumeMCP(config.volume));
    this.registerProtocol('correlation', new CustomCorrelationMCP(config.correlation));
  }
  
  async process(data: RawData): Promise<Signal[]> {
    // Process data through component protocols
    const sentimentSignals = await this.protocols.sentiment.process(data);
    const volumeSignals = await this.protocols.volume.process(data);
    
    // Provide correlation protocol with processed signals
    const correlationInput = this._prepareCorrelationInput(sentimentSignals, volumeSignals);
    const correlationSignals = await this.protocols.correlation.process(correlationInput);
    
    // Combine and enhance signals
    return this._combineSignals(sentimentSignals, volumeSignals, correlationSignals);
  }
  
  private _prepareCorrelationInput(sentimentSignals, volumeSignals) {
    // Format input for correlation protocol
    // ...
  }
  
  private _combineSignals(sentimentSignals, volumeSignals, correlationSignals) {
    // Logic to combine signals from different protocols
    // ...
  }
}
```

#### Integration with Agents

Expose your MCP for agent consumption:

```typescript
import { AgentSDK } from '@intue/agent';
import { CustomMetricMCP } from './custom-metric-mcp';

async function integrateWithAgent() {
  const agent = AgentSDK.loadAgent('momentum-agent');
  
  // Register custom MCP with agent
  agent.registerMCP('custom-metric', new CustomMetricMCP({
    sensitivity: 0.65,
    lookbackPeriod: 21
  }));
  
  // Configure agent to use the custom MCP
  agent.configure({
    activeProtocols: ['sentiment', 'volume', 'custom-metric'],
    protocolWeights: {
      sentiment: 0.3,
      volume: 0.3,
      'custom-metric': 0.4
    }
  });
  
  // Test the integration
  const signals = await agent.process(testData);
  
  return {
    agent,
    signals
  };
}
```

### Deployment and Publication

To make your MCP available for broader use:

```typescript
import { MCPSDK } from '@intue/sdk';

async function publishMCP() {
  const sdk = new MCPSDK({
    apiKey: process.env.INTUE_API_KEY
  });
  
  // Package MCP for distribution
  const packageResult = await sdk.packageMCP({
    mcpClass: CustomMetricMCP,
    version: '1.0.0',
    documentation: './docs/custom-metric.md',
    tests: './tests/custom-metric.test.ts'
  });
  
  // Publish to INTUE registry
  const publishResult = await sdk.publishMCP({
    package: packageResult.package,
    isPublic: true,
    category: 'metric',
    tags: ['custom', 'experimental']
  });
  
  console.log('MCP published successfully:', publishResult);
  
  return publishResult;
}
```

### Best Practices

1. **Focus on Reusability**: Design your MCP to be useful in multiple contexts
2. **Optimize Critical Paths**: Identify and optimize performance bottlenecks
3. **Implement Proper Validation**: Thoroughly validate all input data
4. **Include Comprehensive Tests**: Cover edge cases and failure modes
5. **Document Thoroughly**: Provide clear documentation on purpose and usage
6. **Manage Dependencies Carefully**: Minimize external dependencies
7. **Implement Graceful Degradation**: Handle partial data and error conditions
8. **Consider Resource Constraints**: Optimize for memory and CPU efficiency
9. **Design for Composability**: Make your MCP work well with others
10. **Maintain Backward Compatibility**: Use semantic versioning for updates
