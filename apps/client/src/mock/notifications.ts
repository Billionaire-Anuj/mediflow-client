export type NotificationType = "appointment" | "prescription" | "lab" | "system" | "message";

export interface Notification {
    id: string;
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    read: boolean;
    actionUrl?: string;
    createdAt: string;
}

export const mockNotifications: Notification[] = [
    {
        id: "notif-1",
        userId: "patient-1",
        type: "appointment",
        title: "Appointment Reminder",
        message: "Your appointment with Dr. Sarah Wilson is tomorrow at 9:00 AM",
        read: false,
        actionUrl: "/patient/appointments",
        createdAt: "2024-12-30T10:00:00Z"
    },
    {
        id: "notif-2",
        userId: "patient-1",
        type: "lab",
        title: "Lab Results Ready",
        message: "Your recent lab results are now available for review",
        read: false,
        actionUrl: "/patient/records",
        createdAt: "2024-12-29T14:30:00Z"
    },
    {
        id: "notif-3",
        userId: "patient-1",
        type: "prescription",
        title: "Prescription Dispensed",
        message: "Your prescription from Dr. Michael Chen has been dispensed",
        read: true,
        actionUrl: "/patient/records",
        createdAt: "2024-12-20T14:45:00Z"
    },
    {
        id: "notif-4",
        userId: "patient-1",
        type: "system",
        title: "Profile Update",
        message: "Please update your emergency contact information",
        read: true,
        actionUrl: "/patient/profile",
        createdAt: "2024-12-15T09:00:00Z"
    },
    {
        id: "notif-5",
        userId: "doctor-1",
        type: "appointment",
        title: "New Appointment",
        message: "John Miller has booked an appointment for December 31st",
        read: false,
        actionUrl: "/doctor/appointments",
        createdAt: "2024-12-28T10:15:00Z"
    },
    {
        id: "notif-6",
        userId: "doctor-1",
        type: "lab",
        title: "Lab Results Available",
        message: "Lab results for Emily Johnson are now available",
        read: false,
        actionUrl: "/doctor/patient/patient-2",
        createdAt: "2024-12-30T08:00:00Z"
    },
    {
        id: "notif-7",
        userId: "lab-1",
        type: "lab",
        title: "Urgent Lab Request",
        message: "New urgent lab request for Emily Johnson - Cardiac Enzymes",
        read: false,
        actionUrl: "/lab/request/lab-3",
        createdAt: "2024-12-30T14:05:00Z"
    },
    {
        id: "notif-8",
        userId: "pharmacist-1",
        type: "prescription",
        title: "New Prescription",
        message: "2 new prescriptions awaiting dispensing",
        read: false,
        actionUrl: "/pharmacy/prescriptions",
        createdAt: "2024-12-30T11:35:00Z"
    },
    {
        id: "notif-9",
        userId: "admin-1",
        type: "system",
        title: "Pending Approvals",
        message: "2 staff registration requests awaiting approval",
        read: false,
        actionUrl: "/admin/users",
        createdAt: "2024-12-29T09:00:00Z"
    }
];
