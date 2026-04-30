"use client";

import { useState } from "react";
import { BUSINESSES, PENDING_BUSINESSES, DOCUMENTS, PRICING_TIERS, CATEGORIES, SITE_STATS } from "@/lib/mockData";
import { Check, X, Edit2, Trash2, Plus, BarChart2, Users, FileText, Tag, Settings, Building2 } from "lucide-react";

type AdminTab = "overview" | "businesses" | "documents" | "pricing" | "categories" | "applications" | "appointments";

const TAB_CONFIG: Array<{ id: AdminTab; label: string; icon: typeof BarChart2 }> = [
  { id: "overview", label: "Overview", icon: BarChart2 },
  { id: "businesses", label: "Businesses", icon: Building2 },
  { id: "documents", label: "Documents", icon: FileText },
  { id: "pricing", label: "Pricing", icon: Tag },
  { id: "categories", label: "Categories", icon: Settings },
  { id: "applications", label: "Applications", icon: Users },
];

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [tab, setTab] = useState<AdminTab>("overview");
  const [stats, setStats] = useState(SITE_STATS);
  const [businesses, setBusinesses] = useState([...BUSINESSES, ...PENDING_BUSINESSES]);
  const [pendingOnly, setPendingOnly] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Demo admin password — TODO: Replace with Supabase admin role check
    if (password === "admin123") {
      setAuthed(true);
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  const approveBusiness = (id: string) => {
    setBusinesses((prev) => prev.map((b) => b.id === id ? { ...b, status: "approved" as const } : b));
  };

  const rejectBusiness = (id: string) => {
    setBusinesses((prev) => prev.filter((b) => b.id !== id));
  };

  if (!authed) {
    return (
      <div className="min-h-screen bg-forest-950 flex items-center justify-center px-4 pt-20">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-gold-500 flex items-center justify-center mx-auto mb-4">
              <span className="text-forest-950 font-black text-sm">JN</span>
            </div>
            <h1 className="text-white font-bold text-xl">Admin Panel</h1>
            <p className="text-forest-400 text-sm mt-1">Managed by ConsolAItools</p>
          </div>
          <form onSubmit={handleLogin} className={`bg-forest-900 rounded-2xl p-8 ${error ? "animate-shake" : ""}`}>
            <div className="mb-4">
              <label className="block text-xs font-semibold text-forest-300 mb-2">Admin Password</label>
              <input
                type="password"
                placeholder="Enter admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-forest-800 border border-forest-700 text-white text-sm focus:outline-none focus:border-gold-500 placeholder-forest-500"
              />
              {error && <p className="text-red-400 text-xs mt-2">Incorrect password</p>}
            </div>
            <button type="submit" className="w-full py-3 rounded-xl bg-gold-500 hover:bg-gold-600 text-forest-950 font-bold text-sm transition-colors">
              Access Admin Panel
            </button>
            <p className="text-center text-xs text-forest-500 mt-3">Demo password: admin123</p>
          </form>
        </div>
      </div>
    );
  }

  const pendingCount = businesses.filter((b) => b.status === "pending").length;
  const displayedBusiness = pendingOnly ? businesses.filter((b) => b.status === "pending") : businesses;

  return (
    <div className="min-h-screen bg-slate-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black text-slate-900">Admin Panel</h1>
            <p className="text-slate-500 text-sm">Javona&apos;s Network — managed by ConsolAItools</p>
          </div>
          <button
            onClick={() => setAuthed(false)}
            className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-100 transition-colors"
          >
            Lock Panel
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-xl p-1 mb-8 shadow-sm border border-slate-100 overflow-x-auto">
          {TAB_CONFIG.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${
                tab === id ? "bg-forest-800 text-white" : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
              }`}
            >
              <Icon size={14} />
              {label}
              {id === "businesses" && pendingCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">{pendingCount}</span>
              )}
            </button>
          ))}
        </div>

        {/* Overview */}
        {tab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Site Visitors", key: "visitors" as const, icon: "👁" },
                { label: "Businesses Listed", key: "businesses" as const, icon: "🏢" },
                { label: "States Active", key: "states" as const, icon: "🗺" },
                { label: "Clients Served", key: "clients" as const, icon: "🤝" },
              ].map((stat) => (
                <div key={stat.key} className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{stat.label}</span>
                    <span className="text-xl">{stat.icon}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={stats[stat.key]}
                      onChange={(e) => setStats((s) => ({ ...s, [stat.key]: parseInt(e.target.value) || 0 }))}
                      className="text-2xl font-black text-slate-900 w-full bg-transparent focus:outline-none"
                    />
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Click to edit</p>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
              <button className="px-4 py-2 rounded-lg bg-forest-800 text-white text-sm font-bold hover:bg-forest-700 transition-colors">
                Save Site Stats
              </button>
              <p className="text-xs text-slate-400 mt-2">Changes save to Supabase site_stats table once connected</p>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { label: "Total Businesses", value: businesses.length },
                { label: "Pending Review", value: pendingCount },
                { label: "Active Documents", value: DOCUMENTS.length },
                { label: "Pricing Tiers", value: PRICING_TIERS.length },
                { label: "Categories", value: CATEGORIES.length },
                { label: "Active States", value: 5 },
              ].map((item) => (
                <div key={item.label} className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
                  <p className="text-2xl font-black text-forest-800 mb-1">{item.value}</p>
                  <p className="text-sm text-slate-500">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Businesses */}
        {tab === "businesses" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-600">{businesses.length} total businesses</span>
                <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                  <input type="checkbox" checked={pendingOnly} onChange={(e) => setPendingOnly(e.target.checked)} className="rounded" />
                  Show pending only
                </label>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Business</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Category</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">State</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Tier</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                    <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {displayedBusiness.map((biz) => (
                    <tr key={biz.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-4 font-semibold text-slate-900">{biz.name}</td>
                      <td className="px-5 py-4 text-slate-500">{biz.category}</td>
                      <td className="px-5 py-4 text-slate-500">{biz.state}</td>
                      <td className="px-5 py-4">
                        <span className="capitalize text-xs font-semibold px-2 py-1 rounded-lg bg-forest-50 text-forest-700">{biz.tier}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${biz.status === "approved" ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>
                          {biz.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {biz.status === "pending" && (
                            <>
                              <button onClick={() => approveBusiness(biz.id)} className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center text-green-700 hover:bg-green-100 transition-colors" title="Approve">
                                <Check size={14} />
                              </button>
                              <button onClick={() => rejectBusiness(biz.id)} className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-red-600 hover:bg-red-100 transition-colors" title="Reject">
                                <X size={14} />
                              </button>
                            </>
                          )}
                          <button className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors">
                            <Edit2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Documents */}
        {tab === "documents" && (
          <div>
            <div className="flex justify-between mb-4">
              <span className="text-sm text-slate-600">{DOCUMENTS.length} documents</span>
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-forest-800 text-white text-sm font-semibold hover:bg-forest-700 transition-colors">
                <Plus size={14} />
                Add Document
              </button>
            </div>
            <div className="space-y-3">
              {DOCUMENTS.map((doc) => (
                <div key={doc.id} className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-slate-900 text-sm">{doc.title}</h3>
                      <span className="text-xs text-slate-400 bg-slate-50 px-2 py-0.5 rounded-lg">{doc.category}</span>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-1">{doc.description}</p>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <span className="font-black text-forest-800">${doc.price}</span>
                    <div className="flex gap-2">
                      <button className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors">
                        <Edit2 size={13} />
                      </button>
                      <button className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-red-500 hover:bg-red-100 transition-colors">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pricing */}
        {tab === "pricing" && (
          <div className="space-y-4">
            <p className="text-sm text-slate-500 mb-4">Edit tier names, prices, and features. Changes reflect site-wide immediately once connected to Supabase.</p>
            {PRICING_TIERS.map((tier) => (
              <div key={tier.id} className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-slate-900">{tier.name}</h3>
                    {tier.isFeatured && <span className="text-xs font-semibold px-2 py-1 rounded-lg bg-gold-100 text-gold-700">Featured</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-black text-forest-800">{tier.price === 0 ? "Free" : `$${tier.price}/mo`}</span>
                    <button className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors">
                      <Edit2 size={13} />
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {tier.features.map((f) => (
                    <span key={f} className="text-xs text-slate-600 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">{f}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Categories */}
        {tab === "categories" && (
          <div>
            <div className="flex justify-between mb-4">
              <span className="text-sm text-slate-600">{CATEGORIES.length} categories</span>
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-forest-800 text-white text-sm font-semibold hover:bg-forest-700 transition-colors">
                <Plus size={14} />
                Add Category
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {CATEGORIES.map((cat) => (
                <div key={cat.id} className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{cat.icon}</span>
                    <div>
                      <p className="font-semibold text-slate-900 text-sm">{cat.name}</p>
                      <p className="text-xs text-slate-400">{cat.count} businesses</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors">
                      <Edit2 size={12} />
                    </button>
                    <button className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center text-red-500 hover:bg-red-100 transition-colors">
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Applications */}
        {tab === "applications" && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8 text-center">
            <Users className="mx-auto text-forest-300 mb-3" size={40} />
            <h3 className="font-bold text-slate-700 mb-2">Intake Applications</h3>
            <p className="text-slate-400 text-sm">Applications submitted via /apply will appear here once Supabase is connected.</p>
          </div>
        )}
      </div>
    </div>
  );
}
