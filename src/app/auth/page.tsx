"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ArrowRight, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase";

type Mode = "login" | "signup";
type Role = "client" | "business";

export default function AuthPage() {
  const router = useRouter();
  const supabase = createClient();

  if (!supabase) {
    console.error("Supabase client failed to initialize - check environment variables");
  }

  const [mode, setMode] = useState<Mode>("login");
  const [role, setRole] = useState<Role>("business");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });

  const update = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    console.log("Form submitted, mode:", mode);

    try {
      if (mode === "login") {
        console.log("Attempting login with email:", form.email);
        const { data, error: authError } = await supabase.auth.signInWithPassword({
          email: form.email,
          password: form.password,
        });

        if (authError) {
          setError(authError.message);
          setLoading(false);
          return;
        }

        if (data.user) {
          console.log("Login successful, user:", data.user.id);
          setSubmitted(true);
          setTimeout(() => {
            router.push("/dashboard");
          }, 2000);
        }
      } else {
        console.log("Attempting signup with email:", form.email);
        // Validation
        if (!form.name.trim()) {
          setError("Full name is required");
          setLoading(false);
          return;
        }
        if (!form.email.trim()) {
          setError("Email is required");
          setLoading(false);
          return;
        }
        if (form.password.length < 6) {
          setError("Password must be at least 6 characters");
          setLoading(false);
          return;
        }
        if (form.password !== form.confirmPassword) {
          setError("Passwords do not match");
          setLoading(false);
          return;
        }

        const { error: signUpError } = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
          options: {
            data: {
              full_name: form.name,
            },
          },
        });

        if (signUpError) {
          console.error("Signup error:", signUpError.message);
          setError(signUpError.message);
          setLoading(false);
          return;
        }

        console.log("Signup successful");
        setSubmitted(true);
        setTimeout(() => {
          router.push("/dashboard");
        }, 2000);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred";
      console.error("Auth error:", errorMessage, err);
      setError(errorMessage);
      setLoading(false);
    }
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
              ? `Signed in as ${form.email}. Redirecting...`
              : `Your account has been created. Redirecting to your dashboard...`}
          </p>
          <div className="flex justify-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-forest-800 animate-pulse" />
            <div className="w-2 h-2 rounded-full bg-forest-800 animate-pulse" style={{ animationDelay: "0.2s" }} />
            <div className="w-2 h-2 rounded-full bg-forest-800 animate-pulse" style={{ animationDelay: "0.4s" }} />
          </div>
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
            <span className="text-gold-400 font-black text-sm">LM</span>
          </div>
          <h1 className="font-black text-forest-900 text-xl">LaPai Management Solutions</h1>
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

          {/* Error message */}
          {error && (
            <div className="mb-4 flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-200">
              <AlertCircle size={18} className="text-red-600 shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

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

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {mode === "signup" && (
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Full Name</label>
                <input
                  type="text"
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
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-forest-800 hover:bg-forest-700 disabled:opacity-70 disabled:cursor-not-allowed text-white font-bold text-sm transition-colors mt-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {mode === "login" ? "Signing in..." : "Creating account..."}
                </>
              ) : (
                <>
                  {mode === "login" ? "Sign In" : "Create Account"}
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
