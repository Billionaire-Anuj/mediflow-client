import { NavLink } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Calendar,
    Clock,
    Users,
    Stethoscope,
    FileText,
    FlaskConical,
    Pill,
    Settings,
    UserCog,
    BarChart3,
    History,
    Bell,
    User,
    X,
    HeartPulse
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SidebarProps {
    open?: boolean;
    onClose?: () => void;
}

interface NavItem {
    label: string;
    href: string;
    icon: React.ElementType;
}

const navigationByRole: Record<string, NavItem[]> = {
    patient: [
        { label: "Dashboard", href: "/patient/dashboard", icon: LayoutDashboard },
        { label: "Find Doctors", href: "/patient/doctors", icon: Stethoscope },
        { label: "Appointments", href: "/patient/appointments", icon: Calendar },
        { label: "Medical Records", href: "/patient/records", icon: FileText },
        { label: "Notifications", href: "/patient/notifications", icon: Bell },
        { label: "Profile", href: "/patient/profile", icon: User }
    ],
    doctor: [
        { label: "Dashboard", href: "/doctor/dashboard", icon: LayoutDashboard },
        { label: "Appointments", href: "/doctor/appointments", icon: Calendar },
        { label: "Patients", href: "/doctor/patients", icon: Users },
        { label: "Schedule", href: "/doctor/schedule", icon: Clock },
        { label: "Profile", href: "/doctor/profile", icon: User }
    ],
    lab: [
        { label: "Dashboard", href: "/lab/dashboard", icon: LayoutDashboard },
        { label: "Lab Requests", href: "/lab/requests", icon: FlaskConical },
        { label: "Profile", href: "/lab/profile", icon: User }
    ],
    pharmacist: [
        { label: "Dashboard", href: "/pharmacist/dashboard", icon: LayoutDashboard },
        { label: "Prescriptions", href: "/pharmacist/prescriptions", icon: Pill },
        { label: "Profile", href: "/pharmacist/profile", icon: User }
    ],
    admin: [
        { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
        { label: "Users", href: "/admin/users", icon: UserCog },
        { label: "Doctors", href: "/admin/doctors", icon: Stethoscope },
        { label: "Configuration", href: "/admin/config", icon: Settings },
        { label: "Reports", href: "/admin/reports", icon: BarChart3 },
        { label: "Login Logs", href: "/admin/audit-logs", icon: History }
    ]
};

export function Sidebar({ open, onClose }: SidebarProps) {
    const { user } = useAuth();

    if (!user) return null;

    const navItems = navigationByRole[user.role] || [];

    return (
        <>
            {/* Mobile overlay */}
            {open && (
                <div className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40 lg:hidden" onClick={onClose} />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    "fixed top-0 left-0 z-50 w-64 bg-sidebar border-r border-sidebar-border transform transition-transform duration-200 ease-in-out lg:static lg:transform-none",
                    open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
                )}
            >
                <div className="flex items-center justify-between h-16 px-4 border-b border-sidebar-border">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                            <HeartPulse className="h-5 w-5 text-primary-foreground" />
                        </div>
                        <span className="font-display font-semibold text-lg">Mediflow</span>
                    </div>

                    <Button variant="ghost" size="icon" onClick={onClose} className="lg:hidden">
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                <ScrollArea className="h-[calc(100%-4rem)] lg:h-full py-4">
                    <nav className="px-3 space-y-1">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.href}
                                to={item.href}
                                onClick={onClose}
                                className={({ isActive }) =>
                                    cn(
                                        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                                        isActive
                                            ? "bg-sidebar-accent text-sidebar-accent-foreground"
                                            : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                                    )
                                }
                            >
                                <item.icon className="h-5 w-5 flex-shrink-0" />
                                {item.label}
                            </NavLink>
                        ))}
                    </nav>
                </ScrollArea>
            </aside>
        </>
    );
}
