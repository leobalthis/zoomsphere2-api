'use strict';
var va = require(__dirname + '/../helpers/validator'),
  usersModel = require(__dirname + '/../models/users'),
  endpointCacheHelper = require(__dirname + '/../helpers/endpointCache');

class EndpointCache {

  static * flushUser(next) {
    var result = va.run(this, [va.PATH], {
      userId: va.number().required()
    });
    let user = yield usersModel.getDetailPublic(result.userId);
    if (user) {
      this.headers.cache = 'false';
      yield endpointCacheHelper.flushUser(user.masterId, result.userId);
    } else {
      throw new this.app.ZSError('ERROR_NOT_FOUND', 404);
    }
    this.body = {success: true};
    return yield next;
  }

  static * flushTeam(next) {
    var result = va.run(this, [va.PATH], {
      masterId: va.number().required()
    });
    this.headers.cache = 'false';
    yield endpointCacheHelper.flushTeam(result.masterId);
    this.body = {success: true};
    return yield next;
  }

  static * flushTeamCache(next) {
    this.headers.cache = 'false';
    yield endpointCacheHelper.flushTeam(this.state.authUser.masterId);
    return yield next;
  }

  static * doNotCache(next) {
    this.headers.cache = 'false';
    return yield next;
  }

  static * onChangeFlushTeamCache(next) {
    /** POKUD je POST, PUT, DELETE, ale neni to jedna z vyjmenovanych route, pak vymaz kese */
    if (['POST', 'PUT', 'DELETE'].indexOf(this.req.method) !== -1 && ['chat', 'external-profile', 'switch', 'find', 'sendValidation', 'upload', 'cache', 'monitoring', 'list-posts'].filter((path) => {
        return this.request.originalUrl.indexOf(path) !== -1
      }).length === 0) {
      yield endpointCacheHelper.flushTeam(this.state.authUser.masterId);
    }
    return yield next;
  }

  static * saveResult(next) {
    if (this.req.method === 'GET' && (!this.headers.cache || this.headers.cache !== 'false')) {
      yield next;
      if (this.body && !this.body.fromCache && (!this.headers.cache || this.headers.cache !== 'false') && this.state.authUser && this.state.authUser.masterId) {
        let toCache = {};
        for (let key in this.body) {
          if (key === 'data' || key === 'frontend') {
            toCache[key] = JSON.stringify(this.body[key]);
          } else {
            toCache[key] = this.body[key];
          }
        }
        yield endpointCacheHelper.save(this.state.authUser.masterId, this.state.authUser.id, this.headers, this.request.originalUrl, toCache);
      }
    } else {
      return yield next;
    }
  }
}
module.exports = EndpointCache;