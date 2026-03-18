import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import type { EChartsOption } from "echarts";
import { AppointmentService, DoctorService } from "@mediflow/mediflow-api";
import { useAuth } from "@/contexts/AuthContext";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge, getStatusVariant } from "@/components/ui/status-badge";
import { CardSkeleton } from "@/components/ui/loading-skeleton";
import { DashboardChart } from "@/components/ui/echarts";
import {
    Activity,
    Calendar,
    FileText,
    Pill,
    Play,
    Star,
    Users
} from "lucide-react";
import { format, isAfter, isSameDay, startOfWeek, subDays } from "date-fns";
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
    const now = new Date();

    const appointmentMoments = useMemo(
        () =>
            appointments.map((apt) => ({
                apt,
                start: combineDateAndTime(apt.timeslot?.date, apt.timeslot?.startTime)
            })),
        [appointments]
    );

    const todayAppointments = useMemo(
        () => appointmentMoments.filter((item) => item.start && isSameDay(item.start, now)),
        [appointmentMoments, now]
    );

    const stats = useMemo(() => {
        const patientsSeen = new Set<string>();
        const pendingLabResults = appointments.reduce(
            (count, apt) => count + (apt.diagnostics?.filter((diag) => diag.status !== "Resulted").length || 0),
            0
        );
        const prescriptionOrders = appointments.reduce((count, apt) => count + (apt.medications?.length || 0), 0);
        const completionRate =
            appointments.length > 0
                ? Math.round((appointments.filter((apt) => apt.status === "Completed").length / appointments.length) * 100)
                : 0;

        appointments.forEach((apt) => {
            const start = combineDateAndTime(apt.timeslot?.date, apt.timeslot?.startTime);
            if (start && isAfter(start, subDays(now, 7)) && apt.patient?.id) {
                patientsSeen.add(apt.patient.id);
            }
        });

        return {
            appointmentsToday: todayAppointments.length,
            pendingLabResults,
            prescriptionOrders,
            patientsSeenThisWeek: patientsSeen.size,
            completionRate
        };
    }, [appointments, now, todayAppointments.length]);

    const weeklyLoadOption = useMemo<EChartsOption>(() => {
        const weekStart = startOfWeek(now, { weekStartsOn: 0 });
        const labels = Array.from({ length: 7 }, (_, index) => subDays(weekStart, 0 - index)).map((date) =>
            format(date, "EEE")
        );

        const values = Array.from({ length: 7 }, (_, index) => subDays(weekStart, 0 - index)).map((date) => {
            return appointmentMoments.filter((item) => item.start && isSameDay(item.start, date)).length;
        });

        return {
            animationDuration: 700,
            grid: { left: 24, right: 16, top: 18, bottom: 24 },
            tooltip: {
                trigger: "axis",
                backgroundColor: "#0f172a",
                borderWidth: 0,
                textStyle: { color: "#f8fafc" }
            },
            xAxis: {
                type: "category",
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
                    type: "bar",
                    barWidth: 26,
                    data: values,
                    itemStyle: {
                        color: {
                            type: "linear",
                            x: 0,
                            y: 0,
                            x2: 0,
                            y2: 1,
                            colorStops: [
                                { offset: 0, color: "#14b8a6" },
                                { offset: 1, color: "#0f766e" }
                            ]
                        },
                        borderRadius: [12, 12, 4, 4]
                    }
                }
            ]
        };
    }, [appointmentMoments, now]);

    const outcomeOption = useMemo<EChartsOption>(() => {
        const completed = appointments.filter((apt) => apt.status === "Completed").length;
        const scheduled = appointments.filter((apt) => apt.status === "Scheduled").length;
        const cancelled = appointments.filter((apt) => apt.status === "Canceled").length;

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
                        { value: scheduled, name: "Scheduled", itemStyle: { color: "#0f766e" } },
                        { value: completed, name: "Completed", itemStyle: { color: "#16a34a" } },
                        { value: cancelled, name: "Canceled", itemStyle: { color: "#f97316" } }
                    ]
                }
            ]
        };
    }, [appointments]);

    const nextUp = todayAppointments
        .slice()
        .sort((a, b) => a.start!.getTime() - b.start!.getTime())
        .slice(0, 5);

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
            <div className="rounded-[28px] border border-teal-100 bg-[radial-gradient(circle_at_top_right,_rgba(13,148,136,0.18),_transparent_32%),linear-gradient(135deg,_rgba(248,250,252,1),_rgba(255,255,255,1)_54%,_rgba(236,253,245,0.92))] p-6 shadow-sm">
                <PageHeader
                    title={`Good ${new Date().getHours() < 12 ? "morning" : new Date().getHours() < 16 ? "afternoon" : "evening"}, ${user?.name}`}
                    description="A sharper view of your schedule, patient flow, and care delivery for today."
                />
            </div>

            <Card className="border-0 bg-white/80 shadow-sm backdrop-blur">
                <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <p className="text-sm font-medium text-teal-700">Clinic pulse</p>
                            <h2 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">
                                {todayAppointments.length > 0
                                    ? `${todayAppointments.length} visits on your slate today`
                                    : "Your day is currently clear"}
                            </h2>
                            <p className="mt-2 max-w-xl text-sm text-slate-600">
                                {todayAppointments.length > 0
                                    ? "Review the queue, jump into encounters, and keep an eye on pending downstream work."
                                    : "Use the open space to refine schedules, review records, or follow up on pending labs and medications."}
                            </p>
                        </div>
                        <div className="rounded-2xl bg-teal-100 p-3 text-teal-700">
                            <Activity className="h-6 w-6" />
                        </div>
                    </div>
                    <div className="mt-6 grid gap-3 md:grid-cols-3">
                        <div className="rounded-2xl border border-teal-100 bg-teal-50/70 p-4">
                            <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Completion rate</p>
                            <p className="mt-2 text-3xl font-semibold text-slate-900">{stats.completionRate}%</p>
                        </div>
                        <div className="rounded-2xl border border-sky-100 bg-sky-50/70 p-4">
                            <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Patients this week</p>
                            <p className="mt-2 text-3xl font-semibold text-slate-900">{stats.patientsSeenThisWeek}</p>
                        </div>
                        <div className="rounded-2xl border border-violet-100 bg-violet-50/70 p-4">
                            <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Avg. rating</p>
                            <p className="mt-2 flex items-center gap-2 text-3xl font-semibold text-slate-900">
                                {(doctorProfile?.result?.averageRating ?? 0).toFixed(1)}
                                <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <Card className="border-emerald-100">
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Today</p>
                                <p className="mt-2 text-3xl font-semibold">{stats.appointmentsToday}</p>
                            </div>
                            <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700">
                                <Calendar className="h-5 w-5" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-sky-100">
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Patients</p>
                                <p className="mt-2 text-3xl font-semibold">{stats.patientsSeenThisWeek}</p>
                            </div>
                            <div className="rounded-2xl bg-sky-100 p-3 text-sky-700">
                                <Users className="h-5 w-5" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-violet-100">
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                                    Lab follow-up
                                </p>
                                <p className="mt-2 text-3xl font-semibold">{stats.pendingLabResults}</p>
                            </div>
                            <div className="rounded-2xl bg-violet-100 p-3 text-violet-700">
                                <FileText className="h-5 w-5" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-amber-100">
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Rx orders</p>
                                <p className="mt-2 text-3xl font-semibold">{stats.prescriptionOrders}</p>
                            </div>
                            <div className="rounded-2xl bg-amber-100 p-3 text-amber-700">
                                <Pill className="h-5 w-5" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.15fr_0.95fr]">
                <Card className="border-border/60">
                    <CardHeader>
                        <CardTitle className="text-lg">Weekly Appointment Load</CardTitle>
                        <p className="text-sm text-muted-foreground">
                            A day-by-day look at how your week is shaping up.
                        </p>
                    </CardHeader>
                    <CardContent>
                        <DashboardChart option={weeklyLoadOption} className="h-[300px]" />
                    </CardContent>
                </Card>

                <Card className="border-border/60">
                    <CardHeader>
                        <CardTitle className="text-lg">Outcome Split</CardTitle>
                        <p className="text-sm text-muted-foreground">
                            The balance between scheduled, completed, and canceled visits.
                        </p>
                    </CardHeader>
                    <CardContent>
                        <DashboardChart option={outcomeOption} className="h-[300px]" />
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                <Card className="border-border/60">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-lg">Today's Queue</CardTitle>
                            <p className="text-sm text-muted-foreground">Your next patients, ordered by visit time.</p>
                        </div>
                        <Button variant="ghost" size="sm" asChild>
                            <Link to="/doctor/appointments">Open Schedule</Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {nextUp.length === 0 ? (
                            <p className="py-8 text-center text-sm text-muted-foreground">
                                No appointments are scheduled for today.
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {nextUp.map(({ apt, start }, index) => (
                                    <div
                                        key={apt.id}
                                        className="flex flex-col gap-4 rounded-2xl border bg-accent/20 p-4 md:flex-row md:items-center md:justify-between"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-sm font-semibold text-primary">
                                                {index + 1}
                                            </div>
                                            <div>
                                                <p className="font-medium">{apt.patient?.name}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {start ? format(start, "h:mm a") : ""} •{" "}
                                                    {apt.symptoms || "General consultation"}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <StatusBadge variant={getStatusVariant(apt.status || "scheduled")}>
                                                {apt.status}
                                            </StatusBadge>
                                            <Button size="sm" asChild>
                                                <Link to={`/doctor/encounter/${apt.id}`}>
                                                    <Play className="mr-1 h-4 w-4" />
                                                    Start
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="border-border/60">
                    <CardHeader>
                        <CardTitle className="text-lg">Focus Areas</CardTitle>
                        <p className="text-sm text-muted-foreground">
                            Where your attention is likely to matter most next.
                        </p>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <Link
                            to="/doctor/patients"
                            className="block rounded-2xl border border-sky-100 bg-sky-50/70 p-4 transition hover:bg-sky-50"
                        >
                            <p className="font-medium text-slate-900">Review patient continuity</p>
                            <p className="mt-1 text-sm text-slate-600">
                                See recent patients, repeat visits, and ongoing follow-ups.
                            </p>
                        </Link>
                        <Link
                            to="/doctor/schedule"
                            className="block rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4 transition hover:bg-emerald-50"
                        >
                            <p className="font-medium text-slate-900">Tune availability</p>
                            <p className="mt-1 text-sm text-slate-600">
                                Refine slots, valid dates, and clinic coverage.
                            </p>
                        </Link>
                        <div className="rounded-2xl border border-violet-100 bg-violet-50/70 p-4">
                            <p className="font-medium text-slate-900">Pending lab coordination</p>
                            <p className="mt-1 text-sm text-slate-600">
                                {stats.pendingLabResults > 0
                                    ? `${stats.pendingLabResults} diagnostics still need final results or review.`
                                    : "No outstanding lab follow-up is waiting on you right now."}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
