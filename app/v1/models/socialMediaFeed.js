'use strict';
var db = require(__dirname + '/../../../services').db,
  ZSError = require('zs-error'),
  Utils = require(__dirname + '/../helpers/utils'),
  Workspaces = require(__dirname + '/workspaces'),
  UserLabelSchema = db.import(__dirname + '/../schemas/user_label');
var defaultLabels = [
  {name: 'Ask for help', color: '#ffcf34'},
  {name: 'Clarification', color: '#fc8366'},
  {name: 'Common question', color: '#5290d9'},
  {name: 'Complaint', color: '#fc8366'},
  {name: 'Compliment', color: '#62af5e'},
  {name: 'Idea', color: '#79c7d5'},
  {name: 'Poll answer', color: '#9065cb'}
];
class SocialMediaFeed {

  static * listAllLabels(userId) {
    let where = {user_id: userId};
    let rows = yield UserLabelSchema.findAll({attributes: ['id', 'name', 'color', 'workspace_id'], where: where});
    if (!rows[0]) {
      yield SocialMediaFeed.createLabels(userId, null);
      rows = yield UserLabelSchema.findAll({attributes: ['id', 'name', 'color', 'workspace_id'], where: where});
    }
    return rows.map((row) => {
      row.color = Utils.transformColors(row.color);
      return row;
    });
  }

  static * listLabels(userId, workspaceId) {
    let where = {user_id: userId, workspace_id: workspaceId == 0 ? null : workspaceId};
    let rows = yield UserLabelSchema.findAll({attributes: ['id', 'name', 'color'], where: where});
    if (!rows[0]) {
      yield SocialMediaFeed.createLabels(userId, workspaceId == 0 ? null : workspaceId);
      rows = yield UserLabelSchema.findAll({attributes: ['id', 'name', 'color'], where: where});
    }
    return rows.map((row) => {
      row.color = Utils.transformColors(row.color);
      return row;
    });
  }

  static * listLabelsForUser(userId) {
    let where = {user_id: userId};
    let rows = yield UserLabelSchema.findAll({attributes: ['id', 'name', 'color', 'workspace_id'], where: where});
    return rows.map((row) => {
      row.color = Utils.transformColors(row.color);
      row.workspace_id = row.workspace_id || 0;
      return row;
    });
  }

  static * createLabels(userId, workspaceId) {
    let ws = yield Workspaces.exists(userId, workspaceId);
    if (!ws) {
      throw new ZSError('error_not_found', 404, 'Workspace not found');
    }
    return yield UserLabelSchema.bulkCreate(defaultLabels.map((item) => {
      return {name: item.name, color: item.color, user_id: userId, workspace_id: workspaceId};
    }))
  }

  static * deleteLabels(userId, workspaceId) {
    return yield UserLabelSchema.destroy({where: {user_id: userId, workspace_id: workspaceId}});
  }

  static * deleteLabel(userId, workspaceId, labelId) {
    return yield UserLabelSchema.destroy({where: {user_id: userId, workspace_id: workspaceId, id: labelId}});
  }

  static * saveLabels(userId, workspaceId, array) {
    let ws = yield Workspaces.exists(userId, workspaceId);
    if (!ws) {
      throw new ZSError('error_not_found', 404, 'Workspace not found');
    }
    return yield array.map((label) => {
      return SocialMediaFeed.saveLabel(userId, workspaceId, label);
    })
  }

  static * saveLabel(userId, workspaceId, label) {
    let row;
    if (!label.id && label.name !== '') {
      row = UserLabelSchema.create({user_id: userId, workspace_id: workspaceId, name: label.name, color: label.color});
    } else {
      row = yield UserLabelSchema.findOne({where: {id: label.id}});
      if (row) {
        if (label.name === '') {
          row = row.destroy();
        } else {
          row.name = label.name;
          row.color = label.color;
          row = row.save();
        }
      } else {
        row = Promise.resolve();
      }
    }
    return yield row;
  }
}

module.exports = SocialMediaFeed;