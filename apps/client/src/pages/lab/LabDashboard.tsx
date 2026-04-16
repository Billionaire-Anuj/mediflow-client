import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import type { EChartsOption } from "echarts";
import { AppointmentDiagnosticsService } from "@mediflow/mediflow-api";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge, getStatusVariant } from "@/components/ui/status-badge";
import { CardSkeleton } from "@/components/ui/loading-skeleton";
import { DashboardChart } from "@/components/ui/echarts";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowRight, CheckCircle2, ClipboardList, Clock3, FlaskConical, Microscope, UserRound } from "lucide-react";
import { eachDayOfInterval, endOfDay, format, isSameDay, startOfDay, subDays } from "date-fns";
import { combineDateAndTime } from "@/lib/datetime";
import { getAvatarUrl } from "@/lib/auth";

function getInitials(name?: string | null) {
    return (name || "P")
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
}

export default function LabDashboard() {
    const { data, isLoading } = useQuery({
        queryKey: ["lab-requests"],
        queryFn: async () => AppointmentDiagnosticsService.getAllAppointmentDiagnosticsList({})
    });

    const appointments = data?.result ?? [];
    const now = new Date();

    const diagnostics = useMemo(
        () =>
            appointments.flatMap((appointment) =>
                (appointment.diagnostics || []).map((diagnostic) => ({
                    appointment,
                    diagnostic,
                    start: combineDateAndTime(appointment.timeslot?.date, appointment.timeslot?.startTime)
                }))
            ),
        [appointments]
    );

    const stats = useMemo(() => {
        const total = diagnostics.length;
        const resulted = diagnostics.filter((item) => item.diagnostic.status === "Resulted").length;
        const inProcessing = diagnostics.filter((item) => item.diagnostic.status === "Collected").length;
        const cancelled = diagnostics.filter((item) => item.diagnostic.status === "Cancelled").length;
        const pending = total - resulted - inProcessing - cancelled;
        const testsQueued = diagnostics.reduce(
            (count, item) => count + (item.diagnostic.diagnosticTests?.length || 0),
            0
        );
        const assigned = diagnostics.filter((item) => !!item.diagnostic.labTechnician?.id).length;

        return {
            total,
            pending,
            inProcessing,
            resulted,
            cancelled,
            testsQueued,
            assigned
        };
    }, [diagnostics]);

    const trendOption = useMemo<EChartsOption>(() => {
        const days = eachDayOfInterval({
            start: startOfDay(subDays(now, 6)),
            end: endOfDay(now)
        });

        const labels = days.map((day) => format(day, "EEE"));
        const values = days.map((day) => diagnostics.filter((item) => item.start && isSameDay(item.start, day)).length);

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
    }, [diagnostics, now]);

    const statusOption = useMemo<EChartsOption>(
        () => ({
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
                        { value: stats.pending, name: "Pending", itemStyle: { color: "#f59e0b" } },
                        { value: stats.inProcessing, name: "Processing", itemStyle: { color: "#0ea5e9" } },
                        { value: stats.resulted, name: "Resulted", itemStyle: { color: "#16a34a" } },
                        { value: stats.cancelled, name: "Cancelled", itemStyle: { color: "#f97316" } }
                    ]
                }
            ]
        }),
        [stats.cancelled, stats.inProcessing, stats.pending, stats.resulted]
    );

    const urgentQueue = diagnostics
        .filter((item) => item.diagnostic.status !== "Resulted" && item.diagnostic.status !== "Cancelled")
        .slice()
        .sort((a, b) => {
            const aTime = a.start?.getTime() || 0;
            const bTime = b.start?.getTime() || 0;
            return aTime - bTime;
        })
        .slice(0, 5);

    if (isLoading) {
        return (
            <div className="space-y-6">
                <PageHeader title="Lab Dashboard" />
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
            <div className="rounded-[28px] border border-teal-100 bg-[radial-gradient(circle_at_top_right,_rgba(13,148,136,0.18),_transparent_34%),linear-gradient(135deg,_rgba(240,253,250,1),_rgba(255,255,255,1)_58%,_rgba(236,253,245,0.94))] p-6 shadow-sm">
                <PageHeader
                    title="Lab Dashboard"
                    description="A clearer view of request flow, workload, and what needs attention next."
                />
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-[1.45fr_1fr]">
                <Card className="bg-white/80 shadow-sm backdrop-blur">
                    <CardContent className="p-6">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="text-sm font-medium text-teal-700">Diagnostics flow</p>
                                <h2 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">
                                    {stats.pending > 0
                                        ? `${stats.pending} requests still need active handling`
                                        : "No backlog is waiting in the lab right now"}
                                </h2>
                                <p className="mt-2 max-w-2xl text-sm text-slate-600">
                                    Keep sample collection, processing, and result publication moving without losing
                                    sight of queued tests.
                                </p>
                            </div>
                            <div className="rounded-2xl bg-teal-100 p-3 text-teal-700">
                                <Microscope className="h-6 w-6" />
                            </div>
                        </div>
                        <div className="mt-6 grid gap-3 md:grid-cols-3">
                            <div className="rounded-2xl border border-amber-100 bg-amber-50/80 p-4">
                                <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Queued tests</p>
                                <p className="mt-2 text-3xl font-semibold text-slate-900">{stats.testsQueued}</p>
                            </div>
                            <div className="rounded-2xl border border-sky-100 bg-sky-50/80 p-4">
                                <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Assigned</p>
                                <p className="mt-2 text-3xl font-semibold text-slate-900">{stats.assigned}</p>
                            </div>
                            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/80 p-4">
                                <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Resulted</p>
                                <p className="mt-2 text-3xl font-semibold text-slate-900">{stats.resulted}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-sm">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs uppercase tracking-[0.18em] text-teal-600">Today</p>
                                <p className="mt-2 text-4xl font-semibold">{stats.total}</p>
                                <p className="mt-1 text-sm text-slate-600">Active diagnostic entries in view</p>
                            </div>
                            <div className="rounded-2xl bg-white/10 p-3">
                                <FlaskConical className="h-6 w-6 text-teal-600" />
                            </div>
                        </div>
                        <div className="mt-8 space-y-3">
                            <div className="flex items-center justify-between text-sm text-slate-600">
                                <span>Processing now</span>
                                <span className="font-medium">{stats.inProcessing}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm text-slate-600">
                                <span>Cancelled</span>
                                <span className="font-medium">{stats.cancelled}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm text-slate-600">
                                <span>Queue health</span>
                                <span className="font-medium">
                                    {stats.pending > stats.resulted ? "Needs focus" : "Stable"}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <Card className="border-amber-100">
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Pending</p>
                                <p className="mt-2 text-3xl font-semibold">{stats.pending}</p>
                            </div>
                            <div className="rounded-2xl bg-amber-100 p-3 text-amber-700">
                                <Clock3 className="h-5 w-5" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-sky-100">
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Processing</p>
                                <p className="mt-2 text-3xl font-semibold">{stats.inProcessing}</p>
                            </div>
                            <div className="rounded-2xl bg-sky-100 p-3 text-sky-700">
                                <ClipboardList className="h-5 w-5" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-emerald-100">
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Completed</p>
                                <p className="mt-2 text-3xl font-semibold">{stats.resulted}</p>
                            </div>
                            <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700">
                                <CheckCircle2 className="h-5 w-5" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-violet-100">
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Total tests</p>
                                <p className="mt-2 text-3xl font-semibold">{stats.testsQueued}</p>
                            </div>
                            <div className="rounded-2xl bg-violet-100 p-3 text-violet-700">
                                <Microscope className="h-5 w-5" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.15fr_0.95fr]">
                <Card className="border-border/60">
                    <CardHeader>
                        <CardTitle className="text-lg">Seven-Day Intake</CardTitle>
                        <p className="text-sm text-muted-foreground">
                            How many diagnostic requests entered the workflow each day.
                        </p>
                    </CardHeader>
                    <CardContent>
                        <DashboardChart option={trendOption} className="h-[300px]" />
                    </CardContent>
                </Card>
                <Card className="border-border/60">
                    <CardHeader>
                        <CardTitle className="text-lg">Status Mix</CardTitle>
                        <p className="text-sm text-muted-foreground">
                            A quick split between backlog, in-flight work, and published results.
                        </p>
                    </CardHeader>
                    <CardContent>
                        <DashboardChart option={statusOption} className="h-[300px]" />
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                <Card className="border-border/60">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-lg">Priority Queue</CardTitle>
                            <p className="text-sm text-muted-foreground">
                                The next requests that are still waiting on collection or results.
                            </p>
                        </div>
                        <Button variant="ghost" size="sm" asChild>
                            <Link to="/lab/requests">Open Requests</Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {urgentQueue.length === 0 ? (
                            <p className="py-8 text-center text-sm text-muted-foreground">
                                No pending lab requests are waiting right now.
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {urgentQueue.map(({ appointment, diagnostic, start }) => (
                                    <div
                                        key={diagnostic.id}
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
                                                    {(diagnostic.diagnosticTests || []).length} test
                                                    {(diagnostic.diagnosticTests || []).length === 1 ? "" : "s"}
                                                </p>
                                                <p className="mt-1 text-xs text-muted-foreground">
                                                    {start ? format(start, "MMM d, yyyy • h:mm a") : "No schedule set"}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <StatusBadge variant={getStatusVariant(diagnostic.status || "scheduled")}>
                                                {diagnostic.status}
                                            </StatusBadge>
                                            <Button size="sm" asChild>
                                                <Link to={`/lab/request/${diagnostic.id}`}>
                                                    Open
                                                    <ArrowRight className="ml-1 h-4 w-4" />
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
                        <CardTitle className="text-lg">Operational Notes</CardTitle>
                        <p className="text-sm text-muted-foreground">
                            Small prompts to help the lab keep a steady rhythm through the day.
                        </p>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="rounded-2xl border border-teal-100 bg-teal-50/70 p-4">
                            <p className="font-medium text-slate-900">Front-load collection work</p>
                            <p className="mt-1 text-sm text-slate-600">
                                Prioritize appointments waiting on collection so result processing can start earlier.
                            </p>
                        </div>
                        <div className="rounded-2xl border border-sky-100 bg-sky-50/70 p-4">
                            <p className="font-medium text-slate-900">Watch result publication</p>
                            <p className="mt-1 text-sm text-slate-600">
                                Completed reports are most useful when they are pushed back to care teams quickly.
                            </p>
                        </div>
                        <div className="rounded-2xl border border-violet-100 bg-violet-50/70 p-4">
                            <p className="font-medium text-slate-900">Balance technician assignments</p>
                            <p className="mt-1 text-sm text-slate-600">
                                {stats.assigned > 0
                                    ? `${stats.assigned} request entries already have a technician assigned.`
                                    : "No technician assignments are visible yet for the current set of requests."}
                            </p>
                        </div>
                        <div className="rounded-2xl border border-amber-100 bg-amber-50/70 p-4">
                            <div className="flex items-center gap-3">
                                <UserRound className="h-5 w-5 text-amber-700" />
                                <div>
                                    <p className="font-medium text-slate-900">Keep clinicians informed</p>
                                    <p className="mt-1 text-sm text-slate-600">
                                        When a backlog grows, quick communication helps reduce repeat follow-ups.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
