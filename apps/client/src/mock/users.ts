export type UserRole = "patient" | "doctor" | "lab" | "pharmacist" | "admin";

export interface User {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    avatar?: string;
    phone?: string;
    department?: string;
    specialty?: string;
    licenseNumber?: string;
    status: "active" | "pending" | "suspended";
    createdAt: string;
}

export const mockUsers: User[] = [
    {
        id: "patient-1",
        email: "john.patient@email.com",
        name: "John Miller",
        role: "patient",
        phone: "+1 (555) 123-4567",
        status: "active",
        createdAt: "2024-01-15T10:00:00Z"
    },
    {
        id: "doctor-1",
        email: "sarah.wilson@mediflow.com",
        name: "Dr. Sarah Wilson",
        role: "doctor",
        department: "Cardiology",
        specialty: "Interventional Cardiology",
        licenseNumber: "MD-12345",
        status: "active",
        createdAt: "2023-06-20T09:00:00Z"
    },
    {
        id: "doctor-2",
        email: "michael.chen@mediflow.com",
        name: "Dr. Michael Chen",
        role: "doctor",
        department: "Neurology",
        specialty: "Neurophysiology",
        licenseNumber: "MD-23456",
        status: "active",
        createdAt: "2023-08-15T09:00:00Z"
    },
    {
        id: "lab-1",
        email: "emma.lab@mediflow.com",
        name: "Emma Rodriguez",
        role: "lab",
        department: "Laboratory",
        licenseNumber: "LT-78901",
        status: "active",
        createdAt: "2023-09-10T09:00:00Z"
    },
    {
        id: "pharmacist-1",
        email: "david.pharma@mediflow.com",
        name: "David Thompson",
        role: "pharmacist",
        department: "Pharmacy",
        licenseNumber: "RPH-45678",
        status: "active",
        createdAt: "2023-07-25T09:00:00Z"
    },
    {
        id: "admin-1",
        email: "admin@mediflow.com",
        name: "Admin User",
        role: "admin",
        status: "active",
        createdAt: "2023-01-01T09:00:00Z"
    },
    {
        id: "pending-doctor-1",
        email: "new.doctor@email.com",
        name: "Dr. James Brown",
        role: "doctor",
        department: "Orthopedics",
        specialty: "Sports Medicine",
        licenseNumber: "MD-99999",
        status: "pending",
        createdAt: "2024-12-28T14:00:00Z"
    },
    {
        id: "pending-lab-1",
        email: "new.lab@email.com",
        name: "Lisa Park",
        role: "lab",
        department: "Laboratory",
        licenseNumber: "LT-88888",
        status: "pending",
        createdAt: "2024-12-29T10:00:00Z"
    }
];

export const demoCredentials: Record<UserRole, { email: string; name: string }> = {
    patient: { email: "john.patient@email.com", name: "John Miller" },
    doctor: { email: "sarah.wilson@mediflow.com", name: "Dr. Sarah Wilson" },
    lab: { email: "emma.lab@mediflow.com", name: "Emma Rodriguez" },
    pharmacist: { email: "david.pharma@mediflow.com", name: "David Thompson" },
    admin: { email: "admin@mediflow.com", name: "Admin User" }
};
