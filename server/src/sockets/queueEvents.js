/**
 * queueEvents.js — Socket.IO event handlers
 *
 * Events:
 *   Client → Server:
 *     join:temple   { temple_id }
 *     join:user     { user_id }
 *
 *   Server → Client:
 *     queue:update        { token_id, estimated_wait_minutes, tokens_ahead, scan_rate }
 *     token:approaching   { token_id, message }
 *     density:update      { checkpoint_id, density_level, people_waiting, scan_rate }
 */

function registerSocketEvents(io) {
  io.on('connection', (socket) => {
    // Client joins a temple room to receive general queue & density updates
    socket.on('join:temple', ({ temple_id }) => {
      if (!temple_id) return;
      socket.join(`temple:${temple_id}`);
    });

    // Client joins user room to receive personalized token alerts
    socket.on('join:user', ({ user_id }) => {
      if (!user_id) return;
      socket.join(`user:${user_id}`);
    });

    socket.on('disconnect', () => {});
  });
}

/**
 * Emit queue wait time update for a specific token and broadcast to temple room
 */
function emitQueueUpdate(io, templeId, payload) {
  if (!io) return;
  io.to(`temple:${templeId}`).emit('queue:update', payload);
  if (payload.user_id) {
    io.to(`user:${payload.user_id}`).emit('queue:update', payload);
  }
}

/**
 * Emit approaching alert when tokens_ahead drops below threshold
 */
function emitApproachingAlert(io, templeId, payload) {
  if (!io) return;
  io.to(`temple:${templeId}`).emit('token:approaching', payload);
  if (payload.user_id) {
    io.to(`user:${payload.user_id}`).emit('token:approaching', payload);
  }
}

/**
 * Emit density update to temple room
 */
function emitDensityUpdate(io, templeId, payload) {
  if (!io) return;
  io.to(`temple:${templeId}`).emit('density:update', payload);
}

module.exports = {
  registerSocketEvents,
  emitQueueUpdate,
  emitApproachingAlert,
  emitDensityUpdate,
};
