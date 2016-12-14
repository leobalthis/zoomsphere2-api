'use strict';
var request = require('request'),
  moment = require('moment'),
  va = require(__dirname + '/../helpers/validator'),
  promisify = require('es6-promisify'),
  PassThrough = require('stream').PassThrough;
var postReq = promisify(request.post);

class Monitoring {

  static * search() {
    this.body = request.post({
      headers: {'content-type': 'application/json'},
      url: process.env.MONITORING_API_DOMAIN + '/search',
      json: this.request.body
    })
      .on('response', (response) => {
        this.type = response.headers['content-type'];
      }).on('error', (err) => {
        console.log(err);
      }).pipe(PassThrough());
  }

  static * getAcceptedLanguages() {
    this.body = request.get({
      headers: {'content-type': 'application/json'},
      url: process.env.MONITORING_API_DOMAIN + '/administration/accepted-languages'
    })
      .on('response', (response) => {
        this.type = response.headers['content-type'];
      }).on('error', (err) => {
        console.log(err);
      }).pipe(PassThrough());
  }

  static * validateSearchQuery(next) {
    var res = va.run(this, va.BODY, {query: va.string().required()});
    let resp = yield postReq({
      headers: {'content-type': 'application/json'},
      url: process.env.MONITORING_API_DOMAIN + '/search',
      json: {
        query: res.query,
        date_from: moment().format('YYYY-MM-DD HH:mm:SS'),
        date_to: moment().format('YYYY-MM-DD HH:mm:SS'),
        lang: ['cs']
      }
    });
    if (resp[1].error) {
      this.error = resp[1].error;
    } else {
      this.body = {success: true}
    }
    return yield next
  }

}
module.exports = Monitoring;