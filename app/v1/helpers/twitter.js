'use strict';
var twitterAPI = require('node-twitter-api'),
  ZSError = require('zs-error'),
  promisify = require('es6-promisify');

var twitter = new twitterAPI({
  consumerKey: process.env.TW_APP_ID,
  consumerSecret: process.env.TW_APP_SECRET,
  callback: process.env.TW_APP_DOMAIN
});

var twAccessToken = promisify(twitter.getAccessToken.bind(twitter));
var twVerifyCredentials = promisify(twitter.verifyCredentials.bind(twitter));
twitter.users = promisify(twitter.users);

class Twitter {

  static * generateRequestUrl() {
    try {
      var twitter = new twitterAPI({
        consumerKey: process.env.TW_APP_ID,
        consumerSecret: process.env.TW_APP_SECRET,
        callback: process.env.TW_APP_DOMAIN
      });
      var twRequestKey = promisify(twitter.getRequestToken.bind(twitter));
      let result = yield twRequestKey();
      return {url: 'https://api.twitter.com/oauth/authenticate?oauth_token=' + result[0] + '&force_login=true', csfr: result[0], secret: result[1]}
    } catch (err) {
      console.error(err)
    }
  }

  static * validateCallback(oauth_token, oauth_verifier, secret) {
    let result = yield twAccessToken(oauth_token, secret, oauth_verifier);
    let credentials = yield Twitter.getUserCredentials(result[0], result[1]);
    if(!credentials.id) {
      throw new ZSError('ERROR_FACEBOOK_API', 404, 'Cannot reach user account');
    }
    return {
      user: {
        id: credentials.id,
        provider: 'twitter',
        displayName: credentials.name,
        email: null,
        token: JSON.stringify({oauth_token: result[0], oauth_token_secret: result[1]}),
        photos: [credentials.profile_image_url_https]
      }
    }
  }

  static * getUserCredentials(accessToken, accessTokenSecret) {
    let user = yield twVerifyCredentials(accessToken, accessTokenSecret);
    return user[0] || null;
  }

  static * getExternalProfile(accessToken, accessTokenSecret, username) {
    let query;
    if (Number(username) == username) {
      query = {user_id: username}
    } else {
      query = {screen_name: username}
    }
    let profile = yield twitter.users('show', query, accessToken, accessTokenSecret);
    if (profile[0] && profile[0].id) {
      return {
        id: profile[0].id,
        name: profile[0].name,
        network: 'twitter',
        image: profile[0].profile_image_url
      };
    }

  }
}

module.exports = Twitter;