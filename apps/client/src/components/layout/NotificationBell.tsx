import { useState } from "react";
import { Bell } from "lucide-react";
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
import { formatDistanceToNow } from "date-fns";

export function NotificationBell() {
    const [notifications, setNotifications] = useState<
        {
            id: string;
            title: string;
            message: string;
            createdAt: string;
            read: boolean;
            type: "appointment" | "prescription" | "lab" | "system" | "message";
        }[]
    >([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const markAsRead = (notifId: string) => {
        setNotifications((prev) => prev.map((n) => (n.id === notifId ? { ...n, read: true } : n)));
        setUnreadCount((prev) => Math.max(0, prev - 1));
    };

    const markAllAsRead = () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        setUnreadCount(0);
    };

    const getNotificationIcon = (
        type: "appointment" | "prescription" | "lab" | "system" | "message"
    ) => {
        const icons: Record<"appointment" | "prescription" | "lab" | "system" | "message", string> = {
            appointment: "📅",
            prescription: "💊",
            lab: "🧪",
            system: "⚙️",
            message: "💬"
        };
        return icons[type];
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground flex items-center justify-center">
                            {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                    )}
                    <span className="sr-only">Notifications</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 bg-popover z-50">
                <DropdownMenuLabel className="flex items-center justify-between">
                    <span>Notifications</span>
                    {unreadCount > 0 && (
                        <Button variant="ghost" size="sm" className="h-auto py-1 px-2 text-xs" onClick={markAllAsRead}>
                            Mark all as read
                        </Button>
                    )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <ScrollArea className="h-[300px]">
                    {notifications.length === 0 ? (
                        <div className="py-6 text-center text-sm text-muted-foreground">No notifications</div>
                    ) : (
                        notifications.map((notification) => (
                            <DropdownMenuItem
                                key={notification.id}
                                className={cn(
                                    "flex flex-col items-start gap-1 p-3 cursor-pointer",
                                    !notification.read && "bg-accent/50"
                                )}
                                onClick={() => markAsRead(notification.id)}
                            >
                                <div className="flex items-start gap-2 w-full">
                                    <span className="text-base mt-0.5">{getNotificationIcon(notification.type)}</span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">{notification.title}</p>
                                        <p className="text-xs text-muted-foreground line-clamp-2">
                                            {notification.message}
                                        </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {formatDistanceToNow(new Date(notification.createdAt), {
                                            addSuffix: true
                                        })}
                                    </p>
                                    </div>
                                    {!notification.read && (
                                        <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                                    )}
                                </div>
                            </DropdownMenuItem>
                        ))
                    )}
                </ScrollArea>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
