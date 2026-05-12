"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { Download, ShieldCheck, X, Check, FileDown } from "lucide-react";

interface Document {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  preview_file_path: string | null;
}

const CATEGORY_COLORS: Record<string, string> = {
  Legal: "bg-purple-100 text-purple-700",
  Finance: "bg-blue-100 text-blue-700",
  Home: "bg-green-100 text-green-700",
};

function PreviewModal({
  doc,
  onClose,
}: {
  doc: Document;
  onClose: () => void;
}) {
  const previewUrl = doc.preview_file_path
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/documents-preview/${doc.preview_file_path}`
    : '';

  const handleDownload = () => {
    if (previewUrl) {
      const link = document.createElement('a');
      link.href = previewUrl;
      link.download = `${doc.title}-preview.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-forest-950/60 backdrop-blur-sm p-2">
      <div className="bg-white rounded-2xl w-full h-full max-w-7xl shadow-2xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 flex-shrink-0">
          <h3 className="font-semibold text-slate-900 text-lg">{doc.title} — Preview</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-hidden bg-slate-50 flex items-center justify-center">
          {doc.preview_file_path ? (
            <iframe
              src={previewUrl}
              className="w-full h-full border-none"
              title="PDF Preview"
            />
          ) : (
            <p className="text-slate-500">Preview not yet available</p>
          )}
        </div>

        <div className="p-4 border-t border-slate-100 bg-white flex gap-3 justify-end flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            Close
          </button>
          {doc.preview_file_path && (
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-forest-800 text-white text-sm font-medium hover:bg-forest-700 transition-colors"
            >
              <FileDown size={16} />
              Download Preview
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function StorePage() {
  const supabase = createClient();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [previewDoc, setPreviewDoc] = useState<Document | null>(null);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        console.log("Starting document fetch...");
        const start = Date.now();
        const { data, error } = await supabase
          .from("documents")
          .select("*")
          .eq("is_published", true)
          .order("sort_order");

        const elapsed = Date.now() - start;
        console.log(`Document fetch completed in ${elapsed}ms`, { data, error });

        if (error) {
          console.error("Documents query error:", error);
        } else if (data) {
          console.log(`Found ${data.length} documents`);
          setDocuments(data);
        }
      } catch (err) {
        console.error("Document fetch exception:", err);
      }
      setLoading(false);
    };

    fetchDocuments();
  }, [supabase]);

  const handleCheckout = async (doc: Document) => {
    try {
      const response = await fetch("/api/store/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId: doc.id,
          amount: Math.round(doc.price * 100),
        }),
      });

      if (!response.ok) throw new Error("Checkout failed");

      await response.json();
      // In production, use Stripe.js to confirm payment with the returned clientSecret
      // For now, show success after mock processing
      setTimeout(() => {
        setSelectedDoc(null);
        alert(`Purchase successful! Download link would be sent to your email.`);
      }, 1500);
    } catch (err) {
      alert("Checkout error: " + (err instanceof Error ? err.message : "Unknown error"));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-forest-200 border-t-forest-800 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading documents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream pt-20">
      {previewDoc && (
        <PreviewModal doc={previewDoc} onClose={() => setPreviewDoc(null)} />
      )}

      {selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-forest-950/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-forest-800 flex items-center justify-center">
                  <span className="text-gold-400 font-black text-xs">LM</span>
                </div>
                <span className="font-semibold text-slate-900 text-sm">LaPai</span>
              </div>
              <button
                onClick={() => setSelectedDoc(null)}
                className="text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-xs text-slate-500 mb-1">Purchasing</p>
                <p className="font-semibold text-slate-900 text-sm">{selectedDoc.title}</p>
                <p className="text-lg font-black text-forest-800 mt-1">
                  ${selectedDoc.price.toFixed(2)}
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Email for receipt
                </label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:border-forest-400"
                />
              </div>

              <button
                onClick={() => handleCheckout(selectedDoc)}
                className="w-full py-4 rounded-xl bg-forest-800 hover:bg-forest-700 text-white font-bold text-sm transition-colors flex items-center justify-center gap-2"
              >
                <ShieldCheck size={16} />
                Complete Purchase
              </button>

              <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
                <ShieldCheck size={12} />
                <span>Secure payment via Stripe</span>
              </div>
            </div>
          </div>
        </div>
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
        {documents.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-500 text-lg mb-4">No documents available yet.</p>
            <p className="text-slate-400 text-sm">Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="bg-white rounded-2xl overflow-hidden shadow-card border border-forest-50 flex flex-col hover:shadow-card-hover transition-all duration-300"
              >
                {/* Color header by category */}
                <div className="h-3 bg-forest-800" />
                <div className="p-8 flex-1 flex flex-col">
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded-lg ${
                        CATEGORY_COLORS[doc.category] || "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {doc.category}
                    </span>
                    <div className="text-right">
                      <div className="text-2xl font-black text-forest-900">
                        ${doc.price.toFixed(2)}
                      </div>
                      <div className="text-xs text-slate-400">one-time</div>
                    </div>
                  </div>

                  <h3 className="font-bold text-forest-900 text-base leading-tight mb-3">
                    {doc.title}
                  </h3>
                  <p className="text-sm text-slate-500 leading-relaxed flex-1 mb-6">
                    {doc.description}
                  </p>

                  <div className="space-y-2">
                    {doc.preview_file_path && (
                      <button
                        onClick={() => setPreviewDoc(doc)}
                        className="w-full py-2 rounded-xl border border-forest-200 text-forest-800 text-sm font-semibold hover:bg-forest-50 transition-colors"
                      >
                        Preview
                      </button>
                    )}
                    <button
                      onClick={() => setSelectedDoc(doc)}
                      className="w-full py-3.5 rounded-xl bg-forest-800 hover:bg-forest-700 text-white font-bold text-sm transition-colors flex items-center justify-center gap-2"
                    >
                      <Download size={16} />
                      Buy &amp; Download
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info note */}
        <p className="mt-8 text-center text-xs text-slate-400">
          All documents are managed from the admin panel. Prices and availability may be updated at any time.
        </p>
      </div>
    </div>
  );
}
