import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppointmentService, UserService } from "@mediflow/mediflow-api";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { ListSkeleton } from "@/components/ui/loading-skeleton";
import { Users, Calendar, Pill } from "lucide-react";
import { isSameDay } from "date-fns";
import { combineDateAndTime } from "@/lib/datetime";

export default function AdminDashboard() {
    const { data: usersData, isLoading: usersLoading } = useQuery({
        queryKey: ["admin-users"],
        queryFn: async () => UserService.getAllUsersList({})
    });

    const { data: appointmentsData, isLoading: appointmentsLoading } = useQuery({
        queryKey: ["admin-appointments"],
        queryFn: async () => AppointmentService.getAllAppointmentsList({})
    });

    const users = usersData?.result ?? [];
    const appointments = appointmentsData?.result ?? [];

    const stats = useMemo(() => {
        const appointmentsToday = appointments.filter((apt) => {
            const start = combineDateAndTime(apt.timeslot?.date, apt.timeslot?.startTime);
            return start ? isSameDay(start, new Date()) : false;
        }).length;
        const prescriptionsThisWeek = appointments.reduce((count, apt) => count + (apt.medications?.length || 0), 0);
        const activeUsers = users.filter((u) => u.isActive).length;
        return {
            appointmentsToday,
            prescriptionsThisWeek,
            activeUsers
        };
    }, [appointments, users]);

    if (usersLoading || appointmentsLoading) {
        return (
            <div className="space-y-6">
                <PageHeader title="Admin Dashboard" />
                <ListSkeleton items={4} />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader title="Admin Dashboard" description="System overview and management" />

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                            <Calendar className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{stats.appointmentsToday}</p>
                            <p className="text-sm text-muted-foreground">Appointments Today</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-status-success-bg flex items-center justify-center">
                            <Pill className="h-6 w-6 text-status-success" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{stats.prescriptionsThisWeek}</p>
                            <p className="text-sm text-muted-foreground">Prescriptions</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-status-info-bg flex items-center justify-center">
                            <Users className="h-6 w-6 text-status-info" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{stats.activeUsers}</p>
                            <p className="text-sm text-muted-foreground">Active Users</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
