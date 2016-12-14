'use strict';
var UsersModel = require(__dirname + '/../models/users'),
  TeamModel = require(__dirname + '/../models/teams'),
  Replace = require(__dirname +'/../helpers/replace'),
  UserSettingsModel = require(__dirname + '/../models/usersSettings'),
  UserSocialModel = require(__dirname + '/../models/usersSocialNetworks'),
  UserModulesModel = require(__dirname + '/../models/modules'),
  _ = require('lodash'),
  va = require(__dirname + '/../helpers/validator');

var socialNetworks = [UserSocialModel.NETWORKS.FACEBOOK, UserSocialModel.NETWORKS.GOOGLE, UserSocialModel.NETWORKS.TWITTER, UserSocialModel.NETWORKS.LINKEDIN, UserSocialModel.NETWORKS.YOUTUBE, UserSocialModel.NETWORKS.INSTAGRAM, UserSocialModel.NETWORKS.API, UserSocialModel.NETWORKS.EMAIL];

class UsersTeams {

  static * getInvitation(next) {
    var result = va.run(this, va.PATH, {userId: va.number().required(), teammateId: va.number().required()});
    let user = this.state.authUser;
    if (user.id !== result.userId) {
      user = yield UsersModel.getDetailPrivate(result.userId)
    }
    let settings = yield UserSettingsModel.getSettings(result.userId);
    this.body = yield TeamModel.getInvitation(user, settings, result.teammateId);
    return yield next;
  }

  static * sendInvitation(next) {
    var result = va.run(this, [va.PATH, va.BODY], {
      userId: va.number().required(),
      teammateId: va.number().required(),
      hash: va.string().required(),
      subject: va.string().required(),
      content: va.string().required()
    });
    let res = yield TeamModel.createInvitation(result.teammateId, result.hash, result.subject, result.content);
    this.status = (res ? 201 : 200);
    this.body = {success: true};
    return yield next;
  }

  static * saveTemplate(next) {
    var result = va.run(this, [va.PATH, va.BODY], {
      userId: va.number().required(),
      teammateId: va.number().required(),
      hash: va.string().required(),
      subject: va.string().required(),
      content: va.string().required()
    });
    let settings = yield UserSettingsModel.getRawSettings(result.userId);
    yield UserSettingsModel.saveSettings(settings, {
      inviteTemplate: {
        subject: result.subject,
        content: result.content.replace(new RegExp(result.hash, 'g'), '*|HASH|*')
      }
    });
    this.status = 202;
    this.body = {success: true};
    return yield next;
  }

  static * list(next) {
    var result = va.run(this, va.PATH, {userId: va.number().required()});
    let user = this.state.authUser;
    if (user.id !== result.userId) {
      if (['root', 'administrator'].indexOf(user.role) !== -1) {
        /** ROOT */
        user = yield UsersModel.getDetailPrivate(result.userId)
      } else {
        throw new this.app.ZSError('ERROR_PERMISSIONS_REQUIRED', 403, 'You must be administrator');
      }
    } else {
      /** SLAVE */
      if (user.id !== user.masterId) {
        user = yield UsersModel.getDetailPrivate(user.masterId);
      }
    }
    let teammates = yield TeamModel.listTeam(user);
    let modulesCount = yield UserModulesModel.countMyModules(user.id);
    let modules = yield UserModulesModel.getShareStatistics(user.id);
    teammates = teammates.map((teammate) => {
      teammate.image_square = Replace.replaceHttp(teammate.image_square);
      let tmp = teammate.get();
      let shared = 0;
      modules.map((module) => {
        if (module.to_user_id === tmp.id) {
          shared = module.get('count');
        }
      });
      tmp.modules = {shared: shared, available: (modulesCount - shared )};
      return tmp;
    });
    if (this.state.authUser.id !== this.state.authUser.masterId) {
      teammates.push({
        id: user.id,
        fullName: user.Name,
        image_square: Replace.replaceHttp(user.image_square),
        email: user.email,
        company: user.company,
        position: user.position,
        modules: {shared: 0, available: 0}
      });
      teammates = teammates.filter((teammate) => {
        return teammate.id !== this.state.authUser.id;
      })
    }

    this.body = {
      teammates: teammates
    };
    return yield next
  }

  static * listMyTeammates(next) {
    let user = this.state.authUser;
    if (user.id !== user.masterId) {
      user = yield UsersModel.getDetailPrivate(user.masterId)
    }
    let teammates = yield TeamModel.listTeam(user);
    let myTeammates = teammates.map((teammate) => {
      return {id: teammate.id, fullName: teammate.get('fullName'), image: Replace.replaceHttp(teammate.image_square)};
    });
    myTeammates.push({id: user.id, fullName: user.name, image: Replace.replaceHttp(user.image_square), date_logged: user.date_logged});
    this.body = {
      teammates: myTeammates.filter((mate) => {
        return mate.id !== this.state.authUser.id
      })
    };
    return yield next
  }

  static * listTeammatesInWorkspace(next) {
    var result = va.run(this, va.PATH, {workspaceId: va.number().required()});
    let user = this.state.authUser;
    if (user.id !== user.masterId) {
      user = yield UsersModel.getDetailPrivate(user.masterId)
    }
    if(result.workspaceId !== 0) {
      let wss = yield user.getWorkspace();
      if(wss.filter((ws) => {
        return ws.id === result.workspaceId;
      }).length === 0) {
        throw new this.app.ZSError('ERROR_PERMISSIONS_REQUIRED', 403, 'You must be workspace owner or user');
      }
    }

    let teammates = yield UserModulesModel.listTeammatesInWorkspace(result.workspaceId, this.state.authUser.masterId);
    teammates.push({id: user.id, fullName: user.name, image: Replace.replaceHttp(user.image_square), date_logged: user.date_logged});
    this.body = {
      teammates: teammates.filter((mate) => {
        mate.image = Replace.replaceHttp(mate.image);
        return mate.id !== this.state.authUser.id
      })
    };
    return yield next
  }
  
  static * createUser(next) {
    var result = va.run(this, [va.PATH, va.BODY], {
      userId: va.number().required(),
      fullName: va.string().min(3).required(),
      email: va.string().max(255).email().required(),
      company: va.string().optional(),
      position: va.string().optional(),
      image_square: va.uploadedFileUrl().optional()
    });
    let user = this.state.authUser;
    if (user.id !== result.userId) {
      user = yield UsersModel.getDetailPrivate(result.userId)
    }
    try {
      var teammate = yield UsersModel.buildUser(UsersModel.ACCOUNTS.ZOOMSPHERE, UsersModel.STATES.TEMPORARY, result.fullName, null, result.email, null, result.image_square, result.company, result.position);
      teammate.country = user.country;
      teammate.timezone = user.timezone;
      yield teammate.save();
    } catch (err) {
      if (err.name === 'SequelizeUniqueConstraintError') {
        throw new this.app.ZSError('error_email_already_exists', 403, err.errors)
      } else {
        throw err;
      }
    }
    yield TeamModel.createConnection(user, teammate);
    this.state.updated = {id: teammate.id};
    this.status = 201;
    return yield next
  }

  static * updateUser(next) {
    var result = va.run(this, [va.PATH, va.BODY], {
      teammateId: va.number().required(),
      fullName: va.string().min(3).optional(),
      email: va.string().max(255).email().optional(),
      company: va.string().allow('').optional(),
      position: va.string().allow('').optional(),
      image_square: va.uploadedFileUrl().optional()
    });
    let user = yield UsersModel.getDetailPrivate(result.teammateId);
    if (!user) {
      throw new this.app.ZSError('ERROR_REQUIRED_FIELD_MISSING', 404, 'User does not exist');
    }
    if (user.state !== UsersModel.STATES.TEMPORARY && result.email) {
      delete result.email;
    }
    if (result.image_big) {
      result.image_big = result.image_square;
    }
    try {
      yield UsersModel.saveRawUser(user, result);
    } catch (err) {
      if (err.name === 'SequelizeUniqueConstraintError') {
        throw new this.app.ZSError('error_email_already_exists', 403, err.errors)
      } else {
        throw err;
      }
    }
    return yield next
  }

  static * delete(next) {
    var result = va.run(this, va.PATH, {userId: va.number().required(), teammateId: va.number().required()});
    let user = this.state.authUser;
    if (user.id !== result.userId) {
      user = yield UsersModel.getDetailPrivate(result.userId)
    }
    let teammate = yield UsersModel.getDetailPrivate(result.teammateId);
    let removed = yield TeamModel.removeConnection(user, teammate);
    yield UsersModel.delete(teammate);
    if (removed.share) {
      this.status = 202;
      this.body = {success: true}
    } else {
      /** not found */
      throw new this.app.ZSError('ERROR_UNKNOWN', 404)
    }
    return yield next
  }

  static * getPermissions(next) {
    let accs = [];
    var result = va.run(this, va.PATH, {userId: va.number().required(), teammateId: va.number().required()});
    let socialAccounts = yield UserSocialModel.getAccounts(result.userId);
    let sharedAccounts = yield TeamModel.listSharedAccounts(result.teammateId);
    /** transformuji objekt na pole */
    for (var acc in socialAccounts) {
      socialAccounts[acc].map((item) => {
        let page = item.get();
        /** pridam ke kazdemu uctu info o socialni siti a pripadne sdileni z objektu sdilenych uctu */
        page.network = acc;
        let shared = sharedAccounts[acc].filter((sharedAccount)=> {
          return sharedAccount.id === page.id
        });
        page.image = Replace.replaceHttp(page.image);
        page.shared = !!shared.length;
        if (['youtube', 'instagram', 'api'].indexOf(acc) !== -1) {
          page.permissions = permissionsToFront(page.shared ? shared[0].grant : null, {});
        } else {
          page.permissions = permissionsToFront(page.shared ? shared[0].grant : null, {reply: '', publisher: ''});
        }
        accs.push(page);
      });
    }
    let user = yield UsersModel.getDetailPublic(result.teammateId);
    this.body = {
      modules: user.modules,
      accounts: accs
    };
    return yield next;
  }

  static * savePermissions(next) {
    var result = va.run(this, [va.PATH, va.BODY], {
      userId: va.number().required(),
      teammateId: va.number().required(),
      modules: {
        crm: va.boolean().required(),
        report: va.boolean().required(),
        create_module: va.boolean().required()
      },
      accounts: va.array().items(
        va.object({
          id: va.number().required(),
          shared: va.boolean().required(),
          network: va.string().valid(socialNetworks).required(),
          permissions: va.object({
            reply: va.string().valid('reply_editor', 'reply_operator', 'reply_manager', ''),
            publisher: va.string().valid('publisher', 'publisher_editor', 'publisher_client', '')
          }).unknown().required()
        }).required()).required()
    });
    let user = yield UsersModel.getDetailPrivate(result.teammateId);
    let userInfo = JSON.parse(user.userInfo) || {};
    userInfo.modules = _.mapValues(result.modules, (mod) => {
      return mod ? 1 : 0;
    });
    yield TeamModel.deleteAllSharedAccounts(result.userId, result.teammateId);
    yield TeamModel.insertSharedAccounts(result.userId, result.teammateId, result.accounts.map((acc) => {
      acc.permissions = permissionsToDB(acc.permissions);
      return acc;
    }));
    user.userInfo = JSON.stringify(userInfo);
    yield user.save();
    this.status = 202;
    return yield next;
  }

  static * getModules(next) {
    var result = va.run(this, va.PATH, {userId: va.number().required(), teammateId: va.number().required()});
    this.body = {modules: yield UserModulesModel.listMySharedModules(result.userId, result.teammateId)};
    return yield next;
  }

  static * saveModules(next) {
    var result = va.run(this, [va.PATH, va.BODY], {
      userId: va.number().required(), teammateId: va.number().required(), modules: va.array().items({
        id: va.number().required(),
        shared: va.boolean().required()
      }).required()
    });
    yield UserModulesModel.saveSharedModules(result.userId, result.teammateId, result.modules);
    this.status = 202;
    return yield next;
  }

}

module.exports = UsersTeams;

function permissionsToFront(permissions, newPermissions) {
  if (permissions) {
    Object.keys(permissions).forEach((key) => {
      if (permissions[key] === 1) {
        let newKey = key.split('_');
        newPermissions[newKey[0]] = key;
      }
    });
  }
  return newPermissions;
}

function permissionsToDB(permissions) {
  let newPermissions = {
    'reply_editor': 0,
    'reply_operator': 0,
    'reply_manager': 0,
    'publisher': 0,
    'publisher_editor': 0,
    'publisher_client': 0
  };
  if (permissions) {
    Object.keys(permissions).forEach((type) => {
      if (permissions[type] !== '') {
        newPermissions[permissions[type]] = 1;
      }
    });
  }
  return newPermissions;
}