import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { AppRole } from "@/lib/auth";

interface RoleGuardProps {
    allowedRoles: AppRole[];
    children: React.ReactNode;
}

export function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
    const { user, isAuthenticated, isInitializing } = useAuth();

    if (isInitializing) {
        return null;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (!user || !allowedRoles.includes(user.role)) {
        return <Navigate to={`/${user?.role || ""}/dashboard`} replace />;
    }

    return <>{children}</>;
}
