'use strict';
var google = require('googleapis'),
  promisify = require('es6-promisify'),
  OAuth2 = google.auth.OAuth2,
  plus = google.plus('v1'),
  plusPages = google.plusPages('v2'),
  oauth2Client = new OAuth2(process.env.GPLUS_APP_ID, process.env.GPLUS_APP_SECRET, process.env.GPLUS_APP_DOMAIN);

var scopes = [
  'https://www.googleapis.com/auth/plus.login',
  'https://www.googleapis.com/auth/plus.me',
  'https://www.googleapis.com/auth/plus.profiles.write',
  'https://www.googleapis.com/auth/plus.pages.manage',
  'https://www.googleapis.com/auth/plus.stream.read',
  'https://www.googleapis.com/auth/plus.stream.write',
  'https://www.googleapis.com/auth/plus.circles.read',
  'https://www.googleapis.com/auth/plus.media.readwrite',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/user.emails.read'];

oauth2Client.getToken = promisify(oauth2Client.getToken.bind(oauth2Client));
oauth2Client.refreshAccessToken = promisify(oauth2Client.refreshAccessToken.bind(oauth2Client));
plus.people.get = promisify(plus.people.get);
plusPages.people.pages = promisify(plusPages.people.pages);

class Google {

  static * generateRequestUrl(csfr) {
    try {
      return oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes,
        state: csfr,
        approval_prompt: 'force'
      });
    } catch (err) {
      console.error(err)
    }
  }

  /** TODO overit, jestli neni chyba v profile.emails.filter u nekterych profilu */
  static * validateCallback(code) {
    let res = yield oauth2Client.getToken(code);
    let tokens = res[0];
    let profile = yield Google.getUserCredentials('me', tokens);
    let email = profile.emails.filter((item) => {
      return item.type == 'account'
    });
    return {
      user: {
        id: profile.id,
        provider: 'google',
        displayName: profile.displayName,
        email: email[0].value,
        token: JSON.stringify(tokens),
        photos: [profile.image.url]
      }
    }
  }

  static * getUserCredentials(userId, tokens) {
    oauth2Client.setCredentials(tokens);
    let res = yield plus.people.get({userId: userId, auth: oauth2Client});
    oauth2Client.refreshAccessToken();
    return res[0]
  }

  static * getPages(userId, tokens) {
    oauth2Client.setCredentials(tokens);
    if(tokens.refresh_token) {
      oauth2Client.refreshAccessToken();
    }
    let res = yield plusPages.people.pages({
      userId: userId,
      auth: oauth2Client,
      key: process.env.GPLUS_APP_DEVELOPER_KEY
    });
    return res[0].items.map((page) => {
      return {
        id: page.id,
        name: page.displayName,
        image: page.image.url.replace('https:https://', 'https://').replace('https://https//', 'https://')
      }
    });
  }

  static * getExternalProfile(tokens, username) {
    oauth2Client.setCredentials(tokens);
    let profile = yield plus.people.get({userId: username, auth: oauth2Client});
    if (profile[0] && profile[0].id) {
      return {
        id: profile[0].id,
        name: profile[0].displayName,
        network: 'googleplus',
        image: profile[0].image.url
      };
    }

  }
}

module.exports = Google;