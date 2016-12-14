'use strict';
var sequelize = require('sequelize'),
  sha1 = require('sha1'),
  mailer = require(__dirname + '/../helpers/mailer'),
  cache = require(__dirname + '/../models/cache'),
  db = require(__dirname + '/../../../services').db;

var InviteSchema = db.import(__dirname + '/../schemas/user_invite'),
  ShareSchema = db.import(__dirname + '/../schemas/share_user'),
  ShareFBPagesSchema = db.import(__dirname + '/../schemas/share_facebook_page'),
  InstagramAdminsSchema = db.import(__dirname + '/../schemas/instagramAdmins'),
  ShareAPISchema = db.import(__dirname + '/../schemas/share_api_profile'),
  ShareEmailSchema = db.import(__dirname + '/../schemas/share_email'),
  ShareGooglePagesSchema = db.import(__dirname + '/../schemas/share_google_page'),
  ShareLinkedInPagesSchema = db.import(__dirname + '/../schemas/share_linkedin_page'),
  ShareYoutubeSchema = db.import(__dirname + '/../schemas/share_youtube_channel'),
  TwitterAdminsSchema = db.import(__dirname + '/../schemas/twitterAdmins'),
  UserSchema = db.import(__dirname + '/../schemas/user'),
  Replace = require(__dirname +'/../helpers/replace');

class Teams {

  static * listTeam(user) {
    var share = yield user.getSlaveUser();
    var ids = share.map((acc) => acc.get('to_user_id').toString());
    let res = yield UserSchema.findAll({
      attributes: ['id', ['name', 'fullName'], 'image_square', 'email', 'company', 'position', 'date_logged'],
      where: {id: ids}
    });
    return res.map((item) => {
      item.image_square = Replace.replaceHttp(item.image_square);
      return item;
    })
  }

  static * validateInvitation(hash) {
    let invitation = yield InviteSchema.findOne({where: {hash: hash, status: 'wait'}});
    if (invitation) {
      invitation.status = 'accepted';
      yield invitation.save();
      return invitation.user_id;
    }
    return false;
  }

  static * createConnection(user, teammate) {
    return yield user.createSlaveUser({to_user_id: teammate.id});
  }

  static * createInvitation(teammateId, hash, subject, content) {
    let user = yield UserSchema.findOne({where: {id: teammateId}});
    let boostProtection = yield cache.get(cache.SPACES.TEAM_INVITATION, user.email);
    if (!boostProtection) {
      yield InviteSchema.create({
        hash: hash,
        datetime: sequelize.fn('now'),
        user_id: user.id,
        text: content,
        subject: subject
      });
      yield mailer.sendEmail(user.email, subject, content);
      yield cache.save(cache.SPACES.TEAM_INVITATION, user.email, {sent: true}, 60);
      return true;
    } else {
      return false;
    }
  }

  static * removeConnection(user, teammate) {
    let share = ShareSchema.destroy({where: {to_user_id: teammate.id, from_user_id: user.id}});
    let invite = InviteSchema.destroy({where: {user_id: teammate.id}});
    return {share: yield share, invite: yield invite};
  }

  static * getInvitation(user, settings, id) {
    let hash = sha1(Math.random() + id);
    var email;
    if (settings && settings.inviteTemplate) {
      email = mailer.mergeVariables(settings.inviteTemplate, {HASH: hash, NAME: user.name});
    } else {
      email = mailer.getEmail('team_invitation', 'en', {HASH: hash, NAME: user.name});
    }
    let old = InviteSchema.findAll({
      attributes: ['datetime', ['text', 'content'], 'subject', 'status'],
      where: {user_id: id}
    });
    let em = yield email;
    return {invitation: {subject: em.subject, content: em.content, hash: hash}, previous: yield old};
  }

  static * listSharedAccounts(userId) {
    let sharedPages = {
      facebook: yield ShareFBPagesSchema.findAll({
        attributes: [['user_facebook_page_id', 'id'], 'grant'],
        where: {to_user_id: userId}
      }),
      google: yield ShareGooglePagesSchema.findAll({
        attributes: [['user_google_page_id', 'id'], 'grant'],
        where: {to_user_id: userId}
      }),
      linkedin: yield ShareLinkedInPagesSchema.findAll({
        attributes: [['user_linkedin_page_id', 'id'], 'grant'],
        where: {to_user_id: userId}
      }),
      youtube: yield ShareYoutubeSchema.findAll({
        attributes: [['user_youtube_channel_id', 'id'], 'grant'],
        where: {to_user_id: userId}
      }),
      twitter: yield TwitterAdminsSchema.findAll({
        attributes: [['account_id', 'id'], 'grant'],
        where: {user_id: userId}
      }),
      instagram: yield InstagramAdminsSchema.findAll({
        attributes: [['account_id', 'id'], 'grant'],
        where: {user_id: userId}
      }),
      api: yield ShareAPISchema.findAll({
        attributes: [['user_api_profile_id', 'id'], 'grant'],
        where: {to_user_id: userId}
      }),
      email: yield ShareEmailSchema.findAll({attributes: [['email_id', 'id'], 'grant'], where: {to_user_id: userId}})
    };
    let accs = {};
    for (var acc in sharedPages) {
      accs[acc] = sharedPages[acc].map((item) => {
        let page = item.get();
        page.network = acc;
        try {
          page.grant = JSON.parse(page.grant);
        } catch (e) {
          console.error('JSON parse doesnt work');
        }
        return page
      });
    }
    return accs;
  }

  static * insertSharedAccounts(fromUserId, toUserId, accounts) {
    let toInsert = {};
    accounts.map((acc) => {
      if (acc.shared) {
        if (!toInsert[acc.network]) {
          toInsert[acc.network] = [];
        }
        toInsert[acc.network].push(this.getAccountObject(fromUserId, toUserId, acc.id, acc.network, acc.permissions));
      }
    });
    let fb = ShareFBPagesSchema.bulkCreate(toInsert[this.NETWORKS.FACEBOOK] || []);
    let google = ShareGooglePagesSchema.bulkCreate(toInsert[this.NETWORKS.GOOGLE] || []);
    let li = ShareLinkedInPagesSchema.bulkCreate(toInsert[this.NETWORKS.LINKEDIN] || []);
    let yt = ShareYoutubeSchema.bulkCreate(toInsert[this.NETWORKS.YOUTUBE] || []);
    let tw = TwitterAdminsSchema.bulkCreate(toInsert[this.NETWORKS.TWITTER] || []);
    let ig = InstagramAdminsSchema.bulkCreate(toInsert[this.NETWORKS.INSTAGRAM] || []);
    let api = ShareAPISchema.bulkCreate(toInsert[this.NETWORKS.API] || []);
    let email = ShareEmailSchema.bulkCreate(toInsert[this.NETWORKS.EMAIL] || []);

    return {
      facebook: yield fb,
      google: yield google,
      linkedin: yield li,
      youtube: yield yt,
      twitter: yield tw,
      instagram: yield ig,
      api: yield api,
      email: yield email
    }
  }

  static getAccountObject(fromUserId, toUserId, accountId, type, grant) {
    switch (type) {
      case this.NETWORKS.FACEBOOK:
        return {from_user_id: fromUserId, to_user_id: toUserId, user_facebook_page_id: accountId, grant: JSON.stringify(grant)};
        break;
      case this.NETWORKS.GOOGLE:
        return {from_user_id: fromUserId, to_user_id: toUserId, user_google_page_id: accountId, grant: JSON.stringify(grant)};
        break;
      case this.NETWORKS.LINKEDIN:
        return {from_user_id: fromUserId, to_user_id: toUserId, user_linkedin_page_id: accountId, grant: JSON.stringify(grant)};
        break;
      case this.NETWORKS.YOUTUBE:
        return {from_user_id: fromUserId, to_user_id: toUserId, user_youtube_channel_id: accountId, grant: JSON.stringify(grant)};
        break;
      case this.NETWORKS.TWITTER:
        return {user_id: toUserId, account_id: accountId, grant: JSON.stringify(grant)};
        break;
      case this.NETWORKS.INSTAGRAM:
        return {user_id: toUserId, account_id: accountId, grant: JSON.stringify(grant)};
        break;
      case this.NETWORKS.API:
        return {from_user_id: fromUserId, to_user_id: toUserId, user_api_profile_id: accountId, grant: JSON.stringify(grant)};
        break;
      case this.NETWORKS.EMAIL:
        return {from_user_id: fromUserId, to_user_id: toUserId, email_id: accountId, grant: JSON.stringify(grant)};
        break;
    }
  }

  static * deleteAllSharedAccounts(fromUserId, toUserId) {
    let fb = ShareFBPagesSchema.destroy({where: {from_user_id: fromUserId, to_user_id: toUserId}});
    let google = ShareGooglePagesSchema.destroy({where: {from_user_id: fromUserId, to_user_id: toUserId}});
    let li = ShareLinkedInPagesSchema.destroy({where: {from_user_id: fromUserId, to_user_id: toUserId}});
    let yt = ShareYoutubeSchema.destroy({where: {from_user_id: fromUserId, to_user_id: toUserId}});
    let tw = TwitterAdminsSchema.destroy({where: {user_id: toUserId}});
    let ig = InstagramAdminsSchema.destroy({where: {user_id: toUserId}});
    let api = ShareAPISchema.destroy({where: {from_user_id: fromUserId, to_user_id: toUserId}});
    let email = ShareEmailSchema.destroy({where: {from_user_id: fromUserId, to_user_id: toUserId}});

    return {
      facebook: yield fb,
      google: yield google,
      linkedin: yield li,
      youtube: yield yt,
      twitter: yield tw,
      instagram: yield ig,
      api: yield api,
      email: yield email
    }
  }
}
Teams.NETWORKS = {
  FACEBOOK: 'facebook',
  GOOGLE: 'google',
  LINKEDIN: 'linkedin',
  YOUTUBE: 'youtube',
  TWITTER: 'twitter',
  INSTAGRAM: 'instagram',
  API: 'api',
  EMAIL: 'email'
};
module.exports = Teams;