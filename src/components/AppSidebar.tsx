"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
    LayoutDashboard, Users, Dna, Utensils, Activity, Gamepad2,
    FileText, BarChart3, UserCog, Shield, Moon, Sun,
    ChevronLeft, ChevronRight
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

    useEffect(() => {
        document.documentElement.classList.toggle("dark", dark);
    }, [dark]);

    // Auto-collapse sidebar by default on tight screens/mobile widths
    useEffect(() => {
        if (typeof window !== "undefined" && window.innerWidth < 768) {
            setCollapsed(true);
        }
    }, []);

    const items = navItems[role] || navItems.doctor;

    return (
        <aside
            className={`fixed top-0 left-0 h-screen z-40 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 transition-all duration-300 ease-in-out flex flex-col ${collapsed ? "w-16" : "w-64"
                }`}
        >
            {/* Sidebar Header Brand Area */}
            <div className={`flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 ${collapsed ? "flex-col gap-2" : ""}`}>
                {!collapsed && (
                    <div className="flex flex-col">
                        <span className="text-sm font-bold tracking-tight text-slate-800 dark:text-white">AutiCare AI</span>
                        <span className="text-xs font-medium text-slate-400">{roleLabels[role]}</span>
                    </div>
                )}

                {/* Toggle Arrow Trigger Button */}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors"
                    aria-label="Toggle Sidebar"
                >
                    {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                </button>
            </div>

            {/* Navigation Layout Links Container */}
            <nav className="flex-1 p-3 space-y-1 overflow-y-auto scrollbar-none">
                {items.map((item) => {
                    const isActive = pathname === item.href;
                    const IconComponent = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group relative ${isActive
                                    ? "bg-brand-500 text-white shadow-md shadow-brand-500/10"
                                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                                } ${collapsed ? "justify-center" : ""}`}
                        >
                            <IconComponent className={`w-5 h-5 flex-shrink-0 ${isActive ? "text-white" : "text-slate-400 group-hover:text-brand-500"}`} />

                            {!collapsed ? (
                                <span className="truncate">{item.label}</span>
                            ) : (
                                /* Native overlay tooltip label text bubble when mini sidebar is active */
                                <span className="absolute left-16 scale-0 group-hover:scale-100 transition-all rounded bg-slate-800 p-2 text-xs text-white z-50 whitespace-nowrap shadow-xl">
                                    {item.label}
                                </span>
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Sidebar Profile Card & Theme Controls Footer Section */}
            <div className={`p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col gap-2 ${collapsed ? "items-center" : ""}`}>
                {!collapsed && (
                    <div className="flex items-col px-2 py-1">
                        <div className="truncate">
                            <p className="text-xs font-semibold text-slate-800 dark:text-white truncate">{userName}</p>
                            <p className="text-[10px] text-slate-400 truncate">Active Session</p>
                        </div>
                    </div>
                )}

                {/* Theme Settings Control Toggle */}
                <button
                    onClick={() => setDark(!dark)}
                    className={`flex items-center gap-3 w-full px-3 py-2 rounded-xl text-xs font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${collapsed ? "justify-center" : ""}`}
                >
                    {dark ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-indigo-500" />}
                    {!collapsed && <span>{dark ? "Light Mode" : "Dark Mode"}</span>}
                </button>
            </div>
        </aside>
    );
}