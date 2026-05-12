"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase";
import { LogOut, Save, Upload, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { CATEGORIES, STATES } from "@/lib/mockData";

interface Business {
  id: string;
  name: string;
  categorySlug: string;
  state: string;
  description: string;
  email: string;
  phone: string;
  website: string;
  social: string;
  tier: string;
  status: string;
  logo_url: string | null;
  images: string[];
  is_featured: boolean;
}

interface Subscription {
  id: string;
  status: string;
  tier: string;
  current_period_end: string | null;
  stripe_customer_id: string | null;
}

const STATUS_CONFIG = {
  pending: { icon: Clock, color: "text-amber-600", bg: "bg-amber-50", label: "Pending Review" },
  approved: { icon: CheckCircle, color: "text-green-600", bg: "bg-green-50", label: "Approved" },
  suspended: { icon: AlertCircle, color: "text-red-600", bg: "bg-red-50", label: "Suspended" },
};

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [business, setBusiness] = useState<Business | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [form, setForm] = useState<Partial<Business>>({
    name: "",
    categorySlug: "",
    state: "",
    description: "",
    email: "",
    phone: "",
    website: "",
    social: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (!authUser) {
          router.push("/auth");
          return;
        }

        // Check if user is admin
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", authUser.id)
          .single();

        if (profile?.role === "admin") {
          console.log("Admin user detected, redirecting to /admin");
          router.push("/admin");
          return;
        }

        setUser(authUser);

        const { data: businessData } = await supabase
          .from("businesses")
          .select("*")
          .eq("user_id", authUser.id)
          .single();

        const { data: subscriptionData } = await supabase
          .from("subscriptions")
          .select("*")
          .eq("user_id", authUser.id)
          .single();

        if (businessData) {
          setBusiness(businessData);
          setForm(businessData);
        }

        if (subscriptionData) {
          setSubscription(subscriptionData);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [supabase, router]);

  const handleSave = async () => {
    if (!business) return;

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const { error: updateError } = await supabase
        .from("businesses")
        .update(form)
        .eq("id", business.id);

      if (updateError) {
        setError(updateError.message);
        setSaving(false);
        return;
      }

      setBusiness({ ...business, ...form });
      setSuccess("Business profile updated successfully!");

      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-forest-200 border-t-forest-800 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const StatusIcon = business ? STATUS_CONFIG[business.status as keyof typeof STATUS_CONFIG]?.icon : Clock;
  const statusConfig = business ? STATUS_CONFIG[business.status as keyof typeof STATUS_CONFIG] : STATUS_CONFIG.pending;

  return (
    <div className="min-h-screen bg-cream pt-20">
      {/* Header */}
      <div className="bg-forest-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black mb-1">Business Dashboard</h1>
              <p className="text-forest-200 text-sm">Manage your listing and account settings</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-forest-700 hover:bg-forest-600 text-white font-semibold text-sm transition-colors"
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Alerts */}
        {error && (
          <div className="mb-6 flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-200">
            <AlertCircle size={18} className="text-red-600 shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 flex items-center gap-3 p-4 rounded-xl bg-green-50 border border-green-200">
            <CheckCircle size={18} className="text-green-600 shrink-0" />
            <p className="text-sm text-green-700">{success}</p>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {business ? (
              <>
                {/* Status Card */}
                <div className={`rounded-2xl p-6 border border-forest-100 ${statusConfig.bg}`}>
                  <div className="flex items-center gap-3">
                    <StatusIcon size={24} className={statusConfig.color} />
                    <div>
                      <p className="text-sm font-semibold text-slate-600">Listing Status</p>
                      <p className={`text-lg font-bold ${statusConfig.color}`}>{statusConfig.label}</p>
                    </div>
                  </div>
                  {business.status === "pending" && (
                    <p className="text-xs text-slate-600 mt-3">
                      Your listing is under review. We typically approve listings within 1-3 business days.
                    </p>
                  )}
                </div>

                {/* Business Profile Form */}
                <div className="bg-white rounded-2xl shadow-card p-8">
                  <h2 className="text-xl font-bold text-forest-900 mb-6">Business Profile</h2>

                  <div className="space-y-5">
                    {/* Name */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">Business Name</label>
                      <input
                        type="text"
                        value={form.name || ""}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-forest-200 bg-cream text-sm focus:outline-none focus:border-forest-400 text-slate-700"
                      />
                    </div>

                    {/* Category + State */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Category</label>
                        <select
                          value={form.categorySlug || ""}
                          onChange={(e) => setForm({ ...form, categorySlug: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-forest-200 bg-cream text-sm focus:outline-none focus:border-forest-400 text-slate-700"
                        >
                          <option value="">Select category</option>
                          {CATEGORIES.map((c) => (
                            <option key={c.id} value={c.slug}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">State</label>
                        <select
                          value={form.state || ""}
                          onChange={(e) => setForm({ ...form, state: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-forest-200 bg-cream text-sm focus:outline-none focus:border-forest-400 text-slate-700"
                        >
                          <option value="">Select state</option>
                          {STATES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">Description</label>
                      <textarea
                        value={form.description || ""}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-3 rounded-xl border border-forest-200 bg-cream text-sm focus:outline-none focus:border-forest-400 text-slate-700 resize-none"
                      />
                    </div>

                    {/* Contact Information */}
                    <div className="pt-4 border-t border-forest-100">
                      <h3 className="font-semibold text-slate-900 mb-4">Contact Information</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Email</label>
                          <input
                            type="email"
                            value={form.email || ""}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-forest-200 bg-cream text-sm focus:outline-none focus:border-forest-400 text-slate-700"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Phone</label>
                            <input
                              type="tel"
                              value={form.phone || ""}
                              onChange={(e) => setForm({ ...form, phone: e.target.value })}
                              className="w-full px-4 py-3 rounded-xl border border-forest-200 bg-cream text-sm focus:outline-none focus:border-forest-400 text-slate-700"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Website</label>
                            <input
                              type="url"
                              value={form.website || ""}
                              onChange={(e) => setForm({ ...form, website: e.target.value })}
                              className="w-full px-4 py-3 rounded-xl border border-forest-200 bg-cream text-sm focus:outline-none focus:border-forest-400 text-slate-700"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Social Media Handle</label>
                          <input
                            type="text"
                            placeholder="@yourbusiness"
                            value={form.social || ""}
                            onChange={(e) => setForm({ ...form, social: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-forest-200 bg-cream text-sm focus:outline-none focus:border-forest-400 text-slate-700"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Save Button */}
                    <div className="pt-4 border-t border-forest-100">
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-forest-800 hover:bg-forest-700 disabled:opacity-70 disabled:cursor-not-allowed text-white font-bold text-sm transition-colors"
                      >
                        {saving ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save size={16} />
                            Save Changes
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white rounded-2xl shadow-card p-8 text-center">
                <p className="text-slate-500 mb-6">You don&apos;t have a business listing yet.</p>
                <a
                  href="/register"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-forest-800 hover:bg-forest-700 text-white font-bold text-sm transition-colors"
                >
                  Create Your Listing
                </a>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Subscription Card */}
            {subscription ? (
              <div className="bg-white rounded-2xl shadow-card p-6 border border-forest-100">
                <h3 className="font-bold text-forest-900 mb-4">Subscription</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase">Plan</p>
                    <p className="text-lg font-bold text-forest-800 capitalize">{subscription.tier}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase">Status</p>
                    <p className={`text-sm font-semibold capitalize ${subscription.status === "active" ? "text-green-600" : "text-amber-600"}`}>
                      {subscription.status}
                    </p>
                  </div>
                  {subscription.current_period_end && (
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase">Renews</p>
                      <p className="text-sm text-slate-700">
                        {new Date(subscription.current_period_end).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  {subscription.stripe_customer_id && (
                    <a
                      href={`https://billing.stripe.com/p/login/${subscription.stripe_customer_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full mt-4 px-4 py-2.5 rounded-xl border border-forest-200 text-forest-800 text-sm font-semibold text-center hover:bg-forest-50 transition-colors"
                    >
                      Manage Billing
                    </a>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-card p-6 border border-forest-100">
                <h3 className="font-bold text-forest-900 mb-3">Get Listed</h3>
                <p className="text-sm text-slate-600 mb-4">
                  Subscribe to appear in our directory and get found by new clients.
                </p>
                <a
                  href="/advertise"
                  className="block w-full px-4 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-600 text-white text-sm font-bold text-center transition-colors"
                >
                  View Plans
                </a>
              </div>
            )}

            {/* Account Info */}
            <div className="bg-white rounded-2xl shadow-card p-6 border border-forest-100">
              <h3 className="font-bold text-forest-900 mb-4">Account Info</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Email</p>
                  <p className="text-slate-700 break-all">{user?.email}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Account Type</p>
                  <p className="text-slate-700 capitalize">Business Owner</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
