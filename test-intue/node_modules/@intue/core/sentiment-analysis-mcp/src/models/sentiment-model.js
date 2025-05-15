/**
 * Model for processing and combining sentiment data from various sources
 * Core component of the Model Context Protocol (MCP)
 */
class SentimentModel {
  constructor() {
    // Model configuration
    this.config = {
      minDataPoints: 3,
      defaultScore: 50,
      trendThreshold: 0.05 // 5% change to detect trend
    };
  }
  
  /**
   * Process sentiment data from multiple sources
   * @param {Object} sentimentData - Sentiment data from different analyzers
   * @param {Object} weights - Weights for different data sources
   * @param {number} totalWeight - Sum of weights for used sources
   * @returns {Object} - Processed sentiment model output
   */
  process(sentimentData, weights, totalWeight) {
    // If no total weight, return default score
    if (totalWeight <= 0) {
      return {
        score: this.config.defaultScore,
        normalized: this.config.defaultScore / 100,
        trend: 'stable',
        breakdown: {},
        confidence: 0
      };
    }
    
    // Normalize weights based on available data
    const normalizedWeights = {};
    for (const [source, weight] of Object.entries(weights)) {
      if (sentimentData[source]) {
        normalizedWeights[source] = weight / totalWeight;
      }
    }
    
    // Calculate weighted sentiment score
    let weightedScore = 0;
    const breakdown = {};
    
    for (const [source, data] of Object.entries(sentimentData)) {
      const sourceWeight = normalizedWeights[source] || 0;
      weightedScore += data.score * sourceWeight;
      
      breakdown[source] = {
        score: data.score,
        weight: sourceWeight,
        contribution: data.score * sourceWeight,
        trend: data.trend
      };
    }
    
    // Determine overall trend
    let trendDirection = 'stable';
    const trendValues = Object.values(sentimentData)
      .map(data => data.trend === 'rising' ? 1 : data.trend === 'falling' ? -1 : 0);
    
    if (trendValues.length > 0) {
      const avgTrend = trendValues.reduce((sum, val) => sum + val, 0) / trendValues.length;
      trendDirection = avgTrend > this.config.trendThreshold ? 'rising' : 
                       avgTrend < -this.config.trendThreshold ? 'falling' : 'stable';
    }
    
    // Calculate confidence based on data sources and agreement
    const numSources = Object.keys(sentimentData).length;
    const trendAgreement = trendValues.filter(v => 
      (trendDirection === 'rising' && v > 0) || 
      (trendDirection === 'falling' && v < 0) || 
      (trendDirection === 'stable' && v === 0)
    ).length / Math.max(1, trendValues.length);
    
    const confidence = (numSources / 3) * 0.5 + trendAgreement * 0.5;
    
    return {
      score: Math.round(weightedScore * 10) / 10, // Round to 1 decimal place
      normalized: weightedScore / 100,
      trend: trendDirection,
      breakdown,
      confidence: Math.round(confidence * 100) / 100
    };
  }
  
  /**
   * Calculate Pearson correlation coefficient
   * @param {Array<number>} xValues - First array of values
   * @param {Array<number>} yValues - Second array of values
   * @returns {number} - Correlation coefficient (-1 to 1)
   */
  calculateCorrelation(xValues, yValues) {
    const n = Math.min(xValues.length, yValues.length);
    if (n < this.config.minDataPoints) return 0;
    
    // Calculate means
    const xMean = xValues.slice(0, n).reduce((sum, val) => sum + val, 0) / n;
    const yMean = yValues.slice(0, n).reduce((sum, val) => sum + val, 0) / n;
    
    // Calculate sums for correlation formula
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
    
    // Prevent division by zero
    if (xVariance === 0 || yVariance === 0) return 0;
    
    return numerator / Math.sqrt(xVariance * yVariance);
  }
  
  /**
   * Calculate optimal lag between two time series
   * @param {Array<number>} series1 - First time series
   * @param {Array<number>} series2 - Second time series
   * @param {number} maxLag - Maximum lag to test
   * @returns {number} - Optimal lag (positive means series1 leads series2)
   */
  calculateOptimalLag(series1, series2, maxLag = 7) {
    if (series1.length < this.config.minDataPoints || series2.length < this.config.minDataPoints) {
      return 0;
    }
    
    let bestLag = 0;
    let bestCorrelation = 0;
    
    // Test different lags
    for (let lag = -maxLag; lag <= maxLag; lag++) {
      const pairs = [];
      
      // Create paired observations with the current lag
      for (let i = 0; i < series1.length; i++) {
        const j = i + lag;
        if (j >= 0 && j < series2.length) {
          pairs.push([series1[i], series2[j]]);
        }
      }
      
      if (pairs.length >= this.config.minDataPoints) {
        const x = pairs.map(p => p[0]);
        const y = pairs.map(p => p[1]);
        const correlation = Math.abs(this.calculateCorrelation(x, y));
        
        if (correlation > bestCorrelation) {
          bestCorrelation = correlation;
          bestLag = lag;
        }
      }
    }
    
    return bestLag;
  }
}

module.exports = SentimentModel;