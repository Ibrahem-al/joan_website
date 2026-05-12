"use client";

import { useEffect, useState, type ElementType } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { X, Edit2, Trash2, Plus, BarChart2, Users, FileText, Tag, Settings, Building2, Upload, AlertCircle, CheckCircle, LogOut } from "lucide-react";

type AdminTab = "overview" | "businesses" | "documents" | "pricing" | "categories" | "applications" | "featured";

const TAB_CONFIG: Array<{ id: AdminTab; label: string; icon: ElementType }> = [
  { id: "overview", label: "Overview", icon: BarChart2 },
  { id: "featured", label: "Featured", icon: Building2 },
  { id: "businesses", label: "Businesses", icon: Building2 },
  { id: "documents", label: "Documents", icon: FileText },
  { id: "pricing", label: "Pricing", icon: Tag },
  { id: "categories", label: "Categories", icon: Settings },
  { id: "applications", label: "Applications", icon: Users },
];

interface Business {
  id: string;
  name: string;
  category: string;
  state: string;
  status: string;
  tier: string;
  is_featured: boolean;
  user_id: string;
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
      await Promise.all([fetchBusinesses(), fetchDocuments()]);
    };

    checkAuth();
  }, [supabase, router]);

  const fetchBusinesses = async () => {
    const { data } = await supabase
      .from("businesses")
      .select("*")
      .eq("status", "approved");

    if (data) setBusinesses(data);
  };

  const fetchDocuments = async () => {
    const { data } = await supabase
      .from("documents")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) setDocuments(data);
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
    const { error: updateError } = await supabase
      .from("documents")
      .update({ is_published: false })
      .eq("id", docId);

    if (updateError) {
      setError(updateError.message);
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
                      <p className="text-xs text-slate-400">{biz.category} • {biz.state}</p>
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

        {/* OTHER TABS (placeholder content from existing admin) */}
        {tab === "overview" && (
          <div className="text-slate-600 text-sm">
            <p>Overview dashboard — to be connected to Supabase analytics_events table</p>
          </div>
        )}

        {tab === "businesses" && (
          <div className="text-slate-600 text-sm">
            <p>Business management — to be connected to Supabase businesses table</p>
          </div>
        )}

        {tab === "pricing" && (
          <div className="text-slate-600 text-sm">
            <p>Pricing management — to be connected to Supabase pricing tiers</p>
          </div>
        )}

        {tab === "categories" && (
          <div className="text-slate-600 text-sm">
            <p>Category management — to be connected to Supabase categories</p>
          </div>
        )}

        {tab === "applications" && (
          <div className="text-slate-600 text-sm">
            <p>Applications submitted via /apply will appear here once Supabase is connected.</p>
          </div>
        )}
      </div>
    </div>
  );
}
