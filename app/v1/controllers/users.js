'use strict';
var UsersModel = require(__dirname + '/../models/users'),
  ModulesModel = require(__dirname + '/../models/modules'),
  SocialModel = require(__dirname + '/../models/usersSocialNetworks'),
  WorkspaceModel = require(__dirname + '/../models/workspaces'),
  mailer = require(__dirname + '/../helpers/mailer'),
  cache = require(__dirname + '/../models/cache'),
  sha1 = require('sha1'),
  koaMap = require('koa-map'),
  va = require(__dirname + '/../helpers/validator'),
  CountryLanguage = require('country-language'),
  promisify = require('es6-promisify'),
  request = require('request');

request = promisify(request);
CountryLanguage.getCountryLanguages = promisify(CountryLanguage.getCountryLanguages);
CountryLanguage.getLanguage = promisify(CountryLanguage.getLanguage);

class Users {

  static * detail(next) {
    var result = va.run(this, va.PATH, {userId: va.number().required()});
    let user;
    if (result.userId === this.state.authUser.id) {
      user = UsersModel.parsePublic(this.state.authUser, this.state.authUsersMaster)
    } else {
      user = yield UsersModel.getDetailPublic(result.userId);
    }
    this.body = {
      user: user,
      statistics: {
        modules: yield ModulesModel.getStatistics(result.userId),
        social: yield SocialModel.getStatistics(result.userId)
      },
      workspaces: yield WorkspaceModel.listWorkspaces(result.userId, user.masterId)
    };
    this.status = 200;
    return yield next
  }

  static * me(next) {
    this.params.userId = this.state.authUser.id;
    return yield next;
  }

  static * switch(next) {
    var result = va.run(this, va.PATH, {userId: va.number().required(), teammateId: va.number().required()});
    let user = yield UsersModel.getDetailPrivate(result.teammateId);
    if (user) {
      if (user.state === UsersModel.STATES.DELETED) {
        throw new this.app.ZSError('error_account_deleted', 401)
      }
      this.passport = {user: user};
    } else {
      throw new this.app.ZSError('ERROR_LOGIN_INCORRECT', 401)
    }
    return yield next
  }

  static * activate(next) {
    var result = va.run(this, [va.PATH, va.BODY], {
      userId: va.number().required(),
      password: va.string().allow('').regex(/^[a-zA-Z0-9]{5,200}$/).optional()
    });
    let user = yield UsersModel.getDetailPrivate(result.userId);
    if (user.state === UsersModel.STATES.TEMPORARY) {
      result.state = UsersModel.STATES.COMPLETED;
      if (user.account === UsersModel.ACCOUNTS.ZOOMSPHERE) {
        if (!result.password) {
          throw new this.app.ZSError('ERROR_REQUIRED_FIELD_MISSING', 403, 'Password is required')
        }
      }
      yield UsersModel.saveUser(user, result);
    }
    this.body = {user: yield UsersModel.getDetailPublic(result.userId)};
    return yield next
  }

  /**
   * TODO zprehlednit
   * TODO timezone z ciselniku
   * TODO zeme z ciselniku
   */
  static * update(next) {
    var schema = va.object({
      userId: va.number().required(),
      fullName: va.string().min(3).optional(),
      password: va.string().allow('').regex(/^[a-zA-Z0-9]{5,200}$/).optional(),
      email: va.string().email().optional(),
      country: va.string().alphanum().min(2).max(2).optional(),
      timezone: va.string().optional(),
      about: va.string().allow('').max(255).optional(),
      signature: va.string().allow('').max(255).optional(),
      company: va.string().allow('').optional(),
      position: va.string().allow('').optional(),
      image_big: va.uploadedFileUrl().optional(),
      image_square: va.uploadedFileUrl().optional()
    }).min(2);
    var result = va.run(this, [va.PATH, va.BODY], schema);
    let user = yield UsersModel.getDetailPrivate(result.userId);
    if (user.state === UsersModel.STATES.UNCOMPLETED) {
      if (result.fullName && result.country && result.timezone && result.email) {
        if (user.account === UsersModel.ACCOUNTS.ZOOMSPHERE || user.account === UsersModel.ACCOUNTS.TWITTER || ((user.account === UsersModel.ACCOUNTS.FACEBOOK || user.account === UsersModel.ACCOUNTS.GOOGLE) && result.email !== user.email)) {
          if (result.email !== user.email) {
            user.email = result.email
          }
          result.hash = sha1(Math.random() + user.email).substr(0, 10);
          result.state = UsersModel.STATES.UNCONFIRMED;
        } else {
          result.state = UsersModel.STATES.COMPLETED;
        }
      }
    } else if (user.state === UsersModel.STATES.TEMPORARY || user.state === UsersModel.STATES.FORGOTTEN_PASSWORD) {
      if (user.account === UsersModel.ACCOUNTS.ZOOMSPHERE) {
        if (!result.password) {
          throw new this.app.ZSError('ERROR_REQUIRED_FIELD_MISSING', 403, 'Password is required')
        }
      }
      result.state = UsersModel.STATES.COMPLETED;
    }
    try {
      var res = yield UsersModel.saveUser(user, result);
    } catch (err) {
      if (err.name === 'SequelizeUniqueConstraintError') {
        throw new this.app.ZSError('error_email_already_exists', 403, err.errors)
      } else {
        throw err;
      }
    }
    if (res.state === UsersModel.STATES.UNCONFIRMED && result.hash) {
      yield mailer.sendValidation(user.email, result.hash, user.name);
    }
    this.body = {user: yield UsersModel.getDetailPublic(result.userId)};
    return yield next
  }

  static * create(next) {
    this.status = 201;
    this.body = yield Promise.resolve("Users create!");
    return yield next
  }

  static * delete(next) {
    if (this.params.userId == this.state.authUser.id) {
      yield UsersModel.delete(this.state.authUser);
    } else {
      /** delete from team */
    }
    this.body = {success: true};
    return yield next
  }

  static * sendEmailValidation(next) {
    var result = va.run(this, [va.PATH, va.BODY], {email: va.string().required(), userId: va.number().required()});
    var user = this.state.authUser;
    let boostProtection = yield cache.get(cache.SPACES.VALIDATE_EMAIL, result.email);
    if (!boostProtection) {
      if (result.userId !== this.state.authUser.id) {
        user = yield UsersModel.getDetailPrivate(result.userId);
      }
      if (result.email !== user.email || user.state === UsersModel.STATES.UNCONFIRMED) {
        let exists = yield UsersModel.getDetailByEmail(result.email);
        if (exists && exists.id !== user.id) {
          throw new this.app.ZSError('error_email_already_exists', 401);
        }
        user.email = result.email;
        user.state = UsersModel.STATES.UNCONFIRMED;
        user.hash = sha1(Math.random() + user.email).substr(0, 10);
        yield user.save();
        let info = yield mailer.sendValidation(result.email, user.hash, user.name);
        console.info(info.response);
        this.status = 201;
      } else {
        this.status = 304;
      }
    } else {
      this.status = 200;
    }
    this.body = {success: true};
    return yield next
  }

  static * getMyClients(next) {
    this.body = {clients: yield UsersModel.listMyClients(this.state.authUser.id)};
    return yield next;
  }

  static * addMyClient(next) {
    var result = va.run(this, va.BODY, {id: va.number().required(), fullName: va.string().optional()});
    this.body = {clients: yield UsersModel.addMyClient(this.state.authUser.id, result.id, result.fullName || null)};
    this.status = 201;
    return yield next;
  }

  static * changeTariff(next) {
    let result = va.run(this, [va.BODY,va.PATH], {userId: va.number().required(), date: va.date().format('YYYY-MM-DD HH:mm:SS').required()});
    let user = yield UsersModel.getDetailPublic(result.userId);
    if(user.id === user.masterId) {
      yield UsersModel.setTariff(result.userId, result.date);
      this.body = {success: true};
    } else {
      throw new this.app.ZSError('error_master_only_config', 401);
    }
    return yield next;
  }

  static * setTrial(next) {
    let result = va.run(this, [va.BODY,va.PATH], {userId: va.number().required(), demo: va.date().format('YYYY-MM-DD HH:mm:SS').required()});
    let user = yield UsersModel.getDetailPublic(result.userId);
    if (user.id === user.masterId) {
      yield UsersModel.updateTrialAccount(result.userId, result.demo);
      this.body = {success: true};
    } else {
      throw new this.app.ZSError('error_master_only_config', 401);
    }
    return yield next;
  }

  static * deleteMyClient(next) {
    var result = va.run(this, va.PATH, {clientId: va.number().required()});
    this.body = {clients: yield UsersModel.deleteMyClient(this.state.authUser.id, result.clientId)};
    this.status = 202;
    return yield next;
  }

  static * getWorkspaceModules(next) {
    var result = va.run(this, va.PATH, {userId: va.number().required(), workspaceId: va.number().required()});
    if (result.workspaceId === 0) {
      result.workspaceId = null;
    }
    this.body = {modules: yield ModulesModel.listWorkspaceModules(result.userId, result.workspaceId)};
    return yield next;
  }

  static * getModule(next) {
    var result = va.run(this, va.PATH, {userId: va.number().required(), moduleId: va.number().required()});
    this.body = {module: yield ModulesModel.getModule(result.userId, result.moduleId)};
    if (!this.body.module) {
      throw new this.app.ZSError('error_not_found', 404);
    }
    return yield next;
  }

  static * updateModule(next) {
    var result = va.run(this, [va.PATH, va.BODY], BASE_MODULE_VALIDATION_SCHEMA.keys({
      userId: va.number().required(),
      moduleId: va.number().required()
    }));
    var module = yield ModulesModel.updateModule(result.userId, result.moduleId, result.name, result.module, result.label, result.settings,
      result.sharedWith);
    if (!module) {
      throw new this.app.ZSError('error_not_found', 404);
    }
    return yield next;
  }

  static * createModule(next) {
    let userId = this.state.authUser.id;
    var result = va.run(this, va.BODY, BASE_MODULE_VALIDATION_SCHEMA.keys({workspaceId: va.number()}));
    let workspaceId = result.workspaceId || null; // This converts id 0 of default workspace to null as stored in database
    var module = yield ModulesModel.createModule(userId, workspaceId, result.name, result.module, result.label, result.settings,
      result.sharedWith);
    this.body = {module: yield ModulesModel.getModule(userId, module.id)};
    return yield next;
  }

  static * listModules(next) {
    var result = va.run(this, va.PATH, {userId: va.number().required()});
    if (result.workspaceId === 0) {
      result.workspaceId = null;
    }
    let modules = yield ModulesModel.listModules(result.userId);
    let wss = yield WorkspaceModel.listWorkspaces(this.state.authUser.id, this.state.authUser.masterId);

    this.body = {
      modules: modules.map((module) => {
        let myWS = wss.filter((ws)=> {
          return module.workspace_id == ws.id;
        });
        module.workspace_name = myWS[0] ? myWS[0].name : '';
        return module;
      })
    };
    return yield next;
  }

  static * sortModules(next) {
    var result = va.run(this, [va.PATH, va.BODY], {
      userId: va.number().required(),
      modules: va.array().items({id: va.number().required(), sharedBy: va.string().optional()})
    });
    yield ModulesModel.sortModules(result.userId, result.modules);
    return yield next;
  }

  static * getUserPaying(next) {
    this.body = {users: yield UsersModel.listUserPaying()};
    return yield next;
  }

  static * listModulesQueryLanguages(next) {
    let resp = yield request({
      headers: {'content-type': 'application/json'},
      url: process.env.MONITORING_API_DOMAIN + '/administration/accepted-languages'
    });
    let langs = JSON.parse(resp[1]).data.languages;
    let defaultLang = 'en';
    let spokenLang = yield CountryLanguage.getCountryLanguages(this.state.authUser.country);
    if (spokenLang && spokenLang[0] && langs.indexOf(spokenLang[0].iso639_1) !== -1) {
      defaultLang = spokenLang[0].iso639_1
    }
    this.body = {
      languages: yield koaMap.mapLimit(langs, 40, function*(lang) {
        let data = yield CountryLanguage.getLanguage(lang);
        if (lang == defaultLang) {
          return {code: lang, name: data.name[0], default: true}
        } else {
          return {code: lang, name: data.name[0]}
        }
      })
    };
    return yield next;
  }

  static * findUser(next) {
    var result = va.run(this, [va.BODY], {
      query: va.string(),
      type: va.findUserTypeFilter(),
      country: va.string().length(2),
      master_only: va.boolean(),
      order: va.findUserOrderFilter(),
      from: va.number().default(0),
      limit: va.number().default(100)
    });

    this.body = yield UsersModel.findUser(result);
    return yield next;
  }
}

module.exports = Users;

const BASE_MODULE_VALIDATION_SCHEMA = va.object().keys({
  name: va.string().min(1).max(40).required(),
  module: va.any().valid(ModulesModel.MODULE_TYPES).required(),
  label: ['', va.string().max(20)],
  settings: va.any().required(),
  sharedWith: va.array().items(va.number()).required()
});