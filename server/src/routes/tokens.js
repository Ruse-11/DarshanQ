const express = require('express');
const pool = require('../db/pool');
const { authenticate, requireRole } = require('../middleware/auth');
const { generateDevoteeCode } = require('../services/devoteeCode');
const {
  estimateWaitTime,
  recomputeAfterScan,
  getCheckpointDensity,
} = require('../services/waitTimeEngine');
const {
  emitQueueUpdate,
  emitDensityUpdate,
} = require('../sockets/queueEvents');

const router = express.Router();

// All token routes require authentication
router.use(authenticate);

// Helper to get default active temple
async function getDefaultTempleId() {
  const res = await pool.query(`SELECT id FROM temples ORDER BY id LIMIT 1`);
  return res.rows[0]?.id;
}

// GET /api/tokens/active — get devotee's current active token
router.get('/active', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT t.*, 
              tem.name AS temple_name,
              c.name AS checkpoint_name,
              c.checkpoint_type,
              c.lane,
              c.next_checkpoint_id,
              next_c.name AS next_checkpoint_name
       FROM queue_tokens t
       LEFT JOIN temples tem ON tem.id = t.temple_id
       LEFT JOIN checkpoints c ON c.id = t.current_checkpoint_id
       LEFT JOIN checkpoints next_c ON next_c.id = c.next_checkpoint_id
       WHERE t.user_id = $1 
         AND t.status IN ('waiting', 'notified', 'checked_in')
       ORDER BY t.booked_at DESC
       LIMIT 1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.json({ token: null });
    }

    const token = result.rows[0];
    const estimate = await estimateWaitTime(token.id);

    res.json({
      token: {
        ...token,
        estimated_wait_minutes: estimate.estimated_wait_minutes,
        tokens_ahead: estimate.tokens_ahead,
        scan_rate: estimate.scan_rate,
      },
    });
  } catch (err) {
    console.error('GET /tokens/active error:', err.message);
    res.status(500).json({ error: 'Failed to fetch active token' });
  }
});

// POST /api/tokens — book a new queue token (devotee)
router.post('/', async (req, res) => {
  try {
    const templeId = req.body.temple_id || (await getDefaultTempleId());

    if (!templeId) {
      return res.status(400).json({ error: 'No active temple found' });
    }

    // Check if user already has an active token
    const existing = await pool.query(
      `SELECT id, token_number, status FROM queue_tokens 
       WHERE user_id = $1 
         AND status IN ('waiting', 'notified', 'checked_in')`,
      [req.user.id]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({
        error: 'You already have an active token',
        token: existing.rows[0],
      });
    }

    // Get next token number for this temple
    const numRes = await pool.query(
      `SELECT COALESCE(MAX(token_number), 0) + 1 AS next_num 
       FROM queue_tokens 
       WHERE temple_id = $1`,
      [templeId]
    );
    const tokenNumber = numRes.rows[0].next_num;

    // Determine assigned gate: user specified gate_id OR auto load-balance to lowest queue gate
    let assignedGateId = req.body.gate_id;
    if (!assignedGateId) {
      const bestGateRes = await pool.query(
        `SELECT c.id, c.name, COUNT(qt.id)::int AS waiting_count
         FROM checkpoints c
         LEFT JOIN queue_tokens qt ON qt.current_checkpoint_id = c.id AND qt.status IN ('waiting', 'notified', 'checked_in')
         WHERE c.temple_id = $1 AND c.checkpoint_type = 'gate'
         GROUP BY c.id, c.name, c.sequence_order, c.lane
         ORDER BY waiting_count ASC, c.lane ASC
         LIMIT 1`,
        [templeId]
      );
      assignedGateId = bestGateRes.rows[0]?.id;
    }

    // Fallback if no gate found
    if (!assignedGateId) {
      const cpRes = await pool.query(
        `SELECT id FROM checkpoints WHERE temple_id = $1 ORDER BY sequence_order ASC LIMIT 1`,
        [templeId]
      );
      assignedGateId = cpRes.rows[0]?.id || null;
    }

    // Generate unique devotee code
    const devoteeCode = await generateDevoteeCode();
    const devoteeName = req.body.devotee_name || req.user.name || null;
    const devoteePhone = req.body.devotee_phone || null;

    // Insert token
    const insertRes = await pool.query(
      `INSERT INTO queue_tokens (user_id, temple_id, token_number, status, current_checkpoint_id, estimated_wait_minutes, devotee_code, devotee_name, devotee_phone)
       VALUES ($1, $2, $3, 'waiting', $4, 0, $5, $6, $7)
       RETURNING *`,
      [req.user.id, templeId, tokenNumber, assignedGateId, devoteeCode, devoteeName, devoteePhone]
    );

    const token = insertRes.rows[0];

    // Compute wait time
    const estimate = await estimateWaitTime(token.id);

    // Get gate details
    const gateInfo = await pool.query(
      `SELECT c.name AS checkpoint_name, c.lane, next_c.name AS next_checkpoint_name 
       FROM checkpoints c
       LEFT JOIN checkpoints next_c ON next_c.id = c.next_checkpoint_id
       WHERE c.id = $1`,
      [assignedGateId]
    );

    // Realtime notification
    const io = req.app.get('io');
    if (io) {
      emitQueueUpdate(io, templeId, {
        token_id: token.id,
        user_id: req.user.id,
        token_number: token.token_number,
        devotee_code: token.devotee_code,
        estimated_wait_minutes: estimate.estimated_wait_minutes,
        tokens_ahead: estimate.tokens_ahead,
        scan_rate: estimate.scan_rate,
      });

      if (assignedGateId) {
        const density = await getCheckpointDensity(assignedGateId);
        emitDensityUpdate(io, templeId, density);
      }
    }

    res.status(201).json({
      token: {
        ...token,
        ...gateInfo.rows[0],
        estimated_wait_minutes: estimate.estimated_wait_minutes,
        tokens_ahead: estimate.tokens_ahead,
        scan_rate: estimate.scan_rate,
      },
    });
  } catch (err) {
    console.error('POST /tokens error:', err.message);
    res.status(500).json({ error: 'Server error while booking token' });
  }
});

// POST /api/tokens/quick-add — staff or admin walk-in devotee quick addition
router.post('/quick-add', requireRole('staff', 'admin'), async (req, res) => {
  try {
    const { name, phone, gate_id } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Devotee name is required' });
    }

    const templeId = req.body.temple_id || (await getDefaultTempleId());
    if (!templeId) {
      return res.status(400).json({ error: 'No active temple found' });
    }

    // Determine assigned gate: specified gate_id OR auto load-balance to lowest queue gate
    let assignedGateId = gate_id;
    if (!assignedGateId) {
      const bestGateRes = await pool.query(
        `SELECT c.id, c.name, COUNT(qt.id)::int AS waiting_count
         FROM checkpoints c
         LEFT JOIN queue_tokens qt ON qt.current_checkpoint_id = c.id AND qt.status IN ('waiting', 'notified', 'checked_in')
         WHERE c.temple_id = $1 AND c.checkpoint_type = 'gate'
         GROUP BY c.id, c.name, c.sequence_order, c.lane
         ORDER BY waiting_count ASC, c.lane ASC
         LIMIT 1`,
        [templeId]
      );
      assignedGateId = bestGateRes.rows[0]?.id;
    }

    // Fallback if no gate found
    if (!assignedGateId) {
      const cpRes = await pool.query(
        `SELECT id FROM checkpoints WHERE temple_id = $1 ORDER BY sequence_order ASC LIMIT 1`,
        [templeId]
      );
      assignedGateId = cpRes.rows[0]?.id || null;
    }

    // Next token number
    const numRes = await pool.query(
      `SELECT COALESCE(MAX(token_number), 0) + 1 AS next_num 
       FROM queue_tokens 
       WHERE temple_id = $1`,
      [templeId]
    );
    const tokenNumber = numRes.rows[0].next_num;

    // Generate unique devotee code
    const devoteeCode = await generateDevoteeCode();

    // Insert token with user_id = null
    const insertRes = await pool.query(
      `INSERT INTO queue_tokens (user_id, temple_id, token_number, status, current_checkpoint_id, estimated_wait_minutes, devotee_code, devotee_name, devotee_phone)
       VALUES (NULL, $1, $2, 'waiting', $3, 0, $4, $5, $6)
       RETURNING *`,
      [
        templeId,
        tokenNumber,
        assignedGateId,
        devoteeCode,
        name.trim(),
        phone && phone.trim() ? phone.trim() : null,
      ]
    );

    const token = insertRes.rows[0];

    // Compute wait time
    const estimate = await estimateWaitTime(token.id);

    // Get gate details
    const gateInfo = await pool.query(
      `SELECT c.name AS checkpoint_name, c.lane, next_c.name AS next_checkpoint_name 
       FROM checkpoints c
       LEFT JOIN checkpoints next_c ON next_c.id = c.next_checkpoint_id
       WHERE c.id = $1`,
      [assignedGateId]
    );

    // Realtime notification
    const io = req.app.get('io');
    if (io) {
      emitQueueUpdate(io, templeId, {
        token_id: token.id,
        user_id: null,
        token_number: token.token_number,
        devotee_code: token.devotee_code,
        estimated_wait_minutes: estimate.estimated_wait_minutes,
        tokens_ahead: estimate.tokens_ahead,
        scan_rate: estimate.scan_rate,
      });

      if (assignedGateId) {
        const density = await getCheckpointDensity(assignedGateId);
        emitDensityUpdate(io, templeId, density);
      }
    }

    res.status(201).json({
      token: {
        ...token,
        ...gateInfo.rows[0],
        estimated_wait_minutes: estimate.estimated_wait_minutes,
        tokens_ahead: estimate.tokens_ahead,
        scan_rate: estimate.scan_rate,
      },
    });
  } catch (err) {
    console.error('POST /tokens/quick-add error:', err.message);
    res.status(500).json({ error: 'Server error while quick-adding walk-in devotee' });
  }
});

// GET /api/tokens/:id — get token details & live wait estimate
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT t.*, 
              tem.name AS temple_name,
              c.name AS checkpoint_name,
              c.checkpoint_type,
              c.lane,
              c.next_checkpoint_id,
              next_c.name AS next_checkpoint_name
       FROM queue_tokens t
       LEFT JOIN temples tem ON tem.id = t.temple_id
       LEFT JOIN checkpoints c ON c.id = t.current_checkpoint_id
       LEFT JOIN checkpoints next_c ON next_c.id = c.next_checkpoint_id
       WHERE t.id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Token not found' });
    }

    const token = result.rows[0];
    const estimate = await estimateWaitTime(token.id);

    res.json({
      token: {
        ...token,
        estimated_wait_minutes: estimate.estimated_wait_minutes,
        tokens_ahead: estimate.tokens_ahead,
        scan_rate: estimate.scan_rate,
      },
    });
  } catch (err) {
    console.error('GET /tokens/:id error:', err.message);
    res.status(500).json({ error: 'Failed to retrieve token details' });
  }
});

// PATCH /api/tokens/:id/cancel — cancel token
router.patch('/:id/cancel', async (req, res) => {
  try {
    const tokenRes = await pool.query(
      `SELECT * FROM queue_tokens WHERE id = $1`,
      [req.params.id]
    );

    if (tokenRes.rows.length === 0) {
      return res.status(404).json({ error: 'Token not found' });
    }

    const token = tokenRes.rows[0];

    // Only owner or staff/admin can cancel
    if (token.user_id !== req.user.id && !['staff', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Not authorized to cancel this token' });
    }

    await pool.query(
      `UPDATE queue_tokens SET status = 'cancelled' WHERE id = $1`,
      [token.id]
    );

    // Recompute queue for others
    const { tokenUpdates, densityUpdates } = await recomputeAfterScan(
      token.current_checkpoint_id,
      token.temple_id
    );

    const io = req.app.get('io');
    if (io) {
      tokenUpdates.forEach((t) => emitQueueUpdate(io, token.temple_id, t));
      densityUpdates.forEach((d) => emitDensityUpdate(io, token.temple_id, d));
    }

    res.json({ message: 'Token cancelled successfully', status: 'cancelled' });
  } catch (err) {
    console.error('PATCH /tokens/:id/cancel error:', err.message);
    res.status(500).json({ error: 'Failed to cancel token' });
  }
});

module.exports = router;
