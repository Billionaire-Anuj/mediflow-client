export type AuditAction =
    | "login"
    | "logout"
    | "create"
    | "update"
    | "delete"
    | "view"
    | "approve"
    | "reject"
    | "dispense";

export type AuditEntity =
    | "user"
    | "appointment"
    | "encounter"
    | "prescription"
    | "lab_request"
    | "patient"
    | "doctor"
    | "config";

export interface AuditLog {
    id: string;
    userId: string;
    userName: string;
    userRole: string;
    action: AuditAction;
    entity: AuditEntity;
    entityId?: string;
    details: string;
    ipAddress: string;
    timestamp: string;
}

export const mockAuditLogs: AuditLog[] = [
    {
        id: "audit-1",
        userId: "admin-1",
        userName: "Admin User",
        userRole: "admin",
        action: "approve",
        entity: "user",
        entityId: "doctor-2",
        details: "Approved registration for Dr. Michael Chen",
        ipAddress: "192.168.1.100",
        timestamp: "2024-12-30T09:15:00Z"
    },
    {
        id: "audit-2",
        userId: "doctor-1",
        userName: "Dr. Sarah Wilson",
        userRole: "doctor",
        action: "create",
        entity: "encounter",
        entityId: "enc-1",
        details: "Created encounter for patient John Miller",
        ipAddress: "192.168.1.105",
        timestamp: "2024-12-20T11:15:00Z"
    },
    {
        id: "audit-3",
        userId: "doctor-2",
        userName: "Dr. Michael Chen",
        userRole: "doctor",
        action: "create",
        entity: "prescription",
        entityId: "rx-1",
        details: "Created prescription for patient John Miller",
        ipAddress: "192.168.1.106",
        timestamp: "2024-12-20T11:20:00Z"
    },
    {
        id: "audit-4",
        userId: "pharmacist-1",
        userName: "David Thompson",
        userRole: "pharmacist",
        action: "dispense",
        entity: "prescription",
        entityId: "rx-1",
        details: "Dispensed prescription rx-1 for John Miller",
        ipAddress: "192.168.1.110",
        timestamp: "2024-12-20T14:30:00Z"
    },
    {
        id: "audit-5",
        userId: "lab-1",
        userName: "Emma Rodriguez",
        userRole: "lab",
        action: "update",
        entity: "lab_request",
        entityId: "lab-1",
        details: "Uploaded results for lab request lab-1",
        ipAddress: "192.168.1.108",
        timestamp: "2024-11-16T09:30:00Z"
    },
    {
        id: "audit-6",
        userId: "patient-1",
        userName: "John Miller",
        userRole: "patient",
        action: "create",
        entity: "appointment",
        entityId: "apt-1",
        details: "Booked appointment with Dr. Sarah Wilson",
        ipAddress: "203.45.67.89",
        timestamp: "2024-12-28T10:00:00Z"
    },
    {
        id: "audit-7",
        userId: "patient-1",
        userName: "John Miller",
        userRole: "patient",
        action: "login",
        entity: "user",
        entityId: "patient-1",
        details: "User logged in successfully",
        ipAddress: "203.45.67.89",
        timestamp: "2024-12-30T08:00:00Z"
    },
    {
        id: "audit-8",
        userId: "admin-1",
        userName: "Admin User",
        userRole: "admin",
        action: "update",
        entity: "config",
        details: "Updated clinic hours configuration",
        ipAddress: "192.168.1.100",
        timestamp: "2024-12-29T15:00:00Z"
    },
    {
        id: "audit-9",
        userId: "doctor-1",
        userName: "Dr. Sarah Wilson",
        userRole: "doctor",
        action: "view",
        entity: "patient",
        entityId: "patient-1",
        details: "Viewed patient record for John Miller",
        ipAddress: "192.168.1.105",
        timestamp: "2024-12-30T09:00:00Z"
    },
    {
        id: "audit-10",
        userId: "admin-1",
        userName: "Admin User",
        userRole: "admin",
        action: "reject",
        entity: "user",
        entityId: "pending-user-99",
        details: "Rejected registration - incomplete documentation",
        ipAddress: "192.168.1.100",
        timestamp: "2024-12-28T11:00:00Z"
    }
];
