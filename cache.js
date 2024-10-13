const { FlatCache } = require("flat-cache");
const path = require("path");

const cacheOptions = {
  ttl: 60 * 60 * 1000, // 1 hour
  lruSize: 10000, // 10,000 items
  expirationInterval: 5 * 1000 * 60, // 5 minutes
  persistInterval: 5 * 1000 * 60, // 5 minutes
};

function createCache(cacheId = "responsesCache") {
  const cacheDir = path.resolve(__dirname, ".cache");
  const cache = new FlatCache({ ...cacheOptions, cacheDir, cacheId });
  return cache;
}

function isCacheExpired(cacheItem, ttl = cacheOptions.ttl) {
  if (!cacheItem || !cacheItem.timestamp) return true;
  const age = Date.now() - cacheItem.timestamp;
  return age > ttl;
}

module.exports = { createCache, isCacheExpired };
