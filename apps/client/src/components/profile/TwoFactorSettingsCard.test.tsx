import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactElement } from "react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { TwoFactorSettingsCard } from "@/components/profile/TwoFactorSettingsCard";

const { profileServiceMock, toastMock } = vi.hoisted(() => ({
    profileServiceMock: {
        getTwoFactorStatus: vi.fn(),
        enableTwoFactorAuthentication: vi.fn(),
        confirmTwoFactorAuthentication: vi.fn(),
        disableTwoFactorAuthentication: vi.fn()
    },
    toastMock: {
        success: vi.fn(),
        error: vi.fn()
    }
}));

vi.mock("@mediflow/mediflow-api", async () => {
    const actual = await vi.importActual<typeof import("@mediflow/mediflow-api")>("@mediflow/mediflow-api");

    return {
        ...actual,
        ProfileService: profileServiceMock
    };
});

vi.mock("sonner", () => ({
    toast: toastMock
}));

describe("TwoFactorSettingsCard", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("starts setup and shows the qr/manual key verification state", async () => {
        const user = userEvent.setup();
        profileServiceMock.getTwoFactorStatus.mockResolvedValue({
            result: {
                isEnabled: false
            }
        });
        profileServiceMock.enableTwoFactorAuthentication.mockResolvedValue({
            message: "2FA setup started.",
            result: {
                qrCodeImageBase64: "abc123",
                manualEntryKey: "MEDI-FLOW-KEY"
            }
        });

        renderWithQueryClient(<TwoFactorSettingsCard />);

        await user.click(await screen.findByRole("button", { name: /Start Setup/i }));

        expect(await screen.findByText("MEDI-FLOW-KEY")).toBeInTheDocument();
        expect(screen.getByText("Pending verification")).toBeInTheDocument();
        expect(toastMock.success).toHaveBeenCalledWith("2FA setup started.");
    });

    it("disables two-factor authentication when the switch is turned off", async () => {
        const user = userEvent.setup();
        profileServiceMock.getTwoFactorStatus.mockResolvedValue({
            result: {
                isEnabled: true
            }
        });
        profileServiceMock.disableTwoFactorAuthentication.mockResolvedValue({
            message: "2FA disabled."
        });

        renderWithQueryClient(<TwoFactorSettingsCard />);

        await user.click(await screen.findByRole("switch"));

        await waitFor(() => {
            expect(profileServiceMock.disableTwoFactorAuthentication).toHaveBeenCalledTimes(1);
        });
        expect(toastMock.success).toHaveBeenCalledWith("2FA disabled.");
    });
});

function renderWithQueryClient(ui: ReactElement) {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                retry: false
            },
            mutations: {
                retry: false
            }
        }
    });

    return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}
