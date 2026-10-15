/**
 * seed.js — Demo data for DarshanQ
 *
 * Configures the complete Temple Topology:
 *   Gate 1 (Lane 1)       Gate 2 (Lane 2)       Gate 3 (Lane 3)
 *         │                     │                     │
 *         ▼                     ▼                     ▼
 *   Checkpoint 1          Checkpoint 2          Checkpoint 3
 *         │                     │                     │
 *         └──────────────┬──────┴─────────────────────┘
 *                        ▼
 *                     Sanctum (1 Single Holy Sanctum)
 */

require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('./pool');

async function seed() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    console.log('🌱 Cleaning & re-seeding DarshanQ database topology...');

    // ── 0. Ensure columns exist on checkpoints ────────────────────────────────
    await client.query(`
      ALTER TABLE checkpoints ADD COLUMN IF NOT EXISTS checkpoint_type VARCHAR(50);
      ALTER TABLE checkpoints ADD COLUMN IF NOT EXISTS next_checkpoint_id UUID REFERENCES checkpoints(id);
      ALTER TABLE checkpoints ADD COLUMN IF NOT EXISTS lane INT;
    `);

    // ── 1. Wipe duplicate / old demo data cleanly ─────────────────────────────
    await client.query(`DELETE FROM checkpoint_logs`);
    await client.query(`DELETE FROM notifications`);
    await client.query(`DELETE FROM crowd_snapshots`);
    await client.query(`DELETE FROM queue_tokens`);
    await client.query(`DELETE FROM checkpoints`);
    await client.query(`DELETE FROM temples`);

    // ── 2. Create Single Canonical Temple ─────────────────────────────────────
    const templeRes = await client.query(`
      INSERT INTO temples (name, location)
      VALUES ('Sri Venkateswara Temple', 'Tirupati, Andhra Pradesh')
      RETURNING id
    `);
    const templeId = templeRes.rows[0].id;
    console.log(`  ✅ Temple created: ${templeId}`);

    // ── 3. Create Checkpoints Hierarchy ───────────────────────────────────────
    // First, insert Sanctum (final destination)
    const sanctumRes = await client.query(`
      INSERT INTO checkpoints (temple_id, name, sequence_order, checkpoint_type, lane, next_checkpoint_id)
      VALUES ($1, 'Sanctum', 3, 'sanctum', 0, NULL)
      RETURNING id
    `, [templeId]);
    const sanctumId = sanctumRes.rows[0].id;

    // Second, insert Intermediate Checkpoints 1, 2, 3 -> pointing to Sanctum
    const cp1Res = await client.query(`
      INSERT INTO checkpoints (temple_id, name, sequence_order, checkpoint_type, lane, next_checkpoint_id)
      VALUES ($1, 'Checkpoint 1', 2, 'checkpoint', 1, $2)
      RETURNING id
    `, [templeId, sanctumId]);
    const cp1Id = cp1Res.rows[0].id;

    const cp2Res = await client.query(`
      INSERT INTO checkpoints (temple_id, name, sequence_order, checkpoint_type, lane, next_checkpoint_id)
      VALUES ($1, 'Checkpoint 2', 2, 'checkpoint', 2, $2)
      RETURNING id
    `, [templeId, sanctumId]);
    const cp2Id = cp2Res.rows[0].id;

    const cp3Res = await client.query(`
      INSERT INTO checkpoints (temple_id, name, sequence_order, checkpoint_type, lane, next_checkpoint_id)
      VALUES ($1, 'Checkpoint 3', 2, 'checkpoint', 3, $2)
      RETURNING id
    `, [templeId, sanctumId]);
    const cp3Id = cp3Res.rows[0].id;

    // Third, insert Gates 1, 2, 3 -> pointing to their respective Checkpoints
    const gate1Res = await client.query(`
      INSERT INTO checkpoints (temple_id, name, sequence_order, checkpoint_type, lane, next_checkpoint_id)
      VALUES ($1, 'Gate 1', 1, 'gate', 1, $2)
      RETURNING id
    `, [templeId, cp1Id]);
    const gate1Id = gate1Res.rows[0].id;

    const gate2Res = await client.query(`
      INSERT INTO checkpoints (temple_id, name, sequence_order, checkpoint_type, lane, next_checkpoint_id)
      VALUES ($1, 'Gate 2', 1, 'gate', 2, $2)
      RETURNING id
    `, [templeId, cp2Id]);
    const gate2Id = gate2Res.rows[0].id;

    const gate3Res = await client.query(`
      INSERT INTO checkpoints (temple_id, name, sequence_order, checkpoint_type, lane, next_checkpoint_id)
      VALUES ($1, 'Gate 3', 1, 'gate', 3, $2)
      RETURNING id
    `, [templeId, cp3Id]);
    const gate3Id = gate3Res.rows[0].id;

    console.log(`  ✅ 7 Checkpoints Topology created:`);
    console.log(`     Gate 1 (${gate1Id}) → Checkpoint 1 (${cp1Id}) ┐`);
    console.log(`     Gate 2 (${gate2Id}) → Checkpoint 2 (${cp2Id}) ┼─→ Sanctum (${sanctumId})`);
    console.log(`     Gate 3 (${gate3Id}) → Checkpoint 3 (${cp3Id}) ┘`);

    // ── 4. Seed Users ─────────────────────────────────────────────────────────
    const hash = (pw) => bcrypt.hash(pw, 10);
    const users = [
      { name: 'Admin Kumar',    phone: '9000000001', password: 'admin123',   role: 'admin'   },
      { name: 'Staff Ravi',     phone: '9000000002', password: 'staff123',   role: 'staff'   },
      { name: 'Staff Priya',    phone: '9000000003', password: 'staff123',   role: 'staff'   },
      { name: 'Devotee Anand',  phone: '9000000004', password: 'devotee123', role: 'devotee' },
      { name: 'Devotee Meena',  phone: '9000000005', password: 'devotee123', role: 'devotee' },
      { name: 'Devotee Suresh', phone: '9000000006', password: 'devotee123', role: 'devotee' },
    ];

    const userIds = {};
    for (const u of users) {
      const password_hash = await hash(u.password);
      const res = await client.query(`
        INSERT INTO users (name, phone, password_hash, role)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (phone) DO UPDATE SET name = EXCLUDED.name, password_hash = EXCLUDED.password_hash
        RETURNING id, role
      `, [u.name, u.phone, password_hash, u.role]);
      userIds[u.phone] = res.rows[0].id;
    }
    console.log(`  ✅ Users: ${Object.keys(userIds).length} seeded`);

    // ── 5. Seed Queue Tokens across all nodes ─────────────────────────────────
    const devAnand = userIds['9000000004'];
    const devMeena = userIds['9000000005'];
    const devSuresh = userIds['9000000006'];

    const tokenList = [
      // Lane 1 Tokens
      { user: devAnand,  token_num: 1, cp: gate1Id,   status: 'waiting',     wait: 4 },
      { user: devMeena,  token_num: 2, cp: gate1Id,   status: 'waiting',     wait: 7 },
      { user: devSuresh, token_num: 3, cp: cp1Id,     status: 'checked_in',  wait: 3 },
      // Lane 2 Tokens
      { user: devAnand,  token_num: 4, cp: gate2Id,   status: 'waiting',     wait: 8 },
      { user: devMeena,  token_num: 5, cp: gate2Id,   status: 'waiting',     wait: 12 },
      { user: devSuresh, token_num: 6, cp: cp2Id,     status: 'checked_in',  wait: 4 },
      // Lane 3 Tokens
      { user: devAnand,  token_num: 7, cp: gate3Id,   status: 'waiting',     wait: 5 },
      { user: devMeena,  token_num: 8, cp: cp3Id,     status: 'checked_in',  wait: 2 },
      // Sanctum Token
      { user: devSuresh, token_num: 9, cp: sanctumId, status: 'checked_in',  wait: 1 },
      // Completed Token
      { user: devAnand,  token_num: 10, cp: null,     status: 'completed',   wait: 0 },
    ];

    for (const t of tokenList) {
      await client.query(`
        INSERT INTO queue_tokens (user_id, temple_id, token_number, current_checkpoint_id, status, estimated_wait_minutes)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [t.user, templeId, t.token_num, t.cp, t.status, t.wait]);
    }
    console.log(`  ✅ Seeded ${tokenList.length} queue tokens across all lanes & checkpoints`);

    await client.query('COMMIT');
    console.log('\n🎉 Topology seed successful! Single temple with 3 Gates → 3 Checkpoints → 1 Sanctum.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Seed failed:', err.message);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch(() => process.exit(1));
