'use strict';
class Utils {

  static getWhiteListedIPs() {
    if (process.env.IP_WHITE_LIST) {
      return process.env.IP_WHITE_LIST.split(',');
    } else {
      return '::1';
    }
  }

  static transformIconNameFromDatabase(iconClassName) {
    if (iconClassName && iconClassName.indexOf('krown-icon') !== -1) {

      switch (iconClassName) {

        case 'krown-icon-user-male':
        case 'krown-icon-skills':
        case 'krown-icon-user-1':
        case 'krown-icon-user':
        case 'krown-icon-about_us':
        case 'krown-icon-users-1':
          return 'about';
          break;

        case 'krown-icon-calendar-1':
        case 'krown-icon-calendar-2':
        case 'krown-icon-calendar':
          return 'calendar';
          break;

        case 'krown-icon-vector-pencil':
        case 'krown-icon-pencil':
        case 'krown-icon-pencil-1':
        case 'krown-icon-pencil-2':
        case 'krown-icon-pencil-3':
        case 'krown-icon-services':
        case 'krown-icon-settings':
        case 'krown-icon-wrench':
        case 'krown-icon-params':
        case 'krown-icon-tools':
        case 'krown-icon-cog':
          return 'services';
          break;

        case 'krown-icon-clock':
        case 'krown-icon-date':
          return 'clock';
          break;

        case 'krown-icon-chart':
        case 'krown-icon-desktop':
          return 'analytics';
          break;

        case 'krown-icon-chart-area':
          return 'analytics-3';
          break;

        case 'krown-icon-chart-bar':
          return 'analytics-2';
          break;

        case 'krown-icon-chart-pie-1':
          return 'analytics-4';
          break;

        case 'krown-icon-search-1':
        case 'krown-icon-eye':
        case 'krown-icon-eye-1':
        case 'krown-icon-eye-2':
        case 'krown-icon-search':
          return 'monitoring';
          break;

        case 'krown-icon-bubble':
        case 'krown-icon-blog':
        case 'krown-icon-comment-1':
        case 'krown-icon-comment-2':
        case 'krown-icon-chat':
          return 'chat';
          break;

        case 'krown-icon-comment-alt':
          return 'customer-care';
          break;

        case 'krown-icon-twitter':
          return 'twitter';
          break;

        case 'krown-icon-facebook-squared':
        case 'krown-icon-facebook':
          return 'facebook';
          break;

        case 'krown-icon-rss':
          return 'rss';
          break;

        case 'krown-icon-linkedin':
          return 'linkedin';
          break;

        case 'krown-icon-gplus':
          return 'google-play';
          break;

        case 'krown-icon-video':
        case 'krown-icon-youtube':
          return 'youtube';
          break;

        case 'krown-icon-network':
        case 'krown-icon-globe-2':
        case 'krown-icon-globe-1':
        case 'krown-icon-globe':
        case 'krown-icon-dribbble':
          return 'globe';
          break;

        case 'krown-icon-email':
        case 'krown-icon-mail-1':
        case 'krown-icon-mail':
          return 'mail-2';
          break;

        case 'krown-icon-thumbs-up-1':
        case 'krown-icon-arrow_right':
        case 'krown-icon-ok':
        case 'krown-icon-thumbs-up':
        case 'krown-icon-thumbs-up-alt':
          return 'like';
          break;
        case 'krown-icon-camera-alt':
        case 'krown-icon-camera':
        case 'krown-icon-camera-1':
        case 'krown-icon-picture-1':
        case 'krown-icon-gallery-1':
          return 'instagram';
          break;
        case 'krown-icon-home':
        case 'krown-icon-firefox':
          return 'fox';
          break;
        case 'krown-icon-wine':
        case 'krown-icon-coffee':
        case 'krown-icon-beer':
        case 'krown-icon-cup':
        case 'krown-icon-beer-1':
          return 'coffee';
          break;
        case 'krown-icon-lightbulb':
        case 'krown-icon-star':
        case 'krown-icon-lamp':
        case 'krown-icon-flashlight':
        case 'krown-icon-lightbulb-1':
        case 'krown-icon-crown':
          return 'sun';
          break;
        case 'krown-icon-food':
          return 'cupcake';
          break;
        case 'krown-icon-award':
          return 'smile';
          break;

        case 'krown-icon-heart-1':
          return 'heart';
          break;
        case 'krown-icon-leaf-1':
          return 'mashroom';
          break;

        default:
          return 'default';
          break;


      }


    } else {
      return iconClassName;
    }
  }

  static transformColors(color) {
    switch (color) {
      case '#45b363':
        return '#62af5e';
        break;
      case '#339a74':
        return '#00a99d';
        break;
      case '#1d7f5b':
        return '#62af5e';
        break;
      case '#3fb0c3':
        return '#79c7d5';
        break;
      case '#2293a6':
        return '#25aae2';
        break;
      case '#137d8f':
        return '#5290d9';
        break;
      case '#9374ae':
        return '#996666';
        break;
      case '#775b8f':
        return '#9065cb';
        break;
      case '#dca13a':
        return '#ec9f51';
        break;
      case '#c46d32':
        return '#fc8366';
        break;
      case '#c44732':
        return '#e74848';
        break;
      case '#c44d55':
        return '#e74848';
        break;
      case '#425660':
        return '#9da9b8';
        break;
      case '#292f32':
        return '#515966';
        break;
      default:
        return color;
    }
  }

  static replaceS3FilesDomain(filename) {
    return filename.replace('https://s3.eu-central-1.amazonaws.com/', 'https://files.zoomsphere.com/');
  }
}

module.exports = Utils;
