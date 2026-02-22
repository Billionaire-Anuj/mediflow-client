import type { ProfileDto, RoleDto } from "@mediflow/mediflow-api";

export type AppRole = "admin" | "doctor" | "lab" | "pharmacist" | "patient";

export interface AuthUser {
    id: string;
    name: string;
    email: string;
    role: AppRole;
    roleName: string;
    phone?: string;
    address?: string;
    avatarUrl?: string;
}

const roleNameMap: Record<string, AppRole> = {
    "super admin": "admin",
    admin: "admin",
    doctor: "doctor",
    "lab technician": "lab",
    pharmacist: "pharmacist",
    patient: "patient"
};

export const getRoleSlug = (roleName?: string | null): AppRole => {
    if (!roleName) return "patient";
    const normalized = roleName.trim().toLowerCase();
    return roleNameMap[normalized] || "patient";
};

export const getRoleLabel = (role: AppRole, roleName?: string | null) => {
    if (roleName) return roleName;
    const labels: Record<AppRole, string> = {
        admin: "Administrator",
        doctor: "Doctor",
        lab: "Lab Technician",
        pharmacist: "Pharmacist",
        patient: "Patient"
    };
    return labels[role];
};

export const mapProfileToUser = (profile?: ProfileDto | null): AuthUser | null => {
    if (!profile) return null;
    const roleName = profile.role?.name || "";
    return {
        id: profile.id || "",
        name: profile.name || profile.username || "User",
        email: profile.emailAddress || "",
        role: getRoleSlug(roleName),
        roleName,
        phone: profile.phoneNumber || undefined,
        address: profile.address || undefined,
        avatarUrl: profile.profileImage?.fileUrl || undefined
    };
};

export const getRoleIdFromRole = (role?: RoleDto | null) => role?.id || "";
