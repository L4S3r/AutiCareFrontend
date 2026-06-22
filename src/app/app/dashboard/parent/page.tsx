"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppSidebar from "@/components/AppSidebar";
import AppHeader from "@/components/AppHeader";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from "recharts";

export default function ParentDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);
  const [logForm, setLogForm] = useState({ mood: "happy", sleepHours: "8", meals: "good", medication: true, meltdowns: 0, notes: "" });
  const [logSubmitted, setLogSubmitted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("auticare_user");
    if (!stored) { router.push("/app/login"); return; }
    const parsed = JSON.parse(stored);
    setUser(parsed);
  }, [router]);

  const sleepData = [
    { day: "Mon", hours: 7.5 }, { day: "Tue", hours: 6 }, { day: "Wed", hours: 8 },
    { day: "Thu", hours: 5.5 }, { day: "Fri", hours: 7 }, { day: "Sat", hours: 9 }, { day: "Sun", hours: 8 },
  ];

  const moodData = [
    { day: "Mon", happy: 1, neutral: 0, anxious: 0 }, { day: "Tue", happy: 0, neutral: 1, anxious: 0 },
    { day: "Wed", happy: 1, neutral: 0, anxious: 0 }, { day: "Thu", happy: 0, neutral: 0, anxious: 1 },
    { day: "Fri", happy: 1, neutral: 0, anxious: 0 }, { day: "Sat", happy: 1, neutral: 0, anxious: 0 },
    { day: "Sun", happy: 0, neutral: 1, anxious: 0 },
  ];

  const nutritionPlan = {
    approved: true,
    approvedBy: "Dr. Sarah Al-Mansouri",
    date: "June 15, 2026",
    supplements: [
      { name: "Methyl Folate 5-MTHF", dosage: "400mcg", frequency: "Daily with breakfast" },
      { name: "Methylcobalamin B12", dosage: "1000mcg", frequency: "Daily sublingual" },
      { name: "Vitamin D3 + K2", dosage: "2000 IU", frequency: "Daily with fat-containing meal" },
    ],
    restrictions: ["Avoid synthetic folic acid", "Limit gluten exposure", "No artificial food dyes"],
  };

  if (!user) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900">
      <AppSidebar role="parent" userName={user.name} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AppHeader title="Parent Dashboard" userName={user.name} role="parent" />
        <main className="flex-1 overflow-y-auto p-6 space-y-6 pt-16 md:pt-6">

          {/* AI Insight Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border border-amber-200 dark:border-amber-800">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🤖</span>
              <div>
                <p className="font-semibold text-amber-800 dark:text-amber-300">AI Behavioral Insight</p>
                <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">Omar's sleep has been below 6 hours for 3 consecutive days. This may increase risk of behavioral challenges. Consider adjusting bedtime routine and consult your therapist.</p>
                <p className="text-xs text-amber-500 mt-2">Reviewed by care team · Assistive AI only</p>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Daily Log Form */}
            <div className="card p-5">
              <h3 className="font-bold text-slate-900 dark:text-white mb-4">📝 Today's Log</h3>
              {logSubmitted ? (
                <div className="text-center py-6">
                  <div className="text-4xl mb-2">✅</div>
                  <p className="font-semibold text-green-600">Log Saved!</p>
                  <p className="text-xs text-slate-400 mt-1">AI is analyzing today's data</p>
                  <button className="btn btn-sm btn-outline mt-3" onClick={() => setLogSubmitted(false)}>Add Another</button>
                </div>
              ) : (
                <form className="space-y-3" onSubmit={e => { e.preventDefault(); setLogSubmitted(true); }}>
                  <div>
                    <label className="text-xs font-medium text-slate-500 block mb-1">Mood</label>
                    <select className="input text-sm" value={logForm.mood} onChange={e => setLogForm({ ...logForm, mood: e.target.value })}>
                      {["very_happy", "happy", "neutral", "sad", "anxious", "angry"].map(m => (
                        <option key={m} value={m}>{m.replace("_", " ")}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-500 block mb-1">Sleep Hours: {logForm.sleepHours}h</label>
                    <input type="range" min="2" max="12" step="0.5" className="w-full accent-green-500"
                      value={logForm.sleepHours} onChange={e => setLogForm({ ...logForm, sleepHours: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-500 block mb-1">Meal Quality</label>
                    <select className="input text-sm" value={logForm.meals} onChange={e => setLogForm({ ...logForm, meals: e.target.value })}>
                      {["excellent", "good", "fair", "poor"].map(m => <option key={m}>{m}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-500 block mb-1">Meltdowns: {logForm.meltdowns}</label>
                    <input type="range" min="0" max="10" className="w-full accent-red-500"
                      value={logForm.meltdowns} onChange={e => setLogForm({ ...logForm, meltdowns: Number(e.target.value) })} />
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="med" checked={logForm.medication}
                      onChange={e => setLogForm({ ...logForm, medication: e.target.checked })} />
                    <label htmlFor="med" className="text-sm text-slate-600 dark:text-slate-300">Medication taken today</label>
                  </div>
                  <textarea className="input text-sm resize-none" rows={2} placeholder="Additional notes..."
                    value={logForm.notes} onChange={e => setLogForm({ ...logForm, notes: e.target.value })} />
                  <button type="submit" className="btn btn-primary w-full btn-sm">Save Today's Log</button>
                </form>
              )}
            </div>

            {/* Sleep Chart */}
            <div className="card p-5 lg:col-span-2">
              <h3 className="font-bold text-slate-900 dark:text-white mb-4">😴 Sleep Tracking (7 days)</h3>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={sleepData}>
                  <defs>
                    <linearGradient id="sleepGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                  <YAxis domain={[0, 12]} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="hours" stroke="#22c55e" fill="url(#sleepGrad)" strokeWidth={2} dot={{ fill: "#22c55e", r: 4 }} />
                </AreaChart>
              </ResponsiveContainer>
              <div className="flex items-center justify-between mt-2 text-xs text-slate-400">
                <span>Avg: 7.3h</span>
                <span className="text-amber-500">⚠️ Below 6h on Thursday</span>
                <span>Recommended: 8-10h</span>
              </div>
            </div>
          </div>

          {/* Approved Nutrition Plan */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 dark:text-white">🍏 Approved Nutrition Plan</h3>
              <span className="badge badge-green">✓ Approved by {nutritionPlan.approvedBy}</span>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Daily Supplements</h4>
                <div className="space-y-2">
                  {nutritionPlan.supplements.map((s, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-green-50 dark:bg-green-950/30 border border-green-100 dark:border-green-900">
                      <span className="text-lg">💊</span>
                      <div>
                        <p className="text-sm font-medium text-slate-800 dark:text-white">{s.name}</p>
                        <p className="text-xs text-slate-500">{s.dosage} · {s.frequency}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Food Restrictions</h4>
                <div className="space-y-2">
                  {nutritionPlan.restrictions.map((r, i) => (
                    <div key={i} className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900">
                      <span>🚫</span>
                      <p className="text-sm text-red-700 dark:text-red-300">{r}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-4 text-center">
              Approved {nutritionPlan.date} · ⚕️ Do not modify without physician consultation
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
