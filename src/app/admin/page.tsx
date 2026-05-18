"use client";

import { useEffect, useState, type ElementType } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { CATEGORIES, STATES } from "@/lib/mockData";
import {
  X, Edit2, Trash2, Plus, BarChart2, Users, FileText, Building2, Upload,
  AlertCircle, CheckCircle, LogOut, Eye, ShoppingCart, ThumbsUp, ThumbsDown,
  Clock, Star, MessageSquare, Save,
} from "lucide-react";

type AdminTab = "overview" | "featured" | "businesses" | "reviews" | "documents";

const TAB_CONFIG: Array<{ id: AdminTab; label: string; icon: ElementType }> = [
  { id: "overview",   label: "Overview",    icon: BarChart2 },
  { id: "featured",   label: "Featured",    icon: Building2 },
  { id: "businesses", label: "Businesses",  icon: Users },
  { id: "reviews",    label: "Reviews",     icon: MessageSquare },
  { id: "documents",  label: "Documents",   icon: FileText },
];

interface Business {
  id: string;
  name: string;
  slug: string;
  category_slug: string;
  state: string;
  status: string;
  tier: string;
  is_featured: boolean;
  user_id: string | null;
  rating: number;
  review_count: number;
  description: string;
  email: string;
  phone: string;
  website: string;
  social: string;
}

interface AdminReview {
  id: string;
  business_id: string;
  user_id: string;
  rating: number;
  text: string | null;
  created_at: string;
  businesses: { name: string } | null;
}

interface AnalyticsEvent {
  id: number;
  session_id: string;
  event_type: string;
  page: string;
  created_at: string;
}

interface Document {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  preview_pages: number;
  is_published: boolean;
  preview_file_path: string | null;
}

const STATUS_COLORS: Record<string, string> = {
  approved:  "bg-green-100 text-green-700",
  pending:   "bg-amber-100 text-amber-700",
  rejected:  "bg-red-100 text-red-700",
  suspended: "bg-slate-100 text-slate-600",
};

const TIER_COLORS: Record<string, string> = {
  premium:  "bg-gold-100 text-gold-700",
  standard: "bg-blue-100 text-blue-700",
  basic:    "bg-slate-100 text-slate-600",
};

export default function AdminPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading]   = useState(true);
  const [authed, setAuthed]     = useState(false);
  const [tab, setTab]           = useState<AdminTab>("overview");
  const [error, setError]       = useState<string | null>(null);
  const [success, setSuccess]   = useState<string | null>(null);

  const [businesses, setBusinesses]       = useState<Business[]>([]);
  const [reviews, setReviews]             = useState<AdminReview[]>([]);
  const [documents, setDocuments]         = useState<Document[]>([]);
  const [analyticsEvents, setAnalyticsEvents] = useState<AnalyticsEvent[]>([]);

  // Business management state
  const [editingBusiness, setEditingBusiness]     = useState<Business | null>(null);
  const [deletingBusinessId, setDeletingBusinessId] = useState<string | null>(null);

  // Document management state
  const [newDoc, setNewDoc] = useState({ title: "", description: "", category: "Legal", price: 0, preview_pages: 3 });
  const [uploadingDoc, setUploadingDoc]   = useState(false);
  const [uploadingFile, setUploadingFile] = useState<File | null>(null);
  const [editingDoc, setEditingDoc]       = useState<Document | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) { router.push("/auth"); return; }

      const { data: profile } = await supabase.from("profiles").select("role").eq("id", authUser.id).single();
      if (profile?.role !== "admin") { router.push("/dashboard"); return; }

      setAuthed(true);
      setLoading(false);
      await Promise.all([fetchBusinesses(), fetchDocuments(), fetchAnalytics(), fetchReviews()]);
    };
    checkAuth();
  }, [supabase, router]);

  const fetchBusinesses = async () => {
    const { data } = await supabase.from("businesses").select("*").order("created_at", { ascending: false });
    if (data) setBusinesses(data);
  };

  const fetchReviews = async () => {
    const { data } = await supabase
      .from("reviews")
      .select("*, businesses(name)")
      .order("created_at", { ascending: false });
    if (data) setReviews(data as AdminReview[]);
  };

  const fetchAnalytics = async () => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const { data } = await supabase
      .from("analytics_events")
      .select("id, session_id, event_type, page, created_at")
      .gte("created_at", thirtyDaysAgo.toISOString())
      .order("created_at", { ascending: false })
      .limit(2000);
    if (data) setAnalyticsEvents(data);
  };

  const fetchDocuments = async () => {
    const { data } = await supabase.from("documents").select("*").order("created_at", { ascending: false });
    if (data) setDocuments(data);
  };

  const getSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token;
  };

  const adminPost = async (path: string, body: object) => {
    const token = await getSession();
    const res = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const d = await res.json();
      throw new Error(d.error || "Request failed");
    }
    return res.json();
  };

  const flash = (msg: string, isError = false) => {
    if (isError) { setError(msg); setTimeout(() => setError(null), 3000); }
    else { setSuccess(msg); setTimeout(() => setSuccess(null), 2000); }
  };

  // ── Business handlers ─────────────────────────────────────────────────────

  const updateStatus = async (businessId: string, status: string) => {
    try {
      await adminPost("/api/admin/businesses/update-status", { businessId, status });
      setBusinesses(prev => prev.map(b => b.id === businessId ? { ...b, status } : b));
      flash(`Status set to ${status}`);
    } catch (e) { flash((e as Error).message, true); }
  };

  const saveBusiness = async () => {
    if (!editingBusiness) return;
    try {
      await adminPost("/api/admin/businesses/update", {
        businessId: editingBusiness.id,
        fields: {
          name: editingBusiness.name,
          category_slug: editingBusiness.category_slug,
          state: editingBusiness.state,
          description: editingBusiness.description,
          email: editingBusiness.email,
          phone: editingBusiness.phone,
          website: editingBusiness.website,
          social: editingBusiness.social,
          tier: editingBusiness.tier,
        },
      });
      setBusinesses(prev => prev.map(b => b.id === editingBusiness.id ? { ...b, ...editingBusiness } : b));
      setEditingBusiness(null);
      flash("Business updated");
    } catch (e) { flash((e as Error).message, true); }
  };

  const deleteBusiness = async (businessId: string) => {
    try {
      await adminPost("/api/admin/businesses/delete", { businessId });
      setBusinesses(prev => prev.filter(b => b.id !== businessId));
      setDeletingBusinessId(null);
      flash("Business deleted");
    } catch (e) { flash((e as Error).message, true); }
  };

  const toggleFeatured = async (businessId: string) => {
    const biz = businesses.find(b => b.id === businessId);
    if (!biz) return;
    try {
      await adminPost("/api/admin/businesses/update-featured", { businessId, isFeatured: !biz.is_featured });
      setBusinesses(prev => prev.map(b => b.id === businessId ? { ...b, is_featured: !b.is_featured } : b));
      flash("Featured status updated");
    } catch (e) { flash((e as Error).message, true); }
  };

  // ── Review handlers ───────────────────────────────────────────────────────

  const deleteReview = async (reviewId: string) => {
    try {
      await adminPost("/api/admin/reviews/delete", { reviewId });
      setReviews(prev => prev.filter(r => r.id !== reviewId));
      // Refresh businesses so ratings update
      await fetchBusinesses();
      flash("Review removed");
    } catch (e) { flash((e as Error).message, true); }
  };

  // ── Document handlers ─────────────────────────────────────────────────────

  const handleDocumentUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadingFile) { setError("Please select a PDF file"); return; }
    setUploadingDoc(true);
    setError(null);
    try {
      const token = await getSession();
      const formData = new FormData();
      formData.append("file", uploadingFile);
      const uploadRes = await fetch("/api/admin/documents/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!uploadRes.ok) { const d = await uploadRes.json(); throw new Error(d.error); }
      const { fileName } = await uploadRes.json();

      const createRes = await fetch("/api/admin/documents/create", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...newDoc, full_file_path: fileName }),
      });
      if (!createRes.ok) { const d = await createRes.json(); throw new Error(d.error); }
      const docData = await createRes.json();

      const processRes = await fetch("/api/admin/documents/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId: docData.id }),
      });
      if (!processRes.ok) throw new Error("Failed to process PDF");

      flash("Document uploaded and processed!");
      setNewDoc({ title: "", description: "", category: "Legal", price: 0, preview_pages: 3 });
      setUploadingFile(null);
      await fetchDocuments();
    } catch (err) {
      flash(err instanceof Error ? err.message : "Upload failed", true);
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleEditDocument = async () => {
    if (!editingDoc) return;
    try {
      await adminPost("/api/admin/documents/update", {
        documentId: editingDoc.id,
        title: editingDoc.title,
        description: editingDoc.description,
        category: editingDoc.category,
        price: editingDoc.price,
        preview_pages: editingDoc.preview_pages,
      });
      flash("Document updated");
      setEditingDoc(null);
      await fetchDocuments();
    } catch (e) { flash((e as Error).message, true); }
  };

  const unpublishDocument = async (docId: string) => {
    try {
      await adminPost("/api/admin/documents/unpublish", { documentId: docId });
      setDocuments(prev => prev.filter(d => d.id !== docId));
      flash("Document removed");
    } catch (e) { flash((e as Error).message, true); }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/auth");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-forest-200 border-t-forest-800 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (!authed) return <div className="min-h-screen bg-cream pt-20 flex items-center justify-center"><p>Redirecting...</p></div>;

  const pending = businesses.filter(b => b.status === "pending");
  const nonPending = businesses.filter(b => b.status !== "pending");

  return (
    <div className="min-h-screen bg-slate-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

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

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black text-slate-900">Admin Panel</h1>
            <p className="text-slate-500 text-sm">LaPai Management Solutions</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-100 transition-colors"
          >
            <LogOut size={14} /> Sign Out
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-xl p-1 mb-8 shadow-sm border border-slate-100 overflow-x-auto">
          {TAB_CONFIG.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${
                tab === id ? "bg-forest-800 text-white" : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
              }`}
            >
              <Icon size={14} />
              {label}
              {id === "businesses" && pending.length > 0 && (
                <span className="ml-1 bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{pending.length}</span>
              )}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW TAB ─────────────────────────────────────────────────── */}
        {tab === "overview" && (() => {
          const pageViews      = analyticsEvents.filter(e => e.event_type === "page_view").length;
          const uniqueSessions = new Set(analyticsEvents.map(e => e.session_id)).size;
          const formSubs       = analyticsEvents.filter(e => ["appointment_submit","intake_submit","registration_submit"].includes(e.event_type)).length;
          const purchases      = analyticsEvents.filter(e => e.event_type === "mock_purchase").length;

          const last14 = Array.from({ length: 14 }, (_, i) => {
            const d = new Date(); d.setDate(d.getDate() - (13 - i));
            return d.toISOString().split("T")[0];
          });
          const visitsByDay = last14.map(day => ({
            day,
            label: new Date(day + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" }),
            sessions: new Set(analyticsEvents.filter(e => e.event_type === "page_view" && e.created_at.startsWith(day)).map(e => e.session_id)).size,
          }));
          const maxSessions = Math.max(...visitsByDay.map(d => d.sessions), 1);

          return (
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Page Views (30d)",     value: pageViews,      icon: Eye,          color: "text-blue-500" },
                  { label: "Unique Visitors (30d)", value: uniqueSessions, icon: Users,        color: "text-purple-500" },
                  { label: "Form Submissions",      value: formSubs,       icon: CheckCircle,  color: "text-green-500" },
                  { label: "Documents Sold",        value: purchases,      icon: ShoppingCart, color: "text-gold-500" },
                ].map(card => {
                  const Icon = card.icon;
                  return (
                    <div key={card.label} className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm">
                      <Icon size={18} className={`${card.color} mb-3`} />
                      <div className="text-2xl font-black text-slate-900">{card.value}</div>
                      <div className="text-xs text-slate-500 mt-1">{card.label}</div>
                    </div>
                  );
                })}
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm">
                  <div className="text-xs text-slate-500 mb-1">Businesses</div>
                  <div className="text-3xl font-black text-forest-800">{businesses.length}</div>
                  <div className="text-xs text-slate-400 mt-1">
                    {businesses.filter(b => b.status === "approved").length} approved · {businesses.filter(b => b.status === "pending").length} pending
                  </div>
                </div>
                <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm">
                  <div className="text-xs text-slate-500 mb-1">Reviews</div>
                  <div className="text-3xl font-black text-forest-800">{reviews.length}</div>
                  <div className="text-xs text-slate-400 mt-1">across all listings</div>
                </div>
                <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm">
                  <div className="text-xs text-slate-500 mb-1">Documents</div>
                  <div className="text-3xl font-black text-forest-800">{documents.length}</div>
                  <div className="text-xs text-slate-400 mt-1">{documents.filter(d => d.is_published).length} published</div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 border border-slate-100 shadow-sm">
                <h3 className="font-bold text-sm text-slate-900 mb-5">Visitors Per Day — Last 14 Days</h3>
                {analyticsEvents.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-8">No analytics events yet.</p>
                ) : (
                  <div className="flex items-end gap-1.5 h-40">
                    {visitsByDay.map(({ day, label, sessions }) => (
                      <div key={day} className="flex-1 flex flex-col items-center gap-1">
                        <div className="text-xs text-slate-500 font-medium">{sessions > 0 ? sessions : ""}</div>
                        <div className="w-full rounded-t-md bg-forest-600 transition-all duration-500"
                          style={{ height: `${Math.max((sessions / maxSessions) * 120, sessions > 0 ? 4 : 2)}px`, opacity: sessions > 0 ? 1 : 0.2 }} />
                        <div className="text-[10px] text-slate-400 text-center leading-tight">{label}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        {/* ── FEATURED TAB ─────────────────────────────────────────────────── */}
        {tab === "featured" && (
          <div>
            <h2 className="text-lg font-bold text-forest-900 mb-4">Featured Businesses</h2>
            <div className="space-y-3">
              {businesses.length === 0 ? (
                <p className="text-slate-500">No businesses yet.</p>
              ) : businesses.map(biz => (
                <div key={biz.id} className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900 text-sm">{biz.name}</p>
                    <p className="text-xs text-slate-400">{biz.category_slug} • {biz.state}</p>
                  </div>
                  <button
                    onClick={() => toggleFeatured(biz.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                      biz.is_featured ? "bg-gold-50 text-gold-700 border border-gold-200" : "bg-slate-50 text-slate-600 border border-slate-200"
                    }`}
                  >
                    {biz.is_featured ? "★ Featured" : "☆ Not Featured"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── BUSINESSES TAB ───────────────────────────────────────────────── */}
        {tab === "businesses" && (
          <div className="space-y-8">

            {/* Pending approval queue */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Clock size={16} className="text-amber-500" />
                <h2 className="text-lg font-bold text-forest-900">Pending Approval ({pending.length})</h2>
              </div>
              {pending.length === 0 ? (
                <div className="bg-amber-50 rounded-xl p-6 text-center border border-amber-100">
                  <p className="text-sm text-amber-700 font-medium">No businesses awaiting approval.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pending.map(biz => (
                    <div key={biz.id} className="bg-white rounded-xl p-5 shadow-sm border border-amber-200">
                      <div className="flex items-start gap-4">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-900 text-sm truncate">{biz.name}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{biz.category_slug} · {biz.state} · <span className="capitalize">{biz.tier}</span></p>
                          {biz.email && <p className="text-xs text-slate-400">{biz.email}</p>}
                        </div>
                        <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                          <button onClick={() => setEditingBusiness(biz)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 text-xs font-medium hover:bg-slate-100 transition-colors">
                            <Edit2 size={12} /> Edit
                          </button>
                          <button onClick={() => updateStatus(biz.id, "approved")}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-xs font-semibold transition-colors">
                            <ThumbsUp size={12} /> Approve
                          </button>
                          <button onClick={() => updateStatus(biz.id, "rejected")}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-semibold transition-colors">
                            <ThumbsDown size={12} /> Reject
                          </button>
                          {deletingBusinessId === biz.id ? (
                            <>
                              <span className="text-xs text-red-600 font-semibold">Delete?</span>
                              <button onClick={() => deleteBusiness(biz.id)}
                                className="px-2 py-1.5 rounded-lg bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-colors">Yes</button>
                              <button onClick={() => setDeletingBusinessId(null)}
                                className="px-2 py-1.5 rounded-lg border border-slate-200 text-slate-500 text-xs font-medium hover:bg-slate-50 transition-colors">No</button>
                            </>
                          ) : (
                            <button onClick={() => setDeletingBusinessId(biz.id)}
                              className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center text-red-400 hover:bg-red-100 transition-colors">
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* All other businesses */}
            <div>
              <h2 className="text-lg font-bold text-forest-900 mb-4">All Businesses ({businesses.length})</h2>
              {businesses.length === 0 ? (
                <div className="bg-white rounded-xl p-8 text-center border border-slate-100 shadow-sm">
                  <p className="text-slate-500 text-sm">No businesses in the database yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {nonPending.map(biz => (
                    <div key={biz.id} className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
                      <div className="flex items-start gap-4">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-900 text-sm truncate">{biz.name}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{biz.category_slug} · {biz.state}</p>
                          {biz.rating > 0 && (
                            <p className="text-xs text-slate-400 flex items-center gap-0.5 mt-0.5">
                              <Star size={10} className="fill-gold-400 text-gold-400" />
                              {biz.rating} ({biz.review_count} reviews)
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                          <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${STATUS_COLORS[biz.status] || "bg-slate-100 text-slate-600"}`}>
                            {biz.status}
                          </span>
                          <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${TIER_COLORS[biz.tier] || "bg-slate-100 text-slate-600"}`}>
                            {biz.tier}
                          </span>

                          {/* Status actions */}
                          {biz.status === "approved" && (
                            <>
                              <button onClick={() => updateStatus(biz.id, "pending")}
                                className="text-xs font-semibold px-2 py-1 rounded-lg border border-amber-200 text-amber-600 hover:bg-amber-50 transition-colors">
                                Deapprove
                              </button>
                              <button onClick={() => updateStatus(biz.id, "suspended")}
                                className="text-xs font-semibold px-2 py-1 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors">
                                Suspend
                              </button>
                            </>
                          )}
                          {(biz.status === "rejected" || biz.status === "suspended") && (
                            <>
                              <button onClick={() => updateStatus(biz.id, "approved")}
                                className="text-xs font-semibold px-2 py-1 rounded-lg border border-green-200 text-green-600 hover:bg-green-50 transition-colors">
                                Re-approve
                              </button>
                              <button onClick={() => updateStatus(biz.id, "pending")}
                                className="text-xs font-semibold px-2 py-1 rounded-lg border border-amber-200 text-amber-600 hover:bg-amber-50 transition-colors">
                                Set Pending
                              </button>
                            </>
                          )}

                          <button onClick={() => setEditingBusiness(biz)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-xs font-medium hover:bg-blue-100 transition-colors">
                            <Edit2 size={12} /> Edit
                          </button>

                          {deletingBusinessId === biz.id ? (
                            <>
                              <span className="text-xs text-red-600 font-semibold">Delete?</span>
                              <button onClick={() => deleteBusiness(biz.id)}
                                className="px-2 py-1.5 rounded-lg bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-colors">Yes</button>
                              <button onClick={() => setDeletingBusinessId(null)}
                                className="px-2 py-1.5 rounded-lg border border-slate-200 text-slate-500 text-xs font-medium hover:bg-slate-50 transition-colors">No</button>
                            </>
                          ) : (
                            <button onClick={() => setDeletingBusinessId(biz.id)}
                              className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center text-red-400 hover:bg-red-100 transition-colors">
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── REVIEWS TAB ──────────────────────────────────────────────────── */}
        {tab === "reviews" && (
          <div>
            <h2 className="text-lg font-bold text-forest-900 mb-4">All Reviews ({reviews.length})</h2>
            {reviews.length === 0 ? (
              <div className="bg-white rounded-xl p-8 text-center border border-slate-100 shadow-sm">
                <p className="text-slate-500 text-sm">No reviews yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {reviews.map(review => (
                  <div key={review.id} className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 flex items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-semibold text-slate-900 truncate">
                          {review.businesses?.name ?? "Unknown Business"}
                        </p>
                        <div className="flex gap-0.5 shrink-0">
                          {[1,2,3,4,5].map(n => (
                            <Star key={n} size={11}
                              className={n <= review.rating ? "fill-gold-500 text-gold-500" : "fill-transparent text-slate-200"} />
                          ))}
                        </div>
                        <span className="text-xs font-bold text-slate-700">{review.rating}/5</span>
                      </div>
                      {review.text && <p className="text-sm text-slate-500 line-clamp-2">{review.text}</p>}
                      <p className="text-xs text-slate-400 mt-1">
                        {new Date(review.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </p>
                    </div>
                    <button
                      onClick={() => deleteReview(review.id)}
                      className="shrink-0 w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-red-400 hover:bg-red-100 transition-colors"
                      title="Delete review"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── DOCUMENTS TAB ────────────────────────────────────────────────── */}
        {tab === "documents" && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
              <h2 className="text-lg font-bold text-forest-900 mb-4">Add New Document</h2>
              <form onSubmit={handleDocumentUpload} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Document Title</label>
                  <input type="text" placeholder="e.g., Legal Contract Template" required value={newDoc.title}
                    onChange={e => setNewDoc({ ...newDoc, title: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:border-forest-400 text-slate-700" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Description</label>
                  <textarea placeholder="What does this document contain?" required rows={2} value={newDoc.description}
                    onChange={e => setNewDoc({ ...newDoc, description: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:border-forest-400 text-slate-700 resize-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Category</label>
                    <select value={newDoc.category} onChange={e => setNewDoc({ ...newDoc, category: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:border-forest-400 text-slate-700">
                      <option>Legal</option><option>Finance</option><option>Home</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Price ($)</label>
                    <input type="number" placeholder="29.99" required min="0" step="0.01" value={newDoc.price}
                      onChange={e => setNewDoc({ ...newDoc, price: parseFloat(e.target.value) || 0 })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:border-forest-400 text-slate-700" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Preview Pages</label>
                  <input type="number" placeholder="3" min="1" value={newDoc.preview_pages}
                    onChange={e => setNewDoc({ ...newDoc, preview_pages: parseInt(e.target.value) || 3 })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:border-forest-400 text-slate-700" />
                </div>
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center">
                  <label className="cursor-pointer">
                    <Upload size={24} className="mx-auto text-slate-400 mb-2" />
                    <p className="text-sm text-slate-600 font-medium">Click to upload PDF</p>
                    <input type="file" accept=".pdf" required onChange={e => setUploadingFile(e.target.files?.[0] || null)} className="hidden" />
                  </label>
                  {uploadingFile && <p className="text-xs text-green-600 mt-2">✓ {uploadingFile.name}</p>}
                </div>
                <button type="submit" disabled={uploadingDoc}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-forest-800 hover:bg-forest-700 disabled:opacity-70 disabled:cursor-not-allowed text-white font-bold text-sm transition-colors">
                  {uploadingDoc ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Processing...</> : <><Plus size={14} />Upload & Process</>}
                </button>
              </form>
            </div>

            <div>
              <h2 className="text-lg font-bold text-forest-900 mb-4">{documents.length} Documents</h2>
              <div className="space-y-3">
                {documents.map(doc => (
                  <div key={doc.id} className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900 text-sm">{doc.title}</p>
                      <p className="text-xs text-slate-400">{doc.description}</p>
                      <p className="text-xs text-slate-500 mt-1">{doc.category} · {doc.preview_pages} preview pages · ${doc.price.toFixed(2)}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button onClick={() => setEditingDoc(doc)}
                        className="px-3 py-2 rounded-lg bg-blue-50 text-blue-600 text-xs font-medium hover:bg-blue-100 transition-colors flex items-center gap-1">
                        <Edit2 size={14} /> Edit
                      </button>
                      <button onClick={() => unpublishDocument(doc.id)}
                        className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-red-500 hover:bg-red-100 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── EDIT BUSINESS MODAL ───────────────────────────────────────────── */}
      {editingBusiness && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
              <h3 className="font-bold text-slate-900">Edit Business</h3>
              <button onClick={() => setEditingBusiness(null)} className="text-slate-400 hover:text-slate-700"><X size={20} /></button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Business Name</label>
                <input type="text" value={editingBusiness.name}
                  onChange={e => setEditingBusiness({ ...editingBusiness, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:border-forest-400" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Category</label>
                  <select value={editingBusiness.category_slug}
                    onChange={e => setEditingBusiness({ ...editingBusiness, category_slug: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:border-forest-400">
                    {CATEGORIES.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">State</label>
                  <select value={editingBusiness.state}
                    onChange={e => setEditingBusiness({ ...editingBusiness, state: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:border-forest-400">
                    {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Tier</label>
                <select value={editingBusiness.tier}
                  onChange={e => setEditingBusiness({ ...editingBusiness, tier: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:border-forest-400">
                  <option value="basic">Basic</option>
                  <option value="standard">Standard</option>
                  <option value="premium">Premium</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Description</label>
                <textarea value={editingBusiness.description || ""}
                  onChange={e => setEditingBusiness({ ...editingBusiness, description: e.target.value })}
                  rows={3} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:border-forest-400 resize-none" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Email</label>
                  <input type="email" value={editingBusiness.email || ""}
                    onChange={e => setEditingBusiness({ ...editingBusiness, email: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:border-forest-400" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Phone</label>
                  <input type="tel" value={editingBusiness.phone || ""}
                    onChange={e => setEditingBusiness({ ...editingBusiness, phone: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:border-forest-400" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Website</label>
                  <input type="url" value={editingBusiness.website || ""}
                    onChange={e => setEditingBusiness({ ...editingBusiness, website: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:border-forest-400" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Social Handle</label>
                  <input type="text" placeholder="@handle" value={editingBusiness.social || ""}
                    onChange={e => setEditingBusiness({ ...editingBusiness, social: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:border-forest-400" />
                </div>
              </div>
            </div>

            <div className="flex gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50 rounded-b-2xl shrink-0">
              <button onClick={() => setEditingBusiness(null)}
                className="flex-1 px-4 py-2 rounded-lg border border-slate-200 text-slate-600 text-sm font-medium hover:bg-white transition-colors">
                Cancel
              </button>
              <button onClick={saveBusiness}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-forest-800 text-white text-sm font-medium hover:bg-forest-700 transition-colors">
                <Save size={14} /> Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── EDIT DOCUMENT MODAL ───────────────────────────────────────────── */}
      {editingDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="font-semibold text-slate-900">Edit Document</h3>
              <button onClick={() => setEditingDoc(null)} className="text-slate-400 hover:text-slate-700"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Title</label>
                <input type="text" value={editingDoc.title}
                  onChange={e => setEditingDoc({ ...editingDoc, title: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:border-forest-400" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Description</label>
                <textarea value={editingDoc.description}
                  onChange={e => setEditingDoc({ ...editingDoc, description: e.target.value })}
                  rows={2} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:border-forest-400 resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Category</label>
                  <select value={editingDoc.category}
                    onChange={e => setEditingDoc({ ...editingDoc, category: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:border-forest-400">
                    <option>Legal</option><option>Finance</option><option>Home</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Price ($)</label>
                  <input type="number" min="0" step="0.01" value={editingDoc.price}
                    onChange={e => setEditingDoc({ ...editingDoc, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:border-forest-400" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Preview Pages</label>
                <input type="number" min="1" value={editingDoc.preview_pages}
                  onChange={e => setEditingDoc({ ...editingDoc, preview_pages: parseInt(e.target.value) || 1 })}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:border-forest-400" />
              </div>
            </div>
            <div className="flex gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50 rounded-b-2xl">
              <button onClick={() => setEditingDoc(null)}
                className="flex-1 px-4 py-2 rounded-lg border border-slate-200 text-slate-600 text-sm font-medium hover:bg-white transition-colors">
                Cancel
              </button>
              <button onClick={handleEditDocument}
                className="flex-1 px-4 py-2 rounded-lg bg-forest-800 text-white text-sm font-medium hover:bg-forest-700 transition-colors">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
