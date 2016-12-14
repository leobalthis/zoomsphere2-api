'use strict';
let cache = require(__dirname + '/../models/cache');
const CACHE_PREFIX = 'endpoints-cache:';
const CACHE_TTL = process.env.ENDPOINT_CACHE_TTL || 15; /** in minutes */

class EndpointCacheModel {

  static * save(masterId, userId, headers, url, data) {
    yield cache.save(CACHE_PREFIX + masterId + ':' + userId + (headers.server === 'true' ? ':server' : ':'), url, data, CACHE_TTL * 60);
  }

  static * get(masterId, userId, headers, url) {
    return yield cache.get(CACHE_PREFIX + masterId + ':' + userId + (headers.server === 'true' ? ':server': ':'), url);
  }

  static * flushUser(masterId, userId) {
    yield cache.delete(CACHE_PREFIX + masterId+ ':' + userId);
  }

  static * flushTeam(masterId) {
    yield cache.delete(CACHE_PREFIX + masterId);
  }

}
module.exports = EndpointCacheModel;