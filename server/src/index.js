require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const pool = require('./db/pool');
const authRoutes = require('./routes/auth');
const tokenRoutes = require('./routes/tokens');
const checkpointRoutes = require('./routes/checkpoints');
const adminRoutes = require('./routes/admin');
const { registerSocketEvents } = require('./sockets/queueEvents');
const { initTelegramBot } = require('./services/telegramBot');

const app = express();
const httpServer = http.createServer(app);

// ─── CORS Configuration ─────────────────────────────────────────────────────
const allowedOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim().replace(/\/+$/, ''));

function isOriginAllowed(origin) {
  if (!origin) return true; // Server-to-server or tools without origin header
  const clean = origin.replace(/\/+$/, '');
  return (
    allowedOrigins.includes('*') ||
    allowedOrigins.includes(clean) ||
    clean.endsWith('.vercel.app')
  );
}

// ─── Socket.IO ───────────────────────────────────────────────────────────────
const io = new Server(httpServer, {
  cors: {
    origin: (origin, callback) => {
      if (isOriginAllowed(origin)) callback(null, true);
      else callback(null, true); // allow websocket fallback
    },
    methods: ['GET', 'POST'],
    credentials: true,
  },
});
registerSocketEvents(io);

// Make io accessible in route handlers via req.app.get('io')
app.set('io', io);

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: (origin, callback) => {
      if (isOriginAllowed(origin)) callback(null, true);
      else callback(new Error(`CORS blocked origin: ${origin}`));
    },
    credentials: true,
  })
);
app.use(express.json());

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/tokens', tokenRoutes);
app.use('/api/checkpoints', checkpointRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch (err) {
    res.status(500).json({ status: 'error', database: err.message });
  }
});

// Bot status check
app.get('/api/bot-status', (req, res) => {
  res.json({
    tokenConfigured: !!process.env.TELEGRAM_BOT_TOKEN,
    botActive: true,
  });
});

// 404 catch-all
app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.path}` });
});

// ─── Start ────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => {
  console.log(`🛕  DarshanQ server running on http://localhost:${PORT}`);
  initTelegramBot();
});
