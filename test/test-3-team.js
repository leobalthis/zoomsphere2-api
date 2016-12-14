var app = require('../index'),
  url = app.listen(),
  should = require('should'),
  request = require('supertest');


describe('TEAM SETTINGS', function () {
  "use strict";
  var _token;
  var _userId;
  var _mateId;
  var _invitation;
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
          res.body.data.apikey.should.be.String();
          res.body.data.userId.should.be.Number();
          _token = res.body.data.apikey;
          _userId = res.body.data.userId;
          done()
        })
    })
  });

  describe('GET TEAM', function () {
    it('should return empty array - haven\'t team yet', function (done) {
      request(url)
        .get('/v1/users/' + _userId + '/teammates')
        .set('cache', 'false')
        .set('apikey', _token)
        .expect("Content-type", /application\/json/)
        .expect(200)
        .end(function (err, res) {
          if (err) {
            throw err;
          }
          var team = res.body.data.teammates;
          team.should.be.empty();
          done()
        })
    })
  });

  describe('TEAMMATE', function () {
    describe('CREATE TEAMMATE', function () {
      it('should return team array', function (done) {
        request(url)
          .post('/v1/users/' + _userId + '/teammates')
          .set('apikey', _token)
          .send({
            "fullName": "test",
            "email": "tomik.momik@seznam.zoomsphere.com",
            "company": "jejich spolecnost",
            "position": "CTO",
            "image_square": "http://server/test.file"
          })
          .expect("Content-type", /application\/json/)
          .expect(201)
          .end(function (err, res) {

            if (err) {
              throw err;
            }
            var team = res.body.data.teammates;
            team.should.be.Array();
            team[0].should.have.keys('id', 'fullName', 'email', 'company', 'position', 'image_square', 'modules', 'date_logged');
            team[0].id.should.be.Number();
            _mateId = team[0].id;
            team[0].fullName.should.be.equal("test");
            team[0].email.should.be.equal("tomik.momik@seznam.zoomsphere.com");
            team[0].company.should.be.equal("jejich spolecnost");
            team[0].position.should.be.equal("CTO");
            team[0].image_square.should.be.equal("http://server/test.file");
            done()
          })
      });
    });

    describe('UPDATE', function () {
      it('should save teammate', function (done) {
        request(url)
          .put('/v1/users/' + _userId + '/teammates/' + _mateId)
          .set('apikey', _token)
          .send({
            "fullName": "Moje jmeno",
            "email": "tomik.momik@seznam.cz",
            "company": "nase spolecnost",
            "position": "reditel",
            "image_square": "http://server/test.file"
          })
          .expect("Content-type", /application\/json/)
          .expect(200)
          .end(function (err, res) {
            if (err) {
              throw err;
            }
            var team = res.body.data.teammates;
            team.should.be.Array();
            team[0].should.have.keys('id', 'fullName', 'email', 'company', 'position', 'image_square', 'modules', 'date_logged');
            team[0].id.should.be.Number();
            team[0].fullName.should.be.equal("Moje jmeno");
            team[0].email.should.be.equal("tomik.momik@seznam.cz");
            team[0].company.should.be.equal("nase spolecnost");
            team[0].position.should.be.equal("reditel");
            team[0].image_square.should.be.equal("http://server/test.file");
            done()
          })
      })
    });
  });

  describe('GET INVITATION', function () {
    it('should return invitation detail', function (done) {
      request(url)
        .get('/v1/users/' + _userId + '/teammates/' + _mateId + '/invitations')
        .set('cache', 'false')
        .set('apikey', _token)
        .expect("Content-type", /application\/json/)
        .expect(200)
        .end(function (err, res) {
          if (err) {
            throw err;
          }
          _invitation = res.body.data.invitation;
          var previous = res.body.data.previous;
          _invitation.subject.should.be.String();
          _invitation.content.should.be.String();
          previous.should.be.empty();
          done()
        })
    })
  });

  describe('SEND INVITATION', function () {
    it('should send email with invitation link and return success', function (done) {
      request(url)
        .post('/v1/users/' + _userId + '/teammates/' + _mateId + '/invitations')
        .set('apikey', _token)
        .send(_invitation)
        .expect("Content-type", /application\/json/)
        .expect(201)
        .end(function (err, res) {
          if (err) {
            throw err;
          }
          res.body.data.success.should.be.True();
          done()
        })
    })
  });

  describe('TRY TO SEND INVITATION AGAIN', function () {
    it('should not send email return 200 success', function (done) {
      request(url)
        .post('/v1/users/' + _userId + '/teammates/' + _mateId + '/invitations')
        .set('apikey', _token)
        .send(_invitation)
        .expect("Content-type", /application\/json/)
        .expect(200)
        .end(function (err, res) {
          if (err) {
            throw err;
          }
          res.body.data.success.should.be.True();
          done()
        })
    })
  });

  describe('GET INVITATION', function () {
    it('should return invitation detail', function (done) {
      request(url)
        .get('/v1/users/' + _userId + '/teammates/' + _mateId + '/invitations')
        .set('cache', 'false')
        .set('apikey', _token)
        .expect("Content-type", /application\/json/)
        .expect(200)
        .end(function (err, res) {
          if (err) {
            throw err;
          }
          _invitation = res.body.data.invitation;
          var previous = res.body.data.previous;
          _invitation.subject.should.be.String();
          _invitation.content.should.be.String();
          previous.should.be.Array();
          previous[0].should.have.keys('datetime', 'content', 'subject', 'status');
          done()
        })
    })
  });

  describe('SAVE TEMPLATE', function () {
    it('should save email content and subject a template', function (done) {
      request(url)
        .put('/v1/users/' + _userId + '/teammates/' + _mateId + '/invitations')
        .set('apikey', _token)
        .send(_invitation)
        .expect("Content-type", /application\/json/)
        .expect(202)
        .end(function (err, res) {
          if (err) {
            throw err;
          }
          res.body.data.success.should.be.equal(true);
          done()
        })
    })
  });

  describe('PERMISSIONS', function () {
    describe('GET', function () {
      it('should return empty', function (done) {
        request(url)
          .get('/v1/users/' + _userId + '/teammates/' + _mateId + '/permissions')
          .set('cache', 'false')
          .set('apikey', _token)
          .expect("Content-type", /application\/json/)
          .expect(200)
          .end(function (err, res) {
            if (err) {
              throw err;
            }
            res.body.data.modules.should.containDeep({
              "crm": false,
              "report": false,
              "create_module": false
            });
            res.body.data.accounts.length.should.be.equal(25);
            res.body.data.accounts[0].should.containDeep({
              "id": 3677,
              "page_id": 144461962361499,
              "account_id": 735432345,
              "name": "Grafika za babku",
              "image": "https://scontent.xx.fbcdn.net/hprofile-xfp1/v/t1.0-1/c258.35.444.444/s100x100/71421_248206431987051_697057973_n.jpg?oh=6109e0c44bf54b4f1ccc298080fd66be&oe=574FE5EF",
              "invalid": null,
              "network": "facebook",
              "shared": false,
              "permissions": {reply: '', publisher: ''},
              "username": null
            });
            done()
          })
      })
    });

    describe('SHARE PAGES', function () {
      it('should return empty', function (done) {
        let body = {
          "modules": {
            "crm": true,
            "report": true,
            "create_module": true
          },
          "accounts": [
            {
              "id": 85,
              "page_id": 32553695078,
              "account_id": 735432345,
              "name": "MicroMedia",
              "image": "https://scontent.xx.fbcdn.net/hprofile-xpf1/t5.0-1/50416_32553695078_6621561_s.jpg",
              "invalid": null,
              "network": "facebook",
              "shared": true,
              "permissions": {reply: 'reply_editor', publisher: 'publisher_editor'}
            },
            {
              "id": 156,
              "page_id": 216991061646631,
              "account_id": 735432345,
              "name": "Zoomsphere",
              "image": "https://scontent.xx.fbcdn.net/hprofile-xpt1/v/t1.0-1/p100x100/12027792_1056759294336466_231676370004916611_n.png?oh=b07e91f0cc25f1fe7e4bd85a99eaf735&oe=5766198B",
              "invalid": null,
              "network": "facebook",
              "shared": true,
              "permissions": {reply: 'reply_operator', publisher: 'publisher_client'}
            },
            {
              "id": 393,
              "page_id": 595588303787593,
              "account_id": 735432345,
              "name": "Zoomsphere Brasil",
              "image": "https://scontent.xx.fbcdn.net/hprofile-xat1/v/t1.0-1/p100x100/10671329_902837456396008_5519488460678965633_n.png?oh=bf88bc788805f5acedd96119ef8547fb&oe=5761C7F1",
              "invalid": null,
              "network": "facebook",
              "shared": true,
              "permissions": {reply: 'reply_manager', publisher: 'publisher'}
            },
            {
              "id": 3677,
              "page_id": 144461962361499,
              "account_id": 735432345,
              "name": "Grafika za babku",
              "image": "https://scontent.xx.fbcdn.net/hprofile-xfp1/v/t1.0-1/c258.35.444.444/s100x100/71421_248206431987051_697057973_n.jpg?oh=6109e0c44bf54b4f1ccc298080fd66be&oe=574FE5EF",
              "invalid": null,
              "network": "facebook",
              "shared": true,
              "permissions": {reply: '', publisher: 'publisher'}
            },
            {
              "id": 5257,
              "page_id": 840409735989675,
              "account_id": 735432345,
              "name": "ZoomSphere Türkiye",
              "image": "https://scontent.xx.fbcdn.net/hprofile-xpt1/v/l/t1.0-1/p100x100/10624772_845767378787244_9118323379097830710_n.png?oh=66dce1fbef9ecf0e48ddd3909ee698a6&oe=57502029",
              "invalid": null,
              "network": "facebook",
              "shared": true,
              "permissions": {reply: 'reply_editor', publisher: ''}
            },
            {
              "id": 6115,
              "page_id": 720662508017112,
              "account_id": 735432345,
              "name": "ZoomSphere Magyarország",
              "image": "https://scontent.xx.fbcdn.net/hprofile-xtp1/v/t1.0-1/p100x100/10858538_720663618017001_5886131197483214307_n.png?oh=3a9bf2ab5fd46d8d3c0e12bc4c035de5&oe=576359E6",
              "invalid": null,
              "network": "facebook",
              "shared": true,
              "permissions": {reply: '', publisher: ''}
            },
            {
              "id": 6585,
              "page_id": 181574965361538,
              "account_id": 735432345,
              "name": "Zoomsphere Czech Republic",
              "image": "https://scontent.xx.fbcdn.net/hprofile-xta1/v/t1.0-1/p100x100/1524845_333197133532653_4261963649617623775_n.png?oh=d1b53966c9062cabda536140cb077c4e&oe=575F2F4F",
              "invalid": null,
              "network": "facebook",
              "shared": true,
              "permissions": {reply: 'reply_editor', publisher: ''}
            },
            {
              "id": 8989,
              "page_id": 1445319499097796,
              "account_id": 735432345,
              "name": "ZoomSphere România",
              "image": "https://scontent.xx.fbcdn.net/hprofile-xap1/v/t1.0-1/p100x100/11329935_1446900098939736_2184925335844322878_n.png?oh=045ad2f70081785cb054fa515fdefdf2&oe=575A804B",
              "invalid": null,
              "network": "facebook",
              "shared": true,
              "permissions": {reply: 'reply_editor', publisher: ''}
            },
            {
              "id": 11437,
              "page_id": 437160266473209,
              "account_id": 735432345,
              "name": "ZoomSphere Italia",
              "image": "https://scontent.xx.fbcdn.net/hprofile-xat1/v/t1.0-1/p100x100/11951343_437160609806508_6256403890990203706_n.png?oh=c7e9002000d6f3931296c3b17baa978d&oe=576E505D",
              "invalid": null,
              "network": "facebook",
              "shared": true,
              "permissions": {reply: 'reply_editor', publisher: ''}
            },
            {
              "id": 423,
              "page_id": "104541544741131647112",
              "account_id": "113442593617852227101",
              "name": "ZoomSphere",
              "image": "https://lh3.googleusercontent.com/-0_fNVzDgprw/AAAAAAAAAAI/AAAAAAAADK8/VMM4nrONDTk/photo.jpg?sz=50",
              "network": "google",
              "shared": true,
              "permissions": {reply: 'reply_editor', publisher: ''}
            },
            {
              "id": 37,
              "page_id": "4989763",
              "account_id": "17cVPeDpLF",
              "name": "ZoomSphere.com",
              "image": "https://media.licdn.com/mpr/mpr/p/4/005/02c/06b/1ff458a.png",
              "network": "linkedin",
              "shared": false,
              "permissions": {reply: '', publisher: ''}
            },
            {
              "id": 31,
              "page_id": "6384045",
              "account_id": "17cVPeDpLF",
              "name": "Svět běžce",
              "image": "https://media.licdn.com/mpr/mpr/p/5/005/0b7/34a/21cf506.png",
              "network": "linkedin",
              "shared": true,
              "permissions": {reply: 'reply_editor', publisher: ''}
            },
            {
              "id": 2,
              "page_id": "UCKGn1ljSsD3D9Jc3h1crK5A",
              "name": "Tomáš Černý",
              "image": "https://lh4.googleusercontent.com/-HE-XD1PYTck/AAAAAAAAAAI/AAAAAAAAAf0/ExE1ipfQSIk/photo.jpg?sz=50",
              "network": "youtube",
              "shared": true,
              "permissions": {}
            },
            {
              "id": "16448307",
              "name": "micromediacz",
              "image": "https://www.zoomsphere.com/files/userProfile/twitter_16448307.png",
              "network": "twitter",
              "shared": true,
              "permissions": {reply: 'reply_editor', publisher: ''}
            },
            {
              "id": "322580841",
              "name": "ZoomSphere",
              "image": "https://www.zoomsphere.com/files/userProfile/twitter_322580841.png",
              "network": "twitter",
              "shared": true,
              "permissions": {reply: 'reply_editor', publisher: ''}
            },
            {
              "id": "1243353548",
              "name": "MachJakub",
              "image": "https://www.zoomsphere.com/files/userProfile/twitter_1243353548.png",
              "network": "twitter",
              "shared": true,
              "permissions": {reply: 'reply_editor', publisher: ''}
            },
            {
              "id": "1312252009",
              "name": "ZoomSphereBR",
              "image": "https://www.zoomsphere.com/files/userProfile/twitter_1312252009.png",
              "network": "twitter",
              "shared": true,
              "permissions": {reply: 'reply_editor', publisher: ''}
            },
            {
              "id": "4501783157",
              "name": "ZoomSphereCZ",
              "image": "https://www.zoomsphere.com/files/userProfile/twitter_4501783157.png",
              "network": "twitter",
              "shared": true,
              "permissions": {reply: 'reply_editor', publisher: ''}
            },
            {
              "id": "1330048429",
              "name": "ZoomSphere.com",
              "image": "https://scontent.cdninstagram.com/hphotos-xpt1/t51.2885-19/s150x150/11887165_1035327926485882_1919315702_a.jpg",
              "network": "instagram",
              "shared": true,
              "permissions": {}
            },
            {
              "id": "1507500780",
              "name": "Iggy Dudinský",
              "image": "https://scontent.cdninstagram.com/hphotos-xpf1/t51.2885-19/1921961_1479244762335400_1791708834_a.jpg",
              "network": "instagram",
              "shared": true,
              "permissions": {}
            },
            {
              "id": "1465642518",
              "name": "solya",
              "image": "https://igcdn-photos-d-a.akamaihd.net/hphotos-ak-xfa1/t51.2885-19/s150x150/12142061_672192389584259_2071136957_a.jpg",
              "network": "instagram",
              "shared": true,
              "permissions": {}
            },
            {
              "id": "30811149",
              "name": "O2 Slovensko",
              "image": "https://scontent.cdninstagram.com/hphotos-xap1/t51.2885-19/11203179_1498623580398606_762838612_a.jpg",
              "network": "instagram",
              "shared": true,
              "permissions": {}
            },
            {
              "id": "2020746344",
              "name": "FIAT Romania",
              "image": "https://scontent.cdninstagram.com/hphotos-xaf1/t51.2885-19/s150x150/11375257_1481586278825079_846027702_a.jpg",
              "network": "instagram",
              "shared": true,
              "permissions": {}
            },
            {
              "id": 1,
              "name": "Crowdsourcing",
              "image": "https://www.zoomsphere.com/img/O2_logo.png",
              "network": "api",
              "shared": true,
              "permissions": {}
            },
            {
              "id": 74,
              "name": "zoomspheretomas@gmail.com",
              "network": "email",
              "shared": true,
              "permissions": {reply: 'reply_editor', publisher: ''}
            }
          ]
        };
        request(url)
          .put('/v1/users/' + _userId + '/teammates/' + _mateId + '/permissions')
          .send(body)
          .set('apikey', _token)
          .expect("Content-type", /application\/json/)
          .expect(202)
          .end(function (err, res) {
            if (err) {
              throw err;
            }
            res.body.data.accounts.should.containDeep(body.accounts);
            res.body.data.modules.should.containDeep(body.modules);
            done()
          })
      })
    });

    describe('CANCEL SHARE PAGES', function () {
      it('should return empty', function (done) {
        let body = {
          "modules": {
            "crm": false,
            "report": false,
            "create_module": true
          },
          "accounts": [
            {
              "id": 85,
              "page_id": 32553695078,
              "account_id": 735432345,
              "name": "MicroMedia",
              "image": "https://scontent.xx.fbcdn.net/hprofile-xpf1/t5.0-1/50416_32553695078_6621561_s.jpg",
              "invalid": null,
              "network": "facebook",
              "shared": false,
              "permissions": {reply: '', publisher: ''}
            },
            {
              "id": 156,
              "page_id": 216991061646631,
              "account_id": 735432345,
              "name": "Zoomsphere",
              "image": "https://scontent.xx.fbcdn.net/hprofile-xpt1/v/t1.0-1/p100x100/12027792_1056759294336466_231676370004916611_n.png?oh=b07e91f0cc25f1fe7e4bd85a99eaf735&oe=5766198B",
              "invalid": null,
              "network": "facebook",
              "shared": false,
              "permissions": {reply: '', publisher: ''}
            },
            {
              "id": 393,
              "page_id": 595588303787593,
              "account_id": 735432345,
              "name": "Zoomsphere Brasil",
              "image": "https://scontent.xx.fbcdn.net/hprofile-xat1/v/t1.0-1/p100x100/10671329_902837456396008_5519488460678965633_n.png?oh=bf88bc788805f5acedd96119ef8547fb&oe=5761C7F1",
              "invalid": null,
              "network": "facebook",
              "shared": false,
              "permissions": {reply: '', publisher: ''}
            },
            {
              "id": 3677,
              "page_id": 144461962361499,
              "account_id": 735432345,
              "name": "Grafika za babku",
              "image": "https://scontent.xx.fbcdn.net/hprofile-xfp1/v/t1.0-1/c258.35.444.444/s100x100/71421_248206431987051_697057973_n.jpg?oh=6109e0c44bf54b4f1ccc298080fd66be&oe=574FE5EF",
              "invalid": null,
              "network": "facebook",
              "shared": false,
              "permissions": {reply: '', publisher: ''}
            },
            {
              "id": 5257,
              "page_id": 840409735989675,
              "account_id": 735432345,
              "name": "ZoomSphere Türkiye",
              "image": "https://scontent.xx.fbcdn.net/hprofile-xpt1/v/l/t1.0-1/p100x100/10624772_845767378787244_9118323379097830710_n.png?oh=66dce1fbef9ecf0e48ddd3909ee698a6&oe=57502029",
              "invalid": null,
              "network": "facebook",
              "shared": false,
              "permissions": {reply: '', publisher: ''}
            },
            {
              "id": 6115,
              "page_id": 720662508017112,
              "account_id": 735432345,
              "name": "ZoomSphere Magyarország",
              "image": "https://scontent.xx.fbcdn.net/hprofile-xtp1/v/t1.0-1/p100x100/10858538_720663618017001_5886131197483214307_n.png?oh=3a9bf2ab5fd46d8d3c0e12bc4c035de5&oe=576359E6",
              "invalid": null,
              "network": "facebook",
              "shared": false,
              "permissions": {reply: '', publisher: ''}
            },
            {
              "id": 6585,
              "page_id": 181574965361538,
              "account_id": 735432345,
              "name": "Zoomsphere Czech Republic",
              "image": "https://scontent.xx.fbcdn.net/hprofile-xta1/v/t1.0-1/p100x100/1524845_333197133532653_4261963649617623775_n.png?oh=d1b53966c9062cabda536140cb077c4e&oe=575F2F4F",
              "invalid": null,
              "network": "facebook",
              "shared": false,
              "permissions": {reply: '', publisher: ''}
            },
            {
              "id": 8989,
              "page_id": 1445319499097796,
              "account_id": 735432345,
              "name": "ZoomSphere România",
              "image": "https://scontent.xx.fbcdn.net/hprofile-xap1/v/t1.0-1/p100x100/11329935_1446900098939736_2184925335844322878_n.png?oh=045ad2f70081785cb054fa515fdefdf2&oe=575A804B",
              "invalid": null,
              "network": "facebook",
              "shared": false,
              "permissions": {reply: '', publisher: ''}
            },
            {
              "id": 11437,
              "page_id": 437160266473209,
              "account_id": 735432345,
              "name": "ZoomSphere Italia",
              "image": "https://scontent.xx.fbcdn.net/hprofile-xat1/v/t1.0-1/p100x100/11951343_437160609806508_6256403890990203706_n.png?oh=c7e9002000d6f3931296c3b17baa978d&oe=576E505D",
              "invalid": null,
              "network": "facebook",
              "shared": false,
              "permissions": {reply: '', publisher: ''}
            },
            {
              "id": 423,
              "page_id": "104541544741131647112",
              "account_id": "113442593617852227101",
              "name": "ZoomSphere",
              "image": "https://lh3.googleusercontent.com/-0_fNVzDgprw/AAAAAAAAAAI/AAAAAAAADK8/VMM4nrONDTk/photo.jpg?sz=50",
              "network": "google",
              "shared": false,
              "permissions": {reply: '', publisher: ''}
            },
            {
              "id": 37,
              "page_id": "4989763",
              "account_id": "17cVPeDpLF",
              "name": "ZoomSphere.com",
              "image": "https://media.licdn.com/mpr/mpr/p/4/005/02c/06b/1ff458a.png",
              "network": "linkedin",
              "shared": false,
              "permissions": {reply: '', publisher: ''}
            },
            {
              "id": 31,
              "page_id": "6384045",
              "account_id": "17cVPeDpLF",
              "name": "Svět běžce",
              "image": "https://media.licdn.com/mpr/mpr/p/5/005/0b7/34a/21cf506.png",
              "network": "linkedin",
              "shared": false,
              "permissions": {reply: '', publisher: ''}
            },
            {
              "id": 2,
              "page_id": "UCKGn1ljSsD3D9Jc3h1crK5A",
              "name": "Tomáš Černý",
              "image": "https://lh4.googleusercontent.com/-HE-XD1PYTck/AAAAAAAAAAI/AAAAAAAAAf0/ExE1ipfQSIk/photo.jpg?sz=50",
              "network": "youtube",
              "shared": false,
              "permissions": {}
            },
            {
              "id": "16448307",
              "name": "micromediacz",
              "image": "https://www.zoomsphere.com/files/userProfile/twitter_16448307.png",
              "network": "twitter",
              "shared": false,
              "permissions": {reply: '', publisher: ''}
            },
            {
              "id": "322580841",
              "name": "ZoomSphere",
              "image": "https://www.zoomsphere.com/files/userProfile/twitter_322580841.png",
              "network": "twitter",
              "shared": false,
              "permissions": {reply: '', publisher: ''}
            },
            {
              "id": "1243353548",
              "name": "MachJakub",
              "image": "https://www.zoomsphere.com/files/userProfile/twitter_1243353548.png",
              "network": "twitter",
              "shared": false,
              "permissions": {reply: '', publisher: ''}
            },
            {
              "id": "1312252009",
              "name": "ZoomSphereBR",
              "image": "https://www.zoomsphere.com/files/userProfile/twitter_1312252009.png",
              "network": "twitter",
              "shared": false,
              "permissions": {reply: '', publisher: ''}
            },
            {
              "id": "4501783157",
              "name": "ZoomSphereCZ",
              "image": "https://www.zoomsphere.com/files/userProfile/twitter_4501783157.png",
              "network": "twitter",
              "shared": false,
              "permissions": {reply: '', publisher: ''}
            },
            {
              "id": "1330048429",
              "name": "ZoomSphere.com",
              "image": "https://scontent.cdninstagram.com/hphotos-xpt1/t51.2885-19/s150x150/11887165_1035327926485882_1919315702_a.jpg",
              "network": "instagram",
              "shared": false,
              "permissions": {}
            },
            {
              "id": "1507500780",
              "name": "Iggy Dudinský",
              "image": "https://scontent.cdninstagram.com/hphotos-xpf1/t51.2885-19/1921961_1479244762335400_1791708834_a.jpg",
              "network": "instagram",
              "shared": false,
              "permissions": {}
            },
            {
              "id": "1465642518",
              "name": "solya",
              "image": "https://igcdn-photos-d-a.akamaihd.net/hphotos-ak-xfa1/t51.2885-19/s150x150/12142061_672192389584259_2071136957_a.jpg",
              "network": "instagram",
              "shared": false,
              "permissions": {}
            },
            {
              "id": "30811149",
              "name": "O2 Slovensko",
              "image": "https://scontent.cdninstagram.com/hphotos-xap1/t51.2885-19/11203179_1498623580398606_762838612_a.jpg",
              "network": "instagram",
              "shared": false,
              "permissions": {}
            },
            {
              "id": "2020746344",
              "name": "FIAT Romania",
              "image": "https://scontent.cdninstagram.com/hphotos-xaf1/t51.2885-19/s150x150/11375257_1481586278825079_846027702_a.jpg",
              "network": "instagram",
              "shared": false,
              "permissions": {}
            },
            {
              "id": 1,
              "name": "Crowdsourcing",
              "image": "https://www.zoomsphere.com/img/O2_logo.png",
              "network": "api",
              "shared": false,
              "permissions": {}
            },
            {
              "id": 74,
              "name": "zoomspheretomas@gmail.com",
              "network": "email",
              "shared": false,
              "permissions": {reply: '', publisher: ''}
            }
          ]
        };
        request(url)
          .put('/v1/users/' + _userId + '/teammates/' + _mateId + '/permissions')
          .send(body)
          .set('apikey', _token)
          .expect("Content-type", /application\/json/)
          .expect(202)
          .end(function (err, res) {
            if (err) {
              throw err;
            }
            res.body.data.accounts.should.containDeep(body.accounts);
            res.body.data.modules.should.containDeep(body.modules);
            done()
          })
      })
    });
    var _modules;
    describe('GET MODULES TO SHARE WITH TEAMMATE', function () {
      it('should return modules list', function (done) {
        request(url)
          .get('/v1/users/' + _userId + '/teammates/' + _mateId + '/modules')
          .set('cache', 'false')
          .set('apikey', _token)
          .expect("Content-type", /application\/json/)
          .expect(200)
          .end(function (err, res) {
            if (err) {
              throw err;
            }
            _modules = res.body.data.modules;
            _modules.should.be.Array();
            _modules.forEach((module) => {
              module.id.should.be.Number();
              module.name.should.be.String();
              module.label.should.be.String();
              module.module.should.be.equalOneOf('socialinbox', 'email', 'rss', 'monitoring', 'publisher', 'report', 'chart', 'analytics', 'comparisons', 'customercare');
              module.settings.should.be.Object();
              module.shared.should.be.false();
              module.workspace.should.be.String();
            });
            done()
          })
      })
    });

    describe('SAVE MODULES SHARING', function () {
      it('should save module sharing and return modules list', function (done) {
        var shared = [];
        _modules[0].shared = true;
        shared.push(_modules[0].id);
        _modules[2].shared = true;
        shared.push(_modules[2].id);
        request(url)
          .put('/v1/users/' + _userId + '/teammates/' + _mateId + '/modules')
          .set('apikey', _token)
          .send({modules: _modules})
          .expect("Content-type", /application\/json/)
          .expect(202)
          .end(function (err, res) {
            if (err) {
              throw err;
            }
            res.body.data.modules.should.be.Array();
            res.body.data.modules.forEach((module) => {
              if (shared.indexOf(module.id) !== -1) {
                module.shared.should.be.True();
              } else {
                module.shared.should.be.False();
              }
            });
            done()
          })
      })
    });

    describe('GET TEAMMATES IN WORKSPACE', function () {
      it('should return teammates list', function (done) {
        request(url)
          .get('/v1/users/teammates/workspaces/0')
          .set('cache', 'false')
          .set('apikey', _token)
          .expect("Content-type", /application\/json/)
          .expect(200)
          .end(function (err, res) {
            if (err) {
              throw err;
            }
            let tm = res.body.data.teammates;
            tm.should.be.Array();
            tm[0].should.have.keys('id', 'fullName', 'image', 'date_logged');
            tm[0].id.should.be.equal(42);
            tm[0].fullName.should.be.equal('Moje jmeno');
            tm[0].image.should.be.equal('http://server/test.file');
            done()
          })
      })
    });

    describe('DISCARD MODULES SHARING', function () {
      it('should discard module sharing and return modules list', function (done) {
        _modules[0].shared = false;
        _modules[2].shared = false;
        request(url)
          .put('/v1/users/' + _userId + '/teammates/' + _mateId + '/modules')
          .set('apikey', _token)
          .send({modules: _modules})
          .expect("Content-type", /application\/json/)
          .expect(202)
          .end(function (err, res) {
            if (err) {
              throw err;
            }
            res.body.data.modules.should.be.Array();
            res.body.data.modules.forEach((module) => {
              module.shared.should.be.False();
            });
            done()
          })
      })
    });
  });
});