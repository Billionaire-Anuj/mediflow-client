import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge, getStatusVariant } from "@/components/ui/status-badge";
import { CardSkeleton } from "@/components/ui/loading-skeleton";
import { mockAppointments } from "@/mock/appointments";
import { Calendar, FileText, Stethoscope, Bell, ArrowRight } from "lucide-react";
import { format } from "date-fns";

export default function PatientDashboard() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [upcomingAppointment, setUpcomingAppointment] = useState<(typeof mockAppointments)[0] | null>(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            const upcoming = mockAppointments
                .filter((a) => a.patientId === "patient-1" && a.status === "booked")
                .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime())[0];
            setUpcomingAppointment(upcoming || null);
            setLoading(false);
        }, 400);
        return () => clearTimeout(timer);
    }, []);

    if (loading) {
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

            {/* Quick Actions */}
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
                                <p className="text-sm text-muted-foreground">2 unread</p>
                            </div>
                        </CardContent>
                    </Card>
                </Link>
            </div>

            {/* Upcoming Appointment */}
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
                                    <p className="font-medium">{upcomingAppointment.doctorName}</p>
                                    <p className="text-sm text-muted-foreground">{upcomingAppointment.department}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="font-medium">
                                    {format(new Date(upcomingAppointment.dateTime), "MMM d, yyyy")}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {format(new Date(upcomingAppointment.dateTime), "h:mm a")}
                                </p>
                            </div>
                            <StatusBadge variant={getStatusVariant(upcomingAppointment.status)}>
                                {upcomingAppointment.status}
                            </StatusBadge>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
