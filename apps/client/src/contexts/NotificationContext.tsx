/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { fetchNotificationsForUser, type AppNotification } from "@/lib/notifications";

interface NotificationContextValue {
    notifications: Array<AppNotification & { read: boolean }>;
    unreadCount: number;
    isLoading: boolean;
    markAsRead: (notificationId: string) => void;
    markAllAsRead: () => void;
    refresh: () => Promise<unknown>;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

const getStorageKey = (userId?: string, role?: string) =>
    `mediflow.notifications.read.${role || "guest"}.${userId || "anon"}`;

export function NotificationProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const [readIds, setReadIds] = useState<string[]>([]);

    useEffect(() => {
        if (!user) {
            setReadIds([]);
            return;
        }

        const saved = window.localStorage.getItem(getStorageKey(user.id, user.role));
        setReadIds(saved ? JSON.parse(saved) : []);
    }, [user]);

    useEffect(() => {
        if (!user) return;
        window.localStorage.setItem(getStorageKey(user.id, user.role), JSON.stringify(readIds));
    }, [readIds, user]);

    const query = useQuery({
        queryKey: ["notifications", user?.id, user?.role],
        enabled: !!user,
        staleTime: 60_000,
        refetchInterval: 60_000,
        queryFn: async () => fetchNotificationsForUser(user!)
    });

    const notifications = (query.data || []).map((notification) => ({
        ...notification,
        read: readIds.includes(notification.id)
    }));

    const value: NotificationContextValue = {
        notifications,
        unreadCount: notifications.filter((notification) => !notification.read).length,
        isLoading: query.isLoading,
        markAsRead: (notificationId: string) => {
            setReadIds((current) => (current.includes(notificationId) ? current : [...current, notificationId]));
        },
        markAllAsRead: () => {
            setReadIds(notifications.map((notification) => notification.id));
        },
        refresh: async () => query.refetch()
    };

    return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export function useNotifications() {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error("useNotifications must be used within a NotificationProvider");
    }
    return context;
}
