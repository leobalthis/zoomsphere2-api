var app = require('../index'),
  url = app.listen(),
  should = require('should'),
  request = require('supertest');


describe('User account', function () {
  "use strict";
  var _token;
  var _userId;
  var credentials = {
    "email": "socialtestaccount@zoomsphere.com",
    "password": "testPassword",
    "fullName": "Tomas Cerny"
  };
  var storage = {};

  describe('Login to application', function () {

    it('should return token and user ID', function (done) {
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
          user.id.should.be.equal(_userId);
          user.fullName.should.be.equal(credentials.fullName);
          user.country.should.be.String();
          user.email.should.be.equal(credentials.email);
          done()
        })
    })
  });

  describe('MANAGE SOCIAL ACCOUNTS', function () {
    it('should return accounts array with objects', function (done) {
      request(url)
        .get('/v1/users/' + _userId + '/networks')
        .set('cache', 'false')
        .set('apikey', _token)
        .expect("Content-type", /application\/json/)
        .expect(200)
        .end(function (err, res) {

          if (err) {
            throw err;
          }
          let socialNetworks = ['facebook', 'twitter', 'youtube', 'google', 'linkedin', 'instagram', 'email', 'api'];
          var data = res.body.data;
          data.should.be.Object();
          data.should.have.keys(socialNetworks);
          data.facebook.should.be.Object();
          data.facebook.accounts.should.be.Array();
          data.facebook.accounts[0].id.should.be.equal(169691);
          data.facebook.accounts[0].name.should.be.equal('Tomas Cerny');
          data.facebook.accounts[0].account.should.be.equal('facebook');
          data.facebook.accounts[0].account_id.should.be.equal('1553537464964326');
          data.facebook.accounts[0].should.have.keys('image', 'id', 'name', 'account', 'account_id', 'expires');
          data.facebook.pages.should.be.empty();
          data.twitter.should.be.Object();
          data.twitter.accounts.should.be.Array();
          data.twitter.accounts[0].id.should.be.equal(169698);
          data.twitter.accounts[0].name.should.be.equal('Tomas Cerny');
          data.twitter.accounts[0].account.should.be.equal('twitter');
          data.twitter.accounts[0].account_id.should.be.equal('4888204685');
          data.twitter.accounts[0].should.have.keys('image', 'id', 'name', 'account', 'account_id', 'expires');
          data.email.should.be.empty();
          done()
        })
    });
  });

  describe('FACEBOOK', function () {
    var network = 'facebook';
    var accountId = 169691;
    it('Should return all possible pages', function (done) {
      request(url)
        .get('/v1/users/' + _userId + '/networks/' + network + '/accounts/' + accountId + '/pages')
        .set('cache', 'false')
        .set('apikey', _token)
        .expect("Content-type", /application\/json/)
        .expect(200)
        .end(function (err, res) {
          if (err) {
            throw err;
          }
          var pages = res.body.data;
          pages[0].id.should.be.equal("181574965361538");
          pages[0].name.should.be.equal("ZoomSphere Czech Republic");
          pages[0].should.have.keys('image', 'id', 'name', 'username');
          done()
        })
    });

    it('Should add page', function (done) {
      request(url)
        .post('/v1/users/' + _userId + '/networks/' + network + '/accounts/' + accountId + '/pages')
        .set('apikey', _token)
        .send({"pageIds": ["181574965361538"]})
        .expect("Content-type", /application\/json/)
        .expect(201)
        .end(function (err, res) {
          if (err) {
            throw err;
          }
          var data = res.body.data;
          storage.fbpageId = data.facebook.pages[0].id;
          data.facebook.pages[0].should.have.keys('id', 'page_id', 'account_id', 'username', 'image', 'name', 'invalid', 'profileName', 'profileImage');
          done()
        })
    });


    it('Should return validity informations', function (done) {
      request(url)
        .get('/v1/users/' + _userId + '/networks/validate-accounts')
        .set('cache', 'false')
        .set('apikey', _token)
        .expect("Content-type", /application\/json/)
        .expect(200)
        .end(function (err, res) {
          if (err) {
            throw err;
          }
          var data = res.body.data;
          data.should.be.Object();
          data.facebook.accounts[0].should.have.keys('id', 'image', 'name', 'account', 'account_id', 'expires', 'invalid', 'scopes');
          data.facebook.pages[0].should.have.keys('id', 'image', 'name', 'page_id', 'account_id', 'invalid', 'scopes');
          done()
        })
    });

    it('Should delete page', function (done) {
      request(url)
        .del('/v1/users/' + _userId + '/networks/' + network + '/pages/' + storage.fbpageId)
        .set('apikey', _token)
        .expect("Content-type", /application\/json/)
        .expect(202)
        .end(function (err, res) {
          if (err) {
            throw err;
          }
          var data = res.body.data;
          data.should.be.Object();
          data.facebook.pages.should.be.empty();
          done()
        })
    });

    it('Should delete account', function (done) {
      request(url)
        .del('/v1/users/' + _userId + '/networks/' + network + '/accounts/' + accountId)
        .set('apikey', _token)
        .expect("Content-type", /application\/json/)
        .expect(202)
        .end(function (err, res) {
          if (err) {
            throw err;
          }
          var data = res.body.data;
          data.should.be.Object();
          data.facebook.accounts.should.be.empty();
          done()
        })
    });
  });

  describe('GOOGLE PLUS', function () {
    var network = 'google';
    var accountId = 169692;
    it('Should return all possible pages', function (done) {
      request(url)
        .get('/v1/users/' + _userId + '/networks/' + network + '/accounts/' + accountId + '/pages')
        .set('cache', 'false')
        .set('apikey', _token)
        .expect("Content-type", /application\/json/)
        .expect(200)
        .end(function (err, res) {
          if (err) {
            throw err;
          }
          var pages = res.body.data;
          pages[1].id.should.be.equal("105351351863874932295");
          pages[1].name.should.be.equal("Běh údolím Samoty");
          pages[1].should.have.keys('image', 'id', 'name');
          done()
        })
    });

    it('Should add page', function (done) {
      request(url)
        .post('/v1/users/' + _userId + '/networks/' + network + '/accounts/' + accountId + '/pages')
        .set('apikey', _token)
        .send({"pageIds": ["105351351863874932295"]})
        .expect("Content-type", /application\/json/)
        .expect(201)
        .end(function (err, res) {
          if (err) {
            throw err;
          }
          var data = res.body.data;
          storage.gppageId = data.google.pages[0].id;
          done()
        })
    });

    it('Should delete page', function (done) {
      request(url)
        .del('/v1/users/' + _userId + '/networks/' + network + '/pages/' + storage.gppageId)
        .set('apikey', _token)
        .expect("Content-type", /application\/json/)
        .expect(202)
        .end(function (err, res) {
          if (err) {
            throw err;
          }
          var data = res.body.data;
          data.should.be.Object();
          data.google.pages.should.be.empty();
          done()
        })
    });

    it('Should delete account', function (done) {
      request(url)
        .del('/v1/users/' + _userId + '/networks/' + network + '/accounts/' + accountId)
        .set('apikey', _token)
        .expect("Content-type", /application\/json/)
        .expect(202)
        .end(function (err, res) {
          if (err) {
            throw err;
          }
          var data = res.body.data;
          data.should.be.Object();
          data.google.accounts.should.be.empty();
          done()
        })
    });
  });

  describe('LINKEDIN', function () {
    var network = 'linkedin';
    var accountId = 169697;
    it('Should return all possible pages', function (done) {
      request(url)
        .get('/v1/users/' + _userId + '/networks/' + network + '/accounts/' + accountId + '/pages')
        .set('cache', 'false')
        .set('apikey', _token)
        .expect("Content-type", /application\/json/)
        .expect(200)
        .end(function (err, res) {
          if (err) {
            throw err;
          }
          var pages = res.body.data;
          pages[0].id.should.be.equal(6384045);
          pages[0].name.should.be.equal("Svět běžce");
          pages[0].should.have.keys('image', 'id', 'name');
          done()
        })
    });

    it('Should add page', function (done) {
      request(url)
        .post('/v1/users/' + _userId + '/networks/' + network + '/accounts/' + accountId + '/pages')
        .set('apikey', _token)
        .send({"pageIds": ["6384045"]})
        .expect("Content-type", /application\/json/)
        .expect(201)
        .end(function (err, res) {
          if (err) {
            throw err;
          }
          var data = res.body.data;
          storage.lipageId = data.linkedin.pages[0].id;
          done()
        })
    });

    it('Should delete page', function (done) {
      request(url)
        .del('/v1/users/' + _userId + '/networks/' + network + '/pages/' + storage.lipageId)
        .set('apikey', _token)
        .expect("Content-type", /application\/json/)
        .expect(202)
        .end(function (err, res) {
          if (err) {
            throw err;
          }
          var data = res.body.data;
          data.should.be.Object();
          data.linkedin.pages.should.be.empty();
          done()
        })
    });

    it('Should delete account', function (done) {
      request(url)
        .del('/v1/users/' + _userId + '/networks/' + network + '/accounts/' + accountId)
        .set('apikey', _token)
        .expect("Content-type", /application\/json/)
        .expect(202)
        .end(function (err, res) {
          if (err) {
            throw err;
          }
          var data = res.body.data;
          data.should.be.Object();
          data.linkedin.accounts.should.be.empty();
          done()
        })
    });
  });

  describe('TWITTER', function () {
    var network = 'twitter';
    var accountId = 169698;

    it('Should delete account', function (done) {
      request(url)
        .del('/v1/users/' + _userId + '/networks/' + network + '/accounts/' + accountId)
        .set('apikey', _token)
        .expect("Content-type", /application\/json/)
        .expect(202)
        .end(function (err, res) {
          if (err) {
            throw err;
          }
          var data = res.body.data;
          data.should.be.Object();
          data.twitter.accounts.should.be.empty();
          done()
        })
    });
  });

  describe('YOUTUBE', function () {
    var network = 'youtube';
    var pageId = 1;

    it('Should delete account', function (done) {
      request(url)
        .del('/v1/users/' + _userId + '/networks/' + network + '/pages/' + pageId)
        .set('apikey', _token)
        .expect("Content-type", /application\/json/)
        .expect(202)
        .end(function (err, res) {
          if (err) {
            throw err;
          }
          var data = res.body.data;
          data.should.be.Object();
          data.youtube.pages.should.be.empty();
          done()
        })
    });
  });

  describe('INSTAGRAM', function () {
    var network = 'instagram';
    var accountId = 169699;

    it('Should delete account', function (done) {
      request(url)
        .del('/v1/users/' + _userId + '/networks/' + network + '/accounts/' + accountId)
        .set('apikey', _token)
        .expect("Content-type", /application\/json/)
        .expect(202)
        .end(function (err, res) {
          if (err) {
            throw err;
          }
          var data = res.body.data;
          data.should.be.Object();
          data.instagram.accounts.should.be.empty();
          done()
        })
    });
  });

  describe('EMAIL', function () {
    var network = 'email';
    var _emailId;

    it('Should create email connection', function (done) {
      request(url)
        .post('/v1/users/' + _userId + '/networks/' + network)
        .set('apikey', _token)
        .send({
          "name": "test@gmail.com",
          "imap": {
            "username": "test1@gmail.com",
            "password": "ěščřžýáíé~!@#$%^&*()",
            "server": "iimap.gmail.com",
            "port": 991,
            "secure": "tls"
          },
          "smtp": {
            "username": "test2@gmail.com",
            "password": "heslo",
            "server": "ismtp.gmail.com",
            "port": 464,
            "secure": ""
          },
          "settings": {
            "footer": "<p>\r\n\t<strong> Zdravi mas</strong>\r\n</p>\r\n<p>\r\n\t<img src=\"http://www.zoomsphere.com/files/streamUpload/c8b7400e189fb563f53c4a941a6870cb5dbf8d2b.jpg\" style=\"width: 110px;\">\r\n</p>"
          }
        })
        .expect("Content-type", /application\/json/)
        .expect(201)
        .end(function (err, res) {
          if (err) {
            throw err;
          }
          var data = res.body.data;
          data.should.be.Object();
          data.email[0].id.should.be.Number();
          _emailId = data.email[0].id;
          data.email[0].name.should.be.equal("test@gmail.com");
          data.email[0].imap.username.should.be.equal("test1@gmail.com");
          data.email[0].imap.password.should.be.equal("ěščřžýáíé~!@#$%^&*()");
          data.email[0].imap.server.should.be.equal("iimap.gmail.com");
          data.email[0].imap.port.should.be.equal(991);
          data.email[0].imap.secure.should.be.equal("tls");
          data.email[0].smtp.username.should.be.equal("test2@gmail.com");
          data.email[0].smtp.password.should.be.equal("heslo");
          data.email[0].smtp.server.should.be.equal("ismtp.gmail.com");
          data.email[0].smtp.port.should.be.equal(464);
          data.email[0].smtp.secure.should.be.equal("");
          done()
        })
    });

    it('Should update email connection', function (done) {
      request(url)
        .put('/v1/users/' + _userId + '/networks/' + network + "/" + _emailId)
        .set('apikey', _token)
        .send({
          "name": "aaa@gmail.com",
          "imap": {
            "username": "test@gmail.com",
            "password": "test",
            "server": "imap.gmail.com",
            "port": 993,
            "secure": "tls"
          },
          "smtp": {
            "username": "test1@gmail.com",
            "password": "heslo123",
            "server": "smtp.gmail.com",
            "port": 465,
            "secure": "ssl"
          },
          "settings": {
            "footer": "<p>\r\n\t<strong> Zdravi mas</strong>\r\n</p>\r\n<p>\r\n\t<img src=\"http://www.zoomsphere.com/files/streamUpload/c8b7400e189fb563f53c4a941a6870cb5dbf8d2b.jpg\" style=\"width: 110px;\">\r\n</p>"
          }
        })
        .expect("Content-type", /application\/json/)
        .expect(202)
        .end(function (err, res) {
          if (err) {
            throw err;
          }
          var data = res.body.data;
          data.should.be.Object();
          data.email.should.have.length(1);
          data.email[0].id.should.be.equal(_emailId);
          data.email[0].name.should.be.equal("aaa@gmail.com");
          data.email[0].imap.username.should.be.equal("test@gmail.com");
          data.email[0].imap.password.should.be.equal("test");
          data.email[0].imap.server.should.be.equal("imap.gmail.com");
          data.email[0].imap.port.should.be.equal(993);
          data.email[0].imap.secure.should.be.equal("tls");
          data.email[0].smtp.username.should.be.equal("test1@gmail.com");
          data.email[0].smtp.password.should.be.equal("heslo123");
          data.email[0].smtp.server.should.be.equal("smtp.gmail.com");
          data.email[0].smtp.port.should.be.equal(465);
          data.email[0].smtp.secure.should.be.equal("ssl");
          done()
        })
    });

    it('Should delete email settings', function (done) {
      request(url)
        .del('/v1/users/' + _userId + '/networks/' + network + "/" + _emailId)
        .set('apikey', _token)
        .expect("Content-type", /application\/json/)
        .expect(202)
        .end(function (err, res) {
          if (err) {
            throw err;
          }
          var data = res.body.data;
          data.should.be.Object();
          data.email.should.be.empty();
          done()
        })
    });

    it('Should return my social account', function (done) {
      request(url)
        .get('/v1/connected-profiles')
        .set('cache', 'false')
        .set('apikey', _token)
        .expect("Content-type", /application\/json/)
        .expect(200)
        .end(function (err, res) {
          if (err) {
            throw err;
          }
          res.body.data[0].should.containDeep({
            id: '3',
            name: 'FB aplikace',
            network: 'api',
            image: 'https://www.zoomsphere.com/css/images/FB_logo.png',
            grant: null,
            username: null
          });
          done()
        })
    });
  });
});