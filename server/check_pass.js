require('dotenv').config();
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
const p = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

p.query("SELECT phone, role, password_hash FROM users WHERE phone = '9000000001'")
  .then(async (r) => {
    if (!r.rows.length) { console.log('USER NOT FOUND'); p.end(); return; }
    const { phone, role, password_hash } = r.rows[0];
    console.log('Found user:', phone, role);
    console.log('Hash:', password_hash);
    const match = await bcrypt.compare('admin123', password_hash);
    console.log('Password "admin123" matches:', match);
    p.end();
  })
  .catch((e) => { console.error(e.message); process.exit(1); });
