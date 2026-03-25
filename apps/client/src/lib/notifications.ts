import {
    AppointmentService,
    AppointmentStatus,
    AppointmentDiagnosticsService,
    AppointmentMedicationsService,
    DiagnosticStatus,
    LoginStatus,
    UserLoginLogService,
    UserService,
    type AppointmentDto
} from "@mediflow/mediflow-api";
import {
    AlertCircle,
    Bell,
    CalendarClock,
    ClipboardList,
    FlaskConical,
    LucideIcon,
    Pill,
    ShieldAlert
} from "lucide-react";
import type { AppRole, AuthUser } from "@/lib/auth";
import { combineDateAndTime } from "@/lib/datetime";

export type AppNotificationType = "appointment" | "lab" | "prescription" | "admin" | "system";

export interface AppNotification {
    id: string;
    type: AppNotificationType;
    title: string;
    message: string;
    createdAt: string;
    actionUrl: string;
}

export interface NotificationTriggerDefinition {
    title: string;
    description: string;
}

export const notificationTriggersByRole: Record<AppRole, NotificationTriggerDefinition[]> = {
    patient: [
        { title: "Appointment reminders", description: "Upcoming visits, including the 30-minute reminder window." },
        { title: "Appointment changes", description: "Booking confirmations, updates, and cancellations." },
        { title: "Lab results", description: "Notifications when ordered diagnostics are resulted." },
        { title: "Prescription updates", description: "Alerts when medicines are dispensed or ready." },
        { title: "Consultation summary", description: "Diagnosis and medical record updates after a visit." }
    ],
    doctor: [
        { title: "New bookings", description: "New patient appointments scheduled on your calendar." },
        { title: "Upcoming consultations", description: "Reminders for visits starting soon." },
        { title: "Patient changes", description: "Cancellations and activity on your scheduled appointments." },
        { title: "Lab readiness", description: "Diagnostic results returned for your patients." },
        { title: "Prescription progress", description: "Medication orders that have been dispensed." }
    ],
    lab: [
        { title: "New requests", description: "New unassigned diagnostic requests waiting to be picked up." },
        { title: "Assignments", description: "Diagnostics that are assigned to you." },
        { title: "Pending result entry", description: "Collected samples that still need result submission." },
        { title: "Cancelled diagnostics", description: "Requests that no longer need processing." }
    ],
    pharmacist: [
        { title: "New prescriptions", description: "Medication orders that are ready for pharmacy handling." },
        { title: "Assigned dispensing", description: "Prescriptions assigned to you for fulfillment." },
        { title: "Dispense completion", description: "Medication orders already marked as dispensed." }
    ],
    admin: [
        { title: "Pending user review", description: "Inactive or newly registered users waiting for action." },
        { title: "Failed logins", description: "Recent authentication failures that may need attention." },
        { title: "Operational changes", description: "Recent appointment cancellations across the system." }
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

const toIso = (value?: Date | string | null) => {
    if (!value) {
        return new Date().toISOString();
    }
    return value instanceof Date ? value.toISOString() : value;
};

const isWithinMinutes = (date: Date, minutes: number) => {
    const now = Date.now();
    const diff = date.getTime() - now;
    return diff > 0 && diff <= minutes * 60 * 1000;
};

const isWithinHours = (date: Date, hours: number) => {
    const now = Date.now();
    const diff = date.getTime() - now;
    return diff > 0 && diff <= hours * 60 * 60 * 1000;
};

const wasCreatedRecently = (value?: string | null, hours = 24) => {
    if (!value) return false;
    const time = new Date(value).getTime();
    return Date.now() - time <= hours * 60 * 60 * 1000;
};

const hasMedicationBeenDispensed = (status?: DiagnosticStatus | null) =>
    status === DiagnosticStatus.COLLECTED || status === DiagnosticStatus.RESULTED;

const appointmentActionUrl = (role: AppRole, appointmentId?: string | null) => {
    if (!appointmentId) {
        return getNotificationsRoute(role);
    }
    if (role === "patient" || role === "doctor") {
        return `/${role}/appointments/${appointmentId}`;
    }
    return getNotificationsRoute(role);
};

const buildPatientNotifications = (appointments: AppointmentDto[]) => {
    const notifications: AppNotification[] = [];

    for (const appointment of appointments) {
        if (!appointment.id) continue;
        const start = combineDateAndTime(appointment.timeslot?.date, appointment.timeslot?.startTime);
        const doctorName = appointment.doctor?.name || "your doctor";
        const actionUrl = appointmentActionUrl("patient", appointment.id);

        if (start && appointment.status === AppointmentStatus.SCHEDULED && isWithinMinutes(start, 30)) {
            notifications.push({
                id: `patient-reminder-30-${appointment.id}`,
                type: "appointment",
                title: "Appointment starts in 30 minutes",
                message: `Your appointment with ${doctorName} is coming up soon.`,
                createdAt: toIso(start),
                actionUrl
            });
        }

        if (start && appointment.status === AppointmentStatus.SCHEDULED && isWithinHours(start, 24)) {
            notifications.push({
                id: `patient-upcoming-${appointment.id}`,
                type: "appointment",
                title: "Upcoming appointment",
                message: `You have a scheduled consultation with ${doctorName} within the next 24 hours.`,
                createdAt: toIso(start),
                actionUrl
            });
        }

        if (appointment.status === AppointmentStatus.CANCELED) {
            notifications.push({
                id: `patient-cancelled-${appointment.id}`,
                type: "appointment",
                title: "Appointment cancelled",
                message: appointment.cancellationReason || `Your appointment with ${doctorName} was cancelled.`,
                createdAt: toIso(appointment.cancelledDate || appointment.bookedDate),
                actionUrl
            });
        }

        if (appointment.status === AppointmentStatus.COMPLETED && appointment.medicalRecords?.diagnosis) {
            notifications.push({
                id: `patient-summary-${appointment.id}`,
                type: "system",
                title: "Consultation summary added",
                message: `Your diagnosis and consultation notes are now available for review.`,
                createdAt: toIso(appointment.bookedDate),
                actionUrl
            });
        }

        for (const diagnostics of appointment.diagnostics || []) {
            if (diagnostics.id && diagnostics.status === DiagnosticStatus.RESULTED) {
                notifications.push({
                    id: `patient-lab-${diagnostics.id}`,
                    type: "lab",
                    title: "Lab results ready",
                    message: `Results from your appointment with ${doctorName} are available now.`,
                    createdAt: toIso(diagnostics.completedDate || appointment.bookedDate),
                    actionUrl
                });
            }
        }

        for (const medication of appointment.medications || []) {
            if (medication.id && hasMedicationBeenDispensed(medication.status)) {
                notifications.push({
                    id: `patient-medication-${medication.id}`,
                    type: "prescription",
                    title: "Prescription updated",
                    message: `Medication from your appointment with ${doctorName} has been processed by the pharmacy.`,
                    createdAt: toIso(medication.completedDate || appointment.bookedDate),
                    actionUrl
                });
            }
        }
    }

    return notifications;
};

const buildDoctorNotifications = (appointments: AppointmentDto[]) => {
    const notifications: AppNotification[] = [];

    for (const appointment of appointments) {
        if (!appointment.id) continue;
        const start = combineDateAndTime(appointment.timeslot?.date, appointment.timeslot?.startTime);
        const patientName = appointment.patient?.name || "your patient";
        const actionUrl = appointmentActionUrl("doctor", appointment.id);

        if (wasCreatedRecently(appointment.bookedDate) && appointment.status === AppointmentStatus.SCHEDULED) {
            notifications.push({
                id: `doctor-booked-${appointment.id}`,
                type: "appointment",
                title: "New appointment booked",
                message: `${patientName} booked a consultation on your schedule.`,
                createdAt: toIso(appointment.bookedDate),
                actionUrl
            });
        }

        if (start && appointment.status === AppointmentStatus.SCHEDULED && isWithinMinutes(start, 60)) {
            notifications.push({
                id: `doctor-upcoming-${appointment.id}`,
                type: "appointment",
                title: "Consultation starting soon",
                message: `${patientName} is scheduled to see you within the next hour.`,
                createdAt: toIso(start),
                actionUrl
            });
        }

        if (appointment.status === AppointmentStatus.CANCELED) {
            notifications.push({
                id: `doctor-cancelled-${appointment.id}`,
                type: "appointment",
                title: "Patient appointment cancelled",
                message: `${patientName} cancelled a scheduled consultation.`,
                createdAt: toIso(appointment.cancelledDate || appointment.bookedDate),
                actionUrl
            });
        }

        for (const diagnostics of appointment.diagnostics || []) {
            if (diagnostics.id && diagnostics.status === DiagnosticStatus.RESULTED) {
                notifications.push({
                    id: `doctor-lab-${diagnostics.id}`,
                    type: "lab",
                    title: "Lab results available",
                    message: `Diagnostic results for ${patientName} are ready for review.`,
                    createdAt: toIso(diagnostics.completedDate || appointment.bookedDate),
                    actionUrl
                });
            }
        }

        for (const medication of appointment.medications || []) {
            if (medication.id && hasMedicationBeenDispensed(medication.status)) {
                notifications.push({
                    id: `doctor-medication-${medication.id}`,
                    type: "prescription",
                    title: "Prescription dispensed",
                    message: `Medication prescribed for ${patientName} has been processed.`,
                    createdAt: toIso(medication.completedDate || appointment.bookedDate),
                    actionUrl
                });
            }
        }
    }

    return notifications;
};

const buildLabNotifications = (appointments: AppointmentDto[], user: AuthUser) => {
    const notifications: AppNotification[] = [];

    for (const appointment of appointments) {
        for (const diagnostics of appointment.diagnostics || []) {
            if (!diagnostics.id) continue;
            const patientName = appointment.patient?.name || "a patient";
            const actionUrl = `/lab/request/${diagnostics.id}`;
            const isMine = diagnostics.labTechnician?.id === user.id;

            if (!diagnostics.labTechnician?.id && diagnostics.status !== DiagnosticStatus.CANCELLED) {
                notifications.push({
                    id: `lab-unassigned-${diagnostics.id}`,
                    type: "lab",
                    title: "New lab request available",
                    message: `${patientName} has a diagnostic request waiting to be assigned.`,
                    createdAt: toIso(appointment.bookedDate),
                    actionUrl
                });
            }

            if (isMine && diagnostics.status !== DiagnosticStatus.RESULTED) {
                notifications.push({
                    id: `lab-assigned-${diagnostics.id}`,
                    type: "lab",
                    title: "Request assigned to you",
                    message: `You are assigned to process diagnostics for ${patientName}.`,
                    createdAt: toIso(appointment.bookedDate),
                    actionUrl
                });
            }

            if (isMine && diagnostics.status === DiagnosticStatus.COLLECTED) {
                notifications.push({
                    id: `lab-collected-${diagnostics.id}`,
                    type: "lab",
                    title: "Result entry pending",
                    message: `${patientName}'s sample has been collected and is ready for result submission.`,
                    createdAt: toIso(appointment.bookedDate),
                    actionUrl
                });
            }

            if (diagnostics.status === DiagnosticStatus.CANCELLED) {
                notifications.push({
                    id: `lab-cancelled-${diagnostics.id}`,
                    type: "system",
                    title: "Diagnostic request cancelled",
                    message: `${patientName}'s diagnostic request no longer needs processing.`,
                    createdAt: toIso(appointment.cancelledDate || appointment.bookedDate),
                    actionUrl
                });
            }
        }
    }

    return notifications;
};

const buildPharmacistNotifications = (appointments: AppointmentDto[], user: AuthUser) => {
    const notifications: AppNotification[] = [];

    for (const appointment of appointments) {
        for (const medication of appointment.medications || []) {
            if (!medication.id) continue;
            const patientName = appointment.patient?.name || "a patient";
            const actionUrl = `/pharmacist/prescription/${medication.id}`;
            const isMine = medication.pharmacist?.id === user.id;

            if (!medication.pharmacist?.id && !hasMedicationBeenDispensed(medication.status)) {
                notifications.push({
                    id: `pharmacy-unassigned-${medication.id}`,
                    type: "prescription",
                    title: "New prescription to dispense",
                    message: `${patientName} has a medication order waiting in the queue.`,
                    createdAt: toIso(appointment.bookedDate),
                    actionUrl
                });
            }

            if (isMine && !hasMedicationBeenDispensed(medication.status)) {
                notifications.push({
                    id: `pharmacy-assigned-${medication.id}`,
                    type: "prescription",
                    title: "Prescription assigned to you",
                    message: `You are handling the medication order for ${patientName}.`,
                    createdAt: toIso(appointment.bookedDate),
                    actionUrl
                });
            }

            if (isMine && hasMedicationBeenDispensed(medication.status)) {
                notifications.push({
                    id: `pharmacy-dispensed-${medication.id}`,
                    type: "prescription",
                    title: "Prescription completed",
                    message: `The medication order for ${patientName} has been marked as dispensed.`,
                    createdAt: toIso(medication.completedDate || appointment.bookedDate),
                    actionUrl
                });
            }
        }
    }

    return notifications;
};

const buildAdminNotifications = async () => {
    const [usersResponse, logsResponse, appointmentsResponse] = await Promise.all([
        UserService.getAllUsersList({}),
        UserLoginLogService.getAllUserLoginLogsList({}),
        AppointmentService.getAllAppointmentsList({})
    ]);

    const notifications: AppNotification[] = [];
    const pendingUsers = (usersResponse.result || []).filter((user) => user.isActive === false);
    const failedLogins = (logsResponse.result || []).filter(
        (log) =>
            log.status &&
            log.status !== LoginStatus.SUCCESS &&
            log.status !== LoginStatus.LOGGED_OUT &&
            log.status !== LoginStatus.FORCED_LOGOUT &&
            wasCreatedRecently(log.actionDate)
    );
    const recentCancelledAppointments = (appointmentsResponse.result || []).filter(
        (appointment) =>
            appointment.status === AppointmentStatus.CANCELED &&
            wasCreatedRecently(appointment.cancelledDate || appointment.bookedDate)
    );

    if (pendingUsers.length > 0) {
        notifications.push({
            id: `admin-pending-users-${pendingUsers.length}`,
            type: "admin",
            title: "Users awaiting review",
            message: `${pendingUsers.length} user account${pendingUsers.length > 1 ? "s are" : " is"} inactive and may need approval or follow-up.`,
            createdAt: toIso(new Date()),
            actionUrl: "/admin/users"
        });
    }

    if (failedLogins.length > 0) {
        notifications.push({
            id: `admin-failed-logins-${failedLogins.length}`,
            type: "admin",
            title: "Recent failed login attempts",
            message: `${failedLogins.length} failed login attempt${failedLogins.length > 1 ? "s were" : " was"} recorded in the last 24 hours.`,
            createdAt: toIso(failedLogins[0]?.actionDate),
            actionUrl: "/admin/audit-logs"
        });
    }

    if (recentCancelledAppointments.length > 0) {
        notifications.push({
            id: `admin-cancelled-appointments-${recentCancelledAppointments.length}`,
            type: "admin",
            title: "Appointment cancellations detected",
            message: `${recentCancelledAppointments.length} appointment${recentCancelledAppointments.length > 1 ? "s were" : " was"} cancelled recently.`,
            createdAt: toIso(
                recentCancelledAppointments[0]?.cancelledDate || recentCancelledAppointments[0]?.bookedDate
            ),
            actionUrl: "/admin/dashboard"
        });
    }

    return notifications;
};

export const fetchNotificationsForUser = async (user: AuthUser): Promise<AppNotification[]> => {
    if (user.role === "admin") {
        const adminNotifications = await buildAdminNotifications();
        return adminNotifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    if (user.role === "patient") {
        const response = await AppointmentService.getAllAppointmentsList({ patientId: user.id });
        return buildPatientNotifications(response.result || []).sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }

    if (user.role === "doctor") {
        const response = await AppointmentService.getAllAppointmentsList({ doctorId: user.id });
        return buildDoctorNotifications(response.result || []).sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }

    if (user.role === "lab") {
        const response = await AppointmentDiagnosticsService.getAllAppointmentDiagnosticsList({});
        return buildLabNotifications(response.result || [], user).sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }

    if (user.role === "pharmacist") {
        const response = await AppointmentMedicationsService.getAllAppointmentMedicationsList({});
        return buildPharmacistNotifications(response.result || [], user).sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }

    return [];
};

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
            description: "Prescription queue updates will show here.",
            icon: Pill
        },
        admin: {
            title: "No admin notifications yet",
            description: "User review, operational alerts, and security signals will show here.",
            icon: AlertCircle
        }
    };

    return emptyStateByRole[role];
};
