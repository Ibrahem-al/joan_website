import Link from "next/link";

export const metadata = {
  title: "Cookie Policy | LaPai Management Solutions",
  description: "Cookie Policy for LaPai Management Solutions & Consulting LLC",
};

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-cream pt-20">
      <div className="bg-forest-800 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-3xl font-black mb-2">Cookie Policy</h1>
          <p className="text-forest-300 text-sm">Last updated: May 18, 2026</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-card p-8 sm:p-12">

          <p className="text-slate-600 leading-relaxed">
            This Cookie Policy explains how LaPai Management Solutions &amp; Consulting LLC (&ldquo;LaPai,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) uses cookies and similar browser-based storage technologies when you visit our Platform.
          </p>

          <Section title="1. What Are Cookies?">
            <p className="text-slate-600 leading-relaxed">
              Cookies are small text files placed on your device by a website. We also use browser <strong>local storage</strong> and <strong>session storage</strong>, which are similar technologies that store data directly in your browser rather than as traditional cookie files. All of these serve the same general purpose: remembering information between page visits.
            </p>
          </Section>

          <Section title="2. What We Use &amp; Why">

            <div className="mt-4 space-y-6">

              <div className="p-5 rounded-xl border border-forest-100 bg-cream">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <h3 className="font-bold text-forest-900">Essential — Authentication Session</h3>
                  <span className="shrink-0 text-xs font-semibold px-2 py-1 rounded-lg bg-forest-100 text-forest-700">Required</span>
                </div>
                <div className="space-y-1.5 text-sm text-slate-600">
                  <p><strong>What it does:</strong> Keeps you logged into your account as you navigate between pages.</p>
                  <p><strong>Type:</strong> Cookie (HTTP, set by Supabase)</p>
                  <p><strong>Duration:</strong> Expires when you sign out or after 7 days of inactivity.</p>
                  <p><strong>Can you disable it?</strong> No — without this cookie the login system cannot function.</p>
                </div>
              </div>

              <div className="p-5 rounded-xl border border-forest-100 bg-cream">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <h3 className="font-bold text-forest-900">Analytics — Visitor Identifier</h3>
                  <span className="shrink-0 text-xs font-semibold px-2 py-1 rounded-lg bg-blue-100 text-blue-700">Analytics</span>
                </div>
                <div className="space-y-1.5 text-sm text-slate-600">
                  <p><strong>What it does:</strong> Stores a randomly generated anonymous ID so we can count how many unique visitors our Platform receives. This ID is not linked to your name, email, or any other identifying information.</p>
                  <p><strong>Type:</strong> Local storage (browser-based)</p>
                  <p><strong>Duration:</strong> Persists until you manually clear your browser&rsquo;s local storage or site data.</p>
                  <p><strong>Can you disable it?</strong> Yes — clear your browser&rsquo;s local storage or site data for this domain at any time through your browser settings.</p>
                </div>
              </div>

              <div className="p-5 rounded-xl border border-forest-100 bg-cream">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <h3 className="font-bold text-forest-900">Analytics — Session Identifier</h3>
                  <span className="shrink-0 text-xs font-semibold px-2 py-1 rounded-lg bg-blue-100 text-blue-700">Analytics</span>
                </div>
                <div className="space-y-1.5 text-sm text-slate-600">
                  <p><strong>What it does:</strong> Stores a randomly generated anonymous ID for your current browsing session. This helps us distinguish between separate visits by the same person. Like the visitor identifier, this is not linked to any personal information.</p>
                  <p><strong>Type:</strong> Session storage (browser-based)</p>
                  <p><strong>Duration:</strong> Automatically deleted when you close your browser tab.</p>
                  <p><strong>Can you disable it?</strong> It clears automatically when you close your tab, or you can clear site data in your browser settings.</p>
                </div>
              </div>

              <div className="p-5 rounded-xl border border-forest-100 bg-cream">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <h3 className="font-bold text-forest-900">Third-Party — Stripe (Payments)</h3>
                  <span className="shrink-0 text-xs font-semibold px-2 py-1 rounded-lg bg-purple-100 text-purple-700">Third-Party</span>
                </div>
                <div className="space-y-1.5 text-sm text-slate-600">
                  <p><strong>What it does:</strong> When you proceed to checkout, Stripe (our payment processor) sets its own cookies to prevent fraud, remember your progress through checkout, and ensure secure transactions.</p>
                  <p><strong>Type:</strong> Cookies set by Stripe on their checkout domain</p>
                  <p><strong>Duration:</strong> Varies — set and managed by Stripe.</p>
                  <p><strong>More information:</strong> <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-forest-700 underline">stripe.com/privacy</a></p>
                </div>
              </div>

            </div>
          </Section>

          <Section title="3. What We Do NOT Use">
            <p className="text-slate-600 leading-relaxed">We do not use:</p>
            <ul className="list-disc pl-5 space-y-2 text-slate-600 mt-3">
              <li>Advertising or retargeting cookies</li>
              <li>Social media tracking pixels (Facebook, Instagram, TikTok, etc.)</li>
              <li>Third-party analytics platforms (Google Analytics, Mixpanel, etc.)</li>
              <li>Any cookies that track you across other websites</li>
            </ul>
            <p className="text-slate-600 mt-3">All analytics are collected and processed internally using our own data — we do not share behavioral data with advertisers or data brokers.</p>
          </Section>

          <Section title="4. How to Manage Cookies">
            <p className="text-slate-600 leading-relaxed mb-4">
              You can control cookies and browser storage through your browser settings. Here&rsquo;s how in common browsers:
            </p>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { browser: "Google Chrome", path: "Settings → Privacy and security → Cookies and other site data" },
                { browser: "Safari", path: "Preferences → Privacy → Manage Website Data" },
                { browser: "Firefox", path: "Settings → Privacy & Security → Cookies and Site Data" },
                { browser: "Microsoft Edge", path: "Settings → Cookies and site permissions → Cookies and site data" },
              ].map((item) => (
                <div key={item.browser} className="p-4 bg-cream rounded-xl text-sm">
                  <p className="font-semibold text-slate-800">{item.browser}</p>
                  <p className="text-slate-500 mt-1">{item.path}</p>
                </div>
              ))}
            </div>
            <p className="text-slate-500 text-sm mt-4">
              Note: disabling the authentication cookie (essential) will prevent you from signing into your account or completing purchases.
            </p>
          </Section>

          <Section title="5. Changes to This Policy">
            <p className="text-slate-600 leading-relaxed">
              We may update this Cookie Policy as we add new features or as regulations change. We will post the updated policy on this page with a revised date. We encourage you to review this page periodically.
            </p>
          </Section>

          <Section title="6. Contact">
            <p className="text-slate-600">Questions about our use of cookies?</p>
            <div className="mt-3 p-4 bg-cream rounded-xl text-sm text-slate-700">
              <p className="font-semibold">LaPai Management Solutions &amp; Consulting LLC</p>
              <p>Email: <a href="mailto:Lapaisolutions@gmail.com" className="text-forest-700 underline">Lapaisolutions@gmail.com</a></p>
            </div>
            <p className="text-slate-600 mt-4 text-sm">
              See also our{" "}
              <Link href="/privacy" className="text-forest-700 underline">Privacy Policy</Link>
              {" "}and{" "}
              <Link href="/terms" className="text-forest-700 underline">Terms of Service</Link>.
            </p>
          </Section>

        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-10">
      <h2 className="text-lg font-bold text-forest-900 mb-4 pb-2 border-b border-forest-100">{title}</h2>
      <div className="space-y-3">{children}</div>
    </div>
  );
}
