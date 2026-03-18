# The Spidaverse

A modern web platform connecting movies, TV shows, games, anime, manga, and music through an interconnected web of content.

## Features

- 🕸️ **Coming Soon Page** — Miles Morales-inspired spider-web interactive background with three palette modes (Miles, Peter, Venom)
- 📧 **Newsletter Signup** — Email collection stored in Supabase
- 🔐 **Early Access** — Passcode-protected site access before launch
- 📝 **Content Management** — Sanity CMS integration for articles and media
- 🎨 **Modern Stack** — Next.js 16, React 19, TypeScript, Tailwind CSS
- 🚀 **Production Ready** — Netlify deployment with Supabase backend

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account (for database)
- Supabase CLI (optional, for migrations)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/thespidaverse.git
cd thespidaverse

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Fill in your environment variables in .env.local
```

### Development

```bash
# Start the development server
npm run dev

# Open http://localhost:3000
```

The site will be in "coming soon" mode by default. To access the full site:

1. Go to `/coming-soon`
2. Click "Early Access"
3. Enter passcode: `w3bd3s1gn3r`

### Database Setup

#### Option 1: Supabase CLI (Recommended)

```bash
# Install Supabase CLI
brew install supabase/tap/supabase

# Link to your project
supabase link --project-ref your-project-id

# Push migrations
supabase db push
```

#### Option 2: Manual SQL

Run the SQL from `supabase/schema.sql` in your Supabase SQL Editor.

See [DEPLOYMENT.md](./DEPLOYMENT.md) for full setup instructions.

## Project Structure

```
thespidaverse/
├── src/
│   ├── app/                    # Next.js app router
│   │   ├── coming-soon/        # Coming soon page
│   │   ├── articles/           # Article pages
│   │   ├── api/                # API routes
│   │   └── ...
│   ├── components/             # React components
│   │   ├── coming-soon/        # Spider-web canvas, content
│   │   ├── layout/             # Header, footer
│   │   └── ...
│   ├── lib/                    # Utilities
│   │   ├── supabase/           # Supabase clients
│   │   ├── sanity/             # Sanity CMS client
│   │   └── ...
│   └── middleware.ts           # Coming soon redirect
├── supabase/
│   ├── migrations/             # Database migrations
│   └── schema.sql              # Manual schema (reference)
├── sanity/                     # Sanity Studio config
├── public/                     # Static assets
└── ...
```

## Environment Variables

See `.env.example` for all required variables.

### Required for Basic Functionality

```bash
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Optional (for full features)

- Sanity CMS (articles, content)
- TMDB (movies/TV)
- IGDB (games)
- Spotify (music)
- Upstash Redis (reactions)

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete deployment instructions to Netlify.

### Quick Deploy to Netlify

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy)

1. Click the button above
2. Connect your GitHub repository
3. Set environment variables
4. Deploy

## Coming Soon Page

The coming soon page features:

- **Interactive Spider-Web** — Canvas-based web that responds to mouse/touch
- **Venom Strike** — Click anywhere to trigger a lightning surge through the web
- **Three Palettes**:
  - **Miles Mode** — Red web, yellow lightning (default)
  - **Peter Mode** — Blue web, white lightning, red background
  - **Venom Mode** — White web, blue lightning
- **Newsletter Signup** — Email collection stored in Supabase
- **Early Access** — Passcode input to bypass coming soon mode

### Disable Coming Soon Mode

To open the full site to everyone:

1. Delete or rename `src/middleware.ts`
2. Redeploy

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI**: React 19, Tailwind CSS 3
- **Database**: Supabase (PostgreSQL)
- **CMS**: Sanity
- **Hosting**: Netlify
- **Cache**: Upstash Redis
- **APIs**: TMDB, IGDB, Spotify, AniList

## Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

## License

MIT

## Support

For issues or questions, please open an issue on GitHub.
