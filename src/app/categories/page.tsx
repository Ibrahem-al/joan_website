import Link from "next/link";
import { CATEGORIES } from "@/lib/mockData";
import { ArrowRight } from "lucide-react";

export default function CategoriesPage() {
  return (
    <div className="min-h-screen bg-cream pt-20">
      {/* Header */}
      <div className="bg-forest-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h1 className="text-3xl sm:text-4xl font-black mb-2">Browse by Category</h1>
          <p className="text-forest-200 text-base">
            {CATEGORIES.length} service categories — find exactly what you need.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              href={`/directory?category=${cat.slug}`}
              className="group bg-white rounded-2xl p-8 shadow-card hover:shadow-card-hover border border-forest-50 hover:border-forest-200 transition-all duration-300"
            >
              <div className="flex items-start gap-5">
                <div className="w-14 h-14 rounded-xl bg-forest-50 flex items-center justify-center text-2xl group-hover:bg-forest-100 transition-colors shrink-0">
                  {cat.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-forest-900 text-lg mb-1 group-hover:text-forest-800">
                    {cat.name}
                  </h3>
                  <p className="text-sm text-slate-400 leading-relaxed mb-3">{cat.description}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-gold-600 bg-gold-50 px-2 py-1 rounded-lg">
                      {cat.count} businesses
                    </span>
                    <ArrowRight size={14} className="text-forest-400 group-hover:text-forest-700 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 text-center bg-forest-800 rounded-2xl p-12 text-white">
          <h2 className="text-2xl font-black mb-3">Don&apos;t see your category?</h2>
          <p className="text-forest-200 text-sm mb-6 max-w-md mx-auto">
            We&apos;re always adding new professionals. Register your business and we&apos;ll create the right category for you.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gold-500 hover:bg-gold-600 text-white font-bold text-sm transition-colors shadow-gold"
          >
            List Your Business
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
