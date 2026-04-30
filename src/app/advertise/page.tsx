import Link from "next/link";
import { PRICING_TIERS } from "@/lib/mockData";
import { Check, X, ArrowRight, Star } from "lucide-react";

export default function AdvertisePage() {
  return (
    <div className="min-h-screen bg-cream pt-20">
      {/* Header */}
      <div className="bg-forest-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-3xl sm:text-4xl font-black mb-3">Grow Your Business</h1>
          <p className="text-forest-200 text-base max-w-xl mx-auto">
            Choose the listing tier that fits your goals. All prices are managed from the admin panel — no code changes needed.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {PRICING_TIERS.map((tier) => (
            <div
              key={tier.id}
              className={`rounded-2xl overflow-hidden flex flex-col transition-all ${
                tier.isFeatured
                  ? "shadow-card-hover ring-2 ring-forest-800 -translate-y-2"
                  : "shadow-card border border-forest-50"
              }`}
            >
              {/* Featured badge */}
              {tier.isFeatured && (
                <div className="bg-forest-800 text-center py-2">
                  <span className="text-gold-400 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-1">
                    <Star size={10} className="fill-gold-400" /> Most Popular
                  </span>
                </div>
              )}

              <div className={`p-8 flex-1 flex flex-col ${tier.isFeatured ? "bg-white" : "bg-white"}`}>
                {/* Tier name & price */}
                <div className="mb-6">
                  <h3 className="font-black text-forest-900 text-xl mb-3">{tier.name}</h3>
                  <div className="flex items-baseline gap-1">
                    {tier.price === 0 ? (
                      <span className="text-4xl font-black text-forest-900">Free</span>
                    ) : (
                      <>
                        <span className="text-4xl font-black text-forest-900">${tier.price}</span>
                        <span className="text-slate-400 text-sm">/{tier.billingPeriod}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-3 flex-1 mb-8">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-sm text-slate-700">
                      <Check size={15} className="text-forest-700 shrink-0 mt-0.5" />
                      {feature}
                    </li>
                  ))}
                  {tier.missingFeatures.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-sm text-slate-400">
                      <X size={15} className="text-slate-300 shrink-0 mt-0.5" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/register"
                  className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm transition-all ${
                    tier.isFeatured
                      ? "bg-forest-800 hover:bg-forest-700 text-white shadow-card hover:shadow-card-hover"
                      : "border-2 border-forest-200 text-forest-800 hover:border-forest-400 hover:bg-forest-50"
                  }`}
                >
                  Get Listed
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-black text-forest-900 text-center mb-8">Common Questions</h2>
          <div className="space-y-4">
            {[
              {
                q: "Can I change my tier later?",
                a: "Yes. You can upgrade or downgrade your listing tier at any time from your business dashboard.",
              },
              {
                q: "How long does approval take?",
                a: "New business registrations are reviewed by our team within 1-3 business days. You'll receive an email confirmation once approved.",
              },
              {
                q: "Is there a contract or commitment?",
                a: "Standard and Premium tiers are billed monthly with no long-term commitment. Cancel anytime with no penalties.",
              },
              {
                q: "What does 'top of category' mean?",
                a: "Premium listings appear first when clients browse your specific category, significantly increasing your visibility.",
              },
            ].map((faq) => (
              <div key={faq.q} className="bg-white rounded-xl p-6 shadow-card border border-forest-50">
                <h4 className="font-bold text-forest-900 text-sm mb-2">{faq.q}</h4>
                <p className="text-sm text-slate-500 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
