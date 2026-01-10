import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { StatusBadge, getStatusVariant } from "@/components/ui/status-badge";
import { ListSkeleton } from "@/components/ui/loading-skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { mockAppointments, Appointment } from "@/mock/appointments";
import { CalendarIcon, Clock, Play, CheckCircle } from "lucide-react";
import { format, isSameDay } from "date-fns";
import { toast } from "sonner";

export default function DoctorAppointments() {
    const [loading, setLoading] = useState(true);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());

    useEffect(() => {
        const timer = setTimeout(() => {
            const doctorAppointments = mockAppointments.filter((a) => a.doctorId === "doctor-1");
            setAppointments(doctorAppointments);
            setLoading(false);
        }, 400);
        return () => clearTimeout(timer);
    }, []);

    const appointmentsForDate = appointments.filter((apt) => isSameDay(new Date(apt.dateTime), selectedDate));

    const handleMarkCompleted = (apt: Appointment) => {
        setAppointments((prev) => prev.map((a) => (a.id === apt.id ? { ...a, status: "completed" as const } : a)));
        toast.success("Appointment marked as completed");
    };

    // Get dates with appointments for calendar highlighting
    const datesWithAppointments = appointments.map((a) => new Date(a.dateTime));

    if (loading) {
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
                {/* Calendar */}
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

                {/* Appointments List */}
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
                                .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime())
                                .map((apt) => (
                                    <Card key={apt.id} className="card-interactive">
                                        <CardContent className="p-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex gap-4">
                                                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                                        <span className="font-medium text-primary">
                                                            {apt.patientName
                                                                .split(" ")
                                                                .map((n) => n[0])
                                                                .join("")}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <h3 className="font-medium">{apt.patientName}</h3>
                                                        <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                                                            <span className="flex items-center gap-1">
                                                                <Clock className="h-3 w-3" />
                                                                {format(new Date(apt.dateTime), "h:mm a")}
                                                            </span>
                                                            <span>•</span>
                                                            <span>{apt.duration} min</span>
                                                            <span>•</span>
                                                            <span className="capitalize">{apt.type}</span>
                                                        </div>
                                                        {apt.notes && (
                                                            <p className="text-sm text-muted-foreground mt-1">
                                                                {apt.notes}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <StatusBadge variant={getStatusVariant(apt.status)}>
                                                        {apt.status}
                                                    </StatusBadge>
                                                    {apt.status === "booked" && (
                                                        <>
                                                            <Button size="sm" asChild>
                                                                <Link to={`/doctor/encounter/${apt.id}`}>
                                                                    <Play className="h-4 w-4 mr-1" />
                                                                    Open
                                                                </Link>
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => handleMarkCompleted(apt)}
                                                            >
                                                                <CheckCircle className="h-4 w-4" />
                                                            </Button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
