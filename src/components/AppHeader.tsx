"use client";
import { Bell, Search, ChevronDown } from "lucide-react";
import { useState } from "react";

export default function AppHeader({ title, userName, role }: { title: string; userName: string; role: string }) {
  const [notifOpen, setNotifOpen] = useState(false);

  const mockNotifications = [
    { id: 1, text: "AI plan awaiting your approval for Omar Hassan", time: "2 min ago", type: "alert", read: false },
    { id: 2, text: "High meltdown risk detected for patient #3", time: "15 min ago", type: "warning", read: false },
    { id: 3, text: "Dr. Smith approved nutrition plan", time: "1h ago", type: "success", read: true },
    { id: 4, text: "New session report from therapist", time: "3h ago", type: "info", read: true },
  ];

  const unread = mockNotifications.filter(n => !n.read).length;

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-20 md:static">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>

      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-400 text-sm">
          <Search className="w-4 h-4" />
          <input className="bg-transparent outline-none text-slate-600 dark:text-slate-300 placeholder-slate-400 w-36" placeholder="Search..." />
        </div>

        {/* Notifications */}
        <div className="relative">
          <button onClick={() => setNotifOpen(o => !o)}
            className="relative p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition">
            <Bell className="w-5 h-5 text-slate-500 dark:text-slate-400" />
            {unread > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold">{unread}</span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-11 w-80 card shadow-card-hover border z-50 animate-slide-up">
              <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-700">
                <p className="font-semibold text-slate-900 dark:text-white text-sm">Notifications</p>
                <button className="text-xs text-brand-600">Mark all read</button>
              </div>
              <div className="max-h-72 overflow-y-auto">
                {mockNotifications.map(n => (
                  <div key={n.id} className={`p-4 border-b border-slate-50 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition ${!n.read ? "bg-blue-50/50 dark:bg-blue-950/20" : ""}`}>
                    <p className="text-sm text-slate-700 dark:text-slate-300">{n.text}</p>
                    <p className="text-xs text-slate-400 mt-1">{n.time}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User */}
        <div className="flex items-center gap-2 pl-3 border-l border-slate-200 dark:border-slate-700">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-xs font-bold">
            {userName.charAt(0)}
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-semibold text-slate-900 dark:text-white leading-none">{userName}</p>
            <p className="text-xs text-slate-400 capitalize">{role}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
