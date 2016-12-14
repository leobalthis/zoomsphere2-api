'use strict';
var whois = require('whois'),
  moment = require('moment'),
  va = require('../helpers/validator'),
  cache = require('../models/cache'),
  promisify = require('es6-promisify');
whois.lookup = promisify(whois.lookup);

module.exports.blank = function *() {
  this.body = {};
};

module.exports.localizeMe = function *(next) {
  try {
    let country;
    let res = yield whois.lookup(this.request.ip);
    let parts = res.split('\n');
    parts.forEach((item) => {
      let splits = item.split(':');
      if (splits[0].toLowerCase() === 'country') {
        country = splits[1].trim().toLowerCase()
      }
    });
    this.body = {country: country};
  } catch (e) {
    console.log('Requested IP:', this.request.ip);
    console.log(e);
    throw new this.app.ZSError('error_unknown', 404);
  }
  return yield next
};


module.exports.frontendVersionHook = function *(next) {
  let res = va.run(this, [va.PATH, va.BODY], {
    provider: va.string().required(),
    app: va.string(),
    release: va.string()
  });
  console.log(res);
  if(res.provider === 'heroku') {
    yield cache.save('frontend-versions', res.app, {version: res.release, datetime: moment().utc().format('YYYY-MM-DDTHH:mm:ss.SSSZ')})
  }
  this.body = {success: true};
  return yield next
};