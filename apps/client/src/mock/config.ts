export interface ClinicConfig {
    clinicName: string;
    address: string;
    phone: string;
    email: string;
    clinicHours: {
        day: string;
        open: string;
        close: string;
        closed: boolean;
    }[];
    defaultSlotDuration: number;
    cancellationWindowHours: number;
}

export const mockClinicConfig: ClinicConfig = {
    clinicName: "Mediflow Health Center",
    address: "123 Healthcare Ave, Medical District, MD 12345",
    phone: "+1 (555) 000-1234",
    email: "contact@mediflow.com",
    clinicHours: [
        { day: "Monday", open: "08:00", close: "18:00", closed: false },
        { day: "Tuesday", open: "08:00", close: "18:00", closed: false },
        { day: "Wednesday", open: "08:00", close: "18:00", closed: false },
        { day: "Thursday", open: "08:00", close: "18:00", closed: false },
        { day: "Friday", open: "08:00", close: "17:00", closed: false },
        { day: "Saturday", open: "09:00", close: "13:00", closed: false },
        { day: "Sunday", open: "", close: "", closed: true }
    ],
    defaultSlotDuration: 30,
    cancellationWindowHours: 24
};

export const mockDashboardStats = {
    admin: {
        appointmentsToday: 24,
        cancellationRate: 8.5,
        prescriptionsThisWeek: 156,
        labRequestsCompleted: 89,
        pendingApprovals: 2,
        activeUsers: 342
    },
    doctor: {
        appointmentsToday: 8,
        pendingLabResults: 3,
        prescriptionsCreated: 12,
        patientsSeenThisWeek: 32
    },
    lab: {
        pendingRequests: 5,
        inProgress: 2,
        completedToday: 8,
        urgentPending: 1
    },
    pharmacy: {
        pendingPrescriptions: 4,
        partiallyDispensed: 2,
        dispensedToday: 15,
        lowStockAlerts: 3
    }
};
