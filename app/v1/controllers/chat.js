'use strict';
const url = require('url');
var sha1 = require('sha1'),
  va = require(__dirname + '/../helpers/validator'),
  chat = require(__dirname + '/../sockets/chat'),
  chatModel = require(__dirname + '/../models/chat');

class Chat {

  static * chatRoutes(next) {
    this.body = ['message', 'user_typing', 'stop_typing', 'login', 'channel_joined', 'user_left', 'reply', 'channel_created', 'channel_marked'];
    return yield next
  }

  static * createChannel(next) {
    var result = va.run(this, [va.BODY], {
      name: va.string().required(),
      members: va.array().items(va.number()).optional().default([]),
      private: va.boolean().optional()
    });
    let channelExists = yield chatModel.getChannelByName(this.state.authUser.masterId, result.name);
    if (channelExists) {
      throw new this.app.ZSError('error_unknown');
    }
    result.members.push(this.state.authUser.id);
    let timestamp = new Date().getTime();
    let res = yield chatModel.createChannel(this.state.authUser.masterId, result.name, this.state.authUser.id, result.private ? chatModel.POLICIES.PRIVATE : chatModel.POLICIES.PUBLIC, false, result.members);
    yield chat.channelCreated(this.app.io, this.state.authUser.masterId, this.state.authUser.id, res.id, result.name, timestamp, result.private);
    yield Chat.joinMembersToChannel(this.app.io, result.members, this.state.authUser.masterId, res.id, res.name, res.creator, res.created, this.state.authUser.id);
    this.body = {success: true, id: res.id};
    return yield next;
  }

  static * inviteToChannel(next) {
    var result = va.run(this, [va.BODY, va.PATH], {
      channelId: va.string().required(),
      members: va.array().items(va.number()).min(1).required()
    });
    let channel = yield chatModel.getChannel(this.state.authUser.masterId, result.channelId);
    let amIMember = yield chatModel.isMemberOfChannel(this.state.authUser.masterId, result.channelId, this.state.authUser.id);
    if (!channel || (channel.policy === chatModel.POLICIES.PRIVATE && !amIMember)) {
      throw new this.app.ZSError('error_unknown');
    }
    yield Chat.joinMembersToChannel(this.app.io, result.members, this.state.authUser.masterId, channel.id, channel.name, channel.creator, channel.created, this.state.authUser.id);
    this.body = {success: true, id: result.name};
    return yield next;
  }

  static * joinChannel(next) {
    var result = va.run(this, [va.PATH], {
      channelId: va.string().required()
    });
    let channel = yield chatModel.getChannel(this.state.authUser.masterId, result.channelId);
    if (!channel || channel.policy === chatModel.POLICIES.PRIVATE) {
      throw new this.app.ZSError('error_unknown');
    }
    yield Chat.joinMembersToChannel(this.app.io, [this.state.authUser.id], this.state.authUser.masterId, result.channelId, channel.name, channel.creator, channel.created, this.state.authUser.id);
    this.body = {success: true, id: result.channelId};
    return yield next;
  }

  static * joinMembersToChannel(io, members, namespaceId, channelId, channelName, creator, created, requester) {
    if (members && members.length > 0) {
      let allMembers = yield chatModel.listMembersOfChannel(namespaceId, channelId);
      yield members.map((memberId) => {
        return chat.connectSocketsToChannel(io, namespaceId, memberId, channelId, channelName, allMembers, creator, created);
      });
      yield chatModel.joinChannel(namespaceId, channelId, members);
      yield chat.channelJoined(io, namespaceId, members, channelId, requester);
    }
  }

  static * joinMembersToIM(io, members, namespaceId, im) {
    yield members.map((memberId) => {
      return chat.connectSocketsToIM(io, namespaceId, memberId, im, members);
    });
  }

  static * messageHistory(next) {
    var result = va.run(this, [va.PATH], {
      ts: va.number().required(),
      channelId: va.string().required()
    });
    let messages = yield chatModel.listMessages(this.state.authUser.masterId, result.channelId, result.ts);
    this.body = {messages: messages, count: messages.length || 0};
    return yield next;
  }

  static * leaveChannel(next) {
    var result = va.run(this, [va.PATH], {
      channelId: va.string().required()
    });
    let amIMember = yield chatModel.isMemberOfChannel(this.state.authUser.masterId, result.channelId, this.state.authUser.id);
    if (!amIMember) {
      throw new this.app.ZSError('error_unknown');
    }
    yield chatModel.leaveChannel(this.state.authUser.masterId, result.channelId, this.state.authUser.id);
    yield chat.channelLeft(this.app.io, this.state.authUser.masterId, result.channelId, this.state.authUser.id);
    this.body = {success: true, id: result.channelId};
    return yield next;
  }

  static * createIM(next) {
    var result = va.run(this, [va.BODY], {
      members: va.array().items(va.number()).min(1).required()
    });
    result.members.push(this.state.authUser.id);
    let id = (result.members.length > 2 ? 'g' : 'd') + sha1(result.members.sort().join('-'));

    let channelExists = yield chatModel.getChannel(this.state.authUser.masterId, id);
    this.body = {};
    if (channelExists) {
      this.body.im = yield chatModel.getIM(this.state.authUser.masterId, id);
    } else {
      this.body.im = yield chatModel.createIM(this.state.authUser.masterId, this.state.authUser.id, id, result.members);
      yield Chat.joinMembersToIM(this.app.io, result.members, this.state.authUser.masterId, this.body.im);
      this.body.success = true;
    }
    return yield next;
  }

  static * login(next) {
    let channels = yield chatModel.listAllChannels(this.state.authUser.masterId, this.state.authUser.id);
    this.body = {user: this.state.authUser.id, channels: channels, ts: new Date().getTime()};
    return yield next;
  }

  static * start(next) {
    let domain = url.parse(process.env.APP_DOMAIN).hostname.split('.');
    let cookieDomain;
    if (domain.length > 1) {
      cookieDomain = '.' + domain.slice(-2).join('.')
    } else {
      cookieDomain = domain[0]
    }
    this.cookies.set('socket-apikey', this.headers.apikey, {maxAge: 24 * 3600 * 1000, overwrite: true, domain: cookieDomain});
    this.body = {success: true};
    return yield next;
  }

}
module.exports = Chat;