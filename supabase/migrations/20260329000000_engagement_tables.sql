-- Engagement system: Community Web Ratings + Poll Responses

-- ══════════════════════════════════════════════════════════
-- Table: web_ratings
-- ══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS web_ratings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  article_slug TEXT NOT NULL,
  score INTEGER NOT NULL CHECK (score >= 1 AND score <= 100),
  ip_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT unique_web_rating_per_ip UNIQUE(article_slug, ip_hash)
);

CREATE INDEX IF NOT EXISTS idx_web_ratings_slug ON web_ratings(article_slug);
CREATE INDEX IF NOT EXISTS idx_web_ratings_created ON web_ratings(created_at);

ALTER TABLE web_ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read web ratings"
  ON web_ratings FOR SELECT USING (true);

CREATE POLICY "Service role can insert web ratings"
  ON web_ratings FOR INSERT TO service_role WITH CHECK (true);

-- ══════════════════════════════════════════════════════════
-- Table: poll_responses
-- ══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS poll_responses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  article_slug TEXT NOT NULL,
  question_key TEXT NOT NULL,
  answer TEXT NOT NULL,
  ip_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT unique_poll_response_per_ip UNIQUE(article_slug, question_key, ip_hash)
);

CREATE INDEX IF NOT EXISTS idx_poll_responses_slug ON poll_responses(article_slug);
CREATE INDEX IF NOT EXISTS idx_poll_responses_created ON poll_responses(created_at);

ALTER TABLE poll_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read poll responses"
  ON poll_responses FOR SELECT USING (true);

CREATE POLICY "Service role can insert poll responses"
  ON poll_responses FOR INSERT TO service_role WITH CHECK (true);

-- ══════════════════════════════════════════════════════════
-- RPC: get_web_rating_stats
-- Returns avg score, total ratings, and score distribution
-- ══════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION get_web_rating_stats(slug TEXT)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'avgScore', COALESCE(ROUND(AVG(score)), 0),
    'totalRatings', COUNT(*),
    'distribution', json_build_object(
      '1-20',  COUNT(*) FILTER (WHERE score BETWEEN 1 AND 20),
      '21-40', COUNT(*) FILTER (WHERE score BETWEEN 21 AND 40),
      '41-60', COUNT(*) FILTER (WHERE score BETWEEN 41 AND 60),
      '61-80', COUNT(*) FILTER (WHERE score BETWEEN 61 AND 80),
      '81-100', COUNT(*) FILTER (WHERE score BETWEEN 81 AND 100)
    )
  ) INTO result
  FROM web_ratings
  WHERE article_slug = slug;

  RETURN result;
END;
$$ LANGUAGE plpgsql STABLE;

-- ══════════════════════════════════════════════════════════
-- RPC: submit_web_rating
-- Inserts a rating, returns updated stats. Errors on dupe.
-- ══════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION submit_web_rating(
  p_slug TEXT,
  p_score INTEGER,
  p_ip TEXT
)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  INSERT INTO web_ratings (article_slug, score, ip_hash)
  VALUES (p_slug, p_score, p_ip);

  SELECT get_web_rating_stats(p_slug) INTO result;
  RETURN result;
END;
$$ LANGUAGE plpgsql VOLATILE;

-- ══════════════════════════════════════════════════════════
-- RPC: get_poll_results
-- Returns aggregated answer counts per question for an article
-- ══════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION get_poll_results(slug TEXT)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT COALESCE(
    json_object_agg(question_key, answers),
    '{}'::json
  ) INTO result
  FROM (
    SELECT
      question_key,
      json_object_agg(answer, cnt) AS answers
    FROM (
      SELECT question_key, answer, COUNT(*) AS cnt
      FROM poll_responses
      WHERE article_slug = slug
      GROUP BY question_key, answer
    ) sub
    GROUP BY question_key
  ) grouped;

  RETURN result;
END;
$$ LANGUAGE plpgsql STABLE;

-- ══════════════════════════════════════════════════════════
-- RPC: submit_poll_response
-- Inserts a poll answer, returns updated counts for that question
-- ══════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION submit_poll_response(
  p_slug TEXT,
  p_question_key TEXT,
  p_answer TEXT,
  p_ip TEXT
)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  INSERT INTO poll_responses (article_slug, question_key, answer, ip_hash)
  VALUES (p_slug, p_question_key, p_answer, p_ip);

  SELECT COALESCE(
    json_object_agg(answer, cnt),
    '{}'::json
  ) INTO result
  FROM (
    SELECT answer, COUNT(*) AS cnt
    FROM poll_responses
    WHERE article_slug = p_slug AND question_key = p_question_key
    GROUP BY answer
  ) sub;

  RETURN result;
END;
$$ LANGUAGE plpgsql VOLATILE;

-- ══════════════════════════════════════════════════════════
-- RPC: get_engagement_results (combined)
-- Returns web rating stats + all poll results in one call
-- ══════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION get_engagement_results(slug TEXT)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'webRating', get_web_rating_stats(slug),
    'polls', get_poll_results(slug)
  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql STABLE;
