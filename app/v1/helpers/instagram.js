'use strict';
var promisify = require('es6-promisify');

class Instagram {

  static * generateRequestUrl(csfr) {
    try {
      var ig = require('instagram-node').instagram();
      ig.use({
        client_id: process.env.INSTAGRAM_APP_ID,
        client_secret: process.env.INSTAGRAM_APP_SECRET
      });
      return ig.get_authorization_url(process.env.INSTAGRAM_APP_DOMAIN, {
        /** old scopes keep it, may be used */
        // scope: ['basic', 'likes', 'comments', 'relationships'],
        scope: ['basic', 'public_content'],
        state: csfr
      });
    } catch (err) {
      console.error(err)
    }
  }

  static * validateCallback(code) {
    let ig = require('instagram-node').instagram();
    ig.use({
      client_id: process.env.INSTAGRAM_APP_ID,
      client_secret: process.env.INSTAGRAM_APP_SECRET
    });
    var authorize_user = promisify(ig.authorize_user.bind(ig));
    let result = yield authorize_user(code, process.env.INSTAGRAM_APP_DOMAIN);
    let credentials = yield Instagram.getUserCredentials('self', result.access_token);
    return {
      user: {
        id: credentials.id,
        provider: 'instagram',
        displayName: credentials.full_name,
        email: null,
        token: JSON.stringify(result),
        photos: [credentials.profile_picture]
      }
    }
  }

  static * getUserCredentials(userId, accessToken) {
    let ig = require('instagram-node').instagram();
    ig.use({
      access_token: accessToken,
      client_id: process.env.INSTAGRAM_APP_ID,
      client_secret: process.env.INSTAGRAM_APP_SECRET
    });
    var igUser = promisify(ig.user.bind(ig));
    let res = yield igUser(userId);
    return yield res[0]
  }

  static * getExternalProfile(accessToken, username) {
    let ig = require('instagram-node').instagram();
    ig.use({
      access_token: accessToken,
      client_id: process.env.INSTAGRAM_APP_ID,
      client_secret: process.env.INSTAGRAM_APP_SECRET
    });
    var igUserSearch = promisify(ig.user_search.bind(ig));
    let profiles = yield igUserSearch(username);
    let profile = profiles[0].filter((prof) => {
      return prof.username === username
    });
    if (profile[0]) {
      return {
        id: profile[0].id,
        name: profile[0].full_name,
        network: 'instagram',
        image: profile[0].profile_picture
      };
    }
  }
}

module.exports = Instagram;