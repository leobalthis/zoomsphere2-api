var url = require('../index').listen(),
  should = require('should'),
  request = require('supertest'),
  moment = require('moment');

describe('Demo', function () {
  "use strict";
  var _token, _rootToken;
  var masterUserId = 20;
  var slaveUserId = 42;
  var rootCredentials = {
    "email": "marny",
    "password": "karel"
  };

  describe('Login as root to application', function () {
    it('Should return token and user ID', function (done) {
      request(url)
        .post('/v1/auth/zoomsphere')
        .send(rootCredentials)
        .expect("Content-type", /application\/json/)
        .expect(200)
        .end(function (err, res) {
          if (err) {
            throw err;
          }
          res.body.data.apikey.should.be.String();
          res.body.data.userId.should.be.Number();
          _rootToken = res.body.data.apikey;
          done()
        })
    })
  });

  describe('Set valid demo for master user', function () {
    it('Should update user demo', function (done) {
      request(url)
        .put('/v1/users/' + masterUserId + '/demo')
        .send({demo: "2025-02-21 14:37:57"})
        .set('apikey', _rootToken)
        .expect("Content-type", /application\/json/)
        .expect(200)
        .end(function (err, res) {
          if (err) {
            throw err;
          }
          done()
        })
    })
  });

  describe('Login as master to application', function () {
    it('Should return token and user ID', function (done) {
      request(url)
        .post('/v1/auth/zoomsphere')
        .send({email: "test@dev.com", password: "karel"})
        .expect("Content-type", /application\/json/)
        .expect(200)
        .end(function (err, res) {
          if (err) {
            throw err;
          }
          res.body.data.apikey.should.be.String();
          res.body.data.userId.should.be.Number();
          _token = res.body.data.apikey;
          done()
        })
    })
  });

  describe('Check if tariff for master user is set correctly', function () {
    it('Should return user', function (done) {
      request(url)
        .get('/v1/users/' + masterUserId)
        .set('apikey', _token)
        .set('cache', false)
        .expect("Content-type", /application\/json/)
        .expect(200)
        .end(function (err, res) {
          if (err) {
            throw err;
          }
          res.body.data.user.tariff.should.be.equal('demo');
          done()
        })
    })
  });

  describe('Set invalid demo for master user', function () {
    it('Should update user demo', function (done) {
      request(url)
        .put('/v1/users/' + masterUserId + '/demo')
        .send({demo: "2014-02-21 14:37:57"})
        .set('apikey', _rootToken)
        .expect("Content-type", /application\/json/)
        .expect(200)
        .end(function (err, res) {
          if (err) {
            throw err;
          }
          done()
        })
    })
  });

  describe('Check if tariff for master account is expired', function () {
    it('Should return user', function (done) {
      request(url)
        .get('/v1/users/' + masterUserId)
        .set('apikey', _token)
        .set('cache', false)
        .expect("Content-type", /application\/json/)
        .expect(200)
        .end(function (err, res) {
          if (err) {
            throw err;
          }
          res.body.data.user.tariff.should.be.equal('expired');
          done()
        })
    })
  });

  describe('Set tariff for slave user', function () {
    it('Should fail', function (done) {
      request(url)
        .put('/v1/users/' + slaveUserId + '/demo')
        .send({demo: "2014-02-21 14:37:57"})
        .set('apikey', _rootToken)
        .expect("Content-type", /application\/json/)
        .expect(401)
        .end(function (err, res) {
          if (err) {
            throw err;
          }
          done()
        })
    })
  });
});