/**
 * Simple caching system for API responses
 */
class Cache {
  constructor(options = {}) {
    this.data = {};
    this.ttl = options.ttl || 5 * 60 * 1000; // 5 minutes default
    this.timestamps = {};
  }

  set(key, value) {
    this.data[key] = value;
    this.timestamps[key] = Date.now();
    return value;
  }

  get(key) {
    const timestamp = this.timestamps[key];
    if (!timestamp) return null;
    
    if (Date.now() - timestamp > this.ttl) {
      delete this.data[key];
      delete this.timestamps[key];
      return null;
    }
    
    return this.data[key];
  }

  clear() {
    this.data = {};
    this.timestamps = {};
  }
}

module.exports = Cache;