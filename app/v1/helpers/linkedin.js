'use strict';
var linkedin = require('node-linkedin')(process.env.LINKEDIN_APP_ID, process.env.LINKEDIN_APP_SECRET, process.env.LINKEDIN_APP_DOMAIN),
  moment = require('moment'),
  ZSError = require('zs-error'),
  promisify = require('es6-promisify');

linkedin.auth.getAccessToken = promisify(linkedin.auth.getAccessToken);

var requiredPermissions = ['r_basicprofile', 'r_emailaddress', 'rw_company_admin', 'w_share'];

class Linkedin {

  static * generateRequestUrl(csfr) {
    return linkedin.auth.authorize(requiredPermissions, csfr);
  }

  static * validateCallback(code, state) {
    let res = yield linkedin.auth.getAccessToken(code, state);
    let profile = yield Linkedin.getUserCredentials(res.access_token);
    return yield {
      user: {
        id: profile.id,
        provider: 'linkedin',
        displayName: profile.formattedName,
        email: profile.emailAddress,
        token: JSON.stringify(res),
        photos: [profile.pictureUrl],
        expiresAt: moment().add(res.expires_in, 's')
      }
    }
  }

  static * getUserCredentials(accessToken) {
    var li = linkedin.init(accessToken, {
      timeout: 10000
    });

    li.people.me = promisify(li.people.me);
    let profile = yield li.people.me();
    if (profile.errorCode == 0) {
      throw new ZSError('ERROR_EXPIRED_ACCOUNT', 404, profile.message)
    }
    return profile;
  }

  static * getPages(accessToken) {
    var li = linkedin.init(accessToken.access_token, {
      timeout: 10000
    });
    li.companies.asAdmin = promisify(li.companies.asAdmin);
    let pages = yield li.companies.asAdmin(['id', 'name', 'square-logo-url', 'website-url']);
    if (pages.errorCode == 0) {
      throw new ZSError('ERROR_EXPIRED_ACCOUNT', 404, pages.message)
    }
    if (pages.values) {
      return pages.values.map((page) => {
        return {
          id: page.id,
          name: page.name,
          image: page.squareLogoUrl
        }
      })
    } else {
      return [];
    }
  }
}

module.exports = Linkedin;