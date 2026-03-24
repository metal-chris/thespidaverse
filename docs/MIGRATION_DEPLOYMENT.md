# Reactions Migration Deployment Guide

## Migration Completed ✅

The article reactions system has been successfully migrated from Redis to Supabase.

---

## What Was Changed

### 1. Share Section Alignment ✅
- **File:** `src/app/articles/[slug]/ArticleBody.tsx`
- **Change:** Share section now right-aligned on tablet+ views using `md:items-end`

### 2. "First!" Badge Animation ✅
- **File:** `src/components/reactions/ReactionBar.tsx`
- **Change:** Badge now animates in/out with smooth height transition instead of fixed gap
- **Behavior:** Expands when shown, collapses when hidden (300ms transition)

### 3. Supabase Migration Created ✅
- **File:** `supabase/migrations/20260319112105_article_reactions.sql`
- **Contents:**
  - `article_reactions` table with proper schema
  - Indexes for performance
  - Row Level Security policies
  - `get_reaction_counts(slug)` function for efficient counting
  - `can_react(slug, ip)` function for rate limiting

### 4. API Route Migrated ✅
- **File:** `src/app/api/reactions/[slug]/route.ts`
- **Changes:**
  - Removed Redis dependency
  - Added IP hashing (SHA-256) for privacy
  - Uses Supabase functions for counts and rate limiting
  - Proper error handling and logging
  - Maintains same API contract (no frontend changes needed)

---

## Deployment Steps

### Option 1: Deploy to Production Supabase (Recommended)

1. **Push migration to production:**
   ```bash
   # If using Supabase CLI with linked project
   supabase db push
   ```

2. **Or manually run the migration:**
   - Go to your Supabase Dashboard → SQL Editor
   - Copy contents of `supabase/migrations/20260319112105_article_reactions.sql`
   - Paste and execute

### Option 2: Local Development (Requires Docker)

1. **Start Docker Desktop**

2. **Start Supabase locally:**
   ```bash
   supabase start
   ```

3. **Reset database with migrations:**
   ```bash
   supabase db reset
   ```

---

## Verification Steps

### 1. Check Migration Applied

Run this query in Supabase SQL Editor:
```sql
-- Verify table exists
SELECT * FROM article_reactions LIMIT 1;

-- Verify functions exist
SELECT proname FROM pg_proc WHERE proname IN ('get_reaction_counts', 'can_react');

-- Check indexes
SELECT indexname FROM pg_indexes WHERE tablename = 'article_reactions';
```

### 2. Test API Endpoints

**Get reactions (should return zeros initially):**
```bash
curl https://your-domain.com/api/reactions/test-slug
```

Expected response:
```json
{
  "reactions": {
    "fire": 0,
    "love": 0,
    "mindblown": 0,
    "cool": 0,
    "trash": 0
  },
  "total": 0
}
```

**Post a reaction:**
```bash
curl -X POST https://your-domain.com/api/reactions/test-slug \
  -H "Content-Type: application/json" \
  -d '{"reaction": "fire"}'
```

Expected response:
```json
{
  "reactions": {
    "fire": 1,
    "love": 0,
    "mindblown": 0,
    "cool": 0,
    "trash": 0
  },
  "total": 1
}
```

### 3. Test "First!" Badge

1. Navigate to an article with no reactions
2. Click any reaction button
3. Should see green "First!" badge appear with animation
4. Badge should disappear after 3 seconds with smooth collapse

### 4. Test Rate Limiting

1. React to an article
2. Try to react again within 60 seconds
3. Should receive 429 error: "Rate limited. Try again later."

---

## Environment Variables

### Required (Already Set)
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Can Be Removed (After Verification)
```env
# These are no longer needed after migration
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

---

## Rollback Plan (If Needed)

If issues arise, you can temporarily revert:

1. **Restore old API route:**
   ```bash
   git checkout HEAD~1 -- src/app/api/reactions/[slug]/route.ts
   ```

2. **Keep Redis environment variables** until migration is stable

3. **Fix issues and redeploy**

---

## Post-Deployment Cleanup

Once verified working in production:

1. **Remove Redis dependencies:**
   ```bash
   npm uninstall @upstash/redis
   ```

2. **Remove Redis lib file:**
   ```bash
   rm src/lib/redis.ts
   ```

3. **Remove Redis environment variables** from `.env.local` and deployment platform

4. **Update `.env.example`** to remove Redis variables

---

## Database Schema Reference

### article_reactions Table
```sql
Column        | Type         | Description
--------------|--------------|------------------------------------------
id            | UUID         | Primary key
article_slug  | TEXT         | Article identifier
reaction_type | TEXT         | One of: fire, love, mindblown, cool, trash
ip_hash       | TEXT         | SHA-256 hashed IP for privacy
created_at    | TIMESTAMPTZ  | When reaction was created

Constraints:
- UNIQUE(article_slug, ip_hash, reaction_type)
- CHECK reaction_type IN (...)

Indexes:
- idx_reactions_slug (article_slug)
- idx_reactions_created (created_at)
- idx_reactions_ip_created (ip_hash, created_at)
```

---

## Benefits of Migration

✅ **Persistent Storage** - Reactions survive cache evictions  
✅ **Better Analytics** - Can track trends over time  
✅ **Audit Trail** - Know when reactions were added  
✅ **Privacy-Compliant** - IP addresses are hashed (SHA-256)  
✅ **Scalable** - Database-backed with proper indexes  
✅ **Reliable** - No dependency on Redis uptime  
✅ **Future-Ready** - Easy to add features like undo/change reactions  

---

## Monitoring

Watch for these in production logs:

- `[Reactions GET] Error:` - Issues fetching counts
- `[Reactions POST] Rate limit check error:` - Rate limiting failures
- `[Reactions POST] Insert error:` - Failed to save reactions
- `[Reactions POST] Get counts error:` - Failed to fetch updated counts

All errors are logged with context for debugging.

---

## Next Steps

1. Deploy migration to production Supabase
2. Deploy updated API route to production
3. Test thoroughly on production
4. Monitor for 24-48 hours
5. Remove Redis dependencies if stable
6. Update documentation

---

## Support

If you encounter issues:

1. Check Supabase logs in Dashboard → Logs
2. Check application logs for `[Reactions` prefixed messages
3. Verify migration was applied: `SELECT * FROM article_reactions`
4. Test functions: `SELECT get_reaction_counts('test-slug')`
5. Check RLS policies are active: `SELECT * FROM pg_policies WHERE tablename = 'article_reactions'`
