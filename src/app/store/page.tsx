"use client";

import { useState } from "react";
import { DOCUMENTS } from "@/lib/mockData";
import { Download, ShieldCheck, CreditCard, X, Check } from "lucide-react";

const CATEGORY_COLORS: Record<string, string> = {
  Legal: "bg-purple-100 text-purple-700",
  Finance: "bg-blue-100 text-blue-700",
  Home: "bg-green-100 text-green-700",
};

function MockCheckoutModal({
  doc,
  onClose,
}: {
  doc: (typeof DOCUMENTS)[0];
  onClose: () => void;
}) {
  const [step, setStep] = useState<"checkout" | "success">("checkout");
  const [processing, setProcessing] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    card: "",
    expiry: "",
    cvv: "",
  });

  const formatCard = (val: string) =>
    val
      .replace(/\D/g, "")
      .slice(0, 16)
      .replace(/(.{4})/g, "$1 ")
      .trim();

  const formatExpiry = (val: string) => {
    const d = val.replace(/\D/g, "").slice(0, 4);
    return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
  };

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    // TODO: Connect real Stripe key when ready
    // Mock: simulate processing delay
    setTimeout(() => {
      setProcessing(false);
      setStep("success");
      // TODO: Track mock_purchase event via trackEvent() once analytics connected
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-forest-950/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-forest-800 flex items-center justify-center">
              <span className="text-gold-400 font-black text-xs">JN</span>
            </div>
            <span className="font-semibold text-slate-900 text-sm">Javona&apos;s Network</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 transition-colors">
            <X size={18} />
          </button>
        </div>

        {step === "success" ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-forest-50 flex items-center justify-center mx-auto mb-4">
              <Check className="text-forest-800" size={28} />
            </div>
            <h3 className="font-bold text-forest-900 text-xl mb-2">Payment Successful!</h3>
            <p className="text-slate-500 text-sm mb-2">{doc.title}</p>
            <p className="text-slate-400 text-xs mb-8">A receipt has been sent to {form.email || "your email"}</p>
            <a
              href={doc.fileUrl}
              download
              className="inline-flex items-center gap-2 w-full justify-center py-3.5 rounded-xl bg-forest-800 hover:bg-forest-700 text-white font-bold text-sm transition-colors mb-3"
            >
              <Download size={16} />
              Download Document
            </a>
            {/* TODO: Replace with real download link from Supabase storage once connected */}
            <p className="text-xs text-slate-400">
              Demo mode: file link is a placeholder.
            </p>
          </div>
        ) : (
          <form onSubmit={handlePay} className="p-6 space-y-4">
            <div className="bg-slate-50 rounded-xl p-4 mb-2">
              <p className="text-xs text-slate-500 mb-1">Purchasing</p>
              <p className="font-semibold text-slate-900 text-sm">{doc.title}</p>
              <p className="text-lg font-black text-forest-800 mt-1">${doc.price}.00</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Full Name</label>
              <input
                type="text"
                required
                placeholder="Jane Smith"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:border-forest-400 text-slate-700 placeholder-slate-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Email</label>
              <input
                type="email"
                required
                placeholder="jane@example.com"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:border-forest-400 text-slate-700 placeholder-slate-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Card Number</label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  required
                  placeholder="1234 5678 9012 3456"
                  value={form.card}
                  onChange={(e) => setForm((f) => ({ ...f, card: formatCard(e.target.value) }))}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:border-forest-400 text-slate-700 placeholder-slate-400 tabular-nums"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Expiry</label>
                <input
                  type="text"
                  required
                  placeholder="MM/YY"
                  value={form.expiry}
                  onChange={(e) => setForm((f) => ({ ...f, expiry: formatExpiry(e.target.value) }))}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:border-forest-400 text-slate-700 placeholder-slate-400 tabular-nums"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">CVV</label>
                <input
                  type="text"
                  required
                  placeholder="123"
                  maxLength={4}
                  value={form.cvv}
                  onChange={(e) => setForm((f) => ({ ...f, cvv: e.target.value.replace(/\D/g, "") }))}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:border-forest-400 text-slate-700 placeholder-slate-400 tabular-nums"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={processing}
              className="w-full py-4 rounded-xl bg-forest-800 hover:bg-forest-700 text-white font-bold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-80"
            >
              {processing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <ShieldCheck size={16} />
                  Pay ${doc.price}.00
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
              <ShieldCheck size={12} />
              <span>Demo mode — no real payment processed</span>
            </div>
            {/* TODO: Connect real Stripe key when ready */}
          </form>
        )}
      </div>
    </div>
  );
}

export default function StorePage() {
  const [selectedDoc, setSelectedDoc] = useState<(typeof DOCUMENTS)[0] | null>(null);

  return (
    <div className="min-h-screen bg-cream pt-20">
      {selectedDoc && (
        <MockCheckoutModal doc={selectedDoc} onClose={() => setSelectedDoc(null)} />
      )}

      {/* Header */}
      <div className="bg-forest-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h1 className="text-3xl sm:text-4xl font-black mb-2">Document Store</h1>
          <p className="text-forest-200 text-base">
            Professional templates, checklists, and guides — instantly downloadable.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Trust bar */}
        <div className="flex flex-wrap items-center gap-6 mb-12 pb-12 border-b border-forest-100">
          {[
            { icon: ShieldCheck, label: "Secure checkout" },
            { icon: Download, label: "Instant download" },
            { icon: Check, label: "Money-back guarantee" },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="flex items-center gap-2 text-sm text-slate-600">
                <Icon size={16} className="text-forest-700" />
                {item.label}
              </div>
            );
          })}
        </div>

        {/* Document grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {DOCUMENTS.map((doc) => (
            <div key={doc.id} className="bg-white rounded-2xl overflow-hidden shadow-card border border-forest-50 flex flex-col hover:shadow-card-hover transition-all duration-300">
              {/* Color header by category */}
              <div className="h-3 bg-forest-800" />
              <div className="p-8 flex-1 flex flex-col">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${CATEGORY_COLORS[doc.category] || "bg-slate-100 text-slate-600"}`}>
                    {doc.category}
                  </span>
                  <div className="text-right">
                    <div className="text-2xl font-black text-forest-900">${doc.price}</div>
                    <div className="text-xs text-slate-400">one-time</div>
                  </div>
                </div>

                <h3 className="font-bold text-forest-900 text-base leading-tight mb-3">{doc.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed flex-1 mb-6">{doc.description}</p>

                <button
                  onClick={() => setSelectedDoc(doc)}
                  className="w-full py-3.5 rounded-xl bg-forest-800 hover:bg-forest-700 text-white font-bold text-sm transition-colors flex items-center justify-center gap-2"
                >
                  <Download size={16} />
                  Buy &amp; Download
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Info note */}
        <p className="mt-8 text-center text-xs text-slate-400">
          All documents are managed from the admin panel. Prices and availability may be updated at any time.
        </p>
      </div>
    </div>
  );
}
