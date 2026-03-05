import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppointmentService, PatientService, type AppointmentDto } from "@mediflow/mediflow-api";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { StatusBadge, getStatusVariant } from "@/components/ui/status-badge";
import { ListSkeleton } from "@/components/ui/loading-skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { FileText, Pill, FlaskConical, User, Calendar, Clock } from "lucide-react";
import { format } from "date-fns";
import { combineDateAndTime } from "@/lib/datetime";
import { getDiagnosticReportUrl } from "@/lib/auth";

export default function PatientRecords() {
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

    const records = useMemo<AppointmentDto[]>(() => {
        return appointments
            .filter((apt) => apt.medicalRecords)
            .sort((a, b) => {
                const aDate = combineDateAndTime(a.timeslot?.date, a.timeslot?.startTime)?.getTime() || 0;
                const bDate = combineDateAndTime(b.timeslot?.date, b.timeslot?.startTime)?.getTime() || 0;
                return bDate - aDate;
            });
    }, [appointments]);

    const recordStats = useMemo(() => {
        const prescriptionOrders = records.reduce((sum, record) => sum + (record.medications?.length || 0), 0);
        const diagnosticOrders = records.reduce((sum, record) => sum + (record.diagnostics?.length || 0), 0);
        const totalDrugs = records.reduce(
            (sum, record) =>
                sum + (record.medications?.reduce((acc, med) => acc + (med.drugs?.length || 0), 0) || 0),
            0
        );
        const totalTests = records.reduce(
            (sum, record) =>
                sum +
                (record.diagnostics?.reduce((acc, diag) => acc + (diag.diagnosticTests?.length || 0), 0) || 0),
            0
        );

        return {
            totalRecords: records.length,
            prescriptionOrders,
            diagnosticOrders,
            totalDrugs,
            totalTests
        };
    }, [records]);

    if (isLoading) {
        return (
            <div className="space-y-6">
                <PageHeader
                    title="Medical Records"
                    description="View your encounters, prescriptions, and lab results"
                />
                <ListSkeleton items={3} />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="rounded-2xl border bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-6 shadow-sm">
                <PageHeader
                    title="Medical Records"
                    description="Your complete clinical history with prescriptions and diagnostic tests in one place."
                />
                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Card className="border-emerald-100 bg-white/80 shadow-none">
                        <CardContent className="p-4">
                            <p className="text-xs uppercase tracking-wide text-muted-foreground">Records</p>
                            <p className="text-2xl font-semibold">{recordStats.totalRecords}</p>
                            <p className="text-xs text-muted-foreground mt-1">Total Visits Documented</p>
                        </CardContent>
                    </Card>
                    <Card className="border-emerald-100 bg-white/80 shadow-none">
                        <CardContent className="p-4">
                            <p className="text-xs uppercase tracking-wide text-muted-foreground">Prescriptions</p>
                            <p className="text-2xl font-semibold">{recordStats.prescriptionOrders}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                {recordStats.totalDrugs} Medication Entries
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="border-emerald-100 bg-white/80 shadow-none">
                        <CardContent className="p-4">
                            <p className="text-xs uppercase tracking-wide text-muted-foreground">Diagnostics</p>
                            <p className="text-2xl font-semibold">{recordStats.diagnosticOrders}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                {recordStats.totalTests} Tests Prescribed
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="border-emerald-100 bg-white/80 shadow-none">
                        <CardContent className="p-4">
                            <p className="text-xs uppercase tracking-wide text-muted-foreground">Latest</p>
                            <p className="text-2xl font-semibold">
                                {records[0]
                                    ? format(
                                          combineDateAndTime(
                                              records[0].timeslot?.date,
                                              records[0].timeslot?.startTime
                                          ) || new Date(),
                                          "MMM d, yyyy"
                                      )
                                    : "No Records"}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                                {records[0]?.doctor?.name || "No doctor yet"}
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {records.length === 0 ? (
                <EmptyState
                    icon={FileText}
                    title="No medical records"
                    description="Your consultation records will appear here"
                />
            ) : (
                <Accordion type="multiple" className="space-y-4">
                    {records.map((record, index) => {
                        const start = combineDateAndTime(record.timeslot?.date, record.timeslot?.startTime);
                        const end = combineDateAndTime(record.timeslot?.date, record.timeslot?.endTime);
                        const medicationCount = record.medications?.reduce(
                            (total, med) => total + (med.drugs?.length || 0),
                            0
                        );
                        const diagnosticCount = record.diagnostics?.reduce(
                            (total, diag) => total + (diag.diagnosticTests?.length || 0),
                            0
                        );

                        return (
                            <AccordionItem
                                key={record.id || index}
                                value={record.id || `record-${index}`}
                                className="border rounded-2xl bg-card shadow-sm transition hover:border-primary/40"
                            >
                                <AccordionTrigger className="px-5 py-5 hover:no-underline">
                                    <div className="flex w-full items-start content-between gap-3 text-left">
                                        <div className="flex items-start gap-4">
                                            <div className="h-11 w-11 rounded-2xl bg-primary/10 flex items-center justify-center">
                                                <User className="h-5 w-5 text-primary" />
                                            </div>
                                            <div className="text-left">
                                                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                                                    Medical Record
                                                </p>
                                                <p className="font-semibold text-base">
                                                    {record.doctor?.name || "Doctor"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="px-5 pb-5">
                                    <div className="grid gap-5 lg:grid-cols-[1.2fr_1fr]">
                                        <div className="space-y-5">
                                            <Card className="border-border/60 bg-white">
                                                <CardContent className="p-5 space-y-4">
                                                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                                        <div className="flex items-center gap-2">
                                                            <Calendar className="h-4 w-4" />
                                                            <span>
                                                                {start
                                                                    ? format(start, "MMMM d, yyyy")
                                                                    : "Date not set"}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Clock className="h-4 w-4" />
                                                            <span>
                                                                {start && end
                                                                    ? `${format(start, "h:mm a")} - ${format(end, "h:mm a")}`
                                                                    : "Time not set"}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <h4 className="font-medium mb-1">Notes</h4>
                                                        <p className="text-sm text-muted-foreground">
                                                            {record.medicalRecords?.notes || "No notes provided."}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <h4 className="font-medium mb-1">Diagnosis</h4>
                                                        <p className="text-sm">
                                                            {record.medicalRecords?.diagnosis || "Not specified"}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <h4 className="font-medium mb-1">Treatment Plan</h4>
                                                        <p className="text-sm text-muted-foreground">
                                                            {record.medicalRecords?.treatment || "Not specified"}
                                                        </p>
                                                    </div>
                                                    {record.medicalRecords?.prescriptions && (
                                                        <div>
                                                            <h4 className="font-medium mb-1">Prescriptions</h4>
                                                            <p className="text-sm text-muted-foreground">
                                                                {record.medicalRecords?.prescriptions}
                                                            </p>
                                                        </div>
                                                    )}
                                                </CardContent>
                                            </Card>

                                            {record.medications?.length ? (
                                                <Card className="border-border/60 bg-white">
                                                    <CardContent className="p-5 space-y-4">
                                                        <div className="flex items-center gap-2">
                                                            <Pill className="h-4 w-4 text-primary" />
                                                            <h4 className="font-medium">Prescriptions</h4>
                                                        </div>
                                                        {record.medications.map((med) => (
                                                            <div key={med.id} className="p-3 border rounded-xl">
                                                                <div className="flex items-center justify-between mb-2">
                                                                    <span className="text-sm font-medium">
                                                                        Medication Order
                                                                    </span>
                                                                    <StatusBadge
                                                                        variant={getStatusVariant(
                                                                            med.status || "pending"
                                                                        )}
                                                                    >
                                                                        {med.status}
                                                                    </StatusBadge>
                                                                </div>
                                                                <div className="space-y-2">
                                                                    {(med.drugs || []).map((item) => (
                                                                        <div key={item.id} className="text-sm">
                                                                            {item.medicine?.title} {item.dose}
                                                                            <span className="text-muted-foreground">
                                                                                {" "}
                                                                                • {item.frequency} • {item.duration}
                                                                            </span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                                {med.notes && (
                                                                    <p className="text-xs text-muted-foreground mt-2">
                                                                        {med.notes}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </CardContent>
                                                </Card>
                                            ) : null}
                                        </div>

                                        <div className="space-y-5">
                                            <Card className="border-border/60 bg-white">
                                                <CardContent className="p-5 space-y-2">
                                                    <h4 className="font-medium">Visit Details</h4>
                                                    <p className="text-sm text-muted-foreground">
                                                        Doctor: {record.doctor?.name || "Doctor"}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        Symptoms: {record.symptoms || "Not recorded"}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        Notes: {record.notes || "None"}
                                                    </p>
                                                </CardContent>
                                            </Card>

                                            {record.diagnostics?.length ? (
                                                <Card className="border-border/60 bg-white">
                                                    <CardContent className="p-5 space-y-4">
                                                        <div className="flex items-center gap-2">
                                                            <FlaskConical className="h-4 w-4 text-primary" />
                                                            <h4 className="font-medium">Diagnostic Tests</h4>
                                                        </div>
                                                        {record.diagnostics.map((diag) => (
                                                            <div key={diag.id} className="space-y-2">
                                                                <div className="flex items-center justify-between">
                                                                    <span className="text-sm font-medium">
                                                                        Lab Request
                                                                    </span>
                                                                    <StatusBadge
                                                                        variant={getStatusVariant(
                                                                            diag.status || "scheduled"
                                                                        )}
                                                                    >
                                                                        {diag.status}
                                                                    </StatusBadge>
                                                                </div>
                                                                <div className="border rounded-xl overflow-hidden">
                                                                    <table className="w-full text-sm">
                                                                        <thead className="bg-muted">
                                                                            <tr>
                                                                                <th className="text-left p-2 font-medium">
                                                                                    Test
                                                                                </th>
                                                                                <th className="text-left p-2 font-medium">
                                                                                    Value
                                                                                </th>
                                                                                <th className="text-left p-2 font-medium">
                                                                                    Reference
                                                                                </th>
                                                                                <th className="text-left p-2 font-medium">
                                                                                    Interpretation
                                                                                </th>
                                                                                <th className="text-left p-2 font-medium">
                                                                                    Report
                                                                                </th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody>
                                                                            {(diag.diagnosticTests || []).map(
                                                                                (result) => (
                                                                                    <tr
                                                                                        key={result.id}
                                                                                        className="border-t"
                                                                                    >
                                                                                        <td className="p-2">
                                                                                            {result.diagnosticTest
                                                                                                ?.title}
                                                                                        </td>
                                                                                        <td className="p-2">
                                                                                            {result.result?.value}{" "}
                                                                                            {result.result?.unit}
                                                                                        </td>
                                                                                        <td className="p-2 text-muted-foreground">
                                                                                            {result.result?.lowerRange}{" "}
                                                                                            - {result.result?.upperRange}
                                                                                        </td>
                                                                                        <td className="p-2">
                                                                                            {result.result?.interpretation ||
                                                                                                ""}
                                                                                        </td>
                                                                                        <td className="p-2">
                                                                                            {result.report?.fileUrl ? (
                                                                                                <a
                                                                                                    href={getDiagnosticReportUrl(
                                                                                                        result.report.fileUrl
                                                                                                    )}
                                                                                                    target="_blank"
                                                                                                    rel="noreferrer"
                                                                                                    className="text-sm text-primary underline-offset-4 hover:underline"
                                                                                                >
                                                                                                    Download
                                                                                                </a>
                                                                                            ) : (
                                                                                                <span className="text-xs text-muted-foreground">
                                                                                                    —
                                                                                                </span>
                                                                                            )}
                                                                                        </td>
                                                                                    </tr>
                                                                                )
                                                                            )}
                                                                        </tbody>
                                                                    </table>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </CardContent>
                                                </Card>
                                            ) : null}
                                        </div>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        );
                    })}
                </Accordion>
            )}
        </div>
    );
}
