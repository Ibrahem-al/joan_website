import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export default function CTABanner() {
  return (
    <section className="py-24 bg-forest-800 relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-gold-500/8 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-forest-600/30 blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-gold-500/40 bg-gold-500/10 mb-6">
          <Sparkles size={12} className="text-gold-400" />
          <span className="text-gold-400 text-xs font-medium tracking-wide uppercase">
            Grow Your Network Today
          </span>
        </div>

        <h2 className="text-4xl sm:text-5xl font-black text-white mb-6 leading-tight">
          Ready to grow your network?
        </h2>

        <p className="text-forest-200 text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
          Whether you&apos;re looking to hire a trusted professional or list your business for thousands of clients to find, your next opportunity starts here.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/apply"
            className="flex items-center gap-2 px-8 py-4 rounded-xl bg-gold-500 hover:bg-gold-600 text-white font-bold text-sm transition-all shadow-gold hover:shadow-none"
          >
            Find a Professional
            <ArrowRight size={16} />
          </Link>
          <Link
            href="/register"
            className="flex items-center gap-2 px-8 py-4 rounded-xl border border-white/30 text-white font-semibold text-sm hover:bg-white/10 transition-all"
          >
            List Your Business
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
