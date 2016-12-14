'use strict';
var preview = require('page-previewer'),
  promisify = require('es6-promisify'),
  url = require('url'),
  koaMap = require('koa-map'),
  va = require(__dirname + '/../helpers/validator'),
  request = require('request'),
  PassThrough = require('stream').PassThrough,
  File = require(__dirname + '/../helpers/file');

preview = promisify(preview);
const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/54.0.2840.99 Safari/537.36',
  'cache-control': 'no-cache'
};

class Files {

  static * proxy() {
    var result = va.run(this, va.QUERY, {
      url: va.string().optional()
    });
    this.body = request.get(result.url, {headers: HEADERS})
      .on('response', (response) => {
        this.type = response.headers['content-type'];
      }).on('error', this.onerror).pipe(PassThrough());
  }

  static * linkPreview(next) {
    var result = va.run(this, va.QUERY, {
      url: va.string().optional()
    });
    result.url = decodeURIComponent(result.url);
    var re = new RegExp(/^(http)[s]?:\/\//);
    if (!result.url.match(re)) {
      result.url = 'http://' + result.url;
    }
    let hostname = url.parse(result.url).hostname;
    let resp = yield preview({uri: result.url, headers: HEADERS});
    if (resp.loadFailed) {
      throw new this.app.ZSError('ERROR_UNKNOWN')
    } else {
      if (resp.images) {
        if (resp.images.length === 1) {
          resp.images = process.env.APP_DOMAIN + '/v1/proxy?url=' + resp.images[0];
        } else {
          /** TODO REWRITE vybirani obrazku */
          let maxSize = 0, domainMaxSize = 0, domain = false;
          let imgs = yield koaMap.mapLimit(resp.images, 5, function *(imgUrl) {
            return yield new Promise((resolve, reject) => {
              request.head(imgUrl, (error, response, body) => {
                if (response.headers['content-length']) {
                  maxSize = response.headers['content-length'] > maxSize ? response.headers['content-length'] : maxSize;
                  if (imgUrl.indexOf(hostname) !== -1) {
                    domain = true;
                    domainMaxSize = response.headers['content-length'] > domainMaxSize ? response.headers['content-length'] : domainMaxSize;
                  }
                }
                resolve({
                  url: process.env.APP_DOMAIN + '/v1/proxy?url=' + imgUrl,
                  length: response.headers['content-length'] || 0,
                  domain: (imgUrl.indexOf(hostname) !== -1)
                });
              })
            });
          });
          imgs = imgs.filter((img) => {
            if (domain) {
              return (img.length === domainMaxSize) && img.domain
            } else {
              return img.length === maxSize;
            }
          });
          if (imgs.length && imgs[0].url) {
            resp.images = imgs[0].url;
          } else {
            delete resp.images
          }
        }
      }
      this.body = {preview: resp};
    }
    return yield next;
  }

  static * profilePicture(next) {
    this.request.body.resize = {sizes: [{width: 100, height: 100}], original: true};
    return yield next;
  }

  static * chatFiles(next) {
    this.request.body.resize = {sizes: [{width: 300, height: 300}], original: true};
    return yield next;
  }

  static * moduleBackground(next) {
    this.request.body.resize = {sizes: [{width: 340, height: 255}, {width: 1200, height: 600}], original: false};
    return yield next;
  }

  static * upload(next) {
    try {
      var result = va.run(this, va.BODY, {
        name: va.string().optional(),
        uploadId: va.string().optional().default(null),
        contentType: va.string().optional().default(null),
        sizeTotal: va.number().required(),
        sizeChunk: va.number().required(),
        sizeTransferred: va.number().required(),
        data: va.any().required(),
        resize: {sizes: va.array().items({width: va.number(), height: va.number()}), original: va.boolean().optional().default(false)}
      });
      if (!result.uploadId && result.sizeTotal !== result.sizeChunk && result.sizeChunk < 5000 * 1024) {
        throw new this.app.ZSError('ERROR_WRONG_FILE_SIZE');
      }
      if (result.data && result.data.type === 'Buffer') {
        if (result.data.data.length != result.sizeChunk) {
          throw new this.app.ZSError('ERROR_WRONG_FILE_SIZE');
        }
      } else {
        throw new this.app.ZSError('ERROR_NOT_SUPPORTED_TRANSFER_TYPE');
        /** TODO prijimat jine datove typy pro externi developery */
      }
      let contentType = result.contentType.toLowerCase().split('/');
      let extension = contentType[1] ? '.' + contentType[1] : '';
      if (result.name) {
        extension = '.' + result.name.toLowerCase().split('.').pop()
      }
      if (result.resize && result.resize.sizes && result.resize.sizes.length > 0 && contentType[0] === 'image') {
        this.body = yield File.resizeAndUpload(result.uploadId, extension, result.sizeChunk, result.sizeTransferred, result.sizeTotal, result.resize, result.data);
      } else {
        this.body = yield File.uploadToS3(result.uploadId, result.contentType, extension, result.sizeChunk, result.sizeTransferred, result.sizeTotal, result.data);
      }
      this.status = this.body.uploadId ? 202 : 201;
    } catch (err) {
      /** TODO odstranit z produkcni verze */
      File.listTransfers();
      console.warn(err);
      this.error = err
    }
    return yield next
  }
}
module.exports = Files;