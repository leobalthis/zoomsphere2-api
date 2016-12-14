'use strict';
var nodemailer = require('nodemailer'),
  promisify = require("es6-promisify"),
  cache = require(__dirname + '/../models/cache'),
  EmailsModel = require(__dirname + '/../models/emails');

var transporter = nodemailer.createTransport('smtps://' + process.env.MAIL_USER + ':' + process.env.MAIL_PASS + '@' + process.env.MAIL_SMTP_SERVER + '');
var sendMail = promisify(transporter.sendMail.bind(transporter));

function composeMessage(to, subject, html, options) {
  if (!options) {
    options = {}
  }
  let message = {to, subject, html};
  if (!options.from) {
    options.from = 'ZoomSphere.com <no-reply@zoomsphere.com>'
  }
  Object.assign(message, options);
  return message
}

function mergeVars(string, variables) {
  variables.FRONTEND_DOMAIN = process.env.FRONTEND_APP_DOMAIN;
  let exp = /\*\|(\w+)\|\*/g;
  return string.replace(exp, function (dontUse, match) {
    return variables[match] || '';
  })
}

class Mailer {

  static * sendValidation(addressTo, code, name) {
    let email = yield this.getEmail('validate_email', 'en', {HASH: code, NAME: name});
    yield cache.save(cache.SPACES.VALIDATE_EMAIL, addressTo, {sent: true}, 60);
    return yield sendMail(composeMessage(addressTo, email.subject, email.content))
  };

  static * sendForgottenPassword(addressTo, code, name) {
    let email = yield this.getEmail('forgotten_password', 'en', {HASH: code, NAME: name});
    yield cache.save(cache.SPACES.FORGOTTEN_PASSWORD, addressTo, {sent: true}, 60);
    return yield sendMail(composeMessage(addressTo, email.subject, email.content))
  };

  static * sendExpiredSocialNotification(addressTo, name, networkId, accountName, accountId, accountType) {
    let email = yield this.getEmail('expired_social', 'en', {ACCOUNT_NAME: accountName, ACCOUNT: accountType, NAME: name, NETWORK: networkId});
    yield cache.save(cache.SPACES.EXPIRED_SOCIAL, addressTo + '-' + networkId + '-' + accountType + '-' + accountId, {sent: true}, 24*3600);
    return yield sendMail(composeMessage(addressTo, email.subject, email.content))
  };

  static * sendContactForm(name, country, message, addressTo) {
    let email = yield this.getEmail('contact_form', 'en', {NAME: name, COUNTRY: country, MESSAGE: message});
    return yield sendMail(composeMessage('tom@zoomsphere.com', email.subject, email.content, {replyTo: addressTo}))
  };

  static * mergeVariables(template, variables) {
    if (template) {
      template.content = mergeVars(template.content, variables);
      template.subject = mergeVars(template.subject, variables);
    }
    return template
  };

  static * getEmail(code, lang, variables) {
    var template = yield EmailsModel.getTemplate(code, lang);
    return yield this.mergeVariables(template, variables);
  };

  static * sendEmail(to, subject, content) {
    let email = composeMessage(to, subject, content);
    return yield sendMail(email)
  };
}

module.exports = Mailer;