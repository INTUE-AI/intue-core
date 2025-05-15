// Import original functionalities
const originalFunctions = require('./index.js');

// Import subcomponents - adjust paths if needed
let sentimentAnalysis = {};
let ecosystemCorrelator = {};
let lunarcrushAdapter = {};

try {
  sentimentAnalysis = require('./sentiment-analysis-mcp/src/index.js');
} catch (error) {
  console.log('Sentiment analysis module not loaded:', error.message);
}

try {
  ecosystemCorrelator = require('./cross-ecosystem-correlation-mcp/src/index.js');
} catch (error) {
  console.log('Ecosystem correlator module not loaded:', error.message);
}

try {
  lunarcrushAdapter = require('./lunarcrush-adapter/src/index.js');
} catch (error) {
  console.log('Lunarcrush adapter module not loaded:', error.message);
}

// Export everything in one neat package
module.exports = {
  // Include original functions
  ...originalFunctions,
  
  // Sub-modules
  sentimentAnalysis,
  ecosystemCorrelator,
  lunarcrushAdapter
};
