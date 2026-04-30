"use client";

import { useState } from "react";
import { SERVICES_LIST } from "@/lib/mockData";
import { Calendar } from "lucide-react";

const TIME_SLOTS = [
  "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM",
  "11:00 AM", "11:30 AM", "1:00 PM", "1:30 PM",
  "2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM",
  "4:00 PM", "4:30 PM",
];

function getDates(): Array<{ label: string; value: string; day: string }> {
  const dates = [];
  const today = new Date();
  for (let i = 1; i <= 14; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    if (d.getDay() !== 0 && d.getDay() !== 6) {
      dates.push({
        label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        value: d.toISOString().split("T")[0],
        day: d.toLocaleDateString("en-US", { weekday: "short" }),
      });
    }
    if (dates.length >= 10) break;
  }
  return dates;
}

export default function BookPage() {
  const dates = getDates();
  const [form, setForm] = useState({
    service: "",
    date: "",
    time: "",
    name: "",
    email: "",
    phone: "",
    businessName: "",
    notes: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const update = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Save to Supabase 'appointments' table once connected
    // TODO: Create Google Calendar event via gcal.ts helper once credentials are added
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-cream pt-20 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-20 h-20 rounded-full bg-forest-100 flex items-center justify-center mx-auto mb-6">
            <Calendar className="text-forest-800" size={32} />
          </div>
          <h1 className="text-2xl font-black text-forest-900 mb-3">Appointment Requested!</h1>
          <p className="text-slate-500 mb-2">
            Your <strong className="text-forest-900">{form.service}</strong> consultation has been scheduled for{" "}
            <strong className="text-forest-900">{form.date} at {form.time}</strong>.
          </p>
          <p className="text-slate-400 text-sm mb-8">
            A confirmation will be sent to <strong>{form.email}</strong>.
          </p>
          <div className="bg-forest-50 rounded-xl p-4 mb-8 text-sm text-forest-700">
            {/* TODO: When Google Calendar credentials are added, an invite will be automatically sent to the client email */}
            Calendar invite will be sent once Google Calendar integration is enabled.
          </div>
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h1 className="text-3xl sm:text-4xl font-black mb-2">Book a Consultation</h1>
          <p className="text-forest-200 text-base">
            Schedule a session with one of our network professionals.
          </p>
          {/* TODO: Add GOOGLE_CALENDAR_CLIENT_ID, GOOGLE_CALENDAR_CLIENT_SECRET, GOOGLE_CALENDAR_REFRESH_TOKEN to .env.local */}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Service + Date/Time */}
            <div className="space-y-6">
              {/* Service selector */}
              <div className="bg-white rounded-2xl p-6 shadow-card">
                <h2 className="font-bold text-forest-900 mb-4 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-forest-800 text-white text-xs flex items-center justify-center font-bold">1</span>
                  Select Service
                </h2>
                <div className="grid grid-cols-1 gap-2">
                  {SERVICES_LIST.slice(0, 8).map((service) => (
                    <label key={service} className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${form.service === service ? "bg-forest-50 border-2 border-forest-800" : "border-2 border-transparent hover:bg-cream"}`}>
                      <input
                        type="radio"
                        name="service"
                        value={service}
                        required
                        checked={form.service === service}
                        onChange={() => update("service", service)}
                        className="sr-only"
                      />
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${form.service === service ? "border-forest-800 bg-forest-800" : "border-slate-300"}`}>
                        {form.service === service && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                      <span className="text-sm font-medium text-slate-700">{service}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Date picker */}
              <div className="bg-white rounded-2xl p-6 shadow-card">
                <h2 className="font-bold text-forest-900 mb-4 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-forest-800 text-white text-xs flex items-center justify-center font-bold">2</span>
                  Select Date
                </h2>
                <div className="grid grid-cols-5 gap-2">
                  {dates.map((d) => (
                    <button
                      key={d.value}
                      type="button"
                      onClick={() => { update("date", d.value); update("time", ""); }}
                      className={`p-2 rounded-xl text-center transition-all ${form.date === d.value ? "bg-forest-800 text-white" : "bg-cream hover:bg-forest-50 text-slate-700"}`}
                    >
                      <div className="text-xs text-current opacity-70">{d.day}</div>
                      <div className="text-sm font-bold">{d.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Time slots */}
              {form.date && (
                <div className="bg-white rounded-2xl p-6 shadow-card">
                  <h2 className="font-bold text-forest-900 mb-4 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-forest-800 text-white text-xs flex items-center justify-center font-bold">3</span>
                    Select Time
                  </h2>
                  <div className="grid grid-cols-4 gap-2">
                    {TIME_SLOTS.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => update("time", slot)}
                        className={`py-2.5 rounded-xl text-xs font-semibold transition-all ${form.time === slot ? "bg-gold-500 text-white" : "bg-cream hover:bg-forest-50 text-slate-600"}`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right: Contact info */}
            <div className="bg-white rounded-2xl p-6 shadow-card h-fit">
              <h2 className="font-bold text-forest-900 mb-5 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-forest-800 text-white text-xs flex items-center justify-center font-bold">4</span>
                Your Information
              </h2>
              <div className="space-y-4">
                {[
                  { id: "name", label: "Full Name *", type: "text", placeholder: "Jane Smith" },
                  { id: "email", label: "Email *", type: "email", placeholder: "jane@example.com" },
                  { id: "phone", label: "Phone *", type: "tel", placeholder: "(555) 000-0000" },
                  { id: "businessName", label: "Business Name (optional)", type: "text", placeholder: "Your company" },
                ].map((field) => (
                  <div key={field.id}>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">{field.label}</label>
                    <input
                      type={field.type}
                      required={field.label.includes("*")}
                      placeholder={field.placeholder}
                      value={form[field.id as keyof typeof form] as string}
                      onChange={(e) => update(field.id, e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-forest-200 bg-cream text-sm focus:outline-none focus:border-forest-400 text-slate-700"
                    />
                  </div>
                ))}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Notes (optional)</label>
                  <textarea
                    placeholder="Tell us what you need..."
                    value={form.notes}
                    onChange={(e) => update("notes", e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-forest-200 bg-cream text-sm focus:outline-none focus:border-forest-400 text-slate-700 resize-none"
                  />
                </div>
              </div>

              {/* Summary */}
              {(form.service || form.date || form.time) && (
                <div className="mt-5 p-4 bg-forest-50 rounded-xl space-y-2 text-sm">
                  {form.service && <div className="flex justify-between"><span className="text-slate-500">Service</span><span className="font-semibold text-forest-900">{form.service}</span></div>}
                  {form.date && <div className="flex justify-between"><span className="text-slate-500">Date</span><span className="font-semibold text-forest-900">{form.date}</span></div>}
                  {form.time && <div className="flex justify-between"><span className="text-slate-500">Time</span><span className="font-semibold text-forest-900">{form.time}</span></div>}
                </div>
              )}

              <button
                type="submit"
                disabled={!form.service || !form.date || !form.time || !form.name || !form.email || !form.phone}
                className="mt-5 w-full py-4 rounded-xl bg-gold-500 hover:bg-gold-600 text-white font-bold text-sm transition-colors shadow-gold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Calendar size={16} />
                Confirm Booking
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
