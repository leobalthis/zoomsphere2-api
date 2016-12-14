var app = require('../index'),
  url = app.listen(),
  should = require('should'),
  request = require('supertest');


describe('1-ZOOMSPHERE User account', function () {
  "use strict";
  var _token;
  var _userId;
  var credentials = {
    "email": "dev@zoomsphere.com",
    "password": "karel"
  };

  describe('Sign up user', function () {
    it('should return token', function (done) {

      request(url)
        .post('/v1/sign-up')
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

  describe('GET USER', function () {
    it('should return user profile', function (done) {
      request(url)
        .get('/v1/users/' + _userId)
        .set('cache', 'false')
        .set('apikey', _token)
        .expect("Content-type", /application\/json/)
        .expect(200)
        .end(function (err, res) {
          if (err) {
            throw err;
          }
          var user = res.body.data.user;
          user.id.should.be.Number();
          user.country.should.be.String();
          //user.account.should.be.equalOneOf(['facebook', 'zoomsphere', 'twitter', 'google']);
          user.email.should.be.equal(credentials.email);
          user.image_big.should.be.equal('https://www.zoomsphere.com/img/anonym.gif');
          user.image_square.should.be.equal('https://www.zoomsphere.com/img/anonym.gif');
          done()
        })
    })
  });

  describe('UPDATE USER', function () {
    it('should return new user object', function (done) {
      request(url)
        .put('/v1/users/' + _userId)
        .set('apikey', _token)
        .send({
          "fullName": "Pepa Novák",
          "country": "sk",
          "timezone": "London",
          "about": "o mne",
          "signature": "Pepa",
          "company": "Moje s.r.o.",
          "position": "CEO",
          "image_big": "http://server/test.file",
          "image_square": "http://server/3_ps.jpg"
        })
        .expect("Content-type", /application\/json/)
        .expect(200)
        .end(function (err, res) {

          if (err) {
            throw err;
          }
          var user = res.body.data.user;
          user.id.should.be.equal(_userId);
          user.fullName.should.be.equal("Pepa Novák");
          user.country.should.be.equal("sk");
          user.timezone.should.be.equal("London");
          user.about.should.be.equal("o mne");
          user.signature.should.be.equal("Pepa");
          user.company.should.be.equal("Moje s.r.o.");
          user.position.should.be.equal("CEO");
          user.image_big.should.be.equal("http://server/test.file");
          user.image_square.should.be.equal("http://server/3_ps.jpg");
          done()
        })
    });
  });
});