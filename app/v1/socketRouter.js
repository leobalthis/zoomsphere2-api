'use strict';
var socketRedis = require('socket.io-redis'),
  co = require('co'),
  Router = require('./sockets/router'),
  cookie = require('cookie'),
  Auth = require('./controllers/authentication'),
  chat = require('./sockets/chat'),
  redis = require(__dirname + '/../../services').cache,
  redisBuffered = require(__dirname + '/../../services').cacheBuffered,
  chatModel = require(__dirname + '/models/chat');

var router = new Router();
router.add('typing', chat.typing);
router.add('disconnect', chat.disconnect);
router.add('message', chat.message);
router.add('channel_mark', chat.markChannel);

module.exports = (app) => {
  app.io.adapter(socketRedis({pubClient: redis, subClient: redisBuffered}));
  app.io.setNamespace('^\\d+$', (socket) => {
    try {
      if (!cookie.parse(socket.handshake.headers.cookie)['socket-apikey']) {
        throw new Error('apikey needed');
      } else {
        var authRes = Auth.verifyApikey(cookie.parse(socket.handshake.headers.cookie)['socket-apikey']);
        if (socket.nsp.name !== '/' + authRes.masterId) {
          throw new Error('Cannot connect to namespace');
        }
        co(chatModel.joinGeneral(authRes.masterId, authRes.id, socket.id)).then((res)=> {
          socket.user = {id: authRes.id, nspId: authRes.masterId};
          co(chat.connectSocketsToChannels(app.io, socket.nsp.name, socket.user.id));
          co(chatModel.listAllChannels(socket.user.nspId, socket.user.id)).then((res) => {
            router.routes(app, socket);
            socket.emit('login', {user: socket.user.id, channels: res, ts: new Date().getTime()});
          }).catch((err) => {
            console.log(err)
          })
        }).catch((err) => {
          console.log(new Error('Could not connect ' + socket.nsp.name));
          console.log(err);
          socket.emit('login_failed', {'type': 'auth error - wrong nsp'});
          socket.disconnect();
          return false;
        });
      }
    } catch (e) {
      socket.emit('login_failed', {type: e.message});
      socket.disconnect();
      return false;
    }
  });
};