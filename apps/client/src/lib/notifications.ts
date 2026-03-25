import { NotificationType, type NotificationDto } from "@mediflow/mediflow-api";
import { AlertCircle, Bell, CalendarClock, ClipboardList, FlaskConical, Pill, ShieldAlert, type LucideIcon } from "lucide-react";
import type { AppRole } from "@/lib/auth";

export type AppNotificationType = "appointment" | "lab" | "prescription" | "admin" | "system";

export interface AppNotification {
    id: string;
    type: AppNotificationType;
    title: string;
    message: string;
    createdAt: string;
    actionUrl: string;
    read: boolean;
}

export interface NotificationTriggerDefinition {
    title: string;
    description: string;
}

export const notificationTriggersByRole: Record<AppRole, NotificationTriggerDefinition[]> = {
    patient: [
        { title: "Appointment updates", description: "Bookings, reschedules, cancellations, and payment confirmations." },
        { title: "30-minute reminders", description: "A timed reminder before your scheduled consultation starts." },
        { title: "Consultation summaries", description: "Alerts when a doctor completes your visit and uploads notes." },
        { title: "Lab results", description: "Notifications when diagnostic results are ready to review." },
        { title: "Prescription progress", description: "Updates when your prescription has been dispensed." },
        { title: "Wallet activity", description: "Credit top-up confirmations and refund-related updates." }
    ],
    doctor: [
        { title: "New bookings", description: "Appointments created by patients or by you on behalf of patients." },
        { title: "Schedule changes", description: "Patient reschedules, cancellations, and payment confirmations." },
        { title: "Clinical follow-up", description: "Lab results returned for your patients and completed prescriptions." },
        { title: "Patient feedback", description: "Reviews submitted after completed appointments." }
    ],
    lab: [
        { title: "New lab requests", description: "Fresh diagnostic orders created after consultation." },
        { title: "Assignments", description: "Requests you pick up or that become assigned to you." },
        { title: "Result workflow", description: "A running queue of tests that need reports or result entry." }
    ],
    pharmacist: [
        { title: "New prescriptions", description: "Medication orders created after doctor consultations." },
        { title: "Dispensing activity", description: "Confirmation when a prescription has been marked as dispensed." }
    ],
    admin: [
        { title: "Security alerts", description: "Failed login attempts and blocked authentication events." },
        { title: "Operational changes", description: "Appointment cancellations and other cross-system events worth review." }
    ]
};

export const notificationTypeMeta: Record<
    AppNotificationType,
    { icon: LucideIcon; label: string; accentClass: string }
> = {
    appointment: {
        icon: CalendarClock,
        label: "Appointment",
        accentClass: "bg-blue-50 text-blue-700 border-blue-200"
    },
    lab: {
        icon: FlaskConical,
        label: "Lab",
        accentClass: "bg-emerald-50 text-emerald-700 border-emerald-200"
    },
    prescription: {
        icon: Pill,
        label: "Prescription",
        accentClass: "bg-amber-50 text-amber-700 border-amber-200"
    },
    admin: {
        icon: ShieldAlert,
        label: "Admin",
        accentClass: "bg-rose-50 text-rose-700 border-rose-200"
    },
    system: {
        icon: Bell,
        label: "System",
        accentClass: "bg-slate-100 text-slate-700 border-slate-200"
    }
};

export const getNotificationsRoute = (role: AppRole) => `/${role}/notifications`;

export const mapNotificationType = (type?: NotificationType | null): AppNotificationType => {
    switch (type) {
        case NotificationType.APPOINTMENT:
            return "appointment";
        case NotificationType.LAB:
            return "lab";
        case NotificationType.PRESCRIPTION:
            return "prescription";
        case NotificationType.ADMIN:
            return "admin";
        default:
            return "system";
    }
};

export const toAppNotification = (notification?: NotificationDto | null): AppNotification => ({
    id: notification?.id || "",
    type: mapNotificationType(notification?.type),
    title: notification?.title || "Notification",
    message: notification?.message || "",
    createdAt: notification?.createdAt || new Date().toISOString(),
    actionUrl: notification?.actionUrl || "/",
    read: notification?.isRead ?? false
});

export const getNotificationEmptyState = (role: AppRole) => {
    const emptyStateByRole: Record<AppRole, { title: string; description: string; icon: LucideIcon }> = {
        patient: {
            title: "No patient notifications yet",
            description: "Appointment reminders, lab results, and prescription updates will show here.",
            icon: CalendarClock
        },
        doctor: {
            title: "No doctor notifications yet",
            description: "New bookings, patient changes, and clinical updates will show here.",
            icon: ClipboardList
        },
        lab: {
            title: "No lab notifications yet",
            description: "Assignments and diagnostic work updates will show here.",
            icon: FlaskConical
        },
        pharmacist: {
            title: "No pharmacy notifications yet",
            description: "Prescription queue and dispensing updates will show here.",
            icon: Pill
        },
        admin: {
            title: "No admin notifications yet",
            description: "Security and system oversight events will show here.",
            icon: ShieldAlert
        }
    };

    return emptyStateByRole[role] || {
        title: "No notifications yet",
        description: "Updates will appear here once activity starts.",
        icon: AlertCircle
    };
};
