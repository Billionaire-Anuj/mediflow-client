import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { AppointmentService, PatientService } from "@mediflow/mediflow-api";
import { useAuth } from "@/contexts/AuthContext";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge, getStatusVariant } from "@/components/ui/status-badge";
import { CardSkeleton } from "@/components/ui/loading-skeleton";
import { Calendar, FileText, Stethoscope, Bell, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { combineDateAndTime } from "@/lib/datetime";

export default function PatientDashboard() {
    const { user } = useAuth();

    const { data: profileData } = useQuery({
        queryKey: ["patient-profile"],
        queryFn: async () => PatientService.getPatientProfile()
    });

    const patientId = profileData?.result?.id;

    const { data: appointmentsData, isLoading } = useQuery({
        queryKey: ["patient-appointments", patientId],
        enabled: !!patientId,
        queryFn: async () => AppointmentService.getAllAppointmentsList({ patientId })
    });

    const upcomingAppointment = useMemo(() => {
        const appointments = appointmentsData?.result ?? [];
        const upcoming = appointments
            .map((apt) => ({
                apt,
                start: combineDateAndTime(apt.timeslot?.date, apt.timeslot?.startTime)
            }))
            .filter((item) => item.start)
            .sort((a, b) => (a.start!.getTime() || 0) - (b.start!.getTime() || 0));
        return upcoming[0]?.apt || null;
    }, [appointmentsData]);

    if (isLoading) {
        return (
            <div className="space-y-6">
                <PageHeader title="Dashboard" />
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {[1, 2, 3, 4].map((i) => (
                        <CardSkeleton key={i} />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader
                title={`Welcome back, ${user?.name?.split(" ")[0]}`}
                description="Manage your healthcare from one place"
            />

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Link to="/patient/doctors">
                    <Card className="card-interactive h-full">
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                                <Stethoscope className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <p className="font-medium">Find Doctors</p>
                                <p className="text-sm text-muted-foreground">Book an appointment</p>
                            </div>
                        </CardContent>
                    </Card>
                </Link>

                <Link to="/patient/appointments">
                    <Card className="card-interactive h-full">
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className="h-12 w-12 rounded-xl bg-status-info-bg flex items-center justify-center">
                                <Calendar className="h-6 w-6 text-status-info" />
                            </div>
                            <div>
                                <p className="font-medium">Appointments</p>
                                <p className="text-sm text-muted-foreground">View schedule</p>
                            </div>
                        </CardContent>
                    </Card>
                </Link>

                <Link to="/patient/records">
                    <Card className="card-interactive h-full">
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className="h-12 w-12 rounded-xl bg-status-success-bg flex items-center justify-center">
                                <FileText className="h-6 w-6 text-status-success" />
                            </div>
                            <div>
                                <p className="font-medium">Medical Records</p>
                                <p className="text-sm text-muted-foreground">View history</p>
                            </div>
                        </CardContent>
                    </Card>
                </Link>

                <Link to="/patient/notifications">
                    <Card className="card-interactive h-full">
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className="h-12 w-12 rounded-xl bg-status-warning-bg flex items-center justify-center">
                                <Bell className="h-6 w-6 text-status-warning" />
                            </div>
                            <div>
                                <p className="font-medium">Notifications</p>
                                <p className="text-sm text-muted-foreground">Stay updated</p>
                            </div>
                        </CardContent>
                    </Card>
                </Link>
            </div>

            {upcomingAppointment && (
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-lg">Upcoming Appointment</CardTitle>
                        <Button variant="ghost" size="sm" asChild>
                            <Link to="/patient/appointments" className="gap-1">
                                View all <ArrowRight className="h-4 w-4" />
                            </Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-accent/50">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                                    <Stethoscope className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <p className="font-medium">{upcomingAppointment.doctor?.name}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {(upcomingAppointment.doctor?.specializations || [])
                                            .map((spec) => spec.title)
                                            .filter(Boolean)
                                            .join(", ") || "General Practitioner"}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                {upcomingAppointment.timeslot?.date && (
                                    <p className="font-medium">
                                        {format(new Date(upcomingAppointment.timeslot.date), "MMM d, yyyy")}
                                    </p>
                                )}
                                {upcomingAppointment.timeslot?.startTime && (
                                    <p className="text-sm text-muted-foreground">
                                        {upcomingAppointment.timeslot.startTime}
                                    </p>
                                )}
                            </div>
                            <StatusBadge variant={getStatusVariant(upcomingAppointment.status || "scheduled")}>
                                {upcomingAppointment.status}
                            </StatusBadge>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
