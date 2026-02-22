import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { AppointmentService, DoctorService, type AppointmentDto } from "@mediflow/mediflow-api";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { StatusBadge, getStatusVariant } from "@/components/ui/status-badge";
import { ListSkeleton } from "@/components/ui/loading-skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { CalendarIcon, Clock, Play } from "lucide-react";
import { format, isSameDay } from "date-fns";
import { combineDateAndTime } from "@/lib/datetime";

export default function DoctorAppointments() {
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());

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

    const appointmentsForDate = useMemo(() => {
        return appointments.filter((apt) => {
            const start = combineDateAndTime(apt.timeslot?.date, apt.timeslot?.startTime);
            return start ? isSameDay(start, selectedDate) : false;
        });
    }, [appointments, selectedDate]);

    const datesWithAppointments = useMemo(() => {
        return appointments
            .map((apt) => combineDateAndTime(apt.timeslot?.date, apt.timeslot?.startTime))
            .filter((d): d is Date => !!d);
    }, [appointments]);

    if (isLoading) {
        return (
            <div className="space-y-6">
                <PageHeader title="Appointments" />
                <ListSkeleton items={3} />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader title="Appointments" description="Manage your patient appointments" />

            <div className="grid gap-6 lg:grid-cols-3">
                <Card className="lg:col-span-1">
                    <CardContent className="p-4">
                        <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={(date) => date && setSelectedDate(date)}
                            className="rounded-md pointer-events-auto"
                            modifiers={{
                                hasAppointment: datesWithAppointments
                            }}
                            modifiersStyles={{
                                hasAppointment: {
                                    fontWeight: "bold",
                                    textDecoration: "underline",
                                    textDecorationColor: "hsl(var(--primary))"
                                }
                            }}
                        />
                    </CardContent>
                </Card>

                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold">{format(selectedDate, "EEEE, MMMM d, yyyy")}</h2>
                        <span className="text-sm text-muted-foreground">
                            {appointmentsForDate.length} appointment{appointmentsForDate.length !== 1 ? "s" : ""}
                        </span>
                    </div>

                    {appointmentsForDate.length === 0 ? (
                        <EmptyState
                            icon={CalendarIcon}
                            title="No appointments"
                            description="No appointments scheduled for this date"
                        />
                    ) : (
                        <div className="space-y-3">
                            {appointmentsForDate
                                .sort((a, b) => {
                                    const aStart = combineDateAndTime(a.timeslot?.date, a.timeslot?.startTime)?.getTime() || 0;
                                    const bStart = combineDateAndTime(b.timeslot?.date, b.timeslot?.startTime)?.getTime() || 0;
                                    return aStart - bStart;
                                })
                                .map((apt) => {
                                    const start = combineDateAndTime(apt.timeslot?.date, apt.timeslot?.startTime);
                                    const end = combineDateAndTime(apt.timeslot?.date, apt.timeslot?.endTime);
                                    return (
                                        <Card key={apt.id} className="card-interactive">
                                            <CardContent className="p-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex gap-4">
                                                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                                            <span className="font-medium text-primary">
                                                                {apt.patient?.name
                                                                    ?.split(" ")
                                                                    .map((n) => n[0])
                                                                    .join("") || "P"}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <h3 className="font-medium">{apt.patient?.name}</h3>
                                                            <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                                                                {start && (
                                                                    <span className="flex items-center gap-1">
                                                                        <Clock className="h-3 w-3" />
                                                                        {format(start, "h:mm a")}
                                                                    </span>
                                                                )}
                                                                {end && start && (
                                                                    <span>• {format(end, "h:mm a")}</span>
                                                                )}
                                                            </div>
                                                            {apt.notes && (
                                                                <p className="text-sm text-muted-foreground mt-1">{apt.notes}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <StatusBadge variant={getStatusVariant(apt.status || "scheduled")}>
                                                            {apt.status}
                                                        </StatusBadge>
                                                        {apt.status === "Scheduled" && (
                                                            <Button size="sm" asChild>
                                                                <Link to={`/doctor/encounter/${apt.id}`}>
                                                                    <Play className="h-4 w-4 mr-1" />
                                                                    Open
                                                                </Link>
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
