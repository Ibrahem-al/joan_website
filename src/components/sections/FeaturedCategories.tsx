"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CATEGORIES } from "@/lib/mockData";
import { createClient } from "@/lib/supabase";
import { ArrowRight } from "lucide-react";

export default function FeaturedCategories() {
  const supabase = createClient();
  const featured = CATEGORIES.slice(0, 8);
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    supabase
      .from("businesses")
      .select("category_slug")
      .eq("status", "approved")
      .then(({ data }) => {
        if (!data) return;
        const tally: Record<string, number> = {};
        for (const { category_slug } of data) {
          tally[category_slug] = (tally[category_slug] ?? 0) + 1;
        }
        setCounts(tally);
      });
  }, []);

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-forest-50 border border-forest-200 mb-4">
              <span className="text-forest-800 text-xs font-semibold uppercase tracking-wide">Browse by Category</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-forest-900">
              Every service you need,<br />all in one network.
            </h2>
          </div>
          <Link
            href="/businesses"
            className="flex items-center gap-2 text-sm font-semibold text-forest-800 hover:text-gold-600 transition-colors whitespace-nowrap"
          >
            View all businesses
            <ArrowRight size={14} />
          </Link>
        </div>

        {/* Category grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {featured.map((cat) => {
            const count = counts[cat.slug] ?? 0;
            return (
              <Link
                key={cat.id}
                href={`/businesses?category=${cat.slug}`}
                className="group p-6 rounded-2xl bg-cream border border-forest-100 hover:border-forest-300 hover:bg-forest-50 hover:shadow-card-hover transition-all duration-300"
              >
                <div className="text-3xl mb-3">{cat.icon}</div>
                <h3 className="font-bold text-forest-900 text-sm mb-1 group-hover:text-forest-800">
                  {cat.name}
                </h3>
                <p className="text-xs text-slate-400 mb-2 line-clamp-2">{cat.description}</p>
                <div className="flex items-center gap-1 text-xs font-medium text-gold-600">
                  <span>{count} {count === 1 ? "business" : "businesses"}</span>
                  <ArrowRight size={10} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
