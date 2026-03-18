-- Newsletter Subscribers Table
-- Run this in your Supabase SQL Editor to set up the database

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster email lookups
CREATE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter_subscribers(email);

-- Enable Row Level Security
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Policy: Allow service role to insert subscribers
CREATE POLICY "Service role can insert subscribers"
  ON newsletter_subscribers
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Policy: Allow service role to read subscribers
CREATE POLICY "Service role can read subscribers"
  ON newsletter_subscribers
  FOR SELECT
  TO service_role
  USING (true);

-- Policy: Allow service role to update subscribers
CREATE POLICY "Service role can update subscribers"
  ON newsletter_subscribers
  FOR UPDATE
  TO service_role
  USING (true);
