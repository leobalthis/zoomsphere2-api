'use strict';
var db = require(__dirname + '/../../../services').db,
  sequelize = require('sequelize'),
  Replace = require('../helpers/replace'),
  UserSettingsSchema = db.import(__dirname + '/../schemas/user_settings'),
  BusinessHoursSchema = db.import(__dirname + '/../schemas/business_hours');

class UsersSettingsModel {

  // static * listModules(user) {
  //   let sign = "=";
  //   if (workspaceId === null) {
  //     sign = "IS";
  //   }
  //   let ws = yield db.query(
  //     ' (SELECT m.id, m.name, m.label, m.module, m.settings FROM share_ec_module sm JOIN ec_module m ON m.id = sm.ec_module_id WHERE to_user_id = $id AND m.workspace_id ' + sign + ' $ws ORDER BY sort)' +
  //     ' UNION' +
  //     ' (SELECT id, name, label, module, settings FROM ec_module WHERE user_id = $id AND workspace_id ' + sign + ' $ws ORDER BY sort)', {
  //       bind: {id: userId, ws: workspaceId},
  //       type: sequelize.QueryTypes.SELECT
  //     });
  //
  //   return ws.map(parse);
  // }

  static * getSettings(userId) {
    let user = yield UserSettingsSchema.findOne({where: {user_id: userId}});
    if(!user) {
      user = yield UserSettingsSchema.create({user_id: userId});
    }
    return parsePublic(user[0] || user)
  }

  static * getRawSettings(userId) {
    let res = yield UserSettingsSchema.findOrCreate({where: {user_id: userId}});
    return res[0] || res;
  }

  static * saveSettings(settings) {
    if (arguments[1]) {
      settings = composeParams(settings, arguments[1])
    }
    return yield settings.save()
  }

  static * getBusinessHours(userId) {
    let row = yield BusinessHoursSchema.findOne({where: {user_id: userId}});
    return parseHoursPublic(row)
  }

  static * saveBusinessHours(userId, active, hours) {
    let row = yield BusinessHoursSchema.findOrCreate({
      where: {user_id: userId},
      defaults: {active: active, hours: JSON.stringify(hours)}
    });
    Object.assign(row[0], {active: active, hours: JSON.stringify(hours)});
    return yield row[0].save();
  }

  static * listWorkspaces(userId) {
    let row = yield BusinessHoursSchema.findOne({where: {user_id: userId}});
    return parseHoursPublic(row)
  }
}

module.exports = UsersSettingsModel;


function parsePublic(row) {
  var settings, json = {};
  if (row) {
    row.text = Replace.replaceHttp(row.text);
    settings = {
      userId: row.user_id,
      text: row.text
    };
    try {
      json = JSON.parse(row.text) || {};
      if (json.invite_template && json.invite_template.subject) {
        settings.inviteTemplate = {subject: json.invite_template.subject, content: json.invite_template.email};
      }
    } catch (err) {
    }
    settings.emailFooter = json.emailFooter || '';
    settings.workspaceName = json.workspace_name || 'Default Workspace';
  }
  return settings
}

function composeParams(settings, args) {
  try {
    var json = JSON.parse(settings.text) || {};
    if (args.inviteTemplate) {
      json.invite_template = {subject: args.inviteTemplate.subject, email: args.inviteTemplate.content}
    }
    if (args.emailFooter) {
      json.emailFooter = args.emailFooter;
    }
    if (args.workspaceName) {
      json.workspace_name = args.workspaceName;
    }
    settings.text = JSON.stringify(json);
  } catch (err) {
  }
  return settings
}

function parseHoursPublic(row) {
  let active = false;
  var value = {
    1: [[0, 0], [0, 0]],
    2: [[0, 0], [0, 0]],
    3: [[0, 0], [0, 0]],
    4: [[0, 0], [0, 0]],
    5: [[0, 0], [0, 0]],
    6: [[0, 0], [0, 0]],
    7: [[0, 0], [0, 0]]
  };
  if (row) {
    active = row.active;
    try {
      value = JSON.parse(row.hours);
    } catch (err) {
    }
  }
  return {active: active, hours: value}
}