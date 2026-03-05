import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { AppointmentService, AppointmentStatus, DoctorService } from "@mediflow/mediflow-api";
import { PageHeader } from "@/components/ui/page-header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { StatusBadge, getStatusVariant } from "@/components/ui/status-badge";
import { Badge } from "@/components/ui/badge";
import { ListSkeleton } from "@/components/ui/loading-skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    CalendarCheck,
    CalendarIcon,
    CheckCircle2,
    Clock,
    ClipboardList,
    CreditCard,
    Search,
    XCircle,
    Play
} from "lucide-react";
import { format, isSameDay } from "date-fns";
import { combineDateAndTime } from "@/lib/datetime";
import { getAvatarUrl } from "@/lib/auth";

export default function DoctorAppointments() {
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<AppointmentStatus | "all">("all");
    const [paymentFilter, setPaymentFilter] = useState<"all" | "paid" | "unpaid">("all");

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

    const filteredAppointments = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        return appointmentsForDate.filter((apt) => {
            if (statusFilter !== "all" && apt.status !== statusFilter) return false;
            const isPaid = !!apt.isPaidViaGateway || !!apt.isPaidViaOfflineMedium;
            if (paymentFilter === "paid" && !isPaid) return false;
            if (paymentFilter === "unpaid" && isPaid) return false;
            if (!query) return true;
            const name = apt.patient?.name?.toLowerCase() || "";
            const email = apt.patient?.emailAddress?.toLowerCase() || "";
            const phone = apt.patient?.phoneNumber?.toLowerCase() || "";
            return name.includes(query) || email.includes(query) || phone.includes(query);
        });
    }, [appointmentsForDate, searchQuery, statusFilter, paymentFilter]);

    const datesWithAppointments = useMemo(() => {
        return appointments
            .map((apt) => combineDateAndTime(apt.timeslot?.date, apt.timeslot?.startTime))
            .filter((d): d is Date => !!d);
    }, [appointments]);

    const stats = useMemo(() => {
        const now = new Date();
        const todayCount = appointments.filter((apt) => {
            const start = combineDateAndTime(apt.timeslot?.date, apt.timeslot?.startTime);
            return start ? isSameDay(start, now) : false;
        }).length;
        const upcomingCount = appointments.filter((apt) => {
            const start = combineDateAndTime(apt.timeslot?.date, apt.timeslot?.startTime);
            return start ? start > now && apt.status === AppointmentStatus.SCHEDULED : false;
        }).length;
        const completedCount = appointments.filter((apt) => apt.status === AppointmentStatus.COMPLETED).length;
        const cancelledCount = appointments.filter((apt) => apt.status === AppointmentStatus.CANCELED).length;
        const unpaidCount = appointments.filter((apt) => {
            const isPaid = !!apt.isPaidViaGateway || !!apt.isPaidViaOfflineMedium;
            return !isPaid && apt.status !== AppointmentStatus.CANCELED;
        }).length;

        return {
            total: appointments.length,
            today: todayCount,
            upcoming: upcomingCount,
            completed: completedCount,
            cancelled: cancelledCount,
            unpaid: unpaidCount
        };
    }, [appointments]);

    const dayStatusCounts = useMemo(() => {
        const scheduled = appointmentsForDate.filter((apt) => apt.status === AppointmentStatus.SCHEDULED).length;
        const completed = appointmentsForDate.filter((apt) => apt.status === AppointmentStatus.COMPLETED).length;
        const cancelled = appointmentsForDate.filter((apt) => apt.status === AppointmentStatus.CANCELED).length;
        return { scheduled, completed, cancelled };
    }, [appointmentsForDate]);

    const hasFilters = searchQuery.trim() || statusFilter !== "all" || paymentFilter !== "all";

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

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                <Card className="bg-primary/5 border-primary/20">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-xs uppercase tracking-wide text-muted-foreground">Total</p>
                            <p className="text-2xl font-semibold">{stats.total}</p>
                        </div>
                        <ClipboardList className="h-5 w-5 text-primary" />
                    </CardContent>
                </Card>
                <Card className="bg-emerald-50/60 border-emerald-200">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-xs uppercase tracking-wide text-muted-foreground">Today</p>
                            <p className="text-2xl font-semibold">{stats.today}</p>
                        </div>
                        <CalendarCheck className="h-5 w-5 text-emerald-600" />
                    </CardContent>
                </Card>
                <Card className="bg-amber-50/70 border-amber-200">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-xs uppercase tracking-wide text-muted-foreground">Upcoming</p>
                            <p className="text-2xl font-semibold">{stats.upcoming}</p>
                        </div>
                        <Clock className="h-5 w-5 text-amber-600" />
                    </CardContent>
                </Card>
                <Card className="bg-sky-50/70 border-sky-200">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-xs uppercase tracking-wide text-muted-foreground">Completed</p>
                            <p className="text-2xl font-semibold">{stats.completed}</p>
                        </div>
                        <CheckCircle2 className="h-5 w-5 text-sky-600" />
                    </CardContent>
                </Card>
                <Card className="bg-rose-50/70 border-rose-200">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-xs uppercase tracking-wide text-muted-foreground">Unpaid</p>
                            <p className="text-2xl font-semibold">{stats.unpaid}</p>
                        </div>
                        <CreditCard className="h-5 w-5 text-rose-600" />
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
                <div className="space-y-4">
                    <Card>
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

                    <Card>
                        <CardContent className="p-4 space-y-3">
                            <div>
                                <p className="text-xs uppercase tracking-wide text-muted-foreground">Day Summary</p>
                                <p className="text-sm font-medium">{format(selectedDate, "EEEE, MMMM d, yyyy")}</p>
                            </div>
                            <div className="space-y-2 text-sm">
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Scheduled</span>
                                    <Badge variant="secondary">{dayStatusCounts.scheduled}</Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Completed</span>
                                    <Badge className="bg-emerald-600 text-white hover:bg-emerald-600">
                                        {dayStatusCounts.completed}
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Canceled</span>
                                    <Badge variant="destructive">{dayStatusCounts.cancelled}</Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-4">
                    <Card>
                        <CardContent className="p-4 space-y-4">
                            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                                <div className="relative w-full lg:max-w-sm">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search patients, email, or phone"
                                        value={searchQuery}
                                        onChange={(event) => setSearchQuery(event.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                                <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
                                    <Select
                                        value={statusFilter}
                                        onValueChange={(value) => setStatusFilter(value as AppointmentStatus | "all")}
                                    >
                                        <SelectTrigger className="w-full sm:w-[170px]">
                                            <SelectValue placeholder="All Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Status</SelectItem>
                                            <SelectItem value={AppointmentStatus.SCHEDULED}>Scheduled</SelectItem>
                                            <SelectItem value={AppointmentStatus.COMPLETED}>Completed</SelectItem>
                                            <SelectItem value={AppointmentStatus.CANCELED}>Canceled</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Select
                                        value={paymentFilter}
                                        onValueChange={(value) => setPaymentFilter(value as "all" | "paid" | "unpaid")}
                                    >
                                        <SelectTrigger className="w-full sm:w-[170px]">
                                            <SelectValue placeholder="All Payments" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Payments</SelectItem>
                                            <SelectItem value="paid">Paid</SelectItem>
                                            <SelectItem value="unpaid">Unpaid</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                                <span className="text-muted-foreground">
                                    Showing {filteredAppointments.length} of {appointmentsForDate.length} appointments
                                </span>
                                {hasFilters && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                            setSearchQuery("");
                                            setStatusFilter("all");
                                            setPaymentFilter("all");
                                        }}
                                    >
                                        Clear filters
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {appointmentsForDate.length === 0 ? (
                        <EmptyState
                            icon={CalendarIcon}
                            title="No appointments"
                            description="No appointments scheduled for this date"
                        />
                    ) : filteredAppointments.length === 0 ? (
                        <EmptyState
                            icon={XCircle}
                            title="No results"
                            description="No appointments match your filters for this date"
                        />
                    ) : (
                        <div className="space-y-3">
                            {filteredAppointments
                                .sort((a, b) => {
                                    const aStart =
                                        combineDateAndTime(a.timeslot?.date, a.timeslot?.startTime)?.getTime() || 0;
                                    const bStart =
                                        combineDateAndTime(b.timeslot?.date, b.timeslot?.startTime)?.getTime() || 0;
                                    return aStart - bStart;
                                })
                                .map((apt) => {
                                    const start = combineDateAndTime(apt.timeslot?.date, apt.timeslot?.startTime);
                                    const end = combineDateAndTime(apt.timeslot?.date, apt.timeslot?.endTime);
                                    const patientInitials =
                                        apt.patient?.name
                                            ?.split(" ")
                                            .map((n) => n[0])
                                            .join("")
                                            .slice(0, 2) || "P";
                                    const isPaid = !!apt.isPaidViaGateway || !!apt.isPaidViaOfflineMedium;

                                    return (
                                        <Card key={apt.id} className="card-interactive border-primary/10">
                                            <CardContent className="p-4">
                                                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                                    <div className="flex gap-4">
                                                        <Avatar className="h-12 w-12 ring-2 ring-primary/10">
                                                            <AvatarImage
                                                                src={getAvatarUrl(apt.patient?.profileImage?.fileUrl)}
                                                                alt={apt.patient?.name || "Patient"}
                                                            />
                                                            <AvatarFallback className="bg-primary/10 text-primary font-medium">
                                                                {patientInitials}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className="space-y-1">
                                                            <div className="flex flex-wrap items-center gap-2">
                                                                <h3 className="font-semibold">
                                                                    {apt.patient?.name || "Patient"}
                                                                </h3>
                                                                <Badge
                                                                    variant={isPaid ? "secondary" : "outline"}
                                                                    className={
                                                                        isPaid
                                                                            ? "bg-emerald-600 text-white hover:bg-emerald-600"
                                                                            : "border-rose-200 text-rose-600"
                                                                    }
                                                                >
                                                                    {isPaid ? "Paid" : "Unpaid"}
                                                                </Badge>
                                                            </div>
                                                            <div className="text-sm text-muted-foreground">
                                                                {apt.patient?.emailAddress || "No email on file"}
                                                            </div>
                                                            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                                                                {start && end && (
                                                                    <span className="flex items-center gap-1">
                                                                        <Clock className="h-3 w-3" />
                                                                        {format(start, "h:mm a")} -{" "}
                                                                        {format(end, "h:mm a")}
                                                                    </span>
                                                                )}
                                                                {apt.patient?.phoneNumber && (
                                                                    <span>• {apt.patient.phoneNumber}</span>
                                                                )}
                                                                <span>
                                                                    •{" "}
                                                                    <StatusBadge
                                                                        variant={getStatusVariant(
                                                                            apt.status || "scheduled"
                                                                        )}
                                                                    >
                                                                        {apt.status}
                                                                    </StatusBadge>
                                                                </span>
                                                            </div>
                                                            {apt.notes && (
                                                                <p className="text-sm text-muted-foreground">
                                                                    {apt.notes}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <Button size="sm" variant="outline" asChild>
                                                            <Link to={`/doctor/appointments/${apt.id}`}>Details</Link>
                                                        </Button>
                                                        {apt.status === AppointmentStatus.SCHEDULED && (
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
