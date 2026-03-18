import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import type { EChartsOption } from "echarts";
import { AppointmentService, PatientService } from "@mediflow/mediflow-api";
import { useAuth } from "@/contexts/AuthContext";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge, getStatusVariant } from "@/components/ui/status-badge";
import { CardSkeleton } from "@/components/ui/loading-skeleton";
import { DashboardChart } from "@/components/ui/echarts";
import { Calendar, Coins, FileText, HeartPulse, Sparkles, Stethoscope } from "lucide-react";
import { eachMonthOfInterval, endOfMonth, format, isAfter, isSameDay, startOfMonth, subMonths } from "date-fns";
import { combineDateAndTime } from "@/lib/datetime";
import { getAvatarUrl } from "@/lib/auth";

export default function PatientDashboard() {
    const { user } = useAuth();

    const { data: profileData } = useQuery({
        queryKey: ["patient-profile"],
        queryFn: async () => PatientService.getPatientProfile()
    });

    const patientId = profileData?.result?.id;
    const creditPoints = profileData?.result?.creditPoints ?? 0;

    const { data: appointmentsData, isLoading } = useQuery({
        queryKey: ["patient-appointments", patientId],
        enabled: !!patientId,
        queryFn: async () => AppointmentService.getAllAppointmentsList({ patientId })
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

    const upcomingAppointments = useMemo(
        () =>
            appointmentMoments
                .filter((item) => item.start && isAfter(item.start, now) && item.apt.status !== "Canceled")
                .sort((a, b) => a.start!.getTime() - b.start!.getTime()),
        [appointmentMoments, now]
    );

    const upcomingAppointment = upcomingAppointments[0]?.apt || null;

    const stats = useMemo(() => {
        const completed = appointments.filter((apt) => apt.status === "Completed").length;
        const cancelled = appointments.filter((apt) => apt.status === "Canceled").length;
        const records = appointments.filter((apt) => apt.medicalRecords).length;
        const paid = appointments.filter((apt) => apt.isPaidViaGateway || apt.isPaidViaOfflineMedium).length;

        return {
            totalAppointments: appointments.length,
            upcoming: upcomingAppointments.length,
            completed,
            cancelled,
            records,
            paid
        };
    }, [appointments, upcomingAppointments.length]);

    const appointmentTrendOption = useMemo<EChartsOption>(() => {
        const months = eachMonthOfInterval({
            start: startOfMonth(subMonths(now, 5)),
            end: endOfMonth(now)
        });

        const values = months.map((month) => {
            const count = appointmentMoments.filter((item) => {
                if (!item.start) return false;
                return (
                    item.start.getMonth() === month.getMonth() && item.start.getFullYear() === month.getFullYear()
                );
            }).length;

            return count;
        });

        return {
            animationDuration: 700,
            grid: { left: 24, right: 16, top: 24, bottom: 28 },
            tooltip: {
                trigger: "axis",
                backgroundColor: "#0f172a",
                borderWidth: 0,
                textStyle: { color: "#f8fafc" }
            },
            xAxis: {
                type: "category",
                boundaryGap: false,
                data: months.map((month) => format(month, "MMM")),
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
                                { offset: 0, color: "rgba(20, 184, 166, 0.35)" },
                                { offset: 1, color: "rgba(20, 184, 166, 0.02)" }
                            ]
                        }
                    }
                }
            ]
        };
    }, [appointmentMoments, now]);

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
                    radius: ["54%", "76%"],
                    center: ["50%", "52%"],
                    label: { color: "#475569", formatter: "{b}\n{c}" },
                    itemStyle: { borderColor: "#ffffff", borderWidth: 4 },
                    data: [
                        { value: stats.upcoming, name: "Upcoming", itemStyle: { color: "#0f766e" } },
                        { value: stats.completed, name: "Completed", itemStyle: { color: "#16a34a" } },
                        { value: stats.cancelled, name: "Canceled", itemStyle: { color: "#f97316" } }
                    ]
                }
            ]
        }),
        [stats.cancelled, stats.completed, stats.upcoming]
    );

    const recentRecords = appointments
        .filter((apt) => apt.medicalRecords)
        .slice()
        .sort((a, b) => {
            const aTime = combineDateAndTime(a.timeslot?.date, a.timeslot?.startTime)?.getTime() || 0;
            const bTime = combineDateAndTime(b.timeslot?.date, b.timeslot?.startTime)?.getTime() || 0;
            return bTime - aTime;
        })
        .slice(0, 3);

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
            <div className="rounded-[28px] border border-emerald-100 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.18),_transparent_38%),linear-gradient(135deg,_rgba(240,253,250,1),_rgba(255,255,255,1)_55%,_rgba(236,253,245,0.9))] p-6 shadow-sm">
                <PageHeader
                    title={`Welcome back, ${user?.name?.split(" ")[0]}`}
                    description="Your care journey, upcoming appointments, and medical progress in one place."
                />
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-[1.5fr_1fr]">
                <Card className="bg-white/80 shadow-sm backdrop-blur">
                    <CardContent className="p-6">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="text-sm font-medium text-emerald-700">Next step in your care</p>
                                <h2 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">
                                    {upcomingAppointment?.doctor?.name || "No upcoming appointment"}
                                </h2>
                                <p className="mt-2 max-w-xl text-sm text-slate-600">
                                    {upcomingAppointment
                                        ? upcomingAppointment.notes || "Your next visit is ready to review."
                                        : "Use the dashboard shortcuts to find a specialist and book your next visit."}
                                </p>
                            </div>
                            <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700">
                                <HeartPulse className="h-6 w-6" />
                            </div>
                        </div>

                        {upcomingAppointment ? (
                            <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4 md:flex-row md:items-center md:justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="h-14 w-14 overflow-hidden rounded-2xl bg-white ring-2 ring-emerald-100">
                                        {upcomingAppointment.doctor?.profileImage?.fileUrl ? (
                                            <img
                                                src={getAvatarUrl(upcomingAppointment.doctor.profileImage.fileUrl)}
                                                alt={upcomingAppointment.doctor.name || "Doctor"}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-emerald-700">
                                                {(upcomingAppointment.doctor?.name || "D")
                                                    .split(" ")
                                                    .map((value) => value[0])
                                                    .join("")
                                                    .slice(0, 2)}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-900">
                                            {(upcomingAppointment.doctor?.specializations || [])
                                                .map((spec) => spec.title)
                                                .filter(Boolean)
                                                .join(", ") || "General Practitioner"}
                                        </p>
                                        <p className="text-sm text-slate-600">
                                            {upcomingAppointment.timeslot?.date
                                                ? format(
                                                      new Date(upcomingAppointment.timeslot.date),
                                                      "EEEE, MMM d, yyyy"
                                                  )
                                                : ""}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex flex-wrap items-center gap-3">
                                    <StatusBadge variant={getStatusVariant(upcomingAppointment.status || "scheduled")}>
                                        {upcomingAppointment.status}
                                    </StatusBadge>
                                    <Button asChild>
                                        <Link to="/patient/appointments">Open Appointments</Link>
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="mt-6 flex flex-wrap gap-3">
                                <Button asChild>
                                    <Link to="/patient/doctors">Find Doctors</Link>
                                </Button>
                                <Button variant="outline" asChild>
                                    <Link to="/patient/records">Review Records</Link>
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="shadow-sm">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs uppercase tracking-[0.18em] text-emerald-600">Health Wallet</p>
                                <p className="mt-2 text-4xl font-semibold">{creditPoints.toFixed(0)}</p>
                                <p className="mt-1 text-sm text-slate-600">Available credits for payments</p>
                            </div>
                            <div className="rounded-2xl bg-white/10 p-3">
                                <Coins className="h-6 w-6 text-emerald-600" />
                            </div>
                        </div>
                        <div className="mt-8 space-y-3">
                            <div className="flex items-center justify-between text-sm text-slate-600">
                                <span>Paid appointments</span>
                                <span className="font-medium">{stats.paid}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm text-slate-600">
                                <span>Medical records</span>
                                <span className="font-medium">{stats.records}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm text-slate-600">
                                <span>Today</span>
                                <span className="font-medium">
                                    {upcomingAppointments.some((item) => item.start && isSameDay(item.start, now))
                                        ? "Visit scheduled"
                                        : "No visit today"}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <Card className="border-emerald-100">
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                                    Appointments
                                </p>
                                <p className="mt-2 text-3xl font-semibold">{stats.totalAppointments}</p>
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
                                <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Upcoming</p>
                                <p className="mt-2 text-3xl font-semibold">{stats.upcoming}</p>
                            </div>
                            <div className="rounded-2xl bg-sky-100 p-3 text-sky-700">
                                <Stethoscope className="h-5 w-5" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-violet-100">
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Completed</p>
                                <p className="mt-2 text-3xl font-semibold">{stats.completed}</p>
                            </div>
                            <div className="rounded-2xl bg-violet-100 p-3 text-violet-700">
                                <Sparkles className="h-5 w-5" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-amber-100">
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Records</p>
                                <p className="mt-2 text-3xl font-semibold">{stats.records}</p>
                            </div>
                            <div className="rounded-2xl bg-amber-100 p-3 text-amber-700">
                                <FileText className="h-5 w-5" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.25fr_0.95fr]">
                <Card className="border-border/60">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-lg">Appointment Activity</CardTitle>
                            <p className="text-sm text-muted-foreground">
                                How your visits have changed over the last six months.
                            </p>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <DashboardChart option={appointmentTrendOption} className="h-[300px]" />
                    </CardContent>
                </Card>

                <Card className="border-border/60">
                    <CardHeader>
                        <CardTitle className="text-lg">Visit Status Mix</CardTitle>
                        <p className="text-sm text-muted-foreground">
                            A quick look at completed, upcoming, and canceled visits.
                        </p>
                    </CardHeader>
                    <CardContent>
                        <DashboardChart option={statusOption} className="h-[300px]" />
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
                <Card className="border-border/60">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-lg">Recent Medical Records</CardTitle>
                            <p className="text-sm text-muted-foreground">
                                Recent diagnoses and treatment summaries from completed care.
                            </p>
                        </div>
                        <Button variant="ghost" size="sm" asChild>
                            <Link to="/patient/records">Open Records</Link>
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {recentRecords.length === 0 ? (
                            <p className="py-6 text-center text-sm text-muted-foreground">
                                Your records will appear here after consultations are completed.
                            </p>
                        ) : (
                            recentRecords.map((record) => (
                                <div key={record.id} className="rounded-2xl border bg-accent/30 p-4">
                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                        <div>
                                            <p className="font-medium">
                                                {record.medicalRecords?.diagnosis || "Consultation record"}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {record.doctor?.name} •{" "}
                                                {record.timeslot?.date
                                                    ? format(new Date(record.timeslot.date), "MMM d, yyyy")
                                                    : ""}
                                            </p>
                                        </div>
                                        <StatusBadge variant={getStatusVariant(record.status || "completed")}>
                                            {record.status}
                                        </StatusBadge>
                                    </div>
                                    <p className="mt-3 text-sm text-muted-foreground">
                                        {record.medicalRecords?.treatment ||
                                            record.medicalRecords?.notes ||
                                            "Treatment details will appear here."}
                                    </p>
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>

                <Card className="border-border/60">
                    <CardHeader>
                        <CardTitle className="text-lg">Quick Actions</CardTitle>
                        <p className="text-sm text-muted-foreground">Fast paths for common patient tasks.</p>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <Link to="/patient/doctors" className="block">
                            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4 transition hover:bg-emerald-50">
                                <p className="font-medium text-slate-900">Find a specialist</p>
                                <p className="mt-1 text-sm text-slate-600">
                                    Browse doctors, reviews, fees, and availability.
                                </p>
                            </div>
                        </Link>
                        <Link to="/patient/appointments" className="block">
                            <div className="rounded-2xl border border-sky-100 bg-sky-50/70 p-4 transition hover:bg-sky-50">
                                <p className="font-medium text-slate-900">Manage appointments</p>
                                <p className="mt-1 text-sm text-slate-600">
                                    Pay, reschedule, cancel, or review previous visits.
                                </p>
                            </div>
                        </Link>
                        <Link to="/patient/notifications" className="block">
                            <div className="rounded-2xl border border-amber-100 bg-amber-50/70 p-4 transition hover:bg-amber-50">
                                <p className="font-medium text-slate-900">Check notifications</p>
                                <p className="mt-1 text-sm text-slate-600">
                                    Keep up with confirmations, results, and reminders.
                                </p>
                            </div>
                        </Link>
                        <Link to="/patient/profile" className="block">
                            <div className="rounded-2xl border border-violet-100 bg-violet-50/70 p-4 transition hover:bg-violet-50">
                                <p className="font-medium text-slate-900">Update profile</p>
                                <p className="mt-1 text-sm text-slate-600">
                                    Refresh your photo, details, password, and wallet settings.
                                </p>
                            </div>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
