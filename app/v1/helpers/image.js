'use strict';
var gm = require('gm'),
  fs = require('fs');
gm = gm.subClass({imageMagick: true});

class Image {

  static * resize(filename, expectedSize) {
    let scale, resize, crop, originalSize = yield Image.size(filename);
    if (originalSize.width > originalSize.height) {
      scale = originalSize.height / expectedSize.height;
      resize = {width: null, height: expectedSize.height};
      crop = {width: (Math.round(originalSize.width / scale) - expectedSize.width) / 2, height: 0};
    } else {
      scale = originalSize.width / expectedSize.width;
      resize = {width: expectedSize.width, height: null};
      crop = {width: 0, height: (Math.round(originalSize.height / scale) - expectedSize.height) / 2};
    }
    return new Promise((resolve, reject) => {
      gm(filename)
        .resize(resize.width, resize.height)
        .crop(expectedSize.width, expectedSize.height, crop.width, crop.height)
        .write(expectedSize.width + 'x' + expectedSize.height + '_' + filename, (err) => {
          if (err) {
            reject(err);
          }
          resolve({filename: expectedSize.width + 'x' + expectedSize.height + '_' + filename});
        })
    });
  };

  static * format(filename) {
    return new Promise((resolve, reject) => {
      gm(filename).format((err, val) => {
        if (err) {
          reject(err);
        }
        resolve(val);
      });
    });
  }

  static * size(filename) {
    return new Promise((resolve, reject) => {
      gm(filename).size((err, val) => {
        if (err) {
          reject(err);
        }
        resolve(val);
      });
    });
  };
}

module.exports = Image;