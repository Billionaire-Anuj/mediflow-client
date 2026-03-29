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
    HeartPulse,
    Tablets,
    Sparkles
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

interface NavGroup {
    label: string;
    icon?: React.ElementType;
    children: NavItem[];
}

type NavEntry = NavItem | NavGroup;

const navigationByRole: Record<string, NavEntry[]> = {
    patient: [
        {
            label: "Overview",
            icon: LayoutDashboard,
            children: [{ label: "Dashboard", href: "/patient/dashboard", icon: LayoutDashboard }]
        },
        {
            label: "Care",
            icon: Stethoscope,
            children: [
                { label: "Find Doctors", href: "/patient/doctors", icon: Stethoscope },
                { label: "Symptom Discovery", href: "/patient/symptom-discovery", icon: Sparkles },
                { label: "Appointments", href: "/patient/appointments", icon: Calendar },
                { label: "Medical Records", href: "/patient/records", icon: FileText }
            ]
        },
        {
            label: "Account",
            icon: User,
            children: [
                { label: "Notifications", href: "/patient/notifications", icon: Bell },
                { label: "Profile", href: "/patient/profile", icon: User }
            ]
        }
    ],
    doctor: [
        {
            label: "Overview",
            icon: LayoutDashboard,
            children: [{ label: "Dashboard", href: "/doctor/dashboard", icon: LayoutDashboard }]
        },
        {
            label: "Practice",
            icon: Stethoscope,
            children: [
                { label: "Appointments", href: "/doctor/appointments", icon: Calendar },
                { label: "Create Appointment", href: "/doctor/appointments/create", icon: HeartPulse },
                { label: "Patients", href: "/doctor/patients", icon: Users },
                { label: "Schedule", href: "/doctor/schedule", icon: Clock }
            ]
        },
        {
            label: "Account",
            icon: User,
            children: [
                { label: "Notifications", href: "/doctor/notifications", icon: Bell },
                { label: "Profile", href: "/doctor/profile", icon: User }
            ]
        }
    ],
    lab: [
        {
            label: "Overview",
            icon: LayoutDashboard,
            children: [{ label: "Dashboard", href: "/lab/dashboard", icon: LayoutDashboard }]
        },
        {
            label: "Operations",
            icon: FlaskConical,
            children: [{ label: "Lab Requests", href: "/lab/requests", icon: FlaskConical }]
        },
        {
            label: "Account",
            icon: User,
            children: [
                { label: "Notifications", href: "/lab/notifications", icon: Bell },
                { label: "Profile", href: "/lab/profile", icon: User }
            ]
        }
    ],
    pharmacist: [
        {
            label: "Overview",
            icon: LayoutDashboard,
            children: [{ label: "Dashboard", href: "/pharmacist/dashboard", icon: LayoutDashboard }]
        },
        {
            label: "Operations",
            icon: Pill,
            children: [{ label: "Prescriptions", href: "/pharmacist/prescriptions", icon: Pill }]
        },
        {
            label: "Account",
            icon: User,
            children: [
                { label: "Notifications", href: "/pharmacist/notifications", icon: Bell },
                { label: "Profile", href: "/pharmacist/profile", icon: User }
            ]
        }
    ],
    admin: [
        {
            label: "Overview",
            icon: LayoutDashboard,
            children: [{ label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard }]
        },
        {
            label: "Management",
            icon: UserCog,
            children: [
                { label: "Users", href: "/admin/users", icon: UserCog },
                { label: "Doctors", href: "/admin/doctors", icon: Stethoscope }
            ]
        },
        {
            label: "Master Data",
            icon: Settings,
            children: [
                { label: "Specializations", href: "/admin/master-data/specializations", icon: Stethoscope },
                { label: "Diagnostic Types", href: "/admin/master-data/diagnostic-types", icon: FlaskConical },
                { label: "Diagnostic Tests", href: "/admin/master-data/diagnostic-tests", icon: FileText },
                { label: "Medication Types", href: "/admin/master-data/medication-types", icon: Pill },
                { label: "Medicines", href: "/admin/master-data/medicines", icon: Tablets }
            ]
        },
        {
            label: "Analytics",
            icon: BarChart3,
            children: [
                { label: "Reports", href: "/admin/reports", icon: BarChart3 },
                { label: "Login Logs", href: "/admin/audit-logs", icon: History }
            ]
        },
        {
            label: "Account",
            icon: User,
            children: [
                { label: "Notifications", href: "/admin/notifications", icon: Bell },
                { label: "Profile", href: "/admin/profile", icon: User }
            ]
        }
    ]
};

export function Sidebar({ open, onClose }: SidebarProps) {
    const { user } = useAuth();

    if (!user) return null;

    const navItems = navigationByRole[user.role] || [];

    const renderNavItem = (item: NavItem, isChild = false) => (
        <NavLink
            key={item.href}
            to={item.href}
            onClick={onClose}
            className={({ isActive }) =>
                cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    isChild && "pl-3 text-[13px]",
                    isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                )
            }
        >
            <item.icon className="h-4 w-4 flex-shrink-0" />
            {item.label}
        </NavLink>
    );

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
                        {navItems.map((entry) => {
                            if ("children" in entry) {
                                return (
                                    <div key={entry.label} className="space-y-1">
                                        <div className="px-3 pt-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-2">
                                            {entry.label}
                                        </div>
                                        {entry.children.map((child) => renderNavItem(child, true))}
                                    </div>
                                );
                            }
                            return renderNavItem(entry);
                        })}
                    </nav>
                </ScrollArea>
            </aside>
        </>
    );
}
