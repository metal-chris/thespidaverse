# Sanity CMS Setup Guide

## Step 1: Get Your Sanity Credentials

1. Go to [sanity.io/manage](https://sanity.io/manage)
2. Select your project
3. Get the following information:

### Project ID
- Found in **Settings** → **Project details**
- Copy the **Project ID**

### Dataset Name
- Usually `production` (default)
- Found in **Settings** → **Datasets**

### API Token (Read Access)
- Go to **API** → **Tokens**
- Click **Add API token**
- Name: `Production Read Token`
- Permissions: **Viewer** (read-only access)
- Click **Add token**
- **Copy the token immediately** (you won't see it again!)

## Step 2: Configure Local Environment

Update your `.env.local` file with the actual values:

```bash
# Replace these placeholder values:
NEXT_PUBLIC_SANITY_PROJECT_ID=your-actual-project-id
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_READ_TOKEN=your-actual-read-token
```

## Step 3: Configure Netlify Environment Variables

1. Go to your Netlify dashboard
2. Select your site (thespidaverse)
3. Navigate to **Site settings** → **Environment variables**
4. Add the following variables:

| Variable Name | Value | Notes |
|--------------|-------|-------|
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Your project ID | Public (visible in browser) |
| `NEXT_PUBLIC_SANITY_DATASET` | `production` | Public |
| `SANITY_API_READ_TOKEN` | Your read token | Secret (server-side only) |

**Important:** Variables starting with `NEXT_PUBLIC_` are exposed to the browser. The read token is kept server-side only.

## Step 4: Configure CORS in Sanity

To allow your site to access Sanity data:

1. Go to [sanity.io/manage](https://sanity.io/manage)
2. Select your project
3. Navigate to **API** → **CORS Origins**
4. Click **Add CORS origin**
5. Add these origins:
   - `http://localhost:3000` (for local development)
   - `https://thespidaverse.com` (your production domain)
   - `https://*.netlify.app` (for Netlify preview deployments)
6. Check **Allow credentials** for each

## Step 5: Test Locally

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Visit `http://localhost:3000/studio`
   - You should see the Sanity Studio login
   - Sign in with your Sanity account
   - You should see the studio interface

3. Test content fetching:
   - Visit your site pages (articles, collections, etc.)
   - Content should load from Sanity

## Step 6: Deploy to Netlify

1. Commit your changes (if any):
   ```bash
   git add .
   git commit -m "Configure Sanity CMS"
   git push
   ```

2. Netlify will automatically deploy
3. Visit your production site at `https://thespidaverse.com/studio`
4. Sign in and verify the studio works

## Troubleshooting

### Studio shows "Studio Not Configured"
- Check that `NEXT_PUBLIC_SANITY_PROJECT_ID` is set in `.env.local`
- Restart your dev server after adding env vars

### CORS errors in browser console
- Add your domain to CORS origins in Sanity dashboard
- Make sure to include both `http://localhost:3000` and your production URL

### "Unauthorized" errors
- Verify your `SANITY_API_READ_TOKEN` is correct
- Check token permissions in Sanity dashboard (should be Viewer or higher)

### Content not loading
- Check that your dataset name matches (`production` by default)
- Verify you have content in your Sanity dataset
- Check browser console for API errors

## Next Steps

### Add Content
1. Visit `/studio` on your site
2. Create categories, tags, and articles
3. Create collections and add articles to them

### Manage Access
- Only users invited to your Sanity project can access the studio
- Manage members in **Settings** → **Members**
- Remove any users you don't want to have access

### API Tokens
- **Read Token**: For fetching content (already configured)
- **Write Token**: Only needed if you want to programmatically create content
- Keep all tokens secret and never commit them to git

## Resources

- [Sanity Documentation](https://www.sanity.io/docs)
- [Next.js + Sanity Guide](https://www.sanity.io/guides/nextjs)
- [Sanity Studio Docs](https://www.sanity.io/docs/sanity-studio)
