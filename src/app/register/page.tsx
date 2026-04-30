"use client";

import { useState } from "react";
import { CATEGORIES, STATES, PRICING_TIERS } from "@/lib/mockData";
import { Check, ArrowRight, ArrowLeft, Upload } from "lucide-react";

const STEPS = ["Business Info", "Contact Details", "Photos & Logo", "Choose Tier", "Review & Submit"];

interface FormData {
  name: string;
  category: string;
  state: string;
  description: string;
  email: string;
  phone: string;
  website: string;
  social: string;
  tier: string;
  logoFile: string;
  photos: string[];
}

export default function RegisterPage() {
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState<FormData>({
    name: "",
    category: "",
    state: "",
    description: "",
    email: "",
    phone: "",
    website: "",
    social: "",
    tier: "basic",
    logoFile: "",
    photos: [],
  });

  const update = (field: keyof FormData, value: string) =>
    setForm((f) => ({ ...f, [field]: value }));

  const handleNext = () => {
    if (step < STEPS.length - 1) setStep((s) => s + 1);
  };

  const handleBack = () => {
    if (step > 0) setStep((s) => s - 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Save to Supabase 'businesses' table with status 'pending' once connected
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-cream pt-20 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-20 h-20 rounded-full bg-forest-100 flex items-center justify-center mx-auto mb-6">
            <Check className="text-forest-800" size={36} />
          </div>
          <h1 className="text-2xl font-black text-forest-900 mb-3">Application Received!</h1>
          <p className="text-slate-500 mb-2">
            <strong className="text-forest-900">{form.name}</strong> has been submitted for review.
          </p>
          <p className="text-slate-400 text-sm mb-8">
            Our team reviews applications within 1-3 business days. You&apos;ll receive a confirmation email at{" "}
            <strong>{form.email}</strong> once approved.
          </p>
          <a href="/" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-forest-800 text-white font-bold text-sm hover:bg-forest-700 transition-colors">
            Back to Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream pt-20">
      {/* Header */}
      <div className="bg-forest-800 text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <h1 className="text-2xl font-black mb-1">Register Your Business</h1>
          <p className="text-forest-200 text-sm">Join our vetted network of professionals</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Progress bar */}
        <div className="mb-10">
          <div className="flex items-center gap-0">
            {STEPS.map((label, i) => (
              <div key={i} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                      i < step
                        ? "bg-forest-800 text-white"
                        : i === step
                        ? "bg-gold-500 text-white"
                        : "bg-forest-100 text-forest-400"
                    }`}
                  >
                    {i < step ? <Check size={14} /> : i + 1}
                  </div>
                  <span className={`text-xs mt-1 font-medium hidden sm:block ${i === step ? "text-forest-800" : "text-slate-400"}`}>
                    {label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-px mx-2 mb-4 transition-colors ${i < step ? "bg-forest-800" : "bg-forest-100"}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form card */}
        <div className="bg-white rounded-2xl shadow-card p-8">
          <h2 className="text-lg font-bold text-forest-900 mb-6">{STEPS[step]}</h2>

          <form onSubmit={step === STEPS.length - 1 ? handleSubmit : (e) => { e.preventDefault(); handleNext(); }}>
            {/* Step 1: Business Info */}
            {step === 0 && (
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Business Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Your Business Name"
                    value={form.name}
                    onChange={(e) => update("name", e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-forest-200 bg-cream text-sm focus:outline-none focus:border-forest-400 text-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Category *</label>
                  <select
                    required
                    value={form.category}
                    onChange={(e) => update("category", e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-forest-200 bg-cream text-sm focus:outline-none focus:border-forest-400 text-slate-700"
                  >
                    <option value="">Select a category</option>
                    {CATEGORIES.map((c) => (
                      <option key={c.id} value={c.slug}>{c.icon} {c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">State *</label>
                  <select
                    required
                    value={form.state}
                    onChange={(e) => update("state", e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-forest-200 bg-cream text-sm focus:outline-none focus:border-forest-400 text-slate-700"
                  >
                    <option value="">Select your state</option>
                    {STATES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Business Description *</label>
                  <textarea
                    required
                    placeholder="Describe your business, services offered, and what makes you stand out..."
                    value={form.description}
                    onChange={(e) => update("description", e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border border-forest-200 bg-cream text-sm focus:outline-none focus:border-forest-400 text-slate-700 resize-none"
                  />
                  <p className="text-xs text-slate-400 mt-1">{form.description.length} / 500 characters</p>
                </div>
              </div>
            )}

            {/* Step 2: Contact */}
            {step === 1 && (
              <div className="space-y-5">
                {[
                  { id: "email", label: "Business Email *", type: "email", placeholder: "contact@yourbusiness.com", required: true },
                  { id: "phone", label: "Phone Number *", type: "tel", placeholder: "(555) 000-0000", required: true },
                  { id: "website", label: "Website (optional)", type: "url", placeholder: "https://yourbusiness.com", required: false },
                  { id: "social", label: "Social Handle (optional)", type: "text", placeholder: "@yourbusiness", required: false },
                ].map((field) => (
                  <div key={field.id}>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">{field.label}</label>
                    <input
                      type={field.type}
                      required={field.required}
                      placeholder={field.placeholder}
                      value={form[field.id as keyof FormData] as string}
                      onChange={(e) => update(field.id as keyof FormData, e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-forest-200 bg-cream text-sm focus:outline-none focus:border-forest-400 text-slate-700"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Step 3: Photos */}
            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-3">Business Logo</label>
                  {/* TODO: Connect Supabase storage upload once credentials are added */}
                  <div className="border-2 border-dashed border-forest-200 rounded-xl p-8 text-center hover:border-forest-400 transition-colors cursor-pointer">
                    <Upload className="mx-auto text-forest-400 mb-2" size={24} />
                    <p className="text-sm text-slate-500 mb-1">Click to upload your logo</p>
                    <p className="text-xs text-slate-400">PNG, JPG up to 5MB</p>
                    <p className="text-xs text-forest-400 mt-2">Demo: upload not connected yet</p>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-3">Business Photos (up to 3)</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[1, 2, 3].map((n) => (
                      <div key={n} className="aspect-square border-2 border-dashed border-forest-200 rounded-xl flex flex-col items-center justify-center text-center p-3 cursor-pointer hover:border-forest-400 transition-colors">
                        <Upload className="text-forest-300 mb-1" size={20} />
                        <span className="text-xs text-slate-400">Photo {n}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <p className="text-xs text-slate-400 bg-forest-50 rounded-xl p-3">
                  Photos will be stored in Supabase Storage. File uploads will be activated once the platform goes live.
                </p>
              </div>
            )}

            {/* Step 4: Tier */}
            {step === 3 && (
              <div className="space-y-4">
                {PRICING_TIERS.map((tier) => (
                  <label key={tier.id} className={`flex items-start gap-4 p-5 rounded-xl border-2 cursor-pointer transition-all ${form.tier === tier.name.toLowerCase() ? "border-forest-800 bg-forest-50" : "border-forest-100 hover:border-forest-200"}`}>
                    <input
                      type="radio"
                      name="tier"
                      value={tier.name.toLowerCase()}
                      checked={form.tier === tier.name.toLowerCase()}
                      onChange={(e) => update("tier", e.target.value)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-forest-900">{tier.name}</span>
                        <span className="font-black text-forest-800">
                          {tier.price === 0 ? "Free" : `$${tier.price}/mo`}
                        </span>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {tier.features.slice(0, 3).map((f) => (
                          <span key={f} className="text-xs text-slate-500 bg-white rounded-lg px-2 py-1 border border-forest-100">{f}</span>
                        ))}
                        {tier.features.length > 3 && (
                          <span className="text-xs text-forest-600 px-2 py-1">+{tier.features.length - 3} more</span>
                        )}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            )}

            {/* Step 5: Review */}
            {step === 4 && (
              <div className="space-y-6">
                <div className="bg-cream rounded-xl p-5 space-y-3">
                  {[
                    { label: "Business Name", value: form.name },
                    { label: "Category", value: CATEGORIES.find(c => c.slug === form.category)?.name || form.category },
                    { label: "State", value: form.state },
                    { label: "Email", value: form.email },
                    { label: "Phone", value: form.phone },
                    { label: "Tier", value: PRICING_TIERS.find(t => t.name.toLowerCase() === form.tier)?.name || form.tier },
                  ].filter(item => item.value).map((item) => (
                    <div key={item.label} className="flex justify-between text-sm">
                      <span className="text-slate-500">{item.label}</span>
                      <span className="font-semibold text-forest-900 text-right max-w-xs">{item.value}</span>
                    </div>
                  ))}
                </div>
                <div className="bg-gold-50 border border-gold-200 rounded-xl p-4 text-sm text-gold-800">
                  By submitting, your listing will be reviewed by our team within 1-3 business days before going live.
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex justify-between pt-8 mt-8 border-t border-forest-50">
              <button
                type="button"
                onClick={handleBack}
                disabled={step === 0}
                className="flex items-center gap-2 px-5 py-3 rounded-xl border border-forest-200 text-forest-800 font-semibold text-sm hover:bg-forest-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ArrowLeft size={14} />
                Back
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-forest-800 hover:bg-forest-700 text-white font-bold text-sm transition-colors"
              >
                {step === STEPS.length - 1 ? "Submit Application" : "Continue"}
                <ArrowRight size={14} />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
