import { useState } from "react";
import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Topbar } from "./Topbar";
import { Sidebar } from "./Sidebar";
import { UserRole } from "@/mock/users";

interface AppShellProps {
    allowedRoles?: UserRole[];
}

export function AppShell({ allowedRoles }: AppShellProps) {
    const { user, isAuthenticated } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        // Redirect to user's own dashboard
        return <Navigate to={`/${user.role}/dashboard`} replace />;
    }

    return (
        <div className="min-h-screen bg-background flex">
            <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <div className="flex-1 flex flex-col min-w-0">
                <Topbar showMenuButton onMenuClick={() => setSidebarOpen(true)} />
                <main className="flex-1 overflow-auto">
                    <div className="page-container">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}
