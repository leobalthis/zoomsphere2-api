'use strict';
var db = require(__dirname + '/../../../services').db,
  sequelize = require('sequelize'),
  WorkspaceSchema = db.import(__dirname + '/../schemas/workspace'),
  UserSettings = require('./usersSettings');

class Workspace {
  static * deleteWorkspace(userId, workspaceId) {
    return yield WorkspaceSchema.destroy({where: {user_id: userId, id: workspaceId}});
  }

  static * listWorkspaces(userId, masterId) {
    let settings = yield UserSettings.getSettings(masterId);
    let count = yield db.query('SELECT COUNT(1) module_count FROM ec_module WHERE user_id = $id AND workspace_id IS NULL', {
      bind: {id: masterId},
      type: sequelize.QueryTypes.SELECT
    });

    let ws = yield db.query(
      'SELECT ws.id, ws.name, tab.module_count FROM' +
      ' ((SELECT m.workspace_id, count(1) module_count FROM share_ec_module sm JOIN ec_module m ON m.id = sm.ec_module_id WHERE to_user_id = $id GROUP BY m.workspace_id)' +
      ' UNION' +
      ' (SELECT workspace_id, count(1) module_count FROM ec_module WHERE user_id = $id GROUP BY workspace_id)' +
      ' UNION' +
      ' (SELECT ws.id workspace_id, count(m.id) module_count FROM workspace ws LEFT JOIN ec_module m ON ws.id = m.workspace_id WHERE ws.user_id = $id GROUP BY workspace_id))' +
      ' tab LEFT JOIN workspace ws ON	ws.id = tab.workspace_id GROUP BY id', {
        bind: {id: userId},
        type: sequelize.QueryTypes.SELECT
      });
    if (ws.length === 0 || (ws.length > 0 && ws[0].id === null)) {
      ws[0] = {id: 0, name: settings.workspaceName, module_count: count[0].module_count};
    } else {
      ws.push({id: 0, name: settings.workspaceName, module_count: count[0].module_count});
    }
    return ws.sort(function (a, b) {
      return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
    });
  }

  static * updateWorkspaceName(userId, workspaceId, name) {
    let ws = yield WorkspaceSchema.findOne({where: {user_id: userId, id: workspaceId}});
    if (ws) {
      ws.name = name;
      yield ws.save();
    }
    return Promise.resolve();
  }

  static * exists(userId, workspaceId) {
    if (!workspaceId) {
      return true;
    }
    let ws = yield WorkspaceSchema.findOne({where: {user_id: userId, id: workspaceId}});
    return !!ws;
  }
}
module.exports = Workspace;