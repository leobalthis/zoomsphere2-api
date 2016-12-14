'use strict';
var google = require('googleapis'),
  promisify = require('es6-promisify'),
  OAuth2 = google.auth.OAuth2,
  plus = google.plus('v1'),
  youtube = google.youtube('v3'),
  oauth2Client = new OAuth2(process.env.GPLUS_APP_ID, process.env.GPLUS_APP_SECRET, process.env.YOUTUBE_APP_DOMAIN);

var scopes = ['https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/youtubepartner-channel-audit',
  'https://www.googleapis.com/auth/youtube.readonly',
  'https://www.googleapis.com/auth/yt-analytics.readonly'];

oauth2Client.getToken = promisify(oauth2Client.getToken.bind(oauth2Client));
oauth2Client.refreshAccessToken = promisify(oauth2Client.refreshAccessToken.bind(oauth2Client));
youtube.channels.list = promisify(youtube.channels.list);
plus.people.get = promisify(plus.people.get);

class Youtube {

  static * generateRequestUrl(csfr) {
    try {
      return oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes,
        state: csfr
      });
    } catch (err) {
      console.error(err)
    }
  }

  /** TODO overit, jestli neni chyba v profile.emails.filter u nekterych profilu */
  static * validateCallback(code) {
    let res = yield oauth2Client.getToken(code);
    let tokens = res[0];
    let profile = yield Youtube.getUserCredentials('me', tokens);
    let channels = yield Youtube.getPages(tokens);

    return {
      channel_id: channels[0].id,
      name: profile.displayName,
      access_token: JSON.stringify(tokens),
      image: profile.image.url
    }
  }

  static * getUserCredentials(userId, tokens) {
    oauth2Client.setCredentials(tokens);
    let res = yield plus.people.get({userId: userId, auth: oauth2Client});
    return res[0]
  }

  static * getPages(tokens) {
    oauth2Client.setCredentials(tokens);
    let res = yield youtube.channels.list({part: 'id', mine: true, auth: oauth2Client});
    return res[0].items;
  }
}

module.exports = Youtube;