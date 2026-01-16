/**
 * Server-side decryption helper for tests
 * This mimics what a real server would do to decrypt fingerprints
 */

const TEST_KEY = 'dev-key';

/**
 * Decrypts a string that was encrypted with XOR cipher
 * @param {string} ciphertext - Base64 encoded encrypted string
 * @param {string} key - Decryption key
 * @returns {string} Decrypted string
 */
function decryptString(ciphertext, key = TEST_KEY) {
  // Decode from base64
  const binaryString = Buffer.from(ciphertext, 'base64').toString('binary');
  const encrypted = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    encrypted[i] = binaryString.charCodeAt(i);
  }

  const keyBytes = Buffer.from(key, 'utf8');
  const decrypted = new Uint8Array(encrypted.length);

  // XOR is symmetric
  for (let i = 0; i < encrypted.length; i++) {
    decrypted[i] = encrypted[i] ^ keyBytes[i % keyBytes.length];
  }

  return Buffer.from(decrypted).toString('utf8');
}

/**
 * Decrypts and parses a fingerprint payload
 * @param {string} encryptedFingerprint - Base64 encoded encrypted fingerprint JSON
 * @param {string} key - Decryption key
 * @returns {object} Parsed fingerprint object
 */
function decryptFingerprint(encryptedFingerprint, key = TEST_KEY) {
  const decryptedJson = decryptString(encryptedFingerprint, key);
  // The fingerprint is double-JSON-stringified in the code (JSON.stringify(JSON.stringify(...)))
  // So we need to parse twice
  const parsed = JSON.parse(decryptedJson);
  // If it's still a string, parse again
  if (typeof parsed === 'string') {
    return JSON.parse(parsed);
  }
  return parsed;
}

module.exports = {
  decryptString,
  decryptFingerprint,
  TEST_KEY,
};
