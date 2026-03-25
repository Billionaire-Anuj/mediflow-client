import { Link } from "react-router-dom";
import { Bell } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/contexts/NotificationContext";
import { getNotificationsRoute, notificationTypeMeta } from "@/lib/notifications";

export function NotificationBell() {
    const { user } = useAuth();
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

    if (!user) {
        return null;
    }

    const topNotifications = notifications.slice(0, 8);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground">
                            {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                    )}
                    <span className="sr-only">Notifications</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="z-50 w-96 bg-popover">
                <DropdownMenuLabel className="flex items-center justify-between gap-4">
                    <span>Notifications</span>
                    {unreadCount > 0 && (
                        <Button variant="ghost" size="sm" className="h-auto px-2 py-1 text-xs" onClick={markAllAsRead}>
                            Mark all as read
                        </Button>
                    )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <ScrollArea className="h-[320px]">
                    {topNotifications.length === 0 ? (
                        <div className="py-6 text-center text-sm text-muted-foreground">No notifications</div>
                    ) : (
                        topNotifications.map((notification) => {
                            const meta = notificationTypeMeta[notification.type];
                            const Icon = meta.icon;

                            return (
                                <DropdownMenuItem
                                    key={notification.id}
                                    className={cn("flex items-start gap-3 p-3", !notification.read && "bg-accent/50")}
                                    asChild
                                >
                                    <Link to={notification.actionUrl} onClick={() => markAsRead(notification.id)}>
                                        <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                                            <Icon className="h-4 w-4" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2">
                                                <p className="truncate text-sm font-medium">{notification.title}</p>
                                                {!notification.read && (
                                                    <div className="h-2 w-2 rounded-full bg-primary" />
                                                )}
                                            </div>
                                            <p className="line-clamp-2 text-xs text-muted-foreground">
                                                {notification.message}
                                            </p>
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                {formatDistanceToNow(new Date(notification.createdAt), {
                                                    addSuffix: true
                                                })}
                                            </p>
                                        </div>
                                    </Link>
                                </DropdownMenuItem>
                            );
                        })
                    )}
                </ScrollArea>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link to={getNotificationsRoute(user.role)} className="justify-center">
                        View all notifications
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
