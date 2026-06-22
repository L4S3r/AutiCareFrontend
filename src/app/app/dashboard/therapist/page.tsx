"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppSidebar from "@/components/AppSidebar";
import AppHeader from "@/components/AppHeader";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis } from "recharts";

export default function TherapistDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);
  const [sessionForm, setSessionForm] = useState({ patient: "", type: "", duration: 60, notes: "", progress: "good", goals: "" });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("auticare_user");
    if (!stored) { router.push("/app/login"); return; }
    setUser(JSON.parse(stored));
  }, [router]);

  const progressData = [
    { week: "W1", attention: 42, memory: 38, emotion: 30, social: 25 },
    { week: "W2", attention: 48, memory: 45, emotion: 35, social: 30 },
    { week: "W3", attention: 55, memory: 50, emotion: 42, social: 38 },
    { week: "W4", attention: 60, memory: 58, emotion: 50, social: 45 },
    { week: "W5", attention: 65, memory: 62, emotion: 55, social: 50 },
    { week: "W6", attention: 72, memory: 68, emotion: 60, social: 55 },
  ];

  const radarData = [
    { skill: "Attention", score: 72 }, { skill: "Memory", score: 68 },
    { skill: "Communication", score: 55 }, { skill: "Social", score: 50 },
    { skill: "Emotion Rec.", score: 60 }, { skill: "Motor Skills", score: 75 },
  ];

  const patients = [
    { name: "Omar Hassan", age: 7, sessions: 24, progress: "improving", lastSession: "Today", nextSession: "Thu Jun 25" },
    { name: "Layla Ahmed", age: 5, sessions: 18, progress: "stable", lastSession: "Yesterday", nextSession: "Fri Jun 26" },
    { name: "Karim Nasser", age: 9, sessions: 31, progress: "excellent", lastSession: "Mon", nextSession: "Wed Jun 24" },
  ];

  const interventions = [
    { type: "ABA Therapy", target: "Self-regulation", progress: 68, color: "bg-blue-500" },
    { type: "Social Skills Training", target: "Peer interaction", progress: 45, color: "bg-purple-500" },
    { type: "Sensory Integration", target: "Touch tolerance", progress: 72, color: "bg-green-500" },
    { type: "Communication", target: "Expressive language", progress: 55, color: "bg-orange-500" },
  ];

  if (!user) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900">
      <AppSidebar role="therapist" userName={user.name} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AppHeader title="Therapist Dashboard" userName={user.name} role="therapist" />
        <main className="flex-1 overflow-y-auto p-6 space-y-6 pt-16 md:pt-6">

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Active Patients", value: "12", icon: "👥", color: "text-purple-600" },
              { label: "Sessions This Month", value: "38", icon: "📋", color: "text-blue-600" },
              { label: "Avg Progress Score", value: "72%", icon: "📈", color: "text-green-600" },
              { label: "Pending Reports", value: "2", icon: "⏳", color: "text-amber-600" },
            ].map((s, i) => (
              <div key={i} className="card p-4 text-center">
                <div className="text-2xl mb-2">{s.icon}</div>
                <p className={`text-3xl font-extrabold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-slate-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-5 gap-6">
            {/* Progress Chart */}
            <div className="card p-5 lg:col-span-3">
              <h3 className="font-bold text-slate-900 dark:text-white mb-4">📊 6-Week Progress — Omar Hassan</h3>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={progressData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} domain={[0, 100]} />
                  <Tooltip />
                  <Line type="monotone" dataKey="attention" stroke="#3b82f6" strokeWidth={2} dot={false} name="Attention" />
                  <Line type="monotone" dataKey="memory" stroke="#8b5cf6" strokeWidth={2} dot={false} name="Memory" />
                  <Line type="monotone" dataKey="emotion" stroke="#22c55e" strokeWidth={2} dot={false} name="Emotion Rec." />
                  <Line type="monotone" dataKey="social" stroke="#f59e0b" strokeWidth={2} dot={false} name="Social" />
                </LineChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-3 mt-2">
                {[["#3b82f6","Attention"], ["#8b5cf6","Memory"], ["#22c55e","Emotion"], ["#f59e0b","Social"]].map(([c, l]) => (
                  <div key={l} className="flex items-center gap-1.5 text-xs text-slate-500">
                    <div className="w-3 h-1.5 rounded-full" style={{ background: c }} />
                    {l}
                  </div>
                ))}
              </div>
            </div>

            {/* Skill Radar */}
            <div className="card p-5 lg:col-span-2">
              <h3 className="font-bold text-slate-900 dark:text-white mb-4">🎯 Skill Profile</h3>
              <ResponsiveContainer width="100%" height={220}>
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="skill" tick={{ fontSize: 10 }} />
                  <Radar name="Score" dataKey="score" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Intervention Progress */}
            <div className="card p-5">
              <h3 className="font-bold text-slate-900 dark:text-white mb-4">🎯 Active Interventions</h3>
              <div className="space-y-4">
                {interventions.map((item, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-slate-700 dark:text-slate-300">{item.type}</span>
                      <span className="text-slate-400">{item.progress}%</span>
                    </div>
                    <p className="text-xs text-slate-400 mb-1.5">Goal: {item.target}</p>
                    <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-700">
                      <div className={`h-2 rounded-full ${item.color} transition-all duration-500`} style={{ width: `${item.progress}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Session Log Form */}
            <div className="card p-5">
              <h3 className="font-bold text-slate-900 dark:text-white mb-4">📝 Log Session</h3>
              {saved ? (
                <div className="text-center py-6">
                  <div className="text-4xl mb-2">✅</div>
                  <p className="font-semibold text-green-600">Session Logged!</p>
                  <button className="btn btn-sm btn-outline mt-3" onClick={() => setSaved(false)}>Log Another</button>
                </div>
              ) : (
                <form className="space-y-3" onSubmit={e => { e.preventDefault(); setSaved(true); }}>
                  <select className="input text-sm" value={sessionForm.patient} onChange={e => setSessionForm({ ...sessionForm, patient: e.target.value })} required>
                    <option value="">Select patient...</option>
                    {patients.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
                  </select>
                  <div className="grid grid-cols-2 gap-2">
                    <select className="input text-sm" onChange={e => setSessionForm({ ...sessionForm, type: e.target.value })}>
                      <option>ABA Therapy</option><option>Social Skills</option><option>Sensory</option><option>Communication</option>
                    </select>
                    <select className="input text-sm" onChange={e => setSessionForm({ ...sessionForm, progress: e.target.value })}>
                      <option>excellent</option><option>good</option><option>fair</option><option>regressed</option>
                    </select>
                  </div>
                  <textarea className="input text-sm resize-none" rows={3} placeholder="Session notes and observations..."
                    onChange={e => setSessionForm({ ...sessionForm, notes: e.target.value })} required />
                  <button type="submit" className="btn btn-primary w-full btn-sm">Save Session Report</button>
                </form>
              )}
            </div>
          </div>

          {/* Patient List */}
          <div className="card p-5">
            <h3 className="font-bold text-slate-900 dark:text-white mb-4">My Patients</h3>
            <div className="space-y-3">
              {patients.map((p, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 text-white text-sm font-bold flex items-center justify-center">{p.name.charAt(0)}</div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{p.name} · Age {p.age}</p>
                      <p className="text-xs text-slate-400">{p.sessions} sessions · Last: {p.lastSession}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`badge text-xs ${p.progress === "excellent" ? "badge-green" : p.progress === "improving" ? "badge-blue" : "badge-yellow"}`}>{p.progress}</span>
                    <span className="text-xs text-slate-400">Next: {p.nextSession}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
