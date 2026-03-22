-- Create gallery_submissions table for community art submissions
CREATE TABLE IF NOT EXISTS gallery_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  artist_name TEXT NOT NULL,
  artist_url TEXT,
  piece_type TEXT NOT NULL CHECK (piece_type IN ('image', 'video')),
  image_url TEXT,
  video_url TEXT,
  description TEXT,
  submitter_email TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_submissions_status ON gallery_submissions(status);
CREATE INDEX IF NOT EXISTS idx_submissions_created ON gallery_submissions(created_at);

-- Enable Row Level Security
ALTER TABLE gallery_submissions ENABLE ROW LEVEL SECURITY;

-- Policy: Service role can do everything (admin review)
CREATE POLICY "Service role has full access"
  ON gallery_submissions
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Policy: Anon users can insert submissions only
CREATE POLICY "Anyone can submit"
  ON gallery_submissions
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- No SELECT/UPDATE/DELETE for anon — submissions are reviewed by admin via service role
