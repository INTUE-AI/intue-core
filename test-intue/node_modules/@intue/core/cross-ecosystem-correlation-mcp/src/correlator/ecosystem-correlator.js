const { VolumeMetrics } = require('../metrics/volume-metrics');
const { PriceMetrics } = require('../metrics/price-metrics');
const { SentimentMetrics } = require('../metrics/sentiment-metrics');
const { generateCorrelationMatrix, generateNetworkGraph } = require('../utils/matrix');

/**
 * Core correlator for analyzing relationships between crypto ecosystems
 * Central component of the Model Context Protocol
 */
class EcosystemCorrelator {
  /**
   * Create a new ecosystem correlator
   * @param {Object} adapters - Data adapters
   * @param {Object} cache - Cache instance
   */
  constructor(adapters, cache) {
    this.adapters = adapters;
    this.cache = cache;
    
    // Initialize metrics analyzers
    this.volumeMetrics = new VolumeMetrics(adapters.lunarcrush, cache);
    this.priceMetrics = new PriceMetrics(adapters.lunarcrush, cache);
    
    // Initialize sentiment metrics if sentiment analyzer is available
    if (adapters.sentimentAnalyzer) {
      this.sentimentMetrics = new SentimentMetrics(adapters.sentimentAnalyzer, cache);
    }
  }
  
  /**
   * Analyze correlations between multiple ecosystems
   * @param {Array<string>} ecosystems - List of ecosystem names to analyze
   * @param {Object} [options] - Analysis options
   * @param {string} [options.timeframe='30d'] - Time window
   * @param {string} [options.metric='combined'] - Metric to correlate
   * @param {number} [options.minCorrelation=0.5] - Minimum correlation to include
   * @returns {Promise<Object>} - Correlation analysis results
   */
  async analyzeEcosystemCorrelations(ecosystems, options = {}) {
    const timeframe = options.timeframe || '30d';
    const metric = options.metric || 'combined';
    const minCorrelation = options.minCorrelation || 0.5;
    
    // Create cache key from parameters
    const cacheKey = `ecosystem_correlations_${ecosystems.join('-')}_${timeframe}_${metric}_${minCorrelation}`;
    
    // Check cache
    const cachedResult = this.cache.get(cacheKey);
    if (cachedResult) return cachedResult;
    
    try {
      // Get ecosystem data based on selected metric
      const ecosystemData = {};
      
      for (const ecosystem of ecosystems) {
        switch (metric) {
          case 'volume':
            ecosystemData[ecosystem] = await this.volumeMetrics.getEcosystemVolumeData(ecosystem, timeframe);
            break;
            
          case 'price':
            ecosystemData[ecosystem] = await this.priceMetrics.getEcosystemPriceData(ecosystem, timeframe);
            break;
            
          case 'sentiment':
            if (!this.sentimentMetrics) {
              throw new Error('Sentiment analyzer required for sentiment metric');
            }
            ecosystemData[ecosystem] = await this.sentimentMetrics.getEcosystemSentimentData(ecosystem, timeframe);
            break;
            
          case 'combined':
            // For combined metrics, we need to get all metrics and combine them
            const volumeData = await this.volumeMetrics.getEcosystemVolumeData(ecosystem, timeframe);
            const priceData = await this.priceMetrics.getEcosystemPriceData(ecosystem, timeframe);
            
            // Combine price and volume data (weighted average)
            ecosystemData[ecosystem] = volumeData.map((vol, i) => {
              return 0.6 * priceData[i] + 0.4 * vol;
            });
            
            // Add sentiment data if available
            if (this.sentimentMetrics) {
              const sentimentData = await this.sentimentMetrics.getEcosystemSentimentData(ecosystem, timeframe);
              
              // Recombine with sentiment
              ecosystemData[ecosystem] = ecosystemData[ecosystem].map((val, i) => {
                return 0.7 * val + 0.3 * (sentimentData[i] || 0);
              });
            }
            break;
            
          default:
            throw new Error(`Unknown metric: ${metric}`);
        }
      }
      
      // Generate correlation matrix
      const { correlationMatrix, labels, strongestPairs } = generateCorrelationMatrix(ecosystemData, {
        minCorrelation
      });
      
      // Generate network graph from correlation matrix
      const networkData = generateNetworkGraph(correlationMatrix, labels, {
        minWeight: minCorrelation
      });
      
      const result = {
        matrix: correlationMatrix,
        labels,
        strongestPair: strongestPairs[0] || null,
        topPairs: strongestPairs.slice(0, 5),
        networkData,
        metric,
        timeframe
      };
      
      // Cache result
      this.cache.set(cacheKey, result);
      return result;
    } catch (error) {
      console.error(`Error analyzing ecosystem correlations:`, error);
      throw error;
    }
  }
  
  /**
   * Analyze correlations between multiple assets
   * @param {Array<string>} assets - List of asset symbols or names
   * @param {Object} [options] - Analysis options
   * @param {string} [options.timeframe='30d'] - Time window
   * @param {string} [options.metric='price'] - Metric to correlate
   * @param {number} [options.minCorrelation=0.5] - Minimum correlation to include
   * @returns {Promise<Object>} - Correlation analysis results
   */
  async analyzeAssetCorrelations(assets, options = {}) {
    const timeframe = options.timeframe || '30d';
    const metric = options.metric || 'price';
    const minCorrelation = options.minCorrelation || 0.5;
    
    // Create cache key from parameters
    const cacheKey = `asset_correlations_${assets.join('-')}_${timeframe}_${metric}_${minCorrelation}`;
    
    // Check cache
    const cachedResult = this.cache.get(cacheKey);
    if (cachedResult) return cachedResult;
    
    try {
      // Get asset data based on selected metric
      const assetData = {};
      
      for (const asset of assets) {
        switch (metric) {
          case 'volume':
            assetData[asset] = await this.volumeMetrics.getAssetVolumeData(asset, timeframe);
            break;
            
          case 'price':
            assetData[asset] = await this.priceMetrics.getAssetPriceData(asset, timeframe);
            break;
            
          case 'sentiment':
            if (!this.sentimentMetrics) {
              throw new Error('Sentiment analyzer required for sentiment metric');
            }
            assetData[asset] = await this.sentimentMetrics.getAssetSentimentData(asset, timeframe);
            break;
            
          case 'combined':
            // Get all metrics and combine them
            const volumeData = await this.volumeMetrics.getAssetVolumeData(asset, timeframe);
            const priceData = await this.priceMetrics.getAssetPriceData(asset, timeframe);
            
            // Combine price and volume data
            assetData[asset] = priceData.map((price, i) => {
              return 0.7 * price + 0.3 * volumeData[i];
            });
            
            // Add sentiment if available
            if (this.sentimentMetrics) {
              const sentimentData = await this.sentimentMetrics.getAssetSentimentData(asset, timeframe);
              
              // Recombine with sentiment
              assetData[asset] = assetData[asset].map((val, i) => {
                return 0.7 * val + 0.3 * (sentimentData[i] || 0);
              });
            }
            break;
            
          default:
            throw new Error(`Unknown metric: ${metric}`);
        }
      }
      
      // Generate correlation matrix
      const { correlationMatrix, labels, strongestPairs } = generateCorrelationMatrix(assetData, {
        minCorrelation
      });
      
      // Generate network graph
      const networkData = generateNetworkGraph(correlationMatrix, labels, {
        minWeight: minCorrelation
      });
      
      const result = {
        matrix: correlationMatrix,
        labels,
        strongestPair: strongestPairs[0] || null,
        topPairs: strongestPairs.slice(0, 5),
        networkData,
        metric,
        timeframe
      };
      
      // Cache result
      this.cache.set(cacheKey, result);
      return result;
    } catch (error) {
      console.error(`Error analyzing asset correlations:`, error);
      throw error;
    }
  }
  
  /**
   * Analyze which ecosystems lead or lag others
   * @param {Array<string>} ecosystems - List of ecosystem names
   * @param {Object} [options] - Analysis options
   * @param {string} [options.timeframe='90d'] - Time window
   * @param {string} [options.interval='1d'] - Data interval
   * @param {string} [options.metric='price'] - Metric to analyze
   * @param {number} [options.lagMax=14] - Maximum lag days to check
   * @returns {Promise<Object>} - Lead/lag analysis results
   */
  async analyzeLeadLagRelationships(ecosystems, options = {}) {
    const timeframe = options.timeframe || '90d';
    const interval = options.interval || '1d';
    const metric = options.metric || 'price';
    const lagMax = options.lagMax || 14;
    
    // Create cache key from parameters
    const cacheKey = `lead_lag_${ecosystems.join('-')}_${timeframe}_${interval}_${metric}_${lagMax}`;
    
    // Check cache
    const cachedResult = this.cache.get(cacheKey);
    if (cachedResult) return cachedResult;
    
    try {
      // Get time series data for each ecosystem
      const timeSeriesData = {};
      
      for (const ecosystem of ecosystems) {
        switch (metric) {
          case 'price':
            timeSeriesData[ecosystem] = await this.priceMetrics.getEcosystemPriceTimeSeries(
              ecosystem, 
              timeframe, 
              interval
            );
            break;
            
          case 'volume':
            timeSeriesData[ecosystem] = await this.volumeMetrics.getEcosystemVolumeTimeSeries(
              ecosystem, 
              timeframe, 
              interval
            );
            break;
            
          case 'sentiment':
            if (!this.sentimentMetrics) {
              throw new Error('Sentiment analyzer required for sentiment metric');
            }
            timeSeriesData[ecosystem] = await this.sentimentMetrics.getEcosystemSentimentTimeSeries(
              ecosystem, 
              timeframe, 
              interval
            );
            break;
            
          default:
            throw new Error(`Unknown metric: ${metric}`);
        }
      }
      
      // Calculate lead/lag relationships
      const lagMatrix = this._calculateLagMatrix(timeSeriesData, lagMax);
      
      // Identify leaders and laggers
      const leaders = [];
      const laggers = [];
      const relationships = [];
      
      for (let i = 0; i < ecosystems.length; i++) {
        let leadCount = 0;
        let lagCount = 0;
        
        for (let j = 0; j < ecosystems.length; j++) {
          if (i === j) continue;
          
          const lag = lagMatrix[i][j];
          
          if (lag > 0) {
            // Ecosystem i leads ecosystem j by 'lag' days
            leadCount++;
            relationships.push({
              leader: ecosystems[i],
              lagger: ecosystems[j],
              lag
            });
          } else if (lag < 0) {
            // Ecosystem i lags ecosystem j by 'lag' days
            lagCount++;
          }
        }
        
        if (leadCount > lagCount) {
          leaders.push({
            ecosystem: ecosystems[i],
            leadCount
          });
        } else if (lagCount > leadCount) {
          laggers.push({
            ecosystem: ecosystems[i],
            lagCount
          });
        }
      }
      
      // Sort leaders and laggers
      leaders.sort((a, b) => b.leadCount - a.leadCount);
      laggers.sort((a, b) => b.lagCount - a.lagCount);
      
      // Sort relationships by lag value
      relationships.sort((a, b) => b.lag - a.lag);
      
      const result = {
        lagMatrix,
        leaders,
        laggers,
        relationships: relationships.slice(0, 10), // Top 10 relationships
        metric,
        timeframe
      };
      
      // Cache result
      this.cache.set(cacheKey, result);
      return result;
    } catch (error) {
      console.error(`Error analyzing lead/lag relationships:`, error);
      throw error;
    }
  }
  
  /**
   * Analyze capital flows between ecosystems
   * @param {Array<string>} ecosystems - List of ecosystem names
   * @param {Object} [options] - Analysis options
   * @param {string} [options.timeframe='14d'] - Time window
   * @param {number} [options.minFlowPercentage=5] - Minimum flow to include
   * @returns {Promise<Object>} - Capital flow analysis
   */
  async analyzeCapitalFlows(ecosystems, options = {}) {
    const timeframe = options.timeframe || '14d';
    const minFlowPercentage = options.minFlowPercentage || 5;
    
    // Create cache key from parameters
    const cacheKey = `capital_flows_${ecosystems.join('-')}_${timeframe}_${minFlowPercentage}`;
    
    // Check cache
    const cachedResult = this.cache.get(cacheKey);
    if (cachedResult) return cachedResult;
    
    try {
      // Get volume changes for each ecosystem
      const volumeChanges = {};
      const startVolumes = {};
      const endVolumes = {};
      
      for (const ecosystem of ecosystems) {
        // Get volume data from beginning and end of timeframe
        const volumeData = await this.volumeMetrics.getEcosystemVolumeChange(ecosystem, timeframe);
        
        startVolumes[ecosystem] = volumeData.startVolume;
        endVolumes[ecosystem] = volumeData.endVolume;
        volumeChanges[ecosystem] = volumeData.change;
      }
      
      // Create flow matrix
      const flowMatrix = [];
      const totalOutflows = {};
      
      // Initialize matrix and outflows
      for (let i = 0; i < ecosystems.length; i++) {
        flowMatrix[i] = new Array(ecosystems.length).fill(0);
        totalOutflows[ecosystems[i]] = 0;
      }
      
      // Calculate flows based on volume changes
      // This is a simplified model that estimates flows based on correlated volume changes
      for (let i = 0; i < ecosystems.length; i++) {
        const sourceEcosystem = ecosystems[i];
        
        // If this ecosystem lost volume, distribute to ecosystems that gained volume
        if (volumeChanges[sourceEcosystem] < 0) {
          const lostVolume = Math.abs(volumeChanges[sourceEcosystem]);
          totalOutflows[sourceEcosystem] = lostVolume;
          
          // Get gaining ecosystems
          const gainers = ecosystems.filter(eco => volumeChanges[eco] > 0);
          
          if (gainers.length > 0) {
            // Get correlations to determine flow distribution
            const correlations = await this._getEcosystemCorrelations([sourceEcosystem, ...gainers], timeframe);
            
            // Calculate weighted distribution based on correlations and volume gains
            const totalWeight = gainers.reduce((sum, eco) => {
              const correlation = correlations[sourceEcosystem][eco] || 0;
              const gain = volumeChanges[eco];
              return sum + (correlation * gain);
            }, 0);
            
            // Distribute lost volume to gainers
            for (const gainer of gainers) {
              const j = ecosystems.indexOf(gainer);
              const correlation = correlations[sourceEcosystem][gainer] || 0;
              const gain = volumeChanges[gainer];
              
              const weight = totalWeight > 0 ? (correlation * gain) / totalWeight : 1 / gainers.length;
              flowMatrix[i][j] = lostVolume * weight;
            }
          }
        }
      }
      
      // Calculate net inflows/outflows
      const netInflows = {};
      const significantFlows = [];
      
      for (let i = 0; i < ecosystems.length; i++) {
        const eco = ecosystems[i];
        let inflow = 0;
        let outflow = 0;
        
        for (let j = 0; j < ecosystems.length; j++) {
          // Add incoming flows
          inflow += flowMatrix[j][i];
          
          // Add outgoing flows
          outflow += flowMatrix[i][j];
          
          // Record significant flows
          if (i !== j && flowMatrix[i][j] > 0) {
            const percentage = (flowMatrix[i][j] / totalOutflows[eco]) * 100;
            
            if (percentage >= minFlowPercentage) {
              significantFlows.push({
                from: eco,
                to: ecosystems[j],
                value: flowMatrix[i][j],
                percentage
              });
            }
          }
        }
        
        netInflows[eco] = inflow - outflow;
      }
      
      // Sort significant flows by value
      significantFlows.sort((a, b) => b.value - a.value);
      
      const result = {
        flowMatrix,
        ecosystems,
        startVolumes,
        endVolumes,
        volumeChanges,
        netInflows,
        significantFlows,
        timeframe
      };
      
      // Cache result
      this.cache.set(cacheKey, result);
      return result;
    } catch (error) {
      console.error(`Error analyzing capital flows:`, error);
      throw error;
    }
  }
  
  /**
   * Get correlations between ecosystems
   * @private
   * @param {Array<string>} ecosystems - List of ecosystems
   * @param {string} timeframe - Time window
   * @returns {Promise<Object>} - Correlation matrix
   */
  async _getEcosystemCorrelations(ecosystems, timeframe) {
    try {
      const correlations = await this.analyzeEcosystemCorrelations(ecosystems, {
        timeframe,
        metric: 'combined',
        minCorrelation: 0
      });
      
      // Convert matrix to object for easier lookup
      const result = {};
      for (let i = 0; i < ecosystems.length; i++) {
        result[ecosystems[i]] = {};
        
        for (let j = 0; j < ecosystems.length; j++) {
          result[ecosystems[i]][ecosystems[j]] = correlations.matrix[i][j];
        }
      }
      
      return result;
    } catch (error) {
      console.error(`Error getting ecosystem correlations:`, error);
      // Return empty correlations
      const result = {};
      for (const eco of ecosystems) {
        result[eco] = {};
        for (const other of ecosystems) {
          result[eco][other] = 0;
        }
      }
      return result;
    }
  }
  
  /**
   * Calculate lag matrix between time series
   * @private
   * @param {Object} timeSeriesData - Time series data by ecosystem
   * @param {number} lagMax - Maximum lag to check
   * @returns {Array<Array<number>>} - Lag matrix
   */
  _calculateLagMatrix(timeSeriesData, lagMax) {
    const ecosystems = Object.keys(timeSeriesData);
    const n = ecosystems.length;
    const lagMatrix = Array(n).fill().map(() => Array(n).fill(0));
    
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (i === j) continue;
        
        const series1 = timeSeriesData[ecosystems[i]];
        const series2 = timeSeriesData[ecosystems[j]];
        
        lagMatrix[i][j] = this._findOptimalLag(series1, series2, lagMax);
      }
    }
    
    return lagMatrix;
  }
  
  /**
   * Find optimal lag between two time series
   * @private
   * @param {Array<number>} series1 - First time series
   * @param {Array<number>} series2 - Second time series
   * @param {number} maxLag - Maximum lag to check
   * @returns {number} - Optimal lag (positive if series1 leads series2)
   */
  _findOptimalLag(series1, series2, maxLag) {
    let bestCorrelation = -1;
    let bestLag = 0;
    
    // Check different lags
    for (let lag = -maxLag; lag <= maxLag; lag++) {
      const correlation = this._calculateLaggedCorrelation(series1, series2, lag);
      
      if (correlation > bestCorrelation) {
        bestCorrelation = correlation;
        bestLag = lag;
      }
    }
    
    return bestLag;
  }
  
  /**
   * Calculate correlation between two time series with lag
   * @private
   * @param {Array<number>} series1 - First time series
   * @param {Array<number>} series2 - Second time series
   * @param {number} lag - Lag to apply (positive if series1 leads series2)
   * @returns {number} - Correlation coefficient
   */
  _calculateLaggedCorrelation(series1, series2, lag) {
    const pairs = [];
    
    // Create paired observations with the current lag
    for (let i = 0; i < series1.length; i++) {
      const j = i + lag;
      if (j >= 0 && j < series2.length) {
        pairs.push([series1[i], series2[j]]);
      }
    }
    
    if (pairs.length < 3) return 0;
    
    const x = pairs.map(p => p[0]);
    const y = pairs.map(p => p[1]);
    
    return this._calculateCorrelation(x, y);
  }
  
  /**
   * Calculate Pearson correlation coefficient
   * @private
   * @param {Array<number>} xValues - First array
   * @param {Array<number>} yValues - Second array
   * @returns {number} - Correlation coefficient (-1 to 1)
   */
  _calculateCorrelation(xValues, yValues) {
    const n = Math.min(xValues.length, yValues.length);
    if (n < 3) return 0;
    
    // Calculate means
    const xMean = xValues.reduce((sum, val) => sum + val, 0) / n;
    const yMean = yValues.reduce((sum, val) => sum + val, 0) / n;
    
    // Calculate correlation
    let numerator = 0;
    let xVariance = 0;
    let yVariance = 0;
    
    for (let i = 0; i < n; i++) {
      const xDiff = xValues[i] - xMean;
      const yDiff = yValues[i] - yMean;
      
      numerator += xDiff * yDiff;
      xVariance += xDiff * xDiff;
      yVariance += yDiff * yDiff;
    }
    
    if (xVariance === 0 || yVariance === 0) return 0;
    
    return numerator / Math.sqrt(xVariance * yVariance);
  }
}

module.exports = { EcosystemCorrelator };