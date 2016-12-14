'use strict';
const AWS_BUCKET = process.env.AWS_BUCKET || 'files2.zoomsphere.com';
const AWS_FOLDER = process.env.AWS_FOLDER || 'tests';
var fs = require('fs'),
  promisify = require("es6-promisify"),
  AWS = require('aws-sdk'),
  sha1 = require('sha1'),
  request = require('request'),
  fsConstants = require('constants'),
  koaMap = require('koa-map'),
  Image = require(__dirname + '/image'),
  utils = require('./utils');

AWS.config.region = process.env.AWS_REGION;
var s3bucket = new AWS.S3({params: {Bucket: AWS_BUCKET}}),
  s3Stream = require('s3-upload-stream')(s3bucket);
var createMultipartUpload = promisify(s3bucket.createMultipartUpload.bind(s3bucket));
var uploadPart = promisify(s3bucket.uploadPart.bind(s3bucket));
var completeMultipartUpload = promisify(s3bucket.completeMultipartUpload.bind(s3bucket));

var files = {};

class File {

  static * saveChunk(filename, sizeChunk, data) {
    return new Promise((resolve, reject) => {
      fs.open(filename, 'w', (err, fd) => {
        if (err) {
          reject('error opening file: ' + err);
        }
        fs.write(fd, new Buffer(data.data), 0, sizeChunk, null, (err) => {
          if (err) {
            reject(err);
          }
          fs.close(fd, (err) => {
            if (err) {
              reject(err);
            }
            resolve(filename)
          });
        })
      });
    });
  }

  static * uploadStream(filename, contentType) {
    return new Promise((resolve, reject) => {
      let stream;
      if (filename.indexOf('https://') === 0 || filename.indexOf('http://') === 0) {
        stream = request.get(filename);
      } else {
        stream = fs.createReadStream(filename);
      }
      let upload = s3Stream.upload({
        ACL: 'public-read',
        Key: AWS_FOLDER + '/' + sha1(filename + new Date().getTime()) + '.' + contentType.toLowerCase(),
        ContentType: contentType
      });
      upload.maxPartSize(20971520); // 20 MB
      upload.concurrentParts(5);

      upload.on('error', (error) => {
        console.log(error);
        reject(error);
      });

      upload.on('part', (details) => {

      });

      upload.on('uploaded', (details) => {
        resolve({url: utils.replaceS3FilesDomain(details.Location)});
      });
      stream.pipe(upload);
    });
  }

  static * getContentTypeFromUrl(url) {
    let format = new Promise((resolve, reject) => {
      request.head(url, (error, response) => {
        if (error) {
          reject(error);
        } else {
          resolve(response.headers['content-type'].split('/')[1].toLowerCase());
        }
      });
    });
    return yield format;
  }

  static * startTransfer(contentType, extension) {
    let upload = {
      ACL: 'public-read',
      Key: AWS_FOLDER + '/' + sha1(Math.round(Math.random() * 1000000) + ' ' + new Date().getTime()) + extension
    };
    if (contentType) {
      upload.ContentType = contentType
    }
    let response = yield createMultipartUpload(upload);
    files[response.Key] = {PartNumber: 1, UploadId: response.UploadId, Key: response.Key, ETags: []};
    return files[response.Key]
  }

  static listTransfers() {
    s3bucket.listMultipartUploads((err, data) => {
      if (err) console.warn(err, err.stack); // an error occurred
      else {
        data.Uploads.forEach((item)=> {
          var params = {
            Key: item.Key,
            UploadId: item.UploadId
          };
          s3bucket.abortMultipartUpload(params, (err, data) => {
            if (err) console.warn(err, err.stack); // an error occurred
            else     console.info(data);           // successful response
          });
        })

      }
      console.info(data);           // successful response
    });
  }

  static * resizeAndUpload(uploadId, extension, sizeChunk, sizeTransferred, sizeTotal, resize, data) {
    var filename;
    if (!uploadId) {
      let key = Math.round(Math.random() * 1000000);
      filename = sha1(key + ' ' + new Date().getTime()) + extension;
      files[key] = {PartNumber: 1, UploadId: filename, Key: key, ETags: []};
      uploadId = key;
    } else {
      files[uploadId].PartNumber++;
    }
    yield File.saveChunk(files[uploadId].UploadId, sizeChunk, data);
    if (sizeTotal == sizeChunk + sizeTransferred) {
      let format = yield Image.format(filename);
      if (resize.original) {
        resize.sizes.push({original: true});
      }
      let urls = yield koaMap.mapLimit(resize.sizes, 3, function *(size) {
        let saveName;
        if (size.original) {
          saveName = filename;
        } else {
          let res = yield Image.resize(filename, size);
          saveName = res.filename;
        }
        let resp = yield File.uploadStream(saveName, format);
        fs.unlinkSync(saveName);
        resp.size = size;
        return resp;
      });
      fs.access(filename, fsConstants.W_OK, (err) => {
        if (!err) {
          fs.unlinkSync(filename);
        }
      });
      delete files[uploadId];
      return urls;
    } else {
      return {uploadId: key};
    }
  }

  static * uploadToS3(key, contentType, extension, sizeChunk, sizeTransferred, sizeTotal, data) {
    let file;
    if (!key) {
      file = yield File.startTransfer(contentType, extension)
    } else {
      files[key].PartNumber++;
      file = files[key]
    }

    let res = yield uploadPart({Key: file.Key, UploadId: file.UploadId, Body: new Buffer(data.data), PartNumber: file.PartNumber});

    files[file.Key].ETags.push({
      ETag: res.ETag,
      PartNumber: file.PartNumber
    });

    if (sizeTotal == sizeChunk + sizeTransferred) {
      let finished = yield completeMultipartUpload({
        UploadId: file.UploadId, Key: file.Key, MultipartUpload: {
          Parts: files[file.Key].ETags
        }
      });
      delete files[key];
      return {url: utils.replaceS3FilesDomain(finished.Location)};
    } else {
      return {uploadId: file.Key};
    }
  }
}

module.exports = File;