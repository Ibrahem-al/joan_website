import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

// Mock businesses from mockData
const MOCK_BUSINESSES = [
  {
    slug: "elite-home-repair",
    name: "Elite Home Repair Services",
    category_slug: "home-repair",
    state: "California",
    description: "Professional home repair services",
    long_description: "From plumbing to electrical, we handle all your home repair needs with expert technicians.",
    email: "info@eliterepair.com",
    phone: "(555) 123-4567",
    website: "https://eliterepair.com",
    social: "https://instagram.com/eliterepair",
    tier: "premium",
    status: "approved",
    is_featured: true,
    rating: 4.8,
    review_count: 127,
  },
  {
    slug: "glow-beauty-studio",
    name: "Glow Beauty Studio",
    category_slug: "beauty",
    state: "Texas",
    description: "Premium beauty and wellness services",
    long_description: "Award-winning salon offering hair, nails, skincare, and wellness treatments.",
    email: "book@glowbeauty.com",
    phone: "(555) 234-5678",
    website: "https://glowbeauty.com",
    social: "https://instagram.com/glowbeautystudio",
    tier: "standard",
    status: "approved",
    is_featured: true,
    rating: 4.9,
    review_count: 203,
  },
  {
    slug: "vision-legal-partners",
    name: "Vision Legal Partners",
    category_slug: "legal",
    state: "New York",
    description: "Comprehensive legal services for businesses",
    long_description: "Specializing in corporate law, contracts, and business formation with 15+ years experience.",
    email: "contact@visionlegal.com",
    phone: "(555) 345-6789",
    website: "https://visionlegal.com",
    social: "https://linkedin.com/company/visionlegal",
    tier: "premium",
    status: "approved",
    is_featured: true,
    rating: 4.7,
    review_count: 89,
  },
  {
    slug: "zenith-accounting",
    name: "Zenith Accounting & Tax",
    category_slug: "finance",
    state: "Florida",
    description: "Expert accounting and tax preparation",
    long_description: "Full-service accounting firm for small businesses and entrepreneurs. Tax planning, bookkeeping, and consulting.",
    email: "hello@zenithaccounting.com",
    phone: "(555) 456-7890",
    website: "https://zenithaccounting.com",
    social: "https://facebook.com/zenithaccounting",
    tier: "standard",
    status: "approved",
    is_featured: false,
    rating: 4.6,
    review_count: 142,
  },
  {
    slug: "swift-logistics",
    name: "Swift Logistics Solutions",
    category_slug: "logistics",
    state: "Illinois",
    description: "Reliable shipping and logistics services",
    long_description: "Fast and affordable shipping solutions for businesses of all sizes. Same-day delivery available.",
    email: "dispatch@swiftlogistics.com",
    phone: "(555) 567-8901",
    website: "https://swiftlogistics.com",
    social: "https://twitter.com/swiftlogistics",
    tier: "basic",
    status: "approved",
    is_featured: false,
    rating: 4.5,
    review_count: 76,
  },
];

export async function POST(request: NextRequest) {
  try {
    // Verify admin
    const authHeader = request.headers.get('authorization') || ''
    const token = authHeader.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          getAll() {
            return []
          },
          setAll() {},
        },
      }
    )

    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    if (!user || userError) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }

    // Insert businesses (without user_id for now - these are demo businesses)
    const { data, error } = await supabase
      .from('businesses')
      .insert(
        MOCK_BUSINESSES.map(biz => ({
          ...biz,
          user_id: null, // Demo businesses not owned by a specific user
        }))
      )

    if (error) {
      console.error('Seed error:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: `Successfully seeded ${MOCK_BUSINESSES.length} businesses`,
      businesses: data,
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
