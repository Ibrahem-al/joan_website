import Link from "next/link";
import { Mail } from "lucide-react";

const FOOTER_LINKS = {
  Directory: [
    { href: "/businesses", label: "All Businesses" },
    { href: "/businesses?filter=premium", label: "Premium Listings" },
    { href: "/businesses?filter=new", label: "New Listings" },
  ],
  Services: [
    { href: "/apply", label: "Get Connected" },
    { href: "/book", label: "Book a Consultation" },
    { href: "/store", label: "Document Store" },
    { href: "/advertise", label: "List Your Business" },
  ],
  Company: [
    { href: "/register", label: "Register Your Business" },
    { href: "/advertise", label: "Pricing & Tiers" },
    { href: "/auth", label: "Sign In" },
    { href: "/admin", label: "Admin Access" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-forest-950 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main footer content */}
        <div className="py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            {/* TODO: Replace with real logo once provided */}
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gold-500 flex items-center justify-center font-black text-sm text-forest-950">
                LM
              </div>
              <span className="font-bold text-lg">LaPai</span>
            </div>
            <p className="text-forest-300 text-sm leading-relaxed max-w-sm mb-6">
              Connecting investors and clients with vetted small businesses across multiple states. Your trusted professional referral network.
            </p>
            {/* Contact */}
            <div className="space-y-2">
              <a
                href="mailto:Lapaisolutions@gmail.com"
                className="flex items-center gap-2 text-sm text-forest-300 hover:text-gold-400 transition-colors"
              >
                <Mail size={14} />
                Lapaisolutions@gmail.com
              </a>
            </div>
            {/* Social */}
            <div className="flex items-center gap-3 mt-6">
              {/* TODO: Replace with real social links */}
              {/* TODO: Replace with real social links — @javonas_network */}
              {["IG", "FB", "X"].map((label) => (
                <a key={label} href="#" className="w-9 h-9 rounded-lg bg-forest-800 flex items-center justify-center text-forest-300 hover:text-gold-400 hover:bg-forest-700 transition-all text-xs font-bold" aria-label={label}>
                  {label}
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(FOOTER_LINKS).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-sm font-semibold text-white mb-4">{category}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-forest-300 hover:text-gold-400 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="py-6 border-t border-forest-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-forest-400">
            &copy; {new Date().getFullYear()} LaPai Management Solutions & Consulting LLC. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-xs text-forest-400 hover:text-gold-400 transition-colors">Privacy Policy</a>
            <a href="#" className="text-xs text-forest-400 hover:text-gold-400 transition-colors">Terms of Service</a>
            <a href="#" className="text-xs text-forest-400 hover:text-gold-400 transition-colors">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
