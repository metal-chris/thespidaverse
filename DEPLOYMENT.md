# Deployment Guide

This guide covers deploying **The Spidaverse** to Netlify with Supabase as the database.

---

## Prerequisites

- [Netlify account](https://netlify.com)
- [Supabase account](https://supabase.com)
- GitHub repository connected to Netlify
- Node.js 18+ locally for testing

---

## 1. Supabase Setup

### Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note your **Project URL** and **anon public** key from Settings → API
3. Note your **service_role** key (keep this secret!)
4. Copy your **Project ID** from Settings → General

### Option A: Using Supabase CLI (Recommended)

#### Install Supabase CLI

```bash
# macOS
brew install supabase/tap/supabase

# Windows (scoop)
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase

# Linux
brew install supabase/tap/supabase
```

#### Link to Your Project

```bash
# From project root
supabase link --project-ref your-project-id
```

You'll be prompted for your database password (found in Supabase dashboard → Settings → Database).

#### Run Migrations

```bash
# Push migrations to your remote Supabase project
supabase db push
```

This will create the `newsletter_subscribers` table with all indexes and RLS policies.

#### Local Development (Optional)

To run Supabase locally with Docker:

```bash
# Start local Supabase (requires Docker)
supabase start

# Apply migrations locally
supabase db reset

# Stop local instance
supabase stop
```

Local Supabase runs at `http://localhost:54321` with:
- Studio UI: `http://localhost:54323`
- API URL: `http://localhost:54321`
- Anon key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (shown in terminal)

### Option B: Manual SQL (Alternative)

If you prefer not to use the CLI, run this SQL in the Supabase SQL Editor:

```sql
CREATE TABLE newsletter_subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX idx_newsletter_email ON newsletter_subscribers(email);

-- Enable Row Level Security
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Policy: Allow service role to insert
CREATE POLICY "Service role can insert subscribers"
  ON newsletter_subscribers
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Policy: Allow service role to read
CREATE POLICY "Service role can read subscribers"
  ON newsletter_subscribers
  FOR SELECT
  TO service_role
  USING (true);

-- Policy: Allow service role to update
CREATE POLICY "Service role can update subscribers"
  ON newsletter_subscribers
  FOR UPDATE
  TO service_role
  USING (true);
```

---

## 2. Netlify Setup

### Connect Repository

1. Go to [app.netlify.com](https://app.netlify.com)
2. Click **Add new site** → **Import an existing project**
3. Connect your GitHub repository
4. Netlify will auto-detect Next.js settings

### Configure Build Settings

Build settings should auto-populate, but verify:

- **Build command**: `npm run build`
- **Publish directory**: `.next`
- **Functions directory**: (leave empty, handled by plugin)

### Set Environment Variables

Go to **Site settings** → **Environment variables** and add:

#### Required

```bash
# Site
NEXT_PUBLIC_SITE_URL=https://your-site.netlify.app

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Optional (for full site features)

```bash
# Sanity CMS
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_READ_TOKEN=sk...

# Upstash Redis (for reactions)
UPSTASH_REDIS_REST_URL=https://xxxxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=AXXXxxx...

# External APIs (movies, games, music)
TMDB_API_KEY=...
TMDB_ACCESS_TOKEN=...
TWITCH_CLIENT_ID=...
TWITCH_CLIENT_SECRET=...
SPOTIFY_CLIENT_ID=...
SPOTIFY_CLIENT_SECRET=...
SPOTIFY_REFRESH_TOKEN=...
```

### Deploy

1. Click **Deploy site**
2. Netlify will build and deploy automatically
3. Your site will be live at `https://your-site.netlify.app`

---

## 3. Custom Domain (Optional)

1. Go to **Site settings** → **Domain management**
2. Click **Add custom domain**
3. Follow DNS configuration instructions
4. Update `NEXT_PUBLIC_SITE_URL` to your custom domain

---

## 4. Coming Soon Page & Early Access

The site is configured with a coming-soon page that blocks all routes until a passcode is entered.

### Passcode

Default passcode: `w3bd3s1gn3r`

To change it, update:
- `src/app/api/early-access/route.ts` (line 3)

### Disable Coming Soon Mode

To disable the coming-soon redirect and open the full site:

1. Delete or rename `src/middleware.ts`
2. Redeploy

---

## 5. Verify Deployment

### Test Newsletter Signup

1. Go to your deployed site `/coming-soon`
2. Enter an email and click "Notify Me"
3. Check Supabase → Table Editor → `newsletter_subscribers`
4. Email should appear in the table

### Test Early Access

1. Click "Early Access" on the coming-soon page
2. Enter passcode: `w3bd3s1gn3r`
3. You should be redirected to the full site
4. Cookie `spidaverse-access=granted` should be set (check DevTools)

### Test Full Site

With the access cookie set:
- Navigate to `/` — should show the full homepage
- Navigate to `/articles` — should show articles (if Sanity is configured)
- All routes should work normally

---

## 6. Monitoring & Logs

- **Build logs**: Netlify dashboard → Deploys → [build]
- **Function logs**: Netlify dashboard → Functions → [function] → Logs
- **Supabase logs**: Supabase dashboard → Logs

---

## 7. Troubleshooting

### Build fails with "Missing Supabase environment variables"

- Ensure all `NEXT_PUBLIC_SUPABASE_*` and `SUPABASE_SERVICE_ROLE_KEY` are set in Netlify
- Redeploy after adding variables

### Newsletter signup returns 500 error

- Check Supabase table exists: `newsletter_subscribers`
- Verify service role key has correct permissions
- Check Netlify function logs for detailed error

### Coming soon page redirects in a loop

- Ensure `/coming-soon` is in the middleware bypass list
- Check `src/middleware.ts` line 13-19

### Middleware deprecation warning

- Next.js 16 suggests using `proxy` instead of `middleware`
- This is informational only — middleware still works
- Migration guide: https://nextjs.org/docs/messages/middleware-to-proxy

---

## 8. Post-Launch Checklist

- [ ] Custom domain configured
- [ ] SSL certificate active (auto via Netlify)
- [ ] Environment variables set
- [ ] Newsletter signup tested
- [ ] Early access passcode tested
- [ ] Sanity Studio accessible at `/studio`
- [ ] Analytics configured (Plausible)
- [ ] Social meta tags verified (Twitter, OG)
- [ ] RSS feed accessible at `/rss.xml`
- [ ] Sitemap accessible at `/sitemap.xml`

---

## Support

For issues or questions:
- Next.js: https://nextjs.org/docs
- Netlify: https://docs.netlify.com
- Supabase: https://supabase.com/docs
