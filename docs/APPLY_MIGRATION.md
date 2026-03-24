# Apply Reactions Migration to Supabase

## Quick Start

Since the newsletter migration already exists in production, we need to apply only the reactions migration manually.

### Steps:

1. **Go to your Supabase Dashboard:**
   - Navigate to: https://supabase.com/dashboard/project/fjomyioxaltrujrouhir
   - Click on **SQL Editor** in the left sidebar

2. **Create a new query:**
   - Click **New Query**

3. **Copy and paste this SQL:**

```sql
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
```

4. **Run the query:**
   - Click **Run** or press `Ctrl+Enter` (Windows/Linux) / `Cmd+Enter` (Mac)

5. **Verify success:**
   - You should see "Success. No rows returned" or similar
   - Check the **Table Editor** to see the new `article_reactions` table

---

## Verification Queries

After applying the migration, run these queries to verify everything is set up correctly:

### Check table exists:
```sql
SELECT * FROM article_reactions LIMIT 1;
```

### Check functions exist:
```sql
SELECT proname FROM pg_proc WHERE proname IN ('get_reaction_counts', 'can_react');
```

### Check indexes:
```sql
SELECT indexname FROM pg_indexes WHERE tablename = 'article_reactions';
```

### Test get_reaction_counts function:
```sql
SELECT * FROM get_reaction_counts('test-slug');
```

### Test can_react function:
```sql
SELECT can_react('test-slug', 'test-ip-hash');
```

---

## Next Steps After Migration

1. ✅ Migration applied
2. 🚀 Deploy updated code to production (the API route is already updated in the codebase)
3. 🧪 Test reactions on a live article
4. 📊 Monitor logs for any errors
5. 🗑️ Remove Redis dependencies once stable

---

## Troubleshooting

**If you get "relation already exists":**
- This is fine, it means the table was already created
- The `IF NOT EXISTS` clauses will skip existing objects

**If you get permission errors:**
- Make sure you're logged in to the correct Supabase project
- Verify you have admin access to the database

**If functions fail to create:**
- Check the SQL Editor for syntax errors
- Ensure you're running the entire script, not just parts of it
