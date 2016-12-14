'use strict';
var sequelize = require('sequelize'),
  db = require(__dirname + '/../../../services').db,
  Utils = require(__dirname + '/../helpers/utils'),
  Replace = require(__dirname + '/../helpers/replace'),
  ZSError = require('zs-error'),
  Workspaces = require('./workspaces'),
  UserLabelSchema = db.import(__dirname + '/../schemas/user_label_outgoing'),
  ModulesSchema = db.import(__dirname + '/../schemas/ec_module'),
  StatusSchema = db.import(__dirname + '/../schemas/postbox_status');

var defaultLabels = [
  {name: 'Webinar', color: '#9065cb'},
  {name: 'Just for fun', color: '#79c7d5'},
  {name: 'Contest', color: '#62af5e'},
  {name: 'Product Information', color: '#ec9f51'},
  {name: 'Infographic', color: '#9a9ea7'},
  {name: 'Hard Sell', color: '#fc8366'},
  {name: 'Case study', color: '#5290d9'}
];

var defaultStatuses = [{
  'name': 'Private draft',
  'access_read': 'owner',
  'access_write': 'owner',
  'publish': false,
  'color': '#FFFFFF',
  'bgcolor': '#00CCFF'
}, {
  'name': 'Waiting for Documents',
  'access_read': 'admin,owner',
  'access_write': 'admin,owner',
  'publish': false,
  'color': '#FFFFFF',
  'bgcolor': '#996600'
}, {
  'name': 'To Approve',
  'access_read': 'admin,client,owner',
  'access_write': 'admin,client,owner',
  'publish': false,
  'color': '#FFFFFF',
  'bgcolor': '#FF9900'
}, {
  'name': 'Approved',
  'access_read': 'admin,client,editor',
  'access_write': 'admin,client',
  'publish': true,
  'color': '#FFFFFF',
  'bgcolor': '#00FF00'
}, {
  'name': 'Approved, not to publish',
  'access_read': 'admin,client,editor',
  'access_write': 'admin,client',
  'publish': false,
  'color': '#FFFFFF',
  'bgcolor': '#009900'
}, {
  'name': 'Sent',
  'access_read': 'admin,client,owner,editor',
  'publish': false,
  'color': '#000000',
  'bgcolor': '#b5b5b5',
  'sent': true
}];

class Publisher {

  static * listLabels(userId) {
    let where = {user_id: userId};
    let rows = yield UserLabelSchema.findAll({attributes: ['id', 'name', 'color', 'workspace_id'], where: where});
    if (!rows[0]) {
      yield Publisher.createLabels(userId, null);
      rows = yield UserLabelSchema.findAll({attributes: ['id', 'name', 'color', 'workspace_id'], where: where});
    }
    return rows.map((row) => {
      row.color = Utils.transformColors(row.color);
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
      return Publisher.saveLabel(userId, workspaceId, label);
    })
  }

  static * saveLabel(userId, workspaceId, label) {
    let row;
    label.color = Utils.transformColors(label.color);
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

  static * listPosts(moduleId, isMaster, userId, opts) {
    let module = yield ModulesSchema.findOne({where: {id: moduleId}});
    let and = [];
    if (opts.status_id) {
      and.push('sc.status_id = $status_id')
    }
    if (opts.label_id) {
      and.push('sc.label_id = $label_id')
    }
    if (opts.user_id) {
      and.push('sc.user_id = $user_id')
    }

    /** list posts */
    let posts = yield db.query(
      ' SELECT sc.id, sc.user_id, sc.message, sc.date_publish, sc.date_send, st.id statusId, st.name statusName, st.color statusColor, st.bgcolor statusBgColor,' +
      ' l.id labelId, IFNULL(l.name, "") labelName, IFNULL(l.color, "") labelColor, st.access_read, st.access_write' +
      ' FROM postbox_schedule sc' +
      ' JOIN postbox_status st ON st.id = sc.status_id' +
      ' LEFT JOIN user_label_outgoing l ON l.id = sc.label_id' +
      ' WHERE st.workspace_id = $workspaceId AND st.user_id = $userId AND date_publish BETWEEN FROM_UNIXTIME($from) AND FROM_UNIXTIME($to) ' + (and.length ? and.join(' AND ') : '') +
      ' ORDER BY sc.date_publish ' + opts.order +
      ' LIMIT $limit', {
        bind: Object.assign({userId: module.user_id, workspaceId: module.workspace_id}, opts),
        type: sequelize.QueryTypes.SELECT
      });

    /** transform posts structure and get list of social pages */
    let socialPages = {};
    posts = posts.map((post) => {
      let msg = JSON.parse(post.message);
      getSocialNetworks(msg.source, socialPages);
      return {
        id: post.id,
        date_publish: post.date_publish,
        date_send: post.date_send,
        message: {
          attachment: Replace.replaceHttp(msg.attachment),
          attachment_description: msg.attachment_description,
          link_image: msg.link_image,
          link_summary: msg.link_summary,
          link_title: msg.link_title,
          source: msg.source,
          response: msg.response,
          message: msg.message
        },
        status: {
          id: post.statusId,
          name: post.statusName,
          color: Utils.transformColors(post.statusColor),
          backgroundColor: Utils.transformColors(post.statusBgColor)
        },
        label: {
          id: post.labelId,
          name: post.labelName,
          color: Utils.transformColors(post.labelColor)
        },
        access: {
          read: post.access_read.split(','),
          write: post.access_write.split(',')
        },
        owner: post.user_id
      };
    });

    if (!isMaster) {
      /** get socail pages grants */
      var grants = yield getUsersGrants(userId, socialPages);
    }

    /** filter only visible posts for user */
    return posts.filter((post) => {
      if (opts.site) {
        if (!post.message.source[opts.site]) {
          return false;
        } else if (post.message.source[opts.site] !== opts.account_id) {
          return false;
        }
      }
      if (!isMaster) {
        let returnValue = false;
        let requiredGrants = post.access.write.concat(post.access.read);
        for (let sourceName in post.message.source) {
          if (post.message.source.hasOwnProperty(sourceName)) {
            Object.keys(post.message.source[sourceName]).forEach((page_id) => {
              if (grants[sourceName] && grants[sourceName][page_id]
                && ((requiredGrants.indexOf('admin') !== -1 && grants[sourceName][page_id].publisher)
                || (requiredGrants.indexOf('editor') !== -1 && (grants[sourceName][page_id].publisher_editor || grants[sourceName][page_id].publisher))
                || (requiredGrants.indexOf('client') !== -1 && (grants[sourceName][page_id].publisher_client || grants[sourceName][page_id].publisher))
                || (requiredGrants.indexOf('owner') !== -1 && userId === post.owner))
              ) {
                returnValue = returnValue | true;
              }
            })
          }
        }
        return returnValue;
      }
      return true;
    })
  }

  static * listWorkspaceStatuses(workspaceId, masterId) {
    if (workspaceId === 0) {
      workspaceId = null;
    }
    let statuses = yield StatusSchema.findAll({
      attributes: ['id', 'name', 'color', 'access_read', 'access_write', 'publish', 'bgcolor', 'sent'],
      where: {user_id: masterId, workspace_id: workspaceId}
    });
    if (!statuses[0]) {
      yield Publisher.createStatuses(masterId, workspaceId);
      statuses = yield StatusSchema.findAll({
        attributes: ['id', 'name', 'color', 'access_read', 'access_write', 'publish', 'bgcolor', 'sent'],
        where: {user_id: masterId, workspace_id: workspaceId}
      });
    }
    return statuses.map((status) => {
      status.color = Utils.transformColors(status.color);
      status.bgcolor = Utils.transformColors(status.bgcolor);
      return status;
    });
  }

  static * createStatuses(userId, workspaceId) {
    let ws = yield Workspaces.exists(userId, workspaceId);
    if (!ws) {
      throw new ZSError('error_not_found', 404, 'Workspace not found');
    }
    return yield StatusSchema.bulkCreate(defaultStatuses.map((item) => {
      return {
        name: item.name,
        color: item.color,
        access_read: item.access_read,
        access_write: item.access_write || '',
        publish: item.publish,
        bgcolor: item.bgcolor,
        sent: item.sent || false,
        user_id: userId,
        workspace_id: workspaceId
      };
    }))
  }

  static * listLabelsInWorkspace(userId, workspaceId) {
    let where = {user_id: userId, workspace_id: workspaceId == 0 ? null : workspaceId};
    let rows = yield UserLabelSchema.findAll({attributes: ['id', 'name', 'color'], where: where});
    if (!rows[0]) {
      yield Publisher.createLabels(userId, workspaceId == 0 ? null : workspaceId);
      rows = yield UserLabelSchema.findAll({attributes: ['id', 'name', 'color'], where: where});
    }
    return rows.map((row) => {
      row.color = Utils.transformColors(row.color);
      return row;
    });
  }

  static * listUserLabelsWithoutId(userId) {
    let rows = yield UserLabelSchema.findAll({attributes: ['id', 'name', 'color', 'workspace_id'], where: {user_id: userId}});
    return rows.map((row) => {
      row.color = Utils.transformColors(row.color);
      row.workspace_id = row.workspace_id || 0;
      return row;
    });
  }

  static * publisherStatuses(userId) {
    let statuses = yield StatusSchema.findAll({
      attributes: ['id', 'name', 'color', 'access_read', 'access_write', 'publish', 'bgcolor', 'sent', 'workspace_id'],
      where: {user_id: userId}
    });
    return statuses.map((status) => {
      status.color = Utils.transformColors(status.color);
      status.bgcolor = Utils.transformColors(status.bgcolor);
      status.workspace_id = status.workspace_id || 0;
      return status;
    });
  }
}

module.exports = Publisher;

function getSocialNetworks(source, accounts) {
  for (let name in source) {
    if (['facebook', 'google', 'linkedin', 'youtube', 'twitter', 'instagram', 'api', 'email'].filter((account_name) => {
        return name === account_name
      }).length > 0) {
      if (!accounts[name]) {
        accounts[name] = []
      }
      Object.keys(source[name]).forEach((account_id) => {
        accounts[name].push(account_id);
      })
    }
  }
  return accounts;
}

function * getUsersGrants(userId, socialPages) {
  let grants = {};
  for (let account in socialPages) {
    if (socialPages.hasOwnProperty(account)) {
      let accountsGrants;
      switch (account) {
        case 'facebook':
          accountsGrants = yield db.query(
            ' SELECT page_id id, `grant`' +
            ' FROM share_facebook_page sh' +
            ' JOIN user_facebook_page page ON sh.user_facebook_page_id = page.id' +
            ' WHERE page.page_id IN ($page_ids) AND sh.to_user_id = $to_user_id ', {
              bind: {to_user_id: userId, page_ids: socialPages[account]},
              type: sequelize.QueryTypes.SELECT
            });
          break;
        case 'google':
          accountsGrants = yield db.query(
            ' SELECT page_id id, `grant`' +
            ' FROM share_google_page sh' +
            ' JOIN user_google_page page ON sh.user_google_page_id = page.id' +
            ' WHERE page.page_id IN ($page_ids) AND sh.to_user_id = $to_user_id ', {
              bind: {to_user_id: userId, page_ids: socialPages[account]},
              type: sequelize.QueryTypes.SELECT
            });
          break;
        case 'linkedin':
          accountsGrants = yield db.query(
            ' SELECT page_id id, `grant`' +
            ' FROM share_linkedin_page sh' +
            ' JOIN user_linkedin_page page ON sh.user_linkedin_page_id = page.id' +
            ' WHERE page.page_id IN ($page_ids) AND sh.to_user_id = $to_user_id ', {
              bind: {to_user_id: userId, page_ids: socialPages[account]},
              type: sequelize.QueryTypes.SELECT
            });
          break;
        case 'youtube':
          accountsGrants = yield db.query(
            ' SELECT user_youtube_channel_id id, `grant`' +
            ' FROM share_youtube_channel sh' +
            ' JOIN user_youtube_channel page ON sh.user_youtube_channel_id = page.id' +
            ' WHERE page.user_youtube_channel_id IN ($page_ids) AND sh.to_user_id = $to_user_id ', {
              bind: {to_user_id: userId, page_ids: socialPages[account]},
              type: sequelize.QueryTypes.SELECT
            });
          break;
        case 'twitter':
          accountsGrants = yield db.query(
            ' SELECT account_id id, `grant` FROM twitterAdmins' +
            ' WHERE account_id IN ($page_ids) AND user_id = $to_user_id ', {
              bind: {to_user_id: userId, page_ids: socialPages[account]},
              type: sequelize.QueryTypes.SELECT
            });
          break;
        case 'instagram':
          accountsGrants = yield db.query(
            ' SELECT account_id id, `grant` FROM instagramAdmins' +
            ' WHERE account_id IN ($page_ids) AND user_id = $to_user_id ', {
              bind: {to_user_id: userId, page_ids: socialPages[account]},
              type: sequelize.QueryTypes.SELECT
            });
          break;
      }
      if (accountsGrants.length > 0) {
        grants[account] = {};
        accountsGrants.forEach((grant) => {
          grants[account][grant.id] = JSON.parse(grant.grant)
        })
      }
    }
  }
  return grants;
}