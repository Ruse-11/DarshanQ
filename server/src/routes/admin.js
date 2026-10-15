const express = require('express');
const pool = require('../db/pool');
const { authenticate, requireRole } = require('../middleware/auth');
const { getCheckpointDensity } = require('../services/waitTimeEngine');

const router = express.Router();

// Authentication required for all admin routes
router.use(authenticate);

// GET /api/admin/density — live crowd density per checkpoint with topology (admin only)
router.get('/density', requireRole('admin'), async (req, res) => {
  try {
    const cpRes = await pool.query(
      `SELECT c.id, c.name, c.sequence_order, c.checkpoint_type, c.lane, c.next_checkpoint_id, c.temple_id, t.name AS temple_name 
       FROM checkpoints c
       JOIN temples t ON t.id = c.temple_id
       ORDER BY c.sequence_order ASC, c.lane ASC`
    );

    const densities = [];
    for (const cp of cpRes.rows) {
      const density = await getCheckpointDensity(cp.id);
      densities.push({
        checkpoint_id: cp.id,
        name: cp.name,
        sequence_order: cp.sequence_order,
        checkpoint_type: cp.checkpoint_type,
        lane: cp.lane,
        next_checkpoint_id: cp.next_checkpoint_id,
        temple_name: cp.temple_name,
        density_level: density.density_level,
        people_waiting: density.people_waiting,
        scan_rate: density.scan_rate,
      });
    }

    res.json({ checkpoints: densities });
  } catch (err) {
    console.error('GET /admin/density error:', err.message);
    res.status(500).json({ error: 'Failed to fetch admin density metrics' });
  }
});

// GET /api/admin/analytics — overview metrics (admin only)
router.get('/analytics', requireRole('admin'), async (req, res) => {
  try {
    // 1. Tokens booked today
    const bookedRes = await pool.query(
      `SELECT COUNT(*)::int AS count 
       FROM queue_tokens 
       WHERE booked_at >= CURRENT_DATE`
    );

    // 2. Tokens completed today
    const completedRes = await pool.query(
      `SELECT COUNT(*)::int AS count 
       FROM queue_tokens 
       WHERE status = 'completed'`
    );

    // 3. Active waiting tokens
    const activeRes = await pool.query(
      `SELECT COUNT(*)::int AS count, 
              COALESCE(AVG(estimated_wait_minutes), 0)::numeric(10,1) AS avg_wait
       FROM queue_tokens 
       WHERE status IN ('waiting', 'notified', 'checked_in')`
    );

    // 4. Total scans today
    const scansRes = await pool.query(
      `SELECT COUNT(*)::int AS count 
       FROM checkpoint_logs 
       WHERE scanned_at >= CURRENT_DATE`
    );

    res.json({
      analytics: {
        tokens_booked_today: bookedRes.rows[0]?.count || 0,
        tokens_completed_today: completedRes.rows[0]?.count || 0,
        active_waiting: activeRes.rows[0]?.count || 0,
        avg_wait_minutes: parseFloat(activeRes.rows[0]?.avg_wait || 0),
        scans_today: scansRes.rows[0]?.count || 0,
      },
    });
  } catch (err) {
    console.error('GET /admin/analytics error:', err.message);
    res.status(500).json({ error: 'Failed to fetch admin analytics' });
  }
});

// GET /api/admin/devotee/:devotee_code — lookup devotee journey & logs (admin/staff only)
router.get('/devotee/:devotee_code', requireRole('admin', 'staff'), async (req, res) => {
  try {
    const rawCode = req.params.devotee_code.trim();

    // 1. Fetch token and current state
    const tokenRes = await pool.query(
      `SELECT t.id, t.token_number, t.devotee_code, t.devotee_name, t.devotee_phone,
              t.status, t.gate_checkin_time, t.booked_at, t.estimated_wait_minutes,
              t.telegram_chat_id,
              c.id AS current_checkpoint_id,
              c.name AS current_checkpoint_name, 
              c.checkpoint_type AS current_checkpoint_type, 
              c.lane AS current_checkpoint_lane,
              tem.name AS temple_name
       FROM queue_tokens t
       LEFT JOIN checkpoints c ON c.id = t.current_checkpoint_id
       LEFT JOIN temples tem ON tem.id = t.temple_id
       WHERE UPPER(t.devotee_code) = UPPER($1)`,
      [rawCode]
    );

    if (tokenRes.rows.length === 0) {
      return res.status(404).json({ error: `Devotee code '${rawCode}' not found` });
    }

    const devotee = tokenRes.rows[0];

    // 2. Fetch full ordered checkpoint_logs history
    const logsRes = await pool.query(
      `SELECT cl.id, cl.scanned_at,
              c.id AS checkpoint_id, c.name AS checkpoint_name, c.checkpoint_type, c.lane,
              u.name AS scanned_by_name, u.email AS scanned_by_email
       FROM checkpoint_logs cl
       JOIN checkpoints c ON c.id = cl.checkpoint_id
       LEFT JOIN users u ON u.id = cl.scanned_by
       WHERE cl.token_id = $1
       ORDER BY cl.scanned_at ASC`,
      [devotee.id]
    );

    res.json({
      devotee: {
        id: devotee.id,
        token_number: devotee.token_number,
        devotee_code: devotee.devotee_code,
        devotee_name: devotee.devotee_name,
        devotee_phone: devotee.devotee_phone,
        status: devotee.status,
        current_checkpoint_id: devotee.current_checkpoint_id,
        current_checkpoint_name: devotee.current_checkpoint_name || (devotee.status === 'completed' ? 'Darshan Completed' : 'Waiting for Gate'),
        current_checkpoint_type: devotee.current_checkpoint_type,
        current_checkpoint_lane: devotee.current_checkpoint_lane,
        gate_checkin_time: devotee.gate_checkin_time,
        booked_at: devotee.booked_at,
        estimated_wait_minutes: devotee.estimated_wait_minutes,
        telegram_chat_id: devotee.telegram_chat_id,
        temple_name: devotee.temple_name,
      },
      logs: logsRes.rows.map((log) => ({
        id: log.id,
        checkpoint_id: log.checkpoint_id,
        checkpoint_name: log.checkpoint_name,
        checkpoint_type: log.checkpoint_type,
        lane: log.lane,
        scanned_at: log.scanned_at,
        scanned_by: log.scanned_by_name || log.scanned_by_email || 'Staff Member',
      })),
    });
  } catch (err) {
    console.error('GET /admin/devotee/:devotee_code error:', err.message);
    res.status(500).json({ error: 'Failed to retrieve devotee trace' });
  }
});

module.exports = router;
