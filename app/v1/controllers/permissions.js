'use strict';
var moment = require('moment'),
  UsersModel = require(__dirname + '/../models/users'),
  Utils = require(__dirname + '/../helpers/utils');

const IPWhiteList = Utils.getWhiteListedIPs();

class Permissions {

  static * isPayed(next) {
    if (this.req.method === 'OPTIONS') {
      return yield next;
    }
    if (this.state.authUser.permissions.tariff === UsersModel.TARIFFS.EXPIRED) {
      throw new this.app.ZSError('ERROR_EXPIRED_ACCOUNT', 402, 'Ask support for subscription');
    }
    return yield next;
  }

  /**
   * Authorize owner if this.params.userId is equal to user's access token id
   */
  static * isOwner(next) {
    if (PermissionsValidator.amIOwner(this)) {
      return yield next
    } else {
      throw new this.app.ZSError('ERROR_PERMISSIONS_REQUIRED', 403, 'You must be the account owner');
    }
  }

  static * isMasterOrRoot(next) {
    let isMaster = yield PermissionsValidator.amIMaster(this);
    if (isMaster || PermissionsValidator.amIRoot(this) || PermissionsValidator.amIAdministrator(this)) {
      return yield next
    } else {
      throw new this.app.ZSError('ERROR_PERMISSIONS_REQUIRED', 403, 'You must be administrator');
    }
  }

  static * isRoot(next) {
    if (PermissionsValidator.amIRoot(this) || PermissionsValidator.amIAdministrator(this)) {
      return yield next
    } else {
      throw new this.app.ZSError('ERROR_PERMISSIONS_REQUIRED', 403, 'You must be administrator');
    }
  }

  /**
   * {userId}
   * Authenticated user must be master of given userId or has same id as given userId
   */
  static * isOwnerOrMasterOrRoot(next) {
    let isMaster = yield PermissionsValidator.amIMaster(this);
    if (isMaster || PermissionsValidator.amIOwner(this) || PermissionsValidator.amIRoot(this) || PermissionsValidator.amIAdministrator(this)) {
      return yield next;
    } else {
      throw new this.app.ZSError('ERROR_PERMISSIONS_REQUIRED', 403)
    }
  }

  /**
   * {userId}
   * {teammateId} optional
   * if teammateId given, then Authenticated user must be master of given teammateId
   * else userId must be master - (is not slave)
   */
  static * isMaster(next) {
    let isMaster = yield PermissionsValidator.amIMaster(this);
    if (isMaster) {
      return yield next
    } else {
      throw new this.app.ZSError('ERROR_PERMISSIONS_REQUIRED', 403, 'You have to be master')
    }
  }

  static * isWhiteListed(next) {
    if (Permissions.whiteListValidator(this.request.ip)) {
      return yield next
    } else {
      throw new this.app.ZSError('ERROR_PERMISSIONS_REQUIRED', 403, 'You have not enough permissions')
    }
  }

  static whiteListValidator(sourceIP) {
    return IPWhiteList.indexOf(sourceIP) !== -1
  }
}
module.exports = Permissions;

class PermissionsValidator {
  static amIRoot(ctx) {
    return ctx.state.authUser.role === 'root';
  }

  static amIAdministrator(ctx) {
    return ctx.state.authUser.role === 'administrator';
  }

  /** is userId my ID */
  static amIOwner(ctx) {
    return ctx.state.authUser.id.toString() === ctx.params.userId;
  }

  static * amIMaster(ctx) {
    let slaveAccounts = yield ctx.state.authUser.getSlaveUser();
    if (ctx.params.teammateId) {
      /** is userId my ID && is requested teammateId my slave's ID ? */
      return (this.amIOwner(ctx) && slaveAccounts.filter((acc) => acc.get('to_user_id').toString() === ctx.params.teammateId).length > 0)
    } else {
      /** am i master? (master is not slave) && is requested userId my ID or my slave's ID? */
      return (ctx.state.authUser.id === ctx.state.authUser.masterId && (ctx.params.userId === undefined || this.amIOwner(ctx) || (slaveAccounts.filter((acc) => acc.get('to_user_id').toString() === ctx.params.userId).length > 0)))
    }
  }
}