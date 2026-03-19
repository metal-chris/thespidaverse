-- Create article_reactions table for persistent reaction storage
CREATE TABLE IF NOT EXISTS article_reactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  article_slug TEXT NOT NULL,
  reaction_type TEXT NOT NULL CHECK (reaction_type IN ('fire', 'love', 'mindblown', 'cool', 'trash')),
  ip_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Prevent duplicate reactions from same IP for same article/type within time window
  -- We'll handle time-based deduplication in the application layer
  CONSTRAINT unique_reaction_per_ip UNIQUE(article_slug, ip_hash, reaction_type)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_reactions_slug ON article_reactions(article_slug);
CREATE INDEX IF NOT EXISTS idx_reactions_created ON article_reactions(created_at);
CREATE INDEX IF NOT EXISTS idx_reactions_ip_created ON article_reactions(ip_hash, created_at);

-- Enable Row Level Security
ALTER TABLE article_reactions ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anyone to read reaction counts (aggregated data)
CREATE POLICY "Anyone can read reactions"
  ON article_reactions
  FOR SELECT
  USING (true);

-- Policy: Allow service role to insert reactions
CREATE POLICY "Service role can insert reactions"
  ON article_reactions
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Policy: Allow service role to delete old reactions (for cleanup)
CREATE POLICY "Service role can delete reactions"
  ON article_reactions
  FOR DELETE
  TO service_role
  USING (true);

-- Function to get reaction counts for an article
CREATE OR REPLACE FUNCTION get_reaction_counts(slug TEXT)
RETURNS TABLE(reaction_type TEXT, count BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.reaction_type,
    COUNT(*) as count
  FROM article_reactions r
  WHERE r.article_slug = slug
  GROUP BY r.reaction_type;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to check if IP can react (rate limiting)
-- Returns true if IP hasn't reacted to this article in the last 60 seconds
CREATE OR REPLACE FUNCTION can_react(slug TEXT, ip TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1 
    FROM article_reactions 
    WHERE article_slug = slug 
      AND ip_hash = ip 
      AND created_at > NOW() - INTERVAL '60 seconds'
  );
END;
$$ LANGUAGE plpgsql STABLE;
