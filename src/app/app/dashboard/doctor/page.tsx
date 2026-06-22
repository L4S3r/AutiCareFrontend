"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppSidebar from "@/components/AppSidebar";
import AppHeader from "@/components/AppHeader";

export default function DoctorDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("auticare_user");
    if (!stored) { router.push("/app/login"); return; }
    const parsed = JSON.parse(stored);
    if (parsed.role !== "doctor") { router.push(`/app/dashboard/${parsed.role}`); return; }
    setUser(parsed);
  }, [router]);

  if (!user) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>;

  const stats = [
    { label: "Active Patients", value: "24", change: "+2 this week", color: "from-blue-500 to-blue-600", icon: "👥" },
    { label: "Pending Approvals", value: "3", change: "Nutrition plans", color: "from-amber-500 to-amber-600", icon: "⏳" },
    { label: "Genetic Reports", value: "18", change: "+5 this month", color: "from-purple-500 to-purple-600", icon: "🧬" },
    { label: "Approved Plans", value: "41", change: "Total approved", color: "from-green-500 to-green-600", icon: "✅" },
  ];

  const pendingApprovals = [
    { name: "Omar Hassan", age: 7, marker: "MTHFR C677T", plan: "Methyl Folate + B12", risk: "medium", date: "Today" },
    { name: "Layla Ahmed", age: 5, marker: "HLA-DQ2", plan: "Gluten-Free Diet Protocol", risk: "high", date: "Yesterday" },
    { name: "Karim Nasser", age: 9, marker: "VDR + FADS1", plan: "Vitamin D3 + Omega-3", risk: "low", date: "2 days ago" },
  ];

  const recentPatients = [
    { name: "Omar Hassan", age: 7, lastSeen: "Today", riskLevel: "medium", status: "Active" },
    { name: "Layla Ahmed", age: 5, lastSeen: "Yesterday", riskLevel: "high", status: "Active" },
    { name: "Karim Nasser", age: 9, lastSeen: "3 days ago", riskLevel: "low", status: "Active" },
    { name: "Sara Ibrahim", age: 6, lastSeen: "1 week ago", riskLevel: "low", status: "Stable" },
  ];

  const aiAlerts = [
    { patient: "Layla Ahmed", message: "High meltdown risk detected — 4 meltdowns in past 3 days. Poor sleep pattern.", level: "high" },
    { patient: "Omar Hassan", message: "Moderate behavioral risk — sleep hours below 6h average over 5 days.", level: "medium" },
  ];

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900">
      <AppSidebar role="doctor" userName={user.name} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AppHeader title="Doctor Dashboard" userName={user.name} role="doctor" />
        <main className="flex-1 overflow-y-auto p-6 space-y-6 pt-16 md:pt-6">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((s, i) => (
              <div key={i} className="card p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl">{s.icon}</span>
                  <span className={`badge text-xs font-semibold px-2 py-0.5 rounded-lg text-white bg-gradient-to-r ${s.color}`}>Live</span>
                </div>
                <p className="text-3xl font-extrabold text-slate-900 dark:text-white">{s.value}</p>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-0.5">{s.label}</p>
                <p className="text-xs text-slate-400 mt-1">{s.change}</p>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* AI Alerts */}
            <div className="card p-5">
              <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                🚨 AI Risk Alerts <span className="badge badge-red text-xs">{aiAlerts.length}</span>
              </h3>
              <div className="space-y-3">
                {aiAlerts.map((a, i) => (
                  <div key={i} className={`p-3 rounded-xl border-l-4 ${a.level === "high" ? "bg-red-50 border-red-500 dark:bg-red-950/30" : "bg-amber-50 border-amber-500 dark:bg-amber-950/30"}`}>
                    <p className="text-sm font-semibold text-slate-800 dark:text-white">{a.patient}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">{a.message}</p>
                    <span className={`mt-2 inline-block badge text-xs ${a.level === "high" ? "badge-red" : "badge-yellow"}`}>
                      {a.level === "high" ? "⚠️ High Risk" : "⚡ Moderate Risk"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pending Approvals */}
            <div className="card p-5 lg:col-span-2">
              <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                ⏳ Pending AI Plan Approvals
                <span className="badge badge-yellow text-xs">{pendingApprovals.length}</span>
              </h3>
              <div className="space-y-3">
                {pendingApprovals.map((p, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-white text-sm font-bold flex items-center justify-center">
                        {p.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{p.name} <span className="text-slate-400 font-normal">· Age {p.age}</span></p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{p.marker} → {p.plan}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`badge text-xs ${p.risk === "high" ? "badge-red" : p.risk === "medium" ? "badge-yellow" : "badge-green"}`}>
                        {p.risk}
                      </span>
                      <button className="btn btn-sm btn-primary">Review</button>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-center mt-3 text-xs text-slate-400">
                ⚕️ All AI recommendations require physician approval before implementation
              </p>
            </div>
          </div>

          {/* Recent Patients */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 dark:text-white">Recent Patients</h3>
              <button className="btn btn-sm btn-ghost text-brand-600">View All →</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-xs text-slate-400 border-b border-slate-100 dark:border-slate-700">
                    {["Patient", "Age", "Last Seen", "Risk Level", "Status", "Action"].map(h => (
                      <th key={h} className="text-left pb-3 font-medium pr-4">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
                  {recentPatients.map((p, i) => (
                    <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition">
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-white text-xs font-bold flex items-center justify-center">{p.name.charAt(0)}</div>
                          <span className="text-sm font-medium text-slate-900 dark:text-white">{p.name}</span>
                        </div>
                      </td>
                      <td className="py-3 pr-4 text-sm text-slate-500">{p.age}y</td>
                      <td className="py-3 pr-4 text-sm text-slate-500">{p.lastSeen}</td>
                      <td className="py-3 pr-4">
                        <span className={`badge text-xs ${p.riskLevel === "high" ? "badge-red" : p.riskLevel === "medium" ? "badge-yellow" : "badge-green"}`}>
                          {p.riskLevel}
                        </span>
                      </td>
                      <td className="py-3 pr-4"><span className="badge badge-green text-xs">{p.status}</span></td>
                      <td className="py-3"><button className="btn btn-sm btn-outline">View</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
