'use strict';
var sequelize = require('sequelize'),
  sha1 = require('sha1'),
  koaMap = require('koa-map'),
  mailer = require(__dirname + '/../helpers/mailer'),
  Replace = require(__dirname + '/../helpers/replace'),
  UsersSettingsModel = require(__dirname + '/usersSettings'),
  db = require(__dirname + '/../../../services').db,
  UserSchema = db.import(__dirname + '/../schemas/user'),
  ModulesSchema = db.import(__dirname + '/../schemas/ec_module'),
  ShareModulesSchema = db.import(__dirname + '/../schemas/share_ec_module'),
  Utils = require(__dirname + '/../helpers/utils');

class Modules {

  static * getStatistics(userId) {
    var statistics = {
      total: 0
    };
    let modules = yield ModulesSchema.findAll({
      attributes: ['module', [sequelize.fn('count', '1'), 'count']],
      where: {user_id: userId},
      group: 'module'
    });

    modules.map((row)=> {
      statistics[row.module] = row.get('count');
      statistics.total = statistics.total + row.get('count');
    });
    return statistics;
  }

  static * getShareStatistics(userId) {
    return yield ShareModulesSchema.findAll({
      attributes: ['to_user_id', [sequelize.fn('count', '1'), 'count']],
      where: {from_user_id: userId},
      group: 'to_user_id'
    });
  }

  static * countMyModules(userId) {
    return yield ModulesSchema.count({where: {user_id: userId}});
  }

  static * getModule(userId, moduleId) {
    /** muj vlastni modul */
    let module = yield ModulesSchema.findOne({
      attributes: ['id', 'name', 'label', 'module', 'settings', 'sort', ['workspace_id', 'workspaceId']],
      where: {user_id: userId, id: moduleId}
    });
    if (module) {
      let modules = yield sharedWith([module], userId);
      module = modules[0];
    } else {
      /** me nasdileny modul */
      module = yield db.query(
        ' (SELECT m.id, m.name, m.label, m.module, m.settings, from_user_id, m.workspace_id' +
        ' FROM share_ec_module sm' +
        ' JOIN ec_module m ON m.id = sm.ec_module_id' +
        ' WHERE to_user_id = $userId AND m.id = $moduleId)', {
          bind: {userId: userId, moduleId: moduleId},
          type: sequelize.QueryTypes.SELECT
        });

      module = module[0] || null;
      if (module) {
        module.sharedBy = yield UserSchema.findOne({
          attributes: ['id', 'name', 'image_square'],
          where: {id: module.from_user_id}
        });
        delete module.from_user_id;
      }
    }
    if (module && module.workspaceId === null) {
      module.workspaceId = 0;
    }
    return parse(module);
  }

  static * updateModule(userId, moduleId, moduleName, moduleType, moduleLabel, settings, sharedWith) {
    let result = yield ModulesSchema.findOne({where: {user_id: userId, id: moduleId}});
    if (!result) {
      return null;
    }
    result.name = moduleName;
    result.module = moduleType;
    result.label = moduleLabel;
    result.settings = JSON.stringify(settings);
    result = yield result.save();
    // update sharing options
    yield ShareModulesSchema.destroy({where: {ec_module_id: moduleId, from_user_id: userId}});
    for (let teammateId of sharedWith) {
      yield ShareModulesSchema.create({ec_module_id: moduleId, from_user_id: userId, to_user_id: teammateId});
    }
    return result;
  }

  static * sortModules(userId, modules) {
    let sort = 0;
    for (let module of modules) {
      if (module.sharedBy) {
        let share = yield ShareModulesSchema.findOne({where: {to_user_id: userId, ec_module_id: module.id}});
        if (share) {
          share.sort = sort;
          yield share.save()
        }
      } else {
        let result = yield ModulesSchema.findOne({where: {user_id: userId, id: module.id}});
        if (result) {
          result.sort = sort;
          yield result.save();
        }
      }
      sort++;
    }
  }

  static * createModule(userId, workspaceId, moduleName, moduleType, moduleLabel, settings, sharedWith) {
    let m = yield ModulesSchema.create({
      user_id: userId,
      workspace_id: workspaceId,
      name: moduleName,
      module: moduleType,
      label: moduleLabel,
      settings: JSON.stringify(settings),
      date: new Date()
    });
    for (let teammateId of sharedWith) {
      yield ShareModulesSchema.create({ec_module_id: m.id, from_user_id: userId, to_user_id: teammateId});
    }
    return yield Modules.getModule(userId, m.id);
  }

  /**
   * Get modules from specific workspace that are owned by user or shared with user
   *
   * @param userId
   * @param workspaceId
   * @returns {Array}
   */
  static * listWorkspaceModules(userId, workspaceId) {
    let sign = "=";
    if (workspaceId === null) {
      sign = "IS";
    }
    let sharedModulesPromise = db.query(
      ' (SELECT m.id, m.name, m.label, m.module, m.settings, sm.sort, u.name sharedBy' +
      ' FROM share_ec_module sm' +
      ' JOIN ec_module m ON m.id = sm.ec_module_id' +
      ' JOIN user u ON u.id = sm.from_user_id' +
      ' WHERE to_user_id = $id AND m.workspace_id ' + sign + ' $ws)', {
        bind: {id: userId, ws: workspaceId},
        type: sequelize.QueryTypes.SELECT
      });
    let myModules = yield ModulesSchema.findAll({
      attributes: ['id', 'name', 'label', 'module', 'settings', 'sort'],
      where: {user_id: userId, workspace_id: workspaceId}
    });

    myModules = yield sharedWith(myModules, userId);
    let sharedModules = yield sharedModulesPromise;
    return sharedModules.concat(myModules).map(parse).sort(function (a, b) {
      if (a.sort > b.sort) {
        return 1;
      }
      if (a.sort < b.sort) {
        return -1;
      }
      if (a.id > b.id) {
        return 1;
      }
      if (a.id < b.id) {
        return -1;
      }
      return 0;
    });
  }

  /**
   * Get modules that are owned by user or shared with user
   *
   * @param userId
   * @returns {Array}
   */
  static * listModules(userId) {
    let sharedModulesPromise = db.query(
      ' (SELECT m.id, m.name, m.label, m.module, sm.sort, u.name sharedBy, IFNULL(m.workspace_id, 0) workspace_id' +
      ' FROM share_ec_module sm' +
      ' JOIN ec_module m ON m.id = sm.ec_module_id' +
      ' JOIN user u ON u.id = sm.from_user_id' +
      ' WHERE to_user_id = $id)', {
        bind: {id: userId},
        type: sequelize.QueryTypes.SELECT
      });
    let myModules = yield ModulesSchema.findAll({
      attributes: ['id', 'name', 'label', 'module', 'sort', [sequelize.fn('IFNULL', sequelize.col('workspace_id'), 0), 'workspace_id']],
      where: {user_id: userId}
    });
    myModules = yield sharedWith(myModules, userId);
    let sharedModules = yield sharedModulesPromise;
    return sharedModules.concat(myModules);
  }

  /**
   * Get all my own modules, with information about sharing to user:teammateId
   * used for team settings / teammate permissions
   *
   * @param userId
   * @param teammateId
   * @returns {Array}
   */
  static * listMySharedModules(userId, teammateId) {
    let modules = yield db.query(
      ' SELECT m.id, m.name, m.label, m.module, m.settings, s.id shared, w.name workspace' +
      ' FROM ec_module m' +
      ' LEFT JOIN share_ec_module s ON m.id = s.ec_module_id AND s.from_user_id = m.user_id AND s.to_user_id = $slaveId' +
      ' LEFT JOIN workspace w ON m.workspace_id = w.id' +
      ' WHERE m.user_id = $userId ', {
        bind: {userId: userId, slaveId: teammateId},
        type: sequelize.QueryTypes.SELECT
      });
    let userSettings = yield UsersSettingsModel.getSettings(userId);
    modules.map((module) => {
      module = parse(module);
      if (module.workspace === null) {
        module.workspace = userSettings.workspaceName;
      }
      module.shared = module.shared !== null;
    });
    return modules;
  }

  /**
   * Save or delete sharing modules from userId to teammateId
   * @param userId
   * @param teammateId
   * @param modules array of objects {id: moduleId, shared: boolean}
   * @returns {*}
   */
  static * saveSharedModules(userId, teammateId, modules) {
    let possiblyShare = [], destroy = [];
    modules.forEach((module) => {
      if (module.shared) {
        possiblyShare.push(module.id);
      } else {
        destroy.push(module.id);
      }
    });

    yield ShareModulesSchema.destroy({where: {ec_module_id: destroy, from_user_id: userId, to_user_id: teammateId}});

    let myModules = yield ModulesSchema.findAll({where: {id: possiblyShare, user_id: userId}});
    let share = myModules.map((module) => {
      return {ec_module_id: module.id, from_user_id: userId, to_user_id: teammateId};
    });
    return yield ShareModulesSchema.bulkCreate(share, {ignoreDuplicates: true});
  }

  /**
   * Returns all users, that share the workspace except workspace owner
   *
   * @param workspaceId
   * @param masterId
   * @returns {Array}
   */
  static * listTeammatesInWorkspace(workspaceId, masterId) {
    let sign = "=";
    if (workspaceId === 0) {
      workspaceId = null;
      sign = "IS";
    }
    let users = yield db.query(
      ' SELECT u.id, u.name fullName, u.image_square image, u.date_logged' +
      ' FROM ec_module m' +
      ' JOIN share_ec_module s ON m.id = s.ec_module_id' +
      ' JOIN user u ON s.to_user_id = u.id' +
      ' WHERE m.workspace_id ' + sign + ' $workspaceId AND m.user_id = $masterId' +
      ' GROUP BY u.id', {
        bind: {workspaceId: workspaceId, masterId: masterId},
        type: sequelize.QueryTypes.SELECT
      });
    return users.map((user) => {
      user.image = Replace.replaceHttp(user.image);
      return user;
    })
  }
}
Modules.MODULE_TYPES = ModulesSchema.MODULE_TYPES;
module.exports = Modules;

function parse(row) {
  if (row) {
    try {
      row.settings = JSON.parse(row.settings);
      if(row.settings.background) {
        if (row.settings.background.icon) {
          row.settings.background.icon = Utils.transformIconNameFromDatabase(row.settings.background.icon);
        }
        if (row.settings.background.image) {
          if(Array.isArray(row.settings.background.image)) {
            row.settings.background.image = row.settings.background.image.map((img) => {
              return Replace.replaceHttp(img);
            })
          } else {
            row.settings.background.image = [Replace.replaceHttp(row.settings.background.image)]
          }
        }
      }
    } catch (err) {
      console.error(err);
    }
  }
  return row;
}

/**
 * Get all users with who I'm sharing my modules and
 * add user's details to each module
 * @param modules array of modules
 * @param userId my ID
 * @returns {*}
 */
function * sharedWith(modules, userId) {
  return yield koaMap.mapLimit(modules, 5, function *(module) {
    try {
      module = module.get();
    } catch (e) {
      console.log(e);
    }
    module.sharedWith = yield db.query('SELECT u.id, u.name, u.image_square FROM user u JOIN share_ec_module sm ON u.id=sm.to_user_id WHERE sm.ec_module_id = $moduleId AND from_user_id = $userId', {
      bind: {
        userId: userId,
        moduleId: module.id
      }, type: sequelize.QueryTypes.SELECT
    });

    module.sharedWith.map((item) => {
      item.image_square = Replace.replaceHttp(item.image_square);
    });
    return module;
  });
}