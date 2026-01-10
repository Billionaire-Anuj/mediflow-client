import { useState, useEffect } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge, getStatusVariant } from "@/components/ui/status-badge";
import { ListSkeleton } from "@/components/ui/loading-skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { mockAppointments, Appointment } from "@/mock/appointments";
import { Calendar, Clock, User, X } from "lucide-react";
import { format, isPast } from "date-fns";
import { toast } from "sonner";

export default function PatientAppointments() {
    const [loading, setLoading] = useState(true);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
    const [cancelAppointment, setCancelAppointment] = useState<Appointment | null>(null);
    const [cancelReason, setCancelReason] = useState("");

    useEffect(() => {
        const timer = setTimeout(() => {
            const patientAppointments = mockAppointments.filter((a) => a.patientId === "patient-1");
            setAppointments(patientAppointments);
            setLoading(false);
        }, 400);
        return () => clearTimeout(timer);
    }, []);

    const upcomingAppointments = appointments.filter((a) => a.status === "booked" && !isPast(new Date(a.dateTime)));
    const pastAppointments = appointments.filter((a) => a.status !== "booked" || isPast(new Date(a.dateTime)));

    const handleCancelAppointment = () => {
        if (!cancelAppointment) return;

        setAppointments((prev) =>
            prev.map((a) =>
                a.id === cancelAppointment.id
                    ? { ...a, status: "cancelled" as const, cancellationReason: cancelReason }
                    : a
            )
        );

        toast.success("Appointment cancelled", {
            description: "Your appointment has been cancelled successfully."
        });

        setCancelAppointment(null);
        setCancelReason("");
    };

    const AppointmentCard = ({ appointment }: { appointment: Appointment }) => (
        <Card className="card-interactive">
            <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-4">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <User className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <h3 className="font-medium">{appointment.doctorName}</h3>
                            <p className="text-sm text-muted-foreground">{appointment.department}</p>
                            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4" />
                                    {format(new Date(appointment.dateTime), "MMM d, yyyy")}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    {format(new Date(appointment.dateTime), "h:mm a")}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <StatusBadge variant={getStatusVariant(appointment.status)}>{appointment.status}</StatusBadge>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => setSelectedAppointment(appointment)}>
                                Details
                            </Button>
                            {appointment.status === "booked" && !isPast(new Date(appointment.dateTime)) && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-destructive hover:text-destructive"
                                    onClick={() => setCancelAppointment(appointment)}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );

    if (loading) {
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

            <Tabs defaultValue="upcoming" className="space-y-4">
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
                                <Button asChild>
                                    <a href="/patient/doctors">Find Doctors</a>
                                </Button>
                            }
                        />
                    ) : (
                        upcomingAppointments.map((apt) => <AppointmentCard key={apt.id} appointment={apt} />)
                    )}
                </TabsContent>

                <TabsContent value="past" className="space-y-4">
                    {pastAppointments.length === 0 ? (
                        <EmptyState
                            icon={Calendar}
                            title="No past appointments"
                            description="Your appointment history will appear here"
                        />
                    ) : (
                        pastAppointments.map((apt) => <AppointmentCard key={apt.id} appointment={apt} />)
                    )}
                </TabsContent>
            </Tabs>

            {/* Appointment Details Dialog */}
            <Dialog open={!!selectedAppointment} onOpenChange={() => setSelectedAppointment(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Appointment Details</DialogTitle>
                        <DialogDescription>
                            {selectedAppointment && format(new Date(selectedAppointment.dateTime), "MMMM d, yyyy")}
                        </DialogDescription>
                    </DialogHeader>
                    {selectedAppointment && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                                        <User className="h-6 w-6 text-primary" />
                                    </div>
                                    <div>
                                        <p className="font-medium">{selectedAppointment.doctorName}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {selectedAppointment.department}
                                        </p>
                                    </div>
                                </div>
                                <StatusBadge variant={getStatusVariant(selectedAppointment.status)}>
                                    {selectedAppointment.status}
                                </StatusBadge>
                            </div>

                            <div className="grid grid-cols-2 gap-4 p-4 bg-accent/50 rounded-lg">
                                <div>
                                    <p className="text-sm text-muted-foreground">Date</p>
                                    <p className="font-medium">
                                        {format(new Date(selectedAppointment.dateTime), "MMM d, yyyy")}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Time</p>
                                    <p className="font-medium">
                                        {format(new Date(selectedAppointment.dateTime), "h:mm a")}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Duration</p>
                                    <p className="font-medium">{selectedAppointment.duration} minutes</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Type</p>
                                    <p className="font-medium capitalize">{selectedAppointment.type}</p>
                                </div>
                            </div>

                            {selectedAppointment.notes && (
                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">Notes</p>
                                    <p className="text-sm">{selectedAppointment.notes}</p>
                                </div>
                            )}

                            {selectedAppointment.cancellationReason && (
                                <div className="p-3 bg-destructive/10 rounded-lg">
                                    <p className="text-sm font-medium text-destructive">Cancellation Reason</p>
                                    <p className="text-sm text-muted-foreground">
                                        {selectedAppointment.cancellationReason}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Cancel Confirmation Dialog */}
            <Dialog open={!!cancelAppointment} onOpenChange={() => setCancelAppointment(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Cancel Appointment</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to cancel this appointment with {cancelAppointment?.doctorName}?
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium">Reason for cancellation</label>
                            <Textarea
                                className="mt-1"
                                placeholder="Please provide a reason..."
                                value={cancelReason}
                                onChange={(e) => setCancelReason(e.target.value)}
                            />
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setCancelAppointment(null)}>
                                Keep Appointment
                            </Button>
                            <Button variant="destructive" onClick={handleCancelAppointment}>
                                Cancel Appointment
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
