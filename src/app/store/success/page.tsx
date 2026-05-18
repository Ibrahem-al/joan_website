"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Download, CheckCircle, Loader2, Mail } from "lucide-react";
import Link from "next/link";

function SuccessContent() {
  const params = useSearchParams();
  const sessionId = params.get("session_id");
  const docId = params.get("docId");
  const title = params.get("title") || "Your Document";

  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId || !docId) {
      setError("Invalid purchase link.");
      setLoading(false);
      return;
    }

    fetch(`/api/store/download?session_id=${sessionId}&docId=${docId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.url) setDownloadUrl(data.url);
        else setError(data.error || "Could not generate download link.");
      })
      .catch(() => setError("Something went wrong. Please contact support."))
      .finally(() => setLoading(false));
  }, [sessionId, docId]);

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-lg">
        <div className="bg-white rounded-3xl shadow-card overflow-hidden">
          {/* Header */}
          <div className="bg-forest-800 p-10 text-center">
            <div className="w-20 h-20 rounded-full bg-gold-500/20 flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={40} className="text-gold-400" />
            </div>
            <h1 className="text-2xl font-black text-white">Payment Successful!</h1>
            <p className="text-forest-200 mt-2 text-sm">Thank you for your purchase</p>
          </div>

          {/* Body */}
          <div className="p-10">
            <div className="bg-cream rounded-2xl p-5 mb-8">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Document</p>
              <p className="font-bold text-forest-900 text-lg">{decodeURIComponent(title)}</p>
            </div>

            {loading && (
              <div className="flex items-center justify-center gap-3 py-6 text-slate-500">
                <Loader2 size={20} className="animate-spin" />
                <span className="text-sm">Preparing your download…</span>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-sm text-red-700">
                {error}
                <p className="mt-2">
                  Please email{" "}
                  <a href="mailto:Lapaisolutions@gmail.com" className="underline">
                    Lapaisolutions@gmail.com
                  </a>{" "}
                  with your order details.
                </p>
              </div>
            )}

            {downloadUrl && (
              <>
                <a
                  href={downloadUrl}
                  download
                  className="w-full flex items-center justify-center gap-3 py-4 rounded-xl bg-forest-800 hover:bg-forest-700 text-white font-bold transition-colors mb-4"
                >
                  <Download size={18} />
                  Download Now
                </a>
                <div className="flex items-start gap-3 p-4 bg-gold-50 border border-gold-200 rounded-xl text-sm text-gold-800">
                  <Mail size={16} className="shrink-0 mt-0.5" />
                  <p>A download link has also been sent to your email. The link expires in <strong>24 hours</strong>.</p>
                </div>
              </>
            )}

            <div className="mt-8 pt-6 border-t border-forest-50 flex justify-center">
              <Link href="/store" className="text-sm text-forest-600 hover:text-forest-800 font-medium">
                ← Back to Document Store
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-forest-800" />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
