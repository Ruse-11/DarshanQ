# DarshanQ — Implementation Plan

Smart temple queue & crowd management system — Full Stack Development prototype.

## 1. Problem & goal

Devotees experience long waiting times due to unplanned crowd management and lack of
real-time queue information. DarshanQ fixes this by instrumenting the queue itself:
staff log checkpoint scans, a rule-based engine turns that into live wait-time estimates,
devotees book virtual tokens instead of standing physically, and admins see live crowd
density so they can act before a crowd becomes dangerous.

This is a prototype for an academic FSD review. There is no real IoT/camera hardware —
checkpoint scans are simulated through a staff UI (tap "scan" / "+1" per token or per
checkpoint). This is intentional and should be explained as such, not hidden.

## 2. Tech stack

| Layer | Choice |
|---|---|
| Frontend | React + Vite + Tailwind CSS |
| Backend | Node.js + Express |
| Database | PostgreSQL |
| Realtime | Socket.IO |
| Auth | JWT, bcrypt for password hashing |
| Roles | `devotee`, `staff`, `admin` |

If the agent building this prefers MongoDB over PostgreSQL, that's an acceptable
substitution — keep the same field names and relationships described below, just as
documents instead of tables.

## 3. Architecture

```
React client (devotee / staff / admin UI)
        |
        v
Node.js + Express server
  ├── REST API        (booking, auth, CRUD)
  └── Socket.IO layer (live queue + density updates)
        |
        v
PostgreSQL (+ optional Redis for live counters/cache)
```

One server process. Two responsibilities inside it: normal REST endpoints for
booking/auth/CRUD, and a Socket.IO layer that pushes live updates whenever a checkpoint
scan changes the queue state. Both read and write the same database.

## 4. Database schema

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(20) UNIQUE NOT NULL,
  email VARCHAR(150) UNIQUE,
  password_hash TEXT NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('devotee','staff','admin')),
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE temples (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(150) NOT NULL,
  location VARCHAR(200)
);

CREATE TABLE checkpoints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  temple_id UUID REFERENCES temples(id),
  name VARCHAR(100) NOT NULL,          -- e.g. "Gate 1", "Checkpoint 2", "Sanctum"
  sequence_order INT NOT NULL          -- order along the queue, 1 = first
);

CREATE TABLE queue_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  temple_id UUID REFERENCES temples(id),
  token_number INT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'waiting'
    CHECK (status IN ('waiting','notified','checked_in','completed','cancelled')),
  booked_at TIMESTAMP DEFAULT now(),
  estimated_wait_minutes INT,
  current_checkpoint_id UUID REFERENCES checkpoints(id)
);

CREATE TABLE checkpoint_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  checkpoint_id UUID REFERENCES checkpoints(id),
  token_id UUID REFERENCES queue_tokens(id),
  scanned_by UUID REFERENCES users(id),   -- staff member who logged it
  scanned_at TIMESTAMP DEFAULT now()
);

CREATE TABLE crowd_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  checkpoint_id UUID REFERENCES checkpoints(id),
  density_level VARCHAR(10) NOT NULL CHECK (density_level IN ('low','medium','high')),
  people_count INT NOT NULL,
  recorded_at TIMESTAMP DEFAULT now()
);

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  token_id UUID REFERENCES queue_tokens(id),
  message TEXT NOT NULL,
  type VARCHAR(20) CHECK (type IN ('wait_update','approaching','crowd_alert')),
  sent_at TIMESTAMP DEFAULT now()
);
```

`checkpoint_logs` is the raw data source. Everything else (wait-time estimates, density
levels) is derived from it.

## 5. Wait-time & density logic

This is the "Queue Intelligence" module. Keep it in one isolated file
(`server/src/services/waitTimeEngine.js`) — it's the single most important piece to show
a reviewer, so it should be easy to point to and explain in isolation.

**Wait-time formula (rule-based, explainable):**

```
scan_rate = count(checkpoint_logs in last N minutes at this checkpoint) / N
tokens_ahead = count(queue_tokens where status='waiting'
                      and token_number < this_token.token_number
                      and temple_id = this.temple_id)
estimated_wait_minutes = tokens_ahead / max(scan_rate, 0.1)   -- avoid divide-by-zero
```

**Density level (per checkpoint):**

```
people_waiting = count(queue_tokens where status in ('waiting','notified')
                        and current_checkpoint_id = this_checkpoint.id)

density_level =
  'low'    if people_waiting < 15
  'medium' if 15 <= people_waiting < 35
  'high'   if people_waiting >= 35
```

These thresholds are placeholders — tune them once you have believable seed/demo data.
Every estimate should be explainable: when returning a wait-time estimate, also return
the raw inputs (`tokens_ahead`, `scan_rate`) so the UI can show "why" (this matches the
"Explainability" point from the presentation).

## 6. REST API

Base path: `/api`

```
POST   /auth/register          { name, phone, password, role }  → 201 { user, token }
POST   /auth/login             { phone, password }               → 200 { user, token }

POST   /tokens                 (devotee, auth required)
                                { temple_id }
                                → 201 { token_number, estimated_wait_minutes }

GET    /tokens/:id             → 200 { status, token_number, estimated_wait_minutes,
                                        tokens_ahead, current_checkpoint }

PATCH  /tokens/:id/cancel      → 200 { status: 'cancelled' }

POST   /checkpoints/:id/scan   (staff, auth required)
                                { token_id }  -- optional; omit for a generic "+1" tap
                                → 201 { checkpoint_id, scanned_at }
                                side effect: recalculates wait times for affected tokens,
                                emits `queue:update` over Socket.IO

GET    /checkpoints/:id/status → 200 { people_waiting, density_level, scan_rate }

GET    /admin/density          → 200 [ { checkpoint_id, name, density_level,
                                          people_waiting } , ... ]

GET    /admin/analytics        → 200 { tokens_booked_today, tokens_completed_today,
                                        avg_wait_minutes }
```

All endpoints except `/auth/*` require `Authorization: Bearer <jwt>`. Role-check
middleware: `devotee` can only act on their own tokens; `staff`/`admin` required for
`/checkpoints/*/scan` and `/admin/*`.

## 7. Socket.IO events

```
Client → Server
  join:temple        { temple_id }       -- client joins a room per temple on connect

Server → Client
  queue:update        { token_id, estimated_wait_minutes, tokens_ahead }
                       -- sent to the specific devotee whose estimate changed
  token:approaching   { token_id, message: "You're next — head to the gate" }
                       -- sent when tokens_ahead drops below ~3
  density:update       { checkpoint_id, density_level, people_waiting }
                       -- broadcast to the temple's `admin` room whenever density changes
```

Server-side: after every `POST /checkpoints/:id/scan`, recompute affected tokens' wait
times and checkpoint density, then emit the relevant events. Keep this logic in the same
`waitTimeEngine.js` service so the REST handler and the socket handler both call it
rather than duplicating the math.

## 8. Folder structure

```
darshanq/
├── server/
│   ├── src/
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── tokens.js
│   │   │   ├── checkpoints.js
│   │   │   └── admin.js
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Temple.js
│   │   │   ├── Checkpoint.js
│   │   │   ├── QueueToken.js
│   │   │   └── CheckpointLog.js
│   │   ├── services/
│   │   │   └── waitTimeEngine.js
│   │   ├── sockets/
│   │   │   └── queueEvents.js
│   │   ├── middleware/
│   │   │   └── auth.js            -- JWT verify + role check
│   │   ├── db/
│   │   │   ├── schema.sql
│   │   │   └── seed.js
│   │   └── index.js
│   ├── .env.example
│   └── package.json
├── client/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── DevoteeHome.jsx    -- book token, see live wait time
│   │   │   ├── StaffPanel.jsx     -- scan buttons per checkpoint
│   │   │   └── AdminDashboard.jsx -- density cards, analytics
│   │   ├── components/
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── lib/
│   │   │   └── socket.js          -- Socket.IO client singleton
│   │   └── App.jsx
│   ├── .env.example
│   └── package.json
└── README.md
```

## 9. Database hosting

Use a hosted PostgreSQL instance, not a local database — it survives machine changes,
stays demoable without your laptop running, and lets teammates/guide see live data.

**Recommended: [Supabase](https://supabase.com)** — free forever, no card required,
500MB storage, includes a web dashboard to browse tables (useful during review).
**Alternative: [Neon](https://neon.tech)** — also permanent/free, serverless Postgres,
can take ~350ms to wake on the first query after idling.
**Avoid:** Railway (no permanent free tier, trial credit only) and Render's free tier
(database auto-deletes after 30 days).

Setup:
1. Create a project at supabase.com, save the database password.
2. Settings → Database → Connection string → copy the URI format.
3. Put that URI in `DATABASE_URL` below.
4. Hosted Postgres requires SSL — pass `{ ssl: { rejectUnauthorized: false } }` in the
   `pg` Pool/Client config, or the connection will fail.
5. Run `schema.sql` via the Supabase SQL editor, or `psql "<connection string>" -f server/src/db/schema.sql`.
6. Run `seed.js` as normal — it now writes to the hosted database.

## 10. Environment variables

```
# server/.env
DATABASE_URL=postgresql://postgres:<password>@db.xxxx.supabase.co:5432/postgres
JWT_SECRET=replace_with_a_long_random_string
PORT=4000
CLIENT_ORIGIN=http://localhost:5173

# client/.env
VITE_API_URL=http://localhost:4000/api
VITE_SOCKET_URL=http://localhost:4000
```

## 11. Seed data (for demo)

`server/src/db/seed.js` should create:
- 1 temple ("Sri Venkateswara Temple" or similar)
- 3 checkpoints in sequence order (e.g. "Gate 1", "Checkpoint 2", "Sanctum")
- 1 admin user, 2 staff users, 3–4 devotee users
- A handful of `queue_tokens` already in `waiting` status with realistic `token_number`
  sequencing, so the dashboard isn't empty on first load

## 12. Build order

1. **Foundation** — repo scaffold, Express skeleton, Postgres connection + schema
   migration, JWT auth (register/login), React app shell with role-based routing.
2. **Token booking** — `POST /tokens`, `GET /tokens/:id`, devotee UI showing token
   number and a static wait estimate.
3. **Checkpoint simulation + wait-time engine** — staff scan UI, `waitTimeEngine.js`,
   confirm wait time updates correctly when scans happen (test via UI or Postman first).
4. **Realtime layer** — wire Socket.IO both directions, confirm the devotee screen
   updates live with no refresh when staff scans. Prioritize this — it is the main demo
   moment.
5. **Admin dashboard** — density cards per checkpoint (color-coded low/medium/high),
   basic analytics endpoint and UI.
6. **Polish** — in-app notification banner for `token:approaching`, empty/error states,
   seed script, light styling pass.

## 13. Demo script (for review)

1. Devotee logs in, books a token → sees "Token #12, ~8 min wait."
2. Open staff view in a second tab, tap "scan" a few times.
3. Switch back to devotee tab — wait time drops live, no refresh.
4. Open admin dashboard — density indicator moves from green to yellow as scans continue.
5. Explain: "This is the rule-based wait-time engine, running live, from checkpoint
   scans to both the devotee's screen and the admin's dashboard."

## 14. Known simplifications (state these up front, don't hide them)

- Checkpoint scans are simulated by staff taps, not real sensors/cameras.
- Wait-time prediction is rule-based, not ML — chosen deliberately for explainability.
- No payment gateway, no biometric verification, no multi-temple rollout — out of scope
  for this prototype (see Scope slide).
- Token issuance rate-limiting per time slot is a known gap to address in a later
  iteration — without it, tokens could still bunch arrivals near a popular slot.
