import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import type { EChartsOption } from "echarts";
import { AppointmentService, UserService } from "@mediflow/mediflow-api";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge, getStatusVariant } from "@/components/ui/status-badge";
import { CardSkeleton } from "@/components/ui/loading-skeleton";
import { DashboardChart } from "@/components/ui/echarts";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Activity, ArrowRight, Calendar, Coins, ShieldCheck, Users, UserPlus2 } from "lucide-react";
import { eachMonthOfInterval, endOfMonth, format, isSameDay, startOfMonth, subMonths } from "date-fns";
import { combineDateAndTime } from "@/lib/datetime";
import { getAvatarUrl } from "@/lib/auth";

function getInitials(name?: string | null) {
    return (name || "U")
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
}

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
    const now = new Date();

    const stats = useMemo(() => {
        const appointmentsToday = appointments.filter((appointment) => {
            const start = combineDateAndTime(appointment.timeslot?.date, appointment.timeslot?.startTime);
            return start ? isSameDay(start, now) : false;
        }).length;

        const completedAppointments = appointments.filter((appointment) => appointment.status === "Completed").length;
        const cancelledAppointments = appointments.filter((appointment) => appointment.status === "Canceled").length;
        const gatewayPayments = appointments.filter((appointment) => appointment.isPaidViaGateway).length;
        const activeUsers = users.filter((user) => user.isActive).length;
        const patients = users.filter((user) => user.role?.name?.toLowerCase() === "patient").length;
        const doctors = users.filter((user) => user.role?.name?.toLowerCase() === "doctor").length;

        return {
            appointmentsToday,
            completedAppointments,
            cancelledAppointments,
            gatewayPayments,
            activeUsers,
            patients,
            doctors
        };
    }, [appointments, now, users]);

    const appointmentTrendOption = useMemo<EChartsOption>(() => {
        const months = eachMonthOfInterval({
            start: startOfMonth(subMonths(now, 5)),
            end: endOfMonth(now)
        });

        const labels = months.map((month) => format(month, "MMM"));
        const values = months.map(
            (month) =>
                appointments.filter((appointment) => {
                    const start = combineDateAndTime(appointment.timeslot?.date, appointment.timeslot?.startTime);
                    return (
                        !!start && start.getMonth() === month.getMonth() && start.getFullYear() === month.getFullYear()
                    );
                }).length
        );

        return {
            animationDuration: 700,
            grid: { left: 24, right: 18, top: 20, bottom: 28 },
            tooltip: {
                trigger: "axis",
                backgroundColor: "#0f172a",
                borderWidth: 0,
                textStyle: { color: "#f8fafc" }
            },
            xAxis: {
                type: "category",
                boundaryGap: false,
                data: labels,
                axisLine: { lineStyle: { color: "#cbd5e1" } },
                axisLabel: { color: "#64748b" }
            },
            yAxis: {
                type: "value",
                splitLine: { lineStyle: { color: "#e2e8f0" } },
                axisLabel: { color: "#64748b" }
            },
            series: [
                {
                    type: "line",
                    smooth: true,
                    data: values,
                    symbolSize: 8,
                    lineStyle: { width: 4, color: "#0f766e" },
                    itemStyle: { color: "#14b8a6" },
                    areaStyle: {
                        color: {
                            type: "linear",
                            x: 0,
                            y: 0,
                            x2: 0,
                            y2: 1,
                            colorStops: [
                                { offset: 0, color: "rgba(20, 184, 166, 0.34)" },
                                { offset: 1, color: "rgba(20, 184, 166, 0.04)" }
                            ]
                        }
                    }
                }
            ]
        };
    }, [appointments, now]);

    const roleDistributionOption = useMemo<EChartsOption>(() => {
        const roleMap = users.reduce<Record<string, number>>((acc, user) => {
            const role = user.role?.name || "Unknown";
            acc[role] = (acc[role] || 0) + 1;
            return acc;
        }, {});

        return {
            animationDuration: 700,
            tooltip: {
                trigger: "item",
                backgroundColor: "#0f172a",
                borderWidth: 0,
                textStyle: { color: "#f8fafc" }
            },
            series: [
                {
                    type: "pie",
                    radius: ["48%", "74%"],
                    center: ["50%", "52%"],
                    label: { color: "#475569", formatter: "{b}\n{c}" },
                    itemStyle: { borderColor: "#ffffff", borderWidth: 4 },
                    data: Object.entries(roleMap).map(([name, value], index) => ({
                        name,
                        value,
                        itemStyle: {
                            color: ["#0f766e", "#16a34a", "#0ea5e9", "#8b5cf6", "#f59e0b", "#f97316"][index % 6]
                        }
                    }))
                }
            ]
        };
    }, [users]);

    const paymentOption = useMemo<EChartsOption>(() => {
        const gateway = appointments.filter((appointment) => appointment.isPaidViaGateway).length;
        const offline = appointments.filter((appointment) => appointment.isPaidViaOfflineMedium).length;
        const unpaid = appointments.length - gateway - offline;

        return {
            animationDuration: 700,
            tooltip: {
                trigger: "item",
                backgroundColor: "#0f172a",
                borderWidth: 0,
                textStyle: { color: "#f8fafc" }
            },
            series: [
                {
                    type: "pie",
                    radius: ["48%", "74%"],
                    center: ["50%", "52%"],
                    label: { color: "#475569", formatter: "{b}\n{c}" },
                    itemStyle: { borderColor: "#ffffff", borderWidth: 4 },
                    data: [
                        { value: gateway, name: "Gateway", itemStyle: { color: "#0f766e" } },
                        { value: offline, name: "Offline", itemStyle: { color: "#16a34a" } },
                        { value: unpaid, name: "Unpaid", itemStyle: { color: "#f59e0b" } }
                    ]
                }
            ]
        };
    }, [appointments]);

    const recentAppointments = appointments
        .slice()
        .sort((a, b) => {
            const aTime = combineDateAndTime(a.timeslot?.date, a.timeslot?.startTime)?.getTime() || 0;
            const bTime = combineDateAndTime(b.timeslot?.date, b.timeslot?.startTime)?.getTime() || 0;
            return bTime - aTime;
        })
        .slice(0, 5);

    if (usersLoading || appointmentsLoading) {
        return (
            <div className="space-y-6">
                <PageHeader title="Admin Dashboard" />
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
            <div className="rounded-[28px] border border-teal-100 bg-[radial-gradient(circle_at_top_right,_rgba(13,148,136,0.16),_transparent_34%),linear-gradient(135deg,_rgba(240,253,250,1),_rgba(255,255,255,1)_58%,_rgba(236,253,245,0.94))] p-6 shadow-sm">
                <PageHeader
                    title="Admin Dashboard"
                    description="A higher-level view of user growth, appointment volume, and payment movement across the platform."
                />
                <div className="mt-6 grid gap-4 lg:grid-cols-[1.45fr_1fr]">
                    <Card className="border-0 bg-white/80 shadow-sm backdrop-blur">
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-sm font-medium text-teal-700">System snapshot</p>
                                    <h2 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">
                                        {stats.activeUsers} active users are currently visible in the system
                                    </h2>
                                    <p className="mt-2 max-w-2xl text-sm text-slate-600">
                                        Watch appointment load, user mix, and payment behaviour from one cleaner admin
                                        view.
                                    </p>
                                </div>
                                <div className="rounded-2xl bg-teal-100 p-3 text-teal-700">
                                    <ShieldCheck className="h-6 w-6" />
                                </div>
                            </div>
                            <div className="mt-6 grid gap-3 md:grid-cols-3">
                                <div className="rounded-2xl border border-emerald-100 bg-emerald-50/80 p-4">
                                    <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Patients</p>
                                    <p className="mt-2 text-3xl font-semibold text-slate-900">{stats.patients}</p>
                                </div>
                                <div className="rounded-2xl border border-sky-100 bg-sky-50/80 p-4">
                                    <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Doctors</p>
                                    <p className="mt-2 text-3xl font-semibold text-slate-900">{stats.doctors}</p>
                                </div>
                                <div className="rounded-2xl border border-violet-100 bg-violet-50/80 p-4">
                                    <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Gateway paid</p>
                                    <p className="mt-2 text-3xl font-semibold text-slate-900">
                                        {stats.gatewayPayments}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 bg-slate-950 text-white shadow-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs uppercase tracking-[0.18em] text-teal-300">Today's load</p>
                                    <p className="mt-2 text-4xl font-semibold">{stats.appointmentsToday}</p>
                                    <p className="mt-1 text-sm text-slate-300">Appointments scheduled for today</p>
                                </div>
                                <div className="rounded-2xl bg-white/10 p-3">
                                    <Calendar className="h-6 w-6 text-teal-300" />
                                </div>
                            </div>
                            <div className="mt-8 space-y-3">
                                <div className="flex items-center justify-between text-sm text-slate-300">
                                    <span>Completed</span>
                                    <span className="font-medium text-white">{stats.completedAppointments}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm text-slate-300">
                                    <span>Cancelled</span>
                                    <span className="font-medium text-white">{stats.cancelledAppointments}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm text-slate-300">
                                    <span>Platform health</span>
                                    <span className="font-medium text-white">
                                        {stats.cancelledAppointments > stats.completedAppointments / 2
                                            ? "Needs review"
                                            : "Steady"}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <Card className="border-emerald-100">
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Users</p>
                                <p className="mt-2 text-3xl font-semibold">{users.length}</p>
                            </div>
                            <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700">
                                <Users className="h-5 w-5" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-sky-100">
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                                    Appointments
                                </p>
                                <p className="mt-2 text-3xl font-semibold">{appointments.length}</p>
                            </div>
                            <div className="rounded-2xl bg-sky-100 p-3 text-sky-700">
                                <Activity className="h-5 w-5" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-amber-100">
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                                    Active users
                                </p>
                                <p className="mt-2 text-3xl font-semibold">{stats.activeUsers}</p>
                            </div>
                            <div className="rounded-2xl bg-amber-100 p-3 text-amber-700">
                                <UserPlus2 className="h-5 w-5" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-violet-100">
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Payments</p>
                                <p className="mt-2 text-3xl font-semibold">{stats.gatewayPayments}</p>
                            </div>
                            <div className="rounded-2xl bg-violet-100 p-3 text-violet-700">
                                <Coins className="h-5 w-5" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.15fr_0.95fr]">
                <Card className="border-border/60">
                    <CardHeader>
                        <CardTitle className="text-lg">Appointment Trend</CardTitle>
                        <p className="text-sm text-muted-foreground">
                            Monthly appointment movement over the last six months.
                        </p>
                    </CardHeader>
                    <CardContent>
                        <DashboardChart option={appointmentTrendOption} className="h-[300px]" />
                    </CardContent>
                </Card>
                <Card className="border-border/60">
                    <CardHeader>
                        <CardTitle className="text-lg">Role Distribution</CardTitle>
                        <p className="text-sm text-muted-foreground">
                            See how users are currently distributed across roles.
                        </p>
                    </CardHeader>
                    <CardContent>
                        <DashboardChart option={roleDistributionOption} className="h-[300px]" />
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                <Card className="border-border/60">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-lg">Recent Appointment Activity</CardTitle>
                            <p className="text-sm text-muted-foreground">
                                A quick scan of the most recent appointment records in the system.
                            </p>
                        </div>
                        <Button variant="ghost" size="sm" asChild>
                            <Link to="/admin/users">Open Users</Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {recentAppointments.length === 0 ? (
                            <p className="py-8 text-center text-sm text-muted-foreground">
                                No appointment activity is available yet.
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {recentAppointments.map((appointment) => {
                                    const start = combineDateAndTime(
                                        appointment.timeslot?.date,
                                        appointment.timeslot?.startTime
                                    );

                                    return (
                                        <div
                                            key={appointment.id}
                                            className="flex flex-col gap-4 rounded-2xl border bg-accent/20 p-4 md:flex-row md:items-center md:justify-between"
                                        >
                                            <div className="flex items-center gap-4">
                                                <Avatar className="h-12 w-12 ring-2 ring-primary/10">
                                                    <AvatarImage
                                                        src={getAvatarUrl(appointment.patient?.profileImage?.fileUrl)}
                                                        alt={appointment.patient?.name || "Patient"}
                                                    />
                                                    <AvatarFallback className="bg-primary/10 text-primary font-medium">
                                                        {getInitials(appointment.patient?.name)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium text-slate-900">
                                                        {appointment.patient?.name}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {appointment.doctor?.name} •{" "}
                                                        {start ? format(start, "MMM d, yyyy • h:mm a") : "No time set"}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-2">
                                                <StatusBadge
                                                    variant={getStatusVariant(appointment.status || "scheduled")}
                                                >
                                                    {appointment.status}
                                                </StatusBadge>
                                                <StatusBadge
                                                    variant={
                                                        appointment.isPaidViaGateway ||
                                                        appointment.isPaidViaOfflineMedium
                                                            ? "success"
                                                            : "warning"
                                                    }
                                                >
                                                    {appointment.isPaidViaGateway || appointment.isPaidViaOfflineMedium
                                                        ? "Paid"
                                                        : "Unpaid"}
                                                </StatusBadge>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="border-border/60">
                    <CardHeader>
                        <CardTitle className="text-lg">Payment Mix</CardTitle>
                        <p className="text-sm text-muted-foreground">
                            Compare gateway, offline, and unpaid appointment balances.
                        </p>
                    </CardHeader>
                    <CardContent>
                        <DashboardChart option={paymentOption} className="h-[300px]" />
                        <div className="mt-4 rounded-2xl border border-teal-100 bg-teal-50/70 p-4">
                            <p className="font-medium text-slate-900">Natural next admin checks</p>
                            <p className="mt-1 text-sm text-slate-600">
                                Review user creation, role balance, and appointment completion rate together to spot
                                operational gaps earlier.
                            </p>
                            <Button className="mt-4" size="sm" asChild>
                                <Link to="/admin/reports">
                                    Open Reports
                                    <ArrowRight className="ml-1 h-4 w-4" />
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
