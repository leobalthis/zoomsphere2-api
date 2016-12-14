'use strict';
var db = require(__dirname + '/../../../services').db,
  ZSError = require('zs-error'),
  Workspaces = require('./workspaces'),
  UserStatusSchema = db.import(__dirname + '/../schemas/user_read_status'),
  CRMTagsSchema = db.import(__dirname + '/../schemas/crm_tag'),
  CCTagsSchema = db.import(__dirname + '/../schemas/user_tag'),
  Utils = require(__dirname + '/../helpers/utils');
var defaultLabel = {name: 'Send to Archive', color: '#60e197', icon: 'krown-icon-ok', sort: 0, default: 1};
var attributes = ['id', 'name', 'color', 'icon', 'workspace_id', 'sort', 'default'];

class CustomerCare {

  static * listLabels(userId) {
    let where = {user_id: userId};
    let rows = yield UserStatusSchema.findAll({attributes: attributes, where: where});
    if (!rows[0]) {
      yield CustomerCare.createDefaultLabels(userId, null);
      rows = yield UserStatusSchema.findAll({attributes: attributes, where: where});
    }
    return rows.filter((label) => {
      label.color = Utils.transformColors(label.color);
      return !label.default;
    });
  }

  static * createDefaultLabels(userId, workspaceId) {
    return yield CustomerCare.saveLabel(userId, workspaceId, defaultLabel);
  }

  static * deleteLabels(userId, workspaceId) {
    return yield UserStatusSchema.destroy({where: {user_id: userId, workspace_id: workspaceId}});
  }

  static * deleteStatus(userId, workspaceId, statusId) {
    return yield UserStatusSchema.destroy({where: {user_id: userId, workspace_id: workspaceId, id: statusId}});
  }

  static * saveLabels(userId, workspaceId, array) {
    let ws = yield Workspaces.exists(userId, workspaceId);
    if (!ws) {
      throw new ZSError('error_not_found', 404, 'Workspace not found');
    }
    return yield array.map((label) => {
      return CustomerCare.saveLabel(userId, workspaceId, label);
    })
  }

  static * saveLabel(userId, workspaceId, label) {
    let row;
    if (!label.id && label.name !== '') {
      let possibleSort = yield UserStatusSchema.findOne({attributes: ['sort'], where: {user_id: userId, workspace_id: workspaceId}});
      possibleSort = possibleSort || {};
      Object.assign(label, {user_id: userId, workspace_id: workspaceId, sort: (possibleSort.sort + 1) || 0});
      row = UserStatusSchema.create(label);
    } else {
      row = yield UserStatusSchema.findOne({where: {id: label.id}});
      if (row) {
        if (label.name === '') {
          if (row.default) {
            throw new ZSError('ERROR_REQUIRED_FIELD_MISSING', 403, 'Cannot remove default status');
          }
          row = row.destroy();
        } else {
          Object.assign(row, label);
          row = row.save();
        }
      } else {
        row = Promise.resolve();
      }
    }
    return yield row;
  }

  static * listCRMTags(masterId) {
    return yield CRMTagsSchema.findAll({attributes: ['id', 'name'], where: {master_account_id: masterId}});
  }

  static * listTags(masterId, workspaceId) {
    if (workspaceId == 0) {
      workspaceId = null;
    }
    return yield CCTagsSchema.findAll({attributes: ['id', 'name'], where: {master_account_id: masterId, workspace_id: workspaceId}});
  }

  static * listCustomerStatus(masterId, workspaceId) {
    if (workspaceId === 0) {
      workspaceId = null;
    }
    let statuses = yield UserStatusSchema.findAll({
      attributes: ['id', 'name', 'color', 'icon', 'default', 'sort'],
      where: {user_id: masterId, workspace_id: workspaceId}
    });

    return statuses.map((status) => {
      status.color = Utils.transformColors(status.color);
      status.bgcolor = Utils.transformColors(status.bgcolor);
      return status;
    });
  }

  static * CustomerStatus(masterId) {
    let statuses = yield UserStatusSchema.findAll({
      attributes: ['id', 'name', 'color', 'icon', 'default', 'sort', 'workspace_id'],
      where: {user_id: masterId}
    });

    return statuses.map((status) => {
      status.color = Utils.transformColors(status.color);
      status.workspace_id = status.workspace_id || 0;
      return status;
    });
  }
}

module.exports = CustomerCare;