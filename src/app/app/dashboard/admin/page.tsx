"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppSidebar from "@/components/AppSidebar";
import AppHeader from "@/components/AppHeader";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { Shield, UserCog, Activity, Database, TrendingUp } from "lucide-react";

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);
  const [tab, setTab] = useState("overview");

  useEffect(() => {
    const stored = localStorage.getItem("auticare_user");
    if (!stored) { router.push("/app/login"); return; }
    setUser(JSON.parse(stored));
  }, [router]);

  const stats = [
    { label: "Total Users", value: "187", icon: "👥", change: "+12 this month", color: "from-blue-500 to-blue-600" },
    { label: "Active Patients", value: "341", icon: "🧒", change: "+28 this month", color: "from-green-500 to-green-600" },
    { label: "Genetic Reports", value: "156", icon: "🧬", change: "+18 this month", color: "from-purple-500 to-purple-600" },
    { label: "Approved Plans", value: "98", icon: "✅", change: "+9 this month", color: "from-amber-500 to-amber-600" },
    { label: "AI Predictions", value: "1,243", icon: "🤖", change: "This month", color: "from-red-500 to-red-600" },
    { label: "System Uptime", value: "99.9%", icon: "⚡", change: "Last 30 days", color: "from-teal-500 to-teal-600" },
  ];

  const roleData = [
    { name: "Doctors", value: 42, color: "#3b82f6" },
    { name: "Therapists", value: 68, color: "#8b5cf6" },
    { name: "Parents", value: 65, color: "#22c55e" },
    { name: "Admins", value: 12, color: "#f59e0b" },
  ];

  const monthlyData = [
    { month: "Jan", users: 120, patients: 280, plans: 65 },
    { month: "Feb", users: 135, patients: 295, plans: 72 },
    { month: "Mar", users: 148, patients: 310, plans: 80 },
    { month: "Apr", users: 155, patients: 320, plans: 85 },
    { month: "May", users: 170, patients: 335, plans: 92 },
    { month: "Jun", users: 187, patients: 341, plans: 98 },
  ];

  const users = [
    { name: "Dr. Sarah Al-Mansouri", role: "doctor", email: "sarah@auticare.ai", status: "Active", clinic: "Downtown Clinic", joined: "Jan 2026" },
    { name: "Ms. Leila Karim", role: "therapist", email: "leila@auticare.ai", status: "Active", clinic: "Children's Center", joined: "Feb 2026" },
    { name: "Rania Hassan", role: "parent", email: "rania@gmail.com", status: "Active", clinic: "—", joined: "Mar 2026" },
    { name: "Dr. James Okonkwo", role: "doctor", email: "james@auticare.ai", status: "Active", clinic: "Medical Center", joined: "Jan 2026" },
    { name: "Ms. Fatima Al-Zahraa", role: "therapist", email: "fatima@auticare.ai", status: "Active", clinic: "Children's Center", joined: "Mar 2026" },
  ];

  const auditLogs = [
    { action: "POST /api/nutrition/generate", user: "Dr. Sarah", resource: "nutrition", status: 201, time: "2 min ago", ip: "192.168.1.1" },
    { action: "PUT /api/nutrition/:id/approve", user: "Dr. James", resource: "nutrition", status: 200, time: "15 min ago", ip: "10.0.0.2" },
    { action: "POST /api/genetic/upload", user: "Dr. Sarah", resource: "genetic", status: 201, time: "1h ago", ip: "192.168.1.1" },
    { action: "POST /api/logs", user: "Rania Hassan", resource: "logs", status: 201, time: "2h ago", ip: "203.0.0.5" },
    { action: "GET /api/ai/predict/:id", user: "Dr. James", resource: "ai", status: 200, time: "3h ago", ip: "10.0.0.2" },
  ];

  const roleColors: Record<string, string> = {
    doctor: "badge-blue", therapist: "badge-purple", parent: "badge-green", admin: "badge-yellow",
  };

  if (!user) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-slate-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900">
      <AppSidebar role="admin" userName={user.name} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AppHeader title="Admin Panel" userName={user.name} role="admin" />
        <main className="flex-1 overflow-y-auto p-6 space-y-6 pt-16 md:pt-6">
          {/* Tabs */}
          <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700">
            {[
              { id: "overview", icon: TrendingUp, label: "Overview" },
              { id: "users", icon: UserCog, label: "Users" },
              { id: "audit", icon: Shield, label: "Audit Logs" },
            ].map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-all ${
                  tab === t.id ? "border-brand-600 text-brand-600" : "border-transparent text-slate-500 hover:text-slate-700"
                }`}>
                <t.icon className="w-4 h-4" />{t.label}
              </button>
            ))}
          </div>

          {tab === "overview" && (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {stats.map((s, i) => (
                  <div key={i} className="card p-5">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-2xl">{s.icon}</span>
                      <span className={`text-xs font-bold text-white px-2 py-1 rounded-lg bg-gradient-to-r ${s.color}`}>Live</span>
                    </div>
                    <p className="text-3xl font-extrabold text-slate-900 dark:text-white">{s.value}</p>
                    <p className="text-sm text-slate-500 mt-0.5">{s.label}</p>
                    <p className="text-xs text-slate-400 mt-1">{s.change}</p>
                  </div>
                ))}
              </div>

              <div className="grid lg:grid-cols-3 gap-6">
                <div className="card p-5">
                  <h3 className="font-bold text-slate-900 dark:text-white mb-4">Users by Role</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={roleData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                        {roleData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {roleData.map(d => (
                      <div key={d.name} className="flex items-center gap-1.5 text-xs text-slate-500">
                        <div className="w-3 h-3 rounded-full" style={{ background: d.color }} />
                        {d.name}: {d.value}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="card p-5 lg:col-span-2">
                  <h3 className="font-bold text-slate-900 dark:text-white mb-4">Platform Growth (6 months)</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Bar dataKey="users" fill="#3b82f6" name="Users" radius={[4,4,0,0]} />
                      <Bar dataKey="patients" fill="#22c55e" name="Patients" radius={[4,4,0,0]} />
                      <Bar dataKey="plans" fill="#8b5cf6" name="Plans" radius={[4,4,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          )}

          {tab === "users" && (
            <div className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-900 dark:text-white">All Users</h3>
                <div className="flex gap-2">
                  {["all", "doctor", "therapist", "parent"].map(r => (
                    <button key={r} className="btn btn-sm btn-ghost capitalize">{r}</button>
                  ))}
                </div>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="text-xs text-slate-400 border-b border-slate-100 dark:border-slate-700">
                    {["User", "Role", "Clinic", "Status", "Joined", "Actions"].map(h => (
                      <th key={h} className="text-left pb-3 pr-4 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
                  {users.map((u, i) => (
                    <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition">
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-white text-xs font-bold flex items-center justify-center">{u.name.charAt(0)}</div>
                          <div>
                            <p className="text-sm font-medium text-slate-900 dark:text-white">{u.name}</p>
                            <p className="text-xs text-slate-400">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 pr-4"><span className={`badge text-xs ${roleColors[u.role]}`}>{u.role}</span></td>
                      <td className="py-3 pr-4 text-sm text-slate-500">{u.clinic}</td>
                      <td className="py-3 pr-4"><span className="badge badge-green text-xs">{u.status}</span></td>
                      <td className="py-3 pr-4 text-sm text-slate-400">{u.joined}</td>
                      <td className="py-3">
                        <div className="flex gap-1">
                          <button className="btn btn-sm btn-ghost text-brand-600">Edit</button>
                          <button className="btn btn-sm btn-ghost text-red-500">Suspend</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {tab === "audit" && (
            <div className="card p-5">
              <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5" /> Audit Logs — HIPAA Compliance Trail
              </h3>
              <div className="space-y-2">
                {auditLogs.map((log, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 font-mono text-xs">
                    <div className="flex items-center gap-3">
                      <span className={`w-12 text-center py-0.5 rounded font-bold ${log.status < 300 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{log.status}</span>
                      <span className="text-slate-600 dark:text-slate-300">{log.action}</span>
                    </div>
                    <div className="flex items-center gap-4 text-slate-400">
                      <span>{log.user}</span>
                      <span>{log.ip}</span>
                      <span>{log.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
