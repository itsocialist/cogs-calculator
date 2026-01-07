-- Rolos Kitchen COGS Calculator Schema
-- Run this in the Supabase SQL Editor

-- Recipes table (JSONB for flexibility)
CREATE TABLE IF NOT EXISTS cogs_recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id VARCHAR(255) UNIQUE NOT NULL,
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Snapshots table
CREATE TABLE IF NOT EXISTS cogs_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id VARCHAR(255) UNIQUE NOT NULL,
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User config table  
CREATE TABLE IF NOT EXISTS cogs_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id VARCHAR(255) UNIQUE NOT NULL,
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notes table
CREATE TABLE IF NOT EXISTS cogs_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id VARCHAR(255) UNIQUE NOT NULL,
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE cogs_recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE cogs_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE cogs_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE cogs_notes ENABLE ROW LEVEL SECURITY;

-- Allow public read/write (password gate provides access control)
CREATE POLICY "Allow all access" ON cogs_recipes FOR ALL USING (true);
CREATE POLICY "Allow all access" ON cogs_snapshots FOR ALL USING (true);
CREATE POLICY "Allow all access" ON cogs_config FOR ALL USING (true);
CREATE POLICY "Allow all access" ON cogs_notes FOR ALL USING (true);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_recipes_session ON cogs_recipes(session_id);
CREATE INDEX IF NOT EXISTS idx_snapshots_session ON cogs_snapshots(session_id);
CREATE INDEX IF NOT EXISTS idx_config_session ON cogs_config(session_id);
CREATE INDEX IF NOT EXISTS idx_notes_session ON cogs_notes(session_id);
