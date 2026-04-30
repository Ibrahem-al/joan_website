"use client";

import { useState } from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Star, MapPin, Globe, Mail, Phone, ArrowLeft, Calendar, X } from "lucide-react";
import { BUSINESSES, CATEGORIES } from "@/lib/mockData";

interface Props {
  params: { slug: string };
}

function BookingModal({ business, onClose }: { business: (typeof BUSINESSES)[0]; onClose: () => void }) {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", notes: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Save to Supabase appointments table once connected
    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-forest-950/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-forest-50">
          <h3 className="font-bold text-forest-900">Request Consultation</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 transition-colors">
            <X size={20} />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-forest-50 flex items-center justify-center mx-auto mb-4">
              <Calendar className="text-forest-800" size={28} />
            </div>
            <h4 className="font-bold text-forest-900 text-lg mb-2">Request Sent!</h4>
            <p className="text-slate-500 text-sm mb-6">
              {business.name} will reach out to you at {form.email} within 1-2 business days.
            </p>
            <button onClick={onClose} className="px-6 py-3 rounded-xl bg-forest-800 text-white font-semibold text-sm hover:bg-forest-700 transition-colors">
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <p className="text-sm text-slate-500">with {business.name}</p>
            {[
              { id: "name", label: "Full Name", type: "text", placeholder: "Your full name" },
              { id: "email", label: "Email", type: "email", placeholder: "you@example.com" },
              { id: "phone", label: "Phone", type: "tel", placeholder: "(555) 000-0000" },
            ].map((field) => (
              <div key={field.id}>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">{field.label}</label>
                <input
                  type={field.type}
                  placeholder={field.placeholder}
                  required={field.id !== "phone"}
                  value={form[field.id as keyof typeof form]}
                  onChange={(e) => setForm((f) => ({ ...f, [field.id]: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-forest-200 bg-cream text-sm focus:outline-none focus:border-forest-400 text-slate-700"
                />
              </div>
            ))}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Notes (optional)</label>
              <textarea
                placeholder="Describe what you need..."
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-forest-200 bg-cream text-sm focus:outline-none focus:border-forest-400 text-slate-700 resize-none"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-gold-500 hover:bg-gold-600 text-white font-bold text-sm transition-colors shadow-gold"
            >
              Send Request
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function BusinessProfilePage({ params }: Props) {
  const business = BUSINESSES.find((b) => b.slug === params.slug);
  const [showBooking, setShowBooking] = useState(false);

  if (!business) return notFound();

  const catData = CATEGORIES.find((c) => c.slug === business.categorySlug);

  return (
    <div className="min-h-screen bg-cream pt-20">
      {showBooking && (
        <BookingModal business={business} onClose={() => setShowBooking(false)} />
      )}

      {/* Hero image */}
      <div className="relative h-72 sm:h-96 bg-forest-900">
        {/* TODO: Replace with actual business photo */}
        <Image
          src={business.image}
          alt={business.name}
          fill
          className="object-cover opacity-70"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-forest-950/80 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          <Link href="/directory" className="inline-flex items-center gap-1 text-xs text-white/70 hover:text-white mb-4 transition-colors">
            <ArrowLeft size={12} /> Back to Directory
          </Link>
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="px-2 py-1 rounded-lg bg-white/20 text-white text-xs font-medium">
                  {catData?.icon} {business.category}
                </span>
                <span className="px-2 py-1 rounded-lg bg-gold-500/80 text-white text-xs font-semibold capitalize">
                  {business.tier}
                </span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-white">{business.name}</h1>
              <div className="flex items-center gap-3 mt-2">
                <div className="flex items-center gap-1">
                  <Star size={14} className="fill-gold-400 text-gold-400" />
                  <span className="text-white font-semibold text-sm">{business.rating}</span>
                  <span className="text-white/60 text-sm">({business.reviewCount} reviews)</span>
                </div>
                <span className="flex items-center gap-1 text-white/70 text-sm">
                  <MapPin size={12} /> {business.state}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main */}
          <div className="lg:col-span-2 space-y-8">
            {/* About */}
            <div className="bg-white rounded-2xl p-8 shadow-card">
              <h2 className="text-lg font-bold text-forest-900 mb-4">About</h2>
              <p className="text-slate-600 leading-relaxed">{business.longDescription}</p>
            </div>

            {/* Photo gallery */}
            <div className="bg-white rounded-2xl p-8 shadow-card">
              <h2 className="text-lg font-bold text-forest-900 mb-4">Gallery</h2>
              <div className="grid grid-cols-3 gap-3">
                {business.images.map((img, i) => (
                  <div key={i} className="relative aspect-square rounded-xl overflow-hidden">
                    {/* TODO: Replace with client business photos */}
                    <Image src={img} alt={`${business.name} photo ${i + 1}`} fill className="object-cover hover:scale-105 transition-transform duration-300" />
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews placeholder */}
            <div className="bg-white rounded-2xl p-8 shadow-card">
              <h2 className="text-lg font-bold text-forest-900 mb-4">Reviews</h2>
              <div className="space-y-6">
                {[
                  { name: "James P.", text: "Excellent service, very professional and responsive. Highly recommend!", rating: 5, date: "March 2024" },
                  { name: "Tamara L.", text: "Found them through this network and could not be happier. Fair pricing, great communication.", rating: 5, date: "February 2024" },
                  { name: "Robert K.", text: "Solid work, arrived on time. Will use again.", rating: 4, date: "January 2024" },
                ].map((review, i) => (
                  <div key={i} className={i > 0 ? "pt-6 border-t border-forest-50" : ""}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-forest-900 text-sm">{review.name}</span>
                      <span className="text-xs text-slate-400">{review.date}</span>
                    </div>
                    <div className="flex gap-0.5 mb-2">
                      {[...Array(review.rating)].map((_, j) => (
                        <Star key={j} size={12} className="fill-gold-500 text-gold-500" />
                      ))}
                    </div>
                    <p className="text-sm text-slate-500">{review.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact card */}
            <div className="bg-white rounded-2xl p-6 shadow-card">
              <h3 className="font-bold text-forest-900 mb-5">Contact</h3>
              <div className="space-y-3 mb-6">
                <a href={`mailto:${business.email}`} className="flex items-center gap-3 text-sm text-slate-600 hover:text-forest-800 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-forest-50 flex items-center justify-center">
                    <Mail size={14} className="text-forest-700" />
                  </div>
                  {business.email}
                </a>
                <a href={`tel:${business.phone}`} className="flex items-center gap-3 text-sm text-slate-600 hover:text-forest-800 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-forest-50 flex items-center justify-center">
                    <Phone size={14} className="text-forest-700" />
                  </div>
                  {business.phone}
                </a>
                {business.website && (
                  <a href={business.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-slate-600 hover:text-forest-800 transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-forest-50 flex items-center justify-center">
                      <Globe size={14} className="text-forest-700" />
                    </div>
                    Visit Website
                  </a>
                )}
              </div>
              <button
                onClick={() => setShowBooking(true)}
                className="w-full py-3.5 rounded-xl bg-gold-500 hover:bg-gold-600 text-white font-bold text-sm transition-colors shadow-gold hover:shadow-none"
              >
                Request Consultation
              </button>
              <a
                href={`mailto:${business.email}`}
                className="mt-3 w-full flex items-center justify-center py-3 rounded-xl border border-forest-200 text-forest-800 font-semibold text-sm hover:bg-forest-50 transition-colors"
              >
                Send Email
              </a>
            </div>

            {/* Quick info */}
            <div className="bg-forest-800 rounded-2xl p-6 text-white">
              <h3 className="font-bold mb-4">Quick Info</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-forest-300">Category</span>
                  <span className="font-medium">{business.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-forest-300">State</span>
                  <span className="font-medium">{business.state}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-forest-300">Tier</span>
                  <span className="font-medium capitalize">{business.tier}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-forest-300">Rating</span>
                  <span className="font-medium flex items-center gap-1">
                    <Star size={12} className="fill-gold-400 text-gold-400" />
                    {business.rating} ({business.reviewCount})
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
