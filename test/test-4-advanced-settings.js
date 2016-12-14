var app = require('../index'),
  url = app.listen(),
  should = require('should'),
  request = require('supertest');


describe('ADVANCED SETTINGS', function () {
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

  describe('GET SETTINGS', function () {
    it('should return default settings', function (done) {
      request(url)
        .get('/v1/users/' + _userId + '/advancedSettings')
        .set('cache', 'false')
        .set('apikey', _token)
        .expect("Content-type", /application\/json/)
        .expect(200)
        .end(function (err, res) {
          if (err) {
            throw err;
          }
          var ws = res.body.data.workspaces[0];
          ws.id.should.be.equal(0);
          ws.name.should.be.equal('Default Workspace');
          ws.socialMediaFeedLabels.should.be.Array();
          ws.socialMediaFeedLabels[0].should.have.keys('id', 'name', 'color');
          ws.publisherLabels.should.be.Array();
          ws.publisherLabels[0].should.have.keys('id', 'name', 'color');
          let bh = res.body.data.businessHours;
          bh.active.should.be.False();
          bh.hours.should.be.Object();
          Object.keys(bh.hours).length.should.be.equal(7);
          bh.hours['1'].should.be.Array();
          res.body.data.emailFooter.should.be.equal('');
          done()
        })
    })
  });

  describe('CHANGE EMAIL FOOTER', function () {
    it('should return advanced settings', function (done) {
      var footer = 'test<br>footerr<p>řžýíýá</p>';
      request(url)
        .put('/v1/users/' + _userId + '/advancedSettings/emailFooter')
        .set('apikey', _token)
        .send({
          "emailFooter": footer
        })
        .expect("Content-type", /application\/json/)
        .expect(202)
        .end(function (err, res) {
          if (err) {
            throw err;
          }
          var ws = res.body.data.workspaces[0];
          ws.id.should.be.equal(0);
          ws.name.should.be.equal('Default Workspace');
          ws.socialMediaFeedLabels.should.be.Array();
          ws.socialMediaFeedLabels[0].should.have.keys('id', 'name', 'color');
          ws.publisherLabels.should.be.Array();
          ws.publisherLabels[0].should.have.keys('id', 'name', 'color');
          let bh = res.body.data.businessHours;
          bh.active.should.be.False();
          bh.hours.should.be.Object();
          Object.keys(bh.hours).length.should.be.equal(7);
          bh.hours['1'].should.be.Array();
          res.body.data.emailFooter.should.be.equal(footer);
          done()
        })
    });
  });

  describe('CHANGE BUSINESS HOURS', function () {
    it('should return advanced settings', function (done) {
      var hours = {
        "1": [[9, 2], [20, 12]],
        "2": [[8, 1], [23, 24]],
        "3": [[10, 45], [12, 52]],
        "4": [[11, 59], [15, 37]],
        "5": [[7, 30], [16, 45]],
        "6": [[8, 15], [10, 56]],
        "7": [[0, 0], [0, 0]]
      };
      request(url)
        .put('/v1/users/' + _userId + '/advancedSettings/businessHours')
        .set('apikey', _token)
        .send({
          "active": true,
          "hours": hours
        })
        .expect("Content-type", /application\/json/)
        .expect(202)
        .end(function (err, res) {
          if (err) {
            throw err;
          }
          var ws = res.body.data.workspaces[0];
          ws.id.should.be.equal(0);
          ws.name.should.be.equal('Default Workspace');
          ws.socialMediaFeedLabels.should.be.Array();
          ws.socialMediaFeedLabels[0].should.have.keys('id', 'name', 'color');
          ws.publisherLabels.should.be.Array();
          ws.publisherLabels[0].should.have.keys('id', 'name', 'color');
          let bh = res.body.data.businessHours;
          bh.active.should.be.True();
          bh.hours.should.be.Object();
          Object.keys(bh.hours).length.should.be.equal(7);
          bh.hours.should.containDeep(hours);
          done()
        })
    });
  });

  describe('DISABLE BUSINESS HOURS', function () {
    it('should return advanced settings', function (done) {
      var hours = {
        "1": [[9, 2], [20, 12]],
        "2": [[8, 1], [23, 24]],
        "3": [[10, 45], [12, 52]],
        "4": [[11, 59], [15, 37]],
        "5": [[7, 30], [16, 45]],
        "6": [[8, 15], [10, 56]],
        "7": [[0, 0], [0, 0]]
      };
      request(url)
        .put('/v1/users/' + _userId + '/advancedSettings/businessHours')
        .set('apikey', _token)
        .send({
          "active": false,
          "hours": hours
        })
        .expect("Content-type", /application\/json/)
        .expect(202)
        .end(function (err, res) {
          if (err) {
            throw err;
          }
          var ws = res.body.data.workspaces[0];
          ws.id.should.be.equal(0);
          ws.name.should.be.equal('Default Workspace');
          ws.socialMediaFeedLabels.should.be.Array();
          ws.socialMediaFeedLabels[0].should.have.keys('id', 'name', 'color');
          ws.publisherLabels.should.be.Array();
          ws.publisherLabels[0].should.have.keys('id', 'name', 'color');
          let bh = res.body.data.businessHours;
          bh.active.should.be.False();
          bh.hours.should.be.Object();
          Object.keys(bh.hours).length.should.be.equal(7);
          bh.hours.should.containDeep(hours);
          done()
        })
    });
  });

  describe('GET BUSINESS HOURS', function () {
    it('should return business hours', function (done) {
      var hours = {
        "1": [[9, 2], [20, 12]],
        "2": [[8, 1], [23, 24]],
        "3": [[10, 45], [12, 52]],
        "4": [[11, 59], [15, 37]],
        "5": [[7, 30], [16, 45]],
        "6": [[8, 15], [10, 56]],
        "7": [[0, 0], [0, 0]]
      };
      request(url)
        .get('/v1/users/settings/businessHours')
        .set('cache', 'false')
        .set('apikey', _token)
        .expect("Content-type", /application\/json/)
        .expect(200)
        .end(function (err, res) {
          if (err) {
            throw err;
          }
          let bh = res.body.data.businessHours;
          bh.active.should.be.False();
          bh.hours.should.be.Object();
          Object.keys(bh.hours).length.should.be.equal(7);
          bh.hours.should.containDeep(hours);
          done()
        })
    });
  });

  describe('GET EMAIL FOOTER', function () {
    it('should return email footer for master', function (done) {
      request(url)
        .get('/v1/users/settings/emailFooter')
        .set('cache', 'false')
        .set('apikey', _token)
        .expect("Content-type", /application\/json/)
        .expect(200)
        .end(function (err, res) {
          if (err) {
            throw err;
          }
          res.body.data.emailFooter.should.be.equal('test<br>footerr<p>řžýíýá</p>');
          done()
        })
    });
  });

  describe('UPDATE DEFAULT WORKSPACE', function () {
    var ws;
    it('should return advanced settings', function (done) {
      var wsUpdate = {
        name: 'Test',
        "socialMediaFeedLabels": [
          {
            "id": 1,
            "name": "",
            "color": "#ffcf34"
          },
          {
            "id": 2,
            "name": "Clarification",
            "color": "#c44755"
          },
          {
            "id": 3,
            "name": "Common question",
            "color": "#5290d9"
          },
          {
            "id": 4,
            "name": "Complaint",
            "color": "#fc8366"
          },
          {
            "id": 5,
            "name": "Compliment",
            "color": "#62af5e"
          },
          {
            "id": 6,
            "name": "Idea",
            "color": "#79c7d5"
          },
          {
            "id": 7,
            "name": "Poll answer",
            "color": "#9065cb"
          },
          {
            "name": "test answer",
            "color": "#9065cb"
          }
        ],
        "publisherLabels": [
          {
            "id": 1,
            "name": "Webinar test",
            "color": "#9065cb"
          },
          {
            "id": 2,
            "name": "Just for fun",
            "color": "#79c7d5"
          },
          {
            "id": 3,
            "name": "",
            "color": "#62af5e"
          },
          {
            "id": 4,
            "name": "Product Information",
            "color": "#ec9f51"
          },
          {
            "id": 5,
            "name": "Infographic",
            "color": "#425777"
          },
          {
            "id": 6,
            "name": "Hard Sell",
            "color": "#fc8366"
          },
          {
            "id": 7,
            "name": "Case study",
            "color": "#5290d9"
          },
          {
            "name": "Test study",
            "color": "#5290d9"
          }
        ],
        "customerCareStatuses": [
          {
            "name": "test",
            "color": "#445197",
            "icon": "c-fontello-ico-ok"
          }
        ]
      };
      request(url)
        .put('/v1/users/' + _userId + '/advancedSettings/workspaces/0')
        .set('apikey', _token)
        .send(wsUpdate)
        .expect("Content-type", /application\/json/)
        .expect(202)
        .end(function (err, res) {
          if (err) {
            throw err;
          }
          ws = res.body.data.workspaces[0];
          ws.should.containDeep({
            id: 0,
            name: 'Test',
            "socialMediaFeedLabels": [
              {
                "id": 2,
                "name": "Clarification",
                "color": "#c44755"
              },
              {
                "id": 3,
                "name": "Common question",
                "color": "#5290d9"
              },
              {
                "id": 4,
                "name": "Complaint",
                "color": "#fc8366"
              },
              {
                "id": 5,
                "name": "Compliment",
                "color": "#62af5e"
              },
              {
                "id": 6,
                "name": "Idea",
                "color": "#79c7d5"
              },
              {
                "id": 7,
                "name": "Poll answer",
                "color": "#9065cb"
              },
              {
                "id": 8,
                "name": "test answer",
                "color": "#9065cb"
              }
            ],
            "publisherLabels": [
              {
                "id": 1,
                "name": "Webinar test",
                "color": "#9065cb"
              },
              {
                "id": 2,
                "name": "Just for fun",
                "color": "#79c7d5"
              },
              {
                "id": 4,
                "name": "Product Information",
                "color": "#ec9f51"
              },
              {
                "id": 5,
                "name": "Infographic",
                "color": "#425777"
              },
              {
                "id": 6,
                "name": "Hard Sell",
                "color": "#fc8366"
              },
              {
                "id": 7,
                "name": "Case study",
                "color": "#5290d9"
              },
              {
                "id": 8,
                "name": "Test study",
                "color": "#5290d9"
              }
            ],
            "customerCareStatuses": [
              {
                "id": 2,
                "name": "test",
                "color": "#445197",
                "icon": "c-fontello-ico-ok",
                "sort": 1,
                "default": null
              }
            ]
          });
          done()
        })
    });

    describe('DELETE CUSTOMER CARE LABEL', function () {
      it('should return advanced settings with new workspaces', function (done) {
        delete ws.id;
        ws.customerCareStatuses[0].name = '';
        request(url)
          .put('/v1/users/' + _userId + '/advancedSettings/workspaces/0')
          .set('apikey', _token)
          .send(ws)
          .expect("Content-type", /application\/json/)
          .expect(202)
          .end(function (err, res) {
            if (err) {
              throw err;
            }
            ws = res.body.data.workspaces[0];
            ws.id.should.be.Number();
            ws.name.should.be.String();
            ws.socialMediaFeedLabels.should.be.Array();
            ws.socialMediaFeedLabels[0].should.have.keys('id', 'name', 'color');
            ws.publisherLabels.should.be.Array();
            ws.publisherLabels[0].should.have.keys('id', 'name', 'color');
            ws.customerCareStatuses.should.be.Array();
            ws.customerCareStatuses.length.should.be.equal(0);
            done()
          })
      })
    });
  });

  describe('CREATE NEW WORKSPACE, UPDATE IT AND DELETE IT', function () {
    var ws, workspaceId;
    describe('CREATE NEW WORKSPACE', function () {
      it('should return advanced settings with new workspaces', function (done) {
        var name = 'Novy workspace';
        request(url)
          .post('/v1/users/' + _userId + '/advancedSettings/workspaces')
          .set('apikey', _token)
          .send({
            "name": name
          })
          .expect("Content-type", /application\/json/)
          .expect(201)
          .end(function (err, res) {
            if (err) {
              throw err;
            }
            ws = res.body.data.workspaces[0];
            workspaceId = ws.id;
            ws.id.should.be.Number();
            ws.name.should.be.equal(name);
            ws.socialMediaFeedLabels.should.be.Array();
            ws.socialMediaFeedLabels[0].should.have.keys('id', 'name', 'color');
            ws.publisherLabels.should.be.Array();
            ws.publisherLabels[0].should.have.keys('id', 'name', 'color');
            done()
          })
      })
    });

    describe('UPDATE NEW WORKSPACE', function () {
      it('should return advanced settings with new workspaces', function (done) {
        delete ws.id;
        delete ws.socialMediaFeedLabels[0].id;
        ws.name = 'Novy nazev ws';
        ws.socialMediaFeedLabels[0].name = 'new test label';
        ws.socialMediaFeedLabels[1].name = 'test';
        ws.socialMediaFeedLabels[2].color = '#123456';
        ws.socialMediaFeedLabels.push({name: 'pridany', color: '#123456'});
        ws.publisherLabels[1].name = 'test publisheru';
        ws.publisherLabels[2].color = '#654321';
        ws.publisherLabels.push({name: 'pridany publisherLabels', color: '#112233'});
        ws.customerCareStatuses.push({name: 'pridany customerCareStatuses', color: '#112233', icon: "c-fontello-ico-ok"});

        request(url)
          .put('/v1/users/' + _userId + '/advancedSettings/workspaces/' + workspaceId)
          .set('apikey', _token)
          .send(ws)
          .expect("Content-type", /application\/json/)
          .expect(202)
          .end(function (err, res) {
            if (err) {
              throw err;
            }
            ws = res.body.data.workspaces[0];
            ws.id.should.be.Number();
            ws.name.should.be.equal('Novy nazev ws');
            ws.socialMediaFeedLabels.should.be.Array();
            ws.socialMediaFeedLabels[0].should.have.keys('id', 'name', 'color');
            ws.publisherLabels.should.be.Array();
            ws.publisherLabels[0].should.have.keys('id', 'name', 'color');
            ws.customerCareStatuses.should.be.Array();
            ws.customerCareStatuses[0].should.have.keys('id', 'name', 'color', 'icon', 'sort', 'default');
            done()
          })
      })
    });

    describe('GET WORKSPACE FROM BASIC INFO', function () {
      it('should return basic info with two workspace', function (done) {
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
            res.body.data.workspaces.length.should.be.equal(2);
            done()
          })
      })
    });

    describe('DELETE NEW WORKSPACE', function () {
      it('should return settings with only one workspace', function (done) {
        request(url)
          .del('/v1/users/' + _userId + '/advancedSettings/workspaces/' + workspaceId)
          .set('apikey', _token)
          .expect("Content-type", /application\/json/)
          .expect(202)
          .end(function (err, res) {
            if (err) {
              throw err;
            }
            var ws = res.body.data.workspaces[0];
            ws.id.should.be.equal(0);
            ws.name.should.be.equal('Test');
            ws.socialMediaFeedLabels.should.be.Array();
            ws.socialMediaFeedLabels[0].should.have.keys('id', 'name', 'color');
            ws.publisherLabels.should.be.Array();
            ws.publisherLabels[0].should.have.keys('id', 'name', 'color');
            let bh = res.body.data.businessHours;
            bh.active.should.be.False();
            bh.hours.should.be.Object();
            Object.keys(bh.hours).length.should.be.equal(7);
            bh.hours['1'].should.be.Array();
            done()
          })
      })
    });

    describe('GET WORKSPACE FROM BASIC INFO', function () {
      it('should return basic info with one workspace', function (done) {
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
            res.body.data.workspaces.length.should.be.equal(1);
            done()
          })
      })
    });
  });
})
;
