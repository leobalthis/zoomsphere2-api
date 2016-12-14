'use strict';
var url = require('url'),
  AccountsModel = require(__dirname + '/../models/usersSocialNetworks'),
  Replace = require(__dirname + '/../helpers/replace'),
  TeamModel = require(__dirname + '/../models/teams'),
  UsersModel = require(__dirname + '/../models/users'),
  koaMap = require('koa-map'),
  cache = require(__dirname + '/../models/cache'),
  va = require(__dirname + '/../helpers/validator'),
  mailer = require(__dirname + '/../helpers/mailer'),
  Facebook = require(__dirname + '/../helpers/facebook'),
  Linkedin = require(__dirname + '/../helpers/linkedin'),
  Instagram = require(__dirname + '/../helpers/instagram'),
  Twitter = require(__dirname + '/../helpers/twitter'),
  Google = require(__dirname + '/../helpers/google'),
  _ = require('lodash'),
  isWhitelisted = require(__dirname + '/../controllers/permissions').whiteListValidator;

var socialNetworks = [AccountsModel.NETWORKS.FACEBOOK, AccountsModel.NETWORKS.GOOGLE, AccountsModel.NETWORKS.TWITTER, AccountsModel.NETWORKS.LINKEDIN, AccountsModel.NETWORKS.YOUTUBE, AccountsModel.NETWORKS.INSTAGRAM];

class UsersAccounts {

  static * list(next) {
    var result = va.run(this, va.PATH, {userId: va.number().required()});
    this.body = yield AccountsModel.listPublic(result.userId);
    return yield next
  }

  static * addPage(next) {
    var result = va.run(this, [va.PATH, va.BODY], {
      userId: va.number().required(),
      accountId: va.number().required(),
      networkId: va.string().valid([AccountsModel.NETWORKS.FACEBOOK, AccountsModel.NETWORKS.GOOGLE, AccountsModel.NETWORKS.LINKEDIN]).required(),
      pageIds: va.array().required()
    });
    let account = yield AccountsModel.getDetail(result.accountId, result.userId);
    if (!account) {
      throw new this.app.ZSError('ERROR_REQUIRED_FIELD_MISSING', 403, 'e111')
    }
    let possiblePages = [];
    try {
      switch (result.networkId) {
        case AccountsModel.NETWORKS.FACEBOOK:
          possiblePages = yield Facebook.getPages(account.access_token);
          break;
        case AccountsModel.NETWORKS.GOOGLE:
          possiblePages = yield Google.getPages(account.account_id, account.access_token);
          break;
        case AccountsModel.NETWORKS.LINKEDIN:
          possiblePages = yield Linkedin.getPages(account.access_token);
          break;
      }
      yield koaMap.mapDelay(possiblePages, 0, function *(newPage) {
        return yield koaMap.mapDelay(result.pageIds, 0, function *(pageId) {
          if (newPage.id == pageId.toString()) {
            return yield AccountsModel.createPage(result.networkId, result.userId, account.account_id, newPage);
          } else {
            return null;
          }
        })
      });
    } catch (err) {
      throw new this.app.ZSError('error_invalid_social_token', 404, err[0] || err);
    }
    this.status = 201;
    return yield next
  }

  static * refreshFBpages(next) {
    var result = va.run(this, [va.PATH, va.BODY], {
      userId: va.number().required(),
      accountId: va.number().required()
    });
    let account = yield AccountsModel.getDetail(result.accountId, result.userId);
    if (!account) {
      throw new this.app.ZSError('ERROR_REQUIRED_FIELD_MISSING', 403, 'e111')
    }
    try {
      let pages = yield AccountsModel.listUsersFacebookPages(result.userId);
      let possiblePages = yield Facebook.getPages(account.access_token);
      yield possiblePages.map((newPage) => {
        return pages.map((page) => {
          if (newPage.id === page.page_id.toString()) {
            return AccountsModel.createPage(AccountsModel.NETWORKS.FACEBOOK, result.userId, account.account_id, newPage);
          }
        })
      });
    } catch (err) {
      throw new this.app.ZSError('ERROR_INVALID_SOCIAL_TOKEN', 404, err[0] || err);
    }
    if (account) {
      this.status = 202;
      this.body = yield AccountsModel.listPublic(result.userId);
      this.state.updated = {id: account.id};
    } else {
      /** not found */
      throw new this.app.ZSError('ERROR_UNKNOWN', 404)
    }
    return yield next
  }

  static * addFacebookAccount(next) {
    var result = va.run(this, [va.PATH, va.BODY], {
      userId: va.number().required(),
      accessToken: va.string().required()
    });
    let account = yield Facebook.validateCallback(result.accessToken);

    let res = yield AccountsModel.createAccount(result.userId, account.user.id, AccountsModel.NETWORKS.FACEBOOK, account.user.displayName, account.user.token, account.user.photos[0], account.user.expiresAt, account.user.info);
    if (res) {
      this.status = 202;
      this.body = yield AccountsModel.listPublic(result.userId);
      this.state.updated = {id: res.id};
    } else {
      /** not found */
      throw new this.app.ZSError('ERROR_UNKNOWN', 404)
    }
    return yield next
  }

  static * deleteAccount(next) {
    var result = va.run(this, va.PATH, {
      userId: va.number().required(),
      accountId: va.number().required(),
      networkId: va.string().valid(socialNetworks).required()
    });
    let res = yield AccountsModel.deleteAccount(result.accountId, result.userId);
    if (res) {
      this.status = 202;
      this.body = yield AccountsModel.listPublic(result.userId);
    } else {
      /** not found */
      throw new this.app.ZSError('ERROR_UNKNOWN', 404)
    }
    return yield next
  }

  static * deletePage(next) {
    var result = va.run(this, va.PATH, {
      userId: va.number().required(),
      pageId: va.number().required(),
      networkId: va.string().required()
    });
    let res = yield AccountsModel.deletePage(result.networkId, result.pageId, result.userId);
    if (res) {
      this.status = 202;
      this.body = yield AccountsModel.listPublic(result.userId);
    } else {
      /** not found */
      throw new this.app.ZSError('ERROR_UNKNOWN', 404)
    }
    return yield next
  }

  static * getPages(next) {
    var result = va.run(this, va.PATH, {
      userId: va.number().required(),
      accountId: va.number().required(),
      networkId: va.string().valid([AccountsModel.NETWORKS.FACEBOOK, AccountsModel.NETWORKS.GOOGLE, AccountsModel.NETWORKS.LINKEDIN]).required()
    });
    let account = yield AccountsModel.getDetail(result.accountId, result.userId);
    let possiblePages = [];
    let userPages = [];
    switch (result.networkId) {
      case AccountsModel.NETWORKS.FACEBOOK:
        possiblePages = yield Facebook.getPages(account.access_token);
        /** remove access token before display */
        possiblePages.map((page) => {
          delete page.access_token;
        });
        userPages = yield AccountsModel.listUsersFacebookPages(result.userId);
        break;
      case AccountsModel.NETWORKS.GOOGLE:
        possiblePages = yield Google.getPages(account.account_id, account.access_token);
        userPages = yield AccountsModel.listGooglePages(account.account_id, result.userId);
        break;
      case AccountsModel.NETWORKS.LINKEDIN:
        possiblePages = yield Linkedin.getPages(account.access_token);
        userPages = yield AccountsModel.listLinkedinPages(account.account_id, result.userId);
        break;
      default:
        throw new this.app.ZSError('ERROR_UNKNOWN', 404);
        break;
    }

    this.body = possiblePages.filter((item)=> {
      return userPages.filter((page) => {
          return page.page_id.toString() == item.id.toString()
        }).length == 0
    });
    this.status = 200;
    return yield next
  }

  static * sendExpirationNotification(next) {
    var result = va.run(this, [va.PATH, va.BODY], {
      userId: va.number().required(),
      networkId: va.string().valid([AccountsModel.NETWORKS.FACEBOOK, AccountsModel.NETWORKS.LINKEDIN]).required(),
      type: va.string().valid(['page', 'account']).required(),
      id: va.number().required()
    });
    let expired;
    if (result.type === 'page') {
      expired = yield AccountsModel.getFacebookPage(result.id);
    } else {
      expired = yield AccountsModel.getDetail(result.id, result.userId);
      if (expired.account !== result.networkId) {
        throw new this.app.ZSError('ERROR_REQUIRED_FIELD_MISSING', 403)
      }
    }
    if (!expired || expired.user_id !== result.userId) {
      throw new this.app.ZSError('ERROR_REQUIRED_FIELD_MISSING', 403)
    }
    let user = yield UsersModel.getDetailPublic(expired.user_id);
    let boostProtection = yield cache.get(cache.SPACES.EXPIRED_SOCIAL, user.email + '-' + result.networkId + '-' + result.type + '-' + expired.id);
    if (!boostProtection) {
      yield mailer.sendExpiredSocialNotification(user.email, user.fullName, result.networkId, expired.name, expired.id, result.type);
      this.status = 201;
    } else {
      this.status = 200;
    }
    this.body = {success: true};
    return yield next
  }

  static * saveEmailSettings(next) {
    var schema = {
      userId: va.number().required(),
      name: va.string().required(),
      imap: {
        username: va.string().required(),
        password: va.string().required(),
        server: va.string().required(),
        port: va.number().required(),
        secure: va.string().valid(['', 'ssl', 'tls']).required()
      },
      smtp: {
        username: va.string().required(),
        password: va.string().required(),
        server: va.string().required(),
        port: va.number().required(),
        secure: va.string().valid(['', 'ssl', 'tls']).required()
      },
      settings: {footer: va.string().allow('').optional()}
    };
    if (this.req.method === 'POST') {
      this.status = 201;
    } else {
      schema.emailId = va.number().required();
      this.status = 202;
    }
    var result = va.run(this, [va.PATH, va.BODY], schema);
    yield AccountsModel.saveEmailSettings(result);
    this.body = yield AccountsModel.listPublic(result.userId);
    return yield next;
  }

  static * deleteEmailSettings(next) {
    var result = va.run(this, va.PATH, {userId: va.number().required(), emailId: va.number().required()});
    yield AccountsModel.deleteEmailSettings(result.userId, result.emailId);
    this.body = yield AccountsModel.listPublic(result.userId);
    this.status = 202;
    return yield next;
  }

  static * validateAccountsTokens(next) {
    var result = va.run(this, [va.PATH, va.BODY], {
      userId: va.number().required()
    });
    let fbPages = yield AccountsModel.listUsersFacebookPagesPrivate(result.userId);
    // let liPages = yield AccountsModel.listUsersLinkedinPages(result.userId);
    let socialAccounts;
    if (this.state.authUser.id === result.userId) {
      socialAccounts = yield this.state.authUser.getUserAccount();
    }

    let accounts = {facebook: {}, linkedin: {}};
    socialAccounts.forEach((acc) => {
      if (acc.account === AccountsModel.NETWORKS.FACEBOOK || acc.account === AccountsModel.NETWORKS.LINKEDIN) {
        accounts[acc.account][acc.account_id] = JSON.parse(acc.access_token);
      }
    });

    /**
     * inspect facebook accounts
     */
    let fbAccsRes = [];
    let tmp = koaMap.mapLimit(socialAccounts, 5, function *(acc) {
      if (acc.account === AccountsModel.NETWORKS.FACEBOOK) {
        let token = JSON.parse(acc.access_token);
        let scopes = yield Facebook.inspectToken(token.access_token);
        acc.invalid = scopes ? null : true;
        yield acc.save();
        fbAccsRes.push({
          id: acc.id,
          image: acc.image,
          name: acc.name,
          account: acc.account,
          account_id: acc.account_id,
          expires: acc.expires,
          invalid: acc.invalid,
          scopes: scopes
        });
      }
    });

    /**
     * inspect facebook pages
     */
    let fbPagesRes = koaMap.mapLimit(fbPages, 5, function *(page) {
      let scopes = yield Facebook.inspectToken(page.access_token);
      page.invalid = scopes ? null : true;
      yield page.save();
      return {
        id: page.id,
        page_id: page.page_id,
        account_id: page.account_id,
        name: page.name,
        image: page.image,
        invalid: page.invalid,
        scopes: scopes
      };
    });
    yield tmp;
    this.body = {facebook: {accounts: fbAccsRes, pages: yield fbPagesRes}};
    return yield next;
  }

  static * changeFBpageAccount(next) {
    var result = va.run(this, [va.PATH, va.BODY], {
      userId: va.number().required(),
      accountId: va.number().required(),
      newAccountId: va.number().required(),
      pageId: va.number().required()
    });
    let account = yield AccountsModel.getDetail(result.newAccountId, result.userId);
    if (!account) {
      throw new this.app.ZSError('ERROR_REQUIRED_FIELD_MISSING', 403, 'e112')
    }
    let pages = yield AccountsModel.listUsersFacebookPages(result.userId);
    if (pages.filter((page) => {
        return page.id === result.pageId
      }).length === 0) {
      throw new this.app.ZSError('ERROR_REQUIRED_FIELD_MISSING', 403, 'e113')
    }
    let status = 404;
    try {
      let page = yield AccountsModel.getFacebookPage(result.pageId);
      let possiblePages = yield Facebook.getPages(account.access_token);
      yield koaMap.mapLimit(possiblePages, 5, function *(newPage) {
        if (newPage.id === page.page_id.toString()) {
          page.account_id = account.account_id;
          yield page.save();
          status = 202;
        }
      });
    } catch (err) {
      throw new this.app.ZSError('ERROR_INVALID_SOCIAL_TOKEN', 404, err[0] || err);
    }
    this.status = status;
    if (this.status !== 202) {
      throw new this.app.ZSError('ERROR_FACEBOOK_ACCOUNT_PERMISSIONS', 403, 'Your facebook account has not access to requested page');
    }
    return yield next
  }

  static * listMyAccounts(next) {
    let accs = [], socialAccounts = [];
    if (isWhitelisted(this.request.ip) && this.headers.server === 'true') {
      socialAccounts = yield AccountsModel.getAccountsPrivate(this.state.authUser.masterId);
    } else {
      socialAccounts = yield AccountsModel.getAccounts(this.state.authUser.masterId);
    }
    let sharedAccounts = yield TeamModel.listSharedAccounts(this.state.authUser.id);
    /** transformuji objekt na pole */
    for (var acc in socialAccounts) {
      socialAccounts[acc].map((item) => {
        let page = item.get();
        page.network = acc;
        let shared = sharedAccounts[acc].filter((sharedAccount)=> {
          return sharedAccount.id === page.id
        });
        /** jestli mam ucet nasdileny, tak ho vypisu, jinak zahodim */
        if (shared.length || this.state.authUser.masterId === this.state.authUser.id) {
          // return network specific page id
          let id;
          if (acc === AccountsModel.NETWORKS.API || acc === AccountsModel.NETWORKS.EMAIL || acc === AccountsModel.NETWORKS.TWITTER || acc === AccountsModel.NETWORKS.INSTAGRAM) {
            id = page.id;
          } else {
            id = page.page_id;
          }
          let obj = {
            id: id.toString(),
            name: page.name,
            network: AccountsModel.NETWORKS.GOOGLE === acc ? 'googleplus' : acc,
            image:Replace.replaceHttp(page.image)  || 'https://www.zoomsphere.com/css/images/email.png',
            grant: shared[0] && shared[0].grant ? shared[0].grant : null,
            username: page.username || null,
            user_id: this.state.authUser.masterId,
            account_id: page.account_id
          };
          let link = UsersAccounts.createSocialPageLink(id, acc);
          if (link) {
            obj.link = link;
          }
          if (isWhitelisted(this.request.ip) && this.headers.server === 'true' && page.access_token) {
            obj.access_token = page.access_token
          }
          accs.push(obj);
        }
      });
    }
    this.body = _.sortBy(accs, ['network', 'name']);
    return yield next;
  }

  static createSocialPageLink(pageId, network) {
    switch (network) {
      case AccountsModel.NETWORKS.FACEBOOK:
        return 'https://www.facebook.com/' + pageId;
        break;
      case AccountsModel.NETWORKS.GOOGLE:
        return 'https://plus.google.com/' + pageId;
        break;
      case AccountsModel.NETWORKS.LINKEDIN:
        return 'https://www.linkedin.com/company/' + pageId;
        break;
      case AccountsModel.NETWORKS.YOUTUBE:
        return 'https://www.youtube.com/channel/' + pageId;
        break;
      default:
        return null;
        break;
    }
  }

  static * getExternalProfile(next) {
    var result = va.run(this, [va.BODY], {
      url: va.string().required()
    });
    if (result.url.indexOf('http://') === -1 && result.url.indexOf('https://') === -1) {
      result.url = 'http://' + result.url;
    }
    let urlObj = url.parse(result.url);
    let profile;
    if (urlObj.hostname.indexOf('facebook.com') !== -1) {
      let pathname = urlObj.pathname.substring(1).split('/');
      var matches_array = pathname[0].match(/\-(\d+)/i);
      if (matches_array) {
        pathname[0] = matches_array[1];
        //https://www.facebook.com/TJ-SPARTAK-MYJAVA-ofici%C3%A1lna-str%C3%A1nka-180806588649178/
      }
      let tokens = yield AccountsModel.listRandomFacebookTokens();
      yield koaMap.mapDelay(tokens, 0, function *(token) {
        try {
          if (!profile) {
            profile = yield Facebook.getExternalProfile(token.access_token.access_token, pathname[0]);
          }
        } catch (e) {
          console.log(e);
        }
      });

    } else if (urlObj.hostname.indexOf('instagram.com') !== -1) {
      let pathname = urlObj.pathname.substring(1).split('/');
      let tokens = yield AccountsModel.listRandomInstagramTokens();
      yield koaMap.mapDelay(tokens, 0, function *(token) {
        try {
          if (!profile) {
            profile = yield Instagram.getExternalProfile(token.access_token.access_token, pathname[0]);
          }
        } catch (e) {
          console.log(e);
        }
      });

    } else if (urlObj.hostname.indexOf('twitter.com') !== -1) {
      let pathname = urlObj.pathname.substring(1).split('/');
      let tokens = yield AccountsModel.listRandomTwitterTokens();
      yield koaMap.mapDelay(tokens, 0, function *(token) {
        try {
          if (!profile) {
            profile = yield Twitter.getExternalProfile(token.access_token.oauth_token, token.access_token.oauth_token_secret, pathname[0]);
          }
        } catch (e) {
          console.log(e);
        }
      });

    } else if (urlObj.hostname.indexOf('plus.google.com') !== -1) {
      let pathname = urlObj.pathname.substring(1).split('/');
      let tokens = yield AccountsModel.listRandomGoogleTokens();
      yield koaMap.mapDelay(tokens, 0, function *(token) {
        try {
          if (!profile) {
            profile = yield Google.getExternalProfile(token.access_token, pathname[0]);
          }
        } catch (e) {
          console.log(e);
        }
      });

    }
    if (!profile) {
      throw new this.app.ZSError('error_not_found', 404, 'Requested profile or page doesn\'t exist');
    }
    profile.id = String(profile.id);
    this.body = {profile: profile};
    return yield next;
  }
}

module.exports = UsersAccounts;