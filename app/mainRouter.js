'use strict';
const latestVersion = 'v1';
var router = require('koa-router')(),
  bodyParser = require('koa-bodyparser'),
  Boom = require('boom'),
  cors = require('kcors'),
  logger = require('koa-logger'),
  compress = require('koa-compress'),
  elasticLogger = require('../services').elasticLogger,
  v01 = require('./v1/router'),
  render = require('./v1/render'),
  socket = require('./v1/socketRouter');

const loggerType = process.env.ELASTIC_LOGGER_TYPE || 'zs-api-local';

module.exports = function (app) {

  router.get('/', function *() {
    this.body = {latest_version: latestVersion};
  });
  app.use(router.routes());

  // logger
  app.use(logger());
  app.use(compress());

  app.use(function *(next) {
    let start = new Date;
    try {
      yield next;
      yield elasticLogger.ok(loggerType, this.request.method, this.request.originalUrl, this.req.headers, this.res.outputSize, this.res.statusCode, new Date - start);
    } catch (err) {
      this.status = err.status || 500;
      this.error = err;
      yield elasticLogger.error(loggerType, this.request, err, this.res.outputSize, this.res.statusCode, new Date - start);
      return yield render
    }
  });
  app.use(cors({credentials: true}));
  app.use(bodyParser({jsonLimit: '25mb'}));

  /**
   * public routes
   */
  app.use(v01.public.routes());

  /**
   * authentication
   */
  v01.isAuthenticated.forEach((middleware) => {
    app.use(middleware);
  });

  /**
   * since here authenticated routes only
   */
  app.use(v01.secured.routes());


  app.use(v01.isPayed);

  /**
   * payed routes only
   */
  app.use(v01.payed.routes())
    .use(v01.public.allowedMethods({
      throw: false,
      notImplemented: () => new Boom.notImplemented(),
      methodNotAllowed: () => new Boom.methodNotAllowed()
    }));

  socket(app);
};