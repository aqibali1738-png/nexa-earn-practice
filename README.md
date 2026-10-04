# Nexa Earn Platform

A modern reward and community verification portal built with React 19, Vite 8, Tailwind CSS v4, Supabase (Authentication & PostgreSQL), and Cloudflare Pages Functions.

---

## Features

- **Supabase Authentication**: User registration, login, JWT session management, role-based access (User & Admin).
- **Account Verification Workflow**: Official WhatsApp community membership submission and approval bonus.
- **Admin Control Panel**: Real-time user management, request review/approval/rejection, dynamic settings, and audit logs.
- **Cloudflare Edge Deployment**: Compatible with Cloudflare Pages Functions (`functions/api/[[route]].ts`) and SPA fallback routing (`public/_redirects`).
- **Full-Stack Parity**: Supports local Node.js server (`server.ts`) and Cloudflare serverless edge execution.

---

## Project Structure

```
├── functions/
│   └── api/
│       └── [[route]].ts         # Cloudflare Pages Functions edge router
├── public/
│   └── _redirects               # SPA client-side fallback (/* /index.html 200)
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

## How to Deploy to Cloudflare Pages

1. In the **Cloudflare Dashboard**, navigate to **Workers & Pages** $\rightarrow$ **Create application** $\rightarrow$ **Pages** $\rightarrow$ **Connect to Git** (or direct upload).
2. Set build settings:
   - **Framework Preset**: `Vite` (or `None`)
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
3. Add **Environment Variables** in Cloudflare Pages:
   - `VITE_SUPABASE_URL`: Your Supabase URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anon key
   - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role secret
   - `NODE_VERSION`: `20`
4. Deploy! Cloudflare Pages will automatically mount `functions/api/[[route]].ts` on the Edge network.
