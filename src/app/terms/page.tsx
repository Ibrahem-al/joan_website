import Link from "next/link";

export const metadata = {
  title: "Terms of Service | LaPai Management Solutions",
  description: "Terms of Service for LaPai Management Solutions & Consulting LLC",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-cream pt-20">
      <div className="bg-forest-800 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-3xl font-black mb-2">Terms of Service</h1>
          <p className="text-forest-300 text-sm">Last updated: May 18, 2026</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-card p-8 sm:p-12">

          <p className="text-slate-600 leading-relaxed">
            These Terms of Service (&ldquo;Terms&rdquo;) govern your access to and use of the LaPai Management Solutions platform operated by LaPai Management Solutions &amp; Consulting LLC (&ldquo;LaPai,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;). By accessing or using the Platform, you agree to be bound by these Terms. If you do not agree, you may not use the Platform.
          </p>

          <Section title="1. Platform Description">
            <p className="text-slate-600 leading-relaxed">
              LaPai operates a vetted business directory and referral network connecting investors, clients, and professionals across the United States. Businesses may apply to be listed in the directory. Clients may browse listings, book consultations, and purchase professional documents through our store.
            </p>
          </Section>

          <Section title="2. Eligibility">
            <p className="text-slate-600 leading-relaxed">
              You must be at least 18 years old and capable of entering into a legally binding agreement to use this Platform. By using the Platform, you represent that you meet these requirements.
            </p>
          </Section>

          <Section title="3. Accounts">
            <p className="text-slate-600 leading-relaxed">
              You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account. You agree to notify us immediately at <a href="mailto:Lapaisolutions@gmail.com" className="text-forest-700 underline">Lapaisolutions@gmail.com</a> of any unauthorized use of your account. We reserve the right to suspend or terminate accounts that violate these Terms.
            </p>
          </Section>

          <Section title="4. Business Listings">
            <ul className="list-disc pl-5 space-y-2 text-slate-600">
              <li>All business applications are subject to review and approval at LaPai&rsquo;s sole discretion. Submission does not guarantee acceptance.</li>
              <li>You must provide accurate, complete, and truthful information about your business. Misrepresentation may result in immediate removal without refund.</li>
              <li>LaPai reserves the right to reject, suspend, or permanently remove any listing at any time, for any reason, including but not limited to policy violations, complaints, or inactivity.</li>
              <li>Approved businesses are responsible for keeping their listing information current and accurate.</li>
              <li>LaPai does not endorse or guarantee the quality, safety, or legality of any listed business.</li>
            </ul>
          </Section>

          <Section title="5. Subscriptions &amp; Billing">
            <ul className="list-disc pl-5 space-y-2 text-slate-600">
              <li><strong>Standard ($29/month)</strong> and <strong>Premium ($79/month)</strong> listing tiers are billed on a monthly recurring basis through Stripe, Inc.</li>
              <li>Subscriptions renew automatically at the end of each billing period unless cancelled.</li>
              <li>You may cancel your subscription at any time through the &ldquo;Manage Billing&rdquo; option in your dashboard. Cancellation takes effect at the end of the current paid billing period — you will retain access until that date.</li>
              <li>No refunds or credits are provided for partial billing periods or unused subscription time.</li>
              <li>LaPai reserves the right to change subscription pricing with at least 30 days&rsquo; written notice. Continued use after the price change effective date constitutes acceptance.</li>
              <li>If a payment fails, your listing may be suspended until payment is resolved.</li>
            </ul>
          </Section>

          <Section title="6. Document Purchases">
            <ul className="list-disc pl-5 space-y-2 text-slate-600">
              <li>Documents purchased through the store are one-time purchases and are non-refundable.</li>
              <li>Documents are licensed for your personal or internal business use only. You may not redistribute, resell, sublicense, or publicly share purchased documents.</li>
              <li>Download links provided after purchase expire after 24 hours. LaPai is not responsible for links that expire due to inaction.</li>
              <li>Document contents are provided for informational purposes only and do not constitute legal, financial, or professional advice.</li>
            </ul>
          </Section>

          <Section title="7. Consultations">
            <ul className="list-disc pl-5 space-y-2 text-slate-600">
              <li>Consultation bookings are subject to availability and are not guaranteed until confirmed.</li>
              <li>LaPai reserves the right to reschedule or cancel consultations with reasonable notice.</li>
              <li>Failure to attend a scheduled consultation without prior notice may result in forfeiture of the booking.</li>
              <li>Consultation services are for informational and advisory purposes and do not constitute legal, financial, medical, or other licensed professional advice.</li>
            </ul>
          </Section>

          <Section title="8. Customer Reviews">
            <ul className="list-disc pl-5 space-y-2 text-slate-600">
              <li>Reviews must reflect genuine, first-hand experiences with the business being reviewed.</li>
              <li>You may not review your own business, submit reviews in exchange for compensation, or submit false or defamatory reviews.</li>
              <li>LaPai reserves the right to remove any review that violates these Terms, appears fraudulent, or is otherwise inappropriate, without notice.</li>
              <li>One review per user per business is permitted.</li>
            </ul>
          </Section>

          <Section title="9. Prohibited Conduct">
            <p className="text-slate-600 mb-3">You agree not to:</p>
            <ul className="list-disc pl-5 space-y-2 text-slate-600">
              <li>Provide false, misleading, or fraudulent information</li>
              <li>Impersonate any person or business</li>
              <li>Attempt to gain unauthorized access to the Platform, its systems, or other users&rsquo; accounts</li>
              <li>Use the Platform for spam, unsolicited advertising, or mass communications</li>
              <li>Scrape, copy, or systematically extract Platform content without written permission</li>
              <li>Use the Platform in any way that violates applicable law or regulation</li>
              <li>Interfere with or disrupt the integrity or performance of the Platform</li>
            </ul>
          </Section>

          <Section title="10. Intellectual Property">
            <p className="text-slate-600 leading-relaxed">
              All Platform content, design, branding, logos, and software are the property of LaPai Management Solutions &amp; Consulting LLC and are protected by applicable intellectual property laws. Business listing content (text, images, descriptions) remains the property of the respective business owner, but you grant LaPai a non-exclusive, royalty-free license to display that content on the Platform.
            </p>
          </Section>

          <Section title="11. Disclaimers">
            <p className="text-slate-600 leading-relaxed">
              The Platform is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo; without warranties of any kind, express or implied. LaPai does not warrant that the Platform will be uninterrupted, error-free, or free of viruses. LaPai does not guarantee any business results, client leads, revenue outcomes, or the accuracy of third-party business information listed on the Platform.
            </p>
          </Section>

          <Section title="12. Limitation of Liability">
            <p className="text-slate-600 leading-relaxed">
              To the maximum extent permitted by applicable law, LaPai shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or related to your use of the Platform. Our total cumulative liability to you for any claim arising out of these Terms or your use of the Platform shall not exceed the total amount you paid to LaPai in the 12 months immediately preceding the claim.
            </p>
          </Section>

          <Section title="13. Indemnification">
            <p className="text-slate-600 leading-relaxed">
              You agree to indemnify and hold harmless LaPai Management Solutions &amp; Consulting LLC, its officers, directors, and employees from any claims, damages, losses, or expenses (including legal fees) arising out of your use of the Platform, your violation of these Terms, or your violation of any third-party rights.
            </p>
          </Section>

          <Section title="14. Governing Law &amp; Disputes">
            <p className="text-slate-600 leading-relaxed">
              These Terms are governed by the laws of the United States. Any dispute arising out of or relating to these Terms or the Platform shall first be attempted to be resolved through good-faith negotiation. If negotiation fails, disputes shall be resolved through binding arbitration in accordance with applicable arbitration rules.
            </p>
          </Section>

          <Section title="15. Changes to These Terms">
            <p className="text-slate-600 leading-relaxed">
              We may modify these Terms at any time. We will notify users of material changes by posting an updated version on this page with a new effective date. Your continued use of the Platform after the effective date of changes constitutes your acceptance of the updated Terms.
            </p>
          </Section>

          <Section title="16. Contact">
            <p className="text-slate-600">Questions about these Terms? Contact us:</p>
            <div className="mt-3 p-4 bg-cream rounded-xl text-sm text-slate-700">
              <p className="font-semibold">LaPai Management Solutions &amp; Consulting LLC</p>
              <p>Email: <a href="mailto:Lapaisolutions@gmail.com" className="text-forest-700 underline">Lapaisolutions@gmail.com</a></p>
            </div>
            <p className="text-slate-600 mt-4 text-sm">
              For privacy-related concerns, see our{" "}
              <Link href="/privacy" className="text-forest-700 underline">Privacy Policy</Link>.
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
