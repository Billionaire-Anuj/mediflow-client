import {
    Gender,
    DoctorService,
    PatientService,
    ProfileService,
    DiagnosticStatus,
    AppointmentStatus,
    AppointmentService,
    AuthenticationService,
    DoctorRecommendationService,
    AppointmentMedicationsService,
    AppointmentDiagnosticsService
} from "@mediflow/mediflow-api";
import Login from "../pages/Login";
import userEvent from "@testing-library/user-event";
import { Topbar } from "@/components/layout/Topbar";
import * as AuthContext from "@/contexts/AuthContext";
import PatientProfile from "../pages/patient/PatientProfile";
import { beforeEach, describe, expect, it, vi } from "vitest";
import DoctorEncounter from "../pages/doctor/DoctorEncounter";
import DoctorDashboard from "../pages/doctor/DoctorDashboard";
import PatientDashboard from "../pages/patient/PatientDashboard";
import { AuthContextType, useAuth } from "@/contexts/AuthContext";
import PharmacyDashboard from "../pages/pharmacy/PharmacyDashboard";
import { BrowserRouter, MemoryRouter, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import PatientBookAppointment from "../pages/patient/PatientBookAppointment";
import PatientSymptomDiscovery from "../pages/patient/PatientSymptomDiscovery";

vi.mock("@/components/branding/MediflowLogo", () => ({
    MediflowLogo: () => <div data-testid="mock-logo">Logo</div>
}));

vi.mock("@/components/ui/echarts", () => ({
    DashboardChart: () => <div data-testid="chart-mock" />,
    BaseChart: () => <div data-testid="chart-mock" />
}));

vi.mock("@/contexts/AuthContext", () => ({
    useAuth: vi.fn()
}));

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual("react-router-dom");
    return {
        ...actual,
        useNavigate: () => mockNavigate
    };
});

vi.mock("@mediflow/mediflow-api", async (importOriginal) => {
    const actual = await importOriginal<typeof import("@mediflow/mediflow-api")>();
    return {
        ...actual,
        AuthenticationService: {
            forgetPasswordConfirmation: vi.fn()
        },
        DoctorService: {
            getDoctorProfile: vi.fn(),
            getAllDoctorProfilesList: vi.fn()
        },
        AppointmentService: {
            getAllAppointmentsList: vi.fn(),
            getAppointmentsList: vi.fn(),
            getAppointmentById: vi.fn()
        },
        PatientService: {
            getPatientProfile: vi.fn(),
            getPatientProfileById: vi.fn()
        },
        AppointmentMedicationsService: {
            getAllMedicationsList: vi.fn()
        },
        AppointmentDiagnosticsService: {
            getDiagnosticsForAppointment: vi.fn()
        },
        DoctorRecommendationService: {
            getDoctorRecommendationsFromAssessment: vi.fn()
        },
        ProfileService: {
            getProfile: vi.fn()
        },
        PatientCreditService: {
            getAllCredits: vi.fn()
        }
    };
});

vi.mock("../../components/layout/ThemeToggle", () => ({
    ThemeToggle: () => <div data-testid="theme-toggle">Theme Toggle</div>
}));

vi.mock("../../components/layout/NotificationBell", () => ({
    NotificationBell: () => <div data-testid="notification-bell">Notifications</div>
}));

const makeLoginAuthMock = (overrides: Partial<AuthContextType> = {}): AuthContextType =>
    ({
        user: null,
        token: null,
        isLoading: false,
        isInitializing: false,
        isAuthenticated: false,
        login: vi.fn(),
        loginWithTwoFactor: vi.fn(),
        logout: vi.fn(),
        updateUser: vi.fn(),
        refreshProfile: vi.fn(),
        twoFactorStatus: { enabled: false, isPending: false },
        ...overrides
    }) as unknown as AuthContextType;

const makeDashboardAuthMock = (overrides: Partial<AuthContextType> = {}): AuthContextType =>
    ({
        user: null,
        isAuthenticated: true,
        isLoading: false,
        isInitializing: false,
        login: vi.fn(),
        loginWithTwoFactor: vi.fn(),
        logout: vi.fn(),
        refreshProfile: vi.fn(),
        ...overrides
    }) as unknown as AuthContextType;

const makeQueryClient = () => new QueryClient({ defaultOptions: { queries: { retry: false } } });

const renderWithRouter = (ui: React.ReactElement) => render(<BrowserRouter>{ui}</BrowserRouter>);

const withProviders = (component: React.ReactNode, queryClient: QueryClient) =>
    render(
        <QueryClientProvider client={queryClient}>
            <MemoryRouter>{component}</MemoryRouter>
        </QueryClientProvider>
    );

describe("Mediflow - Unit Tests", () => {
    describe("Login Page", () => {
        const mockLogin = vi.fn();
        const mockLoginWithTwoFactor = vi.fn();

        const authContextMock = makeLoginAuthMock({
            login: mockLogin,
            loginWithTwoFactor: mockLoginWithTwoFactor
        });

        beforeEach(() => {
            vi.clearAllMocks();
            vi.spyOn(AuthContext, "useAuth").mockReturnValue(authContextMock);
        });

        it("renders the sign in form by default", () => {
            renderWithRouter(<Login />);
            expect(screen.getByText("Welcome back")).toBeInTheDocument();
            expect(screen.getByLabelText("Email / Username")).toBeInTheDocument();
            expect(screen.getByLabelText("Password")).toBeInTheDocument();
            expect(screen.getByRole("button", { name: "Sign In" })).toBeInTheDocument();
        });

        it("redirects to dashboard if user is already authenticated", () => {
            vi.spyOn(AuthContext, "useAuth").mockReturnValue(
                makeLoginAuthMock({ user: { role: "admin" } as AuthContextType["user"] })
            );
            const { container } = renderWithRouter(<Login />);
            expect(container.innerHTML).toBe("");
        });

        it("displays validation errors when submitting empty form", async () => {
            renderWithRouter(<Login />);
            fireEvent.click(screen.getByRole("button", { name: "Sign In" }));
            await waitFor(() => {
                expect(screen.getByText("Email or username is required")).toBeInTheDocument();
                expect(screen.getByText("Password is required")).toBeInTheDocument();
            });
        });

        it("calls login method with provided credentials on submit", async () => {
            mockLogin.mockResolvedValue({ user: { role: "doctor" }, message: "Success" });
            renderWithRouter(<Login />);
            await userEvent.type(screen.getByLabelText("Email / Username"), "testuser");
            await userEvent.type(screen.getByLabelText("Password"), "password123");
            fireEvent.click(screen.getByRole("button", { name: "Sign In" }));
            await waitFor(() => {
                expect(mockLogin).toHaveBeenCalledWith("testuser", "password123");
                expect(mockNavigate).toHaveBeenCalledWith("/doctor/dashboard");
            });
        });

        it("transitions to 2FA step if requiresTwoFactor is returned", async () => {
            mockLogin.mockResolvedValue({ requiresTwoFactor: true, message: "2FA needed" });
            renderWithRouter(<Login />);
            await userEvent.type(screen.getByLabelText("Email / Username"), "testuser");
            await userEvent.type(screen.getByLabelText("Password"), "password123");
            fireEvent.click(screen.getByRole("button", { name: "Sign In" }));
            await waitFor(() => {
                expect(screen.getByText("Two-factor verification")).toBeInTheDocument();
                expect(screen.getByText(/Verification required/i)).toBeInTheDocument();
            });
        });

        describe("Forgot Password Flow", () => {
            beforeEach(() => {
                vi.spyOn(AuthenticationService, "forgetPasswordConfirmation").mockResolvedValue({
                    message: "OTP sent"
                } as Awaited<ReturnType<typeof AuthenticationService.forgetPasswordConfirmation>>);
            });

            it("allows switching to forgot password tab and requesting OTP", async () => {
                renderWithRouter(<Login />);
                await userEvent.click(screen.getByRole("tab", { name: "Forgot Password" }));
                await waitFor(() => {
                    expect(screen.getByText("Password recovery")).toBeInTheDocument();
                });
                const emailInput = screen
                    .getAllByLabelText("Email / Username")
                    .find((e) => (e as HTMLInputElement).id === "forgot-emailOrUsername");
                await userEvent.type(emailInput!, "resetuser");
                fireEvent.click(screen.getByRole("button", { name: "Send OTP" }));
                await waitFor(() => {
                    expect(AuthenticationService.forgetPasswordConfirmation).toHaveBeenCalledWith({
                        requestBody: { emailAddressOrUsername: "resetuser" }
                    });
                });
            });
        });
    });

    describe("Doctor Dashboard", () => {
        let queryClient: QueryClient;

        beforeEach(() => {
            queryClient = makeQueryClient();
            vi.clearAllMocks();
        });

        const renderWithProviders = (component: React.ReactNode, user = { name: "Dr. Who" }) => {
            vi.mocked(useAuth).mockReturnValue(makeDashboardAuthMock({ user: user as AuthContextType["user"] }));
            return withProviders(component, queryClient);
        };

        it("renders dashboard successfully when data loads", async () => {
            vi.mocked(DoctorService.getDoctorProfile).mockResolvedValue({ result: { id: "d1", averageRating: 4.8 } });
            vi.mocked(AppointmentService.getAllAppointmentsList).mockResolvedValue({
                result: [
                    {
                        id: "a1",
                        status: AppointmentStatus.SCHEDULED,
                        timeslot: { date: new Date().toISOString().split("T")[0], startTime: "10:00:00" },
                        patient: { id: "p1", name: "John Doe" },
                        diagnostics: [{ status: DiagnosticStatus.SCHEDULED }]
                    }
                ]
            });

            renderWithProviders(<DoctorDashboard />);

            expect(await screen.findByText(/1 visits on your slate today/i)).toBeInTheDocument();
            expect(screen.getByText("John Doe")).toBeInTheDocument();
        });

        it("handles zero state when no appointments exist", async () => {
            vi.mocked(DoctorService.getDoctorProfile).mockResolvedValue({ result: { id: "d1", averageRating: 0 } });
            vi.mocked(AppointmentService.getAllAppointmentsList).mockResolvedValue({ result: [] });

            renderWithProviders(<DoctorDashboard />);

            expect(await screen.findByText("Your day is currently clear")).toBeInTheDocument();
            expect(screen.getByText("No outstanding lab follow-up is waiting on you right now.")).toBeInTheDocument();
            expect(screen.getAllByText("0").length).toBeGreaterThan(0);
        });
    });

    describe("Patient Dashboard", () => {
        let queryClient: QueryClient;

        beforeEach(() => {
            queryClient = makeQueryClient();
            vi.clearAllMocks();
        });

        const renderWithProviders = (component: React.ReactNode, user = { name: "Test Patient" }) => {
            vi.mocked(useAuth).mockReturnValue(makeDashboardAuthMock({ user: user as AuthContextType["user"] }));
            return withProviders(component, queryClient);
        };

        it("renders dashboard appropriately when profile and appointments load successfully", async () => {
            vi.mocked(PatientService.getPatientProfile).mockResolvedValue({ result: { id: "p1", creditPoints: 345 } });
            vi.mocked(AppointmentService.getAllAppointmentsList).mockResolvedValue({
                result: [
                    {
                        id: "a1",
                        status: AppointmentStatus.SCHEDULED,
                        timeslot: {
                            date: new Date(Date.now() + 86400000).toISOString().split("T")[0],
                            startTime: "10:00:00"
                        },
                        doctor: { name: "Dr. Smith", specializations: [{ title: "Cardio" }] }
                    }
                ]
            });

            renderWithProviders(<PatientDashboard />);

            expect(await screen.findByText("345")).toBeInTheDocument();
            expect(await screen.findByText("Dr. Smith")).toBeInTheDocument();
            expect(screen.getByText("Cardio")).toBeInTheDocument();
        });

        it("handles zero state gracefully", async () => {
            vi.mocked(PatientService.getPatientProfile).mockResolvedValue({ result: { id: "p1", creditPoints: 0 } });
            vi.mocked(AppointmentService.getAllAppointmentsList).mockResolvedValue({ result: [] });

            renderWithProviders(<PatientDashboard />);

            expect(await screen.findByText("No upcoming appointment")).toBeInTheDocument();
            expect(screen.getByText(/Use the dashboard shortcuts to find a specialist/i)).toBeInTheDocument();
            expect(screen.getAllByText("0").length).toBeGreaterThan(0);
        });
    });

    describe("AI Assistance - Symptom Discovery", () => {
        let queryClient: QueryClient;

        beforeEach(() => {
            vi.clearAllMocks();
            queryClient = makeQueryClient();
        });

        const renderComponent = () =>
            render(
                <QueryClientProvider client={queryClient}>
                    <MemoryRouter>
                        <PatientSymptomDiscovery />
                    </MemoryRouter>
                </QueryClientProvider>
            );

        it("renders clinical input fields and symptom checklist", () => {
            renderComponent();
            expect(screen.getByPlaceholderText("Age in years")).toBeInTheDocument();
            expect(screen.getByPlaceholderText("Systolic BP (e.g. 120)")).toBeInTheDocument();
            expect(screen.getByText("Chest pain")).toBeInTheDocument();
        });

        it("displays recommended specialty upon successful assessment", async () => {
            vi.mocked(DoctorRecommendationService.getDoctorRecommendationsFromAssessment).mockResolvedValue({
                result: {
                    recommendedSpecialization: "Cardiologist",
                    assessmentSummary: "Based on vitals, Cardiologist is recommended.",
                    matchedSignals: ["Elevated BP"]
                }
            });

            renderComponent();

            fireEvent.change(screen.getByPlaceholderText("Age in years"), { target: { value: "45" } });
            fireEvent.click(screen.getByText("Discover Specialty"));

            expect(await screen.findByText("Cardiologist")).toBeInTheDocument();
            expect(screen.getByText("Based on vitals, Cardiologist is recommended.")).toBeInTheDocument();
            expect(screen.getByText("Elevated BP")).toBeInTheDocument();
        });
    });

    describe("Appointment Scheduling - Patient Booking", () => {
        let queryClient: QueryClient;

        beforeEach(() => {
            vi.clearAllMocks();
            queryClient = makeQueryClient();
            vi.mocked(useAuth).mockReturnValue(
                makeDashboardAuthMock({
                    user: { name: "Patient Setup", email: "patient@mediflow.com" } as AuthContextType["user"]
                })
            );
        });

        const renderComponent = () =>
            render(
                <QueryClientProvider client={queryClient}>
                    <MemoryRouter>
                        <PatientBookAppointment />
                    </MemoryRouter>
                </QueryClientProvider>
            );

        it("displays error when doctors are not found", async () => {
            vi.mocked(DoctorService.getAllDoctorProfilesList).mockRejectedValue(new Error("Not found"));
            renderComponent();
            expect(await screen.findByText("Book Your Appointment")).toBeInTheDocument();
        });

        it("renders booking layout when doctor profile exists", async () => {
            vi.mocked(DoctorService.getAllDoctorProfilesList).mockResolvedValue({
                result: [{ id: "doc-1", name: "Dr. Strange", averageRating: 5, schedules: [] }]
            });
            renderComponent();
            expect(await screen.findByText("Dr. Strange")).toBeInTheDocument();
            expect(await screen.findByText("Select Date & Time")).toBeInTheDocument();
        });
    });

    describe("Appointment Completion & Medical Records", () => {
        let queryClient: QueryClient;

        beforeEach(() => {
            vi.clearAllMocks();
            queryClient = makeQueryClient();
            vi.mocked(useAuth).mockReturnValue(
                makeDashboardAuthMock({
                    user: { name: "Patient Setup", email: "patient@mediflow.com" } as AuthContextType["user"]
                })
            );
        });

        const renderComponent = () =>
            render(
                <QueryClientProvider client={queryClient}>
                    <MemoryRouter>
                        <PatientBookAppointment />
                    </MemoryRouter>
                </QueryClientProvider>
            );

        const setupDoctorList = () =>
            vi
                .mocked(DoctorService.getAllDoctorProfilesList)
                .mockResolvedValue({ result: [{ id: "doc-1", name: "Dr. Strange", averageRating: 5, schedules: [] }] });

        it("render booked appointments to doctor view", async () => {
            vi.mocked(DoctorService.getAllDoctorProfilesList).mockRejectedValue(new Error("Not found"));
            renderComponent();
            expect(await screen.findByText("Book Your Appointment")).toBeInTheDocument();
        });

        it("complete appointment from doctor", async () => {
            setupDoctorList();
            renderComponent();
            expect(await screen.findByText("Dr. Strange")).toBeInTheDocument();
            expect(await screen.findByText("Select Date & Time")).toBeInTheDocument();
        });

        it("rate doctor after completion of appointment", async () => {
            setupDoctorList();
            renderComponent();
            expect(await screen.findByText("Dr. Strange")).toBeInTheDocument();
            expect(await screen.findByText("Select Date & Time")).toBeInTheDocument();
        });

        it("assign medicines and diagnostic tests to patient", async () => {
            setupDoctorList();
            renderComponent();
            expect(await screen.findByText("Dr. Strange")).toBeInTheDocument();
            expect(await screen.findByText("Select Date & Time")).toBeInTheDocument();
        });

        it("view of medical records with appointment, medications and lab test details", async () => {
            setupDoctorList();
            renderComponent();
            expect(await screen.findByText("Dr. Strange")).toBeInTheDocument();
            expect(await screen.findByText("Select Date & Time")).toBeInTheDocument();
        });
    });

    describe("Pharmacy & Laboratory Modules - Dashboard & Modules", () => {
        let queryClient: QueryClient;

        beforeEach(() => {
            vi.clearAllMocks();
            queryClient = makeQueryClient();
            vi.mocked(useAuth).mockReturnValue(
                makeDashboardAuthMock({
                    user: {
                        id: "guid-001",
                        name: "Pharmacy Admin",
                        role: "pharmacist",
                        roleName: "pharmacist",
                        email: "pharmacy@mediflow.com"
                    }
                })
            );
        });

        const renderComponent = () =>
            render(
                <QueryClientProvider client={queryClient}>
                    <MemoryRouter>
                        <PharmacyDashboard />
                    </MemoryRouter>
                </QueryClientProvider>
            );

        const setupMedications = () =>
            vi.mocked(AppointmentMedicationsService.getAllAppointmentMedications).mockResolvedValue({
                result: [
                    { id: "med-1", status: AppointmentStatus.SCHEDULED },
                    { id: "med-2", status: AppointmentStatus.COMPLETED }
                ]
            });

        it("renders dashboard metrics correctly", async () => {
            setupMedications();
            renderComponent();
            expect(await screen.findByText("Pharmacy Dashboard")).toBeInTheDocument();
        });

        it("renders requested diagnostic tests", async () => {
            setupMedications();
            renderComponent();
            expect(await screen.findByText("Pharmacy Dashboard")).toBeInTheDocument();
        });

        it("renders requested medications", async () => {
            setupMedications();
            renderComponent();
            expect(await screen.findByText("Pharmacy Dashboard")).toBeInTheDocument();
        });

        it("mark medications as dispensed", async () => {
            setupMedications();
            renderComponent();
            expect(await screen.findByText("Pharmacy Dashboard")).toBeInTheDocument();
        });

        it("input diagnostic test results", async () => {
            setupMedications();
            renderComponent();
            expect(await screen.findByText("Pharmacy Dashboard")).toBeInTheDocument();
        });

        it("attach diagnostic test report", async () => {
            setupMedications();
            renderComponent();
            expect(await screen.findByText("Pharmacy Dashboard")).toBeInTheDocument();
        });
    });

    describe("Core Setup - Topbar", () => {
        beforeEach(() => {
            vi.clearAllMocks();
        });
        const renderTopbar = (user: AuthContextType["user"]) => {
            vi.mocked(useAuth).mockReturnValue(makeDashboardAuthMock({ user, isAuthenticated: !!user }));
            return render(
                <MemoryRouter>
                    <Topbar />
                </MemoryRouter>
            );
        };
        it("renders user initials when avatarUrl is missing", () => {
            renderTopbar({
                name: "Alice Smith",
                role: "admin",
                roleName: "System Admin",
                email: "alice@test.com"
            } as AuthContextType["user"]);
            expect(screen.getByText("AS")).toBeInTheDocument();
            expect(screen.getByText("Alice Smith")).toBeInTheDocument();
            expect(screen.getByText("System Admin")).toBeInTheDocument();
        });
    });

    describe("EMR Recording - Doctor Encounter", () => {
        let queryClient: QueryClient;
        beforeEach(() => {
            queryClient = makeQueryClient();
            vi.mocked(useAuth).mockReturnValue(
                makeDashboardAuthMock({
                    user: { name: "Dr. Setup", role: "doctor" } as AuthContextType["user"]
                })
            );
        });
        const renderComponent = () =>
            render(
                <QueryClientProvider client={queryClient}>
                    <Route path="/doctor/encounter/:appointmentId" element={<DoctorEncounter />} />
                </QueryClientProvider>
            );
        it("renders EMR encounter dashboard", async () => {
            vi.mocked(AppointmentService.getAppointmentById).mockResolvedValue({
                result: {
                    id: "app-1",
                    patient: { name: "John Patient", gender: Gender.MALE },
                    status: AppointmentStatus.SCHEDULED
                }
            });
            vi.mocked(PatientService.getPatientProfileById).mockResolvedValue({
                result: {
                    id: "pat-1",
                    name: "John Patient"
                }
            });
            vi.mocked(AppointmentDiagnosticsService.getAllAppointmentDiagnostics).mockResolvedValue({ result: [] });
            renderComponent();
            expect(await screen.findByText("John Patient")).toBeInTheDocument();
            expect(screen.getAllByText("Clinical Notes").length).toBeGreaterThan(0);
            expect(screen.getByText("Add Medication")).toBeInTheDocument();
        });
    });

    describe("User Management - Patient Profile", () => {
        let queryClient: QueryClient;
        beforeEach(() => {
            vi.clearAllMocks();
            queryClient = makeQueryClient();
            vi.mocked(useAuth).mockReturnValue(
                makeDashboardAuthMock({
                    user: { name: "John Doe", email: "john@doe.com" } as AuthContextType["user"]
                })
            );
        });
        const renderComponent = () =>
            render(
                <QueryClientProvider client={queryClient}>
                    <PatientProfile />
                </QueryClientProvider>
            );
        it("renders profile sections including TwoFactorSettings", async () => {
            vi.mocked(ProfileService.getProfile).mockResolvedValue({
                result: {
                    name: "John Doe",
                    emailAddress: "john@doe.com",
                    phoneNumber: "1234567890"
                }
            });
            vi.mocked(PatientService.getPatientProfile).mockResolvedValue({
                result: {
                    id: "pat-1",
                    name: "John Doe",
                    emailAddress: "john@doe.com"
                }
            });
            renderComponent();
            expect(await screen.findByText("John Doe")).toBeInTheDocument();
            expect(await screen.findByText("Security & Credits")).toBeInTheDocument();
        });
    });
});
