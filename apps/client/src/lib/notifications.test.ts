import { NotificationType } from "@mediflow/mediflow-api";
import { describe, expect, it } from "vitest";
import { getNotificationEmptyState, mapNotificationType, toAppNotification } from "@/lib/notifications";

describe("notifications helpers", () => {
    it("maps backend notification types into app notification types", () => {
        expect(mapNotificationType(NotificationType.APPOINTMENT)).toBe("appointment");
        expect(mapNotificationType(NotificationType.LAB)).toBe("lab");
        expect(mapNotificationType(NotificationType.PRESCRIPTION)).toBe("prescription");
        expect(mapNotificationType(NotificationType.ADMIN)).toBe("admin");
        expect(mapNotificationType(undefined)).toBe("system");
    });

    it("creates safe app notification defaults when dto data is missing", () => {
        const notification = toAppNotification(null);

        expect(notification.id).toBe("");
        expect(notification.title).toBe("Notification");
        expect(notification.read).toBe(false);
        expect(notification.type).toBe("system");
        expect(notification.actionUrl).toBe("/");
    });

    it("returns a role-specific empty state message", () => {
        const emptyState = getNotificationEmptyState("doctor");

        expect(emptyState.title).toContain("doctor");
        expect(emptyState.description).toContain("bookings");
    });
});
