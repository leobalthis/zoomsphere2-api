var app = require('../index'),
  url = app.listen(),
  should = require('should'),
  request = require('supertest');


describe('PERMISSIONS', function () {
  "use strict";
  var _slaveToken, _slaveUserId;

  describe('as ROOT', function () {
    var _token;
    var _userId;
    var credentials = {
      "email": "tom@zoomsphere.com",
      "password": "karel"
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
            _token = res.body.data.apikey;
            _userId = res.body.data.userId;
            done()
          })
      })
    });

    describe('GET USER ANY', function () {
      it('should return user object', function (done) {
        request(url)
          .get('/v1/users/3')
          .set('cache', 'false')
          .set('apikey', _token)
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

    describe('SWITCH TO ANY USER', function () {
      it('should return token and id', function (done) {
        request(url)
          .post('/v1/users/' + _userId + '/switch/40')
          .set('apikey', _token)
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

    describe('GET SETTINGS', function () {
      it('should return error', function (done) {
        request(url)
          .get('/v1/users/3/advancedSettings')
          .set('cache', 'false')
          .set('apikey', _token)
          .expect("Content-type", /application\/json/)
          .expect(403)
          .end(function (err, res) {
            if (err) {
              throw err;
            }
            done()
          })
      })
    });

    describe('UPDATE ANY OTHER USER', function () {
      it('should return error', function (done) {
        request(url)
          .put('/v1/users/3')
          .send({company: "test"})
          .set('apikey', _token)
          .expect("Content-type", /application\/json/)
          .expect(403)
          .end(function (err, res) {
            if (err) {
              throw err;
            }
            done()
          })
      })
    });

    describe('GET CLIENTS', function () {
      it('should return clients', function (done) {
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
            done()
          })
      })
    });

    describe('GET TEAM', function () {
      it('should return teammate', function (done) {
        request(url)
          .get('/v1/users/3/teammates')
          .set('cache', 'false')
          .set('apikey', _token)
          .expect("Content-type", /application\/json/)
          .expect(200)
          .end(function (err, res) {
            if (err) {
              throw err;
            }
            res.body.data.teammates.length.should.be.equal(1);
            done()
          })
      })
    });
  });

  describe('as MASTER', function () {
    var _token, _userId;
    var credentials = {
      "email": "jakub@zoomsphere.com",
      "password": "karel"
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
            _token = res.body.data.apikey;
            _userId = res.body.data.userId;
            done()
          })
      })
    });

    describe('GET USER OUT OF MY TEAM', function () {
      it('should return error', function (done) {
        request(url)
          .get('/v1/users/40')
          .set('cache', 'false')
          .set('apikey', _token)
          .expect("Content-type", /application\/json/)
          .expect(403)
          .end(function (err, res) {
            if (err) {
              throw err;
            }
            done()
          })
      })
    });

    describe('GET USER FROM MY TEAM', function () {
      it('should return user object', function (done) {
        request(url)
          .get('/v1/users/42')
          .set('cache', 'false')
          .set('apikey', _token)
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

    describe('SWITCH TO ANY USER', function () {
      it('should return error', function (done) {
        request(url)
          .post('/v1/users/' + _userId + '/switch/40')
          .set('apikey', _token)
          .expect("Content-type", /application\/json/)
          .expect(403)
          .end(function (err, res) {
            if (err) {
              throw err;
            }
            done()
          })
      })
    });

    describe('SWITCH TO MY TEAM\'S USER', function () {
      it('should return token and id', function (done) {
        request(url)
          .post('/v1/users/' + _userId + '/switch/42')
          .set('apikey', _token)
          .expect("Content-type", /application\/json/)
          .expect(200)
          .end(function (err, res) {
            if (err) {
              throw err;
            }
            _slaveToken = res.body.data.apikey;
            _slaveUserId = res.body.data.userId;
            done()
          })
      })
    });

    describe('GET SETTINGS', function () {
      it('should return error', function (done) {
        request(url)
          .get('/v1/users/40/advancedSettings')
          .set('cache', 'false')
          .set('apikey', _token)
          .expect("Content-type", /application\/json/)
          .expect(403)
          .end(function (err, res) {
            if (err) {
              throw err;
            }
            done()
          })
      })
    });

    describe('UPDATE ANY USER', function () {
      it('should return error', function (done) {
        request(url)
          .put('/v1/users/40')
          .send({company: "test"})
          .set('apikey', _token)
          .expect("Content-type", /application\/json/)
          .expect(403)
          .end(function (err, res) {
            if (err) {
              throw err;
            }
            done()
          })
      })
    });

    describe('UPDATE USER FROM MY TEAM', function () {
      it('should return error', function (done) {
        request(url)
          .put('/v1/users/42')
          .send({company: "test"})
          .set('apikey', _token)
          .expect("Content-type", /application\/json/)
          .expect(403)
          .end(function (err, res) {
            if (err) {
              throw err;
            }
            done()
          })
      })
    });

    describe('GET CLIENTS', function () {
      it('should return error', function (done) {
        request(url)
          .get('/v1/users/' + _userId + '/clients')
          .set('cache', 'false')
          .set('apikey', _token)
          .expect("Content-type", /application\/json/)
          .expect(403)
          .end(function (err, res) {
            if (err) {
              throw err;
            }
            done()
          })
      })
    });
  });

  describe('as SLAVE', function () {

    describe('GET USER OUT OF MY TEAM', function () {
      it('should return error', function (done) {
        request(url)
          .get('/v1/users/40')
          .set('cache', 'false')
          .set('apikey', _slaveToken)
          .expect("Content-type", /application\/json/)
          .expect(403)
          .end(function (err, res) {
            if (err) {
              throw err;
            }
            done()
          })
      })
    });

    describe('GET USER FROM MY TEAM', function () {
      it('should return user object', function (done) {
        request(url)
          .get('/v1/users/3')
          .set('cache', 'false')
          .set('apikey', _slaveToken)
          .expect("Content-type", /application\/json/)
          .expect(403)
          .end(function (err, res) {
            if (err) {
              throw err;
            }
            done()
          })
      })
    });

    describe('SWITCH TO ANY USER', function () {
      it('should return error', function (done) {
        request(url)
          .post('/v1/users/' + _slaveUserId + '/switch/40')
          .set('apikey', _slaveToken)
          .expect("Content-type", /application\/json/)
          .expect(403)
          .end(function (err, res) {
            if (err) {
              throw err;
            }
            done()
          })
      })
    });

    describe('SWITCH TO MY TEAM\'S USER', function () {
      it('should return token and id', function (done) {
        request(url)
          .post('/v1/users/' + _slaveUserId + '/switch/3')
          .set('apikey', _slaveToken)
          .expect("Content-type", /application\/json/)
          .expect(403)
          .end(function (err, res) {
            if (err) {
              throw err;
            }
            done()
          })
      })
    });

    describe('GET SETTINGS', function () {
      it('should return error', function (done) {
        request(url)
          .get('/v1/users/40/advancedSettings')
          .set('cache', 'false')
          .set('apikey', _slaveToken)
          .expect("Content-type", /application\/json/)
          .expect(403)
          .end(function (err, res) {
            if (err) {
              throw err;
            }
            done()
          })
      })
    });

    describe('UPDATE ANY USER', function () {
      it('should return error', function (done) {
        request(url)
          .put('/v1/users/40')
          .send({company: "test"})
          .set('apikey', _slaveToken)
          .expect("Content-type", /application\/json/)
          .expect(403)
          .end(function (err, res) {
            if (err) {
              throw err;
            }
            done()
          })
      })
    });

    describe('UPDATE USER FROM MY TEAM', function () {
      it('should return error', function (done) {
        request(url)
          .put('/v1/users/41')
          .send({company: "test"})
          .set('apikey', _slaveToken)
          .expect("Content-type", /application\/json/)
          .expect(403)
          .end(function (err, res) {
            if (err) {
              throw err;
            }
            done()
          })
      })
    });

    describe('GET CLIENTS', function () {
      it('should return error', function (done) {
        request(url)
          .get('/v1/users/' + _slaveUserId + '/clients')
          .set('cache', 'false')
          .set('apikey', _slaveToken)
          .expect("Content-type", /application\/json/)
          .expect(403)
          .end(function (err, res) {
            if (err) {
              throw err;
            }
            done()
          })
      })
    });

    describe('GET BUSINESS HOURS', function () {
      it('should return business hours', function (done) {
        request(url)
          .get('/v1/users/settings/businessHours')
          .set('cache', 'false')
          .set('apikey', _slaveToken)
          .expect("Content-type", /application\/json/)
          .expect(200)
          .end(function (err, res) {
            if (err) {
              throw err;
            }
            done()
          })
      });
    });

    describe('GET TEAMMATES IN WORKSPACE', function () {
      it('should return teammates list', function (done) {
        request(url)
          .get('/v1/users/teammates/workspaces/0')
          .set('cache', 'false')
          .set('apikey', _slaveToken)
          .expect("Content-type", /application\/json/)
          .expect(200)
          .end(function (err, res) {
            if (err) {
              throw err;
            }
            let tm = res.body.data.teammates;
            tm.should.be.Array();
            done()
          })
      })
    });
  });
});
