const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db/pool');

const router = express.Router();

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { name, phone, password, role } = req.body;

  if (!name || !phone || !password || !role) {
    return res.status(400).json({ error: 'name, phone, password, and role are required' });
  }

  const validRoles = ['devotee', 'staff', 'admin'];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ error: `role must be one of: ${validRoles.join(', ')}` });
  }

  try {
    const password_hash = await bcrypt.hash(password, 12);
    const result = await pool.query(
      `INSERT INTO users (name, phone, password_hash, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, phone, role, created_at`,
      [name, phone, password_hash, role]
    );

    const user = result.rows[0];
    const token = jwt.sign(
      { id: user.id, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({ user, token });
  } catch (err) {
    if (err.code === '23505') {
      // unique_violation — phone already registered
      return res.status(409).json({ error: 'Phone number already registered' });
    }
    console.error('Register error:', err.message);
    return res.status(500).json({ error: 'Server error during registration' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  let { phone, password } = req.body;
  if (phone) phone = phone.trim();

  console.log('🔐 Login attempt | phone:', JSON.stringify(phone), '| password length:', password?.length);

  if (!phone || !password) {
    return res.status(400).json({ error: 'phone and password are required' });
  }

  try {
    const result = await pool.query(
      `SELECT id, name, phone, role, password_hash FROM users WHERE phone = $1`,
      [phone]
    );

    console.log('   DB rows found:', result.rows.length);
    const user = result.rows[0];
    if (!user) {
      console.log('   ❌ No user found for phone:', JSON.stringify(phone));
      return res.status(401).json({ error: 'Invalid phone or password' });
    }


    const match = await bcrypt.compare(password, user.password_hash);
    console.log('   bcrypt match:', match, '| user found:', user.phone, user.role);
    if (!match) {
      return res.status(401).json({ error: 'Invalid phone or password' });
    }


    const token = jwt.sign(
      { id: user.id, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { password_hash, ...safeUser } = user;
    return res.status(200).json({ user: safeUser, token });
  } catch (err) {
    console.error('Login error:', err.message);
    return res.status(500).json({ error: 'Server error during login' });
  }
});

module.exports = router;
