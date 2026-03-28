# AI-UNIPOD UNILAG — Booking Management System (BMS)

> **Product Manager:** Omotosho Enoch
> **Version:** 2.0 — Frontend Implementation
> **Stack:** Next.js 14 · TypeScript · Tailwind CSS · NextAuth.js · Recharts

---

## What This Is

The AI-UNIPOD UNILAG BMS is the official booking platform for the AI & Advanced Computing Pod at the University of Lagos. It manages access to all 12 spaces — from the Maker Space to the VR Lab — for UNILAG students, staff, and external users.

This repo contains the **full frontend** (Phase 1). The backend (Node.js + Express + PostgreSQL) is Phase 2.

---

## Pages Implemented

| Route | Description |
|---|---|
| `/` | Public landing page — hero, spaces preview, features, CTA |
| `/auth/login` | Sign-in form |
| `/auth/signup` | Multi-step signup — Internal (UNILAG) vs External branching |
| `/dashboard` | Personalised user dashboard — tier badge, active booking, history |
| `/spaces` | Spaces browser with search, category filter, availability |
| `/spaces/[slug]` | Space detail — equipment, rules, booking access check |
| `/spaces/[slug]/book` | Full booking flow — date picker, time slots, group member validation, confirm, success |
| `/bookings` | User booking history with status, QR code access |
| `/admin` | Admin overview — stats, charts, approval queue, verification queue |
| `/admin/users` | User management — list, verify, reject, tier management |
| `/admin/checkin` | Receptionist check-in interface — code lookup, QR, confirm |

---

## Project Structure

```
bms/
├── app/                    # Next.js App Router pages
│   ├── page.tsx            # Landing page
│   ├── auth/               # Login & Signup
│   ├── dashboard/          # User dashboard
│   ├── spaces/             # Spaces browser + [id] detail + [id]/book
│   ├── bookings/           # Booking history
│   └── admin/              # Admin panel (overview, users, checkin)
│
├── components/
│   ├── ui/                 # Button, Badge, Card
│   └── layout/             # Navbar, AdminSidebar
│
├── lib/
│   ├── data/               # spaces.ts, tiers.ts — all 12 spaces + booking rules
│   └── utils.ts            # BMS code gen, date helpers, access control
│
└── types/
    └── index.ts            # All TypeScript types for the system
```

---

## Getting Started

### 1. Clone & install

```bash
git clone https://github.com/aiunipodunilag/bms.git
cd bms
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env.local
# Fill in your values (see .env.example for all required vars)
```

### 3. Run the dev server

```bash
npm run dev
# Open http://localhost:3000
```

---

## Phase 2 — Backend TODOs

Every API call in the frontend is marked with a `// TODO:` comment. Here's what needs to be built:

| Endpoint | Method | Description |
|---|---|---|
| `/api/auth/signup` | POST | Create internal or external user, upload document |
| `/api/spaces` | GET | List all public spaces with live availability |
| `/api/spaces/[id]/slots` | GET | Available time slots for a given space + date |
| `/api/bookings` | POST | Create a booking (individual or group) |
| `/api/bookings` | GET | Get current user's bookings |
| `/api/checkin/lookup` | GET | Look up booking by BMS code |
| `/api/checkin/confirm` | POST | Confirm check-in, log timestamp |
| `/api/admin/approvals` | GET/PUT | List pending approvals, approve/reject |
| `/api/admin/users` | GET/PUT | List users, verify/reject/change tier |
| `/api/admin/stats` | GET | Real-time occupancy, bookings, revenue |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router) + TypeScript |
| Styling | Tailwind CSS |
| Auth | NextAuth.js + JWT |
| Charts | Recharts |
| Forms | React Hook Form + Zod |
| Backend (Phase 2) | Node.js + Express |
| Database (Phase 2) | PostgreSQL |
| Email | Supabase Auth (built-in email confirmation) |
| Hosting | Vercel (FE) · Railway or Render (BE) |

---

## Key Business Rules Implemented

- **12 spaces** from the official UNIPOD Capacity Document
- **7 user tiers** with different booking limits enforced at the form level
- **Internal vs External** signup branching — Internal requires document upload + admin approval; External requires phone OTP and is activated instantly
- **3 booking types**: individual (auto or manual approval), group (min. 4 people, 2–3hr fixed), admin-scheduled (hidden from user browser)
- **Regular Student limit**: 3 individual bookings/week, 3hr max each. 4th = ₦2,000 fee shown at booking
- **Group bookings**: real-time member validation, flag-out if member limit exceeded
- **20-minute no-show policy** displayed at every booking confirmation
- **QR code + alphanumeric code** generated per booking (format: `BMS-YYYY-XXXXX`)
- **Admin approval queue** for manual-approval spaces (Board Room, VR Lab, Maker Space, etc.)

---

## Contributing

1. Create a branch: `git checkout -b feature/your-feature-name`
2. Make your changes
3. Open a pull request to `main`

All `// TODO:` comments mark where backend API calls need to be wired in.

---

*Built for AI-UNIPOD UNILAG · University of Lagos, Yaba, Lagos*
