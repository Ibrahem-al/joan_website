"use client";

import { useState, useEffect } from "react";
import { ANALYTICS_EVENTS, SITE_STATS } from "@/lib/mockData";
import { Lock, RefreshCw, Eye, ShoppingCart, FileText, Users, BarChart2, Activity } from "lucide-react";

// Analytics dashboard password — change before launch
// TODO: Set ANALYTICS_DASHBOARD_PASSWORD env var before launch (seed: 123456)
const DEMO_PASSWORD = "123456";

function PasswordGate({ onUnlock }: { onUnlock: () => void }) {
  const [password, setPassword] = useState("");
  const [shake, setShake] = useState(false);
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const correctPassword = process.env.NEXT_PUBLIC_ANALYTICS_PASSWORD || DEMO_PASSWORD;
    if (password === correctPassword) {
      localStorage.setItem("analytics_auth", "1");
      onUnlock();
    } else {
      setShake(true);
      setError(true);
      setTimeout(() => setShake(false), 600);
      setPassword("");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-xs">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-gold-500/20 border border-gold-500/30 flex items-center justify-center mx-auto mb-4">
            <Lock className="text-gold-400" size={20} />
          </div>
          <h1 className="text-white font-bold text-lg">Analytics Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">Enter your password to continue</p>
        </div>
        <form onSubmit={handleSubmit} className={shake ? "animate-shake" : ""}>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(false); }}
            autoFocus
            className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-gold-500 placeholder-slate-500 mb-3"
          />
          {error && <p className="text-red-400 text-xs mb-3">Incorrect password</p>}
          <button type="submit" className="w-full py-3 rounded-xl bg-gold-500 hover:bg-gold-600 text-slate-950 font-bold text-sm transition-colors">
            Unlock
          </button>
        </form>
      </div>
    </div>
  );
}

const EVENT_COLORS: Record<string, string> = {
  page_view: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  profile_view: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  store_visit: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  mock_purchase: "bg-gold-500/20 text-gold-400 border-gold-500/30",
  appointment_submit: "bg-green-500/20 text-green-400 border-green-500/30",
  intake_submit: "bg-green-500/20 text-green-400 border-green-500/30",
  registration_submit: "bg-green-500/20 text-green-400 border-green-500/30",
  contact_click: "bg-slate-500/20 text-slate-400 border-slate-500/30",
};

function timeAgo(isoStr: string) {
  const diff = (Date.now() - new Date(isoStr).getTime()) / 1000;
  if (diff < 60) return `${Math.round(diff)}s ago`;
  if (diff < 3600) return `${Math.round(diff / 60)}m ago`;
  return `${Math.round(diff / 3600)}h ago`;
}

export default function AnalyticsPage() {
  const [authed, setAuthed] = useState(false);
  const [now, setNow] = useState(new Date());
  const [stats, setStats] = useState({ ...SITE_STATS });
  const [events] = useState(ANALYTICS_EVENTS);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    if (localStorage.getItem("analytics_auth") === "1") {
      setAuthed(true);
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLock = () => {
    localStorage.removeItem("analytics_auth");
    setAuthed(false);
  };

  if (!authed) {
    return <PasswordGate onUnlock={() => setAuthed(true)} />;
  }

  const totalViews = events.filter((e) => e.event_type === "page_view").length;
  const uniqueSessions = new Set(events.map((e) => e.session_id)).size;
  const formSubmissions = events.filter((e) => ["appointment_submit", "intake_submit", "registration_submit"].includes(e.event_type)).length;
  const purchases = events.filter((e) => e.event_type === "mock_purchase").length;
  const profileViews = events.filter((e) => e.event_type === "profile_view").length;
  const storeVisits = events.filter((e) => e.event_type === "store_visit").length;

  const METRIC_CARDS = [
    { label: "Total Page Views", value: totalViews, icon: Eye, color: "text-blue-400" },
    { label: "Unique Sessions", value: uniqueSessions, icon: Users, color: "text-purple-400" },
    { label: "Form Submissions", value: formSubmissions, icon: FileText, color: "text-green-400" },
    { label: "Documents Sold", value: purchases, icon: ShoppingCart, color: "text-gold-400" },
    { label: "Profile Views", value: profileViews, icon: BarChart2, color: "text-cyan-400" },
    { label: "Store Visits", value: storeVisits, icon: Activity, color: "text-pink-400" },
  ];

  // Page distribution for simple bar chart
  const pageCounts: Record<string, number> = {};
  events.forEach((e) => { pageCounts[e.page] = (pageCounts[e.page] || 0) + 1; });
  const topPages = Object.entries(pageCounts).sort((a, b) => b[1] - a[1]).slice(0, 8);
  const maxPageCount = Math.max(...topPages.map(([, c]) => c));

  // Event type distribution
  const eventTypes: Record<string, number> = {};
  events.forEach((e) => { eventTypes[e.event_type] = (eventTypes[e.event_type] || 0) + 1; });

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <div className="border-b border-slate-800 px-6 py-4 flex items-center justify-between sticky top-0 bg-slate-950 z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gold-500/20 border border-gold-500/30 flex items-center justify-center">
            <BarChart2 className="text-gold-400" size={16} />
          </div>
          <div>
            <h1 className="font-bold text-sm">Analytics Dashboard</h1>
            <p className="text-xs text-slate-500">LaPai Management Solutions</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-sm font-medium tabular-nums">{now.toLocaleTimeString()}</div>
            <div className="text-xs text-slate-500">{now.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</div>
          </div>
          <button
            onClick={handleLock}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
          >
            <Lock size={12} />
            Lock
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Metric cards */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {METRIC_CARDS.map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.label} className="bg-slate-900 rounded-xl p-5 border border-slate-800">
                <Icon className={`${card.color} mb-3`} size={18} />
                <div className="text-2xl font-black mb-1">{card.value}</div>
                <div className="text-xs text-slate-500">{card.label}</div>
              </div>
            );
          })}
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top pages bar chart */}
          <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
            <h3 className="font-bold text-sm mb-5">Top Pages</h3>
            <div className="space-y-3">
              {topPages.map(([page, count]) => (
                <div key={page} className="flex items-center gap-3">
                  <div className="text-xs text-slate-400 w-32 truncate shrink-0">{page || "/"}</div>
                  <div className="flex-1 h-5 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-forest-600 to-forest-500 transition-all duration-700"
                      style={{ width: `${(count / maxPageCount) * 100}%` }}
                    />
                  </div>
                  <div className="text-xs font-semibold text-slate-300 w-6 text-right">{count}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Event breakdown */}
          <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
            <h3 className="font-bold text-sm mb-5">Event Breakdown</h3>
            <div className="space-y-3">
              {Object.entries(eventTypes).sort((a, b) => b[1] - a[1]).map(([type, count]) => {
                const colorClass = EVENT_COLORS[type] || "bg-slate-500/20 text-slate-400 border-slate-500/30";
                return (
                  <div key={type} className="flex items-center justify-between">
                    <span className={`text-xs font-medium px-2 py-1 rounded-lg border ${colorClass}`}>
                      {type.replace(/_/g, " ")}
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 rounded-full bg-slate-800">
                        <div
                          className="h-full rounded-full bg-slate-500"
                          style={{ width: `${(count / events.length) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-slate-300">{count}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Site stats editor */}
        <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-sm">Site Stats Snapshot</h3>
            <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gold-500/10 border border-gold-500/30 text-gold-400 text-xs font-medium hover:bg-gold-500/20 transition-colors">
              <RefreshCw size={12} />
              Save to Database
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { key: "visitors" as const, label: "Site Visitors" },
              { key: "businesses" as const, label: "Businesses Listed" },
              { key: "states" as const, label: "States Active" },
              { key: "clients" as const, label: "Clients Served" },
            ].map((item) => (
              <div key={item.key} className="bg-slate-800 rounded-xl p-4">
                <label className="block text-xs text-slate-500 mb-2">{item.label}</label>
                <input
                  type="number"
                  value={stats[item.key]}
                  onChange={(e) => setStats((s) => ({ ...s, [item.key]: parseInt(e.target.value) || 0 }))}
                  className="w-full bg-transparent text-xl font-black text-white focus:outline-none"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Recent activity feed */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
            <h3 className="font-bold text-sm">Recent Activity</h3>
            <span className="text-xs text-slate-500">Last 50 events · auto-refreshes every 60s</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-800/50">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500">Time</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500">Event Type</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500">Page</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500">Metadata</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {events.map((event) => {
                  const colorClass = EVENT_COLORS[event.event_type] || "bg-slate-500/20 text-slate-400 border-slate-500/30";
                  const isExpanded = expanded === event.id;
                  return (
                    <tr key={event.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-3 text-xs text-slate-400 tabular-nums whitespace-nowrap">{timeAgo(event.created_at)}</td>
                      <td className="px-6 py-3">
                        <span className={`text-xs font-medium px-2 py-1 rounded-lg border ${colorClass} whitespace-nowrap`}>
                          {event.event_type.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-xs text-slate-400 font-mono">{event.page}</td>
                      <td className="px-6 py-3 text-xs">
                        {Object.keys(event.metadata || {}).length > 0 ? (
                          <button
                            onClick={() => setExpanded(isExpanded ? null : event.id)}
                            className="text-slate-400 hover:text-slate-200 transition-colors font-mono"
                          >
                            {isExpanded
                              ? JSON.stringify(event.metadata, null, 2)
                              : `{${Object.keys(event.metadata!).join(", ")}}`}
                          </button>
                        ) : (
                          <span className="text-slate-600">{"{}"}</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
