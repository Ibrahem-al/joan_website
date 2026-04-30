"use client";

import { useState } from "react";
import { STATES, CATEGORIES } from "@/lib/mockData";
import { Check, ArrowRight } from "lucide-react";

const BUDGET_RANGES = [
  "Under $500",
  "$500 - $2,000",
  "$2,000 - $5,000",
  "$5,000 - $10,000",
  "$10,000 - $25,000",
  "$25,000+",
];

const URGENCY_LEVELS = [
  { value: "asap", label: "ASAP (within 48 hours)" },
  { value: "week", label: "This week" },
  { value: "month", label: "This month" },
  { value: "flexible", label: "I am flexible" },
];

export default function ApplyPage() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    state: "",
    serviceType: "",
    budget: "",
    urgency: "",
    notes: "",
  });

  const update = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Save to Supabase 'intake_applications' table once connected
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-cream pt-20 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-20 h-20 rounded-full bg-forest-100 flex items-center justify-center mx-auto mb-6">
            <Check className="text-forest-800" size={32} />
          </div>
          <h1 className="text-2xl font-black text-forest-900 mb-3">Application Submitted!</h1>
          <p className="text-slate-500 mb-2">
            Thank you, <strong className="text-forest-900">{form.name}</strong>. We&apos;ve received your intake application.
          </p>
          <p className="text-slate-400 text-sm mb-8">
            Our team will review your needs and match you with the right professionals within 1-2 business days.
            We&apos;ll reach out at <strong>{form.email}</strong>.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <a href="/" className="px-5 py-3 rounded-xl border border-forest-200 text-forest-800 font-semibold text-sm text-center hover:bg-forest-50 transition-colors">
              Back to Home
            </a>
            <a href="/directory" className="px-5 py-3 rounded-xl bg-forest-800 text-white font-bold text-sm text-center hover:bg-forest-700 transition-colors">
              Browse Directory
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream pt-20">
      {/* Header */}
      <div className="bg-forest-800 text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h1 className="text-3xl sm:text-4xl font-black mb-3">Get Connected</h1>
          <p className="text-forest-200 text-base">
            Tell us what you need and we&apos;ll match you with vetted professionals from our network.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-white rounded-2xl shadow-card p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name + Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Jane Smith"
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-forest-200 bg-cream text-sm focus:outline-none focus:border-forest-400 text-slate-700"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Email *</label>
                <input
                  type="email"
                  required
                  placeholder="jane@example.com"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-forest-200 bg-cream text-sm focus:outline-none focus:border-forest-400 text-slate-700"
                />
              </div>
            </div>

            {/* Phone + State */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Phone Number</label>
                <input
                  type="tel"
                  placeholder="(555) 000-0000"
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-forest-200 bg-cream text-sm focus:outline-none focus:border-forest-400 text-slate-700"
                />
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
            </div>

            {/* Service type */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Service Needed *</label>
              <select
                required
                value={form.serviceType}
                onChange={(e) => update("serviceType", e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-forest-200 bg-cream text-sm focus:outline-none focus:border-forest-400 text-slate-700"
              >
                <option value="">Select a service category</option>
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.name}>{c.icon} {c.name}</option>
                ))}
              </select>
            </div>

            {/* Budget */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-3">Budget Range *</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {BUDGET_RANGES.map((budget) => (
                  <label
                    key={budget}
                    className={`flex items-center gap-2 p-3 rounded-xl cursor-pointer transition-all border-2 ${
                      form.budget === budget
                        ? "border-forest-800 bg-forest-50"
                        : "border-forest-100 hover:border-forest-200"
                    }`}
                  >
                    <input
                      type="radio"
                      name="budget"
                      value={budget}
                      required
                      checked={form.budget === budget}
                      onChange={() => update("budget", budget)}
                      className="sr-only"
                    />
                    <div className={`w-3.5 h-3.5 rounded-full border-2 shrink-0 flex items-center justify-center ${form.budget === budget ? "border-forest-800 bg-forest-800" : "border-slate-300"}`}>
                      {form.budget === budget && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    <span className="text-xs font-medium text-slate-700">{budget}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Urgency */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-3">Urgency *</label>
              <div className="grid grid-cols-2 gap-2">
                {URGENCY_LEVELS.map((level) => (
                  <label
                    key={level.value}
                    className={`flex items-center gap-2 p-3 rounded-xl cursor-pointer transition-all border-2 ${
                      form.urgency === level.value
                        ? "border-forest-800 bg-forest-50"
                        : "border-forest-100 hover:border-forest-200"
                    }`}
                  >
                    <input
                      type="radio"
                      name="urgency"
                      value={level.value}
                      required
                      checked={form.urgency === level.value}
                      onChange={() => update("urgency", level.value)}
                      className="sr-only"
                    />
                    <div className={`w-3.5 h-3.5 rounded-full border-2 shrink-0 flex items-center justify-center ${form.urgency === level.value ? "border-forest-800 bg-forest-800" : "border-slate-300"}`}>
                      {form.urgency === level.value && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    <span className="text-xs font-medium text-slate-700">{level.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Additional Notes</label>
              <textarea
                placeholder="Describe your situation, specific requirements, or anything else we should know..."
                value={form.notes}
                onChange={(e) => update("notes", e.target.value)}
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-forest-200 bg-cream text-sm focus:outline-none focus:border-forest-400 text-slate-700 resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-gold-500 hover:bg-gold-600 text-white font-bold transition-colors shadow-gold"
            >
              Submit Application
              <ArrowRight size={16} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
