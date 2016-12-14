'use strict';
var
  SocialMediaFeedModel = require(__dirname + '/../models/socialMediaFeed'),
  PublisherModel = require(__dirname + '/../models/publisher'),
  WorkspaceModel = require(__dirname + '/../models/workspaces'),
  CustomerCareModel = require(__dirname + '/../models/customerCare'),
  UserSettingsModel = require(__dirname + '/../models/usersSettings'),
  va = require(__dirname + '/../helpers/validator');

class UsersSettings {

  static * getAdvancedSettings(next) {
    let businessHours = UserSettingsModel.getBusinessHours(this.params.userId);
    let settings = yield UserSettingsModel.getSettings(this.params.userId);

    this.body = Object.assign(this.body, {
      businessHours: yield businessHours,
      emailFooter: settings.emailFooter || ''
    });
    return yield next;
  }

  static * getBusinessHours(next) {
    let businessHours = yield UserSettingsModel.getBusinessHours(this.state.authUser.masterId);
    this.body = {
      businessHours: businessHours
    };
    return yield next;
  }

  static * getEmailFooter(next) {
    let settings = yield UserSettingsModel.getSettings(this.state.authUser.id);
    this.body = {
      emailFooter: settings.emailFooter || ''
    };
    return yield next;
  }

  static * getWorkspacesSettings(next) {
    let workspaces = yield WorkspaceModel.listWorkspaces(this.params.userId, this.params.userId);
    let socialLabels = yield SocialMediaFeedModel.listAllLabels(this.params.userId);
    let publisherLabels = yield PublisherModel.listLabels(this.params.userId);
    let customerCareLabels = yield CustomerCareModel.listLabels(this.params.userId);

    this.body = {
      workspaces: workspaces.map((workspace) => {
        return {
          id: workspace.id,
          name: workspace.name,
          socialMediaFeedLabels: UsersSettings.filterLabels(socialLabels, workspace.id),
          publisherLabels: UsersSettings.filterLabels(publisherLabels, workspace.id),
          customerCareStatuses: UsersSettings.filterLabels(customerCareLabels, workspace.id)
        }
      })
    };
    return yield next;
  }

  static filterLabels(labels, workspaceId) {
    let wsId = (workspaceId === 0) ? null : workspaceId;
    return labels.filter((item) => {
      return item.workspace_id === wsId;
    }).map((item) => {
      let val = item.get();
      delete val.workspace_id;
      return val
    });
  }

  static * createWorkspace(next) {
    var result = va.run(this, va.BODY, {name: va.string().required()});
    let res = yield this.state.authUser.createWorkspace({name: result.name});
    yield SocialMediaFeedModel.createLabels(this.params.userId, res.id);
    yield PublisherModel.createLabels(this.params.userId, res.id);
    yield CustomerCareModel.createDefaultLabels(this.params.userId, res.id);
    this.state.updated = {id: res.id};
    this.status = 201;
    return yield next;
  }

  static * saveWorkspace(next) {
    var schema = {
      workspaceId: va.number().required(),
      name: va.string().required(),
      socialMediaFeedLabels: va.array().items({
        id: va.number().optional(),
        name: va.string().allow('').required(),
        color: va.cssColor().required()
      }),
      publisherLabels: va.array().items({
        id: va.number().optional(),
        name: va.string().allow('').required(),
        color: va.cssColor().required()
      }),
      customerCareStatuses: va.array().items({
        id: va.number().optional(),
        name: va.string().allow('').required(),
        color: va.cssColor().required(),
        icon: va.iconClassName().required(),
        sort: va.any().optional(),
        default: va.any().optional()
      })
    };
    var result = va.run(this, [va.PATH, va.BODY], schema);
    if (result.workspaceId === 0) {
      result.workspaceId = null;
    }
    if (result.workspaceId === null && result.name !== 'Default Workspace') {
      yield UserSettingsModel.saveSettings(yield UserSettingsModel.getRawSettings(this.params.userId), {workspaceName: result.name});
    } else if (result.workspaceId !== null) {
      yield WorkspaceModel.updateWorkspaceName(this.params.userId, result.workspaceId, result.name);
    }
    yield SocialMediaFeedModel.saveLabels(this.params.userId, result.workspaceId, result.socialMediaFeedLabels);
    yield PublisherModel.saveLabels(this.params.userId, result.workspaceId, result.publisherLabels);
    yield CustomerCareModel.saveLabels(this.params.userId, result.workspaceId, result.customerCareStatuses);
    this.status = 202;
    return yield next;
  }

  static * deleteWorkspace(next) {
    var result = va.run(this, va.PATH, {workspaceId: va.number().required()});
    if (result.workspaceId === 0) {
      throw new this.app.ZSError('ERROR_REQUIRED_FIELD_MISSING', 403, 'Cannot delete default workspace');
    }
    yield PublisherModel.deleteLabels(this.params.userId, result.workspaceId);
    yield SocialMediaFeedModel.deleteLabels(this.params.userId, result.workspaceId);
    yield WorkspaceModel.deleteWorkspace(this.params.userId, result.workspaceId);
    this.status = 202;
    return yield next;

  }

  static * saveBusinessHours(next) {
    var result = va.run(this, va.BODY, {
      active: va.boolean().required(), hours: {
        "1": [[va.any().required(), va.any().required()], [va.any().required(), va.any().required()]],
        "2": [[va.any().required(), va.any().required()], [va.any().required(), va.any().required()]],
        "3": [[va.any().required(), va.any().required()], [va.any().required(), va.any().required()]],
        "4": [[va.any().required(), va.any().required()], [va.any().required(), va.any().required()]],
        "5": [[va.any().required(), va.any().required()], [va.any().required(), va.any().required()]],
        "6": [[va.any().required(), va.any().required()], [va.any().required(), va.any().required()]],
        "7": [[va.any().required(), va.any().required()], [va.any().required(), va.any().required()]]
      }
    });
    yield UserSettingsModel.saveBusinessHours(this.params.userId, result.active, result.hours);
    this.status = 202;
    return yield next;
  }

  static * saveEmailSettings(next) {
    var result = va.run(this, va.BODY, {emailFooter: va.string().allow('').required()});
    yield UserSettingsModel.saveSettings(yield UserSettingsModel.getRawSettings(this.params.userId), {
      emailFooter: result.emailFooter
    });
    this.status = 202;
    return yield next;
  }

}
module.exports = UsersSettings;