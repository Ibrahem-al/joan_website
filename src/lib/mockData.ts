// Mock data for demo — replace with Supabase queries once connected

export const SITE_STATS = {
  visitors: 1240,
  businesses: 87,
  states: 5,
  clients: 340,
};

export const CATEGORIES = [
  { id: "1", slug: "home-repair", name: "Home Repair", icon: "🔧", description: "Plumbing, electrical, renovation & more", count: 18 },
  { id: "2", slug: "beauty-wellness", name: "Beauty & Wellness", icon: "💆", description: "Salons, spas, health coaches & more", count: 12 },
  { id: "3", slug: "home-inspection", name: "Home Inspection", icon: "🏠", description: "Certified home & property inspectors", count: 7 },
  { id: "4", slug: "legal-services", name: "Legal Services", icon: "⚖️", description: "Attorneys, paralegals & notaries", count: 9 },
  { id: "5", slug: "financial-services", name: "Financial Services", icon: "💼", description: "CPAs, financial planners & advisors", count: 11 },
  { id: "6", slug: "real-estate", name: "Real Estate", icon: "🏡", description: "Agents, brokers & property managers", count: 14 },
  { id: "7", slug: "tech-services", name: "Tech Services", icon: "💻", description: "IT support, web dev & cybersecurity", count: 6 },
  { id: "8", slug: "health-medical", name: "Health & Medical", icon: "🩺", description: "Therapists, chiropractors & coaches", count: 8 },
  { id: "9", slug: "catering-events", name: "Catering & Events", icon: "🍽️", description: "Caterers, planners & photographers", count: 10 },
  { id: "10", slug: "education-tutoring", name: "Education & Tutoring", icon: "📚", description: "Tutors, coaches & training services", count: 5 },
];

export interface Business {
  id: string;
  slug: string;
  name: string;
  category: string;
  categorySlug: string;
  state: string;
  rating: number;
  reviewCount: number;
  description: string;
  longDescription: string;
  email: string;
  phone: string;
  website: string;
  tier: "basic" | "standard" | "premium";
  status: "approved" | "pending";
  image: string;
  images: string[];
}

export const BUSINESSES: Business[] = [
  {
    id: "1",
    slug: "apex-plumbing-solutions",
    name: "Apex Plumbing Solutions",
    category: "Home Repair",
    categorySlug: "home-repair",
    state: "Georgia",
    rating: 4.9,
    reviewCount: 127,
    description: "Licensed master plumbers serving metro Atlanta for 15+ years. Emergency service available 24/7.",
    longDescription: "Apex Plumbing Solutions is a full-service plumbing company dedicated to providing top-tier plumbing services to residential and commercial clients across the Atlanta metro area. With over 15 years of experience, our licensed master plumbers handle everything from routine maintenance to complex installations and emergency repairs. We pride ourselves on transparency, quality workmanship, and same-day service availability.",
    email: "contact@apexplumbing.com",
    phone: "(404) 555-0123",
    website: "https://apexplumbing.com",
    tier: "premium",
    status: "approved",
    image: "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=600&q=80",
    // TODO: Replace with client photos — business gallery images
    images: [
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80",
      "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&q=80",
      "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=600&q=80",
    ],
  },
  {
    id: "2",
    slug: "elite-electrical-services",
    name: "Elite Electrical Services",
    category: "Home Repair",
    categorySlug: "home-repair",
    state: "Georgia",
    rating: 4.8,
    reviewCount: 89,
    description: "Certified electricians for residential and commercial projects. Panel upgrades, EV charger installs, smart home wiring.",
    longDescription: "Elite Electrical Services brings licensed, insured electricians to homes and businesses across Georgia. From panel upgrades and EV charger installation to full smart home automation wiring, our team handles projects of any scale with precision and code compliance. We specialize in modern energy-efficient solutions that save our clients money long-term.",
    email: "info@eliteelectrical.com",
    phone: "(404) 555-0456",
    website: "https://eliteelectrical.com",
    tier: "standard",
    status: "approved",
    image: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=600&q=80",
    images: [
      "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=600&q=80",
      "https://images.unsplash.com/photo-1615905782721-e0e6eee8d4fd?w=600&q=80",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&q=80",
    ],
  },
  {
    id: "3",
    slug: "serenity-spa-wellness",
    name: "Serenity Spa & Wellness",
    category: "Beauty & Wellness",
    categorySlug: "beauty-wellness",
    state: "Florida",
    rating: 5.0,
    reviewCount: 214,
    description: "Luxury spa treatments, massage therapy, and holistic wellness services in the heart of Miami.",
    longDescription: "Serenity Spa & Wellness is Miami's premier destination for relaxation and rejuvenation. Our licensed therapists offer everything from deep-tissue massage and hot stone therapy to custom facials and body wraps. We use only clean, organic products and tailor every treatment to your individual needs. Our tranquil space is designed to help you disconnect from stress and reconnect with your wellbeing.",
    email: "hello@serenityspa.com",
    phone: "(305) 555-0789",
    website: "https://serenityspa.com",
    tier: "premium",
    status: "approved",
    image: "https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=600&q=80",
    images: [
      "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=600&q=80",
      "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&q=80",
      "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&q=80",
    ],
  },
  {
    id: "4",
    slug: "clarity-home-inspections",
    name: "Clarity Home Inspections",
    category: "Home Inspection",
    categorySlug: "home-inspection",
    state: "North Carolina",
    rating: 4.7,
    reviewCount: 63,
    description: "ASHI-certified inspectors providing thorough, unbiased home inspection reports for buyers and sellers.",
    longDescription: "Clarity Home Inspections provides comprehensive, unbiased property inspections backed by ASHI certification and 12 years of industry experience. Our detailed reports include high-resolution photos, priority rankings, and actionable repair guidance to empower your real estate decisions. We cover structural integrity, roofing, HVAC, plumbing, electrical, and more — typically delivering your full report within 24 hours of inspection.",
    email: "clarity@homeinspect.com",
    phone: "(704) 555-0321",
    website: "https://clarityhomeinspect.com",
    tier: "standard",
    status: "approved",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80",
    images: [
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&q=80",
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80",
      "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&q=80",
    ],
  },
  {
    id: "5",
    slug: "meridian-law-group",
    name: "Meridian Law Group",
    category: "Legal Services",
    categorySlug: "legal-services",
    state: "Georgia",
    rating: 4.9,
    reviewCount: 98,
    description: "Real estate, business formation, and contract law. Serving small business owners and investors across the Southeast.",
    longDescription: "Meridian Law Group focuses on practical legal solutions for entrepreneurs, investors, and small business owners. Our attorneys specialize in real estate transactions, business entity formation, contract drafting and review, and dispute resolution. We understand that small business owners need clear, actionable legal advice at reasonable rates — not billable-hour surprises.",
    email: "legal@meridianlaw.com",
    phone: "(678) 555-0654",
    website: "https://meridianlaw.com",
    tier: "premium",
    status: "approved",
    image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&q=80",
    images: [
      "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=600&q=80",
      "https://images.unsplash.com/photo-1568992688065-536aad8a12f6?w=600&q=80",
      "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=600&q=80",
    ],
  },
  {
    id: "6",
    slug: "cornerstone-financial-advisors",
    name: "Cornerstone Financial Advisors",
    category: "Financial Services",
    categorySlug: "financial-services",
    state: "Florida",
    rating: 4.8,
    reviewCount: 71,
    description: "Fee-only financial planning, tax strategy, and wealth building for first-generation investors and business owners.",
    longDescription: "Cornerstone Financial Advisors provides fee-only, fiduciary financial planning with a focus on first-generation wealth builders and business owners. Our certified financial planners create personalized strategies covering retirement planning, tax optimization, debt payoff, and investment allocation. We work transparently — you pay a flat fee and we work entirely in your interest.",
    email: "plan@cornerstonefa.com",
    phone: "(813) 555-0987",
    website: "https://cornerstonefa.com",
    tier: "premium",
    status: "approved",
    image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&q=80",
    images: [
      "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&q=80",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80",
      "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=600&q=80",
    ],
  },
  {
    id: "7",
    slug: "pinnacle-realty-group",
    name: "Pinnacle Realty Group",
    category: "Real Estate",
    categorySlug: "real-estate",
    state: "North Carolina",
    rating: 4.6,
    reviewCount: 145,
    description: "Buyer and seller representation, investor-focused agents, and off-market property access across the Carolinas.",
    longDescription: "Pinnacle Realty Group is a boutique real estate firm specializing in investor-friendly transactions, buyer and seller representation, and off-market property sourcing across the Carolinas. Our agents have deep market knowledge and extensive networks that give our clients access to deals before they hit the MLS. We close over $40M in transactions annually with an average client satisfaction rating above 4.6 stars.",
    email: "team@pinnaclerealty.com",
    phone: "(919) 555-0234",
    website: "https://pinnaclerealty.com",
    tier: "standard",
    status: "approved",
    image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&q=80",
    images: [
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&q=80",
      "https://images.unsplash.com/photo-1448630360428-65456885c650?w=600&q=80",
      "https://images.unsplash.com/photo-1516156008625-3a9d6067fab5?w=600&q=80",
    ],
  },
  {
    id: "8",
    slug: "nexus-tech-solutions",
    name: "Nexus Tech Solutions",
    category: "Tech Services",
    categorySlug: "tech-services",
    state: "Georgia",
    rating: 4.7,
    reviewCount: 42,
    description: "IT support, cybersecurity audits, and custom web development for small businesses and startups.",
    longDescription: "Nexus Tech Solutions is a full-service IT firm for small businesses and growing startups. We provide managed IT support, network setup, cybersecurity assessments, and custom web and app development. Our team of certified technologists helps businesses modernize operations, protect against cyber threats, and build digital products that work. Monthly support plans available from $299/mo.",
    email: "hello@nexustech.io",
    phone: "(770) 555-0567",
    website: "https://nexustech.io",
    tier: "basic",
    status: "approved",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80",
    images: [
      "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&q=80",
      "https://images.unsplash.com/photo-1531746790731-6c087fecd65a?w=600&q=80",
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600&q=80",
    ],
  },
  {
    id: "9",
    slug: "wholesome-wellness-clinic",
    name: "Wholesome Wellness Clinic",
    category: "Health & Medical",
    categorySlug: "health-medical",
    state: "Florida",
    rating: 4.9,
    reviewCount: 88,
    description: "Integrative health practice combining chiropractic care, nutrition counseling, and functional medicine.",
    longDescription: "Wholesome Wellness Clinic is an integrative health practice that blends chiropractic care, personalized nutrition counseling, and functional medicine testing to address the root causes of chronic health issues. Our practitioners work together to create individualized wellness plans that help patients move from managing symptoms to achieving true health. New patient consultations are available within 48 hours.",
    email: "care@wholesomewellness.com",
    phone: "(954) 555-0890",
    website: "https://wholesomewellness.com",
    tier: "standard",
    status: "approved",
    image: "https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=600&q=80",
    images: [
      "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&q=80",
      "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=600&q=80",
      "https://images.unsplash.com/photo-1511174511562-5f97f4f4c1ee?w=600&q=80",
    ],
  },
  {
    id: "10",
    slug: "celebration-catering-co",
    name: "Celebration Catering Co.",
    category: "Catering & Events",
    categorySlug: "catering-events",
    state: "Georgia",
    rating: 5.0,
    reviewCount: 156,
    description: "Full-service event catering and coordination. Corporate events, weddings, and private dinners for 10 to 500 guests.",
    longDescription: "Celebration Catering Co. brings culinary excellence and flawless execution to every event we touch. From intimate dinner parties to corporate luncheons and wedding receptions, our team of professional chefs and event coordinators handles every detail. Our menus draw from Southern, Mediterranean, and contemporary American traditions, customized to your taste and dietary needs. We are fully licensed and insured in the state of Georgia.",
    email: "events@celebrationcatering.com",
    phone: "(404) 555-0111",
    website: "https://celebrationcatering.com",
    tier: "premium",
    status: "approved",
    image: "https://images.unsplash.com/photo-1555244162-803834f70033?w=600&q=80",
    images: [
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80",
      "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=600&q=80",
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80",
    ],
  },
  {
    id: "11",
    slug: "bright-futures-tutoring",
    name: "Bright Futures Tutoring",
    category: "Education & Tutoring",
    categorySlug: "education-tutoring",
    state: "North Carolina",
    rating: 4.8,
    reviewCount: 53,
    description: "K-12 and college prep tutoring in math, science, SAT/ACT prep, and executive function coaching.",
    longDescription: "Bright Futures Tutoring pairs students with subject-matter experts and certified educators for one-on-one sessions tailored to each learner's pace and style. Our tutors cover K-12 math and sciences, SAT/ACT preparation, AP coursework, and executive function coaching for students with learning differences. We offer both in-person sessions across the Research Triangle and secure video sessions nationwide.",
    email: "learn@brightfuturestutoring.com",
    phone: "(919) 555-0432",
    website: "https://brightfuturestutoring.com",
    tier: "basic",
    status: "approved",
    image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&q=80",
    images: [
      "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=600&q=80",
      "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600&q=80",
      "https://images.unsplash.com/photo-1456406644174-8ddd4cd52a06?w=600&q=80",
    ],
  },
  {
    id: "12",
    slug: "greenleaf-renovation-group",
    name: "Greenleaf Renovation Group",
    category: "Home Repair",
    categorySlug: "home-repair",
    state: "Florida",
    rating: 4.7,
    reviewCount: 79,
    description: "Full-service home renovation and remodeling. Kitchens, bathrooms, additions, and whole-home transformations.",
    longDescription: "Greenleaf Renovation Group is a licensed general contractor specializing in transformative home renovations across South Florida. Our in-house design team works with clients from concept to completion — kitchen and bathroom remodels, room additions, whole-home renovations, and outdoor living spaces. Every project is delivered on time and within budget, backed by a 2-year workmanship warranty.",
    email: "build@greenleafrenovation.com",
    phone: "(561) 555-0765",
    website: "https://greenleafrenovation.com",
    tier: "premium",
    status: "approved",
    image: "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=600&q=80",
    images: [
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80",
      "https://images.unsplash.com/photo-1565538810643-b5bdb714032a?w=600&q=80",
      "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=600&q=80",
    ],
  },
];

export const PENDING_BUSINESSES: Business[] = [
  {
    id: "13",
    slug: "sunrise-beauty-bar",
    name: "Sunrise Beauty Bar",
    category: "Beauty & Wellness",
    categorySlug: "beauty-wellness",
    state: "Georgia",
    rating: 0,
    reviewCount: 0,
    description: "Luxury hair and nail salon specializing in natural hair care and gel nail art.",
    longDescription: "",
    email: "sunrisebeautybar@gmail.com",
    phone: "(770) 555-0101",
    website: "",
    tier: "standard",
    status: "pending",
    image: "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=600&q=80",
    images: [],
  },
];

export interface Document {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  fileUrl: string;
  active: boolean;
}

export const DOCUMENTS: Document[] = [
  {
    id: "1",
    title: "Small Business LLC Formation Checklist",
    description: "A comprehensive step-by-step guide for forming your LLC, including state filing requirements, operating agreement template, and EIN application walkthrough. Covers all 50 states.",
    price: 29,
    category: "Legal",
    fileUrl: "/placeholder-documents/llc-formation-checklist.pdf",
    active: true,
  },
  {
    id: "2",
    title: "Investor Due Diligence Questionnaire Pack",
    description: "Professional-grade due diligence templates for evaluating investment properties and business opportunities. Includes financial analysis worksheets, red-flag checklist, and deal scorecard.",
    price: 49,
    category: "Finance",
    fileUrl: "/placeholder-documents/due-diligence-pack.pdf",
    active: true,
  },
  {
    id: "3",
    title: "Home Renovation Project Management Guide",
    description: "Everything you need to manage a home renovation like a pro. Contractor vetting templates, scope-of-work guides, change order forms, payment schedules, and completion checklists.",
    price: 19,
    category: "Home",
    fileUrl: "/placeholder-documents/renovation-guide.pdf",
    active: true,
  },
];

export const PRICING_TIERS = [
  {
    id: "1",
    name: "Basic",
    price: 0,
    billingPeriod: "forever",
    isFeatured: false,
    displayOrder: 1,
    features: [
      "Directory listing",
      "Contact link",
      "Business profile page",
      "Category badge",
      "Mobile-optimized listing",
    ],
    missingFeatures: [
      "Featured badge",
      "Priority placement",
      "Consultation booking",
      "Document bundle access",
    ],
  },
  {
    id: "2",
    name: "Standard",
    price: 29,
    billingPeriod: "month",
    isFeatured: true,
    displayOrder: 2,
    features: [
      "Everything in Basic",
      "Featured badge on listing",
      "Priority placement in search",
      "Highlighted business card",
      "Monthly analytics report",
      "Social links displayed",
    ],
    missingFeatures: [
      "Top of category placement",
      "Consultation booking",
      "Document bundle access",
    ],
  },
  {
    id: "3",
    name: "Premium",
    price: 79,
    billingPeriod: "month",
    isFeatured: false,
    displayOrder: 3,
    features: [
      "Everything in Standard",
      "Top of category placement",
      "Consultation booking widget",
      "Document bundle access (3 free docs)",
      "Featured in homepage categories",
      "Priority review responses",
      "Dedicated account manager",
    ],
    missingFeatures: [],
  },
];

export const TESTIMONIALS = [
  {
    id: "1",
    name: "Marcus T.",
    role: "Real Estate Investor",
    state: "Georgia",
    text: "Javona's Network connected me with a contractor and a real estate attorney in the same week. Both were professional, responsive, and exactly what I needed. This network is the real deal.",
    rating: 5,
    // TODO: Replace with client photo — testimonial headshot
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80",
  },
  {
    id: "2",
    name: "Denise R.",
    role: "Small Business Owner",
    state: "Florida",
    text: "I found my CPA and event caterer through this platform. Both businesses were vetted and professional. The booking process was seamless. I recommend Javona's Network to every entrepreneur I know.",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80",
  },
  {
    id: "3",
    name: "Kevin W.",
    role: "Homeowner",
    state: "North Carolina",
    text: "I was skeptical about finding trusted contractors online, but the quality of businesses listed here is outstanding. My renovation came in on time and under budget — couldn't be happier.",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80",
  },
];

export const SERVICES_LIST = [
  "Home Renovation Consultation",
  "Plumbing Service Call",
  "Electrical Inspection",
  "Financial Planning Session",
  "Legal Consultation",
  "Real Estate Advisory",
  "Health & Wellness Assessment",
  "Business Strategy Session",
  "IT Security Audit",
  "Event Planning Kickoff",
  "Tutoring Assessment",
  "General Business Referral",
];

export const STATES = ["Georgia", "Florida", "North Carolina", "Texas", "Virginia"];

export const ANALYTICS_EVENTS = [
  { id: "1", event_type: "page_view", page: "/", created_at: new Date(Date.now() - 2 * 60000).toISOString(), session_id: "sess_001", metadata: { referrer: "google.com" } },
  { id: "2", event_type: "profile_view", page: "/directory/apex-plumbing-solutions", created_at: new Date(Date.now() - 5 * 60000).toISOString(), session_id: "sess_002", metadata: { business: "Apex Plumbing Solutions" } },
  { id: "3", event_type: "store_visit", page: "/store", created_at: new Date(Date.now() - 8 * 60000).toISOString(), session_id: "sess_003", metadata: {} },
  { id: "4", event_type: "mock_purchase", page: "/store", created_at: new Date(Date.now() - 12 * 60000).toISOString(), session_id: "sess_004", metadata: { document: "LLC Formation Checklist", amount: 29 } },
  { id: "5", event_type: "appointment_submit", page: "/book", created_at: new Date(Date.now() - 18 * 60000).toISOString(), session_id: "sess_005", metadata: { service: "Legal Consultation" } },
  { id: "6", event_type: "page_view", page: "/directory", created_at: new Date(Date.now() - 22 * 60000).toISOString(), session_id: "sess_006", metadata: {} },
  { id: "7", event_type: "intake_submit", page: "/apply", created_at: new Date(Date.now() - 30 * 60000).toISOString(), session_id: "sess_007", metadata: { service: "Home Renovation" } },
  { id: "8", event_type: "contact_click", page: "/directory", created_at: new Date(Date.now() - 35 * 60000).toISOString(), session_id: "sess_008", metadata: { business: "Serenity Spa" } },
  { id: "9", event_type: "registration_submit", page: "/register", created_at: new Date(Date.now() - 45 * 60000).toISOString(), session_id: "sess_009", metadata: { tier: "standard" } },
  { id: "10", event_type: "page_view", page: "/categories", created_at: new Date(Date.now() - 52 * 60000).toISOString(), session_id: "sess_010", metadata: {} },
  { id: "11", event_type: "profile_view", page: "/directory/meridian-law-group", created_at: new Date(Date.now() - 60 * 60000).toISOString(), session_id: "sess_011", metadata: { business: "Meridian Law Group" } },
  { id: "12", event_type: "mock_purchase", page: "/store", created_at: new Date(Date.now() - 75 * 60000).toISOString(), session_id: "sess_012", metadata: { document: "Due Diligence Pack", amount: 49 } },
];
