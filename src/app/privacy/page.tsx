import Link from "next/link";

export const metadata = {
  title: "Privacy Policy | LaPai Management Solutions",
  description: "Privacy Policy for LaPai Management Solutions & Consulting LLC",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-cream pt-20">
      <div className="bg-forest-800 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-3xl font-black mb-2">Privacy Policy</h1>
          <p className="text-forest-300 text-sm">Last updated: May 18, 2026</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-card p-8 sm:p-12 prose prose-slate max-w-none">

          <p className="text-slate-600 leading-relaxed">
            LaPai Management Solutions &amp; Consulting LLC (&ldquo;LaPai,&rdquo; &ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;) is committed to protecting your personal information. This Privacy Policy explains what data we collect, how we use it, and your rights regarding it when you use our platform (the &ldquo;Platform&rdquo;).
          </p>

          <Section title="1. Information We Collect">
            <Subsection title="Account Information">
              When you create an account, we collect your full name, email address, and a hashed (encrypted) version of your password. We never store your password in plain text.
            </Subsection>
            <Subsection title="Business Listing Information">
              If you register a business, we collect your business name, category, state, description, email address, phone number, website URL, social media handle, and any photos you upload.
            </Subsection>
            <Subsection title="Payment Information">
              All payments are processed by Stripe, Inc. We do not store credit card numbers, bank account details, or any other sensitive financial data on our servers. We do store records of completed transactions (amount paid, document purchased, subscription tier) for business and legal purposes.
            </Subsection>
            <Subsection title="Consultation &amp; Inquiry Information">
              When you book a consultation or submit a lead inquiry, we collect your name, email, phone number, state, service type, budget range, urgency, and any notes you provide.
            </Subsection>
            <Subsection title="Usage &amp; Analytics Data">
              We automatically collect a randomly generated visitor identifier (stored in your browser&rsquo;s local storage) and a session identifier (stored in session storage) to help us understand how the Platform is used. These identifiers are not linked to your name or email. We also record which pages you visit and when.
            </Subsection>
          </Section>

          <Section title="2. How We Use Your Information">
            <ul className="list-disc pl-5 space-y-2 text-slate-600">
              <li>To create and manage your account</li>
              <li>To display your business listing in our directory once approved</li>
              <li>To process subscription payments and document purchases through Stripe</li>
              <li>To send transactional emails — including purchase receipts, document download links, and booking confirmations</li>
              <li>To schedule and manage consultation appointments</li>
              <li>To review, approve, or moderate business listings and customer reviews</li>
              <li>To analyze Platform usage and improve our services</li>
              <li>To respond to your inquiries and support requests</li>
              <li>To comply with legal obligations</li>
            </ul>
          </Section>

          <Section title="3. Information Sharing">
            <p className="text-slate-600">We do not sell, rent, or trade your personal information. We share data only with the following trusted service providers who process it on our behalf:</p>
            <ul className="list-disc pl-5 space-y-2 text-slate-600 mt-3">
              <li><strong>Stripe, Inc.</strong> — payment processing. See <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-forest-700 underline">stripe.com/privacy</a></li>
              <li><strong>Supabase</strong> — secure database storage and file hosting</li>
              <li><strong>Google LLC</strong> — email delivery via Gmail SMTP and calendar integration for appointment scheduling</li>
              <li><strong>Vercel, Inc.</strong> — website hosting and deployment</li>
            </ul>
            <p className="text-slate-600 mt-3">We may also disclose information if required by law, court order, or to protect the rights and safety of LaPai, our users, or the public.</p>
          </Section>

          <Section title="4. Data Retention">
            <ul className="list-disc pl-5 space-y-2 text-slate-600">
              <li><strong>Account data:</strong> retained while your account is active or until you request deletion</li>
              <li><strong>Business listing data:</strong> retained while your listing is active; deleted within 30 days of account deletion request</li>
              <li><strong>Analytics data:</strong> retained for up to 24 months, then permanently deleted</li>
              <li><strong>Transaction records:</strong> retained for 7 years for financial and legal compliance</li>
            </ul>
          </Section>

          <Section title="5. Your Rights">
            <p className="text-slate-600">You have the right to:</p>
            <ul className="list-disc pl-5 space-y-2 text-slate-600 mt-3">
              <li><strong>Access</strong> the personal data we hold about you</li>
              <li><strong>Correct</strong> inaccurate information in your account or business listing</li>
              <li><strong>Delete</strong> your account and associated data</li>
              <li><strong>Withdraw consent</strong> for non-essential data processing at any time</li>
            </ul>
            <p className="text-slate-600 mt-3">To exercise any of these rights, contact us at <a href="mailto:Lapaisolutions@gmail.com" className="text-forest-700 underline">Lapaisolutions@gmail.com</a>. We will respond within 30 days.</p>
          </Section>

          <Section title="6. Security">
            <p className="text-slate-600">
              We implement industry-standard security measures including encrypted HTTPS connections, hashed password storage, role-based access controls, and private file storage for purchased documents. Payment data is handled exclusively by Stripe&rsquo;s PCI-compliant infrastructure. No security system is impenetrable, and we cannot guarantee absolute security, but we take reasonable steps to protect your information.
            </p>
          </Section>

          <Section title="7. Cookies &amp; Tracking">
            <p className="text-slate-600">
              We use session cookies for authentication and browser-based storage for analytics. For full details, please read our{" "}
              <Link href="/cookies" className="text-forest-700 underline">Cookie Policy</Link>.
            </p>
          </Section>

          <Section title="8. Children&rsquo;s Privacy">
            <p className="text-slate-600">
              The Platform is intended for users 18 years of age or older. We do not knowingly collect personal information from children under 13. If we become aware that a child under 13 has provided us with personal information, we will delete it promptly.
            </p>
          </Section>

          <Section title="9. Changes to This Policy">
            <p className="text-slate-600">
              We may update this Privacy Policy from time to time. We will notify you of significant changes by posting the new policy on this page with an updated date. Your continued use of the Platform after changes are posted constitutes your acceptance of the updated policy.
            </p>
          </Section>

          <Section title="10. Contact Us">
            <p className="text-slate-600">
              If you have any questions about this Privacy Policy, please contact us:
            </p>
            <div className="mt-3 p-4 bg-cream rounded-xl text-sm text-slate-700">
              <p className="font-semibold">LaPai Management Solutions &amp; Consulting LLC</p>
              <p>Email: <a href="mailto:Lapaisolutions@gmail.com" className="text-forest-700 underline">Lapaisolutions@gmail.com</a></p>
            </div>
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

function Subsection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-4">
      <h3 className="text-sm font-semibold text-slate-800 mb-1">{title}</h3>
      <p className="text-slate-600 leading-relaxed">{children}</p>
    </div>
  );
}
