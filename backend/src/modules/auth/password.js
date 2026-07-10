const crypto = require('crypto');

const KEY_LENGTH = 64;
const SALT_LENGTH = 16;
const SCRYPT_COST = 16384;

const hashPassword = (password) =>
  new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(SALT_LENGTH).toString('hex');
    crypto.scrypt(password, salt, KEY_LENGTH, { cost: SCRYPT_COST }, (error, derivedKey) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(`scrypt:${salt}:${derivedKey.toString('hex')}`);
    });
  });

const comparePassword = (password, passwordHash) =>
  new Promise((resolve, reject) => {
    const [algorithm, salt, expectedHash] = String(passwordHash).split(':');

    if (algorithm !== 'scrypt' || !salt || !expectedHash) {
      resolve(false);
      return;
    }

    crypto.scrypt(password, salt, KEY_LENGTH, { cost: SCRYPT_COST }, (error, derivedKey) => {
      if (error) {
        reject(error);
        return;
      }

      const expected = Buffer.from(expectedHash, 'hex');
      const actual = Buffer.from(derivedKey.toString('hex'), 'hex');

      resolve(expected.length === actual.length && crypto.timingSafeEqual(expected, actual));
    });
  });

module.exports = {
  hashPassword,
  comparePassword
};
