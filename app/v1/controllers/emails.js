'use strict';

var mailer = require('../helpers/mailer'),
  va = require(__dirname + '/../helpers/validator');

class Emails {

  static * contactForm(next) {
    var result = va.run(this, va.BODY, {
      name: va.string().required(),
      type: va.string().required(),
      message: va.string().required(),
      email: va.string().email().required()
    });
    let info = yield mailer.sendContactForm(result.name, result.type, result.message, result.email);
    console.info(info.response);
    this.status = 201;
    this.body = {success: true};
    return yield next
  }

}
module.exports = Emails;

