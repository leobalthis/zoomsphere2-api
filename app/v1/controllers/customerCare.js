'use strict';
var va = require(__dirname + '/../helpers/validator'),
  CustomerCareModel = require(__dirname + '/../models/customerCare'),
  SocialMediaFeedModel = require(__dirname + '/../models/socialMediaFeed');

class CustomerCare {

  static * listCRMTags(next) {
    let tags = yield CustomerCareModel.listCRMTags(this.state.authUser.masterId);
    this.body = {tags: tags};
    return yield next;
  }

  static * listTags(next) {
    var result = va.run(this, [va.PATH], {
      workspaceId: va.number().required()
    });

    let tags = yield CustomerCareModel.listTags(this.state.authUser.masterId, result.workspaceId);
    this.body = {tags: tags};
    return yield next;
  }

  static * listLabels(next) {
    var result = va.run(this, [va.PATH], {
      workspaceId: va.number().required()
    });
    
    let customerCareLabels = yield SocialMediaFeedModel.listLabels(this.state.authUser.masterId, result.workspaceId);
    this.body = {labels: customerCareLabels};
    return yield next;
  }

  static * removeLabel(next) {
    var result = va.run(this, [va.PATH], {
      workspaceId: va.number().required(),
      labelId: va.number().required()
    });

    yield SocialMediaFeedModel.deleteLabel(this.state.authUser.id, result.workspaceId === 0 ? null : result.workspaceId, result.labelId);
    this.body = {success: true};
    return yield next;
  }
  
  static * listCustomerStatuses(next) {
    var result = va.run(this, [va.PATH], {
      workspaceId: va.number().required()
    });

    let statuses = yield CustomerCareModel.listCustomerStatus(this.state.authUser.masterId, result.workspaceId);
    this.body = {statuses: statuses};
    return yield next;
  }

  static * removeStatus(next) {
    var result = va.run(this, [va.PATH], {
      workspaceId: va.number().required(),
      statusId: va.number().required()
    });

    yield CustomerCareModel.deleteStatus(this.state.authUser.masterId, result.workspaceId === 0 ? null : result.workspaceId, result.statusId);
    this.body = {success: true};
    return yield next;
  }
  
  static * CustomerStatuses(next) {
    let statuses = yield CustomerCareModel.CustomerStatus(this.state.authUser.masterId);
    this.body = {statuses: statuses};
    return yield next;
  }

}
module.exports = CustomerCare;