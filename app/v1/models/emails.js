'use strict';
var db = require(__dirname + '/../../../services').db;

var EmailSchema = db.import(__dirname + '/../schemas/email_templates');


class Emails {

  static * getTemplate(code, lang) {
    var template;
    template = yield EmailSchema.findOne({where: {code: code, lang: lang}});
    if(!template) {
      template = yield EmailSchema.findOne({where: {code: code, lang: 'en'}});
    }
    return template;
  }
}

module.exports = Emails;