/**
 * waitTimeEngine.js — Queue Intelligence Module
 *
 * All wait-time and density calculations live here.
 * Both the REST handlers and Socket.IO handlers call this.
 */

const pool = require('../db/pool');

const SCAN_WINDOW_MINUTES = 15;
const DEFAULT_SCAN_RATE = 0.5; // 0.5 persons per minute (2 mins per devotee)

/**
 * Get current scan rate (scans per minute) for a checkpoint
 */
async function getScanRate(checkpointId) {
  try {
    const res = await pool.query(
      `SELECT COUNT(*)::int AS recent_scans 
       FROM checkpoint_logs 
       WHERE checkpoint_id = $1 
         AND scanned_at >= NOW() - ($2 || ' minutes')::interval`,
      [checkpointId, SCAN_WINDOW_MINUTES]
    );

    const recentScans = res.rows[0]?.recent_scans || 0;
    const rate = recentScans / SCAN_WINDOW_MINUTES;
    return rate > 0 ? parseFloat(rate.toFixed(2)) : DEFAULT_SCAN_RATE;
  } catch (err) {
    console.error('getScanRate error:', err.message);
    return DEFAULT_SCAN_RATE;
  }
}

/**
 * Calculate wait-time estimate for a single token.
 * Returns raw inputs alongside the estimate for explainability.
 */
async function estimateWaitTime(tokenId) {
  try {
    const tokenRes = await pool.query(
      `SELECT id, token_number, temple_id, status, current_checkpoint_id 
       FROM queue_tokens 
       WHERE id = $1`,
      [tokenId]
    );

    if (tokenRes.rows.length === 0) {
      return { estimated_wait_minutes: 0, tokens_ahead: 0, scan_rate: DEFAULT_SCAN_RATE };
    }

    const token = tokenRes.rows[0];

    if (['completed', 'cancelled'].includes(token.status)) {
      return { estimated_wait_minutes: 0, tokens_ahead: 0, scan_rate: DEFAULT_SCAN_RATE };
    }

    // Count tokens ahead in line for the same temple and current checkpoint
    const aheadRes = await pool.query(
      `SELECT COUNT(*)::int AS tokens_ahead 
       FROM queue_tokens 
       WHERE temple_id = $1 
         AND status IN ('waiting', 'notified', 'checked_in')
         AND (current_checkpoint_id = $2 OR current_checkpoint_id IS NULL)
         AND token_number < $3`,
      [token.temple_id, token.current_checkpoint_id, token.token_number]
    );

    const tokens_ahead = aheadRes.rows[0]?.tokens_ahead || 0;
    const scan_rate = token.current_checkpoint_id
      ? await getScanRate(token.current_checkpoint_id)
      : DEFAULT_SCAN_RATE;

    const estimated_wait_minutes = Math.max(
      0,
      Math.round(tokens_ahead / Math.max(scan_rate, 0.1))
    );

    // Save updated estimate to DB
    await pool.query(
      `UPDATE queue_tokens 
       SET estimated_wait_minutes = $1 
       WHERE id = $2`,
      [estimated_wait_minutes, tokenId]
    );

    return {
      estimated_wait_minutes,
      tokens_ahead,
      scan_rate,
      token_number: token.token_number,
      status: token.status,
    };
  } catch (err) {
    console.error('estimateWaitTime error:', err.message);
    return { estimated_wait_minutes: 0, tokens_ahead: 0, scan_rate: DEFAULT_SCAN_RATE };
  }
}

/**
 * Calculate density level for a checkpoint.
 */
async function getCheckpointDensity(checkpointId) {
  try {
    const cpRes = await pool.query(
      `SELECT c.id, c.name, c.temple_id, c.sequence_order, c.checkpoint_type, c.lane, c.next_checkpoint_id
       FROM checkpoints c
       WHERE c.id = $1`,
      [checkpointId]
    );

    if (cpRes.rows.length === 0) {
      return { density_level: 'low', people_waiting: 0, scan_rate: DEFAULT_SCAN_RATE };
    }

    const cp = cpRes.rows[0];

    // Count tokens currently stationed at this checkpoint
    const countRes = await pool.query(
      `SELECT COUNT(*)::int AS count 
       FROM queue_tokens 
       WHERE temple_id = $1 
         AND status IN ('waiting', 'notified', 'checked_in')
         AND current_checkpoint_id = $2`,
      [cp.temple_id, cp.id]
    );

    const people_waiting = countRes.rows[0]?.count || 0;
    const scan_rate = await getScanRate(checkpointId);

    let density_level = 'low';
    if (people_waiting >= 8) {
      density_level = 'high';
    } else if (people_waiting >= 4) {
      density_level = 'medium';
    }

    return {
      checkpoint_id: cp.id,
      name: cp.name,
      sequence_order: cp.sequence_order,
      checkpoint_type: cp.checkpoint_type,
      lane: cp.lane,
      next_checkpoint_id: cp.next_checkpoint_id,
      density_level,
      people_waiting,
      scan_rate,
    };
  } catch (err) {
    console.error('getCheckpointDensity error:', err.message);
    return { density_level: 'low', people_waiting: 0, scan_rate: DEFAULT_SCAN_RATE };
  }
}

/**
 * Recompute all affected tokens + checkpoints after a scan event.
 */
async function recomputeAfterScan(checkpointId, templeId) {
  try {
    // 1. Fetch all active tokens for this temple
    const activeTokensRes = await pool.query(
      `SELECT id, user_id, token_number, current_checkpoint_id, devotee_code, telegram_chat_id, status 
       FROM queue_tokens 
       WHERE temple_id = $1 
         AND status IN ('waiting', 'notified', 'checked_in')
       ORDER BY token_number ASC`,
      [templeId]
    );

    const tokenUpdates = [];
    for (const t of activeTokensRes.rows) {
      const estimate = await estimateWaitTime(t.id);
      tokenUpdates.push({
        token_id: t.id,
        user_id: t.user_id,
        token_number: t.token_number,
        devotee_code: t.devotee_code,
        telegram_chat_id: t.telegram_chat_id,
        status: t.status,
        estimated_wait_minutes: estimate.estimated_wait_minutes,
        tokens_ahead: estimate.tokens_ahead,
        scan_rate: estimate.scan_rate,
      });
    }

    // 2. Fetch all checkpoints for this temple & calculate their density
    const cpRes = await pool.query(
      `SELECT id, name, sequence_order, checkpoint_type, lane, next_checkpoint_id 
       FROM checkpoints 
       WHERE temple_id = $1 
       ORDER BY sequence_order ASC, lane ASC`,
      [templeId]
    );

    const densityUpdates = [];
    for (const cp of cpRes.rows) {
      const density = await getCheckpointDensity(cp.id);
      densityUpdates.push(density);
    }

    return { tokenUpdates, densityUpdates };
  } catch (err) {
    console.error('recomputeAfterScan error:', err.message);
    return { tokenUpdates: [], densityUpdates: [] };
  }
}

module.exports = {
  estimateWaitTime,
  getCheckpointDensity,
  recomputeAfterScan,
  getScanRate,
};
