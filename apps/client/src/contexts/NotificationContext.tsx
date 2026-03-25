/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { NotificationService, type NotificationDto } from "@mediflow/mediflow-api";
import { useAuth } from "@/contexts/AuthContext";
import { toAppNotification, type AppNotification } from "@/lib/notifications";

interface NotificationContextValue {
    notifications: AppNotification[];
    unreadCount: number;
    isLoading: boolean;
    markAsRead: (notificationId: string) => void;
    markAllAsRead: () => void;
    refresh: () => Promise<unknown>;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const queryKey = ["notifications", user?.id, user?.role];

    const query = useQuery({
        queryKey,
        enabled: !!user,
        staleTime: 30_000,
        refetchInterval: 60_000,
        queryFn: async () => {
            const response = await NotificationService.getMyNotificationsList({
                orderBys: ["CreatedAt desc"]
            });

            return response.result || [];
        }
    });

    const rawNotifications = (query.data || []) as NotificationDto[];
    const notifications = rawNotifications.map((notification) => toAppNotification(notification));

    const updateCachedNotifications = (updater: (current: NotificationDto[]) => NotificationDto[]) => {
        queryClient.setQueryData(queryKey, (current?: NotificationDto[]) => updater(current || []));
    };

    const value: NotificationContextValue = {
        notifications,
        unreadCount: notifications.filter((notification) => !notification.read).length,
        isLoading: query.isLoading,
        markAsRead: (notificationId: string) => {
            updateCachedNotifications((current) =>
                current.map((notification) =>
                    notification.id === notificationId
                        ? {
                              ...notification,
                              isRead: true,
                              readAt: notification.readAt || new Date().toISOString()
                          }
                        : notification
                )
            );

            void NotificationService.markNotificationAsRead({ notificationId }).catch(() => {
                void query.refetch();
            });
        },
        markAllAsRead: () => {
            updateCachedNotifications((current) =>
                current.map((notification) => ({
                    ...notification,
                    isRead: true,
                    readAt: notification.readAt || new Date().toISOString()
                }))
            );

            void NotificationService.markAllNotificationsAsRead().catch(() => {
                void query.refetch();
            });
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
