var fs = require('fs'),
  mysql = require('mysql'),
  app = require('../index'),
  url = app.listen(),
  should = require('should'),
  request = require('supertest');
var connection = mysql.createConnection({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  ssl: 'Amazon RDS',
  multipleStatements: true
});

describe('0-START', function () {
  "use strict";
  var _token;
  var _userId;

  before(function (done) {
    if(process.env.MYSQL_DATABASE.indexOf('test') === -1) {
      throw new Error('Configure test database first !');
    }
    console.log('START CREATE DATABASE');
    connection.query(fs.readFileSync(__dirname + '/database-schema.sql', 'utf8'), function (err, res) {
      if (err) throw err;
      console.log("DATABASE SCHEMA LOADED");
      connection.query(fs.readFileSync(__dirname + '/database-test-data.sql', 'utf8'), function (err, res) {
        if (err) throw err;
        console.log("DATABASE TEST DATA LOADED");
        connection.end();
        done()
      });
    });
  });

  describe('public page', function () {
    it('should return version id', function (done) {
      request(url)
        .get('/')
        .set('cache', 'false')
        .expect("Content-type", /application\/json/)
        .expect(200)
        .end(function (err, res) {

          if (err) {
            throw err;
          }
          res.body.should.be.Object();
          done()
        })
    })
  });

  describe('login', function () {

    it('should return token', function (done) {
      var credentials = {
        "email": "tom@zoomsphere.com",
        "password": "karel"
      };
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
      var credentials = {
        "id": _userId
      };
      request(url)
        .get('/v1/users/' + credentials.id)
        .set('apikey', _token)
        .set('cache', 'false')
        .expect("Content-type", /application\/json/)
        .expect(200)
        .end(function (err, res) {
          if (err) {
            throw err;
          }
          var user = res.body.data.user;
          user.id.should.be.Number();
          user.fullName.should.be.String();
          user.country.should.be.String();
          user.account.should.be.equalOneOf(['facebook', 'zoomsphere', 'twitter', 'google']);
          user.email.should.be.String();
          user.state.should.be.String();
          user.modules.crm.should.be.True();
          user.modules.report.should.be.True();
          user.modules.create_module.should.be.True();
          res.body.data.statistics.should.be.Object();
          res.body.data.workspaces[0].should.have.keys('id', 'name', 'module_count');
          res.body.data.workspaces[0].id.should.be.equal(0);
          res.body.data.workspaces[0].name.should.be.equal('Default Workspace');
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

  describe('FILE UPLOAD', function () {

    it('should upload twext file and return url of the new file', function (done) {
      var buffer = fs.readFileSync(__dirname + '/test.txt');
      request(url)
        .post('/v1/files/upload')
        .set('apikey', _token)
        .send({
          "sizeTotal": buffer.length,
          "sizeChunk": buffer.length,
          "sizeTransferred": "0",
          "data": buffer.toJSON(),
          "contentType": "text/plain",
          "name": "test.txt"
        })
        .expect("Content-type", /application\/json/)
        .expect(201)
        .end(function (err, res) {
          if (err) {
            throw err;
          }
          res.body.data.should.be.Object();
          res.body.data.url.should.be.String();
          done()
        })
    });

    it('should return url of the new file', function (done) {
      var buffer = fs.readFileSync(__dirname + '/test.png');
      request(url)
        .post('/v1/files/upload')
        .set('apikey', _token)
        .send({
          "sizeTotal": buffer.length,
          "sizeChunk": buffer.length,
          "sizeTransferred": "0",
          "data": buffer.toJSON(),
          "contentType": "image/png"
        })
        .expect("Content-type", /application\/json/)
        .expect(201)
        .end(function (err, res) {
          if (err) {
            throw err;
          }
          res.body.data.should.be.Object();
          res.body.data.url.should.be.String();
          done()
        })
    });

    it('should return url of the new resized image', function (done) {
      var buffer = fs.readFileSync(__dirname + '/test.png');
      request(url)
        .post('/v1/files/upload')
        .set('apikey', _token)
        .send({
          "sizeTotal": buffer.length,
          "sizeChunk": buffer.length,
          "sizeTransferred": "0",
          "data": buffer.toJSON(),
          "contentType": "image/png",
          "resize": {"sizes": [{"width": 50, "height": 50}]}
        })
        .expect("Content-type", /application\/json/)
        .expect(201)
        .end(function (err, res) {
          if (err) {
            throw err;
          }
          res.body.data.should.be.Array();
          let data = res.body.data[0];
          data.url.should.be.String();
          data.size.should.be.Object();
          data.size.width.should.be.equal(50);
          data.size.height.should.be.equal(50);
          done()
        })
    });

    it('should return url of the resized profile picture and original', function (done) {
      var buffer = fs.readFileSync(__dirname + '/test.png');
      request(url)
        .post('/v1/upload/profile-picture')
        .set('apikey', _token)
        .send({
          "sizeTotal": buffer.length,
          "sizeChunk": buffer.length,
          "sizeTransferred": "0",
          "data": buffer.toJSON(),
          "contentType": "image/png"
        })
        .expect("Content-type", /application\/json/)
        .expect(201)
        .end(function (err, res) {
          if (err) {
            throw err;
          }
          res.body.data.should.be.Array();
          let images = res.body.data;
          images.forEach((image) => {
            image.should.be.Object();
            image.url.should.be.String();
            image.size.should.be.oneOf({original: true}, {width: 100, height: 100});
          });
          done()
        })
    });

    it('should return array of urls of the file and thumbnail', function (done) {
      var buffer = fs.readFileSync(__dirname + '/test.png');
      request(url)
        .post('/v1/upload/chat-file')
        .set('apikey', _token)
        .send({
          "sizeTotal": buffer.length,
          "sizeChunk": buffer.length,
          "sizeTransferred": "0",
          "data": buffer.toJSON(),
          "contentType": "image/png"
        })
        .expect("Content-type", /application\/json/)
        .expect(201)
        .end(function (err, res) {
          if (err) {
            throw err;
          }
          res.body.data.should.be.Array();
          let images = res.body.data;
          images.forEach((image) => {
            image.should.be.Object();
            image.url.should.be.String();
            image.size.should.be.oneOf({original: true}, {width: 300, height: 300});
          });
          done()
        })
    })
  });
  let image;
  describe('Link preview', function () {
    it('should return link preview', function (done) {
      request(url)
        .get('/v1/link-preview?url=http://nazory.e15.cz/rozhovory/bohumil-dolezal-sobotka-je-pasivni-nemuze-se-divit-ze-prohrava-1323702')
        .expect("Content-type", /application\/json/)
        .expect(200)
        .end(function (err, res) {
          if (err) {
            throw err;
          }
          res.body.data.should.be.Object();
          let preview = res.body.data.preview;
          preview.should.have.keys('url', 'loadFailed', 'title', 'keywords', 'description', 'contentType', 'mediaType', 'images', 'host');
          preview.url.should.be.equal('http://nazory.e15.cz/rozhovory/bohumil-dolezal-sobotka-je-pasivni-nemuze-se-divit-ze-prohrava-1323702');
          preview.images.should.be.String();
          image = preview.images;
          done()
        })
    })
  });

  describe('Image Proxy', function () {
    it('should return image', function (done) {
      request(url)
        .get('/v1/proxy?url=' + image.split('/v1/proxy?url=')[1])
        .expect("Content-type", /image\/jpeg/)
        .expect(200)
        .end(function (err, res) {
          if (err) {
            throw err;
          }
          done()
        })
    })
  });

  describe('Contact form', function () {
    it('should send email', function (done) {
      request(url)
        .post('/v1/contact-form')
        .send({
          "name": "unit test - Jmeno",
          "type": "CZ",
          "message": "zprava",
          "email": "dev@zoomsphere.com"
        })
        .expect("Content-type", /application\/json/)
        .expect(201)
        .end(function (err, res) {
          if (err) {
            throw err;
          }
          res.body.data.should.be.Object();
          done()
        })
    })
  });
});