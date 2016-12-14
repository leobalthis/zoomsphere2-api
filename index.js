var koa = require('koa'),
  app = koa(),
  router = require('./app/mainRouter');
app.proxy = true;
var server = require('http').createServer(app.callback());
app.io = require('./app/v1/sockets/server')(server);

app.ZSError = require('zs-error');

router(app);

server.listen(process.env.PORT || 3000);
console.log('API listening on port ' + (process.env.PORT || 3000));
module.exports = app;