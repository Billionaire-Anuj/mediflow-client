import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { AppointmentService, DoctorService, type AppointmentDto } from "@mediflow/mediflow-api";
import { useAuth } from "@/contexts/AuthContext";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge, getStatusVariant } from "@/components/ui/status-badge";
import { CardSkeleton } from "@/components/ui/loading-skeleton";
import { Calendar, Users, FileText, Pill, Clock, ArrowRight, Play } from "lucide-react";
import { format, isSameDay, subDays, isAfter } from "date-fns";
import { combineDateAndTime } from "@/lib/datetime";

export default function DoctorDashboard() {
    const { user } = useAuth();

    const { data: doctorProfile } = useQuery({
        queryKey: ["doctor-profile"],
        queryFn: async () => DoctorService.getDoctorProfile()
    });

    const doctorId = doctorProfile?.result?.id;

    const { data: appointmentsData, isLoading } = useQuery({
        queryKey: ["doctor-appointments", doctorId],
        enabled: !!doctorId,
        queryFn: async () => AppointmentService.getAllAppointmentsList({ doctorId })
    });

    const appointments = appointmentsData?.result ?? [];

    const todayAppointments = useMemo(() => {
        return appointments.filter((apt) => {
            const start = combineDateAndTime(apt.timeslot?.date, apt.timeslot?.startTime);
            return start ? isSameDay(start, new Date()) : false;
        });
    }, [appointments]);

    const stats = useMemo(() => {
        const weekStart = subDays(new Date(), 7);
        const patientsSeen = new Set<string>();
        let pendingLabResults = 0;
        let prescriptionsCreated = 0;

        appointments.forEach((apt) => {
            const start = combineDateAndTime(apt.timeslot?.date, apt.timeslot?.startTime);
            if (start && isAfter(start, weekStart) && apt.patient?.id) {
                patientsSeen.add(apt.patient.id);
            }
            (apt.diagnostics || []).forEach((diag) => {
                if (diag.status && diag.status !== "Resulted") {
                    pendingLabResults += 1;
                }
            });
            prescriptionsCreated += (apt.medications || []).length;
        });

        return {
            appointmentsToday: todayAppointments.length,
            pendingLabResults,
            prescriptionsCreated,
            patientsSeenThisWeek: patientsSeen.size
        };
    }, [appointments, todayAppointments.length]);

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
                title={`Good ${new Date().getHours() < 12 ? "morning" : "afternoon"}, ${user?.name?.split(" ")[0]}`}
                description="Here's your schedule for today"
            />

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                                <Calendar className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{stats.appointmentsToday}</p>
                                <p className="text-sm text-muted-foreground">Appointments Today</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-xl bg-status-warning-bg flex items-center justify-center">
                                <FileText className="h-6 w-6 text-status-warning" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{stats.pendingLabResults}</p>
                                <p className="text-sm text-muted-foreground">Pending Lab Results</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-xl bg-status-success-bg flex items-center justify-center">
                                <Pill className="h-6 w-6 text-status-success" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{stats.prescriptionsCreated}</p>
                                <p className="text-sm text-muted-foreground">Prescriptions Created</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-xl bg-status-info-bg flex items-center justify-center">
                                <Users className="h-6 w-6 text-status-info" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{stats.patientsSeenThisWeek}</p>
                                <p className="text-sm text-muted-foreground">Patients This Week</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-lg">Today's Queue</CardTitle>
                    <Button variant="ghost" size="sm" asChild>
                        <Link to="/doctor/appointments" className="gap-1">
                            View all <ArrowRight className="h-4 w-4" />
                        </Link>
                    </Button>
                </CardHeader>
                <CardContent>
                    {todayAppointments.length === 0 ? (
                        <p className="text-center py-8 text-muted-foreground">No appointments scheduled for today</p>
                    ) : (
                        <div className="space-y-3">
                            {todayAppointments.slice(0, 5).map((apt, index) => {
                                const start = combineDateAndTime(apt.timeslot?.date, apt.timeslot?.startTime);
                                return (
                                    <div
                                        key={apt.id}
                                        className="flex items-center justify-between p-4 rounded-lg bg-accent/50 hover:bg-accent transition-colors"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary font-medium text-sm">
                                                {index + 1}
                                            </div>
                                            <div>
                                                <p className="font-medium">{apt.patient?.name}</p>
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <Clock className="h-3 w-3" />
                                                    {start ? format(start, "h:mm a") : ""}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <StatusBadge variant={getStatusVariant(apt.status || "scheduled")}>
                                                {apt.status}
                                            </StatusBadge>
                                            <Button size="sm" asChild>
                                                <Link to={`/doctor/encounter/${apt.id}`}>
                                                    <Play className="h-4 w-4 mr-1" />
                                                    Start
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
