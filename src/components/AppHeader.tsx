"use client";

import React, { useState, useEffect } from "react";
import {
    Bell,
    Search,
    AlertCircle,
    Info,
    CheckCircle,
    AlertTriangle,
    BrainCircuit
} from "lucide-react";
import { useNotificationStore } from "@/store/useNotificationStore";
import { TRANSLATIONS } from "../data"; // Import the dictionary map[cite: 3]
import { Language } from "../types"; // Import Language type[cite: 3]

interface AppHeaderProps {
    title: string;
    userName: string;
    role: string;
    language?: Language; // Add optional language prop[cite: 3]
}

export default function AppHeader({ title, userName, role, language = 'en' }: AppHeaderProps) {
    const [notifOpen, setNotifOpen] = useState(false);
    const t = TRANSLATIONS[language]; // Bind translation tracking context[cite: 3]

    const {
        notifications,
        unreadCount,
        fetchNotifications,
        markAsRead,
        markAllAsRead
    } = useNotificationStore();

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(() => fetchNotifications(), 15000);
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    const getIcon = (type: string) => {
        switch (type) {
            case 'alert': return <AlertCircle className="w-4 h-4 text-red-500" />;
            case 'warning': return <AlertTriangle className="w-4 h-4 text-amber-500" />;
            case 'success': return <CheckCircle className="w-4 h-4 text-emerald-500" />;
            case 'ai_insight': return <BrainCircuit className="w-4 h-4 text-purple-500" />;
            default: return <Info className="w-4 h-4 text-blue-500" />;
        }
    };

    return (
        <header className="flex items-center justify-between px-6 py-4 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-20 md:static">
            <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h1>
                <p className="text-xs text-slate-400 mt-0.5">
                    {new Date().toLocaleDateString(language == 'ar' ? 'ar-EG' : 'en-US', {
                        weekday: "long", year: "numeric", month: "long", day: "numeric"
                    })}
                </p>
            </div>

            <div className="flex items-center gap-3">
                <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-400 text-sm">
                    <Search className="w-4 h-4" />
                    <input className="bg-transparent outline-none text-slate-600 dark:text-slate-300 placeholder-slate-400 w-36" placeholder="Search..." />
                </div>

                <div className="relative">
                    <button onClick={() => setNotifOpen(o => !o)} className="relative p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition">
                        <Bell className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                        {unreadCount > 0 && (
                            <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] flex items-center justify-center font-bold animate-pulse">
                                {unreadCount}
                            </span>
                        )}
                    </button>

                    {notifOpen && (
                        <div className="absolute right-0 top-11 w-80 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-xl z-50 overflow-hidden">
                            <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-700">
                                {/* Localized Title */}
                                <p className="font-semibold text-slate-900 dark:text-white text-sm">{t.notifFeedTitle}</p>
                                {unreadCount > 0 && (
                                    /* Localized Clear Button */
                                    <button onClick={() => markAllAsRead()} className="text-xs font-bold text-brand-600 hover:underline">
                                        {t.notifMarkAllRead}
                                    </button>
                                )}
                            </div>
                            <div className="max-h-72 overflow-y-auto divide-y divide-slate-50 dark:divide-slate-700/50">
                                {notifications.length === 0 ? (
                                    /* Localized Empty State */
                                    <div className="p-6 text-center text-xs text-slate-400">{t.notifEmpty}</div>
                                ) : (
                                    notifications.map(n => (
                                        <div key={n.id} onClick={() => !n.read && markAsRead(n.id)} className={`p-4 flex gap-3 transition cursor-pointer text-left ${!n.read ? "bg-blue-50/40 dark:bg-blue-950/20" : "hover:bg-slate-50 dark:hover:bg-slate-700/40"}`}>
                                            <div className="mt-0.5 flex-shrink-0">{getIcon(n.type)}</div>
                                            <div className="space-y-0.5 min-w-0">
                                                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{n.title}</p>
                                                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal break-words">{n.message}</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-2 pl-3 border-l border-slate-200 dark:border-slate-700">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-xs font-bold">
                        {userName && userName.trim().length > 0 ? userName.charAt(0).toUpperCase() : "U"}
                    </div>
                    <div className="hidden md:block text-left">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white leading-none">{userName}</p>
                        <p className="text-xs text-slate-400 capitalize mt-1">{role}</p>
                    </div>
                </div>
            </div>
        </header>
    );
}