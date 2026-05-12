-- Javona's Network Database Schema
-- Run this entire file in your Supabase SQL Editor
-- This creates all tables, indexes, RLS policies, triggers, and storage buckets

-- ============================================================================
-- 1. CREATE TABLES
-- ============================================================================

-- Profiles (extends Supabase auth.users with role and metadata)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email text NOT NULL,
  role text NOT NULL DEFAULT 'business_owner' CHECK (role IN ('business_owner', 'admin')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Businesses (one listing per user, includes featured status)
CREATE TABLE IF NOT EXISTS public.businesses (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  category_slug text NOT NULL,
  state text NOT NULL,
  description text NOT NULL,
  long_description text,
  email text NOT NULL,
  phone text,
  website text,
  social text,
  tier text NOT NULL DEFAULT 'basic' CHECK (tier IN ('basic', 'standard', 'premium')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'suspended')),
  logo_url text,
  images text[] DEFAULT '{}',
  is_featured boolean DEFAULT false,
  rating numeric(2,1) DEFAULT 0,
  review_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Subscriptions (Stripe recurring billing for business owners)
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  stripe_customer_id text UNIQUE,
  stripe_subscription_id text UNIQUE,
  status text NOT NULL DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'past_due', 'canceled', 'trialing')),
  tier text NOT NULL DEFAULT 'basic',
  current_period_end timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Documents (products in the document store)
CREATE TABLE IF NOT EXISTS public.documents (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  price numeric(10,2) NOT NULL,
  full_file_path text,          -- path in documents-private bucket (admin only)
  preview_file_path text,       -- path in documents-preview bucket (watermarked, public)
  preview_pages integer NOT NULL DEFAULT 3,
  is_published boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Document Purchases (one-time purchases, not subscriptions)
CREATE TABLE IF NOT EXISTS public.document_purchases (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id uuid REFERENCES public.documents(id) ON DELETE SET NULL,
  buyer_email text NOT NULL,
  stripe_payment_intent_id text UNIQUE,
  amount_paid numeric(10,2) NOT NULL,
  download_url text,           -- signed URL with 24-hour expiry
  created_at timestamptz DEFAULT now()
);

-- Analytics Events (high-volume tracking)
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id bigserial PRIMARY KEY,    -- bigserial for high-speed inserts
  session_id text NOT NULL,
  event_type text NOT NULL,
  page text NOT NULL,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

-- ============================================================================
-- 2. CREATE INDEXES (for query performance at scale)
-- ============================================================================

-- Businesses indexes
CREATE INDEX IF NOT EXISTS businesses_category_slug_idx ON public.businesses(category_slug);
CREATE INDEX IF NOT EXISTS businesses_state_idx ON public.businesses(state);
CREATE INDEX IF NOT EXISTS businesses_status_idx ON public.businesses(status);
CREATE INDEX IF NOT EXISTS businesses_is_featured_idx ON public.businesses(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS businesses_user_id_idx ON public.businesses(user_id);

-- Subscriptions indexes
CREATE INDEX IF NOT EXISTS subscriptions_stripe_customer_id_idx ON public.subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS subscriptions_status_idx ON public.subscriptions(status);

-- Analytics indexes (for fast log querying)
CREATE INDEX IF NOT EXISTS analytics_events_session_id_idx ON public.analytics_events(session_id);
CREATE INDEX IF NOT EXISTS analytics_events_created_at_idx ON public.analytics_events(created_at DESC);
CREATE INDEX IF NOT EXISTS analytics_events_event_type_idx ON public.analytics_events(event_type);

-- Documents indexes
CREATE INDEX IF NOT EXISTS documents_is_published_idx ON public.documents(is_published) WHERE is_published = true;

-- ============================================================================
-- 3. ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.document_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.analytics_events ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 4. CREATE RLS POLICIES
-- ============================================================================

-- Profiles: Users can only view and edit their own profile
DROP POLICY IF EXISTS "profiles_own" ON public.profiles;
CREATE POLICY "profiles_own" ON public.profiles
  FOR ALL USING (auth.uid() = id);

-- Businesses: Owner can edit their own; public can view approved
DROP POLICY IF EXISTS "businesses_owner_write" ON public.businesses;
CREATE POLICY "businesses_owner_write" ON public.businesses
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "businesses_public_read" ON public.businesses;
CREATE POLICY "businesses_public_read" ON public.businesses
  FOR SELECT USING (status = 'approved');

-- Subscriptions: Users can only view their own
DROP POLICY IF EXISTS "subscriptions_own" ON public.subscriptions;
CREATE POLICY "subscriptions_own" ON public.subscriptions
  FOR ALL USING (auth.uid() = user_id);

-- Documents: Published documents are readable by all; only admins/service role can write
DROP POLICY IF EXISTS "documents_public_read" ON public.documents;
CREATE POLICY "documents_public_read" ON public.documents
  FOR SELECT USING (is_published = true);

-- Analytics: Anonymous users can insert events (for tracking)
DROP POLICY IF EXISTS "analytics_insert" ON public.analytics_events;
CREATE POLICY "analytics_insert" ON public.analytics_events
  FOR INSERT WITH CHECK (true);

-- ============================================================================
-- 5. AUTO-CREATE PROFILE ON SIGNUP TRIGGER
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (NEW.id, NEW.email, 'business_owner');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- 6. CREATE SUPABASE STORAGE BUCKETS
-- ============================================================================
-- NOTE: Run these via the Supabase Dashboard Storage tab if SQL insert fails

INSERT INTO storage.buckets (id, name, public) VALUES
  ('documents-private', 'documents-private', false),  -- Full PDFs (admin only)
  ('documents-preview', 'documents-preview', true),   -- Watermarked previews (public)
  ('business-assets', 'business-assets', true)        -- Logos & business photos (public)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 7. GRANT BUCKET PERMISSIONS
-- ============================================================================

-- Everyone can read from public buckets
INSERT INTO storage.objects (bucket_id, name, owner, metadata) VALUES
  ('documents-preview', '.settings.json', NULL, '{}'),
  ('business-assets', '.settings.json', NULL, '{}')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- VERIFICATION QUERIES (run these to confirm setup)
-- ============================================================================
-- SELECT * FROM information_schema.tables WHERE table_schema = 'public';
-- SELECT * FROM storage.buckets WHERE name IN ('documents-private', 'documents-preview', 'business-assets');
-- SELECT * FROM pg_indexes WHERE schemaname = 'public';
