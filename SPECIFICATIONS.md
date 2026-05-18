# LaPai Management Solutions & Consulting — Full Platform Specifications

> **Purpose of this document:** Complete feature inventory for AI evaluation. Covers every page, component, API route, data model, auth system, storage, and known stub/gap in the current codebase. As of **2026-05-18**, commit `19c471f`.

---

## 1. Platform Overview

**Product name:** LaPai Management Solutions & Consulting (internal codename: Javona's Network)
**Stack:** Next.js 14 (App Router), TypeScript, Tailwind CSS, Supabase (auth + DB + storage), Vercel deployment
**Concept:** A vetted business directory and referral platform — similar to Angie's List — targeting the Southeast US. Businesses apply, are approved by an admin, and then appear in a searchable public directory. Clients can browse, review, contact businesses, purchase documents, and book consultations.

---

## 2. Design System

- **Primary color:** Deep forest green (`#1a5c38` / Tailwind class `forest-800`)
- **Accent:** Bold gold (`#c9960c` / `gold-500`)
- **Background:** Cream (`#faf8f4`)
- **Typography:** Inter font
- **Component style:** Rounded cards (`rounded-2xl`/`rounded-3xl`), `shadow-card`, `shadow-gold`
- **Logo:** "LM" monogram (placeholder; real logo TODO)

---

## 3. Pages & Routes

### 3.1 `/` — Homepage (Landing Page)

**Auth required:** No

**Sections rendered in order:**
1. **Hero** — Full-viewport hero with background image, headline "Your Network Is Your Net Worth", subheadline, search bar (links to `/businesses?q=`), "List Your Business" secondary CTA, social proof avatar row + live business count
2. **StatsBar** — 3 animated stat cards (Site Visitors, Businesses Listed, States Active). Count-up animation triggers on scroll-into-view. Data fetched live from `/api/stats`
3. **HowItWorks** — 3-step process: Search → Get Connected → Grow. Static section with icons and descriptive cards
4. **FeaturedCategories** — 8-category grid. Live business count per category fetched from Supabase (`businesses` table grouped by `category_slug`, status='approved'). Each card links to `/businesses?category=slug`
5. **Testimonials** — 3-card carousel with star rating, quote, author name, role, and state. Data from `mockData.ts` (placeholder; real testimonials TODO)
6. **Consultation Section** — Split two-column marketing card:
   - Left: "Not sure where to start?" CTA with "Book a Free Consultation" button → `/book`
   - Right (dark green): 4-item checklist (choose date/time, describe need, get matched, no commitment)
7. **CTABanner** — Dark section with "Find a Professional" (gold) and "List Your Business" (outlined) buttons

---

### 3.2 `/businesses` — Business Directory

**Auth required:** No

**Features:**
- Fetches all approved businesses from Supabase on mount (`status='approved'`, ordered `is_featured DESC, rating DESC`)
- **Search bar** — filters by name and description (client-side via `useMemo`)
- **Category dropdown** — filters by `category_slug`
- **State dropdown** — filters by state (all 50 US states)
- **Pagination** — 9 per page, Previous/Next + numbered page buttons
- **Business cards** display:
  - Logo image (or gradient placeholder with first initial)
  - Tier badge (Premium / Featured / Listed)
  - Business name
  - Star rating + review count (if any)
  - Category icon + name
  - State
  - Description snippet (2-line clamp)
  - "View Profile" button → `/businesses/[slug]`
  - "Contact" button → `mailto:` link
- Empty-state message with "Clear filters" button
- Result count display ("Showing X of Y businesses")
- `useSearchParams()` wrapped in `<Suspense>` for Next.js 14 static build compatibility

**Database reads:** `businesses` (status, id, slug, name, category_slug, state, rating, review_count, description, email, tier, logo_url, is_featured)

---

### 3.3 `/businesses/[slug]` — Business Profile Page

**Auth required:** No to view; yes to leave a review

**Sections:**
- **Hero** — full-width image (logo_url or gradient), business name, category badge, tier badge, rating + review count, state
- **About** — long_description (falls back to description)
- **Gallery** — 3-image grid (if `images` array present)
- **Reviews section:**
  - Displays all reviews: star rating (filled/empty), text, and date
  - Unauthenticated users: sign-in prompt instead of review form
  - Authenticated users who already reviewed: show their existing review (read-only)
  - Authenticated users who haven't reviewed: interactive star picker (1–5, hover effect) + optional text textarea + submit button
  - Duplicate review prevention via DB unique constraint (`business_id + user_id`); shows friendly error
  - On successful submission: refreshes both reviews and business rating/review_count from Supabase
- **Contact sidebar** — email (mailto), phone, website link (if present)
- **Quick info sidebar** — category, state, tier, rating

**Database reads:** `businesses` (by slug, status='approved'), `reviews` (by business_id)
**Database writes:** `reviews.insert()` (triggers DB function to update business rating/review_count)
**404 behavior:** Shows "Business not found" if slug doesn't match or business is not approved

---

### 3.4 `/book` — Consultation Booking

**Auth required:** No

**Form structure (multi-panel, not stepped):**
1. **Select Service** (required) — 8 radio-button options from `SERVICES_LIST`
2. **Select Date** (required) — Next 10 business days (excludes weekends), displayed as day + date chip buttons
3. **Select Time** (required, appears after date selected) — 14 half-hour slots from 9:00 AM–4:30 PM in 4-column grid
4. **Your Information** (right sidebar) — Full Name*, Email*, Phone*, Business Name (optional), Notes (optional textarea)
5. **Booking summary** — inline display of selected service, date, time
6. **Submit button** — disabled until service + date + time + name + email + phone are all filled

**Success screen:** Shows confirmation with booked service, date, time, email address; notes upcoming Google Calendar invite integration

**Data:** Currently **not saved to database** (stub — TODO: `appointments` table + Google Calendar event)
**Google Calendar:** Integration planned but not implemented (`/lib/gcal.ts` is entirely stubbed)

---

### 3.5 `/apply` — Get Connected (Lead Intake)

**Auth required:** No

**Form fields:**
- Full Name (text, required)
- Email (email, required)
- Phone (tel, optional)
- State (select, all 50 states, required)
- Service Type (select, from `CATEGORIES`, required)
- Budget Range (6 radio options: Under $500 / $500–$2,000 / $2,000–$5,000 / $5,000–$10,000 / $10,000–$25,000 / $25,000+)
- Urgency (4 radio options: ASAP / This Week / This Month / Flexible)
- Additional Notes (textarea, optional)

**Success screen:** Confirmation message with link to directory

**Data:** Currently **not saved to database** (stub — TODO: `intake_applications` table)

---

### 3.6 `/advertise` — Pricing & Tiers

**Auth required:** No

**Content:**
- Page header with "Simple, transparent pricing" tagline
- 3 pricing tier cards (data from `PRICING_TIERS` in `mockData.ts`):
  - **Basic** — Free. Feature list + missing features. CTA → `/register`
  - **Standard** ($29/mo) — "Most Popular" badge. Feature list + missing features. CTA → `/register`
  - **Premium** ($79/mo) — Feature list + missing features. CTA → `/register`
- **FAQ section** — 4 question/answer cards:
  - What's the difference between tiers?
  - How does the approval process work?
  - Is there a contract?
  - How does placement work?

---

### 3.7 `/register` — Business Registration

**Auth required:** Yes (redirects to `/auth` if unauthenticated)

**5-step wizard with progress bar:**

**Step 1 — Business Info:**
- Business Name (text, required)
- Category (select from `CATEGORIES`, required)
- State (select from `STATES`, required)
- Description (textarea, 500 char limit with character count, required)

**Step 2 — Contact Details:**
- Business Email (required)
- Phone Number (required)
- Website URL (optional)
- Social Handle (optional)

**Step 3 — Photos & Logo:**
- Logo / Cover Photo upload (click to open file picker, JPG/PNG/WEBP, max 10 MB)
  - Uploads to Supabase Storage (`business-images` bucket) immediately on select
  - Live preview + upload spinner + X to clear
- Gallery (up to 3 photos) — same upload behavior, displayed in 3-column grid
- Note: Images upload on select; user can skip step

**Step 4 — Choose Tier:**
- 3 radio cards (Basic free / Standard $29/mo / Premium $79/mo)
- Each shows 3 key features + overflow count

**Step 5 — Review & Submit:**
- Summary of all form values (name, category, state, email, phone, website, tier, photo count)
- Logo preview (if uploaded)
- Disclaimer: "Reviewed by team within 1–3 business days"
- "Submit Application" button

**On submit:**
- Checks logo/gallery upload completion before submission
- POSTs to `/api/businesses/create` with Bearer token (Supabase session)
- **Success screen:** Shows business name, "Application Received", link to Dashboard

**Database:** `businesses.insert()` (status='pending')
**Storage:** `business-images` bucket (path: `{userId}/logo/...` and `{userId}/gallery/...`)

---

### 3.8 `/auth` — Authentication

**Auth required:** No (public)

**Modes (tab switcher):**

**Sign In tab:**
- Email input
- Password input (with show/hide toggle)
- "Forgot password?" link (no-op placeholder)
- "Sign In" button
- After login: checks `profiles.role` → redirects admin to `/admin`, others to `/dashboard`

**Create Account tab:**
- Full Name input
- Email input
- Password input (show/hide toggle)
- Confirm Password input
- All fields validated client-side before submit
- After signup: redirects to `/dashboard`

**Error display:** Red alert box with Supabase error message
**Success screen:** Spinner animation + redirect message

**Database reads:** `profiles.role` (post-login to determine redirect destination)
**Auth provider:** Supabase email/password

---

### 3.9 `/dashboard` — Business Owner Dashboard

**Auth required:** Yes (admin users redirected to `/admin`)

**Sidebar:**
- **Subscription card** (if has subscription): Shows tier name and status; links to `/advertise` to upgrade
- **Get Listed CTA** (if no subscription): Button to `/advertise`
- **Account Info card**: Shows user email and role

**Main content:**
- **Status card**: Shows current business approval status badge (pending / approved / suspended)
- **Profile form** (editable fields):
  - Business Name
  - Category (select)
  - State (select)
  - Description (textarea)
  - Business Email
  - Phone
  - Website
  - Social Handle
- **Save Changes button**: Updates `businesses` table row for the user's business
- Success / error toast notifications
- **Sign Out button**

**Auth/Database:**
- Reads: `profiles.role` (to check for admin), `businesses` (filtered by `user_id`), `subscriptions` (by `user_id`)
- Writes: `businesses.update()` (profile fields)

---

### 3.10 `/admin` — Admin Control Panel

**Auth required:** Yes + `profiles.role === 'admin'`

**5-tab panel:**

#### Tab 1 — Overview
- **Revenue metrics row** (4 cards): MRR, Paying Users, Document Revenue, Total Revenue (calculated from `subscriptions` + `document_purchases`)
- **Subscription breakdown** — horizontal percentage bars by tier (Basic/Standard/Premium)
- **Site snapshot grid** (6 cards): Page Views (30 days), Unique Visitors (30 days), Unique Sessions, Pending Approvals, Total Reviews, Total Documents
- **Visitors per day bar chart** — last 14 days, derived from `analytics_events`
- **Recent page views table** — last 20 `analytics_events` (page, event type, timestamp)
- **Site stats editor** — 4 fields (visitors, businesses, states, clients) that can be manually updated; these update the in-memory SITE_STATS constants (not persisted to DB)

#### Tab 2 — Featured
- Lists all businesses (regardless of status)
- Each row: business name, status badge, tier badge, star/unstar button to toggle `is_featured`
- Toggles via direct Supabase client call

#### Tab 3 — Businesses
- **Pending approvals queue**: businesses with `status='pending'` — Approve / Reject / Delete buttons + modal edit
- **All businesses list**: every business with status badge, tier badge
- **Actions per business**: Edit (modal), Approve, Deapprove→Pending, Suspend, Re-approve, Delete
- **Edit modal fields**: name, category_slug, state, tier, description, email, phone, website, social, logo_url

#### Tab 4 — Reviews
- Table of all reviews joined with business name
- Columns: Business, Rating (stars), Review text, Date
- Delete button per review

#### Tab 5 — Documents
- **Upload new document form**: title, description, category, price, preview pages count, PDF file upload
  - File upload → `/api/admin/documents/upload` (to private storage)
  - Create record → `/api/admin/documents/create`
  - Generate watermarked preview → `/api/admin/documents/process`
- **Document list**: shows all documents with metadata
- **Edit document** (modal): title, description, category, price, preview pages
- **Unpublish** button: sets `is_published=false`

**Database reads:** `businesses`, `reviews` (joined with businesses), `analytics_events` (last 30 days), `subscriptions`, `document_purchases`, `documents`
**Database writes:** Update/delete businesses, reviews, documents; toggle featured; update subscription status

---

### 3.11 `/store` — Document Store

**Auth required:** No

**Content:**
- **Trust bar** — 3 icons: "Secure checkout", "Instant download", "Money-back guarantee"
- **Document grid** (3 columns): fetched live from Supabase (`documents` where `is_published=true`, ordered by `sort_order`)
  - Each card: category badge, price (one-time), title, description, "Preview" button (if preview exists), "Buy & Download" button
- **Preview modal**: shows iframe of `documents-preview` bucket PDF; "Download Full Version" button triggers checkout flow
- **Checkout modal**: document title + price summary, email input, "Complete Purchase" button

**Payment:** Stub — no real Stripe processing. Calls `/api/store/checkout` which returns a fake `clientSecret`

**Database reads:** `documents` (is_published=true, ordered by sort_order)
**Storage reads:** `documents-preview` bucket (public URLs for iframe preview)

---

### 3.12 `/categories` — Category Browser

**Auth required:** No

**Content:**
- Grid of all 10 categories from `mockData.ts`
- Each card: icon, name, description, static business count (from mockData, not live), arrow icon
- Links to `/directory?category=slug` (legacy route)
- CTA at bottom: "Don't see your category?" → `/register`

---

### 3.13 `/directory` — Legacy Directory

**Auth required:** No

**Features:** Identical to `/businesses` but shows 6 results per page instead of 9. Not linked in primary nav (legacy route kept alive).

---

### 3.14 `/directory/[slug]` — Legacy Business Profile

**Auth required:** No (view); Yes (review)

**Features:** Identical to `/businesses/[slug]`. Legacy route kept alive.

---

### 3.15 `/analytics` — Hidden Analytics Dashboard

**Auth required:** Password only (not Supabase auth)
- Password: `123456` (default) or `NEXT_PUBLIC_ANALYTICS_PASSWORD` env var
- Session persisted in `localStorage` (`analytics_authed=true`)
- Lock button clears auth

**Layout:** Standalone (no Navbar or Footer)

**Content:**
- 6 metric cards: Page Views, Unique Sessions, Form Submissions, Documents Sold, Profile Views, Store Visits
- **Top Pages** horizontal bar chart (8 most-visited pages with relative width bars)
- **Event Breakdown** chart (event types with % bars)
- **Site Stats Editor** — editable fields for visitors, businesses, states, clients
- **Recent Activity table** — last 50 events: timestamp, event type, page, metadata (expandable JSON)

**Note:** All data currently from `mockData.ANALYTICS_EVENTS` (12 hardcoded entries, not live Supabase data)

---

## 4. Navbar

**Component:** `src/components/layout/Navbar.tsx`

**Links:**
| Label | Route | Active match |
|---|---|---|
| Home | `/` | Exact match |
| Businesses | `/businesses` | Starts-with |
| Consultation | `/book` | Starts-with |
| Documents | `/store` | Starts-with |
| List Your Business | `/advertise` | Starts-with |

**Auth-aware CTA (right side):**
- **Logged in:** Dashboard link + Sign Out button
- **Logged out:** "Sign In" link + "Get Connected" gold button → `/apply`

**Mobile:** Hamburger menu with same links + auth CTA in dropdown

**Scroll behavior:** Transparent on homepage when scrolled < 20px; white with border and shadow otherwise. Always white on all other pages.

---

## 5. Footer

**Component:** `src/components/layout/Footer.tsx`

**Brand column:** Logo monogram, tagline, `Lapaisolutions@gmail.com` email (clickable `mailto:`), social icons (IG, FB, X — all `href="#"` placeholders)

**Link columns:**

| Directory | Services | Company |
|---|---|---|
| All Businesses → `/businesses` | Get Connected → `/apply` | Register Your Business → `/register` |
| Premium Listings → `/businesses?filter=premium` | Book a Consultation → `/book` | Pricing & Tiers → `/advertise` |
| New Listings → `/businesses?filter=new` | Document Store → `/store` | Sign In → `/auth` |
| | List Your Business → `/advertise` | Admin Access → `/admin` |

**Bottom bar:** Copyright (dynamic year), Privacy Policy / Terms of Service / Cookie Policy (all `href="#"` placeholders)

---

## 6. API Routes

### `GET /api/stats`
- **Auth:** None (public)
- **Cache:** 5-minute revalidation
- **Returns:** `{ businesses: number, visitors: number, states: number }`
- **Queries:** Count of `businesses` (approved), distinct `visitor_id` count from `analytics_events` (page_view), distinct states from approved businesses

### `POST /api/businesses/create`
- **Auth:** Bearer token (Supabase user session)
- **Validates:** User doesn't already have pending/approved business
- **Generates:** Slug from business name + timestamp
- **Inserts:** Into `businesses` with `status='pending'`

### `POST /api/admin/businesses/update`
- **Auth:** Admin only
- **Safe field allowlist:** name, category_slug, state, description, email, phone, website, social, tier, logo_url

### `POST /api/admin/businesses/update-featured`
- **Auth:** Admin only
- **Toggles:** `is_featured` field by businessId

### `POST /api/admin/businesses/update-status`
- **Auth:** Admin only
- **Allowed statuses:** approved, rejected, pending, suspended

### `POST /api/admin/businesses/delete`
- **Auth:** Admin only
- **Deletes:** business by ID

### `POST /api/admin/documents/upload`
- **Auth:** Admin only
- **Accepts:** multipart FormData with PDF file
- **Uploads to:** `documents-private` bucket (Supabase service role)
- **Returns:** fileName for next step

### `POST /api/admin/documents/create`
- **Auth:** Admin only
- **Inserts:** Into `documents` table with `is_published=true`

### `POST /api/admin/documents/process`
- **Auth:** Admin only
- **Downloads** full PDF from `documents-private`
- **Extracts** first N pages via `pdf-lib`
- **Adds** diagonal "PREVIEW ONLY" watermark text to each page
- **Uploads** preview to `documents-preview` bucket (public)
- **Updates:** `documents.preview_file_path`

### `POST /api/admin/documents/update`
- **Auth:** Admin only
- **Updates:** title, description, category, price, preview_pages

### `POST /api/admin/documents/unpublish`
- **Auth:** Admin only
- **Sets:** `documents.is_published = false`

### `POST /api/admin/reviews/delete`
- **Auth:** Admin only
- **Deletes:** review by ID (DB trigger auto-updates business rating)

### `POST /api/admin/seed-businesses`
- **Auth:** Admin only
- **Inserts:** 5 mock businesses into `businesses` table for demo purposes

### `POST /api/store/checkout`
- **Auth:** None
- **Status:** Stub — returns mock `clientSecret`, no real Stripe integration

### `POST /api/webhooks/stripe`
- **Auth:** None (webhook endpoint — Stripe signature verification TODO)
- **Handles:**
  - `customer.subscription.created/updated` → upsert `subscriptions`
  - `customer.subscription.deleted` → set status=canceled
  - `invoice.payment_failed` → set status=past_due
  - `payment_intent.succeeded` → insert `document_purchases`

---

## 7. Authentication & Authorization

### Auth Provider
Supabase Email/Password auth. No OAuth/social login.

### Middleware (`src/middleware.ts` + `src/lib/supabase-middleware.ts`)
- `/dashboard` — requires authenticated Supabase session; unauthenticated → redirect `/auth`
- `/admin` — requires authenticated session AND `profiles.role === 'admin'`; non-admin authenticated user → redirect `/dashboard`

### Roles
- **User (default):** Can register a business, edit own dashboard, post reviews
- **Admin:** Full access to `/admin` panel — approve/reject businesses, manage reviews, documents, view analytics

### Client-Side Auth State
Navbar and Dashboard use `supabase.auth.onAuthStateChange()` subscription to reactively show/hide Dashboard/Sign Out vs Sign In/Get Connected.

---

## 8. Database Schema

### `businesses`
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | FK → auth.users |
| slug | text | URL-safe unique identifier |
| name | text | |
| category_slug | text | matches CATEGORIES |
| state | text | US state name |
| description | text | Short (500 char max) |
| long_description | text | Extended profile text |
| email | text | |
| phone | text | |
| website | text | optional |
| social | text | social handle, optional |
| tier | text | basic / standard / premium |
| status | text | pending / approved / rejected / suspended |
| is_featured | boolean | admin-toggled |
| logo_url | text | URL to business-images bucket |
| images | text[] | up to 3 gallery image URLs |
| rating | numeric | auto-updated by DB trigger |
| review_count | integer | auto-updated by DB trigger |
| created_at | timestamptz | |

### `profiles`
| Column | Type | Notes |
|---|---|---|
| id | uuid | FK → auth.users |
| role | text | 'admin' or 'user' (default) |

### `reviews`
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| business_id | uuid | FK → businesses |
| user_id | uuid | FK → auth.users |
| rating | integer | 1–5 |
| text | text | optional |
| created_at | timestamptz | |
| UNIQUE | | (business_id, user_id) — one review per user per business |

### `analytics_events`
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| visitor_id | text | UUID from localStorage (persistent) |
| session_id | text | UUID from sessionStorage (per-tab) |
| event_type | text | e.g. 'page_view' |
| page | text | pathname |
| metadata | jsonb | e.g. { referrer } |
| created_at | timestamptz | |

### `subscriptions`
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | FK → auth.users |
| stripe_subscription_id | text | |
| stripe_customer_id | text | |
| status | text | active / canceled / past_due |
| tier | text | basic / standard / premium |
| current_period_end | timestamptz | |
| created_at | timestamptz | |

### `document_purchases`
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| document_id | uuid | FK → documents |
| buyer_email | text | |
| stripe_payment_intent_id | text | |
| amount_paid | integer | cents |
| created_at | timestamptz | |

### `documents`
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| title | text | |
| description | text | |
| category | text | |
| price | numeric | USD |
| full_file_path | text | path in documents-private bucket |
| preview_file_path | text | path in documents-preview bucket |
| preview_pages | integer | how many pages to include in preview |
| is_published | boolean | controls store visibility |
| sort_order | integer | display order in store |
| created_at | timestamptz | |

### Tables Referenced but Schema Not Confirmed
- **`appointments`** — intended for `/book` form submissions (not yet created)
- **`intake_applications`** — intended for `/apply` form submissions (not yet created)

---

## 9. Supabase Storage Buckets

| Bucket | Access | Purpose |
|---|---|---|
| `business-images` | Public read, authenticated write | Business logos + gallery photos uploaded during registration |
| `documents-private` | Private (service role only) | Full PDF files for documents |
| `documents-preview` | Public read | Watermarked preview PDFs (first N pages + "PREVIEW ONLY" diagonal overlay) |

---

## 10. Row-Level Security (RLS) Policies

### `businesses`
- `businesses_public_read` — Anyone can SELECT where `status='approved'`
- `admin_read_all_businesses` — Admin user can SELECT all regardless of status
- `admin_update_all_businesses` — Admin user can UPDATE any business
- `admin_delete_all_businesses` — Admin user can DELETE any business

### `reviews`
- Public SELECT (anyone can read reviews)
- Authenticated INSERT (one per user per business)
- `admin_delete_any_review` — Admin can DELETE any review

### `analytics_events`
- Public INSERT (client-side tracking, no auth)
- `admin_read_analytics` — Admin can SELECT all events

### `subscriptions`
- `admin_read_subscriptions` — Admin can SELECT all

### `document_purchases`
- `admin_read_purchases` — Admin can SELECT all

---

## 11. Analytics Tracking

**Component:** `src/components/analytics/AnalyticsTracker.tsx` (included in root layout)

**Behavior:**
- Fires on every client-side route change (pathname change via `usePathname`)
- Skips all `/admin*` routes
- **Visitor ID** — generated once as UUID, stored in `localStorage` (persists across sessions and tabs on same browser)
- **Session ID** — generated per-tab, stored in `sessionStorage` (resets when tab/window closes)
- Inserts row into `analytics_events` with: visitor_id, session_id, event_type='page_view', page=pathname, metadata={ referrer }

---

## 12. Static Mock Data (`src/lib/mockData.ts`)

### `CATEGORIES` (10 total)
Home Repair & Maintenance, Beauty & Wellness, Legal Services, Financial Advisory, Real Estate, Auto Services, Healthcare & Wellness, Technology Services, Event Planning, Education & Tutoring

### `PRICING_TIERS` (3 tiers)
| Tier | Price | Features |
|---|---|---|
| Basic | Free | Basic listing, contact info visible, 1 photo, directory appearance |
| Standard | $29/mo | Everything in Basic + featured placement, 5 photos, priority search, monthly analytics report, review management |
| Premium | $79/mo | Everything in Standard + homepage featured, 15 photos, dedicated profile page, social media integration, 24/7 support, quarterly business review |

### `SERVICES_LIST` (12 items)
Business Consultation, Property Inspection, Financial Planning, Legal Review, Marketing Strategy, Investment Advisory, Business Valuation, Exit Planning, Tax Planning, Risk Assessment, Contract Review, Due Diligence

### `STATES`
All 50 US states

### `TESTIMONIALS` (3 hardcoded)
Placeholder testimonials with placeholder avatars and roles

---

## 13. Environment Variables

| Variable | Side | Required | Purpose |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Client + Server | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client + Server | Yes | Safe public key for client-side Supabase calls |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only | Yes | Bypasses RLS for admin API routes |
| `NEXT_PUBLIC_ANALYTICS_PASSWORD` | Client | No | Password for `/analytics` dashboard (default: `123456`) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Client | No (stub) | Stripe integration (not yet active) |
| `STRIPE_SECRET_KEY` | Server | No (stub) | Stripe secret (not yet active) |
| `STRIPE_WEBHOOK_SECRET` | Server | No (stub) | Stripe webhook verification (not yet active) |
| `GOOGLE_CALENDAR_CLIENT_ID` | Server | No (stub) | Google Calendar OAuth (not yet active) |
| `GOOGLE_CALENDAR_CLIENT_SECRET` | Server | No (stub) | Google Calendar OAuth (not yet active) |
| `GOOGLE_CALENDAR_REFRESH_TOKEN` | Server | No (stub) | Google Calendar OAuth (not yet active) |

---

## 14. Known Gaps & Unimplemented Features

| Feature | Status | Location | Notes |
|---|---|---|---|
| Consultation booking save | Stub | `/book/page.tsx` | Form submits but no DB insert; `appointments` table not created |
| Lead intake save | Stub | `/apply/page.tsx` | Form submits but no DB insert; `intake_applications` table not created |
| Stripe payments | Stub | `/api/store/checkout`, `/api/webhooks/stripe` | Returns fake clientSecret; no real Stripe calls |
| Google Calendar | Stub | `/lib/gcal.ts` | `createCalendarEvent()` returns null |
| Email notifications | Missing | — | No transactional email (no Resend/SendGrid/etc.) |
| Forgot password | Placeholder | `/auth/page.tsx` | Link renders but no reset flow |
| Privacy Policy page | Placeholder | Footer link `href="#"` | Not implemented |
| Terms of Service page | Placeholder | Footer link `href="#"` | Not implemented |
| Cookie Policy page | Placeholder | Footer link `href="#"` | Not implemented |
| Social media links | Placeholder | Footer (IG, FB, X) | All `href="#"` |
| Real logo | TODO | Navbar, Footer | "LM" monogram placeholder |
| Real testimonials | TODO | `mockData.ts` | Hardcoded with placeholder avatars |
| Real client photos | TODO | `mockData.ts` | Placeholder Unsplash images |
| Analytics dashboard live data | Mock only | `/analytics/page.tsx` | Uses 12 hardcoded events, not real Supabase data |
| `analytics.ts` tracking | Console-log only | `/lib/analytics.ts` | `trackEvent()` logs to console, doesn't write to DB |
| Admin password change | Hardcoded | Admin panel | Password `admin123` hardcoded in demo context |
| Stripe subscription management | Missing | Dashboard | No cancel/upgrade UI |
| Image optimization | Basic | Throughout | Uses `next/image` but no CDN or progressive loading beyond that |
| Document download after purchase | Mock | `/store/page.tsx` | No real file delivery post-payment |

---

## 15. Key User Flows

### Business Registration Flow
1. User creates account at `/auth` → redirected to `/dashboard`
2. No business listed → sees "Get Listed" CTA
3. Visits `/register` → completes 5-step form, uploads images, selects tier
4. Submits → status `pending`
5. Admin logs into `/admin` → Businesses tab → Approve
6. Business now visible at `/businesses` and `/businesses/[slug]`

### Admin Approval Flow
1. Admin user manually assigned `role='admin'` in `profiles` table (no UI for this)
2. Admin visits `/auth` → signs in → middleware checks profile → redirected to `/admin`
3. Admin sees pending businesses in Businesses tab, approves/rejects/edits
4. Admin can toggle featured, manage reviews, upload/process documents, view analytics

### Review Flow
1. User visits `/businesses/[slug]` (unauthenticated or authenticated)
2. If unauthenticated: prompted to sign in to leave review
3. If authenticated and no prior review: star picker + text form shown
4. On submit: Supabase insert, DB trigger updates `businesses.rating` and `review_count`
5. Review immediately visible without page reload

### Consultation Booking Flow
1. User sees "Book a Free Consultation" on landing page or "Consultation" in navbar
2. Visits `/book` → selects service, date, time, fills contact info
3. Submits → success screen shown
4. (**Currently no data saved — stub**)

### Document Purchase Flow
1. User visits `/store`, browses documents
2. Clicks "Preview" → iframe modal with watermarked PDF
3. Clicks "Buy & Download" → checkout modal → enters email → "Complete Purchase"
4. (**Currently stub — no real payment or file delivery**)
