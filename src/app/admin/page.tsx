"use client";

import { useEffect, useState, type ElementType } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { X, Edit2, Trash2, Plus, BarChart2, Users, FileText, Building2, Upload, AlertCircle, CheckCircle, LogOut, Eye, ShoppingCart, ThumbsUp, ThumbsDown, Clock } from "lucide-react";

type AdminTab = "overview" | "featured" | "businesses" | "documents";

const TAB_CONFIG: Array<{ id: AdminTab; label: string; icon: ElementType }> = [
  { id: "overview", label: "Overview", icon: BarChart2 },
  { id: "featured", label: "Featured", icon: Building2 },
  { id: "businesses", label: "Businesses", icon: Users },
  { id: "documents", label: "Documents", icon: FileText },
];

interface Business {
  id: string;
  name: string;
  category_slug: string;
  state: string;
  status: string;
  tier: string;
  is_featured: boolean;
  user_id: string | null;
  rating: number;
  review_count: number;
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

export default function AdminPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);
  const [tab, setTab] = useState<AdminTab>("overview");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [analyticsEvents, setAnalyticsEvents] = useState<AnalyticsEvent[]>([]);

  const [newDoc, setNewDoc] = useState({
    title: "",
    description: "",
    category: "Legal",
    price: 0,
    preview_pages: 3,
  });
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [uploadingFile, setUploadingFile] = useState<File | null>(null);
  const [editingDoc, setEditingDoc] = useState<Document | null>(null);

  // Check auth on load
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();

      if (!authUser) {
        router.push("/auth");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", authUser.id)
        .single();

      if (profile?.role !== "admin") {
        router.push("/dashboard");
        return;
      }

      setAuthed(true);
      setLoading(false);

      // Fetch data
      await Promise.all([fetchBusinesses(), fetchDocuments(), fetchAnalytics()]);
    };

    checkAuth();
  }, [supabase, router]);

  const fetchBusinesses = async () => {
    const { data } = await supabase
      .from("businesses")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) setBusinesses(data);
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
    const { data } = await supabase
      .from("documents")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) setDocuments(data);
  };

  const updateStatus = async (businessId: string, status: string) => {
    const { data: { session } } = await supabase.auth.getSession();

    const response = await fetch("/api/admin/businesses/update-status", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session?.access_token}`,
      },
      body: JSON.stringify({ businessId, status }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      setError(errorData.error || "Failed to update status");
      return;
    }

    setBusinesses((prev) =>
      prev.map((b) => (b.id === businessId ? { ...b, status } : b))
    );
    setSuccess(`Business ${status === "approved" ? "approved" : "rejected"}!`);
    setTimeout(() => setSuccess(null), 2000);
  };

  const toggleFeatured = async (businessId: string) => {
    const business = businesses.find((b) => b.id === businessId);
    if (!business) return;

    const { data: { session } } = await supabase.auth.getSession();

    const response = await fetch("/api/admin/businesses/update-featured", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session?.access_token}`,
      },
      body: JSON.stringify({ businessId, isFeatured: !business.is_featured }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      setError(errorData.error || "Failed to update featured status");
      return;
    }

    setBusinesses((prev) =>
      prev.map((b) => (b.id === businessId ? { ...b, is_featured: !b.is_featured } : b))
    );
    setSuccess("Featured status updated!");
    setTimeout(() => setSuccess(null), 2000);
  };

  const handleDocumentUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Document upload form submitted");
    if (!uploadingFile) {
      setError("Please select a PDF file");
      return;
    }

    setUploadingDoc(true);
    setError(null);

    try {
      // Upload file via API (uses service role for storage)
      console.log("Uploading file via API:", uploadingFile.name);
      const { data: { session } } = await supabase.auth.getSession();

      const formData = new FormData();
      formData.append("file", uploadingFile);

      const uploadResponse = await fetch("/api/admin/documents/upload", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${session?.access_token}`,
        },
        body: formData,
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        console.error("File upload error:", JSON.stringify(errorData, null, 2));
        console.error("Full error details:", errorData);
        setError(errorData.error || "Failed to upload file");
        setUploadingDoc(false);
        return;
      }

      const uploadData = await uploadResponse.json();
      const fileName = uploadData.fileName;
      console.log("File uploaded successfully:", fileName);

      // Create document record via API (uses service role, bypasses RLS)
      console.log("Creating document record via API...");
      const createResponse = await fetch("/api/admin/documents/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          title: newDoc.title,
          description: newDoc.description,
          category: newDoc.category,
          price: newDoc.price,
          preview_pages: newDoc.preview_pages,
          full_file_path: fileName,
        }),
      });

      console.log("API response status:", createResponse.status);
      if (!createResponse.ok) {
        const errorData = await createResponse.json();
        console.error("API error response:", errorData);
        setError(errorData.error || "Failed to create document");
        setUploadingDoc(false);
        return;
      }

      console.log("Document created successfully");
      const docData = await createResponse.json();

      // Call PDF processing API
      const processResponse = await fetch("/api/admin/documents/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId: docData.id }),
      });

      if (!processResponse.ok) {
        throw new Error("Failed to process PDF");
      }

      setSuccess("Document uploaded and processed successfully!");
      setNewDoc({ title: "", description: "", category: "Legal", price: 0, preview_pages: 3 });
      setUploadingFile(null);
      await fetchDocuments();
    } catch (err) {
      console.error("Document upload exception:", err);
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleEditDocument = async () => {
    if (!editingDoc) return;

    const { data: { session } } = await supabase.auth.getSession();

    const response = await fetch("/api/admin/documents/update", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session?.access_token}`,
      },
      body: JSON.stringify({
        documentId: editingDoc.id,
        title: editingDoc.title,
        description: editingDoc.description,
        category: editingDoc.category,
        price: editingDoc.price,
        preview_pages: editingDoc.preview_pages,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      setError(errorData.error || "Failed to update document");
      return;
    }

    setSuccess("Document updated successfully!");
    setEditingDoc(null);
    setTimeout(() => setSuccess(null), 2000);
    await fetchDocuments();
  };

  const unpublishDocument = async (docId: string) => {
    const { data: { session } } = await supabase.auth.getSession();

    const response = await fetch("/api/admin/documents/unpublish", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session?.access_token}`,
      },
      body: JSON.stringify({ documentId: docId }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      setError(errorData.error || "Failed to remove document");
      return;
    }

    setDocuments((prev) => prev.filter((d) => d.id !== docId));
    setSuccess("Document removed!");
    setTimeout(() => setSuccess(null), 2000);
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
          <p className="text-slate-600">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (!authed) {
    return (
      <div className="min-h-screen bg-cream pt-20 flex items-center justify-center">
        <p>Redirecting...</p>
      </div>
    );
  }

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
            <LogOut size={14} />
            Sign Out
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
            </button>
          ))}
        </div>

        {/* FEATURED TAB */}
        {tab === "featured" && (
          <div>
            <h2 className="text-lg font-bold text-forest-900 mb-4">Featured Businesses</h2>
            <div className="space-y-3">
              {businesses.length === 0 ? (
                <p className="text-slate-500">No approved businesses yet.</p>
              ) : (
                businesses.map((biz) => (
                  <div key={biz.id} className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900 text-sm">{biz.name}</p>
                      <p className="text-xs text-slate-400">{biz.category_slug} • {biz.state}</p>
                    </div>
                    <button
                      onClick={() => toggleFeatured(biz.id)}
                      className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                        biz.is_featured
                          ? "bg-gold-50 text-gold-700 border border-gold-200"
                          : "bg-slate-50 text-slate-600 border border-slate-200"
                      }`}
                    >
                      {biz.is_featured ? "★ Featured" : "☆ Not Featured"}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* DOCUMENTS TAB */}
        {tab === "documents" && (
          <div className="space-y-6">
            {/* Upload form */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
              <h2 className="text-lg font-bold text-forest-900 mb-4">Add New Document</h2>
              <form onSubmit={handleDocumentUpload} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Document Title</label>
                  <input
                    type="text"
                    placeholder="e.g., Legal Contract Template"
                    required
                    value={newDoc.title}
                    onChange={(e) => setNewDoc({ ...newDoc, title: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:border-forest-400 text-slate-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Description</label>
                  <textarea
                    placeholder="What does this document contain?"
                    required
                    rows={2}
                    value={newDoc.description}
                    onChange={(e) => setNewDoc({ ...newDoc, description: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:border-forest-400 text-slate-700 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Category</label>
                    <select
                      value={newDoc.category}
                      onChange={(e) => setNewDoc({ ...newDoc, category: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:border-forest-400 text-slate-700"
                    >
                      <option value="Legal">Legal</option>
                      <option value="Finance">Finance</option>
                      <option value="Home">Home</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Price ($)</label>
                    <input
                      type="number"
                      placeholder="29.99"
                      required
                      min="0"
                      step="0.01"
                      value={newDoc.price}
                      onChange={(e) => setNewDoc({ ...newDoc, price: parseFloat(e.target.value) || 0 })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:border-forest-400 text-slate-700"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Preview Pages <span className="text-slate-500">(# of pages shown with watermark)</span></label>
                  <input
                    type="number"
                    placeholder="3"
                    min="1"
                    value={newDoc.preview_pages}
                    onChange={(e) => setNewDoc({ ...newDoc, preview_pages: parseInt(e.target.value) || 3 })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:border-forest-400 text-slate-700"
                  />
                </div>
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center">
                  <label className="cursor-pointer">
                    <Upload size={24} className="mx-auto text-slate-400 mb-2" />
                    <p className="text-sm text-slate-600 font-medium">Click to upload PDF</p>
                    <input
                      type="file"
                      accept=".pdf"
                      required
                      onChange={(e) => setUploadingFile(e.target.files?.[0] || null)}
                      className="hidden"
                    />
                  </label>
                  {uploadingFile && (
                    <p className="text-xs text-green-600 mt-2">✓ {uploadingFile.name}</p>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={uploadingDoc}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-forest-800 hover:bg-forest-700 disabled:opacity-70 disabled:cursor-not-allowed text-white font-bold text-sm transition-colors"
                >
                  {uploadingDoc ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Plus size={14} />
                      Upload & Process
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Document list */}
            <div>
              <h2 className="text-lg font-bold text-forest-900 mb-4">{documents.length} Documents</h2>
              <div className="space-y-3">
                {documents.map((doc) => (
                  <div key={doc.id} className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900 text-sm">{doc.title}</p>
                      <p className="text-xs text-slate-400">{doc.description}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        {doc.category} • {doc.preview_pages} preview pages • ${doc.price.toFixed(2)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => setEditingDoc(doc)}
                        className="px-3 py-2 rounded-lg bg-blue-50 text-blue-600 text-xs font-medium hover:bg-blue-100 transition-colors flex items-center gap-1"
                      >
                        <Edit2 size={14} />
                        Edit
                      </button>
                      <button
                        onClick={() => unpublishDocument(doc.id)}
                        className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-red-500 hover:bg-red-100 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Edit Document Modal */}
            {editingDoc && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
                  <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                    <h3 className="font-semibold text-slate-900">Edit Document</h3>
                    <button
                      onClick={() => setEditingDoc(null)}
                      className="text-slate-400 hover:text-slate-700"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <div className="p-6 space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">Title</label>
                      <input
                        type="text"
                        value={editingDoc.title}
                        onChange={(e) => setEditingDoc({ ...editingDoc, title: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:border-forest-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">Description</label>
                      <textarea
                        value={editingDoc.description}
                        onChange={(e) => setEditingDoc({ ...editingDoc, description: e.target.value })}
                        rows={2}
                        className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:border-forest-400 resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Category</label>
                        <select
                          value={editingDoc.category}
                          onChange={(e) => setEditingDoc({ ...editingDoc, category: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:border-forest-400"
                        >
                          <option value="Legal">Legal</option>
                          <option value="Finance">Finance</option>
                          <option value="Home">Home</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Price ($)</label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={editingDoc.price}
                          onChange={(e) => setEditingDoc({ ...editingDoc, price: parseFloat(e.target.value) || 0 })}
                          className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:border-forest-400"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">Preview Pages</label>
                      <input
                        type="number"
                        min="1"
                        value={editingDoc.preview_pages}
                        onChange={(e) => setEditingDoc({ ...editingDoc, preview_pages: parseInt(e.target.value) || 1 })}
                        className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:border-forest-400"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50 rounded-b-2xl">
                    <button
                      onClick={() => setEditingDoc(null)}
                      className="flex-1 px-4 py-2 rounded-lg border border-slate-200 text-slate-600 text-sm font-medium hover:bg-white transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleEditDocument}
                      className="flex-1 px-4 py-2 rounded-lg bg-forest-800 text-white text-sm font-medium hover:bg-forest-700 transition-colors"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* OVERVIEW TAB */}
        {tab === "overview" && (() => {
          const pageViews = analyticsEvents.filter(e => e.event_type === "page_view").length;
          const uniqueSessions = new Set(analyticsEvents.map(e => e.session_id)).size;
          const formSubmissions = analyticsEvents.filter(e => ["appointment_submit", "intake_submit", "registration_submit"].includes(e.event_type)).length;
          const purchases = analyticsEvents.filter(e => e.event_type === "mock_purchase").length;

          // Visitors per day — last 14 days
          const last14 = Array.from({ length: 14 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (13 - i));
            return d.toISOString().split("T")[0];
          });
          const visitsByDay = last14.map(day => ({
            day,
            label: new Date(day + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" }),
            sessions: new Set(
              analyticsEvents
                .filter(e => e.event_type === "page_view" && e.created_at.startsWith(day))
                .map(e => e.session_id)
            ).size,
          }));
          const maxSessions = Math.max(...visitsByDay.map(d => d.sessions), 1);

          return (
            <div className="space-y-6">
              {/* Stat cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Page Views (30d)", value: pageViews, icon: Eye, color: "text-blue-500" },
                  { label: "Unique Visitors (30d)", value: uniqueSessions, icon: Users, color: "text-purple-500" },
                  { label: "Form Submissions", value: formSubmissions, icon: CheckCircle, color: "text-green-500" },
                  { label: "Documents Sold", value: purchases, icon: ShoppingCart, color: "text-gold-500" },
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

              {/* Quick stats row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm">
                  <div className="text-xs text-slate-500 mb-1">Total Businesses</div>
                  <div className="text-3xl font-black text-forest-800">{businesses.length}</div>
                  <div className="text-xs text-slate-400 mt-1">
                    {businesses.filter(b => b.status === "approved").length} approved ·{" "}
                    {businesses.filter(b => b.status === "pending").length} pending
                  </div>
                </div>
                <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm">
                  <div className="text-xs text-slate-500 mb-1">Total Documents</div>
                  <div className="text-3xl font-black text-forest-800">{documents.length}</div>
                  <div className="text-xs text-slate-400 mt-1">
                    {documents.filter(d => d.is_published).length} published
                  </div>
                </div>
              </div>

              {/* Visitors per day chart */}
              <div className="bg-white rounded-xl p-6 border border-slate-100 shadow-sm">
                <h3 className="font-bold text-sm text-slate-900 mb-5">Visitors Per Day — Last 14 Days</h3>
                {analyticsEvents.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-8">No analytics events recorded yet. Events will appear here once visitors start using the site.</p>
                ) : (
                  <div className="flex items-end gap-1.5 h-40">
                    {visitsByDay.map(({ day, label, sessions }) => (
                      <div key={day} className="flex-1 flex flex-col items-center gap-1">
                        <div className="text-xs text-slate-500 font-medium">{sessions > 0 ? sessions : ""}</div>
                        <div
                          className="w-full rounded-t-md bg-forest-600 transition-all duration-500"
                          style={{ height: `${Math.max((sessions / maxSessions) * 120, sessions > 0 ? 4 : 2)}px`, opacity: sessions > 0 ? 1 : 0.2 }}
                        />
                        <div className="text-[10px] text-slate-400 text-center leading-tight">{label}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        {/* BUSINESSES TAB */}
        {tab === "businesses" && (() => {
          const pending = businesses.filter(b => b.status === "pending");
          const rest = businesses.filter(b => b.status !== "pending");

          const statusColors: Record<string, string> = {
            approved: "bg-green-100 text-green-700",
            pending: "bg-amber-100 text-amber-700",
            rejected: "bg-red-100 text-red-700",
            suspended: "bg-slate-100 text-slate-600",
          };
          const tierColors: Record<string, string> = {
            premium: "bg-gold-100 text-gold-700",
            standard: "bg-blue-100 text-blue-700",
            basic: "bg-slate-100 text-slate-600",
          };

          return (
            <div className="space-y-8">
              {/* Pending Approval */}
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
                      <div key={biz.id} className="bg-white rounded-xl p-5 shadow-sm border border-amber-200 flex items-center gap-4">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-900 text-sm truncate">{biz.name}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{biz.category_slug} · {biz.state}</p>
                          <span className={`inline-block mt-1 text-xs font-semibold px-2 py-0.5 rounded-lg ${tierColors[biz.tier] || "bg-slate-100 text-slate-600"}`}>
                            {biz.tier}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => updateStatus(biz.id, "approved")}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-xs font-semibold transition-colors"
                          >
                            <ThumbsUp size={13} />
                            Approve
                          </button>
                          <button
                            onClick={() => updateStatus(biz.id, "rejected")}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-semibold transition-colors"
                          >
                            <ThumbsDown size={13} />
                            Reject
                          </button>
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
                    <p className="text-slate-400 text-xs mt-1">Use the seed endpoint or wait for businesses to register.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {rest.map(biz => (
                      <div key={biz.id} className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 flex items-center gap-4">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-900 text-sm truncate">{biz.name}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{biz.category_slug} · {biz.state}</p>
                          {biz.rating > 0 && (
                            <p className="text-xs text-slate-400">★ {biz.rating} ({biz.review_count} reviews)</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                          <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${statusColors[biz.status] || "bg-slate-100 text-slate-600"}`}>
                            {biz.status}
                          </span>
                          <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${tierColors[biz.tier] || "bg-slate-100 text-slate-600"}`}>
                            {biz.tier}
                          </span>
                          {biz.is_featured && (
                            <span className="text-xs font-semibold px-2 py-1 rounded-lg bg-gold-50 text-gold-700">★ featured</span>
                          )}
                          <button
                            onClick={() => updateStatus(biz.id, biz.status === "approved" ? "suspended" : "approved")}
                            className="text-xs font-semibold px-2 py-1 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors"
                          >
                            {biz.status === "approved" ? "Suspend" : "Re-approve"}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
