-- DarshanQ Database Schema
-- Run this in Supabase SQL Editor (or via psql) before starting the server.

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(20) UNIQUE NOT NULL,
  email VARCHAR(150) UNIQUE,
  password_hash TEXT NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('devotee','staff','admin')),
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS temples (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(150) NOT NULL,
  location VARCHAR(200)
);

CREATE TABLE IF NOT EXISTS checkpoints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  temple_id UUID REFERENCES temples(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,          -- e.g. "Gate 1", "Checkpoint 2", "Sanctum"
  sequence_order INT NOT NULL          -- order along the queue, 1 = first
);

CREATE TABLE IF NOT EXISTS queue_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,  -- nullable for walk-in devotees
  temple_id UUID REFERENCES temples(id) ON DELETE CASCADE,
  token_number INT NOT NULL,
  devotee_code VARCHAR(10) UNIQUE NOT NULL,
  devotee_name VARCHAR(100),
  devotee_phone VARCHAR(20),
  gate_checkin_time TIMESTAMPTZ NULL,
  telegram_chat_id VARCHAR(50) NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'waiting'
    CHECK (status IN ('waiting','notified','checked_in','completed','cancelled')),
  booked_at TIMESTAMPTZ DEFAULT now(),
  estimated_wait_minutes INT,
  current_checkpoint_id UUID REFERENCES checkpoints(id)
);

CREATE TABLE IF NOT EXISTS checkpoint_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  checkpoint_id UUID REFERENCES checkpoints(id) ON DELETE CASCADE,
  token_id UUID REFERENCES queue_tokens(id) ON DELETE SET NULL,
  scanned_by UUID REFERENCES users(id) ON DELETE SET NULL,   -- staff member who logged it
  scanned_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS crowd_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  checkpoint_id UUID REFERENCES checkpoints(id) ON DELETE CASCADE,
  density_level VARCHAR(10) NOT NULL CHECK (density_level IN ('low','medium','high')),
  people_count INT NOT NULL,
  recorded_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  token_id UUID REFERENCES queue_tokens(id) ON DELETE SET NULL,
  message TEXT NOT NULL,
  type VARCHAR(20) CHECK (type IN ('wait_update','approaching','crowd_alert')),
  sent_at TIMESTAMP DEFAULT now()
);
