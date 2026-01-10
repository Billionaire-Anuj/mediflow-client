import { useState, useEffect } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ListSkeleton } from "@/components/ui/loading-skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { mockNotifications, Notification } from "@/mock/notifications";
import { Bell, Calendar, Pill, FlaskConical, Settings, MessageSquare, Check } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const iconMap: Record<Notification["type"], React.ElementType> = {
    appointment: Calendar,
    prescription: Pill,
    lab: FlaskConical,
    system: Settings,
    message: MessageSquare
};

export default function PatientNotifications() {
    const [loading, setLoading] = useState(true);
    const [notifications, setNotifications] = useState<Notification[]>([]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setNotifications(mockNotifications.filter((n) => n.userId === "patient-1"));
            setLoading(false);
        }, 400);
        return () => clearTimeout(timer);
    }, []);

    const unreadCount = notifications.filter((n) => !n.read).length;

    const markAsRead = (id: string) => {
        setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    };

    const markAllAsRead = () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        toast.success("All notifications marked as read");
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <PageHeader title="Notifications" />
                <ListSkeleton items={4} />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader
                title="Notifications"
                description={`${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}`}
            >
                {unreadCount > 0 && (
                    <Button variant="outline" size="sm" onClick={markAllAsRead}>
                        <Check className="h-4 w-4 mr-1" />
                        Mark all as read
                    </Button>
                )}
            </PageHeader>

            {notifications.length === 0 ? (
                <EmptyState icon={Bell} title="No notifications" description="You're all caught up!" />
            ) : (
                <div className="space-y-3">
                    {notifications.map((notification) => {
                        const Icon = iconMap[notification.type];
                        return (
                            <Card
                                key={notification.id}
                                className={cn(
                                    "card-interactive cursor-pointer transition-all",
                                    !notification.read && "border-primary/30 bg-accent/30"
                                )}
                                onClick={() => markAsRead(notification.id)}
                            >
                                <CardContent className="p-4">
                                    <div className="flex gap-4">
                                        <div
                                            className={cn(
                                                "h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0",
                                                notification.read ? "bg-muted" : "bg-primary/10"
                                            )}
                                        >
                                            <Icon
                                                className={cn(
                                                    "h-5 w-5",
                                                    notification.read ? "text-muted-foreground" : "text-primary"
                                                )}
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <div>
                                                    <h3
                                                        className={cn(
                                                            "font-medium",
                                                            !notification.read && "text-foreground"
                                                        )}
                                                    >
                                                        {notification.title}
                                                    </h3>
                                                    <p className="text-sm text-muted-foreground mt-0.5">
                                                        {notification.message}
                                                    </p>
                                                </div>
                                                {!notification.read && (
                                                    <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-2" />
                                                )}
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-2">
                                                {formatDistanceToNow(new Date(notification.createdAt), {
                                                    addSuffix: true
                                                })}
                                            </p>
                                        </div>
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
