# 🛕 DarshanQ — Implementation Progress & Roadmap

> **Project:** Smart Temple Queue & Crowd Management System (Full Stack Development Prototype)  
> **Status Report Date:** October 2026  
> **Repository:** `d:\Projects\DarshanQ`  
> **Tech Stack:** Node.js, Express, PostgreSQL (Supabase), Socket.IO, React, Vite  

---

## 📌 Executive Summary

DarshanQ is an end-to-end intelligent queue and crowd management platform designed to replace chaotic physical queues at major pilgrimage temples with virtual tokens, real-time wait-time prediction, staff checkpoint scanning, and visual crowd density monitoring.

We have successfully transitioned the project from initial blueprint to a **fully functional, real-time full-stack system** connected to a live hosted Supabase PostgreSQL database.

---

## 🚀 1. What Has Been Implemented So Far

### ✅ Phase 1: Core Foundation & Database Infrastructure
- **Hosted Database:** Connected to a cloud **Supabase PostgreSQL** instance with secure SSL configuration (`ssl: { rejectUnauthorized: false }`).
- **Database Schema (`schema.sql`):** Created tables for `users`, `temples`, `checkpoints`, `queue_tokens`, `checkpoint_logs`, `crowd_snapshots`, and `notifications`.
- **Authentication & RBAC:**
  - Secure registration and login (`/api/auth/register`, `/api/auth/login`).
  - Passwords hashed with `bcryptjs`.
  - Stateless JWT token issuance (7-day validity).
  - Role-based route protection (`devotee`, `staff`, `admin`) on both Express backend and React client.
- **Glassmorphic Sacred Theme Design System:** Built with modern CSS variables, responsive typography, glowing indicators, and interactive micro-animations.
- **1-Click Demo Login:** Evaluator-friendly demo pills on the login page for instantaneous 1-click access to Admin, Staff, and Devotee portals.

---

### ✅ Phase 2: Directed Temple Topology (3 Gates ➔ 3 Checkpoints ➔ 1 Sanctum)
- **Eliminated Duplicate Entries:** Consolidated data into one canonical temple (`Sri Venkateswara Temple`) and removed duplicated checkpoint entries.
- **Hierarchical Graph Structure:**
  ```
  LEVEL 1 (Entry Gates)      [ Gate 1 ]       [ Gate 2 ]       [ Gate 3 ]
                                 │                │                │
                                 ▼                ▼                ▼
  LEVEL 2 (Security Checkpoints) [ CP 1 ]         [ CP 2 ]         [ CP 3 ]
                                 │                │                │
                                 └──────────────┬─┴────────────────┘
                                                ▼
  LEVEL 3 (Final Destination)              [ Sanctum ]
                                    (1 Holy Inner Sanctum)
  ```
- **Topological Schema Extensions:** Added `checkpoint_type` (`'gate'`, `'checkpoint'`, `'sanctum'`), `lane` (`1`, `2`, `3`, `0`), and `next_checkpoint_id` foreign keys to model direct line-of-progression routing.
- **Automated Progression Logic:**
  - `Gate 1` ➔ advances to `Checkpoint 1`
  - `Gate 2` ➔ advances to `Checkpoint 2`
  - `Gate 3` ➔ advances to `Checkpoint 3`
  - `Checkpoint 1 / 2 / 3` ➔ converges into `Sanctum`
  - `Sanctum` ➔ completes Darshan (`status = 'completed'`).

---

### ✅ Phase 3: Queue Intelligence & Wait-Time Engine (`waitTimeEngine.js`)
- **Explainable Math Formula:**
  $$\text{Estimated Wait (mins)} = \frac{\text{Tokens Ahead in Line}}{\max(\text{Scan Rate}, 0.1)}$$
- **Dynamic Scan Velocity:** Calculated rolling scan rate from real scans logged in `checkpoint_logs` over a 15-minute sliding window.
- **Density Thresholds:**
  - 🟢 **Low Density:** `< 4` devotees waiting (free flow)
  - 🟡 **Moderate Queue:** `4 – 7` devotees waiting (steady flow)
  - 🔴 **High Congestion:** `8+` devotees waiting (bottleneck alert)
- **Full Recomputation:** Automatically recalculates wait times across all remaining tokens whenever a scan or cancellation occurs.

---

### ✅ Phase 4: Virtual Token Booking & Devotee Portal (`DevoteeHome.jsx`)
- **Virtual Darshan Pass:** Devotees can book virtual tokens with zero physical standing.
- **Smart Gate Assignment:** Devotees can select their entrance (`Gate 1`, `Gate 2`, `Gate 3`) or choose **⚡ Auto-balance** to automatically join the gate with the shortest queue.
- **Explainability Card:** Explains the wait-time formula live (`Wait = Tokens Ahead ÷ Scan Rate`).
- **Route Tracker:** Displays the exact journey (`Gate ➔ Checkpoint ➔ Sanctum`).
- **Approaching Gate Alert:** Prominent audio-visual alert banner triggers automatically when `tokens_ahead <= 2`.
- **Integrated Live Map:** Toggleable view of the Temple Flow Map highlighting the devotee's current location (`📍 YOU ARE HERE`).
- **Token Cancellation:** Option to cancel an active token with immediate queue rebalancing.

---

### ✅ Phase 5: Zero-Scroll Staff Terminal (`StaffPanel.jsx`)
- **Interactive Full-Width Map:** Replaced cramped layouts with a clean, spacious, zero-scroll visual map.
- **Tap-to-Scan Flow:** Clicking any Gate, Checkpoint, or Sanctum directly on the map opens an interactive **Scan Action Modal**.
- **Continuous Scan Mode:** Staff can rapidly tap `+1 Pass Next Devotee` without closing the window, watching live queue counts decrease in real time.
- **Instant Destination Feedback:** Informs the operator where the devotee moved (e.g., `✅ Token #4 verified ➔ Advanced to Checkpoint 1`).
- **Manual Barcode/Token ID Input:** Allows searching and passing specific devotee tokens with keyboard `Enter` support.
- **Audit Stream:** Displays a chronological log of the latest scans.

---

### ✅ Phase 6: Streamlined Admin Command Center (`AdminDashboard.jsx`)
- **Focused Map Flow View:** Removed redundant card views to keep the interactive flow map as the primary situational awareness tool.
- **Executive KPI Overview:** Displays real-time temple-wide metrics:
  - *Active Devotees in Queue*
  - *Average Queue Wait Time*
  - *Completed Darshans Today*
  - *Total Checkpoint Scans Today*
- **Station Detail Inspector:** Clicking any node on the map opens an inspection drawer showing queue depth, scan velocity, and bottleneck risk assessment.

---

### ✅ Phase 7: Bi-Directional Realtime Socket.IO Layer
- **Room Subscriptions:** Clients join `temple:<id>` and `user:<id>`.
- **`queue:update`:** Pushes wait-time drops to devotee screens live with **zero page refresh**.
- **`density:update`:** Broadcasts checkpoint queue changes to all staff and admin dashboards simultaneously.
- **`token:approaching`:** Real-time push alert when a devotee is next in line.

---

## 📋 Summary of Implemented Endpoints & Events

### REST API
| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register new user account |
| `POST` | `/api/auth/login` | Public | Authenticate user & issue JWT |
| `GET` | `/api/health` | Public | Health check verifying Supabase connectivity |
| `GET` | `/api/tokens/active` | Devotee | Fetch devotee's current active token |
| `POST` | `/api/tokens` | Devotee | Book virtual token with gate selection |
| `GET` | `/api/tokens/:id` | Devotee/Staff | Retrieve specific token details & wait breakdown |
| `PATCH` | `/api/tokens/:id/cancel` | Devotee | Cancel token and recompute queue |
| `GET` | `/api/checkpoints` | Staff/Admin | List all checkpoints with live density & queue counts |
| `GET` | `/api/checkpoints/:id/status` | Staff/Admin | Fetch individual checkpoint status |
| `POST` | `/api/checkpoints/:id/scan` | Staff/Admin | Scan/advance devotee along the topology |
| `GET` | `/api/admin/density` | Admin | Fetch full topology density metrics |
| `GET` | `/api/admin/analytics` | Admin | Fetch temple-wide daily summary analytics |

### Socket.IO Events
| Event Name | Direction | Payload Details |
|---|---|---|
| `join:temple` | Client ➔ Server | `{ temple_id }` |
| `join:user` | Client ➔ Server | `{ user_id }` |
| `queue:update` | Server ➔ Client | `{ token_id, token_number, estimated_wait_minutes, tokens_ahead, scan_rate }` |
| `token:approaching` | Server ➔ Client | `{ token_id, user_id, message }` |
| `density:update` | Server ➔ Client | `{ checkpoint_id, density_level, people_waiting, scan_rate }` |

---

## 🔮 2. What Is Remaining / Next Steps

Here is the prioritized roadmap for completing any remaining items and preparing for final presentation/review:

### 🟡 Priority 1: Crowd Rush Simulator (Demo Tool)
- **Problem:** In a live demo, waiting for someone to manually click 20 times to simulate high congestion can feel slow.
- **Solution:** Add a lightweight "Demo Traffic Generator" widget (visible in Admin or Staff panel during demo mode):
  - `[ +5 Devotees Rush ]` button: Instantly injects 5 tokens into Gate 1 or Gate 2 to demonstrate density indicators shifting from 🟢 Low to 🔴 High.
  - `[ Auto-Scan Mode ]`: Toggle automatic scanning every 2 seconds to showcase live countdowns on the devotee screen during presentations.

---

### 🟡 Priority 2: In-App Sound / Audio Chime for Approaching Alert
- **Goal:** When `token:approaching` fires and `tokens_ahead <= 2`, play a soft temple bell chime (`chime.mp3`) alongside the yellow/red flashing alert banner.
- **Value:** Demonstrates multi-sensory notification capability for devotees waiting outside in temple courtyards.

---

### 🟡 Priority 3: Emergency Gate Diversion (Admin Action)
- **Goal:** Allow the Admin to click a button on the Station Inspector: `[ Divert New Arrivals ]` or `[ Pause Gate ]`.
- **Behavior:**
  - Temporarily marks a congested gate as closed.
  - Automatically redirects all incoming token bookings to alternative open gates.
- **Value:** Directly showcases proactive crowd management before physical stampedes occur.

---

### 🟢 Priority 4: Hourly Throughput Analytics Chart (Admin)
- **Goal:** Add a historical bar or line chart on the Admin page showing hourly arrivals vs. hourly completed Darshans (e.g. 6 AM to 9 PM).
- **Implementation:** Query `checkpoint_logs` grouped by `DATE_TRUNC('hour', scanned_at)` and render with a lightweight SVG or chart library.

---

### 🟢 Priority 5: Time-Slot Reservation (Future Iteration)
- **Goal:** Allow devotees to reserve tokens for specific 1-hour time windows (e.g., *9:00 AM – 10:00 AM* or *4:00 PM – 5:00 PM*).
- **Scope Note:** Documented in the blueprint as a known simplification for this prototype; can be noted during review as the next architectural milestone.

---

## 🎬 3. Recommended Demo Script (For Project Review)

1. **Step 1: Admin Overview**
   - Open [http://localhost:5173/login](http://localhost:5173/login) and click **👑 Admin Portal** (1-click login).
   - Show the **Temple Flow Map**: Point out the 3 Gates converging into the 3 Security Checkpoints and channeling into the single **Sanctum**.
   - Show the live density pills (🟢 Low / 🟡 Moderate / 🔴 High).

2. **Step 2: Devotee Token Booking**
   - Open an incognito window or second browser tab, log in as **🙏 Devotee**.
   - Show booking a token: Select `Gate 2` (or Auto-balance) and click **⚡ Get Virtual Token Now**.
   - Show the active pass: Token number, route (`Gate 2 ➔ Checkpoint 2 ➔ Sanctum`), and the mathematical explainability breakdown.

3. **Step 3: Staff Scan & Real-Time Sync**
   - In a third tab, log in as **🛡️ Staff Gate Panel**.
   - Click on **Gate 2** on the map to open the scan modal.
   - Click **`⚡ +1 Pass Next Devotee`**.
   - Switch back to the Devotee tab: **Watch the wait time drop and the route advance live with zero page refresh!**

4. **Step 4: Convergence into Sanctum**
   - Progress the token through Checkpoint 2, then into Sanctum.
   - Scan at Sanctum: The devotee pass transitions to `COMPLETED` and the admin's *Completed Darshans* counter increments in real time.
