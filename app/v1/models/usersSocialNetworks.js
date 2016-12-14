'use strict';
var sequelize = require('sequelize'),
  sha1 = require('sha1'),
  crypt = require(__dirname + '/../helpers/crypt'),
  File = require(__dirname + '/../helpers/file'),
  Replace = require('../helpers/replace'),
  db = require(__dirname + '/../../../services').db;

var UserAccountSchema = db.import(__dirname + '/../schemas/user_account');
var FacebookPageSchema = db.import(__dirname + '/../schemas/user_facebook_page');
var GooglePageSchema = db.import(__dirname + '/../schemas/user_google_page');
var LinkedinPageSchema = db.import(__dirname + '/../schemas/user_linkedin_page');
var YoutubePageSchema = db.import(__dirname + '/../schemas/user_youtube_channel');
var EmailSchema = db.import(__dirname + '/../schemas/email');
var APISchema = db.import(__dirname + '/../schemas/user_api_profile');

var publicAttributes = ['id', 'name', 'account', 'account_id', 'image', 'expires'];

class UsersSocialNetworksModel {

  static * getDetail(id, userId) {
    return parseJson(yield UserAccountSchema.findOne({where: {id: id, user_id: userId}}));
  }

  static * getFacebookPage(pageId) {
    let res = yield FacebookPageSchema.findOne({
      attributes: ['id', 'page_id', 'user_id', 'account_id', 'name', 'image', 'username'],
      where: {id: pageId}
    });
    res.image = Replace.replaceHttp(res.image);
    return res;
  }

  static * listUsersFacebookPages(userId) {
    let res = yield FacebookPageSchema.findAll({
      attributes: ['id', 'page_id', 'account_id', 'name', 'image', 'invalid', 'username'],
      where: {user_id: userId},
      order: [['name', 'ASC']]
    });
    return res.map((item) => {
      item.image = Replace.replaceHttp(item.image);
      return item;
    }) 
  }

  static * listUsersFacebookPagesPrivate(userId) {
    return yield FacebookPageSchema.findAll({
      where: {user_id: userId},
      order: [['name', 'ASC']]
    });
  }

  static * listGooglePages(accountId, userId) {
    let res = yield GooglePageSchema.findAll({
      attributes: ['id', 'page_id', 'account_id', 'name', 'image'],
      where: {user_id: userId, account_id: accountId}
    });
    return res.map((item) => {
      item.image = Replace.replaceHttp(item.image);
      return item;
    })
  }

  static * listUsersGooglePages(userId) {
    let res = yield GooglePageSchema.findAll({
      attributes: ['id', 'page_id', 'account_id', 'name', 'image'],
      where: {user_id: userId},
      order: [['name', 'ASC']]
    });
    return res.map((item) => {
      item.image = Replace.replaceHttp(item.image);
      return item;
    })
  }

  static * listLinkedinPages(accountId, userId) {
    let res = yield LinkedinPageSchema.findAll({
      attributes: ['id', 'page_id', 'account_id', 'name', 'image'],
      where: {user_id: userId, account_id: accountId}
    });
    return res.map((item) => {
      item.image = Replace.replaceHttp(item.image);
      return item;
    })
  }

  static * listUsersLinkedinPages(userId) {
    let res = yield LinkedinPageSchema.findAll({
      attributes: ['id', 'page_id', 'account_id', 'name', 'image'],
      where: {user_id: userId},
      order: [['name', 'ASC']]
    });
    return res.map((item) => {
      item.image = Replace.replaceHttp(item.image);
      return item;
    })
  }

  static * listUsersYoutubePages(userId) {
    let res = yield YoutubePageSchema.findAll({
      attributes: ['id', ['channel_id', 'page_id'], 'name', 'image'],
      where: {user_id: userId},
      order: [['name', 'ASC']]
    });
    return res.map((item) => {
      item.image = Replace.replaceHttp(item.image);
      return item;
    })
  }

  static * listUsersYoutubePagesPrivate(userId) {
    let accs = yield YoutubePageSchema.findAll({
      attributes: ['id', ['channel_id', 'page_id'], 'user_id', 'created', 'name', 'image', 'access_token'],
      where: {user_id: userId},
      order: [['name', 'ASC']]
    });
    return accs.map(parseJson);
  }

  static * listUsersTwitterAccounts(userId) {
    return yield UserAccountSchema.findAll({
      attributes: [['account_id', 'id'], 'name', 'image'],
      where: {user_id: userId, account: this.NETWORKS.TWITTER},
      order: [['name', 'ASC']]
    });
  }

  static * listUsersTwitterAccountsPrivate(userId) {
    let accs = yield UserAccountSchema.findAll({
      where: {user_id: userId, account: this.NETWORKS.TWITTER},
      order: [['name', 'ASC']]
    });
    return accs.map(parseJson);
  }

  static * listUsersInstagramAccounts(userId) {
    return yield UserAccountSchema.findAll({
      attributes: [['account_id', 'id'], 'name', 'image'],
      where: {user_id: userId, account: this.NETWORKS.INSTAGRAM},
      order: [['name', 'ASC']]
    });
  }

  static * listUsersInstagramAccountsPrivate(userId) {
    let accs = yield UserAccountSchema.findAll({
      where: {user_id: userId, account: this.NETWORKS.INSTAGRAM},
      order: [['name', 'ASC']]
    });
    return accs.map(parseJson);
  }

  static * listRandomInstagramTokens(limit) {
    if (!limit) {
      limit = 3;
    }
    let accs = yield UserAccountSchema.findAll({
      attributes: ['access_token'],
      where: {account: this.NETWORKS.INSTAGRAM, invalid: null},
      order: [sequelize.fn('RAND')],
      limit: limit
    });
    return accs.map(parseJson);
  }

  static * listRandomTwitterTokens(limit) {
    if (!limit) {
      limit = 3;
    }
    let accs = yield UserAccountSchema.findAll({
      attributes: ['access_token'],
      where: {account: this.NETWORKS.TWITTER, invalid: null},
      order: [sequelize.fn('RAND')],
      limit: limit
    });
    return accs.map(parseJson);
  }

  static * listRandomGoogleTokens(limit) {
    if (!limit) {
      limit = 3;
    }
    let accs = yield UserAccountSchema.findAll({
      attributes: ['access_token'],
      where: {account: this.NETWORKS.GOOGLE, invalid: null},
      order: [sequelize.fn('RAND')],
      limit: limit
    });
    return accs.map(parseJson);
  }

  static * listRandomFacebookTokens(limit) {
    if (!limit) {
      limit = 3;
    }
    let accs = yield UserAccountSchema.findAll({
      attributes: ['access_token'],
      where: {account: this.NETWORKS.FACEBOOK, invalid: null, expires: {$gt: new Date()}},
      order: [sequelize.fn('RAND')],
      limit: limit
    });
    return accs.map(parseJson);
  }

  static * listUsersEmailSettings(userId) {
    return yield EmailSchema.findAll({attributes: ['id', 'name'], where: {user_id: userId}, order: [['name', 'ASC']]});
  }

  static * listUsersEmailSettingsPrivate(userId) {
    let accs = yield EmailSchema.findAll({where: {user_id: userId}, order: [['name', 'ASC']]});
    return accs.map(parseEmailSettings);
  }

  static * listPublic(userId) {
    var accs = yield UserAccountSchema.findAll({attributes: publicAttributes, where: {user_id: userId}, order: [['name', 'ASC']]});
    let fb = yield this.listUsersFacebookPages(userId);
    let google = yield this.listUsersGooglePages(userId);
    let linkedin = yield this.listUsersLinkedinPages(userId);
    let yt = yield this.listUsersYoutubePages(userId);
    let email = UsersSocialNetworksModel.listEmailSettings(userId);
    let api = UsersSocialNetworksModel.listApiSettings(userId);
    let fbAccs = yield UsersSocialNetworksModel.listAccountsPhotoName(userId, fb.map((acc) => {
      return acc.account_id
    }), this.NETWORKS.FACEBOOK);
    let gAccs = yield UsersSocialNetworksModel.listAccountsPhotoName(userId, google.map((acc) => {
      return acc.account_id
    }), this.NETWORKS.GOOGLE);
    let liAccs = yield UsersSocialNetworksModel.listAccountsPhotoName(userId, linkedin.map((acc) => {
      return acc.account_id
    }), this.NETWORKS.LINKEDIN);
    fb = addProfileToPage(fb, fbAccs);
    google = addProfileToPage(google, gAccs);
    linkedin = addProfileToPage(linkedin, liAccs);
    return accToObject(accs, fb, google, linkedin, yt, yield email, yield api);
  }

  static * listAccountsPhotoName(userId, accountIds, account) {
    let res = yield UserAccountSchema.findAll({
      attributes: ['account_id', 'name', 'image'],
      where: {user_id: userId, account_id: accountIds, account: account},
      group: 'account_id'
    });
    return res.map((item) => {
      item.image = Replace.replaceHttp(item.image);
      return item;
    })
  }

  static * createYoutubeChannel(userId, newChannel) {
    var channel = yield YoutubePageSchema.findOne({where: {user_id: userId, channel_id: newChannel.channel_id}});
    if (channel) {
      channel.access_token = newChannel.access_token;
      channel = yield channel.save();
    } else {
      newChannel.created = sequelize.fn('now');
      newChannel.user_id = userId;
      channel = yield YoutubePageSchema.create(newChannel)
    }
    return channel;
  }

  static * createLinkedinPage(user_id, account_id, page) {
    let newPage = {
      name: page.name, image: page.image, account_id,
      created: sequelize.fn('now')
    };
    return yield LinkedinPageSchema.findOrCreate({where: {user_id: user_id, page_id: page.id}, defaults: newPage});
  }

  static * createPage(account, user_id, account_id, pageProperties) {
    try {
      let format = yield File.getContentTypeFromUrl(pageProperties.image);
      let resp = yield File.uploadStream(pageProperties.image, format);
      pageProperties.image = resp.url;
    } catch (e) {
      console.error(e)
    }

    if (account == this.NETWORKS.LINKEDIN) {
      return yield UsersSocialNetworksModel.createLinkedinPage(user_id, account_id, pageProperties);
    }
    let newPage = {
      user_id,
      page_id: pageProperties.id,
      name: pageProperties.name,
      image: pageProperties.image,
      access_token: pageProperties.access_token,
      account_id,
      created: sequelize.fn('now'),
      last_update: sequelize.fn('now'),
      last_used: sequelize.fn('now')
    };
    var page;
    switch (account) {
      case this.NETWORKS.FACEBOOK:
        page = yield FacebookPageSchema.findOne({
          where: {
            user_id: user_id,
            page_id: pageProperties.id
          }
        });
        if (page) {
          page.access_token = pageProperties.access_token;
          page.image = pageProperties.image;
          page.name = pageProperties.name;
          page.username = pageProperties.username;
          page.last_update = sequelize.fn('now');
          page.invalid = null;
          page = yield page.save();
        } else {
          newPage.username = pageProperties.username;
          page = yield FacebookPageSchema.create(newPage)
        }
        break;
      case this.NETWORKS.GOOGLE:
        page = yield GooglePageSchema.findOne({
          where: {
            user_id: user_id,
            account_id: account_id,
            page_id: pageProperties.id
          }
        });
        if (page) {
          page.image = pageProperties.image;
          page.name = pageProperties.name;
          page.last_update = sequelize.fn('now');
          page = yield page.save();
        } else {
          page = yield GooglePageSchema.create(newPage)
        }
        break;
    }
    return page;
  }

  static * deleteAccount(id, userId) {
    return yield UserAccountSchema.destroy({where: {id: id, user_id: userId}});
  }

  static * deletePage(network, id, userId) {
    var res = null;
    switch (network) {
      case this.NETWORKS.FACEBOOK:
        res = yield FacebookPageSchema.destroy({where: {id: id, user_id: userId}});
        break;
      case this.NETWORKS.GOOGLE:
        res = yield GooglePageSchema.destroy({where: {id: id, user_id: userId}});
        break;
      case this.NETWORKS.YOUTUBE:
        res = yield YoutubePageSchema.destroy({where: {id: id, user_id: userId}});
        break;
      case this.NETWORKS.LINKEDIN:
        res = yield LinkedinPageSchema.destroy({where: {id: id, user_id: userId}});
        break;
    }
    return res;
  }

  static * createAccount(userId, accountId, account, name, token, image, expiresAt, info) {
    var acc = yield UserAccountSchema.findOne({
      attributes: publicAttributes, where: {user_id: userId, account_id: accountId, account: account}
    });
    if(image) {
      try {
        let format = yield File.getContentTypeFromUrl(image);
        let resp = yield File.uploadStream(image, format);
        image = resp.url;
      } catch (e) {
        console.error(e)
      }
    }
    let accountObj = {
      account: account,
      name: name,
      access_token: token,
      image: image || '',
      expires: expiresAt || null,
      accountInfo: info || null
    };
    if (acc) {
      Object.assign(acc, accountObj);
      return yield acc.save()
    } else {
      Object.assign(accountObj, {user_id: userId, account_id: accountId});
      return yield UserAccountSchema.create(accountObj);
    }
  }

  static * getStatistics(userId) {
    let facebook = FacebookPageSchema.count({where: {user_id: userId}});
    let twitter = UserAccountSchema.count({where: {user_id: userId, account: this.NETWORKS.TWITTER}});
    return {facebook: yield facebook, twitter: yield twitter};
  }

  static * saveEmailSettings(settings) {
    let obj = {
      user_id: settings.userId,
      name: settings.name,
      imap_username: settings.imap.username,
      smtp_username: settings.smtp.username,
      imap_password: crypt.encrypt(settings.imap.password),
      smtp_password: crypt.encrypt(settings.smtp.password),
      imap_server: settings.imap.server,
      smtp_server: settings.smtp.server,
      imap_port: settings.imap.port,
      smtp_port: settings.smtp.port,
      imap_secure: settings.imap.secure,
      smtp_secure: settings.smtp.secure,
      settings: JSON.stringify(settings.settings)
    };
    let row;
    if (settings.emailId) {
      row = yield EmailSchema.findOne({where: {id: settings.emailId, user_id: settings.userId}});
    }
    if (row) {
      Object.assign(row, obj);
      return yield row.save();
    } else {
      return yield EmailSchema.create(obj)
    }
  }

  static * listEmailSettings(userId) {
    let row = yield EmailSchema.findAll({where: {user_id: userId}});
    return row.map(parseEmailSettings);
  }

  static * deleteEmailSettings(userId, emailId) {
    return yield EmailSchema.destroy({where: {id: emailId, user_id: userId}});
  }

  static * listApiSettings(userId) {
    let res = yield APISchema.findAll({attributes: ['id', 'name', 'image'], where: {user_id: userId}});
    return res.map((item) => {
      item.image = Replace.replaceHttp(item.image);
      return item;
    })
  }

  static * getAccounts(userId) {
    return {
      facebook: yield this.listUsersFacebookPages(userId),
      google: yield this.listUsersGooglePages(userId),
      linkedin: yield this.listUsersLinkedinPages(userId),
      youtube: yield this.listUsersYoutubePages(userId),
      twitter: yield this.listUsersTwitterAccounts(userId),
      instagram: yield this.listUsersInstagramAccounts(userId),
      api: yield this.listApiSettings(userId),
      email: yield this.listUsersEmailSettings(userId)
    };
  }

  static * getAccountsPrivate(userId) {
    return {
      facebook: yield this.listUsersFacebookPagesPrivate(userId),
      google: yield this.listUsersGooglePages(userId),
      linkedin: yield this.listUsersLinkedinPages(userId),
      youtube: yield this.listUsersYoutubePagesPrivate(userId),
      twitter: yield this.listUsersTwitterAccountsPrivate(userId),
      instagram: yield this.listUsersInstagramAccountsPrivate(userId),
      api: yield this.listApiSettings(userId),
      email: yield this.listUsersEmailSettings(userId)
    };
  }
}
UsersSocialNetworksModel.NETWORKS = {
  FACEBOOK: 'facebook',
  GOOGLE: 'google',
  LINKEDIN: 'linkedin',
  YOUTUBE: 'youtube',
  TWITTER: 'twitter',
  INSTAGRAM: 'instagram',
  API: 'api',
  EMAIL: 'email'
};
module.exports = UsersSocialNetworksModel;

function addProfileToPage(pages, accounts) {
  return pages.map((page) => {
    let acc = accounts.filter((acc) => {
      return acc.account_id == page.account_id
    });
    let xpage = page.get();
    if (acc[0]) {
      xpage.profileName = acc[0].name;
      xpage.profileImage = acc[0].image;
    }
    return xpage
  })
}

function parseJson(acc) {
  if (acc) {
    acc.access_token = JSON.parse(acc.access_token);
    if(acc.image) {
      acc.image = Replace.replaceHttp(acc.image);
    }
  }
  return acc;
}

function accToObject(acc, fb, google, linkedin, yt, email, api) {

  var obj = {
    facebook: {accounts: [], pages: fb},
    twitter: {accounts: []},
    youtube: {pages: yt},
    google: {accounts: [], pages: google},
    linkedin: {accounts: [], pages: linkedin},
    instagram: {accounts: []},
    email: email
  };
  if (api.length > 0) {
    obj.api = api;
  }
  acc.map((item)=> {
    obj[item.account].accounts.push(item)
  });
  return obj
}

function parseEmailSettings(row) {
  if (row) {
    return {
      id: row.id,
      name: row.name,
      imap: {
        username: row.imap_username,
        password: crypt.decrypt(row.imap_password),
        server: row.imap_server,
        port: row.imap_port,
        secure: row.imap_secure
      },
      smtp: {
        username: row.smtp_username,
        password: crypt.decrypt(row.smtp_password),
        server: row.smtp_server,
        port: row.smtp_port,
        secure: row.smtp_secure
      },
      settings: JSON.parse(row.settings)
    }
  }
  return row;
}
