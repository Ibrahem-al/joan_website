import Image from "next/image";
import { TESTIMONIALS } from "@/lib/mockData";
import { Star } from "lucide-react";

export default function Testimonials() {
  return (
    <section className="py-24 bg-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gold-50 border border-gold-200 mb-4">
            <span className="text-gold-700 text-xs font-semibold uppercase tracking-wide">What Our Members Say</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-forest-900 mb-4">
            Trusted by hundreds across the Southeast
          </h2>
          <p className="text-slate-500 text-lg max-w-xl mx-auto">
            Real stories from real clients who found the professionals they needed through our network.
          </p>
        </div>

        {/* Testimonial cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* TODO: Replace placeholder testimonials with real client reviews */}
          {TESTIMONIALS.map((t) => (
            <div
              key={t.id}
              className="bg-white rounded-2xl p-8 shadow-card border border-forest-50 flex flex-col"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-6">
                {[...Array(t.rating)].map((_, i) => (
                  <Star key={i} size={14} className="fill-gold-500 text-gold-500" />
                ))}
              </div>

              {/* Quote */}
              <blockquote className="text-slate-700 text-sm leading-relaxed flex-1 mb-8">
                &ldquo;{t.text}&rdquo;
              </blockquote>

              {/* Author */}
              <div className="flex items-center gap-3 pt-6 border-t border-forest-50">
                {/* TODO: Replace with real client photos */}
                <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-forest-100">
                  <Image
                    src={t.avatar}
                    alt={t.name}
                    width={40}
                    height={40}
                    className="object-cover"
                  />
                </div>
                <div>
                  <div className="font-semibold text-forest-900 text-sm">{t.name}</div>
                  <div className="text-xs text-slate-400">{t.role} &bull; {t.state}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
