import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AppointmentService, DoctorService, PatientService, type AppointmentDto } from "@mediflow/mediflow-api";
import { PageHeader } from "@/components/ui/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge, getStatusVariant } from "@/components/ui/status-badge";
import { ListSkeleton } from "@/components/ui/loading-skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock } from "lucide-react";
import { format, isPast } from "date-fns";
import { combineDateAndTime } from "@/lib/datetime";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";

export default function PatientAppointments() {
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState("upcoming");
    const [canceling, setCanceling] = useState<AppointmentDto | null>(null);
    const [rescheduling, setRescheduling] = useState<AppointmentDto | null>(null);
    const [cancellationReason, setCancellationReason] = useState("");
    const [rescheduleDate, setRescheduleDate] = useState(format(new Date(), "yyyy-MM-dd"));
    const [rescheduleTimeslot, setRescheduleTimeslot] = useState("");

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

    const { data: timeslotsData } = useQuery({
        queryKey: ["reschedule-timeslots", rescheduling?.doctor?.id, rescheduleDate],
        enabled: !!rescheduling?.doctor?.id,
        queryFn: async () =>
            DoctorService.getDoctorTimeslotsById({
                doctorId: rescheduling!.doctor!.id || "",
                startDate: rescheduleDate,
                endDate: rescheduleDate
            })
    });

    const availableTimeslots = (timeslotsData?.result ?? []).filter((slot) => !slot.isBooked);

    const cancelMutation = useMutation({
        mutationFn: async (appointment: AppointmentDto) => {
            return AppointmentService.cancelAppointment({
                appointmentId: appointment.id || "",
                requestBody: {
                    appointmentId: appointment.id,
                    cancellationReason: cancellationReason || undefined
                }
            });
        },
        onSuccess: () => {
            toast.success("Appointment cancelled");
            setCanceling(null);
            setCancellationReason("");
            queryClient.invalidateQueries({ queryKey: ["patient-appointments", patientId] });
        },
        onError: () => toast.error("Failed to cancel appointment")
    });

    const updateMutation = useMutation({
        mutationFn: async (appointment: AppointmentDto) => {
            return AppointmentService.updateAppointment({
                appointmentId: appointment.id || "",
                requestBody: {
                    appointmentId: appointment.id,
                    timeslotId: rescheduleTimeslot,
                    notes: appointment.notes || undefined,
                    symptoms: appointment.symptoms || undefined
                }
            });
        },
        onSuccess: () => {
            toast.success("Appointment updated");
            setRescheduling(null);
            setRescheduleTimeslot("");
            queryClient.invalidateQueries({ queryKey: ["patient-appointments", patientId] });
        },
        onError: () => toast.error("Failed to update appointment")
    });

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
                            const end = combineDateAndTime(appointment.timeslot?.date, appointment.timeslot?.endTime);
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
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <StatusBadge
                                                    variant={getStatusVariant(appointment.status || "scheduled")}
                                                >
                                                    {appointment.status}
                                                </StatusBadge>
                                                {appointment.status === "Scheduled" && (
                                                    <>
                                                        <Button size="sm" variant="outline" asChild>
                                                            <Link to={`/patient/appointments/${appointment.id}`}>
                                                                Details
                                                            </Link>
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => {
                                                                setRescheduling(appointment);
                                                                setRescheduleTimeslot("");
                                                                setRescheduleDate(format(new Date(), "yyyy-MM-dd"));
                                                            }}
                                                        >
                                                            Reschedule
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="destructive"
                                                            onClick={() => setCanceling(appointment)}
                                                        >
                                                            Cancel
                                                        </Button>
                                                    </>
                                                )}
                                                {appointment.status !== "Scheduled" && (
                                                    <Button size="sm" variant="outline" asChild>
                                                        <Link to={`/patient/appointments/${appointment.id}`}>
                                                            Details
                                                        </Link>
                                                    </Button>
                                                )}
                                            </div>
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
                                            <div className="flex items-center gap-2">
                                                <StatusBadge
                                                    variant={getStatusVariant(appointment.status || "completed")}
                                                >
                                                    {appointment.status}
                                                </StatusBadge>
                                                <Button size="sm" variant="outline" asChild>
                                                    <Link to={`/patient/appointments/${appointment.id}`}>Details</Link>
                                                </Button>
                                            </div>
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

            <Dialog open={!!canceling} onOpenChange={() => setCanceling(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Cancel Appointment</DialogTitle>
                        <DialogDescription>Provide a reason for cancelling this appointment.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <Input
                            placeholder="Cancellation reason"
                            value={cancellationReason}
                            onChange={(e) => setCancellationReason(e.target.value)}
                        />
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setCanceling(null)}>
                                Close
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={() => canceling && cancelMutation.mutate(canceling)}
                                disabled={cancelMutation.isPending}
                            >
                                {cancelMutation.isPending ? "Cancelling..." : "Confirm Cancel"}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={!!rescheduling} onOpenChange={() => setRescheduling(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reschedule Appointment</DialogTitle>
                        <DialogDescription>Select a new date and time.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label className="text-sm font-medium">Date</Label>
                                <Input
                                    type="date"
                                    className="mt-1"
                                    value={rescheduleDate}
                                    onChange={(e) => setRescheduleDate(e.target.value)}
                                />
                            </div>
                            <div>
                                <Label className="text-sm font-medium">Time</Label>
                                <Select value={rescheduleTimeslot} onValueChange={setRescheduleTimeslot}>
                                    <SelectTrigger className="mt-1">
                                        <SelectValue placeholder="Select time" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-popover">
                                        {availableTimeslots.map((slot) => {
                                            const start = combineDateAndTime(slot.date, slot.startTime);
                                            return (
                                                <SelectItem key={slot.id} value={slot.id || ""}>
                                                    {start ? format(start, "h:mm a") : slot.startTime}
                                                </SelectItem>
                                            );
                                        })}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setRescheduling(null)}>
                                Close
                            </Button>
                            <Button
                                onClick={() => rescheduling && updateMutation.mutate(rescheduling)}
                                disabled={!rescheduleTimeslot || updateMutation.isPending}
                            >
                                {updateMutation.isPending ? "Updating..." : "Update Appointment"}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
