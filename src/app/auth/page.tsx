"use client";

import { useState } from "react";
import { Eye, EyeOff, ArrowRight } from "lucide-react";

type Mode = "login" | "signup";
type Role = "client" | "business";

export default function AuthPage() {
  const [mode, setMode] = useState<Mode>("login");
  const [role, setRole] = useState<Role>("client");
  const [showPass, setShowPass] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });

  const update = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Connect Supabase Auth (email + password) once credentials are added
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-cream pt-20 flex items-center justify-center">
        <div className="text-center max-w-sm mx-auto px-4">
          <div className="w-16 h-16 rounded-full bg-forest-100 flex items-center justify-center mx-auto mb-6">
            <span className="text-2xl">👋</span>
          </div>
          <h1 className="text-2xl font-black text-forest-900 mb-3">
            {mode === "login" ? "Welcome Back!" : "Account Created!"}
          </h1>
          <p className="text-slate-500 text-sm mb-8">
            {mode === "login"
              ? `Signed in as ${form.email}`
              : `Your ${role} account has been created. Redirecting to your dashboard...`}
          </p>
          <a href="/" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-forest-800 text-white font-bold text-sm hover:bg-forest-700 transition-colors">
            Go to Dashboard
          </a>
          <p className="mt-4 text-xs text-slate-400">Demo mode — Supabase Auth not yet connected</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream pt-20 flex items-center justify-center py-12">
      <div className="w-full max-w-md mx-auto px-4">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-forest-800 flex items-center justify-center mx-auto mb-3">
            <span className="text-gold-400 font-black text-sm">JN</span>
          </div>
          {/* TODO: Replace with real logo */}
          <h1 className="font-black text-forest-900 text-xl">Javona&apos;s Network</h1>
        </div>

        <div className="bg-white rounded-2xl shadow-card p-8">
          {/* Tab switcher */}
          <div className="flex rounded-xl bg-cream p-1 mb-6">
            {(["login", "signup"] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all capitalize ${
                  mode === m
                    ? "bg-white text-forest-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {m === "login" ? "Sign In" : "Create Account"}
              </button>
            ))}
          </div>

          {/* Role selector (signup only) */}
          {mode === "signup" && (
            <div className="mb-5">
              <label className="block text-xs font-semibold text-slate-600 mb-2">I am a...</label>
              <div className="grid grid-cols-2 gap-2">
                {(["client", "business"] as Role[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`py-3 rounded-xl text-sm font-semibold border-2 transition-all capitalize ${
                      role === r
                        ? "border-forest-800 bg-forest-50 text-forest-800"
                        : "border-forest-100 text-slate-500 hover:border-forest-200"
                    }`}
                  >
                    {r === "client" ? "🏠 Client" : "🏢 Business Owner"}
                  </button>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="Jane Smith"
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-forest-200 bg-cream text-sm focus:outline-none focus:border-forest-400 text-slate-700"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Email Address</label>
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-forest-200 bg-cream text-sm focus:outline-none focus:border-forest-400 text-slate-700"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  required
                  placeholder="Your password"
                  value={form.password}
                  onChange={(e) => update("password", e.target.value)}
                  className="w-full px-4 py-3 pr-10 rounded-xl border border-forest-200 bg-cream text-sm focus:outline-none focus:border-forest-400 text-slate-700"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {mode === "signup" && (
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Confirm Password</label>
                <input
                  type="password"
                  required
                  placeholder="Confirm password"
                  value={form.confirmPassword}
                  onChange={(e) => update("confirmPassword", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-forest-200 bg-cream text-sm focus:outline-none focus:border-forest-400 text-slate-700"
                />
              </div>
            )}

            {mode === "login" && (
              <div className="text-right">
                <a href="#" className="text-xs text-forest-600 hover:text-forest-800 font-medium">Forgot password?</a>
              </div>
            )}

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-forest-800 hover:bg-forest-700 text-white font-bold text-sm transition-colors mt-2"
            >
              {mode === "login" ? "Sign In" : "Create Account"}
              <ArrowRight size={14} />
            </button>

            <p className="text-center text-xs text-slate-400 pt-1">
              Demo mode — Supabase Auth not yet connected
            </p>
          </form>
        </div>

        <p className="text-center text-sm text-slate-500 mt-6">
          {mode === "login" ? (
            <>Don&apos;t have an account? <button onClick={() => setMode("signup")} className="text-forest-800 font-semibold hover:underline">Sign up</button></>
          ) : (
            <>Already have an account? <button onClick={() => setMode("login")} className="text-forest-800 font-semibold hover:underline">Sign in</button></>
          )}
        </p>
      </div>
    </div>
  );
}
