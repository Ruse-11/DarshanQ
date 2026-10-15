const pool = require('./pool');

async function migrate() {
  console.log('🔄 Checking existing devotee_code values...');
  const res = await pool.query('SELECT id FROM queue_tokens WHERE devotee_code IS NULL');
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

  for (const row of res.rows) {
    let code = 'DQ-';
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    await pool.query('UPDATE queue_tokens SET devotee_code = $1 WHERE id = $2', [code, row.id]);
    console.log(`  Assigned ${code} to token ${row.id}`);
  }

  await pool.query('ALTER TABLE queue_tokens ALTER COLUMN devotee_code SET NOT NULL');
  console.log('✅ devotee_code is NOT NULL');

  try {
    await pool.query('ALTER TABLE queue_tokens ADD CONSTRAINT queue_tokens_devotee_code_key UNIQUE (devotee_code)');
    console.log('✅ Added UNIQUE constraint on devotee_code');
  } catch (err) {
    if (err.code === '42P07') {
      console.log('ℹ️ UNIQUE constraint on devotee_code already exists');
    } else {
      throw err;
    }
  }

  console.log('🎉 Migration complete!');
  process.exit(0);
}

migrate().catch((err) => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
