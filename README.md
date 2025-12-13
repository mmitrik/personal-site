
# 🌐 mmitrik.com

Personal website for **Matthew Mitrik** — Product & Technical Program Manager, builder, and team leader.  
Built as part of a hands-on learning journey into **"vibe coding"** — rapidly prototyping and deploying ideas with modern AI-powered development tools.

---

## 🚀 Project Overview

This site serves as a professional hub and creative sandbox — a place to share projects, experiments, and ideas.

- **Framework:** [Next.js](https://nextjs.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Deployment:** [Vercel](https://vercel.com/)
- **Domain:** [mmitrik.com](https://mmitrik.com)
- **Hosting Provider:** GoDaddy (DNS managed)
- **Language:** JavaScript (no TypeScript yet — maybe later 😄)

---

## ✨ Features

- **Dynamic Greeting:** Changes based on the time of day  
  → “Good morning ☀️”, “Good evening 🌇”, etc., with matching color themes.  
- **Modern Minimal Design:** Clean typography, subtle colors, responsive layout.  
- **Vibe-Coded Foundation:** Built iteratively using fast prototyping and AI-assisted coding.

---

## 🧱 Project Structure

```

/
├── app/                # Next.js app directory
│   ├── page.js         # Main landing page
│   └── layout.js       # Global layout
├── components/         # Reusable UI components
│   ├── DynamicGreeting.js
│   ├── Hero.js
│   └── ...
├── public/             # Static assets (images, icons, etc.)
├── styles/             # Tailwind and global CSS
│   └── globals.css
└── tailwind.config.js  # Tailwind customization

````

---

## 🧭 Domain & Deployment

**Domain:** `mmitrik.com`  
**Registrar:** [GoDaddy](https://www.godaddy.com)  
**Hosting:** [Vercel](https://vercel.com)

### ✅ DNS Configuration

| Type | Name | Value | TTL |
|------|------|--------|-----|
| A | @ | 76.76.21.21 | 1 hour |
| CNAME | www | cname.vercel-dns.com | 1 hour |

Once DNS is propagated, Vercel automatically issues SSL and connects both `www` and the root domain.

---

## 🧰 Local Development

### Initial Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd personal-site
   ```

2. **Install dependencies**
   ```bash
   npm install
   # Install Supabase client for the micro-blogging backend
   npm install @supabase/supabase-js
   ```

3. **Set up environment variables**
   ```bash
   # Copy the environment template
   cp .env.local.example .env.local
   ```
   
   Then edit `.env.local` and add your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```
   
   **Where to find these values:**
   - Go to your [Supabase Dashboard](https://app.supabase.com)
   - Select your project → Settings → API
   - Copy the Project URL and anon public key
   - Copy the service_role key (keep this secret!)

4. **Set up the database**
   - Go to your Supabase Dashboard → SQL Editor
   - Copy and run the SQL commands from `sql/policies.sql`
   - This creates the `posts` table and sets up Row Level Security policies

5. **Run the development server**
   ```bash
   npm run dev
   ```

Then visit:
👉 [http://localhost:3000](http://localhost:3000)

### 🗄️ Micro-Blogging Backend

The project includes a complete backend for micro-blogging with:

- **API Routes:** `/api/posts` (GET, POST, PUT, DELETE)
- **Authentication:** Supabase Auth integration
- **Database:** PostgreSQL with Row Level Security
- **TypeScript:** Fully typed API responses and database schemas

**API Endpoints:**
- `GET /api/posts` - Fetch all posts (public)
- `POST /api/posts` - Create post (requires auth)
- `PUT /api/posts` - Update post (requires auth + ownership)
- `DELETE /api/posts?id=<post-id>` - Delete post (requires auth + ownership)

**Testing the API:**
```bash
# Get all posts
curl http://localhost:3000/api/posts

# Create a post (requires Bearer token from Supabase Auth)
curl -X POST http://localhost:3000/api/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-supabase-jwt>" \
  -d '{"content": "Hello, world!"}'
```

---

## 🧠 Next Steps / Future Ideas

- [ ] Add a **“Now Building”** section to highlight current projects.
- [ ] Host small **interactive demos** or micro SaaS prototypes.
- [ ] Add analytics (Vercel or Plausible).

### Things to learn
- [ ] Server-side storage/persistence
- [ ] Working with visual assets
- [ ] HTML5 Canvas
- [ ] Incorporating sound/music
- [ ] Interactive sessions

### Content Ideas
- [ ] Create an “About Me” section with a short personal bio and leadership principles.
- [ ] Add a photo to make the site more human.

### Design Ideas
- [ ] Improve the mobile rendering to increase the minimum width on card controls (text with lots of line breaks is hard to read).
- [ ] Include a **light/dark mode toggle** with time-based auto-switch.

### Game Ideas
- [x] Click-Miner style game 
- [ ] Pixel draw utility for creating pixel art assets to be used in games
- [ ] Pokemon Trader card trading game with arbitrage mechanics
- [x] Zork-style text adventure game using AI generated world
    - [ ] Implement an AI player that plays the game

### New Project Ideas
- [Generated ideas](ideas/ideas.md)
- [x] Micro-blogging platform (capture ideas from learning sessions) - [Posts readme](src/app/apps/posts/readme.md)
- [x] HOA AI Assistant - [HOA AI readme](src/app/apps/hoa-ai/readme.md) - RAG-powered assistant for HOA bylaws

### App Improvement Ideas
- [Idea Spinner ideas](src/app/apps/idea-spinner/readme.md)
- [Ore Miner ideas](src/app/apps/ore-miner/readme.md)
- [Text Adventure ideas](/src/app/apps/text-adventure/readme.md)
- [HOA AI Assistant improvements](src/app/apps/hoa-ai/readme.md) - [RAG Implementation Guide](RAG_IMPLEMENTATION.md)


---

## 💡 What is “Vibe Coding”?

> Vibe coding is about speed, creativity, and flow — turning ideas into working software fast, without over-engineering.
> You build in small, expressive loops: imagine → generate → tweak → deploy.

This project is my first experiment in vibe coding — learning by building, shipping, and iterating in the open.

---

## 🪪 License

MIT License © 2025 Matt Mitrik
You’re welcome to use this repo as inspiration or a starter template for your own vibe-coded site.