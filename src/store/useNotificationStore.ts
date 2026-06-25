// src/store/useNotificationStore.ts

import { create } from 'zustand';
import { Notification } from '../types';
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '../api';

interface NotificationState {
    notifications: Notification[];
    unreadCount: number;
    isLoading: boolean;
    fetchNotifications: () => Promise<void>;
    markAsRead: (id: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
    notifications: [],
    unreadCount: 0,
    isLoading: false,

    fetchNotifications: async () => {
        try {
            const res = await getNotifications();
            if (res.success) {
                const mapped: Notification[] = res.data.map((n: any) => ({
                    id: n._id || n.id,
                    title: n.title,
                    message: n.message,
                    type: n.type,
                    relatedTo: n.relatedTo,
                    relatedId: n.relatedId,
                    read: n.read,
                    createdAt: n.createdAt,
                }));
                set({ notifications: mapped, unreadCount: res.unread });
            }
        } catch (err) {
            console.error('Failed to sync user notifications:', err);
        }
    },

    markAsRead: async (id: string) => {
        // Optimistic UI update
        const safeNotifications = get().notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
        );
        set({
            notifications: safeNotifications,
            unreadCount: Math.max(0, get().unreadCount - 1),
        });

        try {
            await markNotificationAsRead(id);
        } catch (err) {
            console.error('Failed to update notification read state:', err);
            get().fetchNotifications(); // Rollback on error
        }
    },

    markAllAsRead: async () => {
        set({ notifications: get().notifications.map((n) => ({ ...n, read: true })), unreadCount: 0 });
        try {
            await markAllNotificationsAsRead();
        } catch (err) {
            console.error('Failed to clear all notifications:', err);
            get().fetchNotifications();
        }
    },
}));