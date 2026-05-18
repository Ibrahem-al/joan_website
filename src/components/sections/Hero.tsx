"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Hero() {
  const [query, setQuery] = useState("");
  const [bizCount, setBizCount] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/stats")
      .then(r => r.json())
      .then(d => setBizCount(d.businesses))
      .catch(() => {});
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/directory?q=${encodeURIComponent(query.trim())}`);
    } else {
      router.push("/directory");
    }
  };

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-forest-950">
      {/* Background image */}
      {/* TODO: Replace with client photo — hero background image (diverse professionals, handshake, office meeting) */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1800&q=80"
          alt="Professional network background"
          fill
          className="object-cover opacity-20"
          priority
        />
      </div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-forest-950 via-forest-900/95 to-forest-800/80" />

      {/* Decorative gold accent */}
      <div className="absolute top-1/3 right-0 w-96 h-96 rounded-full bg-gold-500/8 blur-3xl pointer-events-none z-0" />
      <div className="absolute bottom-0 left-1/4 w-64 h-64 rounded-full bg-forest-600/20 blur-3xl pointer-events-none z-0" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
        <div className="max-w-3xl">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-gold-500/40 bg-gold-500/10 mb-8">
            <div className="w-1.5 h-1.5 rounded-full bg-gold-500 animate-pulse" />
            <span className="text-gold-400 text-xs font-medium tracking-wide uppercase">
              The Premier Professional Directory
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black text-white leading-tight tracking-tight mb-6">
            Your Network Is{" "}
            <span className="text-gold-400">Your Net Worth.</span>
          </h1>

          <p className="text-lg sm:text-xl text-forest-200 leading-relaxed max-w-2xl mb-10">
            Connect with vetted small businesses and professionals across Georgia, Florida, North Carolina, and beyond. Trusted by investors, homeowners, and entrepreneurs.
          </p>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 mb-10 max-w-xl">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-forest-400" size={18} />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search businesses, services..."
                className="w-full pl-11 pr-4 py-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-forest-400 focus:outline-none focus:border-gold-400 focus:bg-white/15 text-sm transition-all"
              />
            </div>
            <button
              type="submit"
              className="flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-gold-500 hover:bg-gold-600 text-white font-semibold text-sm transition-all shadow-gold hover:shadow-none whitespace-nowrap"
            >
              Find a Business
              <ArrowRight size={16} />
            </button>
          </form>

          {/* CTAs */}
          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-white/30 text-white text-sm font-semibold hover:bg-white/10 transition-all"
            >
              List Your Business
              <ArrowRight size={14} />
            </Link>
            <div className="flex items-center gap-2 text-sm text-forest-300">
              <div className="flex -space-x-2">
                {[
                  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&q=80",
                  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=32&q=80",
                  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=32&q=80",
                ].map((src, i) => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-forest-900 overflow-hidden">
                    {/* TODO: Replace with client testimonial photos */}
                    <Image src={src} alt="Member" width={32} height={32} className="object-cover" />
                  </div>
                ))}
              </div>
              <span>{bizCount !== null ? `${bizCount}+ vetted businesses listed` : "Vetted businesses listed"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#faf8f4] to-transparent z-10" />
    </section>
  );
}
