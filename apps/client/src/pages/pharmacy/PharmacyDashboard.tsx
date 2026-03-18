import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { EChartsOption } from "echarts";
import { AppointmentMedicationsService } from "@mediflow/mediflow-api";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge, getStatusVariant } from "@/components/ui/status-badge";
import { CardSkeleton } from "@/components/ui/loading-skeleton";
import { DashboardChart } from "@/components/ui/echarts";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowRight, CheckCircle2, ClipboardList, Clock3, Pill, ShoppingBag, UserRound } from "lucide-react";
import { eachDayOfInterval, endOfDay, format, isSameDay, startOfDay, subDays } from "date-fns";
import { toast } from "sonner";
import { getAvatarUrl } from "@/lib/auth";
import { getErrorMessage, getResponseMessage } from "@/lib/api";

function getInitials(name?: string | null) {
    return (name || "P")
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
}

export default function PharmacyDashboard() {
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ["pharmacy-prescriptions"],
        queryFn: async () => AppointmentMedicationsService.getAllAppointmentMedicationsList({})
    });

    const prescriptions = useMemo(() => {
        const list: {
            id: string;
            appointmentId?: string;
            patientName?: string | null;
            patientAvatar?: string | null;
            doctorName?: string | null;
            status?: string | null;
            itemCount: number;
            items: string[];
            assignedName?: string | null;
            createdAt?: string;
        }[] = [];

        (data?.result ?? []).forEach((appointment) => {
            (appointment.medications || []).forEach((medication) => {
                if (!medication.id) return;

                list.push({
                    id: medication.id,
                    appointmentId: appointment.id,
                    patientName: appointment.patient?.name,
                    patientAvatar: appointment.patient?.profileImage?.fileUrl,
                    doctorName: appointment.doctor?.name,
                    status: medication.status,
                    itemCount: medication.drugs?.length || 0,
                    items: (medication.drugs || [])
                        .map((drug) => `${drug.medicine?.title || "Medicine"} ${drug.dose || ""}`.trim())
                        .filter(Boolean),
                    assignedName:
                        medication.pharmacist?.name ||
                        medication.pharmacist?.username ||
                        medication.pharmacist?.emailAddress,
                    createdAt: appointment.bookedDate || appointment.timeslot?.date
                });
            });
        });

        return list;
    }, [data]);

    const dispenseMutation = useMutation({
        mutationFn: async (medicationId: string) =>
            AppointmentMedicationsService.dispenseAppointmentMedications({
                appointmentMedicationsId: medicationId
            }),
        onSuccess: (response) => {
            toast.success(getResponseMessage(response));
            queryClient.invalidateQueries({ queryKey: ["pharmacy-prescriptions"] });
        },
        onError: (error) => toast.error(getErrorMessage(error))
    });

    const stats = useMemo(() => {
        const total = prescriptions.length;
        const dispensed = prescriptions.filter((item) => item.status === "Collected").length;
        const cancelled = prescriptions.filter((item) => item.status === "Cancelled").length;
        const pending = total - dispensed - cancelled;
        const assigned = prescriptions.filter((item) => !!item.assignedName).length;
        const medicineItems = prescriptions.reduce((count, item) => count + item.itemCount, 0);

        return {
            total,
            dispensed,
            cancelled,
            pending,
            assigned,
            medicineItems
        };
    }, [prescriptions]);

    const now = new Date();

    const weeklyFlowOption = useMemo<EChartsOption>(() => {
        const days = eachDayOfInterval({
            start: startOfDay(subDays(now, 6)),
            end: endOfDay(now)
        });

        const labels = days.map((day) => format(day, "EEE"));
        const created = days.map((day) =>
            prescriptions.filter((item) => item.createdAt && isSameDay(new Date(item.createdAt), day)).length
        );
        const dispensed = days.map((day) =>
            prescriptions.filter((item) => item.status === "Collected" && item.createdAt && isSameDay(new Date(item.createdAt), day)).length
        );

        return {
            animationDuration: 700,
            legend: { top: 0, textStyle: { color: "#64748b" } },
            grid: { left: 24, right: 18, top: 40, bottom: 28 },
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
                    name: "Received",
                    type: "bar",
                    barWidth: 18,
                    data: created,
                    itemStyle: { color: "#0f766e", borderRadius: [8, 8, 0, 0] }
                },
                {
                    name: "Dispensed",
                    type: "bar",
                    barWidth: 18,
                    data: dispensed,
                    itemStyle: { color: "#16a34a", borderRadius: [8, 8, 0, 0] }
                }
            ]
        };
    }, [now, prescriptions]);

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
                        { value: stats.dispensed, name: "Dispensed", itemStyle: { color: "#16a34a" } },
                        { value: stats.cancelled, name: "Cancelled", itemStyle: { color: "#f97316" } }
                    ]
                }
            ]
        }),
        [stats.cancelled, stats.dispensed, stats.pending]
    );

    const actionQueue = prescriptions
        .filter((item) => item.status !== "Collected" && item.status !== "Cancelled")
        .slice()
        .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
        .slice(0, 5);

    if (isLoading) {
        return (
            <div className="space-y-6">
                <PageHeader title="Pharmacy Dashboard" />
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
            <div className="rounded-[28px] border border-emerald-100 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.18),_transparent_34%),linear-gradient(135deg,_rgba(240,253,250,1),_rgba(255,255,255,1)_58%,_rgba(236,253,245,0.92))] p-6 shadow-sm">
                <PageHeader
                    title="Pharmacy Dashboard"
                    description="Track prescription flow, dispensing activity, and the queue that needs action next."
                />
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-[1.45fr_1fr]">
                <Card className="bg-white/80 shadow-sm backdrop-blur">
                    <CardContent className="p-6">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="text-sm font-medium text-emerald-700">Dispensing overview</p>
                                <h2 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">
                                    {stats.pending > 0
                                        ? `${stats.pending} prescriptions still need dispensing`
                                        : "Everything pending has been cleared"}
                                </h2>
                                <p className="mt-2 max-w-2xl text-sm text-slate-600">
                                    Use the dashboard to keep turnaround crisp, spot backlog, and jump straight into
                                    high-priority prescriptions.
                                </p>
                            </div>
                            <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700">
                                <Pill className="h-6 w-6" />
                            </div>
                        </div>
                        <div className="mt-6 grid gap-3 md:grid-cols-3">
                            <div className="rounded-2xl border border-amber-100 bg-amber-50/80 p-4">
                                <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Pending queue</p>
                                <p className="mt-2 text-3xl font-semibold text-slate-900">{stats.pending}</p>
                            </div>
                            <div className="rounded-2xl border border-sky-100 bg-sky-50/80 p-4">
                                <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Assigned</p>
                                <p className="mt-2 text-3xl font-semibold text-slate-900">{stats.assigned}</p>
                            </div>
                            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/80 p-4">
                                <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Medicine items</p>
                                <p className="mt-2 text-3xl font-semibold text-slate-900">{stats.medicineItems}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-sm">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs uppercase tracking-[0.18em] text-emerald-600">
                                    Fulfilment snapshot
                                </p>
                                <p className="mt-2 text-4xl font-semibold">{stats.dispensed}</p>
                                <p className="mt-1 text-sm text-slate-600">Prescriptions already dispensed</p>
                            </div>
                            <div className="rounded-2xl bg-white/10 p-3">
                                <ShoppingBag className="h-6 w-6 text-emerald-700" />
                            </div>
                        </div>
                        <div className="mt-8 space-y-3">
                            <div className="flex items-center justify-between text-sm text-slate-600">
                                <span>Total prescriptions</span>
                                <span className="font-medium">{stats.total}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm text-slate-600">
                                <span>Cancelled</span>
                                <span className="font-medium">{stats.cancelled}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm text-slate-600">
                                <span>Service pace</span>
                                <span className="font-medium">
                                    {stats.dispensed >= stats.pending ? "On track" : "Needs focus"}
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
                <Card className="border-emerald-100">
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Dispensed</p>
                                <p className="mt-2 text-3xl font-semibold">{stats.dispensed}</p>
                            </div>
                            <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700">
                                <CheckCircle2 className="h-5 w-5" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-sky-100">
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Assigned</p>
                                <p className="mt-2 text-3xl font-semibold">{stats.assigned}</p>
                            </div>
                            <div className="rounded-2xl bg-sky-100 p-3 text-sky-700">
                                <UserRound className="h-5 w-5" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-violet-100">
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                                    Medicine lines
                                </p>
                                <p className="mt-2 text-3xl font-semibold">{stats.medicineItems}</p>
                            </div>
                            <div className="rounded-2xl bg-violet-100 p-3 text-violet-700">
                                <ClipboardList className="h-5 w-5" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.15fr_0.95fr]">
                <Card className="border-border/60">
                    <CardHeader>
                        <CardTitle className="text-lg">Seven-Day Prescription Flow</CardTitle>
                        <p className="text-sm text-muted-foreground">
                            Compare incoming prescriptions against completed dispensing activity.
                        </p>
                    </CardHeader>
                    <CardContent>
                        <DashboardChart option={weeklyFlowOption} className="h-[300px]" />
                    </CardContent>
                </Card>
                <Card className="border-border/60">
                    <CardHeader>
                        <CardTitle className="text-lg">Status Split</CardTitle>
                        <p className="text-sm text-muted-foreground">
                            A fast view of how much work is pending, completed, or cancelled.
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
                            <CardTitle className="text-lg">Action Queue</CardTitle>
                            <p className="text-sm text-muted-foreground">
                                Prescriptions that are still waiting to be dispensed.
                            </p>
                        </div>
                        <Button variant="ghost" size="sm" asChild>
                            <Link to="/pharmacist/prescriptions">Open Queue</Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {actionQueue.length === 0 ? (
                            <p className="py-8 text-center text-sm text-muted-foreground">
                                No pending prescriptions are waiting right now.
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {actionQueue.map((prescription) => (
                                    <div
                                        key={prescription.id}
                                        className="flex flex-col gap-4 rounded-2xl border bg-accent/20 p-4 md:flex-row md:items-center md:justify-between"
                                    >
                                        <div className="flex items-center gap-4">
                                            <Avatar className="h-12 w-12 ring-2 ring-primary/10">
                                                <AvatarImage
                                                    src={getAvatarUrl(prescription.patientAvatar)}
                                                    alt={prescription.patientName || "Patient"}
                                                />
                                                <AvatarFallback className="bg-primary/10 text-primary font-medium">
                                                    {getInitials(prescription.patientName)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-medium text-slate-900">{prescription.patientName}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {prescription.doctorName} • {prescription.itemCount} item
                                                    {prescription.itemCount === 1 ? "" : "s"}
                                                </p>
                                                <p className="mt-1 text-xs text-muted-foreground">
                                                    {prescription.createdAt
                                                        ? format(
                                                              new Date(prescription.createdAt),
                                                              "MMM d, yyyy • h:mm a"
                                                          )
                                                        : "No created date"}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <StatusBadge variant={getStatusVariant(prescription.status || "scheduled")}>
                                                {prescription.status}
                                            </StatusBadge>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => dispenseMutation.mutate(prescription.id)}
                                                disabled={
                                                    dispenseMutation.isPending ||
                                                    prescription.status === "Collected" ||
                                                    prescription.status === "Cancelled"
                                                }
                                            >
                                                Dispense
                                            </Button>
                                            <Button size="sm" asChild>
                                                <Link to={`/pharmacist/prescription/${prescription.id}`}>
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
                        <CardTitle className="text-lg">Service Notes</CardTitle>
                        <p className="text-sm text-muted-foreground">
                            A few practical prompts to help the counter move smoothly.
                        </p>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="rounded-2xl border border-teal-100 bg-teal-50/70 p-4">
                            <p className="font-medium text-slate-900">Clear ready prescriptions fast</p>
                            <p className="mt-1 text-sm text-slate-600">
                                A short wait at the dispensing stage helps the rest of the patient journey feel sharp.
                            </p>
                        </div>
                        <div className="rounded-2xl border border-sky-100 bg-sky-50/70 p-4">
                            <p className="font-medium text-slate-900">Double-check unassigned work</p>
                            <p className="mt-1 text-sm text-slate-600">
                                {stats.assigned < stats.total
                                    ? `${stats.total - stats.assigned} prescriptions do not yet show an assigned pharmacist.`
                                    : "All visible prescriptions already show a pharmacist assignment."}
                            </p>
                        </div>
                        <div className="rounded-2xl border border-violet-100 bg-violet-50/70 p-4">
                            <p className="font-medium text-slate-900">Watch for cancelled orders</p>
                            <p className="mt-1 text-sm text-slate-600">
                                Cancelled prescriptions should be removed from active dispensing focus quickly.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
