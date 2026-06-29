<div align="center">

<img src="https://img.shields.io/badge/AutiCare-Web_Dashboard-0ea5e9?style=for-the-badge&logoColor=white" height="40"/>

<h3>AutiCare — Web Frontend</h3>
<p>Role-based web dashboard for autism care coordination.<br/>Built with Next.js 16 · React 19 · TypeScript · Tailwind CSS v4</p>

[![Next.js](https://img.shields.io/badge/Next.js-16.2.9-000000?style=flat-square&logo=nextdotjs)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-v4-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![Vercel](https://img.shields.io/badge/Deployed-Vercel-000000?style=flat-square&logo=vercel)](https://auti-care-frontend.vercel.app)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

**[Live Demo](https://auti-care-frontend.vercel.app)** · **[Backend Repo](https://github.com/L4S3r/AutiCareBackend)** · **[Mobile App](https://github.com/L4S3r/AutiCareMobileApp)**

> [!NOTE]
> The Mobile App repository is private. Please contact [L4S3r](https://github.com/L4S3r) to request access.

</div>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [User Roles](#user-roles)
- [Design System](#design-system)

---

## Overview

AutiCare Frontend is the web-facing dashboard of the AutiCare platform — a multi-role care coordination system designed to support children with autism and their caregivers. It connects directly to the Node.js/Express backend API and the FastAPI AI microservice for real-time behavioral risk prediction powered by Gemini AI.

---

## Features

- 🔐 **Role-based access control** — four distinct dashboards (Parent, Doctor, Therapist, Child) served from the same codebase
- 🧠 **AI Behavioral Risk Card** — live Gemini AI predictions displayed on the Parent dashboard
- 📊 **Analytics & Charts** — behavioral trends over time using Recharts
- 🔄 **Real-time data fetching** — TanStack React Query with caching and background refetch
- 🎨 **Smooth animations** — page transitions and micro-interactions via Framer Motion
- 📋 **Form validation** — React Hook Form + Zod schema validation on every form
- 🌐 **Global state** — Zustand stores for auth session and UI state
- 🔥 **Firebase integration** — authentication and real-time features
- 📱 **Responsive design** — works across desktop, tablet, and mobile
- 📸 **Multi-Tier Media Uploads** — profile picture updates with live preview and secure birth certificate verification upload for children and clinicians

---

## Tech Stack

| Category | Technology |
|----------|-----------|
| Framework | Next.js 16.2.9 (App Router) |
| Language | TypeScript 5.x |
| Styling | Tailwind CSS v4 + PostCSS |
| State Management | Zustand 5.x |
| Server State | TanStack React Query 5.x |
| Forms | React Hook Form 7.x + Zod 4.x |
| Animations | Framer Motion 12.x |
| Charts | Recharts 3.x |
| HTTP Client | Axios 1.x |
| Auth / Realtime | Firebase 12.x |
| Icons | Lucide React |
| Date Utilities | date-fns 4.x |
| Linting | ESLint (Next.js config) |

---

## Architecture

```
┌─────────────────────────────────────────┐
│         AutiCare Web (Next.js)          │
│                                         │
│  ┌──────────┐  ┌──────────────────────┐ │
│  │  Zustand │  │  React Query Cache   │ │
│  │  (Auth)  │  │  (Server State)      │ │
│  └──────────┘  └──────────────────────┘ │
│         │              │                │
│         └──────┬───────┘                │
│                ▼                        │
│        ┌──────────────┐                 │
│        │  Axios Client │                │
│        └──────┬───────┘                 │
└───────────────│─────────────────────────┘
                │ REST API calls
                ▼
┌──────────────────────────┐
│   AutiCare Backend API   │
│   (Node.js / Express)    │
│   auti-care-backend      │
│         .vercel.app      │
└──────────────────────────┘
```

---

## Project Structure

```
AutiCareFrontend/
├── public/                    # Static assets
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── (auth)/            # Login, register pages
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── dashboard/         # Protected role dashboards
│   │   │   ├── parent/
│   │   │   ├── doctor/
│   │   │   ├── therapist/
│   │   │   └── child/
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Landing / redirect
│   ├── components/            # Reusable UI components
│   │   ├── ui/                # Base design system components
│   │   ├── charts/            # Recharts wrappers
│   │   ├── cards/             # Dashboard cards (AI prediction, stats)
│   │   └── forms/             # Validated form components
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Utilities
│   │   ├── api.ts             # Axios instance + interceptors
│   │   └── utils.ts           # clsx / tailwind-merge helpers
│   ├── store/                 # Zustand stores
│   │   └── auth.store.ts
│   └── types/                 # Shared TypeScript types
├── .env.local                 # Local env (git-ignored)
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- npm / yarn / pnpm
- A running instance of [AutiCare Backend](https://github.com/L4S3r/AutiCareBackend)

### Installation

```bash
# Clone the repository
git clone https://github.com/L4S3r/AutiCareFrontend.git
cd AutiCareFrontend

# Install dependencies
npm install

# Copy the environment template
cp .env.example .env.local
# Fill in your values (see Environment Variables below)

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Available Scripts

```bash
npm run dev      # Start dev server (with Turbopack)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

---

## Environment Variables

Create a `.env.local` file at the root. **Never commit this file.**

```env
# Backend API
NEXT_PUBLIC_API_URL=https://auti-care-backend.vercel.app

# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

---

## User Roles

| Role | Access | Key Features |
|------|--------|--------------|
| **Parent** | Child profiles, reports | AI risk prediction card, behavioral logs, nutrition planning |
| **Doctor** | All assigned patients | Medical history, genetic markers, clinical notes |
| **Therapist** | Assigned children | Session notes, behavioral tracking, progress charts |
| **Child** | Own dashboard | Cognitive games, daily schedule, mood check-in |

Role is assigned at registration and stored in the JWT. The middleware enforces access at the route level — a Parent cannot access Doctor routes and vice versa.

---

## Design System

| Token | Value | Usage |
|-------|-------|-------|
| Primary | `#0EA5E9` (Sky Blue) | CTAs, links, active states |
| Secondary | `#6B9E78` (Sage Green) | Success states, secondary actions |
| Background | `#F8FAFC` | Page background |
| Surface | `#FFFFFF` | Cards |
| Text Primary | `#0F172A` | Headings, body |
| Text Muted | `#64748B` | Labels, captions |

---

## Related Repositories

| Repo | Description |
|------|-------------|
| [AutiCareBackend](https://github.com/L4S3r/AutiCareBackend) | Node.js / Express REST API + FastAPI AI microservice |
| [AutiCareMobileApp](https://github.com/L4S3r/AutiCareMobileApp) | Flutter mobile app (iOS & Android) - *Private repo: contact L4S3r for access* |
