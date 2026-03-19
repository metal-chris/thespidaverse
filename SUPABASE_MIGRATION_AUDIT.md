# Supabase Migration Audit

**Date:** March 19, 2026  
**Purpose:** Identify all data storage patterns and determine what needs to be migrated to Supabase

---

## Executive Summary

The Spidaverse currently uses a **hybrid storage approach**:
- ✅ **Supabase**: Newsletter subscriptions (already implemented)
- ⚠️ **Redis (Upstash)**: Reactions system (ephemeral, needs migration)
- 📦 **localStorage**: Theme preferences, transition settings (client-side only, acceptable)
- 🍪 **Cookies**: Early access passcode (acceptable for auth)

**Primary Migration Need:** Article reactions system from Redis → Supabase

---

## Current Storage Breakdown

### 1. ✅ Already Using Supabase

#### Newsletter Subscriptions
- **Location:** `/src/app/api/newsletter/route.ts`
- **Table:** `newsletter_subscribers`
- **Schema:**
  ```sql
  - id: UUID (primary key)
  - email: TEXT (unique, not null)
  - subscribed_at: TIMESTAMPTZ
  - created_at: TIMESTAMPTZ
  ```
- **Status:** ✅ Fully implemented with RLS policies
- **Migration:** `/supabase/migrations/20260318064646_newsletter_subscribers.sql`

---

### 2. ⚠️ Needs Migration to Supabase

#### Article Reactions (Currently Redis)
- **Location:** `/src/app/api/reactions/[slug]/route.ts`
- **Current Storage:** Upstash Redis
- **Data Structure:**
  ```typescript
  reactions:{slug} → Hash {
    fire: number,
    love: number,
    mindblown: number,
    cool: number,
    trash: number
  }
  ```
- **Rate Limiting:** Redis keys `ratelimit:{slug}:{ip}` (60s TTL)
- **Problem:** Data is ephemeral and will be lost if Redis cache is cleared
- **Usage:** 
  - GET `/api/reactions/[slug]` - Fetch reaction counts
  - POST `/api/reactions/[slug]` - Submit a reaction (rate-limited)

**Migration Priority:** 🔴 HIGH

**Recommended Supabase Schema:**
```sql
-- Article reactions table
CREATE TABLE article_reactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  article_slug TEXT NOT NULL,
  reaction_type TEXT NOT NULL CHECK (reaction_type IN ('fire', 'love', 'mindblown', 'cool', 'trash')),
  ip_hash TEXT NOT NULL, -- Hashed IP for privacy
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Prevent duplicate reactions from same IP within time window
  UNIQUE(article_slug, ip_hash, reaction_type)
);

-- Indexes for performance
CREATE INDEX idx_reactions_slug ON article_reactions(article_slug);
CREATE INDEX idx_reactions_created ON article_reactions(created_at);

-- Materialized view for fast counts (optional optimization)
CREATE MATERIALIZED VIEW article_reaction_counts AS
SELECT 
  article_slug,
  reaction_type,
  COUNT(*) as count
FROM article_reactions
GROUP BY article_slug, reaction_type;

CREATE UNIQUE INDEX idx_reaction_counts ON article_reaction_counts(article_slug, reaction_type);
```

**Migration Benefits:**
- ✅ Persistent storage (reactions won't be lost)
- ✅ Better analytics (can track trends over time)
- ✅ Audit trail (know when reactions were added)
- ✅ Can implement time-based rate limiting via SQL
- ✅ Can add features like "undo reaction" or "change reaction"

---

### 3. 📦 Client-Side Storage (No Migration Needed)

#### Theme Preferences
- **Location:** `/src/components/theme/ThemeProvider.tsx`
- **Storage:** `localStorage.getItem('spidaverse-theme')`
- **Values:** `'miles' | 'peter' | 'venom'`
- **Status:** ✅ Acceptable - User preference, no need for server persistence

#### Transition Settings
- **Location:** `/src/components/transitions/TransitionProvider.tsx`
- **Storage:** `localStorage.getItem('spidaverse-transitions')`
- **Values:** `'true' | 'false'`
- **Status:** ✅ Acceptable - UI preference, no need for server persistence

**Note:** These could optionally be moved to Supabase if you implement user accounts and want preferences to sync across devices.

---

### 4. 🍪 Cookie-Based Storage (No Migration Needed)

#### Early Access Passcode
- **Location:** `/src/app/api/early-access/route.ts`
- **Storage:** HTTP-only cookie `spidaverse-access`
- **Duration:** 30 days
- **Status:** ✅ Acceptable - Temporary auth mechanism, appropriate for cookies

---

### 5. 🔌 External API Integrations (No Storage)

The following API routes are **pass-through proxies** and don't store data:

- `/api/tmdb/[id]` - The Movie Database API
- `/api/igdb/[id]` - Internet Game Database API
- `/api/anilist/[id]` - AniList API
- `/api/spotify/album/[id]` - Spotify API
- `/api/spotify/track/[id]` - Spotify API
- `/api/spotify/now-playing` - Spotify API
- `/api/og` - Open Graph image generation

**Status:** ✅ No migration needed - These are stateless proxies

---

## Migration Recommendations

### Immediate Actions (Priority 1)

#### 1. Migrate Reactions to Supabase

**Steps:**
1. Create migration file: `supabase/migrations/YYYYMMDDHHMMSS_article_reactions.sql`
2. Implement the schema above
3. Update `/src/app/api/reactions/[slug]/route.ts` to use Supabase
4. Add IP hashing for privacy (use crypto.subtle.digest)
5. Implement time-based rate limiting via SQL query
6. Test thoroughly before deploying
7. (Optional) Migrate existing Redis data if valuable

**Estimated Effort:** 2-3 hours

**Benefits:**
- Persistent reaction data
- Better analytics capabilities
- More reliable than Redis cache
- Can add advanced features later

---

### Future Considerations (Priority 2)

#### 2. User Accounts & Preferences Sync

If you implement user authentication:
- Move theme/transition preferences to Supabase user profiles
- Enable cross-device sync
- Add user-specific features (saved articles, reading history, etc.)

**Schema Example:**
```sql
CREATE TABLE user_preferences (
  user_id UUID REFERENCES auth.users(id) PRIMARY KEY,
  theme TEXT DEFAULT 'miles',
  transitions_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 3. Analytics & Metrics

Consider adding tables for:
- Article views/reads
- Search queries
- Popular tags/categories
- User engagement metrics

---

## Environment Variables Audit

### Currently Required:
```env
# Supabase (Already configured)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Redis (Used for reactions - to be deprecated)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Other
EARLY_ACCESS_PASSCODE=
```

### After Migration:
Redis variables can be removed once reactions are migrated to Supabase.

---

## Implementation Checklist

- [ ] Create `article_reactions` table migration
- [ ] Update reactions API route to use Supabase
- [ ] Implement IP hashing for privacy
- [ ] Add rate limiting logic
- [ ] Test reaction submission flow
- [ ] Test "First!" badge functionality
- [ ] Verify reaction counts display correctly
- [ ] Deploy migration to production
- [ ] Monitor for errors
- [ ] (Optional) Migrate existing Redis data
- [ ] Remove Redis dependencies from package.json
- [ ] Remove Redis environment variables

---

## Risk Assessment

### Low Risk
- Newsletter subscriptions (already on Supabase)
- Client-side preferences (localStorage)
- Cookie-based auth

### Medium Risk
- Reactions migration (requires careful testing)
- Rate limiting implementation (needs to be robust)

### Mitigation Strategies
1. Test reactions thoroughly in development
2. Implement feature flag for gradual rollout
3. Keep Redis as fallback during transition period
4. Monitor error rates closely after deployment

---

## Conclusion

**Primary Action Required:** Migrate article reactions from Redis to Supabase for persistent, reliable storage.

**Current State:** 
- 1 feature on Supabase ✅
- 1 feature on Redis ⚠️
- 2 features on localStorage 📦
- 1 feature on cookies 🍪

**Target State:**
- 2 features on Supabase ✅
- 0 features on Redis ✅
- 2 features on localStorage 📦 (acceptable)
- 1 feature on cookies 🍪 (acceptable)

This migration will improve data persistence, enable better analytics, and reduce infrastructure dependencies.
