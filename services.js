'use strict';
var Sequelize = require('sequelize');
const elasticsearch = require('elasticsearch');
const promisify = require('es6-promisify');
const bluebird = require("bluebird");
const redis = require("redis");
var logger = require('elastic-logger');

let dbOptions = {
  host: process.env.MYSQL_HOST,
  dialect: 'mysql',
  pool: {
    max: process.env.MYSQL_POOL_MAX,
    min: process.env.MYSQL_POOL_MIN,
    idle: 10000
  },
  logging: process.env.MYSQL_LOGGING == 'false' ? false : console.log,
  benchmark: process.env.MYSQL_LOGGING !== 'false'
};
if (process.env.MYSQL_HOST.indexOf('amazonaws.com') !== -1) {
  dbOptions.dialectOptions = {ssl: 'Amazon RDS'};
} else {
  /** pro vshosting db */
  dbOptions.timezone = 'Europe/Prague';
}
module.exports.db = new Sequelize(process.env.MYSQL_DATABASE, process.env.MYSQL_USER, process.env.MYSQL_PASSWORD, dbOptions);

bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);
module.exports.cache = redis.createClient(process.env.REDIS_URL, {db: process.env.REDIS_DB || 3});
module.exports.cacheBuffered = module.exports.cache.duplicate({return_buffers: true});

var elastic = new elasticsearch.Client({
  host: process.env.ELASTIC_DOMAIN,
  requestTimeout: 100 * 1000
});
let update = promisify(elastic.update.bind(elastic));
let search = promisify(elastic.search.bind(elastic));
let count = promisify(elastic.count.bind(elastic));
let get = promisify(elastic.get.bind(elastic));
module.exports.elasticSearch = {
  search: function *() {
    let res = yield search.apply(null, arguments);
    if (res[1] === 200) {
      return res[0].hits
    } else {
      throw new Error(res);
    }
  },
  bulk: promisify(elastic.bulk.bind(elastic)),
  create: promisify(elastic.create.bind(elastic)),
  count: function *() {
    let res = yield count.apply(null, arguments);
    if (res[1] === 200) {
      return res[0].count
    } else {
      throw new Error(res);
    }
  },
  delete: promisify(elastic.delete.bind(elastic)),
  get: function *() {
    try {
      let res = yield get.apply(null, arguments);
      if (res[1] === 200) {
        return res[0]
      } else {
        return null;
      }
    } catch (e) {
      return null;
    }

  },
  update: function *() {
    let res = yield update.apply(null, arguments);
    if (res[1] === 200) {
      return res[0]
    } else {
      throw new Error(res);
    }
  }
};

module.exports.elasticLogger = new logger.EndpointLogging(new elasticsearch.Client({
  host: process.env.ELASTIC_LOGGER_DOMAIN,
  requestTimeout: 100 * 1000
}));