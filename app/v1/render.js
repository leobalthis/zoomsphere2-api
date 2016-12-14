'use strict';
var sequelize = require('sequelize'),
  moment = require('moment'),
  cache = require('./models/cache');

module.exports = function *() {
  let frontend = yield cache.get('frontend-versions', process.env.FRONTEND_APP_NAME || 'test-app');
  this.body = {
    data: this.body,
    status: this.status,
    datetime: moment().utc().format('YYYY-MM-DDTHH:mm:ss.SSSZ'),
    frontend: frontend
  };
  if (this.state.updated) {
    this.body.updated = this.state.updated;
  }
  if (this.error) {
    if (this.body.data) {
      delete this.body.data;
    }
    if (this.error instanceof TypeError) {
      this.body.error = {message: this.error.toString(), code: 'error_unknown'}
    } else if (this.error instanceof sequelize.DatabaseError || this.error instanceof sequelize.UniqueConstraintError) {
      this.body.error = {message: this.error.message, code: 'error_database', developerMessage: this.error.errors}
    } else {
      delete this.error.stack;
      this.body.error = this.error
    }
  }
};


