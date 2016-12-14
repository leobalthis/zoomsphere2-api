'use strict';
const koaMap = require('koa-map');

class Router {
  constructor() {
    this.routesStorage = [];
  }

  add(name, middleware) {
    this.routesStorage.push({name: name, middleware: Array.prototype.slice.call(arguments, 1)})
  }

  routes(app, socket) {
    this.routesStorage.map((route) => {
      socket.on(route.name, function (data) {
        koaMap.mapDelay(route.middleware, 0, function *(generator) {
          try {
            yield generator.bind({app: app, socket: socket, request: {body: data}})()
          } catch (error) {
            socket.emit('error_message', {reason: error.message, stack: error.stack || null, ts: new Date().getTime()});
            console.log(error);
          }
        });
      })
    });
  }
}

module.exports = Router;