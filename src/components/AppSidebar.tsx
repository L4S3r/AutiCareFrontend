"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Brain, LayoutDashboard, Users, Dna, Utensils, Activity,
  Gamepad2, Bell, Settings, LogOut, ChevronLeft, ChevronRight,
  FileText, BarChart3, UserCog, Shield, Moon, Sun, Menu, X
} from "lucide-react";

type Role = "doctor" | "therapist" | "parent" | "admin";

const navItems: Record<Role, Array<{ href: string; icon: React.ElementType; label: string }>> = {
  doctor: [
    { href: "/app/dashboard/doctor", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/app/dashboard/doctor/patients", icon: Users, label: "Patients" },
    { href: "/app/dashboard/doctor/genetic", icon: Dna, label: "Genetic Reports" },
    { href: "/app/dashboard/doctor/nutrition", icon: Utensils, label: "Nutrition Plans" },
    { href: "/app/dashboard/doctor/analytics", icon: BarChart3, label: "Analytics" },
    { href: "/app/dashboard/doctor/notes", icon: FileText, label: "Clinical Notes" },
  ],
  therapist: [
    { href: "/app/dashboard/therapist", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/app/dashboard/therapist/patients", icon: Users, label: "My Patients" },
    { href: "/app/dashboard/therapist/sessions", icon: FileText, label: "Session Reports" },
    { href: "/app/dashboard/therapist/progress", icon: Activity, label: "Progress Charts" },
  ],
  parent: [
    { href: "/app/dashboard/parent", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/app/dashboard/parent/logs", icon: Activity, label: "Daily Logs" },
    { href: "/app/dashboard/parent/nutrition", icon: Utensils, label: "Nutrition Plan" },
    { href: "/app/dashboard/parent/games", icon: Gamepad2, label: "Child Games" },
  ],
  admin: [
    { href: "/app/dashboard/admin", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/app/dashboard/admin/users", icon: UserCog, label: "User Management" },
    { href: "/app/dashboard/admin/analytics", icon: BarChart3, label: "Analytics" },
    { href: "/app/dashboard/admin/audit", icon: Shield, label: "Audit Logs" },
  ],
};

const roleColors: Record<Role, string> = {
  doctor: "from-blue-500 to-blue-700",
  therapist: "from-purple-500 to-purple-700",
  parent: "from-green-500 to-green-700",
  admin: "from-slate-500 to-slate-700",
};

const roleLabels: Record<Role, string> = {
  doctor: "👨‍⚕️ Doctor",
  therapist: "🧑‍⚕️ Therapist",
  parent: "👨‍👩‍👧 Parent",
  admin: "⚙️ Admin",
};

export default function AppSidebar({ role, userName }: { role: Role; userName: string }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [dark, setDark] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  const items = navItems[role] || navItems.doctor;

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={`flex items-center gap-3 p-5 border-b border-slate-100 dark:border-slate-700 ${collapsed ? "justify-center" : ""}`}>
        <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${roleColors[role]} flex items-center justify-center flex-shrink-0`}>
          <Brain className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div>
            <p className="font-extrabold text-slate-900 dark:text-white text-sm">AutiCare AI</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{roleLabels[role]}</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {items.map(item => {
          const active = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                active
                  ? `bg-gradient-to-r ${roleColors[role]} text-white shadow-md`
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-700"
              } ${collapsed ? "justify-center" : ""}`}>
              <item.icon className={`w-5 h-5 flex-shrink-0 ${active ? "text-white" : ""}`} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className={`p-3 border-t border-slate-100 dark:border-slate-700 space-y-1`}>
        <button onClick={() => setDark(d => !d)}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700 transition w-full ${collapsed ? "justify-center" : ""}`}>
          {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          {!collapsed && <span>{dark ? "Light Mode" : "Dark Mode"}</span>}
        </button>
        <Link href="/app/dashboard/settings"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700 transition ${collapsed ? "justify-center" : ""}`}>
          <Settings className="w-5 h-5" />
          {!collapsed && <span>Settings</span>}
        </Link>
        <button onClick={() => { localStorage.removeItem("auticare_user"); window.location.href = "/app/login"; }}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition w-full ${collapsed ? "justify-center" : ""}`}>
          <LogOut className="w-5 h-5" />
          {!collapsed && <span>Sign Out</span>}
        </button>

        {!collapsed && (
          <div className="pt-2 px-2">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${roleColors[role]} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                {userName.charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">{userName}</p>
                <p className="text-xs text-slate-400 capitalize">{role}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Collapse toggle */}
      <button onClick={() => setCollapsed(c => !c)}
        className="absolute top-1/2 -right-3 w-6 h-6 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-sm hover:shadow-md transition-all hidden md:flex">
        {collapsed ? <ChevronRight className="w-3 h-3 text-slate-400" /> : <ChevronLeft className="w-3 h-3 text-slate-400" />}
      </button>
    </div>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${roleColors[role]} flex items-center justify-center`}>
            <Brain className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-slate-900 dark:text-white">AutiCare AI</span>
        </div>
        <button onClick={() => setMobileOpen(o => !o)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Desktop sidebar */}
      <aside className={`hidden md:flex relative flex-col flex-shrink-0 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 transition-all duration-300 ${collapsed ? "w-16" : "w-64"}`}>
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-30">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div className="absolute top-0 left-0 bottom-0 w-64 bg-white dark:bg-slate-800 shadow-2xl">
            <div className="pt-14">
              <SidebarContent />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
