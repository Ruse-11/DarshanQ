# -*- coding: utf-8 -*-
"""
pages_implementation.py
Pages 17 - 28:
Chapter 5: Implementation & Key Code Snippets
"""

def load_pages(add_page):

    # ----------------------------------------------------
    # PAGE 17: CHAPTER 5 - IMPLEMENTATION OVERVIEW & TECH STACK
    # ----------------------------------------------------
    p17_html = """
    <h1 class="chapter-title">CHAPTER 5: IMPLEMENTATION</h1>

    <h2 class="section-title">5.1 Implementation Overview & Full-Stack Tech Stack</h2>
    <p>
      The DarshanQ codebase is structured as a production-grade monorepo comprising a Node.js/Express backend service (<code>/server</code>) and a modern reactive Single Page Application (<code>/client</code>) powered by React 18 and Vite.
    </p>

    <table class="data-table">
      <thead>
        <tr>
          <th>Architectural Tier</th>
          <th>Technology</th>
          <th>Version</th>
          <th>Rationale & Core Responsibility</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Front-End UI</strong></td>
          <td>React.js (SPA)</td>
          <td>v18.3.1</td>
          <td>Declarative state rendering, reactive hooks, component isolation.</td>
        </tr>
        <tr>
          <td><strong>Build Tooling</strong></td>
          <td>Vite</td>
          <td>v5.3.4</td>
          <td>Ultra-fast Hot Module Replacement (HMR) and optimized rollup bundle.</td>
        </tr>
        <tr>
          <td><strong>Back-End Runtime</strong></td>
          <td>Node.js & Express</td>
          <td>v20+ / v4.19</td>
          <td>Asynchronous event loop, high I/O concurrency, lightweight routing.</td>
        </tr>
        <tr>
          <td><strong>Relational Database</strong></td>
          <td>PostgreSQL (Supabase)</td>
          <td>v15.1</td>
          <td>ACID compliance, relational integrity, foreign key cascades, SSL pooling.</td>
        </tr>
        <tr>
          <td><strong>Real-Time WebSockets</strong></td>
          <td>Socket.IO</td>
          <td>v4.7.5</td>
          <td>Bi-directional event dispatching, room partitioning, auto-reconnection.</td>
        </tr>
        <tr>
          <td><strong>Authentication</strong></td>
          <td>JWT & bcryptjs</td>
          <td>v9.0 / v2.4</td>
          <td>Stateless token authentication with 12-round salted password hashing.</td>
        </tr>
        <tr>
          <td><strong>Mobile Outreach</strong></td>
          <td>node-telegram-bot-api</td>
          <td>v2.1.0</td>
          <td>Headless messaging integration for remote devotee smartphone tracking.</td>
        </tr>
      </tbody>
    </table>

    <h2 class="section-title">Directory Architecture</h2>
    <div class="diagram-panel">
d:\\Projects\\DarshanQ/
├── server/
│   ├── src/
│   │   ├── db/          (pool.js, schema.sql, seed.js, migrate_devotee_code.js)
│   │   ├── middleware/  (auth.js: JWT verification & requireRole RBAC)
│   │   ├── routes/      (auth.js, tokens.js, checkpoints.js, admin.js)
│   │   ├── services/    (waitTimeEngine.js, telegramBot.js, devoteeCode.js)
│   │   ├── sockets/     (queueEvents.js: room joining & broadcast helpers)
│   │   └── index.js     (Express HTTP server, Socket.IO binding, bootstrap)
└── client/
    ├── src/
    │   ├── components/  (TempleFlowMap.jsx: SVG topology & dynamic glow)
    │   ├── context/     (AuthContext.jsx: persistent auth state & login)
    │   ├── pages/       (DevoteeHome.jsx, StaffPanel.jsx, AdminDashboard.jsx)
    │   └── main.jsx     (React 18 root mounting & global style injection)
    </div>
    """

    p17_md = """
# CHAPTER 5: IMPLEMENTATION

## 5.1 Implementation Overview & Full-Stack Tech Stack
The DarshanQ codebase is structured as a production-grade monorepo comprising a Node.js/Express backend service (`/server`) and a reactive Single Page Application (`/client`) powered by React 18 and Vite.

| Architectural Tier | Technology | Version | Rationale & Responsibility |
| :--- | :--- | :--- | :--- |
| **Front-End UI** | React.js (SPA) | v18.3.1 | Declarative state rendering, reactive hooks, component isolation. |
| **Build Tooling** | Vite | v5.3.4 | Ultra-fast Hot Module Replacement (HMR) and optimized bundling. |
| **Back-End Runtime** | Node.js & Express | v20+ / v4.19 | Asynchronous event loop, high I/O concurrency, lightweight routing. |
| **Relational Database**| PostgreSQL (Supabase) | v15.1 | ACID compliance, relational integrity, SSL pooling. |
| **Real-Time WebSockets**| Socket.IO | v4.7.5 | Bi-directional event dispatching, room partitioning. |
| **Authentication** | JWT & bcryptjs | v9.0 / v2.4 | Stateless token authentication with 12-round salted hashing. |
| **Mobile Outreach** | node-telegram-bot-api | v2.1.0 | Headless messaging integration for remote smartphone tracking. |

```
DIRECTORY ARCHITECTURE:
d:\Projects\DarshanQ/
├── server/src/
│   ├── db/          (pool.js, schema.sql, seed.js)
│   ├── middleware/  (auth.js)
│   ├── routes/      (auth.js, tokens.js, checkpoints.js, admin.js)
│   ├── services/    (waitTimeEngine.js, telegramBot.js, devoteeCode.js)
│   └── sockets/     (queueEvents.js)
└── client/src/
    ├── components/  (TempleFlowMap.jsx)
    ├── context/     (AuthContext.jsx)
    └── pages/       (DevoteeHome.jsx, StaffPanel.jsx, AdminDashboard.jsx)
```
    """
    add_page(17, "Chapter 5: Implementation Overview & Tech Stack", p17_html, p17_md)

    # ----------------------------------------------------
    # PAGE 18: 5.2 DATABASE POOL & SCHEMA INITIALIZATION
    # ----------------------------------------------------
    p18_html = """
    <h2 class="section-title">5.2 Database Connection Pool & Schema Initialization</h2>
    <p>
      Connection management to the hosted cloud Supabase PostgreSQL instance is managed via <code>server/src/db/pool.js</code>, utilizing connection pooling with explicit SSL configuration to guarantee transport-layer encryption.
    </p>

    <h3 class="sub-title">Source Code: Database Pool Configuration (<code>server/src/db/pool.js</code>)</h3>
    <pre class="code-block">
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Required for hosted cloud Supabase pooler
  },
  max: 20, // Connection pool limit
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle database client', err);
});

module.exports = pool;
    </pre>

    <h3 class="sub-title">Core Schema DDL (Extract from <code>server/src/db/schema.sql</code>)</h3>
    <pre class="code-block">
CREATE TABLE IF NOT EXISTS checkpoints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  temple_id UUID REFERENCES temples(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  sequence_order INT NOT NULL,
  checkpoint_type VARCHAR(50), -- 'gate', 'checkpoint', 'sanctum'
  lane INT,                    -- 1, 2, 3, or 0 (Sanctum)
  next_checkpoint_id UUID REFERENCES checkpoints(id)
);

CREATE TABLE IF NOT EXISTS queue_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  temple_id UUID REFERENCES temples(id) ON DELETE CASCADE,
  token_number INT NOT NULL,
  devotee_code VARCHAR(10) UNIQUE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'waiting'
    CHECK (status IN ('waiting','notified','checked_in','completed','cancelled')),
  booked_at TIMESTAMPTZ DEFAULT now(),
  estimated_wait_minutes INT,
  current_checkpoint_id UUID REFERENCES checkpoints(id)
);
    </pre>
    """

    p18_md = """
## 5.2 Database Connection Pool & Schema Initialization
Connection management to hosted cloud Supabase PostgreSQL is managed via `server/src/db/pool.js` with SSL encryption.

### Source Code: Database Pool Configuration (`server/src/db/pool.js`)
```javascript
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle database client', err);
});

module.exports = pool;
```

### Core Schema DDL (`server/src/db/schema.sql`)
```sql
CREATE TABLE IF NOT EXISTS checkpoints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  temple_id UUID REFERENCES temples(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  sequence_order INT NOT NULL,
  checkpoint_type VARCHAR(50), -- 'gate', 'checkpoint', 'sanctum'
  lane INT,
  next_checkpoint_id UUID REFERENCES checkpoints(id)
);

CREATE TABLE IF NOT EXISTS queue_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  temple_id UUID REFERENCES temples(id) ON DELETE CASCADE,
  token_number INT NOT NULL,
  devotee_code VARCHAR(10) UNIQUE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'waiting'
    CHECK (status IN ('waiting','notified','checked_in','completed','cancelled')),
  booked_at TIMESTAMPTZ DEFAULT now(),
  estimated_wait_minutes INT,
  current_checkpoint_id UUID REFERENCES checkpoints(id)
);
```
    """
    add_page(18, "Database Connection Pool & Schema DDL", p18_html, p18_md)

    # ----------------------------------------------------
    # PAGE 19: 5.3 CRYPTOGRAPHIC AUTH & RBAC MIDDLEWARE
    # ----------------------------------------------------
    p19_html = """
    <h2 class="section-title">5.3 Cryptographic Authentication & RBAC Middleware</h2>
    <p>
      Security is maintained via stateless JSON Web Tokens (JWT) signed with HMAC-SHA256 and salted password hashing via <code>bcryptjs</code> (cost factor 12).
    </p>

    <h3 class="sub-title">Role-Based Access Control Middleware (<code>server/src/middleware/auth.js</code>)</h3>
    <pre class="code-block">
const jwt = require('jsonwebtoken');

function authenticate(req, res, next) {
  const header = req.headers['authorization'];
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }
  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // Decoded payload: { id, role, name }
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token invalid or expired' });
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: `Access denied. Required role: ${roles.join(' or ')}` 
      });
    }
    next();
  };
}

module.exports = { authenticate, requireRole };
    </pre>

    <h3 class="sub-title">User Registration Controller (<code>server/src/routes/auth.js</code>)</h3>
    <pre class="code-block">
router.post('/register', async (req, res) => {
  const { name, phone, password, role } = req.body;
  const validRoles = ['devotee', 'staff', 'admin'];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ error: `role must be one of: ${validRoles.join(', ')}` });
  }
  try {
    const password_hash = await bcrypt.hash(password, 12);
    const result = await pool.query(
      `INSERT INTO users (name, phone, password_hash, role)
       VALUES ($1, $2, $3, $4) RETURNING id, name, phone, role`,
      [name, phone, password_hash, role]
    );
    const user = result.rows[0];
    const token = jwt.sign({ id: user.id, role: user.role, name: user.name },
      process.env.JWT_SECRET, { expiresIn: '7d' });
    return res.status(201).json({ user, token });
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Phone already registered' });
    return res.status(500).json({ error: 'Server error during registration' });
  }
});
    </pre>
    """

    p19_md = """
## 5.3 Cryptographic Authentication & RBAC Middleware
Security is maintained via stateless JSON Web Tokens (JWT) signed with HMAC-SHA256 and salted password hashing via `bcryptjs` (cost factor 12).

### Role-Based Access Control Middleware (`server/src/middleware/auth.js`)
```javascript
const jwt = require('jsonwebtoken');

function authenticate(req, res, next) {
  const header = req.headers['authorization'];
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }
  try {
    req.user = jwt.verify(header.slice(7), process.env.JWT_SECRET);
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token invalid or expired' });
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: `Access denied. Required role: ${roles.join(' or ')}` });
    }
    next();
  };
}

module.exports = { authenticate, requireRole };
```
    """
    add_page(19, "Cryptographic Authentication & RBAC Middleware", p19_html, p19_md)

    # ----------------------------------------------------
    # PAGE 20: 5.4 VIRTUAL TOKEN BOOKING & AUTO-BALANCING
    # ----------------------------------------------------
    p20_html = """
    <h2 class="section-title">5.4 Virtual Token Booking & Gate Auto-Balancing</h2>
    <p>
      When a devotee books a token, the backend in <code>server/src/routes/tokens.js</code> enforces single-active-token invariants and supports automated ingress balancing across Gate 1, Gate 2, and Gate 3.
    </p>

    <h3 class="sub-title">Token Booking & Gate Balancing Logic (<code>server/src/routes/tokens.js</code>)</h3>
    <pre class="code-block" style="font-size: 6.8pt; line-height: 1.22;">
router.post('/', async (req, res) => {
  try {
    const templeId = req.body.temple_id || (await getDefaultTempleId());
    const { gate_id } = req.body;

    // 1. Guard against duplicate active tokens
    const existing = await pool.query(
      `SELECT id, token_number FROM queue_tokens 
       WHERE user_id = $1 AND status IN ('waiting', 'notified', 'checked_in')`, [req.user.id]
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'You already have an active token', token: existing.rows[0] });
    }

    // 2. Resolve Gate Assignment (Manual Selection vs. Intelligent Auto-Balance)
    let assignedGateId = gate_id;
    if (!assignedGateId || assignedGateId === 'auto') {
      const gateRes = await pool.query(
        `SELECT c.id, COUNT(t.id)::int AS queue_depth FROM checkpoints c
         LEFT JOIN queue_tokens t ON t.current_checkpoint_id = c.id 
              AND t.status IN ('waiting', 'notified', 'checked_in')
         WHERE c.temple_id = $1 AND c.sequence_order = 1
         GROUP BY c.id ORDER BY queue_depth ASC, c.lane ASC LIMIT 1`, [templeId]
      );
      assignedGateId = gateRes.rows[0]?.id;
    }

    // 3. Increment token number and generate unique human devotee code
    const numRes = await pool.query(
      `SELECT COALESCE(MAX(token_number), 0) + 1 AS next_num FROM queue_tokens WHERE temple_id = $1`, [templeId]
    );
    const tokenNumber = numRes.rows[0].next_num;
    const devoteeCode = generateDevoteeCode(); // e.g. 'DQ-7F3K2'

    // 4. Atomic Token Insertion & Initial Wait-Time Broadcast
    const insertRes = await pool.query(
      `INSERT INTO queue_tokens (user_id, temple_id, token_number, devotee_code, current_checkpoint_id, status)
       VALUES ($1, $2, $3, $4, $5, 'waiting') RETURNING *`,
      [req.user.id, templeId, tokenNumber, devoteeCode, assignedGateId]
    );
    const waitEstimate = await estimateWaitTime(insertRes.rows[0].id);
    emitQueueUpdate(req.app.get('io'), insertRes.rows[0].id, waitEstimate);

    res.status(201).json({ token: { ...insertRes.rows[0], ...waitEstimate } });
  } catch (err) {
    res.status(500).json({ error: 'Failed to book token' });
  }
});
    </pre>
    """

    p20_md = """
## 5.4 Virtual Token Booking & Gate Auto-Balancing
When a devotee books a token, the backend in `server/src/routes/tokens.js` enforces single-active-token invariants and supports automated ingress balancing across Gate 1, Gate 2, and Gate 3.

### Source Code: Token Booking & Gate Balancing (`server/src/routes/tokens.js`)
```javascript
router.post('/', async (req, res) => {
  try {
    const templeId = req.body.temple_id || (await getDefaultTempleId());
    const { gate_id } = req.body;

    // Check duplicate active token
    const existing = await pool.query(
      `SELECT id, token_number FROM queue_tokens 
       WHERE user_id = $1 AND status IN ('waiting', 'notified', 'checked_in')`,
      [req.user.id]
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'You already have an active token' });
    }

    // Auto-balance gate selection: find gate with minimum queue depth
    let assignedGateId = gate_id;
    if (!assignedGateId || assignedGateId === 'auto') {
      const gateRes = await pool.query(
        `SELECT c.id, COUNT(t.id)::int AS queue_depth
         FROM checkpoints c
         LEFT JOIN queue_tokens t ON t.current_checkpoint_id = c.id 
              AND t.status IN ('waiting', 'notified', 'checked_in')
         WHERE c.temple_id = $1 AND c.sequence_order = 1
         GROUP BY c.id ORDER BY queue_depth ASC, c.lane ASC LIMIT 1`,
        [templeId]
      );
      assignedGateId = gateRes.rows[0]?.id;
    }

    const tokenNumber = (await pool.query(
      `SELECT COALESCE(MAX(token_number), 0) + 1 AS next_num FROM queue_tokens WHERE temple_id = $1`,
      [templeId]
    )).rows[0].next_num;

    const devoteeCode = generateDevoteeCode(); // e.g. DQ-9X2L1

    const insertRes = await pool.query(
      `INSERT INTO queue_tokens 
        (user_id, temple_id, token_number, devotee_code, current_checkpoint_id, status)
       VALUES ($1, $2, $3, $4, $5, 'waiting') RETURNING *`,
      [req.user.id, templeId, tokenNumber, devoteeCode, assignedGateId]
    );

    const waitEstimate = await estimateWaitTime(insertRes.rows[0].id);
    res.status(201).json({ token: { ...insertRes.rows[0], ...waitEstimate } });
  } catch (err) {
    res.status(500).json({ error: 'Failed to book token' });
  }
});
```
    """
    add_page(20, "Virtual Token Booking & Auto-Balancing", p20_html, p20_md)

    # ----------------------------------------------------
    # PAGE 21: 5.5 QUEUE INTELLIGENCE & WAIT-TIME ENGINE
    # ----------------------------------------------------
    p21_html = """
    <h2 class="section-title">5.5 Queue Intelligence & Wait-Time Engine</h2>
    <p>
      The mathematical core of DarshanQ resides in <code>server/src/services/waitTimeEngine.js</code>. All wait-time estimates and crowd density evaluations are computed here.
    </p>

    <h3 class="sub-title">Source Code: Velocity & Wait-Time Calculation (<code>waitTimeEngine.js</code>)</h3>
    <pre class="code-block">
const pool = require('../db/pool');
const SCAN_WINDOW_MINUTES = 15;
const DEFAULT_SCAN_RATE = 0.5; // Fallback: 0.5 scans/min (2 mins per devotee)

async function getScanRate(checkpointId) {
  try {
    const res = await pool.query(
      `SELECT COUNT(*)::int AS recent_scans FROM checkpoint_logs 
       WHERE checkpoint_id = $1 AND scanned_at >= NOW() - ($2 || ' minutes')::interval`,
      [checkpointId, SCAN_WINDOW_MINUTES]
    );
    const recentScans = res.rows[0]?.recent_scans || 0;
    const rate = recentScans / SCAN_WINDOW_MINUTES;
    return rate > 0 ? parseFloat(rate.toFixed(2)) : DEFAULT_SCAN_RATE;
  } catch (err) {
    return DEFAULT_SCAN_RATE;
  }
}

async function estimateWaitTime(tokenId) {
  try {
    const tokenRes = await pool.query(
      `SELECT id, token_number, temple_id, status, current_checkpoint_id 
       FROM queue_tokens WHERE id = $1`, [tokenId]
    );
    if (tokenRes.rows.length === 0) return { estimated_wait_minutes: 0, tokens_ahead: 0 };
    const token = tokenRes.rows[0];

    if (['completed', 'cancelled'].includes(token.status)) {
      return { estimated_wait_minutes: 0, tokens_ahead: 0, scan_rate: DEFAULT_SCAN_RATE };
    }

    // Count waiting tokens ahead in sequence order for the same station
    const aheadRes = await pool.query(
      `SELECT COUNT(*)::int AS tokens_ahead FROM queue_tokens 
       WHERE temple_id = $1 AND status IN ('waiting', 'notified', 'checked_in')
         AND (current_checkpoint_id = $2 OR current_checkpoint_id IS NULL)
         AND token_number < $3`,
      [token.temple_id, token.current_checkpoint_id, token.token_number]
    );
    const tokens_ahead = aheadRes.rows[0]?.tokens_ahead || 0;
    const scan_rate = token.current_checkpoint_id 
      ? await getScanRate(token.current_checkpoint_id) : DEFAULT_SCAN_RATE;

    // Mathematical formula with divide-by-zero safeguard
    const estimated_wait_minutes = Math.max(0, Math.round(tokens_ahead / Math.max(scan_rate, 0.1)));

    await pool.query(`UPDATE queue_tokens SET estimated_wait_minutes = $1 WHERE id = $2`,
      [estimated_wait_minutes, tokenId]);

    return { estimated_wait_minutes, tokens_ahead, scan_rate, token_number: token.token_number };
  } catch (err) {
    return { estimated_wait_minutes: 0, tokens_ahead: 0, scan_rate: DEFAULT_SCAN_RATE };
  }
}
    </pre>
    """

    p21_md = """
## 5.5 Queue Intelligence & Wait-Time Engine
The mathematical core of DarshanQ resides in `server/src/services/waitTimeEngine.js`. All wait-time estimates and crowd density evaluations are computed here.

### Source Code: Velocity & Wait-Time Calculation (`waitTimeEngine.js`)
```javascript
const pool = require('../db/pool');
const SCAN_WINDOW_MINUTES = 15;
const DEFAULT_SCAN_RATE = 0.5;

async function getScanRate(checkpointId) {
  const res = await pool.query(
    `SELECT COUNT(*)::int AS recent_scans FROM checkpoint_logs 
     WHERE checkpoint_id = $1 AND scanned_at >= NOW() - ($2 || ' minutes')::interval`,
    [checkpointId, SCAN_WINDOW_MINUTES]
  );
  const rate = (res.rows[0]?.recent_scans || 0) / SCAN_WINDOW_MINUTES;
  return rate > 0 ? parseFloat(rate.toFixed(2)) : DEFAULT_SCAN_RATE;
}

async function estimateWaitTime(tokenId) {
  const tokenRes = await pool.query(
    `SELECT id, token_number, temple_id, status, current_checkpoint_id 
     FROM queue_tokens WHERE id = $1`, [tokenId]
  );
  const token = tokenRes.rows[0];

  const aheadRes = await pool.query(
    `SELECT COUNT(*)::int AS tokens_ahead FROM queue_tokens 
     WHERE temple_id = $1 AND status IN ('waiting', 'notified', 'checked_in')
       AND (current_checkpoint_id = $2 OR current_checkpoint_id IS NULL)
       AND token_number < $3`,
    [token.temple_id, token.current_checkpoint_id, token.token_number]
  );
  const tokens_ahead = aheadRes.rows[0]?.tokens_ahead || 0;
  const scan_rate = await getScanRate(token.current_checkpoint_id);

  const estimated_wait_minutes = Math.max(0, Math.round(tokens_ahead / Math.max(scan_rate, 0.1)));

  await pool.query(
    `UPDATE queue_tokens SET estimated_wait_minutes = $1 WHERE id = $2`,
    [estimated_wait_minutes, tokenId]
  );

  return { estimated_wait_minutes, tokens_ahead, scan_rate, token_number: token.token_number };
}
```
    """
    add_page(21, "Queue Intelligence & Mathematical Engine", p21_html, p21_md)

    # ----------------------------------------------------
    # PAGE 22: 5.6 CHECKPOINT SCAN & DYNAMIC PROGRESSION
    # ----------------------------------------------------
    p22_html = """
    <h2 class="section-title">5.6 Checkpoint Scanning & Topological Progression</h2>
    <p>
      When security staff scans a token or taps <code>+1 Pass Next Devotee</code>, <code>server/src/routes/checkpoints.js</code> executes atomic state transitions along the directed graph topology.
    </p>

    <h3 class="sub-title">Source Code: Checkpoint Scan Controller (<code>server/src/routes/checkpoints.js</code>)</h3>
    <pre class="code-block" style="font-size: 6.8pt; line-height: 1.22;">
router.post('/:id/scan', authenticate, requireRole('staff', 'admin'), async (req, res) => {
  try {
    const checkpointId = req.params.id;
    const { token_id } = req.body;

    // 1. Fetch current station and downstream target node
    const cpRes = await pool.query(
      `SELECT id, name, sequence_order, checkpoint_type, next_checkpoint_id, temple_id 
       FROM checkpoints WHERE id = $1`, [checkpointId]
    );
    if (cpRes.rows.length === 0) return res.status(404).json({ error: 'Checkpoint not found' });
    const currentCp = cpRes.rows[0];

    // 2. Multimodal Token Resolution (UUID, token number, or Devotee Code DQ-XXXXX)
    let targetToken = token_id 
      ? await resolveTokenInput(token_id, currentCp.temple_id)
      : (await pool.query(
          `SELECT * FROM queue_tokens WHERE temple_id = $1 AND current_checkpoint_id = $2 
             AND status IN ('waiting', 'notified', 'checked_in') ORDER BY token_number ASC LIMIT 1`,
          [currentCp.temple_id, checkpointId]
        )).rows[0];

    if (!targetToken) return res.status(404).json({ error: 'No active devotees waiting at station' });

    // 3. Execute Directed Graph State Transition
    let nextStatus = currentCp.checkpoint_type === 'sanctum' ? 'completed' : 'checked_in';
    let targetStationId = currentCp.checkpoint_type === 'sanctum' ? null : currentCp.next_checkpoint_id;

    await pool.query(
      `UPDATE queue_tokens SET current_checkpoint_id = $1, status = $2,
          gate_checkin_time = COALESCE(gate_checkin_time, NOW()) WHERE id = $3`,
      [targetStationId, nextStatus, targetToken.id]
    );

    // 4. Record Immutable Audit Ledger & Recompute Topology
    await pool.query(`INSERT INTO checkpoint_logs (checkpoint_id, token_id, scanned_by) VALUES ($1, $2, $3)`,
      [checkpointId, targetToken.id, req.user.id]);

    const { tokenUpdates, densityUpdates } = await recomputeAfterScan(checkpointId, currentCp.temple_id);
    broadcastUpdates(req.app.get('io'), tokenUpdates, densityUpdates);

    res.json({ message: 'Devotee passed successfully', advanced_to: targetStationId });
  } catch (err) {
    res.status(500).json({ error: 'Scan transaction failed' });
  }
});
    </pre>
    """

    p22_md = """
## 5.6 Checkpoint Scanning & Topological Progression
When security staff scans a token or taps `+1 Pass Next Devotee`, `server/src/routes/checkpoints.js` executes atomic state transitions along the directed graph topology.

### Source Code: Checkpoint Scan Controller (`server/src/routes/checkpoints.js`)
```javascript
router.post('/:id/scan', authenticate, requireRole('staff', 'admin'), async (req, res) => {
  const checkpointId = req.params.id;
  const { token_id } = req.body;

  const currentCp = (await pool.query(
    `SELECT id, name, checkpoint_type, next_checkpoint_id, temple_id 
     FROM checkpoints WHERE id = $1`, [checkpointId]
  )).rows[0];

  const targetToken = token_id 
    ? await resolveTokenInput(token_id, currentCp.temple_id)
    : (await pool.query(
        `SELECT * FROM queue_tokens 
         WHERE temple_id = $1 AND current_checkpoint_id = $2 
           AND status IN ('waiting', 'notified', 'checked_in')
         ORDER BY token_number ASC LIMIT 1`,
        [currentCp.temple_id, checkpointId]
      )).rows[0];

  let nextStatus = 'checked_in';
  let targetStationId = currentCp.next_checkpoint_id;

  if (currentCp.checkpoint_type === 'sanctum') {
    nextStatus = 'completed';
    targetStationId = null;
  }

  await pool.query(
    `UPDATE queue_tokens 
     SET current_checkpoint_id = $1, status = $2, gate_checkin_time = COALESCE(gate_checkin_time, NOW())
     WHERE id = $3`,
    [targetStationId, nextStatus, targetToken.id]
  );

  await pool.query(
    `INSERT INTO checkpoint_logs (checkpoint_id, token_id, scanned_by) VALUES ($1, $2, $3)`,
    [checkpointId, targetToken.id, req.user.id]
  );

  const { tokenUpdates, densityUpdates } = await recomputeAfterScan(checkpointId, currentCp.temple_id);
  broadcastUpdates(req.app.get('io'), tokenUpdates, densityUpdates);

  res.json({ message: 'Devotee passed successfully', advanced_to: targetStationId });
});
```
    """
    add_page(22, "Checkpoint Scanning & Topological Progression", p22_html, p22_md)

    # ----------------------------------------------------
    # PAGE 23: 5.7 WEBSOCKET PUSH ENGINE
    # ----------------------------------------------------
    p23_html = """
    <h2 class="section-title">5.7 Bi-Directional WebSocket Push Notification Engine</h2>
    <p>
      WebSocket communications are governed by <code>server/src/sockets/queueEvents.js</code>, utilizing room multiplexing to avoid inefficient global broadcasts.
    </p>

    <h3 class="sub-title">Socket.IO Room Partitioning & Event Emitters (<code>queueEvents.js</code>)</h3>
    <pre class="code-block">
function registerSocketEvents(io) {
  io.on('connection', (socket) => {
    // 1. Devotee joins personal notification room
    socket.on('join:user', ({ user_id }) => {
      if (user_id) {
        socket.join(`user:${user_id}`);
      }
    });

    // 2. Staff and Admin join temple-wide situational awareness room
    socket.on('join:temple', ({ temple_id }) => {
      if (temple_id) {
        socket.join(`temple:${temple_id}`);
      }
    });
  });
}

function emitQueueUpdate(io, token) {
  if (!io || !token) return;
  // Push live wait time drop directly to specific devotee
  if (token.user_id) {
    io.to(`user:${token.user_id}`).emit('queue:update', token);
  }
}

function emitApproachingAlert(io, token) {
  if (!io || !token?.user_id) return;
  io.to(`user:${token.user_id}`).emit('token:approaching', {
    token_id: token.token_id,
    user_id: token.user_id,
    message: `⚡ Token #${token.token_number}: You are next! Please proceed to the entrance gate immediately.`,
  });
}

function emitDensityUpdate(io, templeId, checkpointDensity) {
  if (!io || !templeId) return;
  // Broadcast station density shift to all staff and admin dashboards
  io.to(`temple:${templeId}`).emit('density:update', checkpointDensity);
}

module.exports = { registerSocketEvents, emitQueueUpdate, emitApproachingAlert, emitDensityUpdate };
    </pre>
    """

    p23_md = """
## 5.7 Bi-Directional WebSocket Push Notification Engine
WebSocket communications are governed by `server/src/sockets/queueEvents.js`, utilizing room multiplexing to avoid inefficient global broadcasts.

### Source Code: Socket.IO Multiplexing (`queueEvents.js`)
```javascript
function registerSocketEvents(io) {
  io.on('connection', (socket) => {
    socket.on('join:user', ({ user_id }) => {
      if (user_id) socket.join(`user:${user_id}`);
    });

    socket.on('join:temple', ({ temple_id }) => {
      if (temple_id) socket.join(`temple:${temple_id}`);
    });
  });
}

function emitQueueUpdate(io, token) {
  if (token?.user_id) {
    io.to(`user:${token.user_id}`).emit('queue:update', token);
  }
}

function emitApproachingAlert(io, token) {
  if (token?.user_id) {
    io.to(`user:${token.user_id}`).emit('token:approaching', {
      token_id: token.token_id,
      user_id: token.user_id,
      message: `⚡ Token #${token.token_number}: You are next in line! Head to gate now.`,
    });
  }
}

function emitDensityUpdate(io, templeId, checkpointDensity) {
  io.to(`temple:${templeId}`).emit('density:update', checkpointDensity);
}

module.exports = { registerSocketEvents, emitQueueUpdate, emitApproachingAlert, emitDensityUpdate };
```
    """
    add_page(23, "Bi-Directional WebSocket Push Engine", p23_html, p23_md)

    # ----------------------------------------------------
    # PAGE 24: 5.8 TELEGRAM BOT INTEGRATION SERVICE
    # ----------------------------------------------------
    p24_html = """
    <h2 class="section-title">5.8 Telegram Bot Integration Service</h2>
    <p>
      The Telegram daemon in <code>server/src/services/telegramBot.js</code> connects via long-polling, enabling pilgrims to query queue positions and receive turn alerts on mobile messaging apps without opening a web browser.
    </p>

    <h3 class="sub-title">Source Code: Telegram Bot Commands & Code Lookup (<code>telegramBot.js</code>)</h3>
    <pre class="code-block">
const { Bot } = require('node-telegram-bot-api');
const pool = require('../db/pool');
let bot = null;

function initTelegramBot() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return console.log('ℹ️ TELEGRAM_BOT_TOKEN not configured. Bot disabled.');

  try {
    bot = new Bot(token);

    // 1. /start command onboarding
    bot.command('start', async (ctx) => {
      await ctx.reply(
        '🙏 *Welcome to DarshanQ Virtual Queue Bot!*\\n\\n' +
        'Send your 7-character Devotee Code (e.g. *DQ-7F3K2*) to check your live queue status.',
        { parse_mode: 'Markdown' }
      );
    });

    // 2. Regex listener for devotee code format DQ-XXXXX
    bot.hears(/DQ-[A-Z0-9]+/i, async (ctx) => {
      const match = ctx.message.text.match(/DQ-[A-Z0-9]+/i);
      const devoteeCode = match[0].toUpperCase();
      const chatId = ctx.chatId;

      const res = await pool.query(
        `SELECT t.*, c.name AS station_name FROM queue_tokens t 
         LEFT JOIN checkpoints c ON c.id = t.current_checkpoint_id 
         WHERE t.devotee_code = $1`, [devoteeCode]
      );
      if (res.rows.length === 0) return ctx.reply(`❌ Code '${devoteeCode}' not found.`);

      const t = res.rows[0];
      // Bind Telegram chat_id for automated push alerts
      await pool.query(`UPDATE queue_tokens SET telegram_chat_id = $1 WHERE id = $2`, [chatId, t.id]);

      await ctx.reply(
        `🛕 *Darshan Pass #${t.token_number}*\\n` +
        `• Code: \`${t.devotee_code}\`\\n` +
        `• Status: *${t.status.toUpperCase()}*\\n` +
        `• Current Station: *${t.station_name || 'Sanctum'}*\\n` +
        `• Est. Wait: *${t.estimated_wait_minutes || 0} minutes*\\n\\n` +
        `✅ *Notifications Activated:* We will alert you here when your turn arrives!`,
        { parse_mode: 'Markdown' }
      );
    });
  } catch (err) {
    console.error('Telegram bot init error:', err.message);
  }
}
    </pre>
    """

    p24_md = """
## 5.8 Telegram Bot Integration Service
The Telegram daemon in `server/src/services/telegramBot.js` connects via long-polling, enabling pilgrims to query queue positions and receive turn alerts on mobile messaging apps without opening a web browser.

### Source Code: Telegram Bot Commands & Code Lookup (`telegramBot.js`)
```javascript
const { Bot } = require('node-telegram-bot-api');
const pool = require('../db/pool');

function initTelegramBot() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return;

  const bot = new Bot(token);

  bot.command('start', async (ctx) => {
    await ctx.reply('🙏 Welcome to DarshanQ! Send your code (e.g. DQ-7F3K2) to track status.');
  });

  bot.hears(/DQ-[A-Z0-9]+/i, async (ctx) => {
    const code = ctx.message.text.match(/DQ-[A-Z0-9]+/i)[0].toUpperCase();
    const res = await pool.query(
      `SELECT t.*, c.name AS station_name FROM queue_tokens t 
       LEFT JOIN checkpoints c ON c.id = t.current_checkpoint_id 
       WHERE t.devotee_code = $1`, [code]
    );
    if (!res.rows.length) return ctx.reply(`❌ Code '${code}' not found.`);

    const t = res.rows[0];
    await pool.query(`UPDATE queue_tokens SET telegram_chat_id = $1 WHERE id = $2`, [ctx.chatId, t.id]);

    await ctx.reply(
      `🛕 Token #${t.token_number} (${t.devotee_code})\\nStatus: ${t.status}\\nStation: ${t.station_name}\\nEst. Wait: ${t.estimated_wait_minutes} min`
    );
  });
}
```
    """
    add_page(24, "Telegram Bot Devotee Integration Service", p24_html, p24_md)

    # ----------------------------------------------------
    # PAGE 25: 5.9 FRONT-END DEVOTEE PORTAL
    # ----------------------------------------------------
    p25_html = """
    <h2 class="section-title">5.9 Front-End Devotee Portal Implementation</h2>
    <p>
      The Devotee experience is encapsulated in <code>client/src/pages/DevoteeHome.jsx</code>, featuring real-time state listeners, explainability breakdowns, and proximity audio-visual alerts.
    </p>

    <h3 class="sub-title">Reactive Token State & Socket Binding (Extract from <code>DevoteeHome.jsx</code>)</h3>
    <pre class="code-block">
export default function DevoteeHome() {
  const { user, token } = useAuth();
  const [activeToken, setActiveToken] = useState(null);
  const [approachingAlert, setApproachingAlert] = useState(null);

  // Wire up Socket.IO Realtime Sync
  useEffect(() => {
    if (!user) return;
    if (!socket.connected) socket.connect();

    socket.emit('join:user', { user_id: user.id });

    // Handle live wait-time updates pushed from server
    const handleQueueUpdate = (data) => {
      setActiveToken((prev) => {
        if (!prev || prev.id !== data.token_id) return prev;
        return {
          ...prev,
          estimated_wait_minutes: data.estimated_wait_minutes,
          tokens_ahead: data.tokens_ahead,
          scan_rate: data.scan_rate || prev.scan_rate,
        };
      });
    };

    // Handle approaching alert when devotee is next in line
    const handleApproaching = (data) => {
      if (data.user_id === user.id) {
        setApproachingAlert(data.message);
      }
    };

    socket.on('queue:update', handleQueueUpdate);
    socket.on('token:approaching', handleApproaching);

    return () => {
      socket.off('queue:update', handleQueueUpdate);
      socket.off('token:approaching', handleApproaching);
    };
  }, [user, activeToken?.id]);
    </pre>

    <h3 class="sub-title">Mathematical Explainability UI Card</h3>
    <p style="font-size: 8.5pt;">
      To maintain complete transparency, the UI renders the live mathematical derivation directly on the devotee's active pass:
      <code>Estimated Wait = Tokens Ahead in Line ({activeToken?.tokens_ahead}) ÷ Scan Rate ({activeToken?.scan_rate} / min)</code>. Devotees understand why their time fluctuates based on physical checkpoint velocity.
    </p>
    """

    p25_md = """
## 5.9 Front-End Devotee Portal Implementation
The Devotee experience is encapsulated in `client/src/pages/DevoteeHome.jsx`, featuring real-time state listeners, explainability breakdowns, and proximity audio-visual alerts.

### Reactive Token State & Socket Binding (`DevoteeHome.jsx`)
```javascript
export default function DevoteeHome() {
  const { user } = useAuth();
  const [activeToken, setActiveToken] = useState(null);
  const [approachingAlert, setApproachingAlert] = useState(null);

  useEffect(() => {
    if (!user) return;
    if (!socket.connected) socket.connect();
    socket.emit('join:user', { user_id: user.id });

    socket.on('queue:update', (data) => {
      setActiveToken((prev) => prev?.id === data.token_id ? { ...prev, ...data } : prev);
    });

    socket.on('token:approaching', (data) => {
      if (data.user_id === user.id) setApproachingAlert(data.message);
    });

    return () => {
      socket.off('queue:update');
      socket.off('token:approaching');
    };
  }, [user]);
}
```
    """
    add_page(25, "Front-End Devotee Portal Implementation", p25_html, p25_md)

    # ----------------------------------------------------
    # PAGE 26: 5.10 ZERO-SCROLL STAFF TERMINAL
    # ----------------------------------------------------
    p26_html = """
    <h2 class="section-title">5.10 Zero-Scroll Staff Terminal Implementation</h2>
    <p>
      The operational terminal for temple security personnel (<code>client/src/pages/StaffPanel.jsx</code>) is designed with a strict zero-scroll, high-contrast visual layout for rapid field execution.
    </p>

    <h3 class="sub-title">Tap-to-Scan & Continuous Rapid Mode (<code>StaffPanel.jsx</code>)</h3>
    <pre class="code-block">
const handlePassDevotee = async (checkpointId, tokenId = null) => {
  setScanning(true);
  try {
    const payload = tokenId ? { token_id: tokenId } : {};
    const res = await axios.post(
      `/api/checkpoints/${checkpointId}/scan`,
      payload,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    // Operator feedback notification
    setScanMessage({
      type: 'success',
      text: res.data.message || '✅ Devotee passed and advanced downstream.',
    });

    // Refresh audit stream
    fetchRecentScans();
  } catch (err) {
    setScanMessage({
      type: 'error',
      text: err.response?.data?.error || '❌ Scan failed at station.',
    });
  } finally {
    setScanning(false);
  }
};
    </pre>

    <h3 class="sub-title">Ergonomic Workflow Advantages</h3>
    <ul style="margin: 4px 0 8px 18px; font-size: 8.5pt; line-height: 1.45;">
      <li><strong>Interactive Visual Topology:</strong> Staff see all 7 nodes (Gates 1–3, Checkpoints 1–3, Sanctum) on a single screen without vertical scrolling.</li>
      <li><strong>Continuous Rapid Scan:</strong> Clicking any station opens an action modal. Staff can rapidly click <code>⚡ +1 Pass Next Devotee</code> multiple times in succession to clear physical surges, watching the station count decrement in real time.</li>
      <li><strong>Multimodal Devotee Verification:</strong> Supports manual input or optical barcode scanning of token IDs (e.g. <code>#4</code>) or devotee codes (e.g. <code>DQ-7F3K2</code>).</li>
    </ul>
    """

    p26_md = """
## 5.10 Zero-Scroll Staff Terminal Implementation
The operational terminal for temple security personnel (`client/src/pages/StaffPanel.jsx`) is designed with a strict zero-scroll, high-contrast visual layout for rapid field execution.

### Tap-to-Scan & Continuous Rapid Mode (`StaffPanel.jsx`)
```javascript
const handlePassDevotee = async (checkpointId, tokenId = null) => {
  setScanning(true);
  try {
    const res = await axios.post(
      `/api/checkpoints/${checkpointId}/scan`,
      tokenId ? { token_id: tokenId } : {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setScanMessage({ type: 'success', text: res.data.message });
  } catch (err) {
    setScanMessage({ type: 'error', text: err.response?.data?.error || 'Scan failed' });
  } finally {
    setScanning(false);
  }
};
```

### Ergonomic Workflow Advantages
1. **Interactive Visual Topology:** Staff see all 7 nodes on a single screen without scrolling.
2. **Continuous Rapid Scan:** Rapidly tapping `+1 Pass Next Devotee` clears surges with instantaneous feedback.
3. **Multimodal Devotee Verification:** Supports scanning token numbers or typing alphanumeric devotee codes.
    """
    add_page(26, "Zero-Scroll Staff Terminal Implementation", p26_html, p26_md)

    # ----------------------------------------------------
    # PAGE 27: 5.11 ADMIN COMMAND CENTER & INSPECTOR
    # ----------------------------------------------------
    p27_html = """
    <h2 class="section-title">5.11 Admin Command Center & Bottleneck Inspector</h2>
    <p>
      The executive administrative interface (<code>client/src/pages/AdminDashboard.jsx</code>) provides temple commissioners with bird's-eye situational awareness and deep station inspection tools.
    </p>

    <h3 class="sub-title">Executive KPIs & Real-Time Analytics Fetch (<code>AdminDashboard.jsx</code>)</h3>
    <pre class="code-block">
const fetchDashboardData = async () => {
  try {
    const [densityRes, analyticsRes] = await Promise.all([
      axios.get('/api/admin/density', { headers: { Authorization: `Bearer ${token}` } }),
      axios.get('/api/admin/analytics', { headers: { Authorization: `Bearer ${token}` } }),
    ]);
    setCheckpoints(densityRes.data.checkpoints || []);
    setAnalytics(analyticsRes.data.analytics || null);
    setLastUpdated(new Date().toLocaleTimeString());
  } catch (err) {
    console.error('Failed to load admin metrics:', err);
  }
};

useEffect(() => {
  fetchDashboardData();
  const interval = setInterval(fetchDashboardData, 8000); // Polling safety net
  return () => clearInterval(interval);
}, [token]);
    </pre>

    <h3 class="sub-title">Station Inspector & Devotee Journey Audit</h3>
    <p style="font-size: 8.5pt;">
      Clicking any station node on the map reveals an inspection drawer displaying:
    </p>
    <ul style="margin: 2px 0 8px 18px; font-size: 8.2pt; line-height: 1.4;">
      <li><strong>Queue Depth & Density Level:</strong> Visual pill indicator (🟢 LOW &lt; 4, 🟡 MODERATE 4–7, 🔴 HIGH &ge; 8).</li>
      <li><strong>Throughput Velocity:</strong> Current scanning rate in devotees per minute based on the 15-minute sliding window.</li>
      <li><strong>Devotee Code Lookup:</strong> Traces the historical traversal path of any pilgrim (e.g. checked in at Gate 2 at 10:14 AM, cleared Security at 10:28 AM, completed Darshan at 10:45 AM).</li>
    </ul>
    """

    p27_md = """
## 5.11 Admin Command Center & Bottleneck Inspector
The executive administrative interface (`client/src/pages/AdminDashboard.jsx`) provides temple commissioners with bird's-eye situational awareness and deep station inspection tools.

### Executive KPIs & Real-Time Analytics Fetch (`AdminDashboard.jsx`)
```javascript
const fetchDashboardData = async () => {
  const [densityRes, analyticsRes] = await Promise.all([
    axios.get('/api/admin/density', { headers: { Authorization: `Bearer ${token}` } }),
    axios.get('/api/admin/analytics', { headers: { Authorization: `Bearer ${token}` } }),
  ]);
  setCheckpoints(densityRes.data.checkpoints || []);
  setAnalytics(analyticsRes.data.analytics || null);
  setLastUpdated(new Date().toLocaleTimeString());
};
```

### Station Inspector & Devotee Journey Audit
Clicking any node opens an inspector drawer showing:
1. **Queue Depth & Density Level:** 🟢 LOW (<4), 🟡 MODERATE (4–7), 🔴 HIGH (>=8).
2. **Throughput Velocity:** Real-time scans per minute based on the 15-minute sliding window.
3. **Devotee Code Lookup:** Traces historical traversal timestamps across all checkpoints.
    """
    add_page(27, "Admin Command Center & Bottleneck Inspector", p27_html, p27_md)

    # ----------------------------------------------------
    # PAGE 28: 5.12 INTERACTIVE SVG TEMPLE FLOW MAP
    # ----------------------------------------------------
    p28_html = """
    <h2 class="section-title">5.12 Interactive SVG Temple Flow Map Component</h2>
    <p>
      The spatial representation of the temple is rendered via <code>client/src/components/TempleFlowMap.jsx</code>, translating raw relational checkpoint rows into an interactive topological flow map.
    </p>

    <h3 class="sub-title">Dynamic Density Glow & Node Rendering (<code>TempleFlowMap.jsx</code>)</h3>
    <pre class="code-block">
const getDensityInfo = (level) => {
  switch (level) {
    case 'high':
      return { color: '#f43f5e', bg: 'rgba(244, 63, 94, 0.15)', border: '#f43f5e', text: 'HIGH' };
    case 'medium':
      return { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)', border: '#f59e0b', text: 'MODERATE' };
    default:
      return { color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)', border: '#10b981', text: 'LOW' };
  }
};

export default function TempleFlowMap({ checkpoints, selectedCheckpointId, onSelectCheckpoint, activeTokenCheckpointId }) {
  const gates = checkpoints.filter((cp) => cp.checkpoint_type === 'gate' || cp.sequence_order === 1);
  const cps = checkpoints.filter((cp) => cp.checkpoint_type === 'checkpoint' || cp.sequence_order === 2);
  const sanctum = checkpoints.find((cp) => cp.checkpoint_type === 'sanctum' || cp.sequence_order === 3);

  return (
    <div className="temple-flow-map-container">
      {/* Level 1: Ingress Gates */}
      <div className="flow-level-row">{gates.map(renderNode)}</div>
      <div className="flow-connectors">▼ &nbsp; ▼ &nbsp; ▼</div>
      {/* Level 2: Security Checkpoints */}
      <div className="flow-level-row">{cps.map(renderNode)}</div>
      <div className="flow-connectors">└───┬───┘<br>▼</div>
      {/* Level 3: Sanctum Sanctorum */}
      <div className="flow-level-row">{renderNode(sanctum)}</div>
    </div>
  );
}
    </pre>
    """

    p28_md = """
## 5.12 Interactive SVG Temple Flow Map Component
The spatial representation of the temple is rendered via `client/src/components/TempleFlowMap.jsx`, translating raw relational checkpoint rows into an interactive topological flow map.

### Dynamic Density Glow & Node Rendering (`TempleFlowMap.jsx`)
```javascript
const getDensityInfo = (level) => {
  switch (level) {
    case 'high':   return { color: '#f43f5e', border: '#f43f5e', text: 'HIGH' };
    case 'medium': return { color: '#f59e0b', border: '#f59e0b', text: 'MODERATE' };
    default:       return { color: '#10b981', border: '#10b981', text: 'LOW' };
  }
};
```
    """
    add_page(28, "Interactive SVG Temple Flow Map Component", p28_html, p28_md)
