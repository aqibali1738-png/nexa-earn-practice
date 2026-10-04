# Nexa Earn Platform

A modern reward and community verification portal built with React 19, Vite 8, Tailwind CSS v4, Supabase (Authentication & PostgreSQL), and Vercel Serverless Functions.

---

## Features

- **Supabase Authentication**: User registration, login, JWT session management, role-based access (User & Admin).
- **Account Verification Workflow**: Official WhatsApp community membership submission and approval bonus.
- **Admin Control Panel**: Real-time user management, request review/approval/rejection, dynamic settings, and audit logs.
- **Vercel Serverless & Edge Ready**: Full-stack compatibility with Vercel (`api/index.ts` and `vercel.json`).
- **Zero-Config Routing**: Client-side SPA routing (`/`, `/user`, `/admin`, etc.) and backend `/api/*` routes are handled cleanly without 404s.
- **Full-Stack Parity**: Supports local development server (`server.ts`) and Vercel cloud deployment.

---

## Project Structure

```
├── api/
│   └── index.ts                 # Vercel Serverless / Edge entry point for /api/*
├── vercel.json                  # Vercel build, framework preset, and rewrite routing
├── src/
│   ├── components/
│   │   ├── admin/               # Admin panel components
│   │   ├── user/                # User dashboard & verification components
│   │   ├── AuthScreen.tsx       # Login & Register modal/forms
│   │   ├── Header.tsx           # App header & navigation
│   │   └── Toast.tsx            # Toast notifications
│   ├── context/
│   │   └── AuthContext.tsx      # Global auth state & Supabase session
│   ├── lib/
│   │   ├── api.ts               # Client-side API client
│   │   └── supabase.ts          # Supabase client helper
│   ├── server/
│   │   └── api.ts               # Shared Hono router for all 15 /api/* endpoints
│   ├── types/
│   │   └── index.ts             # TypeScript definitions
│   ├── App.tsx                  # Main application component
│   ├── index.css                # Tailwind CSS v4 entry point
│   └── main.tsx                 # React entry point
├── server.ts                    # Node.js dev server & local API gateway
├── supabase-schema.sql          # Supabase SQL schema & tables
├── package.json                 # Project dependencies & scripts
├── tsconfig.json                # TypeScript configuration
└── vite.config.ts               # Vite configuration
```

---

## How to Run Locally

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment variables**:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Add your Supabase keys:
   ```env
   VITE_SUPABASE_URL="https://your-project.supabase.co"
   VITE_SUPABASE_ANON_KEY="your-anon-key"
   SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

4. **Build for production**:
   ```bash
   npm run build
   ```

---

## How to Deploy to Vercel

### Step 1: Import Repository
1. Log in to [Vercel](https://vercel.com).
2. Click **Add New...** $\rightarrow$ **Project**.
3. Import your GitHub repository (`nexa-earn-practice`).

### Step 2: Configure Project Settings
Vercel automatically detects the `vercel.json` configuration:
- **Framework Preset**: `Vite`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### Step 3: Add Environment Variables
In the Vercel project deployment screen (or under **Project Settings $\rightarrow$ Environment Variables**), add:

| Variable Name | Environment | Description |
| :--- | :--- | :--- |
| `VITE_SUPABASE_URL` | Production, Preview, Development | Public Supabase URL (e.g., `https://mcpyplosttwinubfeets.supabase.co`) |
| `VITE_SUPABASE_ANON_KEY` | Production, Preview, Development | Public Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Production, Preview, Development | Private Supabase service role key (used securely by `/api/*` serverless functions) |

### Step 4: Deploy
Click **Deploy**. Vercel will build the frontend assets into `dist/` and deploy `api/index.ts` as the serverless API handler.
