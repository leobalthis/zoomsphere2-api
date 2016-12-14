'use strict';
var koaMap = require('koa-map'),
  redis = require(__dirname + '/../../../services').cache;

class Cache {

  /**
   *
   * @param space
   * @param key
   * @param data
   * @param ttl *optional* is seconds
   * @returns {*}
   */
  static * save(space, key, data, ttl) {
    replace_null_to_string(data, true);
    let res = yield redis.hmsetAsync(space + ':' + key, data);
    if (ttl) {
      yield redis.expireAsync(space + ':' + key, Number(ttl));
    }
    return res
  }

  /**
   *
   * @param space
   * @param key
   * @param options *optional* possible keys delete: bool, default false - delete key after loaded
   * @returns {*}
   */
  static * get(space, key, options) {
    let res = yield redis.hgetallAsync(space + ':' + key);
    replace_null_from_string(res, true);
    if (options) {
      if (options.delete) {
        yield redis.delAsync(space + ':' + key);
      }
    }
    return res
  }

  static * find(space, key) {
    return yield redis.hscanAsync(space + ':' + key, 0);
  }

  static * addToSet(space, key, member) {
    return yield redis.saddAsync(space + ':' + key, member);
  }

  static * removeFromSet(space, key, member) {
    return yield redis.sremAsync(space + ':' + key, member);
  }

  static * membersOfSet(space, key) {
    let res = yield redis.smembersAsync(space + ':' + key);
    return res.map((item) => {
      return Number(item) == item ? Number(item) : item;
    })
  }

  static * isMemberOfSet(space, key, member) {
    return yield redis.sismemberAsync(space + ':' + key, member);
  }

  static * listSpace(space) {
    let keys = yield redis.keysAsync(space + ':*');
    return yield koaMap.mapLimit(keys, 40, function *(key) {
      let data = yield redis.hgetallAsync(key);
      let obj = new Object();
      for (var key in data) {
        if (data[key] === 'null') {
          obj[key] = null;
        } else if (data[key] === 'true') {
          obj[key] = true;
        } else if (data[key] === 'false') {
          obj[key] = false;
        }
        else {
          obj[key] = Number(data[key]) == data[key] ? Number(data[key]) : data[key];
        }
      }
      return obj
    });
  }

  static * increment(space, key) {
    let number = yield redis.incrAsync(space + ':' + key);
    return Number(number);
  }

  static * addToSortedSet(space, key, id, data) {
    return yield redis.zaddAsync(space + ':' + key, id, data);
  }

  static * findInSortedSet(space, key, min, max, limit) {
    if (!limit) {
      limit = 60
    }
    return yield redis.zrevrangebyscoreAsync(space + ':' + key, max, min, 'LIMIT', 0, limit);
  }

  static * countItemInSortedSet(space, key, min, max) {
    return yield redis.zcountAsync(space + ':' + key, min, max);
  }

  static * getSingleValue(space, key) {
    let value = yield redis.getAsync(space + ':' + key);
    return Number(value) == value ? Number(value) : value;
  }

  static * setSingleValue(space, key, value) {
    return yield redis.setAsync(space + ':' + key, value);
  }

  static * listSingleValues(space) {
    let keys = yield redis.keysAsync(space + ':*');
    return yield koaMap.mapLimit(keys, 40, function *(key) {
      let data = yield redis.getAsync(key);
      return {key: key.replace(space + ':', ''), data: data};
    });
  }

  static * delete(prefix) {
    let keys = yield redis.keysAsync(prefix + ':*');
    let toDelete = keys.map((key) => {
      return ["del", key];
    });
    if (toDelete && toDelete.length > 0) {
      let deleted = yield redis.multi(toDelete).execAsync();
      return deleted;
    } else {
      return null;
    }

  }

}
Cache.SPACES = {
  CALLBACKS: 'callbackStore',
  TEMP_TOKENS: 'temporaryTokens',
  TEAM_INVITATION: 'teamInvitation',
  VALIDATE_EMAIL: 'validateEmail',
  FORGOTTEN_PASSWORD: 'forgottenPassword',
  EXPIRED_SOCIAL: 'expiredSocial'
};
module.exports = Cache;

function replace_null_from_string(test, recurse) {
  if (typeof test === 'object' || Array.isArray(test)) {
    for (var i in test) {
      if (test[i] === 'null') {
        test[i] = null;
      } else if (recurse) {
        replace_null_from_string(test[i], recurse);
      }
    }
  }
}

function replace_null_to_string(test, recurse) {
  if (typeof test === 'object' || Array.isArray(test)) {
    for (var i in test) {
      if (test[i] === null) {
        test[i] = 'null';
      } else if (recurse) {
        replace_null_to_string(test[i], recurse);
      }
    }
  }
}