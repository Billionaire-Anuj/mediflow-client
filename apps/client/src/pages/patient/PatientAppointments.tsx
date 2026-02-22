import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppointmentService, PatientService, type AppointmentDto } from "@mediflow/mediflow-api";
import { PageHeader } from "@/components/ui/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge, getStatusVariant } from "@/components/ui/status-badge";
import { ListSkeleton } from "@/components/ui/loading-skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Calendar, Clock } from "lucide-react";
import { format, isPast } from "date-fns";
import { combineDateAndTime } from "@/lib/datetime";
import { Link } from "react-router-dom";

export default function PatientAppointments() {
    const [activeTab, setActiveTab] = useState("upcoming");

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

    const appointments = appointmentsData?.result ?? [];

    const [upcomingAppointments, pastAppointments] = useMemo(() => {
        const upcoming: AppointmentDto[] = [];
        const past: AppointmentDto[] = [];

        appointments.forEach((apt) => {
            const start = combineDateAndTime(apt.timeslot?.date, apt.timeslot?.startTime);
            if (start && isPast(start)) {
                past.push(apt);
            } else {
                upcoming.push(apt);
            }
        });

        return [
            upcoming.sort(
                (a, b) =>
                    (combineDateAndTime(a.timeslot?.date, a.timeslot?.startTime)?.getTime() || 0) -
                    (combineDateAndTime(b.timeslot?.date, b.timeslot?.startTime)?.getTime() || 0)
            ),
            past.sort(
                (a, b) =>
                    (combineDateAndTime(b.timeslot?.date, b.timeslot?.startTime)?.getTime() || 0) -
                    (combineDateAndTime(a.timeslot?.date, a.timeslot?.startTime)?.getTime() || 0)
            )
        ];
    }, [appointments]);

    if (isLoading) {
        return (
            <div className="space-y-6">
                <PageHeader title="Appointments" description="Manage your upcoming and past appointments" />
                <ListSkeleton items={3} />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader title="Appointments" description="Manage your upcoming and past appointments" />

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList>
                    <TabsTrigger value="upcoming">Upcoming ({upcomingAppointments.length})</TabsTrigger>
                    <TabsTrigger value="past">Past ({pastAppointments.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="upcoming" className="space-y-4">
                    {upcomingAppointments.length === 0 ? (
                        <EmptyState
                            icon={Calendar}
                            title="No upcoming appointments"
                            description="Book an appointment with one of our doctors"
                            action={
                                <Button asChild variant="outline">
                                    <Link to="/patient/doctors">Find Doctors</Link>
                                </Button>
                            }
                        />
                    ) : (
                        upcomingAppointments.map((appointment) => {
                            const start = combineDateAndTime(
                                appointment.timeslot?.date,
                                appointment.timeslot?.startTime
                            );
                            const end = combineDateAndTime(
                                appointment.timeslot?.date,
                                appointment.timeslot?.endTime
                            );
                            return (
                                <Card key={appointment.id} className="card-interactive">
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex gap-4">
                                                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                                    <span className="font-medium text-primary">
                                                        {appointment.doctor?.name
                                                            ?.split(" ")
                                                            .map((n) => n[0])
                                                            .join("") || "D"}
                                                    </span>
                                                </div>
                                                <div>
                                                    <h3 className="font-medium">{appointment.doctor?.name}</h3>
                                                    <p className="text-sm text-muted-foreground">
                                                        {(appointment.doctor?.specializations || [])
                                                            .map((spec) => spec.title)
                                                            .filter(Boolean)
                                                            .join(", ") || "General Practitioner"}
                                                    </p>
                                                    <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                                                        {start && (
                                                            <span className="flex items-center gap-1">
                                                                <Calendar className="h-3 w-3" />
                                                                {format(start, "MMM d, yyyy")}
                                                            </span>
                                                        )}
                                                        {start && (
                                                            <span className="flex items-center gap-1">
                                                                <Clock className="h-3 w-3" />
                                                                {format(start, "h:mm a")}
                                                                {end ? ` - ${format(end, "h:mm a")}` : ""}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {appointment.notes && (
                                                        <p className="text-sm text-muted-foreground mt-1">
                                                            {appointment.notes}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <StatusBadge variant={getStatusVariant(appointment.status || "scheduled")}
                                            >
                                                {appointment.status}
                                            </StatusBadge>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })
                    )}
                </TabsContent>

                <TabsContent value="past" className="space-y-4">
                    {pastAppointments.length === 0 ? (
                        <EmptyState
                            icon={Calendar}
                            title="No past appointments"
                            description="Your completed appointments will appear here"
                        />
                    ) : (
                        pastAppointments.map((appointment) => {
                            const start = combineDateAndTime(
                                appointment.timeslot?.date,
                                appointment.timeslot?.startTime
                            );
                            return (
                                <Card key={appointment.id} className="card-interactive">
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="font-medium">{appointment.doctor?.name}</h3>
                                                <p className="text-sm text-muted-foreground">
                                                    {(appointment.doctor?.specializations || [])
                                                        .map((spec) => spec.title)
                                                        .filter(Boolean)
                                                        .join(", ") || "General Practitioner"}
                                                </p>
                                                {start && (
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        {format(start, "MMM d, yyyy")}
                                                    </p>
                                                )}
                                            </div>
                                            <StatusBadge variant={getStatusVariant(appointment.status || "completed")}
                                            >
                                                {appointment.status}
                                            </StatusBadge>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })
                    )}
                </TabsContent>
            </Tabs>

            {appointments.length === 0 && (
                <div className="flex justify-center">
                    <Button asChild variant="outline">
                        <Link to="/patient/doctors">Find a Doctor</Link>
                    </Button>
                </div>
            )}
        </div>
    );
}
