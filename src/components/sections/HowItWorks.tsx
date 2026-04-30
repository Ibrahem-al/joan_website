import { Search, UserCheck, TrendingUp } from "lucide-react";

const STEPS = [
  {
    number: "01",
    icon: Search,
    title: "Search",
    description: "Browse our curated directory of vetted professionals by category, state, or keyword. Every listing is reviewed before approval.",
  },
  {
    number: "02",
    icon: UserCheck,
    title: "Connect",
    description: "Review business profiles, contact directly or request a consultation. Get matched with the right professional for your needs.",
  },
  {
    number: "03",
    icon: TrendingUp,
    title: "Grow",
    description: "Build lasting business relationships, get referrals, and grow your network across our expanding community of professionals.",
  },
];

export default function HowItWorks() {
  return (
    <section className="py-24 bg-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-forest-50 border border-forest-200 mb-4">
            <span className="text-forest-800 text-xs font-semibold uppercase tracking-wide">How It Works</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-forest-900 mb-4">
            Three steps to your next connection
          </h2>
          <p className="text-slate-500 text-lg max-w-xl mx-auto">
            Our streamlined process gets you from search to trusted relationship in minutes, not weeks.
          </p>
        </div>

        {/* Steps */}
        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {/* Connector line (desktop) */}
          <div className="hidden md:block absolute top-10 left-1/3 right-1/3 h-px bg-gradient-to-r from-forest-200 via-gold-400 to-forest-200 z-0" />

          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={step.number} className="relative text-center group">
                {/* Number circle */}
                <div className="relative inline-flex mb-6">
                  <div className="w-20 h-20 rounded-2xl bg-white border-2 border-forest-100 shadow-card flex items-center justify-center group-hover:border-gold-400 group-hover:shadow-card-hover transition-all duration-300 relative z-10">
                    <Icon className="text-forest-800 group-hover:text-gold-500 transition-colors" size={28} />
                  </div>
                  <span className="absolute -top-2 -right-2 w-7 h-7 rounded-lg bg-forest-800 text-white text-xs font-black flex items-center justify-center z-20">
                    {i + 1}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-forest-900 mb-3">{step.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed max-w-xs mx-auto">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
