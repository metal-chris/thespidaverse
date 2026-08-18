-- Tier list poll: "Where readers put it"  (docs/TIER_LIST_SPEC.md, Phase 5)
--
-- Stores the RAW share code, not decoded placements. Decoding needs the
-- Sanity block, which Postgres cannot see, and storing the code means an
-- entry the author adds later simply arrives "unranked" for older
-- submissions — the same guarantee share links already give. It also means
-- Phase 6 (numbered lists) reuses this table with no migration.

CREATE TABLE IF NOT EXISTS tier_list_responses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  article_slug TEXT NOT NULL,
  -- One article may carry more than one tierList block.
  block_key TEXT NOT NULL,
  -- The `?tl=` code exactly as the Maker produced it.
  code TEXT NOT NULL CHECK (char_length(code) BETWEEN 1 AND 512),
  -- 'tiers' today; Phase 6 adds 'numbered' without touching this schema.
  list_type TEXT NOT NULL DEFAULT 'tiers' CHECK (list_type IN ('tiers', 'numbered')),
  ip_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- One response per person per list. Resubmitting REPLACES: a tier list is
  -- something you revise, so the 409 the other polls return would fight the
  -- reader rather than protect anything.
  CONSTRAINT unique_tier_list_response_per_ip UNIQUE(article_slug, block_key, ip_hash)
);

CREATE INDEX IF NOT EXISTS idx_tier_list_responses_list
  ON tier_list_responses(article_slug, block_key);
CREATE INDEX IF NOT EXISTS idx_tier_list_responses_created
  ON tier_list_responses(created_at);

ALTER TABLE tier_list_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read tier list responses"
  ON tier_list_responses FOR SELECT USING (true);

CREATE POLICY "Service role can write tier list responses"
  ON tier_list_responses FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ══════════════════════════════════════════════════════════
-- RPC: submit_tier_list_response
-- Upsert one reader's arrangement, return the response count for that list.
-- ══════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION submit_tier_list_response(
  p_slug TEXT,
  p_block_key TEXT,
  p_code TEXT,
  p_list_type TEXT,
  p_ip TEXT
)
RETURNS JSON AS $$
DECLARE
  total INTEGER;
BEGIN
  INSERT INTO tier_list_responses (article_slug, block_key, code, list_type, ip_hash)
  VALUES (p_slug, p_block_key, p_code, COALESCE(p_list_type, 'tiers'), p_ip)
  ON CONFLICT (article_slug, block_key, ip_hash)
  DO UPDATE SET code = EXCLUDED.code,
                list_type = EXCLUDED.list_type,
                updated_at = NOW();

  SELECT COUNT(*) INTO total
  FROM tier_list_responses
  WHERE article_slug = p_slug AND block_key = p_block_key;

  RETURN json_build_object('count', total);
END;
$$ LANGUAGE plpgsql VOLATILE;

-- ══════════════════════════════════════════════════════════
-- RPC: get_tier_list_codes
-- Every stored code for one list. Aggregation happens in the app, because
-- decoding a base-36 code requires the Sanity block.
-- ══════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION get_tier_list_codes(p_slug TEXT, p_block_key TEXT)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT COALESCE(json_agg(code), '[]'::json) INTO result
  FROM tier_list_responses
  WHERE article_slug = p_slug AND block_key = p_block_key;

  RETURN result;
END;
$$ LANGUAGE plpgsql STABLE;
