'use strict';
var jwt = require('jsonwebtoken'),
  uuid = require('node-uuid'),
  Joi = require('joi'),
  ZSError = require('zs-error'),
  mailer = require(__dirname + '/../helpers/mailer'),
  UsersModel = require(__dirname + '/../models/users'),
  TeamsModel = require(__dirname + '/../models/teams'),
  SociaNetworksModel = require(__dirname + '/../models/usersSocialNetworks'),
  Twitter = require(__dirname + '/../helpers/twitter'),
  Facebook = require(__dirname + '/../helpers/facebook'),
  Google = require(__dirname + '/../helpers/google'),
  Youtube = require(__dirname + '/../helpers/youtube'),
  Instagram = require(__dirname + '/../helpers/instagram'),
  Linkedin = require(__dirname + '/../helpers/linkedin'),
  va = require(__dirname + '/../helpers/validator'),
  cache = require(__dirname + '/../models/cache'),
  endpointCache = require(__dirname + '/../helpers/endpointCache'),
  render = require('../render'),
  moment = require('moment'),
  sha1 = require('sha1'),
  qs = require('qs');

var secretKey = process.env.JWT_SECRET_KEY;

class Auth {

  static * twitterRequest(next) {
    var result = va.run(this, va.QUERY, {callback: va.string().required()});
    var res = yield Twitter.generateRequestUrl();
    yield cache.save(cache.SPACES.CALLBACKS, res.csfr, {
      callback: result.callback,
      userId: this.params.userId || null,
      secret: res.secret
    }, 3600);
    this.body = {redirectUrl: res.url};
    return yield next;
  }

  static * twitterCallback(next) {
    var params = qs.parse(this.request.querystring);
    var result = Joi.validate(params, {
      oauth_token: Joi.string().required(),
      oauth_verifier: Joi.string().required()
    }, {stripUnknown: true});
    if (result.error) {
      console.warn(result.error);
      if (params.denied) {
        let res = yield cache.get(cache.SPACES.CALLBACKS, params.denied, {delete: true});
        return this.response.redirect(res.callback + '/error');
      }
      throw new this.app.ZSError('ERROR_REQUIRED_FIELD_MISSING', 401, result.error.details);
    }
    let info = yield cache.get(cache.SPACES.CALLBACKS, params.oauth_token, {delete: true});

    if (info.userId) {
      /** social connect */
      try {
        this.passport = yield Twitter.validateCallback(params.oauth_token, params.oauth_verifier, info.secret);
        let res = yield SociaNetworksModel.createAccount(info.userId, this.passport.user.id, SociaNetworksModel.NETWORKS.TWITTER, this.passport.user.displayName, this.passport.user.token, this.passport.user.photos[0]);
        this.response.redirect(info.callback + '/success/' + res.id);
      } catch (err) {
        console.warn(err);
        this.response.redirect(info.callback + '/error');
      }
    } else {
      /** create new account  */
      this.passport = yield Twitter.validateCallback(params.oauth_token, params.oauth_verifier, info.secret);
      this.state.redirect = info.callback;
      return yield next;
    }
  }

  static * validateToken(next) {
    var result = va.run(this, va.BODY, {token: va.string().min(9).required()});
    var userId = yield TeamsModel.validateInvitation(result.token);
    if (!userId) {
      userId = yield UsersModel.validateEmail(result.token);
    }
    if (userId) {
      this.passport = {user: yield UsersModel.getDetailPrivate(userId)};
    } else {
      throw new this.app.ZSError('ERROR_AUTH_LINK_INVALID', 401);
    }
    return yield next;
  }

  static * tokenCallback(next) {
    var result = va.run(this, va.BODY, {publicToken: va.string().required()});
    let data = yield cache.get(cache.SPACES.TEMP_TOKENS, result.publicToken, {delete: true});
    if (data) {
      this.body = data;
    } else {
      throw new this.app.ZSError('ERROR_LOGIN_INCORRECT', 401);
    }
    return yield next;
  }

  static * youtubeRequest(next) {
    var result = va.run(this, va.QUERY, {callback: va.string().required()});
    let csfr = sha1(Math.random() + result.callback);
    yield cache.save(cache.SPACES.CALLBACKS, csfr, {
      callback: result.callback,
      userId: this.params.userId || null,
      secret: csfr
    }, 3600);
    var url = yield Youtube.generateRequestUrl(csfr);
    this.body = {redirectUrl: url};
    return yield next;
  }

  static * googleRequest(next) {
    var result = va.run(this, va.QUERY, {callback: va.string().required()});
    let csfr = sha1(Math.random() + result.callback);
    yield cache.save(cache.SPACES.CALLBACKS, csfr, {
      callback: result.callback,
      userId: this.params.userId || null,
      secret: csfr
    }, 3600);
    var url = yield Google.generateRequestUrl(csfr);
    this.body = {redirectUrl: url};
    return yield next;
  }

  static * youtubeCallback() {
    var result = Joi.validate(qs.parse(this.request.querystring), {
      code: Joi.string().required(),
      state: Joi.string().required()
    }, {stripUnknown: true});
    let info = yield cache.get(cache.SPACES.CALLBACKS, result.value.state, {delete: true});
    if (!info) {
      throw new this.app.ZSError('ERROR_LOGIN_INCORRECT', 403);
    }

    if (result.error || !info.userId) {
      console.warn(result.error);
      return this.response.redirect(info.callback + '/error');
    }

    try {
      let channel = yield Youtube.validateCallback(result.value.code);
      let res = yield SociaNetworksModel.createYoutubeChannel(info.userId, channel);
      this.response.redirect(info.callback + '/success/' + res.id);
    } catch (err) {
      console.warn(err);
      this.response.redirect(info.callback + '/error');
    }

  }

  static * googleCallback(next) {
    var result = Joi.validate(qs.parse(this.request.querystring), {
      code: Joi.string().required(),
      state: Joi.string().required()
    }, {stripUnknown: true});
    let info = yield cache.get(cache.SPACES.CALLBACKS, result.value.state, {delete: true});
    if (!info) {
      throw new this.app.ZSError('ERROR_LOGIN_INCORRECT', 403);
    }

    if (result.error) {
      console.warn(result.error);
      return this.response.redirect(info.callback + '/error');
    }

    if (info.userId) {
      /** social connect */
      try {
        this.passport = yield Google.validateCallback(result.value.code);
        let res = yield SociaNetworksModel.createAccount(info.userId, this.passport.user.id, SociaNetworksModel.NETWORKS.GOOGLE, this.passport.user.displayName, this.passport.user.token, this.passport.user.photos[0]);
        this.response.redirect(info.callback + '/success/' + res.id);
      } catch (err) {
        console.warn(err);
        this.response.redirect(info.callback + '/error');
      }
    } else {
      /** create new account  */
      this.passport = yield Google.validateCallback(result.value.code);
      this.state.redirect = info.callback;
      return yield next;
    }
  }

  static * facebookRequest(next) {
    var result = va.run(this, va.QUERY, {callback: va.string().required()});
    let csfr = sha1(Math.random() + result.callback);
    var res = yield Facebook.generateRequestUrl(csfr);
    yield cache.save(cache.SPACES.CALLBACKS, csfr, {
      callback: result.callback,
      userId: this.params.userId || null,
      secret: csfr
    }, 3600);
    this.body = {redirectUrl: res.url};
    return yield next;
  }

  static * facebookCodeCallback(next) {
    var result = Joi.validate(qs.parse(this.request.querystring), {
      code: Joi.string().required(),
      state: Joi.string().required()
    }, {stripUnknown: true});
    let info = yield cache.get(cache.SPACES.CALLBACKS, result.value.state, {delete: true});
    if (!info) {
      throw new this.app.ZSError('ERROR_LOGIN_INCORRECT', 403);
    }

    if (result.error) {
      console.warn(result.error);
      return this.response.redirect(info.callback + '/error');
    }

    if (info.userId) {
      /** social connect */
      try {
        this.passport = yield Facebook.validateCode(result.value.code);
        let res = yield SociaNetworksModel.createAccount(info.userId, this.passport.user.id, SociaNetworksModel.NETWORKS.FACEBOOK, this.passport.user.displayName, this.passport.user.token, this.passport.user.photos[0]);
        this.response.redirect(info.callback + '/success/' + res.id);
      } catch (err) {
        console.warn(err);
        this.response.redirect(info.callback + '/error');
      }
    } else {
      /** create new account  */
      this.passport = yield Facebook.validateCode(result.value.code);
      this.state.redirect = info.callback;
      return yield next;
    }
  }

  static * facebookCallback(next) {
    var result = va.run(this, va.BODY, {accessToken: va.string().required(), userId: va.number()});
    this.passport = yield Facebook.validateCallback(result.accessToken);
    return yield next;
  }

  static * zoomsphereCallback(next) {
    var result = va.run(this, va.BODY, {
      email: va.string().min(4).required(),
      password: va.string().regex(/^[a-zA-Z0-9]{5,200}$/).required()
    });
    let user = yield UsersModel.getDetailByEmailOrUsernameAndPasswordPrivate(result.email, result.password);
    if (user) {
      if (user.state === UsersModel.STATES.DELETED) {
        throw new this.app.ZSError('ERROR_ACCOUNT_DELETED', 401)
      }
      this.passport = {user: user};
      return yield next
    } else {
      throw new this.app.ZSError('ERROR_LOGIN_INCORRECT', 401)
    }
  }

  static * linkedinCallback(next) {
    var result = va.run(this, va.QUERY, {
      code: va.string().required(),
      state: va.string().required()
    });
    let info = yield cache.get(cache.SPACES.CALLBACKS, result.state, {delete: true});
    try {
      let account = yield Linkedin.validateCallback(result.code, result.state);
      let res = yield SociaNetworksModel.createAccount(info.userId, account.user.id, SociaNetworksModel.NETWORKS.LINKEDIN, account.user.displayName, account.user.token, account.user.photos[0], account.user.expiresAt);
      this.response.redirect(info.callback + '/success/' + res.id);
    } catch (err) {
      console.warn(err);
      this.response.redirect(info.callback + '/error');
    }
    yield next
  }

  static * linkedinRequest(next) {
    var result = va.run(this, va.QUERY, {callback: va.string().required()});
    let csfr = sha1(Math.random() + result.callback);
    yield cache.save(cache.SPACES.CALLBACKS, csfr, {callback: result.callback, userId: this.params.userId}, 3600);
    var url = yield Linkedin.generateRequestUrl(csfr);
    this.body = {redirectUrl: url};
    return yield next;
  }

  static * instagramRequest(next) {
    var result = va.run(this, va.QUERY, {callback: va.string().required()});
    let csfr = sha1(Math.random() + result.callback);
    yield cache.save(cache.SPACES.CALLBACKS, csfr, {callback: result.callback, userId: this.params.userId}, 3600);
    var url = yield Instagram.generateRequestUrl(csfr);
    this.body = {redirectUrl: url};
    return yield next;
  }

  static * instagramCallback() {
    var result = va.run(this, va.QUERY, {
      code: va.string().required(),
      state: va.string().required()
    });
    let info = yield cache.get(cache.SPACES.CALLBACKS, result.state, {delete: true});
    try {
      let account = yield yield Instagram.validateCallback(result.code);
      let res = yield SociaNetworksModel.createAccount(info.userId, account.user.id, SociaNetworksModel.NETWORKS.INSTAGRAM, account.user.displayName, account.user.token, account.user.photos[0]);
      this.response.redirect(info.callback + '/success/' + res.id);
    } catch (err) {
      console.warn(err);
      this.response.redirect(info.callback + '/error');
    }
  }

  static * isAuthenticated(next) {
    if (this.req.method === 'OPTIONS') {
      return yield next;
    }
    let authRes = Auth.verifyApikey(this.headers.apikey);
    if (this.req.method === 'GET' && (!this.headers.cache || this.headers.cache !== 'false')) {
      let cachedData = yield endpointCache.get(authRes.masterId, authRes.id, this.headers, this.request.originalUrl);
      if (cachedData) {
        this.body = {
          data: JSON.parse(cachedData.data),
          frontend: JSON.parse(cachedData.frontend),
          fromCache: true,
          datetime: cachedData.datetime,
          status: Number(cachedData.status)
        };
        return;
      }
    }
    let identity = yield Auth.getUserByApitoken(authRes.apitoken, this.app.ZSError);
    this.state.authUser = identity.user;
    this.state.authUsersMaster = identity.master;
    if (this.state.authUser.state === UsersModel.STATES.DELETED) {
      throw new this.app.ZSError('ERROR_ACCOUNT_DELETED', 401)
    }
    let now = moment();
    if (now.diff(moment(this.state.authUser.date_logged || 0).add(5, 'm')) > 0 && !(this.headers.server && this.headers.server === 'true')) {
      this.state.authUser.set({date_logged: new Date()});
      yield UsersModel.saveUser(this.state.authUser)
    }
    return yield next;
  }

  static verifyApikey(apikey) {
    try {
      var decoded = jwt.verify(apikey, secretKey);
    } catch (err) {
      throw new ZSError('ERROR_INVALID_AUTH_TOKEN', 401)
    }
    return decoded;
  }

  static * getUserByApitoken(apitoken, ZSError) {
    let res = yield UsersModel.getDetailPrivateByApitoken(apitoken);
    if (res && res.user) {
      return res;
    } else {
      throw new ZSError('ERROR_LOGIN_INCORRECT', 401)
    }
  }

  /**
   * generate token and save it to user's record in db
   */
  static * createToken(user) {

    if (!user.apitoken) {
      user.apitoken = uuid.v4();
      yield user.save({fields: ['apitoken']})
    }
    let userObj = yield UsersModel.getDetailPublic(user.id);
    /** Je potreba mazat kes, hlavne kvuli endpointu POST /auth/validate,
     * ale take pokud bude mit uzivatel problem s kesovanim, staci se odhlasit a znovu prihlasit */
    yield endpointCache.flushUser(userObj.masterId, userObj.id);
    return jwt.sign({apitoken: user.apitoken, id: userObj.id, masterId: userObj.masterId}, secretKey, {expiresIn: process.env.JWT_SECRET_EXPIRESIN});
  }

  static * signUp(next) {
    var result = va.run(this, va.BODY, {
      email: va.string().email().required(),
      password: va.string().regex(/^[a-zA-Z0-9]{5,200}$/).required()
    });
    try {
      var user = yield UsersModel.buildUser(UsersModel.ACCOUNTS.ZOOMSPHERE, UsersModel.STATES.UNCOMPLETED, '', result.password.toString(), result.email, null, null);
      this.body = {apikey: yield Auth.createToken(user), userId: user.id};
      return yield next;
    } catch (err) {
      if (err.name === 'SequelizeUniqueConstraintError') {
        throw new this.app.ZSError('ERROR_EMAIL_ALREADY_EXISTS', 403)
      } else {
        throw err;
      }
    }
  }

  static * loginZoomSphere(next) {
    this.body = {apikey: yield Auth.createToken(this.passport.user), userId: this.passport.user.id};
    yield next
  }

  static * loginOrSignUpSocial(next) {
    var user = yield UsersModel.findOrCreateUser(this.passport.user.provider.toString(), this.passport.user.displayName, this.passport.user.id, this.passport.user.photos[0], this.passport.user.email);
    if (user.state === UsersModel.STATES.DELETED) {
      if (this.state.redirect) {
        this.state.redirect = this.state.redirect + '/error';
        this.response.redirect(this.state.redirect)
      } else {
        throw new this.app.ZSError('ERROR_ACCOUNT_DELETED', 401)
      }
    } else {
      yield SociaNetworksModel.createAccount(user.id, this.passport.user.id, this.passport.user.provider.toString(), this.passport.user.displayName, this.passport.user.token, this.passport.user.photos[0], this.passport.user.expiresAt || null, this.passport.user.info || null);
      if (this.state.redirect) {
        let publicToken = sha1(Math.random() + user.id);
        yield cache.save(cache.SPACES.TEMP_TOKENS, publicToken, {apikey: yield Auth.createToken(user), userId: user.id}, 120);
        this.state.redirect = this.state.redirect + '/' + publicToken;
        this.response.redirect(this.state.redirect)
      } else {
        this.body = {apikey: yield Auth.createToken(user), userId: user.id};
        return yield next
      }
    }
  }

  static * forgottenPassword(next) {
    var result = va.run(this, va.BODY, {email: va.string().email().required()});
    let user = yield UsersModel.getDetailByEmail(result.email);
    if (user) {
      if (user.account === UsersModel.ACCOUNTS.ZOOMSPHERE) {
        let boostProtection = yield cache.get(cache.SPACES.FORGOTTEN_PASSWORD, result.email);
        if (!boostProtection) {
          user.hash = sha1(Math.random() + user.email).substr(0, 9);
          yield user.save();
          yield mailer.sendForgottenPassword(user.email, user.hash, user.name);
        }
        this.body = {success: true};
      } else {
        this.body = {account: user.account};
      }
    } else {
      throw new this.app.ZSError('ERROR_USER_NOT_FOUND', 404)
    }
    return yield next;
  }
}
module.exports = Auth;