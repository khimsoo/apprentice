# Apprentice — Setup Guide

A full-stack apprenticeship tracking platform built with Next.js 14, Supabase, and Tailwind CSS.

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend/DB**: Supabase (PostgreSQL + Auth + RLS)
- **Hosting**: Vercel

---

## 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) → **New Project**
2. Name it `apprentice` (or anything you like)
3. Choose a strong database password and region
4. Once created, go to **Settings → API** and copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon / public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Run Database Migrations

In the Supabase dashboard → **SQL Editor**, paste and run the contents of:
```
supabase/migrations/001_initial_schema.sql
```

This creates all tables (profiles, programs, enrollments, milestones, tasks, task_submissions) with Row Level Security policies and triggers.

---

## 2. Configure Environment Variables

Copy the example env file:
```bash
cp .env.local.example .env.local
```

Then fill in your values:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

---

## 3. Run Locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 4. Deploy to Vercel

### Via Vercel Dashboard

1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Import the **khimsoo/aikey** GitHub repository
3. Add Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Click **Deploy**

### Via Vercel CLI

```bash
npm i -g vercel
vercel --prod
```

---

## 5. Configure Supabase Auth (for production)

In Supabase → **Authentication → URL Configuration**:

- **Site URL**: `https://your-app.vercel.app`
- **Redirect URLs**: `https://your-app.vercel.app/**`

---

## Features

### For Mentors
- Create apprenticeship programs with descriptions, dates, and status
- Add milestones to structure the learning journey
- Create tasks with priority levels and due dates
- View enrolled apprentices and their progress
- Review task submissions

### For Apprentices
- Browse and enroll in active programs
- View tasks assigned across all enrolled programs
- Submit work with notes/links for mentor review
- Track submission status (pending → submitted → approved)
- Monitor personal progress

### Pages
| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/login` | Sign in |
| `/signup` | Create account (choose role: mentor or apprentice) |
| `/dashboard` | Role-specific overview with stats |
| `/programs` | Browse/manage programs |
| `/programs/new` | Create a new program (mentors only) |
| `/programs/[id]` | Program detail with milestones, tasks, apprentices |
| `/tasks` | All tasks view with submission controls |
| `/profile` | Edit profile info |

---

## Database Schema

```
profiles          — extends auth.users (role: mentor | apprentice)
programs          — created by mentors
enrollments       — apprentice ↔ program join
milestones        — ordered checkpoints within a program
tasks             — assigned to a program (optionally a milestone)
task_submissions  — apprentice work submissions per task
milestone_progress — tracks which milestones an apprentice completed
```
