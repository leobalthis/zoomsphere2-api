'use strict';
var graph = require('fbgraph'),
  moment = require('moment'),
  ZSError = require('zs-error'),
  promisify = require('es6-promisify');

graph.get = promisify(graph.get);
graph.batch = promisify(graph.batch);
graph.extendAccessToken = promisify(graph.extendAccessToken);
graph.setVersion("2.8");

class Api {
  static * get(accessToken, url, params) {
    graph.setAccessToken(accessToken);
    try {
      let result = [], tmpRes;
      do {
        tmpRes = yield graph.get(url, params);
        if (tmpRes.__debug__ && tmpRes.__debug__.messages) {
          let messages = tmpRes.__debug__.messages.filter((item) => {
            return item.type === 'warning';
          });
          if (messages) {
            throw new ZSError('ERROR_FACEBOOK_API', 404, messages);
          }
        }
        result.push(tmpRes);
        if(tmpRes.paging && tmpRes.paging.next) {
          url = tmpRes.paging.next;
        }
      } while ((tmpRes.paging && tmpRes.paging.next));

      if(result.length === 1) {
        return result[0];
      } else {
        let res = {data: []};
        result.forEach((item) => {
          res.data = res.data.concat(item.data);
        });
        return res;
      }
    } catch (err) {
      if (err.code === 190) {
        throw new ZSError('ERROR_INVALID_SOCIAL_TOKEN', 403, err);
      } else {
        throw new ZSError('ERROR_FACEBOOK_API', 404, err);
      }
    }

  }

  static * batch(accessToken, reqs) {
    graph.setAccessToken(accessToken);
    try {
      var res = yield graph.batch(reqs);
    } catch (err) {
      if (err.code === 190) {
        throw new ZSError('ERROR_INVALID_SOCIAL_TOKEN', 403, err);
      } else {
        throw new ZSError('ERROR_FACEBOOK_API', 404, err);
      }
    }
    return res;
  }
}

var requiredPermissions = ['email', 'publish_actions', 'manage_pages', 'read_insights', 'read_page_mailboxes'];

class Facebook {

  static * generateRequestUrl(csfr) {
    return graph.getOauthUrl({
      "client_id": process.env.FB_APP_ID,
      "redirect_uri": process.env.FB_APP_DOMAIN,
      "scope": requiredPermissions,
      "state": csfr
    });
  }

  static * validateCode(code) {
    graph.authorize({
      "client_id": process.env.FB_APP_ID
      , "redirect_uri": process.env.FB_APP_DOMAIN
      , "client_secret": process.env.FB_APP_SECRET
      , "code": code
    }, function (err, facebookRes) {
      res.redirect('/loggedIn');
    });
  }

  static * validateCallback(token) {
    let accessToken = yield Facebook.extendAccessToken(token);
    yield this.checkPermission(accessToken.access_token);
    let profile = yield Facebook.getUserCredentials(accessToken);
    return {
      user: {
        id: profile.id,
        provider: 'facebook',
        displayName: profile.name,
        email: profile.email,
        token: JSON.stringify(accessToken),
        photos: [profile.picture.location],
        expiresAt: moment().add(60, 'days'),
        invalid: null,
        info: JSON.stringify({age: profile.age_range})
      }
    }
  }

  static * getUserCredentials(accessToken) {
    let profile = yield Api.get(accessToken.access_token, 'me', {fields: 'id,name,email,age_range'});
    profile.picture = yield Api.get(accessToken.access_token, 'me/picture?type=normal');
    return profile;
  }

  static * extendAccessToken(accessToken) {
    const params = {
      "access_token": accessToken,
      "client_id": process.env.FB_APP_ID,
      "client_secret": process.env.FB_APP_SECRET
    };
    return yield graph.extendAccessToken(params);
  }

  static * getPages(accessToken) {
    let pages = yield Api.get(accessToken.access_token, 'me/accounts', {
      fields: 'id,name,picture,access_token,username,perms',
      debug: 'all',
      limit: 250
    });
    let realPages = pages.data.filter((page) => {
      return page.perms.indexOf('ADMINISTER') !== -1 || page.perms.indexOf('CREATE_CONTENT') !== -1
    });
    return realPages.map((page) => {
      return {
        id: page.id,
        name: page.name,
        image: page.picture.data.url,
        access_token: page.access_token,
        username: page.username
      }
    })
  }

  static * checkPermission(accessToken) {
    let permissions = yield Api.get(accessToken, 'me/permissions');
    requiredPermissions.map((perm)=> {
      let res = permissions.data.filter((item)=> {
        return item.permission === perm && item.status === 'granted';
      });
      if (res.length == 0) {
        throw new ZSError('ERROR_PERMISSIONS_REQUIRED', 403, 'Facebook API requires more permissions: ' + perm);
      }
    });
  }

  static * inspectToken(inspectedAccessToken) {
    try {
      let res = yield Api.get(process.env.FB_APP_TOKEN, 'debug_token?input_token=' + inspectedAccessToken);
      if (res.data.error && !res.data.error.is_valid) {
        return false;
      } else {
        return res.data.scopes;
      }
    } catch (err) {
      return false;
    }
  }

  static * getAppToken() {
    console.log('Get facebook app token');
    let appToken = yield graph.get('/oauth/access_token?client_id=' + process.env.FB_APP_ID + '&client_secret=' + process.env.FB_APP_SECRET + '&grant_type=client_credentials');
    console.log(appToken)
  }

  static * getExternalProfile(accessToken, username) {
    let profile = yield Api.get(accessToken, username);
    if (profile && (profile.gender || profile.first_name || profile.last_name)) {
      return null;
    }
    return {
      id: profile.id,
      name: profile.name,
      network: 'facebook',
      image: 'https://graph.facebook.com/' + profile.id + '/picture?type=normal'
    };
  }
}

module.exports = Facebook;