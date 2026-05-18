import Link from "next/link";
import { Calendar, Check } from "lucide-react";
import Hero from "@/components/sections/Hero";
import StatsBar from "@/components/sections/StatsBar";
import HowItWorks from "@/components/sections/HowItWorks";
import FeaturedCategories from "@/components/sections/FeaturedCategories";
import Testimonials from "@/components/sections/Testimonials";
import CTABanner from "@/components/sections/CTABanner";

export default function HomePage() {
  return (
    <>
      <Hero />
      <StatsBar />
      <HowItWorks />
      <FeaturedCategories />
      <Testimonials />

      {/* Consultation Section */}
      <section className="py-20 bg-cream">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl shadow-card overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="p-10 lg:p-14">
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gold-50 border border-gold-200 text-gold-700 text-xs font-semibold uppercase tracking-wide mb-5">
                  <Calendar size={12} /> Free Consultation
                </span>
                <h2 className="text-3xl font-black text-forest-900 mb-4 leading-tight">
                  Not sure where to start?
                </h2>
                <p className="text-slate-500 mb-8 leading-relaxed">
                  Book a free consultation with one of our advisors. We&apos;ll help you find the right professional, explore your options, and get connected with vetted businesses that fit your needs.
                </p>
                <Link
                  href="/book"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-forest-800 text-white font-bold text-sm hover:bg-forest-700 transition-colors"
                >
                  <Calendar size={16} />
                  Book a Free Consultation
                </Link>
              </div>
              <div className="bg-forest-800 p-10 lg:p-14 flex flex-col justify-center">
                <div className="space-y-4">
                  {[
                    "Choose a date & time that works for you",
                    "Tell us what you're looking for",
                    "Get matched with vetted professionals",
                    "No commitment required",
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-gold-500 flex items-center justify-center shrink-0 mt-0.5">
                        <Check size={12} className="text-white" />
                      </div>
                      <p className="text-forest-200 text-sm">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <CTABanner />
    </>
  );
}
