import { MemoryRouter } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import NotificationsPage from "@/pages/Notifications";

const mockUseAuth = vi.fn();
const mockUseNotifications = vi.fn();

vi.mock("@/contexts/AuthContext", () => ({
    useAuth: () => mockUseAuth()
}));

vi.mock("@/contexts/NotificationContext", () => ({
    useNotifications: () => mockUseNotifications()
}));

describe("NotificationsPage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders role triggers and filters unread notifications", async () => {
        const user = userEvent.setup();
        const markAsRead = vi.fn();

        mockUseAuth.mockReturnValue({
            user: {
                id: "patient-1",
                role: "patient"
            }
        });

        mockUseNotifications.mockReturnValue({
            notifications: [
                {
                    id: "one",
                    type: "appointment",
                    title: "Upcoming appointment",
                    message: "Starts in 30 minutes",
                    createdAt: new Date().toISOString(),
                    actionUrl: "/patient/appointments/one",
                    read: false
                },
                {
                    id: "two",
                    type: "lab",
                    title: "Lab result ready",
                    message: "Open to review",
                    createdAt: new Date().toISOString(),
                    actionUrl: "/patient/records",
                    read: true
                }
            ],
            unreadCount: 1,
            isLoading: false,
            markAsRead,
            markAllAsRead: vi.fn(),
            refresh: vi.fn()
        });

        render(
            <MemoryRouter>
                <NotificationsPage />
            </MemoryRouter>
        );

        expect(screen.getByText("30-minute reminders")).toBeInTheDocument();
        expect(screen.getByText("Upcoming appointment")).toBeInTheDocument();
        expect(screen.getByText("Lab result ready")).toBeInTheDocument();

        await user.click(screen.getByRole("tab", { name: /Unread \(1\)/i }));

        expect(screen.getByText("Upcoming appointment")).toBeInTheDocument();
        expect(screen.queryByText("Lab result ready")).not.toBeInTheDocument();

        await user.click(screen.getByRole("link", { name: /Open/i }));
        expect(markAsRead).toHaveBeenCalledWith("one");
    });

    it("disables mark all read when everything is already read", () => {
        mockUseAuth.mockReturnValue({
            user: {
                id: "doctor-1",
                role: "doctor"
            }
        });

        mockUseNotifications.mockReturnValue({
            notifications: [
                {
                    id: "one",
                    type: "appointment",
                    title: "New booking",
                    message: "A patient booked a slot",
                    createdAt: new Date().toISOString(),
                    actionUrl: "/doctor/appointments/one",
                    read: true
                }
            ],
            unreadCount: 0,
            isLoading: false,
            markAsRead: vi.fn(),
            markAllAsRead: vi.fn(),
            refresh: vi.fn()
        });

        render(
            <MemoryRouter>
                <NotificationsPage />
            </MemoryRouter>
        );

        expect(screen.getByRole("button", { name: /Mark All Read/i })).toBeDisabled();
        expect(screen.getByText("New bookings")).toBeInTheDocument();
    });
});
