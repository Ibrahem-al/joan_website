"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, Star, MapPin, Mail, ChevronDown } from "lucide-react";
import { CATEGORIES, STATES } from "@/lib/mockData";
import { createClient } from "@/lib/supabase";

const TIERS: Record<string, { label: string; color: string }> = {
  premium: { label: "Premium", color: "bg-gold-100 text-gold-700 border-gold-200" },
  standard: { label: "Featured", color: "bg-forest-100 text-forest-700 border-forest-200" },
  basic: { label: "Listed", color: "bg-slate-100 text-slate-600 border-slate-200" },
};

interface BusinessRow {
  id: string;
  slug: string;
  name: string;
  category_slug: string;
  state: string;
  rating: number;
  review_count: number;
  description: string;
  email: string;
  tier: string;
  logo_url: string | null;
  is_featured: boolean;
}

const PER_PAGE = 9;

export default function BusinessesPage() {
  const supabase = createClient();
  const [businesses, setBusinesses] = useState<BusinessRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [state, setState] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    supabase
      .from("businesses")
      .select("id, slug, name, category_slug, state, rating, review_count, description, email, tier, logo_url, is_featured")
      .eq("status", "approved")
      .order("is_featured", { ascending: false })
      .order("rating", { ascending: false })
      .then(({ data }) => {
        if (data) setBusinesses(data);
        setLoading(false);
      });
  }, []);

  const filtered = useMemo(() => {
    return businesses.filter((b) => {
      const q = query.toLowerCase();
      if (q && !b.name.toLowerCase().includes(q) && !b.description.toLowerCase().includes(q)) return false;
      if (category && b.category_slug !== category) return false;
      if (state && b.state !== state) return false;
      return true;
    });
  }, [businesses, query, category, state]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const resetPage = () => setPage(1);

  return (
    <div className="min-h-screen bg-cream pt-20">
      {/* Header */}
      <div className="bg-forest-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h1 className="text-3xl sm:text-4xl font-black mb-2">Businesses</h1>
          <p className="text-forest-200 text-base">
            {loading ? "Loading..." : `${businesses.length} vetted businesses across ${STATES.length} states`}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Filters */}
        <div className="bg-white rounded-2xl p-4 shadow-card mb-8 flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search businesses or services..."
              value={query}
              onChange={(e) => { setQuery(e.target.value); resetPage(); }}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-cream border border-forest-100 text-sm focus:outline-none focus:border-forest-400 text-slate-700 placeholder-slate-400"
            />
          </div>
          <div className="relative">
            <select
              value={category}
              onChange={(e) => { setCategory(e.target.value); resetPage(); }}
              className="appearance-none w-full md:w-52 pl-4 pr-10 py-3 rounded-xl bg-cream border border-forest-100 text-sm focus:outline-none focus:border-forest-400 text-slate-700"
            >
              <option value="">All Categories</option>
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.slug}>{c.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
          </div>
          <div className="relative">
            <select
              value={state}
              onChange={(e) => { setState(e.target.value); resetPage(); }}
              className="appearance-none w-full md:w-44 pl-4 pr-10 py-3 rounded-xl bg-cream border border-forest-100 text-sm focus:outline-none focus:border-forest-400 text-slate-700"
            >
              <option value="">All States</option>
              {STATES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-10 h-10 border-4 border-forest-200 border-t-forest-800 rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <p className="text-sm text-slate-500 mb-6">
              Showing {paginated.length} of {filtered.length} businesses
              {(query || category || state) ? " (filtered)" : ""}
            </p>

            {paginated.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                {paginated.map((biz) => {
                  const tier = TIERS[biz.tier] ?? TIERS.basic;
                  const catData = CATEGORIES.find(c => c.slug === biz.category_slug);
                  return (
                    <div key={biz.id} className="bg-white rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 group border border-forest-50">
                      <div className="relative h-44 overflow-hidden bg-forest-100">
                        {biz.logo_url ? (
                          <Image
                            src={biz.logo_url}
                            alt={biz.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-forest-800 to-forest-600">
                            <span className="text-4xl font-black text-white/30">{biz.name[0]}</span>
                          </div>
                        )}
                        <div className="absolute top-3 left-3">
                          <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-semibold border ${tier.color}`}>
                            {tier.label}
                          </span>
                        </div>
                      </div>

                      <div className="p-5">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className="font-bold text-forest-900 leading-tight">{biz.name}</h3>
                          {biz.rating > 0 && (
                            <div className="flex items-center gap-1 shrink-0">
                              <Star size={12} className="fill-gold-500 text-gold-500" />
                              <span className="text-xs font-semibold text-slate-700">{biz.rating}</span>
                              <span className="text-xs text-slate-400">({biz.review_count})</span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-3 mb-3">
                          {catData && (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-forest-700 bg-forest-50 px-2 py-1 rounded-lg">
                              {catData.icon} {catData.name}
                            </span>
                          )}
                          <span className="flex items-center gap-1 text-xs text-slate-400">
                            <MapPin size={10} /> {biz.state}
                          </span>
                        </div>

                        <p className="text-sm text-slate-500 line-clamp-2 mb-4">{biz.description}</p>

                        <div className="flex gap-2">
                          <Link
                            href={`/businesses/${biz.slug}`}
                            className="flex-1 text-center py-2.5 rounded-lg text-sm font-semibold text-forest-800 border border-forest-200 hover:bg-forest-50 transition-colors"
                          >
                            View Profile
                          </Link>
                          <a
                            href={`mailto:${biz.email}`}
                            className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-semibold bg-forest-800 text-white hover:bg-forest-700 transition-colors"
                          >
                            <Mail size={14} />
                            Contact
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-24">
                <div className="text-4xl mb-4">🔍</div>
                <p className="text-slate-500 font-medium">No businesses match your search.</p>
                <button
                  onClick={() => { setQuery(""); setCategory(""); setState(""); }}
                  className="mt-4 text-sm text-forest-800 underline underline-offset-2"
                >
                  Clear filters
                </button>
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 rounded-lg text-sm font-medium border border-forest-200 text-forest-800 hover:bg-forest-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                      page === i + 1 ? "bg-forest-800 text-white" : "border border-forest-200 text-forest-800 hover:bg-forest-50"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 rounded-lg text-sm font-medium border border-forest-200 text-forest-800 hover:bg-forest-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
