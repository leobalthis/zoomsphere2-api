'use strict';
var elastic = require(__dirname + '/../../../services').elasticSearch,
  cache = require('./cache'),
  moment = require('moment');

class Chat {

  static * createChannel(namespaceId, channelName, creator, policy, general, members) {
    let res = yield elastic.create({
      index: 'chat-channels',
      type: getNamespaceId(namespaceId),
      body: {
        name: channelName,
        creator: creator,
        policy: policy,
        general: general,
        is_channel: true,
        '@timestamp': moment().valueOf(),
        members: members
      }
    });
    yield Chat.saveMessage(namespaceId, members[0], new Date().getTime(), {
      "text": "Joined channel",
      "user": creator,
      "ts": new Date().getTime()
    });
    yield delay();
    return yield Chat.getChannel(namespaceId, res[0]._id);
  }

  static * createIM(namespaceId, creator, id, members) {
    let im = {
      creator: creator,
      members: members,
      '@timestamp': moment().valueOf()
    };
    members.length > 2 ? im.is_mim = true : im.is_im = true;
    let res = yield elastic.create({
      index: 'chat-channels',
      type: getNamespaceId(namespaceId),
      id: id,
      body: im
    });
    yield delay();
    return yield Chat.getIM(namespaceId, res[0]._id);
  }

  static * getIM(namespaceId, id) {
    return yield Chat.getChannel(namespaceId, id);
  }

  static * getChannel(namespaceId, channelName) {
    let res = yield elastic.get({
      index: 'chat-channels',
      type: getNamespaceId(namespaceId),
      id: channelName
    });
    return composeChannel(res);
  }

  static * getChannelByName(namespaceId, channelName) {
    let res = yield elastic.search({
      index: 'chat-channels',
      type: getNamespaceId(namespaceId),
      q: 'name: "' + channelName + '"'
    });
    return res.total ? res.hits : null;
  }

  static * listChannels(namespaceId) {
    let res = yield elastic.search({
      index: 'chat-channels',
      type: getNamespaceId(namespaceId),
      size: 1000
    });
    if (res.total) {
      return res.hits.map((channel) => {
        return composeChannel(channel);
      })
    } else {
      return []
    }
  }

  static * removeChannel(namespaceId, channelName) {
    return yield cache.get('channels:' + getNamespaceId(namespaceId), channelName, {delete: true});
  }

  static * joinChannel(namespaceId, channelId, userId) {
    let res = yield elastic.update({
      index: 'chat-channels',
      type: getNamespaceId(namespaceId),
      id: channelId,
      body: {
        script: {
          lang: 'groovy',
          id: 'chat-add-member',
          params: {members: userId}
        }
      }
    });
    return yield delay(res);
  }

  static * joinGeneral(namespaceId, userId, socketId) {
    let ns = Chat.addSocket(getNamespaceId(namespaceId), userId, socketId);
    let general = yield Chat.getGeneral(namespaceId);
    if (!general) {
      general = yield Chat.createChannel(getNamespaceId(namespaceId), 'general', null, Chat.POLICIES.PUBLIC, true, [userId]);
    }
    yield Chat.joinChannel(getNamespaceId(namespaceId), general.id, userId);
    return yield {ns: ns};
  }

  static * getGeneral(namespaceId) {
    let res = yield elastic.search({
      index: 'chat-channels',
      type: getNamespaceId(namespaceId),
      q: 'general:true'
    });
    return res.total ? composeChannel(res.hits[0]) : null;
  }

  static * leaveChannel(namespaceId, channelId, userId) {
    let res = yield elastic.update({
      index: 'chat-channels',
      type: getNamespaceId(namespaceId),
      id: channelId,
      body: {
        script: {
          lang: 'groovy',
          id: 'chat-remove-member',
          params: {members: userId}
        }
      }
    });
    return res;
  }

  static * isMemberOfChannel(namespaceId, channelId, userId) {
    let res = yield elastic.search({
      index: 'chat-channels',
      type: getNamespaceId(namespaceId),
      q: '_id:' + channelId + ' && members:' + userId
    });
    return res.total;
  }

  static * listMembersOfChannel(namespaceId, channelId) {
    let channel = yield Chat.getChannel(namespaceId, channelId);
    return channel.members || null;
  }

  static * addSocket(namespaceId, userId, socketId) {
    return yield cache.addToSet('users:' + getNamespaceId(namespaceId) + ':' + userId, 'sockets', socketId);
  }

  static * removeSocket(namespaceId, userId, socketId) {
    return yield cache.removeFromSet('users:' + getNamespaceId(namespaceId) + ':' + userId, 'sockets', socketId);
  }

  static * listUsersOfNamespace(namespaceId) {
    return yield cache.listSpace('users:' + getNamespaceId(namespaceId));
  }

  static * listSocketsOfUser(namespaceId, userId) {
    return yield cache.membersOfSet('users:' + getNamespaceId(namespaceId) + ':' + userId, 'sockets');
  }

  static * listAllChannels(namespaceId, userId) {
    let allChannels = yield Chat.listChannels(namespaceId);
    let res = yield allChannels.filter((channel) => {
      channel.is_member = false;
      if (channel.members.indexOf(userId) !== -1) {
        channel.is_member = true;
        channel.latest = Chat.getLastMessageTimestamp(namespaceId, channel.id);
        channel.lastRead = Chat.getLastReadMessage(namespaceId, userId, channel.id);
        return true;
      } else {
        if (channel.policy === Chat.POLICIES.PUBLIC) {
          return true;
        }
      }
    });
    return res
  }

  static * listChannelsOfUser(namespaceId, userId) {
    let res = yield elastic.search({
      index: 'chat-channels',
      type: getNamespaceId(namespaceId),
      q: 'members:' + userId,
      size: 1000
    });
    return res.total ? res.hits.map(composeChannel) : [];
  }

  static * saveMessage(namespaceId, channelId, timestamp, message) {
    return yield elastic.create({
      index: 'chat-messages',
      type: getNamespaceId(namespaceId),
      body: {
        channel: channelId,
        message: message,
        '@timestamp': timestamp
      }
    });
  }

  static * listMessages(namespaceId, channelId, timestamp) {
    let res = yield elastic.search({
      index: 'chat-messages',
      type: getNamespaceId(namespaceId),
      body: {
        query: {
          "bool": {
            "must": [
              {
                "range": {
                  "@timestamp": {
                    "lte": timestamp
                  }
                }
              },
              {
                "match": {
                  "channel": channelId
                }
              }
            ]
          }
        },
        sort: [
          {'@timestamp': {order: 'desc'}}
        ]
      },
      size: 5
    });
    if (res.total) {
      return res.hits.map((msg) => {
        let message = msg._source.message;
        message.channel = msg._source.channel;
        return message;
      })
    } else {
      return []
    }
  }

  static * countMessages(namespaceId, channelId, from, to) {
    return yield elastic.count({
      index: 'chat-messages',
      type: getNamespaceId(namespaceId),
      body: {
        query: {
          "bool": {
            "must": [
              {
                "range": {
                  "@timestamp": {
                    "lte": to,
                    "gte": from
                  }
                }
              },
              {
                "match": {
                  "channel": channelId
                }
              }
            ]
          }
        },
        sort: [
          {'@timestamp': {order: 'desc'}}
        ]
      }
    });
  }

  static * getLastMessageOfChannel(namespaceId, channelId) {
    let res = yield elastic.search({
      index: 'chat-messages',
      type: getNamespaceId(namespaceId),
      body: {
        query: {
          "match": {
            "channel": channelId
          }
        },
        sort: [
          {'@timestamp': {order: 'desc'}}
        ]
      },
      size: 1
    });
    if (res.total) {
      let message = res.hits[0]._source.message;
      message.channel = res.hits[0]._source.channel;
      return message;
    } else {
      return false
    }
  }

  static * getLastMessageTimestamp(namespaceId, channelId) {
    let msg = yield Chat.getLastMessageOfChannel(namespaceId, channelId);
    return msg.ts || 0;
  }

  static * getNumberOfChannels(namespaceId) {
    let res = yield elastic.count({index: 'chat-channels', type: getNamespaceId(namespaceId)});
    return res;
  }

  static * setLastReadMessage(namespaceId, userId, channelId, ts) {
    return yield cache.setSingleValue('users:' + getNamespaceId(namespaceId) + ':' + userId + ':' + 'readMessages', channelId, ts);
  }

  static * getLastReadMessage(namespaceId, userId, channelId) {
    let ts = yield cache.getSingleValue('users:' + getNamespaceId(namespaceId) + ':' + userId + ':' + 'readMessages', channelId);
    return ts || 0;
  }

  static * listLastReadMessages(namespaceId, userId) {
    return yield cache.listSingleValues('users:' + getNamespaceId(namespaceId) + ':' + userId + ':' + 'readMessages');
  }
}

function * delay(returnValue, milliseconds) {
  if (!milliseconds) {
    milliseconds = 1000;
  }
  return yield new Promise((resolve, reject) => {
    setTimeout(() => {
      returnValue ? resolve(returnValue) : resolve();
    }, milliseconds);
  });
}

function getNamespaceId(namspace) {
  return String(namspace).replace('/', '');
}
Chat.POLICIES = {
  PUBLIC: 'public',
  PRIVATE: 'private'
};

function composeChannel(channelSource) {
  if (channelSource && channelSource._id) {
    let obj = {
      id: channelSource._id,
      name: channelSource._source.name,
      created: channelSource._source['@timestamp'],
      creator: channelSource._source.creator,
      general: channelSource._source.general,
      is_channel: channelSource._source.is_channel,
      members: channelSource._source.members
    };
    if (channelSource._source.is_channel) {
      obj.is_channel = channelSource._source.is_channel;
      obj.policy = channelSource._source.policy;
    } else if (channelSource._source.is_im) {
      obj.is_im = channelSource._source.is_im;
    } else if (channelSource._source.is_mim) {
      obj.is_mim = channelSource._source.is_mim;
    }
    return obj;
  } else {
    return null;
  }
}

module.exports = Chat;