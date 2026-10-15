const express = require('express');
const pool = require('../db/pool');
const { authenticate, requireRole } = require('../middleware/auth');
const {
  getCheckpointDensity,
  recomputeAfterScan,
  getScanRate,
} = require('../services/waitTimeEngine');
const {
  emitQueueUpdate,
  emitApproachingAlert,
  emitDensityUpdate,
} = require('../sockets/queueEvents');
const { sendTelegramAlert } = require('../services/telegramBot');

const router = express.Router();

// GET /api/checkpoints — list all checkpoints ordered by sequence and lane
router.get('/', authenticate, async (req, res) => {
  try {
    const cpRes = await pool.query(
      `SELECT c.id, c.name, c.sequence_order, c.checkpoint_type, c.lane, c.next_checkpoint_id, c.temple_id, t.name AS temple_name 
       FROM checkpoints c
       JOIN temples t ON t.id = c.temple_id
       ORDER BY c.sequence_order ASC, c.lane ASC`
    );

    const checkpointsWithDensity = [];
    for (const cp of cpRes.rows) {
      const density = await getCheckpointDensity(cp.id);
      checkpointsWithDensity.push({
        ...cp,
        ...density,
      });
    }

    res.json({ checkpoints: checkpointsWithDensity });
  } catch (err) {
    console.error('GET /checkpoints error:', err.message);
    res.status(500).json({ error: 'Failed to fetch checkpoints' });
  }
});

// GET /api/checkpoints/:id/status — get single checkpoint status
router.get('/:id/status', authenticate, async (req, res) => {
  try {
    const density = await getCheckpointDensity(req.params.id);
    res.json(density);
  } catch (err) {
    console.error('GET /checkpoints/:id/status error:', err.message);
    res.status(500).json({ error: 'Failed to fetch checkpoint status' });
  }
});

// POST /api/checkpoints/:id/scan — staff scans / passes a token (+1 tap)
router.post('/:id/scan', authenticate, requireRole('staff', 'admin'), async (req, res) => {
  try {
    const checkpointId = req.params.id;
    const { token_id } = req.body;

    // 1. Fetch current checkpoint details
    const cpRes = await pool.query(
      `SELECT id, name, sequence_order, checkpoint_type, lane, next_checkpoint_id, temple_id 
       FROM checkpoints 
       WHERE id = $1`,
      [checkpointId]
    );

    if (cpRes.rows.length === 0) {
      return res.status(404).json({ error: 'Checkpoint not found' });
    }

    const currentCheckpoint = cpRes.rows[0];

    // 2. Identify token to scan
    // 2. Identify token to scan
    let targetToken = null;
    if (token_id) {
      const cleanInput = String(token_id).trim().replace(/^#/, '');
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanInput);
      const isNum = /^\d+$/.test(cleanInput);

      if (isUuid) {
        const tRes = await pool.query(`SELECT * FROM queue_tokens WHERE id = $1`, [cleanInput]);
        if (tRes.rows.length > 0) targetToken = tRes.rows[0];
      } else if (isNum) {
        const tRes = await pool.query(
          `SELECT * FROM queue_tokens 
           WHERE temple_id = $1 AND token_number = $2 
             AND status IN ('waiting', 'notified', 'checked_in')
           ORDER BY booked_at DESC LIMIT 1`,
          [currentCheckpoint.temple_id, parseInt(cleanInput, 10)]
        );
        if (tRes.rows.length > 0) targetToken = tRes.rows[0];
      } else {
        // Devotee code match (e.g. DQ-C6CZ6Y or C6CZ6Y)
        const codeQuery = cleanInput.toUpperCase().startsWith('DQ-')
          ? cleanInput.toUpperCase()
          : `DQ-${cleanInput.toUpperCase()}`;
        const tRes = await pool.query(
          `SELECT * FROM queue_tokens 
           WHERE UPPER(devotee_code) = $1 OR UPPER(devotee_code) = $2
           ORDER BY booked_at DESC LIMIT 1`,
          [cleanInput.toUpperCase(), codeQuery]
        );
        if (tRes.rows.length > 0) targetToken = tRes.rows[0];
      }

      if (!targetToken) {
        return res.status(404).json({
          error: `Devotee token '${cleanInput}' not found. Please verify the devotee code or token number.`,
        });
      }

      if (targetToken.status === 'completed') {
        return res.status(400).json({
          error: `Token #${targetToken.token_number} (${targetToken.devotee_code}) has already completed darshan.`,
        });
      }

      if (targetToken.status === 'cancelled') {
        return res.status(400).json({
          error: `Token #${targetToken.token_number} (${targetToken.devotee_code}) was cancelled.`,
        });
      }
    } else {
      // Automatic next waiting token stationed at this checkpoint
      const tRes = await pool.query(
        `SELECT * FROM queue_tokens 
         WHERE temple_id = $1 
           AND status IN ('waiting', 'notified', 'checked_in')
           AND current_checkpoint_id = $2
         ORDER BY token_number ASC 
         LIMIT 1`,
        [currentCheckpoint.temple_id, currentCheckpoint.id]
      );
      if (tRes.rows.length > 0) targetToken = tRes.rows[0];
    }

    // 3. Log the scan event
    await pool.query(
      `INSERT INTO checkpoint_logs (checkpoint_id, token_id, scanned_by)
       VALUES ($1, $2, $3)`,
      [currentCheckpoint.id, targetToken ? targetToken.id : null, req.user.id]
    );

    // 4. Advance the token along the topology!
    let newStatus = null;
    let nextStationName = null;
    if (targetToken) {
      const isGateScan = currentCheckpoint.checkpoint_type === 'gate' && !targetToken.gate_checkin_time;

      if (currentCheckpoint.next_checkpoint_id) {
        newStatus = 'checked_in';
        let updateSql = `UPDATE queue_tokens SET current_checkpoint_id = $1, status = $2`;
        if (isGateScan) {
          updateSql += `, gate_checkin_time = NOW()`;
        }
        updateSql += ` WHERE id = $3`;

        await pool.query(updateSql, [currentCheckpoint.next_checkpoint_id, newStatus, targetToken.id]);

        const nextCpRes = await pool.query(
          `SELECT name FROM checkpoints WHERE id = $1`,
          [currentCheckpoint.next_checkpoint_id]
        );
        nextStationName = nextCpRes.rows[0]?.name;
      } else {
        // Reached Sanctum (final destination) -> completed!
        newStatus = 'completed';
        let updateSql = `UPDATE queue_tokens SET status = $1, current_checkpoint_id = NULL, estimated_wait_minutes = 0`;
        if (isGateScan) {
          updateSql += `, gate_checkin_time = NOW()`;
        }
        updateSql += ` WHERE id = $2`;

        await pool.query(updateSql, [newStatus, targetToken.id]);
      }
    }

    // 5. Recompute wait times for all affected tokens and checkpoints
    const { tokenUpdates, densityUpdates } = await recomputeAfterScan(
      currentCheckpoint.id,
      currentCheckpoint.temple_id
    );

    // 6. Broadcast over Socket.IO & push to Telegram if opted-in
    const io = req.app.get('io');
    if (io) {
      tokenUpdates.forEach((t) => {
        emitQueueUpdate(io, currentCheckpoint.temple_id, t);

        // Approaching alert should only fire for devotees still waiting outside the gate!
        if (t.status === 'waiting' && t.tokens_ahead !== null && t.tokens_ahead <= 2) {
          emitApproachingAlert(io, currentCheckpoint.temple_id, {
            token_id: t.token_id,
            user_id: t.user_id,
            message: `⚡ Token #${t.token_number}: You're next in line! Head to your checkpoint gate.`,
          });

          // Proactive Telegram push notification if devotee connected Telegram
          if (t.telegram_chat_id) {
            sendTelegramAlert(
              t.telegram_chat_id,
              `⚡ *Token #${t.token_number}* (${t.devotee_code || ''}): You're next in line (${t.tokens_ahead} ahead)! Head to your checkpoint gate.`
            );
          }
        }
      });

      densityUpdates.forEach((d) => {
        emitDensityUpdate(io, currentCheckpoint.temple_id, d);
      });
    }

    res.json({
      success: true,
      message: 'Checkpoint scan recorded',
      checkpoint_id: currentCheckpoint.id,
      checkpoint_name: currentCheckpoint.name,
      scanned_token_number: targetToken?.token_number || null,
      new_status: newStatus,
      next_station: nextStationName,
      affected_tokens_count: tokenUpdates.length,
    });
  } catch (err) {
    console.error('POST /checkpoints/:id/scan error:', err.message);
    res.status(500).json({ error: 'Failed to process checkpoint scan' });
  }
});

module.exports = router;
