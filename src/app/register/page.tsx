"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { CATEGORIES, STATES, PRICING_TIERS } from "@/lib/mockData";
import { createClient } from "@/lib/supabase";
import { Check, ArrowRight, ArrowLeft, Upload, X, ImagePlus, AlertCircle } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import Image from "next/image";

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
}

function ImageUploadBox({
  label, hint, preview, onSelect, onClear, uploading,
}: {
  label: string; hint: string;
  preview: string | null;
  onSelect: (f: File) => void; onClear: () => void;
  uploading: boolean;
}) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div>
      <p className="text-xs font-semibold text-slate-600 mb-2">{label}</p>
      {preview ? (
        <div className="relative aspect-video rounded-xl overflow-hidden border border-forest-200">
          <Image src={preview} alt={label} fill className="object-cover" />
          {!uploading && (
            <button
              type="button"
              onClick={onClear}
              className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors"
            >
              <X size={14} />
            </button>
          )}
          {uploading && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            </div>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => ref.current?.click()}
          className="w-full aspect-video border-2 border-dashed border-forest-200 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-forest-400 hover:bg-forest-50/50 transition-colors"
        >
          <ImagePlus size={24} className="text-forest-400" />
          <span className="text-xs text-slate-500 font-medium">{hint}</span>
          <span className="text-xs text-slate-400">JPG, PNG, WEBP · max 10 MB</span>
        </button>
      )}
      <input
        ref={ref}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onSelect(f); e.target.value = ""; }}
      />
    </div>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();

  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [form, setForm] = useState<FormData>({
    name: "", category: "", state: "", description: "",
    email: "", phone: "", website: "", social: "", tier: "basic",
  });

  // Image state
  const [logoFile, setLogoFile]         = useState<File | null>(null);
  const [logoPreview, setLogoPreview]   = useState<string | null>(null);
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoUrl, setLogoUrl]           = useState<string | null>(null);

  const [galleryFiles, setGalleryFiles]     = useState<(File | null)[]>([null, null, null]);
  const [galleryPreviews, setGalleryPreviews] = useState<(string | null)[]>([null, null, null]);
  const [galleryUploading, setGalleryUploading] = useState([false, false, false]);
  const [galleryUrls, setGalleryUrls]       = useState<(string | null)[]>([null, null, null]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user: u } }) => {
      setUser(u);
      setAuthLoading(false);
    });
  }, []);

  const update = (field: keyof FormData, value: string) =>
    setForm((f) => ({ ...f, [field]: value }));

  const uploadImage = async (file: File, path: string): Promise<string> => {
    const { data, error } = await supabase.storage
      .from("business-images")
      .upload(path, file, { upsert: true, contentType: file.type });
    if (error) throw new Error(error.message);
    const { data: { publicUrl } } = supabase.storage
      .from("business-images")
      .getPublicUrl(data.path);
    return publicUrl;
  };

  const handleLogoSelect = async (file: File) => {
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
    if (!user) return;
    setLogoUploading(true);
    try {
      const url = await uploadImage(file, `${user.id}/logo/${Date.now()}-${file.name}`);
      setLogoUrl(url);
    } catch { /* shown at submit */ }
    setLogoUploading(false);
  };

  const handleLogoClear = () => {
    setLogoFile(null);
    setLogoPreview(null);
    setLogoUrl(null);
  };

  const handleGallerySelect = async (file: File, idx: number) => {
    const newFiles    = [...galleryFiles];    newFiles[idx] = file;
    const newPreviews = [...galleryPreviews]; newPreviews[idx] = URL.createObjectURL(file);
    setGalleryFiles(newFiles);
    setGalleryPreviews(newPreviews);
    if (!user) return;
    const newUploading = [...galleryUploading]; newUploading[idx] = true;
    setGalleryUploading(newUploading);
    try {
      const url = await uploadImage(file, `${user.id}/gallery/${idx}-${Date.now()}-${file.name}`);
      const newUrls = [...galleryUrls]; newUrls[idx] = url;
      setGalleryUrls(newUrls);
    } catch { /* shown at submit */ }
    const done = [...galleryUploading]; done[idx] = false;
    setGalleryUploading(done);
  };

  const handleGalleryClear = (idx: number) => {
    const newFiles    = [...galleryFiles];    newFiles[idx] = null;
    const newPreviews = [...galleryPreviews]; newPreviews[idx] = null;
    const newUrls     = [...galleryUrls];     newUrls[idx] = null;
    setGalleryFiles(newFiles);
    setGalleryPreviews(newPreviews);
    setGalleryUrls(newUrls);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { router.push("/auth"); return; }

    // Make sure all uploads finished
    if (logoFile && !logoUrl) { setSubmitError("Logo is still uploading, please wait."); return; }
    if (galleryFiles.some((f, i) => f && !galleryUrls[i])) {
      setSubmitError("Some photos are still uploading, please wait."); return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();

      // 1. Create the business record (status: pending)
      const res = await fetch("/api/businesses/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          name: form.name,
          category_slug: form.category,
          state: form.state,
          description: form.description,
          email: form.email,
          phone: form.phone,
          website: form.website,
          social: form.social,
          tier: form.tier,
          logo_url: logoUrl,
          images: galleryUrls.filter(Boolean),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Submission failed");

      // 2. For paid tiers, redirect to Stripe Checkout for subscription
      if (form.tier === "standard" || form.tier === "premium") {
        const checkoutRes = await fetch("/api/register/checkout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({ tier: form.tier, businessId: data.id }),
        });
        const checkoutData = await checkoutRes.json();
        if (!checkoutRes.ok) throw new Error(checkoutData.error || "Checkout failed");
        window.location.href = checkoutData.url;
        return;
      }

      // Basic tier — no payment needed
      setSubmitted(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Loading auth ──────────────────────────────────────────────────────────
  if (authLoading) {
    return (
      <div className="min-h-screen bg-cream pt-20 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-forest-200 border-t-forest-800 rounded-full animate-spin" />
      </div>
    );
  }

  // ── Not logged in ─────────────────────────────────────────────────────────
  if (!user) {
    return (
      <div className="min-h-screen bg-cream pt-20 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 rounded-full bg-forest-100 flex items-center justify-center mx-auto mb-5">
            <Upload className="text-forest-800" size={28} />
          </div>
          <h1 className="text-2xl font-black text-forest-900 mb-3">Sign In Required</h1>
          <p className="text-slate-500 mb-6 text-sm">
            You need an account to list your business. Sign in or create a free account to get started.
          </p>
          <a
            href="/auth"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-forest-800 text-white font-bold text-sm hover:bg-forest-700 transition-colors"
          >
            Sign In / Create Account
          </a>
        </div>
      </div>
    );
  }

  // ── Success screen ────────────────────────────────────────────────────────
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
            Our team reviews applications within 1–3 business days. You can check the status from your dashboard.
          </p>
          <a
            href="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-forest-800 text-white font-bold text-sm hover:bg-forest-700 transition-colors"
          >
            Go to Dashboard
          </a>
        </div>
      </div>
    );
  }

  // ── Form ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-cream pt-20">
      <div className="bg-forest-800 text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <h1 className="text-2xl font-black mb-1">List Your Business</h1>
          <p className="text-forest-200 text-sm">Join our vetted network of professionals</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Progress */}
        <div className="mb-10">
          <div className="flex items-center gap-0">
            {STEPS.map((label, i) => (
              <div key={i} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                    i < step ? "bg-forest-800 text-white" : i === step ? "bg-gold-500 text-white" : "bg-forest-100 text-forest-400"
                  }`}>
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

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-card p-8">
          <h2 className="text-lg font-bold text-forest-900 mb-6">{STEPS[step]}</h2>

          {submitError && (
            <div className="mb-5 flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-200">
              <AlertCircle size={16} className="text-red-600 shrink-0" />
              <p className="text-sm text-red-700">{submitError}</p>
            </div>
          )}

          <form onSubmit={step === STEPS.length - 1 ? handleSubmit : (e) => { e.preventDefault(); setSubmitError(null); setStep(s => s + 1); }}>

            {/* Step 1: Business Info */}
            {step === 0 && (
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Business Name *</label>
                  <input type="text" required placeholder="Your Business Name" value={form.name}
                    onChange={e => update("name", e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-forest-200 bg-cream text-sm focus:outline-none focus:border-forest-400 text-slate-700" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Category *</label>
                  <select required value={form.category} onChange={e => update("category", e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-forest-200 bg-cream text-sm focus:outline-none focus:border-forest-400 text-slate-700">
                    <option value="">Select a category</option>
                    {CATEGORIES.map(c => <option key={c.id} value={c.slug}>{c.icon} {c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">State *</label>
                  <select required value={form.state} onChange={e => update("state", e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-forest-200 bg-cream text-sm focus:outline-none focus:border-forest-400 text-slate-700">
                    <option value="">Select your state</option>
                    {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Business Description *</label>
                  <textarea required placeholder="Describe your business, services, and what makes you stand out..."
                    value={form.description} onChange={e => update("description", e.target.value)}
                    rows={4} maxLength={500}
                    className="w-full px-4 py-3 rounded-xl border border-forest-200 bg-cream text-sm focus:outline-none focus:border-forest-400 text-slate-700 resize-none" />
                  <p className="text-xs text-slate-400 mt-1">{form.description.length} / 500</p>
                </div>
              </div>
            )}

            {/* Step 2: Contact */}
            {step === 1 && (
              <div className="space-y-5">
                {[
                  { id: "email",   label: "Business Email *",       type: "email", placeholder: "contact@yourbusiness.com", required: true },
                  { id: "phone",   label: "Phone Number *",          type: "tel",   placeholder: "(555) 000-0000",           required: true },
                  { id: "website", label: "Website (optional)",      type: "url",   placeholder: "https://yourbusiness.com", required: false },
                  { id: "social",  label: "Social Handle (optional)",type: "text",  placeholder: "@yourbusiness",            required: false },
                ].map(field => (
                  <div key={field.id}>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">{field.label}</label>
                    <input type={field.type} required={field.required} placeholder={field.placeholder}
                      value={form[field.id as keyof FormData] as string}
                      onChange={e => update(field.id as keyof FormData, e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-forest-200 bg-cream text-sm focus:outline-none focus:border-forest-400 text-slate-700" />
                  </div>
                ))}
              </div>
            )}

            {/* Step 3: Photos */}
            {step === 2 && (
              <div className="space-y-6">
                <ImageUploadBox
                  label="Business Logo / Cover Photo"
                  hint="Click to upload your logo or main photo"
                  preview={logoPreview}
                  onSelect={handleLogoSelect}
                  onClear={handleLogoClear}
                  uploading={logoUploading}
                />

                <div>
                  <p className="text-xs font-semibold text-slate-600 mb-3">Gallery Photos (up to 3)</p>
                  <div className="grid grid-cols-3 gap-3">
                    {[0, 1, 2].map(idx => (
                      <div key={idx}>
                        {galleryPreviews[idx] ? (
                          <div className="relative aspect-square rounded-xl overflow-hidden border border-forest-200">
                            <Image src={galleryPreviews[idx]!} alt={`Photo ${idx + 1}`} fill className="object-cover" />
                            {!galleryUploading[idx] && (
                              <button type="button" onClick={() => handleGalleryClear(idx)}
                                className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors">
                                <X size={11} />
                              </button>
                            )}
                            {galleryUploading[idx] && (
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              </div>
                            )}
                          </div>
                        ) : (
                          <label className="block aspect-square border-2 border-dashed border-forest-200 rounded-xl flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-forest-400 hover:bg-forest-50/50 transition-colors">
                            <ImagePlus size={18} className="text-forest-300" />
                            <span className="text-xs text-slate-400">Photo {idx + 1}</span>
                            <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
                              onChange={e => { const f = e.target.files?.[0]; if (f) handleGallerySelect(f, idx); e.target.value = ""; }} />
                          </label>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <p className="text-xs text-slate-400 bg-forest-50 rounded-xl p-3">
                  Images are uploaded immediately when selected and stored securely. You can skip this step and add photos later from your dashboard.
                </p>
              </div>
            )}

            {/* Step 4: Tier */}
            {step === 3 && (
              <div className="space-y-4">
                {PRICING_TIERS.map(tier => (
                  <label key={tier.id} className={`flex items-start gap-4 p-5 rounded-xl border-2 cursor-pointer transition-all ${
                    form.tier === tier.name.toLowerCase() ? "border-forest-800 bg-forest-50" : "border-forest-100 hover:border-forest-200"
                  }`}>
                    <input type="radio" name="tier" value={tier.name.toLowerCase()}
                      checked={form.tier === tier.name.toLowerCase()}
                      onChange={e => update("tier", e.target.value)} className="mt-1" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-forest-900">{tier.name}</span>
                        <span className="font-black text-forest-800">{tier.price === 0 ? "Free" : `$${tier.price}/mo`}</span>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {tier.features.slice(0, 3).map(f => (
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
                {/* Logo preview */}
                {logoPreview && (
                  <div className="relative w-full h-40 rounded-xl overflow-hidden border border-forest-100">
                    <Image src={logoPreview} alt="Logo" fill className="object-cover" />
                  </div>
                )}

                <div className="bg-cream rounded-xl p-5 space-y-3">
                  {[
                    { label: "Business Name", value: form.name },
                    { label: "Category", value: CATEGORIES.find(c => c.slug === form.category)?.name || form.category },
                    { label: "State", value: form.state },
                    { label: "Email", value: form.email },
                    { label: "Phone", value: form.phone },
                    { label: "Website", value: form.website },
                    { label: "Tier", value: PRICING_TIERS.find(t => t.name.toLowerCase() === form.tier)?.name || form.tier },
                    { label: "Photos", value: [logoFile, ...galleryFiles].filter(Boolean).length > 0
                        ? `${[logoFile, ...galleryFiles].filter(Boolean).length} photo(s) uploaded` : "None" },
                  ].filter(item => item.value).map(item => (
                    <div key={item.label} className="flex justify-between text-sm">
                      <span className="text-slate-500">{item.label}</span>
                      <span className="font-semibold text-forest-900 text-right max-w-xs">{item.value}</span>
                    </div>
                  ))}
                </div>

                <div className="bg-gold-50 border border-gold-200 rounded-xl p-4 text-sm text-gold-800">
                  By submitting, your listing will be reviewed by our team within 1–3 business days before going live.
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between pt-8 mt-8 border-t border-forest-50">
              <button type="button" onClick={() => setStep(s => s - 1)} disabled={step === 0}
                className="flex items-center gap-2 px-5 py-3 rounded-xl border border-forest-200 text-forest-800 font-semibold text-sm hover:bg-forest-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                <ArrowLeft size={14} /> Back
              </button>
              <button type="submit" disabled={submitting}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-forest-800 hover:bg-forest-700 disabled:opacity-70 disabled:cursor-not-allowed text-white font-bold text-sm transition-colors">
                {submitting ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Submitting...</>
                ) : (
                  <>{step === STEPS.length - 1 ? "Submit Application" : "Continue"} <ArrowRight size={14} /></>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
