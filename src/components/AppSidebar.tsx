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

export default function AppSidebar({ role, userName }: { role: Role; userName: string }) {
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(true); // Default collapsed to protect tight viewports
    const [dark, setDark] = useState(false);

    useEffect(() => {
        document.documentElement.classList.toggle("dark", dark);
    }, [dark]);

    // Handle responsive window resize safely
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) {
                setCollapsed(false);
            } else {
                setCollapsed(true);
            }
        };
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const items = navItems[role] || navItems.parent;

    return (
        <aside
            className={`fixed top-0 left-0 h-screen z-50 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 transition-all duration-300 ease-in-out flex flex-col ${collapsed ? "w-16" : "w-64"
                }`}
        >
            {/* Dynamic Header */}
            <div className={`flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 ${collapsed ? "flex-col gap-2 justify-center" : ""}`}>
                {!collapsed && (
                    <div className="flex flex-col animate-fade-in">
                        <span className="text-sm font-black tracking-tight text-slate-800 dark:text-white">AutiCare AI</span>
                        <span className="text-[10px] font-semibold text-brand-500 uppercase">{role} Portal</span>
                    </div>
                )}

                {/* State Toggle Arrow Trigger */}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors mx-auto"
                    aria-label="Toggle Sidebar"
                >
                    {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                </button>
            </div>

            {/* Reactive App Link Stream */}
            <nav className="flex-1 p-2 space-y-1 overflow-y-auto scrollbar-none">
                {items.map((item) => {
                    const isActive = pathname === item.href;
                    const IconComponent = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group relative ${isActive
                                    ? "bg-brand-600 text-white shadow-md shadow-brand-600/10"
                                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                                } ${collapsed ? "justify-center" : ""}`}
                        >
                            <IconComponent className={`w-5 h-5 flex-shrink-0 ${isActive ? "text-white" : "text-slate-400 group-hover:text-brand-600"}`} />

                            {!collapsed && <span className="truncate animate-fade-in">{item.label}</span>}

                            {/* Floating tooltip fallback if sidebar layout is closed */}
                            {collapsed && (
                                <span className="absolute right-[-100px] opacity-0 group-hover:opacity-100 pointer-events-none transition-all rounded-md bg-slate-800 px-2 py-1 text-xs text-white z-50 shadow-xl whitespace-nowrap">
                                    {item.label}
                                </span>
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Sidebar Footer Configurations */}
            <div className={`p-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col gap-1 ${collapsed ? "items-center" : ""}`}>
                {!collapsed && (
                    <div className="px-2 py-1 truncate animate-fade-in">
                        <p className="text-xs font-bold text-slate-800 dark:text-white truncate">{userName}</p>
                    </div>
                )}

                <button
                    onClick={() => setDark(!dark)}
                    className={`flex items-center gap-3 w-full px-3 py-2 rounded-xl text-xs font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${collapsed ? "justify-center" : ""}`}
                >
                    {dark ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-indigo-500" />}
                    {!collapsed && <span>{dark ? "Light Layout" : "Dark Layout"}</span>}
                </button>
            </div>
        </aside>
    );
}