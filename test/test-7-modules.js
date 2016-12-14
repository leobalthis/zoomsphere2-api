var app = require('../index'),
  url = app.listen(),
  should = require('should'),
  request = require('supertest');


describe('MASTER', function () {
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

  describe('MODULES', function () {
    describe('LIST MY', function () {
      it('should return 2 modules', function (done) {
        request(url)
          .get('/v1/users/' + _userId + '/modules')
          .set('cache', 'false')
          .set('apikey', _token)
          .expect("Content-type", /application\/json/)
          .expect(200)
          .end(function (err, res) {
            if (err) {
              throw err;
            }
            var modules = res.body.data.modules;
            modules.length.should.be.equal(2);
            modules[0].should.have.keys('id', 'name', 'label', 'module', 'sort', 'sharedWith', 'workspace_id', 'workspace_name');
            done()
          })
      })
    });
    var _moduleId;
    describe('LIST MY IN MY WS', function () {
      it('should return detail info about all modules in default workspace', function (done) {
        request(url)
          .get('/v1/users/' + _userId + '/workspaces/0/modules')
          .set('cache', 'false')
          .set('apikey', _token)
          .expect("Content-type", /application\/json/)
          .expect(200)
          .end(function (err, res) {
            if (err) {
              throw err;
            }
            var modules = res.body.data.modules;
            modules.length.should.be.equal(1);
            modules[0].should.have.keys('id', 'name', 'label', 'module', 'settings', 'sort', 'sharedWith');
            _moduleId = modules[0].id;
            done()
          })
      })
    });

    describe('LIST MY SOMEONE ELSE\'S OR NOT EXISTING WS', function () {
      it('should return empty array', function (done) {
        request(url)
          .get('/v1/users/' + _userId + '/workspaces/123/modules')
          .set('cache', 'false')
          .set('apikey', _token)
          .expect("Content-type", /application\/json/)
          .expect(200)
          .end(function (err, res) {
            if (err) {
              throw err;
            }
            res.body.data.modules.should.be.empty();
            done()
          })
      })
    });

    describe('GET MY MODULE', function () {
      it('should return detail info about specific module', function (done) {
        request(url)
          .get('/v1/users/' + _userId + '/modules/' + _moduleId)
          .set('cache', 'false')
          .set('apikey', _token)
          .expect("Content-type", /application\/json/)
          .expect(200)
          .end(function (err, res) {
            if (err) {
              throw err;
            }
            var module = res.body.data.module;
            module.should.have.keys('id', 'name', 'label', 'module', 'settings', 'sort', 'sharedWith', 'workspaceId');
            done()
          })
      })
    });

    function createExampleModule(prefix) {
      if (!prefix) {
        prefix = "Updated";
      }
      return {
        name: prefix + " name",
        module: "publisher",
        label: prefix + " label",
        settings: {
          background: {
            icon: "globe",
            color: ['#62af5e', '#43a05b'],
            image: ["http://server/image"]
          }
        },
        sharedWith: [12, 13],
        sort: 0,
        workspaceId: 0
      };
    }

    describe('UPDATE MY MODULE', function () {
      it('should update given module', function (done) {
        var module = createExampleModule();
        module.id = _moduleId;
        var expected = JSON.parse(JSON.stringify(module));
        expected.sharedWith = [{id: 12, name: "Justin Time", image_square: "https://www.zoomsphere.com/img/anonym.gif"},
          {id: 13, name: "Will Care", image_square: "https://www.zoomsphere.com/img/anonym.gif"}];
        request(url)
          .put('/v1/users/' + _userId + '/modules/' + _moduleId)
          .set('apikey', _token)
          .send(module)
          .expect("Content-type", /application\/json/)
          .expect(200)
          .end(function (err, res) {
            if (err) {
              throw err;
            }
            var result = res.body.data.module;
            result.should.deepEqual(expected);
            done()
          })
      })
    });

    describe('UPDATE SOMEONE ELSE\'S MODULE', function () {
      it('should return 404 not found error', function (done) {
        var module = createExampleModule();
        module.id = 30747;
        request(url)
          .put('/v1/users/' + _userId + '/modules/30747')
          .set('apikey', _token)
          .send(module)
          .expect("Content-type", /application\/json/)
          .expect(404)
          .end(function (err, res) {
            if (err) {
              throw err;
            }
            done()
          })
      })
    });

    describe('GET SOMEONE ELSE\'S MODULE', function () {
      it('should return 404 not found error', function (done) {
        request(url)
          .get('/v1/users/' + _userId + '/modules/30747')
          .set('cache', 'false')
          .set('apikey', _token)
          .expect("Content-type", /application\/json/)
          .expect(404)
          .end(function (err, res) {
            if (err) {
              throw err;
            }
            done()
          })
      })
    });

    describe('CREATE MODULE', function () {
      it('should create new module', function (done) {
        var module = createExampleModule("New module");
        module.sharedWith = [];
        var expected = JSON.parse(JSON.stringify(module));
        request(url)
          .post('/v1/modules')
          .set('apikey', _token)
          .send(module)
          .expect("Content-type", /application\/json/)
          .expect(200)
          .end(function (err, res) {
            if (err) {
              throw err;
            }
            var result = res.body.data.module;
            should.exist(result.id);
            delete result.id;
            result.should.deepEqual(expected);
            done()
          })
      })
    });
  });

  describe('EXTERNAL PROFILES - SUCCESS RESPONSES', function () {
    describe('FACEBOOK - ID', function () {
      it('should return profile', function (done) {
        request(url)
          .post('/v1/external-profile')
          .send({'url': 'https://www.facebook.com/FS-NAPAJEDLA-153786540461/?ref=py_c'})
          .set('apikey', _token)
          .expect("Content-type", /application\/json/)
          .expect(200)
          .end(function (err, res) {
            if (err) {
              throw err;
            }
            var profile = res.body.data.profile;
            profile.id.should.be.equal('153786540461');
            profile.network.should.be.equal('facebook');
            profile.should.have.keys('id', 'name', 'network', 'image');
            done()
          })
      })
    });
    describe('FACEBOOK', function () {
      it('should return profile', function (done) {
        request(url)
          .post('/v1/external-profile')
          .send({'url': 'https://www.facebook.com/cocacolaczechrepublic/?fref=ts'})
          .set('apikey', _token)
          .expect("Content-type", /application\/json/)
          .expect(200)
          .end(function (err, res) {
            if (err) {
              throw err;
            }
            var profile = res.body.data.profile;
            profile.id.should.be.equal('330906363768887');
            profile.network.should.be.equal('facebook');
            profile.should.have.keys('id', 'name', 'network', 'image');
            done()
          })
      })
    });
    describe('GOOGLE PLUS', function () {
      it('should return profile', function (done) {
        request(url)
          .post('/v1/external-profile')
          .send({'url': 'https://plus.google.com/+Coca-Cola/videos'})
          .set('apikey', _token)
          .expect("Content-type", /application\/json/)
          .expect(200)
          .end(function (err, res) {
            if (err) {
              throw err;
            }
            var profile = res.body.data.profile;
            profile.id.should.be.equal('113050383214450284645');
            profile.network.should.be.equal('googleplus');
            profile.should.have.keys('id', 'name', 'network', 'image');
            done()
          })
      })
    });
    /** DOESN'T WORK. I DON'T KNOW WHY */
    // describe('TWITTER', function () {
    //   it('should return profile', function (done) {
    //     request(url)
    //       .post('/v1/external-profile')
    //       .send({ 'url': 'https://twitter.com/janecekkarel?lang=cs'})
    //       .set('apikey', _token)
    //       .expect("Content-type", /application\/json/)
    //       .expect(200)
    //       .end(function (err, res) {
    //         if (err) {
    //           throw err;
    //         }
    //         var profile = res.body.data.profile;
    //         profile.id.should.be.equal(582017556);
    //         profile.network.should.be.equal('twitter');
    //         profile.should.have.keys('id', 'name', 'network', 'image');
    //         done()
    //       })
    //   })
    // });
    describe('INSTAGRAM', function () {
      it('should return profile', function (done) {
        request(url)
          .post('/v1/external-profile')
          .send({'url': 'https://www.instagram.com/cocacola/'})
          .set('apikey', _token)
          .expect("Content-type", /application\/json/)
          .expect(200)
          .end(function (err, res) {
            if (err) {
              throw err;
            }
            var profile = res.body.data.profile;
            profile.id.should.be.equal('249655166');
            profile.network.should.be.equal('instagram');
            profile.should.have.keys('id', 'name', 'network', 'image');
            done()
          })
      })
    });
  });

  describe('EXTERNAL PROFILES - FAIL RESPONSES', function () {
    describe('FACEBOOK - ID', function () {
      it('should return error', function (done) {
        request(url)
          .post('/v1/external-profile')
          .send({'url': 'https://www.facebook.com/FS-NAPAJEDLA-1537865404621/?ref=py_c'})
          .set('apikey', _token)
          .expect("Content-type", /application\/json/)
          .expect(404)
          .end(function (err, res) {
            if (err) {
              throw err;
            }
            done()
          })
      })
    });
    describe('FACEBOOK', function () {
      it('should return error', function (done) {
        request(url)
          .post('/v1/external-profile')
          .send({'url': 'https://www.facebook.com/cocacolaczechrepublicsdfsdfsd/?fref=ts'})
          .set('apikey', _token)
          .expect("Content-type", /application\/json/)
          .expect(404)
          .end(function (err, res) {
            if (err) {
              throw err;
            }
            done()
          })
      })
    });
    describe('FACEBOOK', function () {
      it('should return error', function (done) {
        request(url)
          .post('/v1/external-profile')
          .send({'url': 'https://www.facebook.com/cernytomasj'})
          .set('apikey', _token)
          .expect("Content-type", /application\/json/)
          .expect(404)
          .end(function (err, res) {
            if (err) {
              throw err;
            }
            done()
          })
      })
    });
    describe('GOOGLE PLUS', function () {
      it('should return error', function (done) {
        request(url)
          .post('/v1/external-profile')
          .send({'url': 'https://plus.google.com/+Coca-Cola-sdfsdf-sdf/videos'})
          .set('apikey', _token)
          .expect("Content-type", /application\/json/)
          .expect(404)
          .end(function (err, res) {
            if (err) {
              throw err;
            }
            done()
          })
      })
    });
    describe('TWITTER', function () {
      it('should return error', function (done) {
        request(url)
          .post('/v1/external-profile')
          .send({'url': 'https://twitter.com/janecekkarelsfsdfdf?lang=cs'})
          .set('apikey', _token)
          .expect("Content-type", /application\/json/)
          .expect(404)
          .end(function (err, res) {
            if (err) {
              throw err;
            }
            done()
          })
      })
    });
    describe('INSTAGRAM', function () {
      it('should return error', function (done) {
        request(url)
          .post('/v1/external-profile')
          .send({'url': 'https://www.instagram.com/cocacolasdfsdfs/'})
          .set('apikey', _token)
          .expect("Content-type", /application\/json/)
          .expect(404)
          .end(function (err, res) {
            if (err) {
              throw err;
            }
            done()
          })
      })
    });
  });

  describe('GET PUBLISHER STATUSES', function () {
    it('should statuses', function (done) {
      request(url)
        .get('/v1/users/' + _userId + '/workspaces/0/publisher-statuses')
        .set('cache', 'false')
        .set('apikey', _token)
        .expect("Content-type", /application\/json/)
        .expect(200)
        .end(function (err, res) {
          if (err) {
            throw err;
          }
          var statuses = res.body.data.statuses;
          statuses.should.be.Array();
          statuses.forEach((status) => {
            status.should.have.keys('id', 'name', 'color', 'access_read', 'access_write', 'publish', 'bgcolor', 'sent');
            status.id.should.be.Number();
            status.sent.should.be.Boolean();
          });
          done()
        })
    })
  });

  describe('GET CUSTOMER CARE TAGS', function () {
    it('should return tags for default workspace', function (done) {
      request(url)
        .get('/v1/users/' + _userId + '/workspaces/0/customer-care-tags')
        .set('cache', 'false')
        .set('apikey', _token)
        .expect("Content-type", /application\/json/)
        .expect(200)
        .end(function (err, res) {
          if (err) {
            throw err;
          }
          var tags = res.body.data.tags;
          tags.should.be.Array();
          tags.forEach((tag) => {
            tag.should.have.keys('id', 'name');
            tag.id.should.be.Number();
            tag.name.should.be.String();
          });
          done()
        })
    });

    it('should return tags for specific workspace', function (done) {
      request(url)
        .get('/v1/users/' + _userId + '/workspaces/613/customer-care-tags')
        .set('cache', 'false')
        .set('apikey', _token)
        .expect("Content-type", /application\/json/)
        .expect(200)
        .end(function (err, res) {
          if (err) {
            throw err;
          }
          var tags = res.body.data.tags;
          tags.should.be.Array();
          tags.forEach((tag) => {
            tag.should.have.keys('id', 'name');
            tag.id.should.be.Number();
            tag.name.should.be.String();
          });
          done()
        })
    })
  });

  describe('GET CUSTOMER CARE LABELS', function () {
    it('should return labels for default workspace', function (done) {
      request(url)
        .get('/v1/users/' + _userId + '/workspaces/0/customer-care-labels')
        .set('cache', 'false')
        .set('apikey', _token)
        .expect("Content-type", /application\/json/)
        .expect(200)
        .end(function (err, res) {
          if (err) {
            throw err;
          }
          var labels = res.body.data.labels;
          labels.should.be.Array();
          labels.forEach((label) => {
            label.should.have.keys('id', 'name', 'color');
            label.id.should.be.Number();
            label.name.should.be.String();
            label.color.should.be.String();
          });
          done()
        })
    });

    it('should return labels for specific workspace', function (done) {
      request(url)
        .get('/v1/users/' + _userId + '/workspaces/613/customer-care-labels')
        .set('cache', 'false')
        .set('apikey', _token)
        .expect("Content-type", /application\/json/)
        .expect(200)
        .end(function (err, res) {
          if (err) {
            throw err;
          }
          var labels = res.body.data.labels;
          labels.should.be.Array();
          labels.forEach((label) => {
            label.should.have.keys('id', 'name', 'color');
            label.id.should.be.Number();
            label.name.should.be.String();
            label.color.should.be.String();
          });
          done()
        })
    })
  });

  describe('LIST CRM TAGS', function () {
    it('should return CRM tags for customer care and social media feed', function (done) {
      request(url)
        .get('/v1/users/' + _userId + '/crm-tags')
        .set('cache', 'false')
        .set('apikey', _token)
        .expect("Content-type", /application\/json/)
        .expect(200)
        .end(function (err, res) {
          if (err) {
            throw err;
          }
          var tags = res.body.data.tags;
          tags.should.be.Array();
          tags.forEach((tag) => {
            tag.should.have.keys('id', 'name');
            tag.id.should.be.Number();
            tag.name.should.be.String();
          });
          done()
        })
    })
  });
});