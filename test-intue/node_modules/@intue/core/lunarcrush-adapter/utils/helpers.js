/**
 * Utility functions for the LunarCrush adapter
 * @module helpers
 */

/**
 * Normalize coin identifier (name or symbol)
 * @param {string} coin - Coin name or symbol
 * @returns {string} - Normalized identifier
 */
function normalizeCoinIdentifier(coin) {
  if (!coin) return '';
  
  // If it's already a symbol (uppercase, 2-6 chars), return as is
  if (/^[A-Z0-9]{2,6}$/.test(coin)) {
    return coin;
  }
  
  // Convert coin name to lowercase and remove spaces
  return coin.toLowerCase().replace(/\s+/g, '');
}

/**
 * Convert time period string to days
 * @param {string} period - Time period (e.g., '1d', '7d', '30d')
 * @returns {number} - Number of days
 */
function periodToDays(period) {
  const match = period.match(/^(\d+)([hdwmy])$/);
  if (!match) return 7; // Default to 7 days
  
  const [, value, unit] = match;
  const numValue = parseInt(value, 10);
  
  switch (unit) {
    case 'h': return numValue / 24; // hours to days
    case 'd': return numValue; // already days
    case 'w': return numValue * 7; // weeks to days
    case 'm': return numValue * 30; // months to days (approx)
    case 'y': return numValue * 365; // years to days (approx)
    default: return 7;
  }
}

/**
 * Format number for display
 * @param {number} num - Number to format
 * @param {number} [decimals=2] - Number of decimal places
 * @returns {string} - Formatted number
 */
function formatNumber(num, decimals = 2) {
  if (num === null || num === undefined) return '0';
  
  const absNum = Math.abs(num);
  
  if (absNum >= 1e9) {
    return (num / 1e9).toFixed(decimals) + 'B';
  }
  if (absNum >= 1e6) {
    return (num / 1e6).toFixed(decimals) + 'M';
  }
  if (absNum >= 1e3) {
    return (num / 1e3).toFixed(decimals) + 'K';
  }
  
  return num.toFixed(decimals);
}

module.exports = {
  normalizeCoinIdentifier,
  periodToDays,
  formatNumber
};