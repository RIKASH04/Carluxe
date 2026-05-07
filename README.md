# 🚗 Carluxe — Smart Car Wash & Detailing Platform

> **Premium Full-Stack Booking SaaS** · Next.js 16 · Supabase · Framer Motion · TypeScript

A production-ready, luxury car wash booking platform with smart queue management, real-time tracking, and a role-based admin panel — entirely powered by Supabase as the backend.

---

## 🏗️ Project Structure

```
carluxe/
├── src/
│   └── app/
│       ├── page.tsx                  # 🏠 Homepage (hero, services, stats, testimonials)
│       ├── globals.css               # 🎨 Premium design system
│       ├── layout.tsx                # Root layout + SEO
│       ├── auth/
│       │   ├── login/page.tsx        # 🔐 Auth page (Google + Email)
│       │   └── callback/route.ts     # OAuth redirect handler
│       ├── dashboard/
│       │   ├── page.tsx              # User dashboard (server)
│       │   └── DashboardClient.tsx   # 📅 Booking UI + realtime
│       ├── tracking/[id]/
│       │   ├── page.tsx              # Tracking page (server)
│       │   └── TrackingClient.tsx    # ⏱️ Live countdown + progress
│       └── admin/
│           ├── page.tsx              # Admin dashboard (server)
│           └── AdminClient.tsx       # 📊 Queue management + stats
├── lib/supabase/
│   ├── client.ts                     # Browser Supabase client
│   ├── server.ts                     # Server Supabase client  
│   └── middleware.ts                 # Session + route protection
├── middleware.ts                     # Next.js middleware
├── supabase_setup.sql                # 🗄️ Full DB setup script
└── .env.local                        # Environment variables
```

---

## 🚀 Quick Setup Guide

### Step 1: Supabase Project

1. Go to [supabase.com](https://supabase.com) → **New Project**
2. Copy your **Project URL** and **Anon Key** from Settings → API

### Step 2: Environment Variables

Edit `carluxe/.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### Step 3: Database Setup

Open your **Supabase SQL Editor** and run the entire `supabase_setup.sql` file. This creates:
- `bookings` table with all columns
- RLS policies for users and admin
- `create_smart_booking` RPC function
- Realtime publication
- Performance indexes

### Step 4: Enable Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create OAuth 2.0 credentials
3. In Supabase: **Authentication → Providers → Google**
4. Enter your Client ID and Secret
5. Add redirect URL: `https://your-project.supabase.co/auth/v1/callback`

### Step 5: Configure Redirect URLs

In Supabase **Authentication → URL Configuration**:
- Site URL: `http://localhost:3000` (development)
- Redirect URLs: `http://localhost:3000/auth/callback`

### Step 6: Enable Realtime

In Supabase **Database → Replication**, enable realtime for the `bookings` table.
Or run: `ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;`

### Step 7: Run the App

```bash
cd carluxe
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🔐 Admin Access

| Email | Role | Redirect |
|-------|------|----------|
| `resulthub001@gmail.com` | Admin | `/admin` |
| Any other email | User | `/dashboard` |

---

## 🧠 Smart Batching Logic

The `create_smart_booking` RPC function implements **transaction-safe dynamic batching**:

```
Slot 9:00 AM
├── Booking 1 → batch 1, queue 1, assigned 09:00
├── Booking 2 → batch 1, queue 2, assigned 09:00
├── Booking 3 → batch 1, queue 3, assigned 09:00
├── Booking 4 → batch 2, queue 4, assigned 09:15
├── Booking 5 → batch 2, queue 5, assigned 09:15
├── Booking 6 → batch 2, queue 6, assigned 09:15
├── Booking 7 → batch 3, queue 7, assigned 09:30
└── ...
```

**Formula:** `assigned_time = base_time + (CEIL(queue_position / 3) - 1) × 15 minutes`

---

## ✨ Features

| Feature | Details |
|---------|---------|
| 🔐 Auth | Google OAuth + Email/Password + Forgot Password |
| 📅 Booking | 3-step wizard with service, date, time selection |
| 🧠 Smart Queue | Database-level RPC with race condition prevention |
| ⏱️ Tracking | Live countdown timer + animated progress bar |
| 🔴 Realtime | Supabase Realtime on bookings table |
| 👑 Admin | Animated stats, live queue view, confirm/complete/cancel |
| 🎨 UI | Glassmorphism, 3D tilt cards, floating animations |
| 📱 Responsive | Mobile-first, works on all devices |

---

## 🎨 Design System

- **Primary Color:** `#2563eb` (Blue)
- **Font:** Inter (Google Fonts)
- **Border Radius:** 12-24px (modern rounded)
- **Glass Effect:** `backdrop-filter: blur(20px)` with white alpha
- **Animations:** Framer Motion with ease-out cubic bezier

---

## 🌐 Deploy to Vercel

```bash
# From carluxe directory
npx vercel

# Set environment variables in Vercel dashboard:
# NEXT_PUBLIC_SUPABASE_URL
# NEXT_PUBLIC_SUPABASE_ANON_KEY
```

After deploy, update Supabase redirect URLs with your Vercel URL.
