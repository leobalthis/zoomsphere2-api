var app = require('../index'),
  url = app.listen(),
  should = require('should'),
  request = require('supertest');


describe('ROOT', function () {
  "use strict";
  var _token;
  var _userId;
  var credentials = {
    "email": "socialtestaccount@zoomsphere.com",
    "password": "testPassword"
  };

  describe('Sign up user', function () {
    it('should return token', function (done) {
      request(url)
        .post('/v1/auth/zoomsphere')
        .send(credentials)
        .expect("Content-type", /application\/json/)
        .expect(200)
        .end(function (err, res) {
          if (err) {
            throw err;
          }
          res.body.data.apikey.should.be.String();
          res.body.data.userId.should.be.Number();
          _token = res.body.data.apikey;
          _userId = res.body.data.userId;
          done()
        })
    })
  });

  describe('CLIENTS', function () {
    describe('GET', function () {
      it('should return empty', function (done) {
        request(url)
          .get('/v1/users/' + _userId + '/clients')
          .set('cache', 'false')
          .set('apikey', _token)
          .expect("Content-type", /application\/json/)
          .expect(200)
          .end(function (err, res) {
            if (err) {
              throw err;
            }
            res.body.data.clients.should.be.empty();
            done()
          })
      })
    });

    describe('CREATE WITH NAME', function () {
      it('should return clients array', function (done) {
        request(url)
          .post('/v1/users/' + _userId + '/clients')
          .send({id: 3, name: 'karel'})
          .set('apikey', _token)
          .expect("Content-type", /application\/json/)
          .expect(201)
          .end(function (err, res) {
            if (err) {
              throw err;
            }
            var clients = res.body.data.clients;
            clients.length.should.be.equal(1);
            clients[0].should.have.keys('id', 'fullName', 'date_logged', 'date_paid', 'image_square', 'tariff');
            done()
          })
      })
    });
    var _clientId;
    describe('CREATE WITHOUT NAME', function () {
      it('should return clients array', function (done) {
        request(url)
          .post('/v1/users/' + _userId + '/clients')
          .send({id: 19})
          .set('apikey', _token)
          .expect("Content-type", /application\/json/)
          .expect(201)
          .end(function (err, res) {
            if (err) {
              throw err;
            }
            var clients = res.body.data.clients;
            clients.length.should.be.equal(2);
            clients[1].should.have.keys('id', 'fullName', 'date_logged', 'date_paid', 'image_square', 'tariff');
            _clientId = clients[1].id;
            done()
          })
      })
    });

    describe('DELETE', function () {
      it('should return clients array', function (done) {
        request(url)
          .del('/v1/users/' + _userId + '/clients/' + _clientId)
          .set('apikey', _token)
          .expect("Content-type", /application\/json/)
          .expect(202)
          .end(function (err, res) {
            if (err) {
              throw err;
            }
            var clients = res.body.data.clients;
            clients.length.should.be.equal(1);
            clients[0].should.have.keys('id', 'fullName', 'date_logged', 'date_paid', 'image_square', 'tariff');
            done()
          })
      })
    });
  });
});
