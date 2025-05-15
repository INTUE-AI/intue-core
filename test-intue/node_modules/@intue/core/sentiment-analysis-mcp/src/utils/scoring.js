/**
 * Calculate the trend direction from a time-ordered array of values
 * @param {Array<number>} values - Time series values (newest first)
 * @param {Object} [options] - Calculation options
 * @param {number} [options.threshold=0.05] - Threshold for trend detection
 * @param {number} [options.avgPeriods=3] - Number of periods to average for trend
 * @returns {string} - Trend direction: 'rising', 'falling', or 'stable'
 */
function calculateTrend(values, options = {}) {
  if (!values || values.length < 2) return 'stable';
  
  const threshold = options.threshold || 0.05; // 5% change to detect trend
  const avgPeriods = options.avgPeriods || 3;
  
  // Calculate recent average (up to avgPeriods or available data)
  const recentCount = Math.min(avgPeriods, Math.floor(values.length / 2));
  const recentValues = values.slice(0, recentCount);
  const recentAvg = recentValues.reduce((sum, val) => sum + val, 0) / recentCount;
  
  // Calculate older average
  const olderValues = values.slice(values.length - recentCount);
  const olderAvg = olderValues.reduce((sum, val) => sum + val, 0) / recentCount;
  
  // Calculate percent change
  if (olderAvg === 0) return 'stable';
  const percentChange = (recentAvg - olderAvg) / olderAvg;
  
  // Determine trend direction
  if (percentChange > threshold) {
    return 'rising';
  } else if (percentChange < -threshold) {
    return 'falling';
  } else {
    return 'stable';
  }
}

/**
 * Normalize a sentiment score to a 0-100 scale
 * @param {number} score - Raw sentiment score
 * @param {number} min - Minimum possible score
 * @param {number} max - Maximum possible score
 * @returns {number} - Normalized score (0-100)
 */
function normalizeScore(score, min, max) {
  if (max === min) return 50; // Default to neutral if range is 0
  
  // Clamp score to min-max range
  const clampedScore = Math.max(min, Math.min(max, score));
  
  // Normalize to 0-100
  return ((clampedScore - min) / (max - min)) * 100;
}

/**
 * Calculate the significance of a sentiment score
 * @param {number} score - Normalized sentiment score (0-100)
 * @returns {string} - Significance level: 'very negative', 'negative', 'neutral', 'positive', 'very positive'
 */
function getSignificance(score) {
  if (score < 20) return 'very negative';
  if (score < 40) return 'negative';
  if (score < 60) return 'neutral';
  if (score < 80) return 'positive';
  return 'very positive';
}

module.exports = {
  calculateTrend,
  normalizeScore,
  getSignificance
};