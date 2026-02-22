import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ApiError } from "@mediflow/mediflow-api";
import "@/lib/api";

// Import of Internal CSS & Styling Configurations
import "./styles/app.css";
import "./styles/index.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";

// Public pages
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";

// Patient pages
import PatientDashboard from "./pages/patient/PatientDashboard";
import PatientDoctors from "./pages/patient/PatientDoctors";
import PatientAppointments from "./pages/patient/PatientAppointments";
import PatientRecords from "./pages/patient/PatientRecords";
import PatientNotifications from "./pages/patient/PatientNotifications";
import PatientProfile from "./pages/patient/PatientProfile";

// Doctor pages
import DoctorDashboard from "./pages/doctor/DoctorDashboard";
import DoctorAppointments from "./pages/doctor/DoctorAppointments";
import DoctorPatients from "./pages/doctor/DoctorPatients";
import DoctorPatientDetail from "./pages/doctor/DoctorPatientDetail";
import DoctorEncounter from "./pages/doctor/DoctorEncounter";

// Lab pages
import LabDashboard from "./pages/lab/LabDashboard";
import LabRequests from "./pages/lab/LabRequests";
import LabRequestDetail from "./pages/lab/LabRequestDetail";
import { Toaster as Sonner } from "@/components/ui/sonner";

// Pharmacy pages
import PharmacyDashboard from "./pages/pharmacy/PharmacyDashboard";
import PharmacyPrescriptions from "./pages/pharmacy/PharmacyPrescriptions";
import PharmacyPrescriptionDetail from "./pages/pharmacy/PharmacyPrescriptionDetail";

// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminDoctors from "./pages/admin/AdminDoctors";
import AdminConfig from "./pages/admin/AdminConfig";
import AdminReports from "./pages/admin/AdminReports";
import AdminAuditLogs from "./pages/admin/AdminAuditLogs";
import { AppShell } from "@/components/layout/AppShell";

const queryClient = new QueryClient({
    queryCache: new QueryCache({
        onError: (err) => {
            if (err instanceof ApiError && err.status === 401) {
                window.location.href = "/login";
            }
        }
    })
});

createRoot(document.getElementById("root") as HTMLElement).render(
    <StrictMode>
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <TooltipProvider>
                    <Toaster />
                    <Sonner />
                    <BrowserRouter>
                        <Routes>
                            {/* Public Routes */}
                            <Route path="/" element={<Landing />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />

                            {/* Patient Routes */}
                            <Route path="/patient" element={<AppShell allowedRoles={["patient"]} />}>
                                <Route index element={<Navigate to="/patient/dashboard" replace />} />
                                <Route path="dashboard" element={<PatientDashboard />} />
                                <Route path="doctors" element={<PatientDoctors />} />
                                <Route path="appointments" element={<PatientAppointments />} />
                                <Route path="records" element={<PatientRecords />} />
                                <Route path="notifications" element={<PatientNotifications />} />
                                <Route path="profile" element={<PatientProfile />} />
                            </Route>

                            {/* Doctor Routes */}
                            <Route path="/doctor" element={<AppShell allowedRoles={["doctor"]} />}>
                                <Route index element={<Navigate to="/doctor/dashboard" replace />} />
                                <Route path="dashboard" element={<DoctorDashboard />} />
                                <Route path="appointments" element={<DoctorAppointments />} />
                                <Route path="patients" element={<DoctorPatients />} />
                                <Route path="patient/:id" element={<DoctorPatientDetail />} />
                                <Route path="encounter/:appointmentId" element={<DoctorEncounter />} />
                                <Route path="profile" element={<PatientProfile />} />
                            </Route>

                            {/* Lab Routes */}
                            <Route path="/lab" element={<AppShell allowedRoles={["lab"]} />}>
                                <Route index element={<Navigate to="/lab/dashboard" replace />} />
                                <Route path="dashboard" element={<LabDashboard />} />
                                <Route path="requests" element={<LabRequests />} />
                                <Route path="request/:id" element={<LabRequestDetail />} />
                                <Route path="profile" element={<PatientProfile />} />
                            </Route>

                            {/* Pharmacy Routes */}
                            <Route path="/pharmacy" element={<AppShell allowedRoles={["pharmacist"]} />}>
                                <Route index element={<Navigate to="/pharmacy/dashboard" replace />} />
                                <Route path="dashboard" element={<PharmacyDashboard />} />
                                <Route path="prescriptions" element={<PharmacyPrescriptions />} />
                                <Route path="prescription/:id" element={<PharmacyPrescriptionDetail />} />
                                <Route path="profile" element={<PatientProfile />} />
                            </Route>

                            {/* Admin Routes */}
                            <Route path="/admin" element={<AppShell allowedRoles={["admin"]} />}>
                                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                                <Route path="dashboard" element={<AdminDashboard />} />
                                <Route path="users" element={<AdminUsers />} />
                                <Route path="doctors" element={<AdminDoctors />} />
                                <Route path="config" element={<AdminConfig />} />
                                <Route path="reports" element={<AdminReports />} />
                                <Route path="audit-logs" element={<AdminAuditLogs />} />
                                <Route path="profile" element={<PatientProfile />} />
                            </Route>

                            {/* Catch-all */}
                            <Route path="*" element={<NotFound />} />
                        </Routes>
                    </BrowserRouter>
                </TooltipProvider>
            </AuthProvider>
        </QueryClientProvider>
    </StrictMode>
);
