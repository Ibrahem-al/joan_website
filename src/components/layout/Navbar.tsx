"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

const NAV_LINKS = [
  { href: "/directory", label: "Directory" },
  { href: "/categories", label: "Categories" },
  { href: "/store", label: "Documents" },
  { href: "/advertise", label: "List Your Business" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const isHome = pathname === "/";
  const transparent = isHome && !scrolled && !open;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        transparent
          ? "bg-transparent"
          : "bg-white/98 backdrop-blur-sm border-b border-forest-100 shadow-sm"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          {/* TODO: Replace with real logo once provided */}
          <Link href="/" className="flex items-center gap-2 group">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm transition-colors ${
                transparent ? "bg-white/20 text-white" : "bg-forest-800 text-gold-500"
              }`}
            >
              JN
            </div>
            <span
              className={`font-bold text-lg tracking-tight transition-colors ${
                transparent ? "text-white" : "text-forest-800"
              }`}
            >
              Javona&apos;s Network
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map((link) => {
              const active = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    transparent
                      ? active
                        ? "text-gold-400"
                        : "text-white/90 hover:text-white"
                      : active
                      ? "text-forest-800 bg-forest-50"
                      : "text-slate-600 hover:text-forest-800 hover:bg-forest-50"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              href="/auth"
              className={`text-sm font-medium px-4 py-2 rounded-lg transition-all ${
                transparent
                  ? "text-white/90 hover:text-white"
                  : "text-forest-800 hover:bg-forest-50"
              }`}
            >
              Sign In
            </Link>
            <Link
              href="/apply"
              className="text-sm font-semibold px-5 py-2.5 rounded-lg bg-gold-500 text-white hover:bg-gold-600 transition-all shadow-gold hover:shadow-none"
            >
              Get Connected
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className={`lg:hidden p-2 rounded-lg transition-colors ${
              transparent ? "text-white" : "text-forest-800"
            }`}
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="lg:hidden bg-white border-t border-forest-100">
          <div className="max-w-7xl mx-auto px-4 py-4 space-y-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  pathname.startsWith(link.href)
                    ? "text-forest-800 bg-forest-50"
                    : "text-slate-700 hover:bg-forest-50 hover:text-forest-800"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-3 border-t border-forest-100 flex flex-col gap-2">
              <Link
                href="/auth"
                className="block px-4 py-3 text-sm font-medium text-forest-800 hover:bg-forest-50 rounded-lg"
              >
                Sign In
              </Link>
              <Link
                href="/apply"
                className="block px-4 py-3 text-sm font-semibold text-center bg-gold-500 text-white rounded-lg hover:bg-gold-600"
              >
                Get Connected
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
