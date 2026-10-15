/**
 * devoteeCode.js
 *
 * Generates unique devotee codes:
 * 6 uppercase alphanumeric characters excluding 0, O, 1, I, prefixed with "DQ-"
 * Example: DQ-7F3K2M
 * Performs database uniqueness check against queue_tokens.devotee_code with retry on collision.
 */

const pool = require('../db/pool');

// 32-character set excluding 0, O, 1, I
const CHARSET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

/**
 * Generate a unique devotee code prefixed with DQ-
 * @param {number} length - Number of alphanumeric characters after DQ- (default 6)
 * @returns {Promise<string>} - e.g. "DQ-7F3K2M"
 */
async function generateDevoteeCode(length = 6) {
  const maxRetries = 10;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    let suffix = '';
    for (let i = 0; i < length; i++) {
      suffix += CHARSET.charAt(Math.floor(Math.random() * CHARSET.length));
    }
    const code = `DQ-${suffix}`;

    const existing = await pool.query(
      'SELECT id FROM queue_tokens WHERE devotee_code = $1',
      [code]
    );

    if (existing.rows.length === 0) {
      return code;
    }
  }

  throw new Error('Collision limit reached while generating unique devotee code');
}

module.exports = {
  generateDevoteeCode,
  CHARSET,
};
