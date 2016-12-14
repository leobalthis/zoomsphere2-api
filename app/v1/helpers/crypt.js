'use strict';
var MCrypt = require('mcrypt').MCrypt;

class Crypt {

  static encrypt(text) {
    let aesCbc = new MCrypt('rijndael-256', 'cbc');
    let iv = aesCbc.generateIv();
    aesCbc.open(process.env.AES_KEY, new Buffer(iv,'base64'));
    let cipherText = aesCbc.encrypt(text);
    return Buffer.concat([iv, cipherText]).toString('base64');
  };

  static decrypt(text) {
    let aesCbc = new MCrypt('rijndael-256', 'cbc');
    let ivAndCiphertext = new Buffer(text, 'base64');

    var ivSize = aesCbc.getIvSize();
    var iv = new Buffer(ivSize);
    var cipherText = new Buffer(ivAndCiphertext.length - ivSize);

    ivAndCiphertext.copy(iv, 0, 0, ivSize);
    ivAndCiphertext.copy(cipherText, 0, ivSize);
    aesCbc.open(process.env.AES_KEY, iv);
    return aesCbc.decrypt(cipherText).toString().replace(/\0/g, '');
  };
}

module.exports = Crypt;