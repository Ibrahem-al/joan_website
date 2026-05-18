"use client";

import { useState, useEffect } from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Star, MapPin, Globe, Mail, Phone, ArrowLeft, Calendar, X } from "lucide-react";
import { CATEGORIES } from "@/lib/mockData";
import { createClient } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

interface BusinessRow {
  id: string;
  slug: string;
  name: string;
  category_slug: string;
  state: string;
  rating: number;
  review_count: number;
  description: string;
  long_description: string;
  email: string;
  phone: string;
  website: string;
  social: string;
  tier: string;
  logo_url: string | null;
  images: string[] | null;
  is_featured: boolean;
}

interface ReviewRow {
  id: string;
  business_id: string;
  user_id: string;
  rating: number;
  text: string | null;
  created_at: string;
}

interface Props {
  params: { slug: string };
}

function StarPicker({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" onClick={() => onChange(n)}
          onMouseEnter={() => setHovered(n)} onMouseLeave={() => setHovered(0)}
          className="focus:outline-none">
          <Star size={28} className={`transition-colors ${n <= (hovered || value) ? "fill-gold-500 text-gold-500" : "fill-transparent text-slate-300"}`} />
        </button>
      ))}
    </div>
  );
}

function BookingModal({ business, onClose }: { business: BusinessRow; onClose: () => void }) {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", notes: "" });
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-forest-950/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-forest-50">
          <h3 className="font-bold text-forest-900">Request Consultation</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 transition-colors"><X size={20} /></button>
        </div>
        {submitted ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-forest-50 flex items-center justify-center mx-auto mb-4">
              <Calendar className="text-forest-800" size={28} />
            </div>
            <h4 className="font-bold text-forest-900 text-lg mb-2">Request Sent!</h4>
            <p className="text-slate-500 text-sm mb-6">{business.name} will reach out to you at {form.email} within 1-2 business days.</p>
            <button onClick={onClose} className="px-6 py-3 rounded-xl bg-forest-800 text-white font-semibold text-sm hover:bg-forest-700 transition-colors">Done</button>
          </div>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }} className="p-6 space-y-4">
            <p className="text-sm text-slate-500">with {business.name}</p>
            {[
              { id: "name", label: "Full Name", type: "text", placeholder: "Your full name" },
              { id: "email", label: "Email", type: "email", placeholder: "you@example.com" },
              { id: "phone", label: "Phone", type: "tel", placeholder: "(555) 000-0000" },
            ].map((field) => (
              <div key={field.id}>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">{field.label}</label>
                <input type={field.type} placeholder={field.placeholder} required={field.id !== "phone"}
                  value={form[field.id as keyof typeof form]}
                  onChange={(e) => setForm((f) => ({ ...f, [field.id]: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-forest-200 bg-cream text-sm focus:outline-none focus:border-forest-400 text-slate-700" />
              </div>
            ))}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Notes (optional)</label>
              <textarea placeholder="Describe what you need..." value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                rows={3} className="w-full px-4 py-3 rounded-xl border border-forest-200 bg-cream text-sm focus:outline-none focus:border-forest-400 text-slate-700 resize-none" />
            </div>
            <button type="submit" className="w-full py-3.5 rounded-xl bg-gold-500 hover:bg-gold-600 text-white font-bold text-sm transition-colors shadow-gold">Send Request</button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function BusinessProfilePage({ params }: Props) {
  const supabase = createClient();

  const [business, setBusiness] = useState<BusinessRow | null | undefined>(undefined);
  const [showBooking, setShowBooking] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [userReview, setUserReview] = useState<ReviewRow | null>(null);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  useEffect(() => {
    supabase.from("businesses").select("*").eq("slug", params.slug).eq("status", "approved").single()
      .then(({ data }) => setBusiness(data ?? null));
  }, [params.slug]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setCurrentUser(user));
  }, []);

  useEffect(() => {
    if (!business) return;
    supabase.from("reviews").select("*").eq("business_id", business.id).order("created_at", { ascending: false })
      .then(({ data }) => { if (data) setReviews(data); });
  }, [business]);

  useEffect(() => {
    if (!currentUser || reviews.length === 0) return;
    setUserReview(reviews.find((r) => r.user_id === currentUser.id) ?? null);
  }, [currentUser, reviews]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !business || reviewRating === 0) return;
    setSubmitting(true);
    setReviewError(null);

    const { error } = await supabase.from("reviews").insert({
      business_id: business.id, user_id: currentUser.id, rating: reviewRating, text: reviewText.trim() || null,
    });

    if (error) {
      setReviewError(error.code === "23505" ? "You have already reviewed this business." : error.message);
      setSubmitting(false);
      return;
    }

    const { data: fresh } = await supabase.from("reviews").select("*").eq("business_id", business.id).order("created_at", { ascending: false });
    if (fresh) { setReviews(fresh); setUserReview(fresh.find((r) => r.user_id === currentUser.id) ?? null); }

    const { data: updatedBiz } = await supabase.from("businesses").select("rating, review_count").eq("id", business.id).single();
    if (updatedBiz) setBusiness((prev) => prev ? { ...prev, ...updatedBiz } : prev);

    setReviewRating(0); setReviewText(""); setReviewSuccess(true); setSubmitting(false);
    setTimeout(() => setReviewSuccess(false), 3000);
  };

  if (business === undefined) {
    return <div className="min-h-screen bg-cream pt-20 flex items-center justify-center"><div className="w-10 h-10 border-4 border-forest-200 border-t-forest-800 rounded-full animate-spin" /></div>;
  }
  if (business === null) return notFound();

  const catData = CATEGORIES.find((c) => c.slug === business.category_slug);
  const gallery = business.images ?? [];

  return (
    <div className="min-h-screen bg-cream pt-20">
      {showBooking && <BookingModal business={business} onClose={() => setShowBooking(false)} />}

      <div className="relative h-72 sm:h-96 bg-forest-900">
        {business.logo_url ? (
          <Image src={business.logo_url} alt={business.name} fill className="object-cover opacity-70" priority />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-forest-950 to-forest-700" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-forest-950/80 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          <Link href="/businesses" className="inline-flex items-center gap-1 text-xs text-white/70 hover:text-white mb-4 transition-colors">
            <ArrowLeft size={12} /> Back to Businesses
          </Link>
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                {catData && <span className="px-2 py-1 rounded-lg bg-white/20 text-white text-xs font-medium">{catData.icon} {catData.name}</span>}
                <span className="px-2 py-1 rounded-lg bg-gold-500/80 text-white text-xs font-semibold capitalize">{business.tier}</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-white">{business.name}</h1>
              <div className="flex items-center gap-3 mt-2">
                {business.rating > 0 && (
                  <div className="flex items-center gap-1">
                    <Star size={14} className="fill-gold-400 text-gold-400" />
                    <span className="text-white font-semibold text-sm">{business.rating}</span>
                    <span className="text-white/60 text-sm">({business.review_count} {business.review_count === 1 ? "review" : "reviews"})</span>
                  </div>
                )}
                <span className="flex items-center gap-1 text-white/70 text-sm"><MapPin size={12} /> {business.state}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-2xl p-8 shadow-card">
              <h2 className="text-lg font-bold text-forest-900 mb-4">About</h2>
              <p className="text-slate-600 leading-relaxed">{business.long_description || business.description}</p>
            </div>

            {gallery.length > 0 && (
              <div className="bg-white rounded-2xl p-8 shadow-card">
                <h2 className="text-lg font-bold text-forest-900 mb-4">Gallery</h2>
                <div className="grid grid-cols-3 gap-3">
                  {gallery.map((img, i) => (
                    <div key={i} className="relative aspect-square rounded-xl overflow-hidden">
                      <Image src={img} alt={`${business.name} photo ${i + 1}`} fill className="object-cover hover:scale-105 transition-transform duration-300" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white rounded-2xl p-8 shadow-card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-forest-900">
                  Reviews {reviews.length > 0 && <span className="text-slate-400 font-normal text-base">({reviews.length})</span>}
                </h2>
                {business.rating > 0 && (
                  <div className="flex items-center gap-1.5">
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map(n => <Star key={n} size={14} className={n <= Math.round(business.rating) ? "fill-gold-500 text-gold-500" : "fill-transparent text-slate-200"} />)}
                    </div>
                    <span className="text-sm font-bold text-slate-700">{business.rating}</span>
                  </div>
                )}
              </div>

              {!currentUser ? (
                <div className="mb-8 p-4 rounded-xl bg-forest-50 border border-forest-100 text-center">
                  <p className="text-sm text-slate-600 mb-3">Sign in to leave a review</p>
                  <Link href="/auth" className="inline-flex px-5 py-2 rounded-lg bg-forest-800 text-white text-sm font-semibold hover:bg-forest-700 transition-colors">Sign In</Link>
                </div>
              ) : userReview ? (
                <div className="mb-8 p-4 rounded-xl bg-green-50 border border-green-100">
                  <p className="text-sm font-semibold text-green-700 mb-1">Your review</p>
                  <div className="flex gap-0.5 mb-1">
                    {[1,2,3,4,5].map(n => <Star key={n} size={13} className={n <= userReview.rating ? "fill-gold-500 text-gold-500" : "fill-transparent text-slate-300"} />)}
                  </div>
                  {userReview.text && <p className="text-sm text-slate-600">{userReview.text}</p>}
                </div>
              ) : (
                <form onSubmit={handleReviewSubmit} className="mb-8 p-5 rounded-xl bg-slate-50 border border-slate-100 space-y-4">
                  <p className="text-sm font-semibold text-slate-700">Leave a review</p>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 mb-2">Your rating *</p>
                    <StarPicker value={reviewRating} onChange={setReviewRating} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5">Your review (optional)</label>
                    <textarea value={reviewText} onChange={(e) => setReviewText(e.target.value)} placeholder="Share your experience..."
                      rows={3} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:border-forest-400 text-slate-700 resize-none" />
                  </div>
                  {reviewError && <p className="text-xs text-red-600">{reviewError}</p>}
                  {reviewSuccess && <p className="text-xs text-green-600">Review submitted — thank you!</p>}
                  <button type="submit" disabled={submitting || reviewRating === 0}
                    className="px-6 py-2.5 rounded-xl bg-forest-800 hover:bg-forest-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm transition-colors">
                    {submitting ? "Submitting..." : "Submit Review"}
                  </button>
                </form>
              )}

              {reviews.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-6">No reviews yet. Be the first!</p>
              ) : (
                <div className="space-y-6">
                  {reviews.map((review, i) => (
                    <div key={review.id} className={i > 0 ? "pt-6 border-t border-forest-50" : ""}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-forest-900 text-sm">Verified Member</span>
                        <span className="text-xs text-slate-400">{new Date(review.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })}</span>
                      </div>
                      <div className="flex gap-0.5 mb-2">
                        {[1,2,3,4,5].map(n => <Star key={n} size={12} className={n <= review.rating ? "fill-gold-500 text-gold-500" : "fill-transparent text-slate-200"} />)}
                      </div>
                      {review.text && <p className="text-sm text-slate-500">{review.text}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-card">
              <h3 className="font-bold text-forest-900 mb-5">Contact</h3>
              <div className="space-y-3 mb-6">
                {business.email && (
                  <a href={`mailto:${business.email}`} className="flex items-center gap-3 text-sm text-slate-600 hover:text-forest-800 transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-forest-50 flex items-center justify-center"><Mail size={14} className="text-forest-700" /></div>
                    {business.email}
                  </a>
                )}
                {business.phone && (
                  <a href={`tel:${business.phone}`} className="flex items-center gap-3 text-sm text-slate-600 hover:text-forest-800 transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-forest-50 flex items-center justify-center"><Phone size={14} className="text-forest-700" /></div>
                    {business.phone}
                  </a>
                )}
                {business.website && (
                  <a href={business.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-slate-600 hover:text-forest-800 transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-forest-50 flex items-center justify-center"><Globe size={14} className="text-forest-700" /></div>
                    Visit Website
                  </a>
                )}
              </div>
              <button onClick={() => setShowBooking(true)} className="w-full py-3.5 rounded-xl bg-gold-500 hover:bg-gold-600 text-white font-bold text-sm transition-colors shadow-gold hover:shadow-none">
                Request Consultation
              </button>
              {business.email && (
                <a href={`mailto:${business.email}`} className="mt-3 w-full flex items-center justify-center py-3 rounded-xl border border-forest-200 text-forest-800 font-semibold text-sm hover:bg-forest-50 transition-colors">
                  Send Email
                </a>
              )}
            </div>

            <div className="bg-forest-800 rounded-2xl p-6 text-white">
              <h3 className="font-bold mb-4">Quick Info</h3>
              <div className="space-y-3 text-sm">
                {catData && <div className="flex justify-between"><span className="text-forest-300">Category</span><span className="font-medium">{catData.name}</span></div>}
                <div className="flex justify-between"><span className="text-forest-300">State</span><span className="font-medium">{business.state}</span></div>
                <div className="flex justify-between"><span className="text-forest-300">Tier</span><span className="font-medium capitalize">{business.tier}</span></div>
                {business.rating > 0 && (
                  <div className="flex justify-between">
                    <span className="text-forest-300">Rating</span>
                    <span className="font-medium flex items-center gap-1"><Star size={12} className="fill-gold-400 text-gold-400" />{business.rating} ({business.review_count})</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
