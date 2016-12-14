"use strict";
var socketio = require('../../../node_modules/socket.io/lib/index');
const parser = require('../../../node_modules/socket.io-parser');
var Client = require('../../../node_modules/socket.io/lib/client');

var namespaces = [], connectCallbacks = {};
Client.prototype.connect = function(name, query){
  var nsp = this.server.nsps[name];
  if (!nsp) {
    let res = namespaces.filter((key)=>{
      let reg = new RegExp(key);
      let ss= name.substring(1);
      return reg.test(ss);
    });
    if(res.length > 0) {
      nsp = this.server.of(name, connectCallbacks[res[0]]);
    } else {
      this.packet({ type: parser.ERROR, nsp: name, data : 'Invalid namespace'});
      for(let socketName in this.sockets) {
        if(this.sockets.hasOwnProperty(socketName)) {
          this.sockets[socketName].disconnect();
        }
      }
      return;
    }
  }

  if ('/' != name && !this.nsps['/']) {
    this.connectBuffer.push(name);
    return;
  }

  var self = this;
  var socket = nsp.add(this, query, function(){
    self.sockets[socket.id] = socket;
    self.nsps[nsp.name] = socket;

    if ('/' == nsp.name && self.connectBuffer.length > 0) {
      self.connectBuffer.forEach(self.connect, self);
      self.connectBuffer = [];
    }
  });
};

socketio.prototype.onconnection = function(conn){
  var client = new Client(this, conn);
  client.connect('/');
  return this;
};

socketio.prototype.setNamespace = function (name, fce) {
  "use strict";
  namespaces.push(name);
  if(fce) {
    connectCallbacks[name] = fce;
  }
};
module.exports = socketio;
