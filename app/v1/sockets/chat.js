'use strict';
var co = require('co'),
  chatModel = require(__dirname + '/../models/chat'),
  usersModel = require(__dirname + '/../models/users'),
  koaMap = require('koa-map'),
  va = require(__dirname + '/../helpers/validator');

if (!Date.now) {
  Date.now = function () {
    return new Date().getTime();
  }
}

class Chat {

  static * message() {
    var result = va.run(this, [va.BODY], {
      id: va.number().required(),
      channel: va.string().required(),
      text: va.string().required()
    });
    let isMember = yield chatModel.isMemberOfChannel(this.socket.user.nspId, result.channel, this.socket.user.id);
    if (!isMember) {
      throw new Error('You are not member of channel ' + result.channel);
    }
    let timestamp = Date.now();
    let message = {
      user: this.socket.user.id,
      text: result.text,
      ts: timestamp
    };
    yield Chat.sendMessage(this.socket, this.socket.user.nspId, result.channel, message, timestamp);
    this.socket.emit('reply', {
      to: result.id,
      channel: result.channel,
      text: result.text,
      ok: true,
      ts: Date.now()
    });
    yield chatModel.setLastReadMessage(this.socket.user.nspId, this.socket.user.id, result.channel, result.ts);
  }

  static * sendMessage(sio, namespace, channel, message) {
    message.ts = Date.now();
    yield chatModel.saveMessage(String(namespace).replace('/', ''), channel, message.ts, message);
    message.channel = channel;
    sio.to(channel).emit('message', message);
  }

  static * typing() {
    var result = va.run(this, [va.BODY], {channel: va.string().required()});
    let isMember = yield chatModel.isMemberOfChannel(this.socket.user.nspId, result.channel, this.socket.user.id);
    if (!isMember) {
      return false;
    }
    this.socket.to(result.channel).emit('user_typing', {
      user: this.socket.user.id,
      channel: result.channel
    });
  }

  static * disconnect() {
    yield chatModel.removeSocket(this.socket.nsp.name, this.socket.user.id, this.socket.id);
    console.log(this.socket.user.id, 'disconnected from', this.socket.nsp.name);
    this.app.io.of(this.socket.nsp.name).emit('user_left', {
      user: this.socket.user.id
    });
  }

  static * markChannel() {
    var result = va.run(this, [va.BODY], {channel: va.string().required(), ts: va.number().required()});
    let isMember = yield chatModel.isMemberOfChannel(this.socket.user.nspId, result.channel, this.socket.user.id);
    if (!isMember) {
      return false;
    }
    let numUnreadMessages = yield chatModel.countMessages(this.socket.user.nspId, result.channel, result.ts, Date.now());
    yield chatModel.setLastReadMessage(this.socket.user.nspId, this.socket.user.id, result.channel, result.ts);
    let lastMessage = yield chatModel.getLastMessageOfChannel(this.socket.user.nspId, result.channel);
    let lastMsgTimestamp = 0;
    if (lastMessage && lastMessage[0] && lastMessage[0].ts) {
      lastMsgTimestamp = lastMessage[0].ts;
    }
    let mySockets = yield chatModel.listSocketsOfUser(this.socket.user.nspId, this.socket.user.id);
    mySockets.forEach((socket) => {
      if (this.app.io.nsps[this.socket.nsp.name].connected[socket]) {
        this.app.io.nsps[this.socket.nsp.name].connected[socket].emit('channel_marked', {
          channel: result.channel,
          ts: result.ts,
          unreadCount: numUnreadMessages,
          latestMessage: lastMsgTimestamp
        })
      }
    });
  }

  /** vola se jen pri pripojeni/otevreni aplikace, jindy se nevola */
  static * connectSocketsToChannels(io, namespace, userId) {
    let nspId = '/' + String(namespace).replace('/', '');
    let channels = yield chatModel.listChannelsOfUser(namespace, userId);
    let usersSockets = yield chatModel.listSocketsOfUser(namespace, userId);
    return new Promise((resolve, reject) => {
      usersSockets.forEach((socket) => {
        if (io.nsps[nspId].connected[socket]) {
          channels.forEach((channel) => {
            io.nsps[nspId].connected[socket].join(channel.id)
          })
        } else {
          co(chatModel.removeSocket(namespace, userId, socket)).then((res) => {
          })
        }
      });
      return resolve();
    })

  }

  static * connectSocketsToChannel(io, namespace, userId, channelId, channelName, members, creator, created) {
    let nspId = '/' + String(namespace).replace('/', '');
    let usersSockets = yield chatModel.listSocketsOfUser(namespace, userId);
    return new Promise((resolve, reject) => {
      let ts = Date.now();
      usersSockets.forEach((socket) => {
        if (io.nsps[nspId].connected[socket]) {
          io.nsps[nspId].connected[socket].join(channelId);
          io.nsps[nspId].connected[socket].emit('channel_joined', {
            id: channelId,
            is_channel: true,
            name: channelName,
            members: members,
            created: created,
            creator: creator,
            ts: ts
          })
        } else {
          co(chatModel.removeSocket(namespace, userId, socket)).then((res) => {
          })
        }
      });
      return resolve();
    })
  }

  static * connectSocketsToIM(io, namespace, userId, im, members) {
    let nspId = '/' + String(namespace).replace('/', '');
    let usersSockets = yield chatModel.listSocketsOfUser(namespace, userId);
    return new Promise((resolve, reject) => {
      im.members = members;
      im.ts = Date.now();
      usersSockets.forEach((socket) => {
        if (io.nsps[nspId].connected[socket]) {
          io.nsps[nspId].connected[socket].join(im.id);
          io.nsps[nspId].connected[socket].emit('im_joined', im)
        } else {
          co(chatModel.removeSocket(namespace, userId, socket)).then((res) => {
          })
        }
      });
      return resolve();
    })
  }

  static * channelCreated(io, namespace, userId, id, name, created, timestamp, policy) {
    let nspId = '/' + String(namespace).replace('/', '');
    let msg = {
      id: id,
      is_channel: true,
      name: name,
      created: created,
      creator: userId,
      ts: timestamp
    };
    if(policy === chatModel.POLICIES.PRIVATE) {
      io.of(nspId).to(id).emit('channel_created', msg)
    } else {
      io.of(nspId).emit('channel_created', msg)
    }
  }

  static * channelJoined(io, namespace, newMembers, channelId, requester) {
    let nspId = '/' + String(namespace).replace('/', '');
    let members = yield chatModel.listMembersOfChannel(namespace, channelId);
    let text;
    if (newMembers.indexOf(requester) !== -1) {
      /** jsem v novych memberech */
      if (members && newMembers.length === members.length) {
        /** vytvoril jsem channel. Pokud je members.lenght === 1 pak jsem se pripojil jen ja, jinak jsem pozval i dalsi uzivatele */
        text = 'joined the channel';
        if (newMembers.length !== 1) {
          newMembers.splice(newMembers.indexOf(requester), 1);
          let mentions = yield koaMap.mapLimit(newMembers, 5, usersModel.getMention);
          text = text + ' and invited ' + mentions.join(', ');
        }
      } else {
        /** jen jsem se pripojil do existujiciho kanalu */
        let mention = yield usersModel.getMention(requester);
        text = mention + ' has joined the channel';
      }
    } else {
      /** pozval jsem dalsi uzivatele do jiz existujiciho channelu */
      let mentions = yield koaMap.mapLimit(newMembers, 5, usersModel.getMention);
      text = 'Invited ' + mentions.join(', ');
    }
    let message = {
      user: requester,
      type: "channel_join",
      text: text
    };
    yield Chat.sendMessage(io.of(nspId), nspId, channelId, message);
  }

  static * channelLeft(io, namespace, channelId, userId) {
    let nspId = '/' + String(namespace).replace('/', '');
    let usersSockets = yield chatModel.listSocketsOfUser(namespace, userId);
    let promise = yield new Promise((resolve, reject) => {
      usersSockets.forEach((socket) => {
        if (io.nsps[nspId].connected[socket]) {
          io.nsps[nspId].connected[socket].emit('channel_left', {id: channelId});
          io.nsps[nspId].connected[socket].leave(channelId)
        } else {
          co(chatModel.removeSocket(namespace, userId, socket)).then((res) => {
          })
        }
      });
      return resolve();
    });
    let mention = yield usersModel.getMention(userId);
    let message = {
      type: "channel_leave",
      text: mention + " has left the channel"
    };
    yield Chat.sendMessage(io.of(nspId), nspId, channelId, message, Date.now());
    return promise;
  }
}

module.exports = Chat;