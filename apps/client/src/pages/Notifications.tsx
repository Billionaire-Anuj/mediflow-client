import { useState } from "react";
import { Link } from "react-router-dom";
import { format, formatDistanceToNow } from "date-fns";
import { CheckCheck, RefreshCw } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/contexts/NotificationContext";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { getNotificationEmptyState, notificationTriggersByRole, notificationTypeMeta } from "@/lib/notifications";

export default function NotificationsPage() {
    const { user } = useAuth();
    const { notifications, unreadCount, isLoading, markAsRead, markAllAsRead, refresh } = useNotifications();
    const [filter, setFilter] = useState("all");

    if (!user) {
        return null;
    }

    const filteredNotifications =
        filter === "unread" ? notifications.filter((notification) => !notification.read) : notifications;
    const emptyState = getNotificationEmptyState(user.role);

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader
                title="Notifications"
                description="Live operational alerts and reminders based on your current Mediflow data."
            >
                <Button variant="outline" onClick={() => void refresh()}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Refresh
                </Button>
                <Button
                    variant="outline"
                    onClick={markAllAsRead}
                    disabled={notifications.length === 0 || unreadCount === 0}
                >
                    <CheckCheck className="mr-2 h-4 w-4" />
                    Mark All Read
                </Button>
            </PageHeader>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Possible Triggers For Your Role</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {notificationTriggersByRole[user.role].map((trigger) => (
                        <div key={trigger.title} className="rounded-lg border bg-accent/30 p-4">
                            <p className="text-sm font-medium">{trigger.title}</p>
                            <p className="mt-1 text-sm text-muted-foreground">{trigger.description}</p>
                        </div>
                    ))}
                </CardContent>
            </Card>

            <div className="flex items-center justify-between gap-4">
                <Tabs value={filter} onValueChange={setFilter} className="w-full">
                    <TabsList>
                        <TabsTrigger value="all">All ({notifications.length})</TabsTrigger>
                        <TabsTrigger value="unread">Unread ({unreadCount})</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            {isLoading ? (
                <Card>
                    <CardContent className="py-10 text-sm text-muted-foreground">Loading notifications...</CardContent>
                </Card>
            ) : filteredNotifications.length === 0 ? (
                <EmptyState
                    icon={emptyState.icon}
                    title={emptyState.title}
                    description={filter === "unread" ? "You're all caught up." : emptyState.description}
                />
            ) : (
                <div className="space-y-3">
                    {filteredNotifications.map((notification) => {
                        const meta = notificationTypeMeta[notification.type];
                        const Icon = meta.icon;

                        return (
                            <Card
                                key={notification.id}
                                className={cn(
                                    "transition-colors",
                                    !notification.read && "border-primary/30 bg-primary/[0.03]"
                                )}
                            >
                                <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between">
                                    <div className="flex gap-4">
                                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                                            <Icon className="h-5 w-5" />
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <p className="text-sm font-semibold">{notification.title}</p>
                                                <Badge variant="outline" className={meta.accentClass}>
                                                    {meta.label}
                                                </Badge>
                                                {!notification.read && <Badge variant="secondary">Unread</Badge>}
                                            </div>
                                            <p className="text-sm text-muted-foreground">{notification.message}</p>
                                            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                                                <span>
                                                    {formatDistanceToNow(new Date(notification.createdAt), {
                                                        addSuffix: true
                                                    })}
                                                </span>
                                                <span>
                                                    {format(new Date(notification.createdAt), "MMM d, yyyy h:mm a")}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 sm:flex-col sm:items-end">
                                        <Button asChild>
                                            <Link
                                                to={notification.actionUrl}
                                                onClick={() => markAsRead(notification.id)}
                                            >
                                                Open
                                            </Link>
                                        </Button>
                                        {!notification.read && (
                                            <Button variant="ghost" onClick={() => markAsRead(notification.id)}>
                                                Mark Read
                                            </Button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
