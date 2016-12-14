'use strict';
const Joi = require('joi'),
  qs = require('qs');

class Validator {

  static run(ctx, sources, schema) {
    let params = {};
    if (!Array.isArray(sources)) {
      sources = [sources];
    }
    if (sources.indexOf(Validator.BODY) !== -1) {
      Object.assign(params, ctx.request.body);
    }
    if (sources.indexOf(Validator.QUERY) !== -1) {
      Object.assign(params, qs.parse(ctx.request.querystring));
    }
    if (sources.indexOf(Validator.PATH) !== -1) {
      Object.assign(params, ctx.params);
    }

    delete_null_properties(params, true);

    let result = Joi.validate(params, schema, {stripUnknown: true});
    if (result.error) {
      throw new ctx.app.ZSError('ERROR_REQUIRED_FIELD_MISSING', 403, result.error.details);
    }
    return result.value;
  };

  static uploadedFileUrl() {
    return Joi.string().regex(/^(http|ftp)[s]?:\/\//);
  }

  static iconClassName() {
    return Joi.string().max(80);
  }

  static cssColor() {
    return Joi.string().regex(/^#[a-fA-F0-9]{6}$/);
  }

  static array() {
    return Joi.array();
  }

  static boolean() {
    return Joi.boolean();
  }

  static binary() {
    return Joi.binary();
  }

  static date() {
    return Joi.date();
  }

  static number() {
    return Joi.number();
  }

  static object() {
    return Joi.object();
  }

  static string() {
    return Joi.string();
  }

  static any() {
    return Joi.any();
  }

  static findUserTypeFilter() {
    return Joi.string().valid(['all', 'expired', 'valid', 'demo', 'payment']).default('all');
  }

  static findUserOrderFilter() {
    return Joi.string().valid(['date_registered-desc', 'date_registered-asc', 'date_logged-desc', 'date_logged-asc', 'name-asc', 'name-desc']).default('date_registered-desc');
  }

  static networks() {
    return Joi.string().valid(['facebook', 'google', 'linkedin', 'youtube', 'twitter', 'instagram', 'api', 'email'])
  }
}
Validator.PATH = 'path';
Validator.QUERY = 'query';
Validator.BODY = 'body';

module.exports = Validator;

function delete_null_properties(test, recurse) {
  if (typeof test === 'object' || Array.isArray(test)) {
    for (var i in test) {
      if (test.hasOwnProperty(i)) {
        if (test[i] === null) {
          delete test[i];
        } else if (recurse) {
          delete_null_properties(test[i], recurse);
        }
      }
    }
  }
}