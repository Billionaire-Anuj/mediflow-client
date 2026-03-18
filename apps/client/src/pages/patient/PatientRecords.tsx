import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppointmentService, PatientService, type AppointmentDto } from "@mediflow/mediflow-api";
import type { DateRange } from "react-day-picker";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { StatusBadge, getStatusVariant } from "@/components/ui/status-badge";
import { ListSkeleton } from "@/components/ui/loading-skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DateRangePicker } from "@/components/ui/date-picker";
import {
    Calendar,
    Clock,
    Download,
    FileText,
    Filter,
    FlaskConical,
    Pill,
    Search,
    User
} from "lucide-react";
import { format, isAfter, isBefore, startOfDay } from "date-fns";
import { combineDateAndTime } from "@/lib/datetime";
import { getDiagnosticReportUrl } from "@/lib/auth";
import { toast } from "sonner";

function normalizeText(value?: string | null) {
    return (value || "").trim().toLowerCase();
}

function escapeHtml(value?: string | null) {
    return (value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

export default function PatientRecords() {
    const [searchQuery, setSearchQuery] = useState("");
    const [doctorFilter, setDoctorFilter] = useState("all");
    const [recordTypeFilter, setRecordTypeFilter] = useState("all");
    const [dateRange, setDateRange] = useState<DateRange | undefined>();

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
            .filter((appointment) => appointment.medicalRecords)
            .sort((a, b) => {
                const aDate = combineDateAndTime(a.timeslot?.date, a.timeslot?.startTime)?.getTime() || 0;
                const bDate = combineDateAndTime(b.timeslot?.date, b.timeslot?.startTime)?.getTime() || 0;
                return bDate - aDate;
            });
    }, [appointments]);

    const doctorOptions = useMemo(() => {
        return Array.from(
            new Map(
                records
                    .filter((record) => record.doctor?.id && record.doctor?.name)
                    .map((record) => [record.doctor?.id as string, record.doctor?.name as string])
            ).entries()
        );
    }, [records]);

    const filteredRecords = useMemo(() => {
        const query = normalizeText(searchQuery);

        return records.filter((record) => {
            const visitDate = combineDateAndTime(record.timeslot?.date, record.timeslot?.startTime);
            const doctorName = normalizeText(record.doctor?.name);
            const diagnosis = normalizeText(record.medicalRecords?.diagnosis);
            const treatment = normalizeText(record.medicalRecords?.treatment);
            const notes = normalizeText(record.medicalRecords?.notes);
            const symptoms = normalizeText(record.symptoms);
            const recordSearchBlob = [doctorName, diagnosis, treatment, notes, symptoms].join(" ");

            const matchesSearch = !query || recordSearchBlob.includes(query);
            const matchesDoctor = doctorFilter === "all" || record.doctor?.id === doctorFilter;
            const matchesType =
                recordTypeFilter === "all" ||
                (recordTypeFilter === "prescriptions" && (record.medications?.length || 0) > 0) ||
                (recordTypeFilter === "diagnostics" && (record.diagnostics?.length || 0) > 0) ||
                (recordTypeFilter === "combined" &&
                    (record.medications?.length || 0) > 0 &&
                    (record.diagnostics?.length || 0) > 0);

            const matchesDate =
                !dateRange?.from ||
                (!!visitDate &&
                    !isBefore(startOfDay(visitDate), startOfDay(dateRange.from)) &&
                    (!dateRange.to || !isAfter(startOfDay(visitDate), startOfDay(dateRange.to))));

            return matchesSearch && matchesDoctor && matchesType && matchesDate;
        });
    }, [dateRange, doctorFilter, recordTypeFilter, records, searchQuery]);

    const recordStats = useMemo(() => {
        const prescriptionOrders = filteredRecords.reduce((sum, record) => sum + (record.medications?.length || 0), 0);
        const diagnosticOrders = filteredRecords.reduce((sum, record) => sum + (record.diagnostics?.length || 0), 0);
        const totalDrugs = filteredRecords.reduce(
            (sum, record) =>
                sum + (record.medications?.reduce((acc, medication) => acc + (medication.drugs?.length || 0), 0) || 0),
            0
        );
        const totalTests = filteredRecords.reduce(
            (sum, record) =>
                sum +
                (record.diagnostics?.reduce(
                    (acc, diagnostic) => acc + (diagnostic.diagnosticTests?.length || 0),
                    0
                ) || 0),
            0
        );

        return {
            totalRecords: filteredRecords.length,
            prescriptionOrders,
            diagnosticOrders,
            totalDrugs,
            totalTests
        };
    }, [filteredRecords]);

    const activeFilterCount = useMemo(() => {
        return [searchQuery.trim(), doctorFilter !== "all", recordTypeFilter !== "all", !!dateRange?.from].filter(Boolean)
            .length;
    }, [dateRange?.from, doctorFilter, recordTypeFilter, searchQuery]);

    const exportRecordsToPdf = () => {
        if (filteredRecords.length === 0) {
            toast.error("There are no filtered records to export.");
            return;
        }

        const filtersSummary = [
            searchQuery.trim() ? `Search: ${searchQuery.trim()}` : null,
            doctorFilter !== "all"
                ? `Doctor: ${doctorOptions.find(([id]) => id === doctorFilter)?.[1] || "Selected doctor"}`
                : null,
            recordTypeFilter !== "all"
                ? `Type: ${
                      recordTypeFilter === "prescriptions"
                          ? "Prescriptions"
                          : recordTypeFilter === "diagnostics"
                            ? "Diagnostics"
                            : "Combined records"
                  }`
                : null,
            dateRange?.from
                ? `Date range: ${format(dateRange.from, "MMM d, yyyy")} - ${
                      dateRange.to ? format(dateRange.to, "MMM d, yyyy") : "Present"
                  }`
                : null
        ]
            .filter(Boolean)
            .join(" | ");

        const bodyMarkup = filteredRecords
            .map((record) => {
                const start = combineDateAndTime(record.timeslot?.date, record.timeslot?.startTime);
                const end = combineDateAndTime(record.timeslot?.date, record.timeslot?.endTime);

                const medicationsMarkup =
                    record.medications && record.medications.length > 0
                        ? `
                            <section class="section">
                                <h4>Prescriptions</h4>
                                ${record.medications
                                    .map(
                                        (medication) => `
                                            <div class="block">
                                                <div class="meta-row">
                                                    <span class="label">Status</span>
                                                    <span>${escapeHtml(medication.status)}</span>
                                                </div>
                                                ${(medication.drugs || [])
                                                    .map(
                                                        (drug) => `
                                                            <div class="line-item">
                                                                ${escapeHtml(drug.medicine?.title)} ${escapeHtml(drug.dose)}
                                                                <span class="muted"> - ${escapeHtml(drug.frequency)} - ${escapeHtml(drug.duration)}</span>
                                                            </div>
                                                        `
                                                    )
                                                    .join("")}
                                                ${medication.notes ? `<p class="muted">${escapeHtml(medication.notes)}</p>` : ""}
                                            </div>
                                        `
                                    )
                                    .join("")}
                            </section>
                        `
                        : "";

                const diagnosticsMarkup =
                    record.diagnostics && record.diagnostics.length > 0
                        ? `
                            <section class="section">
                                <h4>Diagnostic Tests</h4>
                                ${record.diagnostics
                                    .map(
                                        (diagnostic) => `
                                            <div class="block">
                                                <div class="meta-row">
                                                    <span class="label">Lab Request Status</span>
                                                    <span>${escapeHtml(diagnostic.status)}</span>
                                                </div>
                                                ${(diagnostic.diagnosticTests || [])
                                                    .map(
                                                        (test) => `
                                                            <div class="test-item">
                                                                <div><strong>${escapeHtml(test.diagnosticTest?.title)}</strong></div>
                                                                <div class="muted">
                                                                    Value: ${escapeHtml(test.result?.value?.toString())} ${escapeHtml(test.result?.unit)}
                                                                    | Reference: ${escapeHtml(test.result?.lowerRange?.toString())} - ${escapeHtml(test.result?.upperRange?.toString())}
                                                                </div>
                                                                <div class="muted">
                                                                    Interpretation: ${escapeHtml(test.result?.interpretation) || "-"}
                                                                </div>
                                                            </div>
                                                        `
                                                    )
                                                    .join("")}
                                            </div>
                                        `
                                    )
                                    .join("")}
                            </section>
                        `
                        : "";

                return `
                    <article class="record">
                        <header class="record-header">
                            <div>
                                <p class="eyebrow">Medical Record</p>
                                <h2>${escapeHtml(record.doctor?.name || "Doctor")}</h2>
                                <p class="muted">
                                    ${start ? format(start, "MMMM d, yyyy") : "Date not set"}
                                    ${start && end ? ` | ${format(start, "h:mm a")} - ${format(end, "h:mm a")}` : ""}
                                </p>
                            </div>
                            <div class="status">${escapeHtml(record.status)}</div>
                        </header>

                        <section class="section">
                            <h4>Visit Summary</h4>
                            <div class="meta-grid">
                                <div>
                                    <span class="label">Diagnosis</span>
                                    <p>${escapeHtml(record.medicalRecords?.diagnosis) || "Not specified"}</p>
                                </div>
                                <div>
                                    <span class="label">Symptoms</span>
                                    <p>${escapeHtml(record.symptoms) || "Not recorded"}</p>
                                </div>
                                <div>
                                    <span class="label">Treatment</span>
                                    <p>${escapeHtml(record.medicalRecords?.treatment) || "Not specified"}</p>
                                </div>
                                <div>
                                    <span class="label">Visit Notes</span>
                                    <p>${escapeHtml(record.notes) || "None"}</p>
                                </div>
                            </div>
                        </section>

                        <section class="section">
                            <h4>Medical Notes</h4>
                            <p>${escapeHtml(record.medicalRecords?.notes) || "No notes provided."}</p>
                        </section>

                        ${record.medicalRecords?.prescriptions ? `<section class="section"><h4>Prescription Notes</h4><p>${escapeHtml(record.medicalRecords.prescriptions)}</p></section>` : ""}
                        ${medicationsMarkup}
                        ${diagnosticsMarkup}
                    </article>
                `;
            })
            .join("");

        const iframe = document.createElement("iframe");
        iframe.style.position = "fixed";
        iframe.style.right = "0";
        iframe.style.bottom = "0";
        iframe.style.width = "0";
        iframe.style.height = "0";
        iframe.style.border = "0";
        iframe.setAttribute("aria-hidden", "true");
        document.body.appendChild(iframe);

        const iframeDocument = iframe.contentWindow?.document;

        if (!iframeDocument || !iframe.contentWindow) {
            document.body.removeChild(iframe);
            toast.error("Unable to prepare the PDF export right now.");
            return;
        }

        iframeDocument.open();
        iframeDocument.write(`
            <!doctype html>
            <html>
                <head>
                    <title>Medical Records Export</title>
                    <meta charset="utf-8" />
                    <style>
                        * { box-sizing: border-box; }
                        body {
                            font-family: Arial, sans-serif;
                            color: #0f172a;
                            margin: 0;
                            padding: 32px;
                            background: #f8fafc;
                        }
                        .page-header {
                            margin-bottom: 24px;
                            padding: 24px;
                            border: 1px solid #d1fae5;
                            border-radius: 20px;
                            background: linear-gradient(135deg, #ecfdf5, #ffffff);
                        }
                        .page-header h1 {
                            margin: 0 0 8px;
                            font-size: 28px;
                        }
                        .page-header p {
                            margin: 4px 0;
                            color: #475569;
                        }
                        .record {
                            margin-bottom: 20px;
                            padding: 20px;
                            border: 1px solid #e2e8f0;
                            border-radius: 18px;
                            background: white;
                            page-break-inside: avoid;
                        }
                        .record-header {
                            display: flex;
                            justify-content: space-between;
                            gap: 16px;
                            margin-bottom: 16px;
                            padding-bottom: 16px;
                            border-bottom: 1px solid #e2e8f0;
                        }
                        .eyebrow {
                            margin: 0 0 6px;
                            font-size: 11px;
                            letter-spacing: 0.12em;
                            color: #64748b;
                            text-transform: uppercase;
                        }
                        h2, h4 { margin: 0 0 8px; }
                        .status {
                            align-self: flex-start;
                            padding: 6px 10px;
                            border-radius: 999px;
                            background: #dcfce7;
                            color: #166534;
                            font-size: 12px;
                            font-weight: 700;
                        }
                        .section { margin-top: 16px; }
                        .meta-grid {
                            display: grid;
                            grid-template-columns: repeat(2, minmax(0, 1fr));
                            gap: 12px;
                        }
                        .meta-row {
                            display: flex;
                            justify-content: space-between;
                            gap: 12px;
                            margin-bottom: 8px;
                        }
                        .label {
                            display: block;
                            margin-bottom: 4px;
                            font-size: 11px;
                            letter-spacing: 0.08em;
                            color: #64748b;
                            text-transform: uppercase;
                        }
                        .muted {
                            color: #475569;
                            font-size: 13px;
                        }
                        .block, .test-item {
                            margin-top: 10px;
                            padding: 12px;
                            border: 1px solid #e2e8f0;
                            border-radius: 12px;
                            background: #f8fafc;
                        }
                        .line-item { margin-top: 6px; }
                        @media print {
                            body { background: white; padding: 20px; }
                            .page-header { break-inside: avoid; }
                        }
                    </style>
                </head>
                <body>
                    <div class="page-header">
                        <h1>Medical Records Export</h1>
                        <p>Generated on ${format(new Date(), "MMMM d, yyyy 'at' h:mm a")}</p>
                        <p>Exported records: ${filteredRecords.length}</p>
                        ${filtersSummary ? `<p>${escapeHtml(filtersSummary)}</p>` : ""}
                    </div>
                    ${bodyMarkup}
                </body>
            </html>
        `);
        iframeDocument.close();

        iframe.onload = () => {
            iframe.contentWindow?.focus();
            iframe.contentWindow?.print();

            const cleanup = () => {
                window.setTimeout(() => {
                    if (document.body.contains(iframe)) {
                        document.body.removeChild(iframe);
                    }
                }, 300);
            };

            iframe.contentWindow?.addEventListener("afterprint", cleanup, { once: true });
            window.setTimeout(cleanup, 1500);
        };
    };

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
                            <p className="mt-1 text-xs text-muted-foreground">Matching Current Filters</p>
                        </CardContent>
                    </Card>
                    <Card className="border-emerald-100 bg-white/80 shadow-none">
                        <CardContent className="p-4">
                            <p className="text-xs uppercase tracking-wide text-muted-foreground">Prescriptions</p>
                            <p className="text-2xl font-semibold">{recordStats.prescriptionOrders}</p>
                            <p className="mt-1 text-xs text-muted-foreground">
                                {recordStats.totalDrugs} Medication Entries
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="border-emerald-100 bg-white/80 shadow-none">
                        <CardContent className="p-4">
                            <p className="text-xs uppercase tracking-wide text-muted-foreground">Diagnostics</p>
                            <p className="text-2xl font-semibold">{recordStats.diagnosticOrders}</p>
                            <p className="mt-1 text-xs text-muted-foreground">
                                {recordStats.totalTests} Tests Prescribed
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="border-emerald-100 bg-white/80 shadow-none">
                        <CardContent className="p-4">
                            <p className="text-xs uppercase tracking-wide text-muted-foreground">Latest</p>
                            <p className="text-2xl font-semibold">
                                {filteredRecords[0]
                                    ? format(
                                          combineDateAndTime(
                                              filteredRecords[0].timeslot?.date,
                                              filteredRecords[0].timeslot?.startTime
                                          ) || new Date(),
                                          "MMM d, yyyy"
                                      )
                                    : "No Records"}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                                {filteredRecords[0]?.doctor?.name || "No doctor yet"}
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <Card className="border-border/70 shadow-sm">
                <CardContent className="space-y-4 p-5">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <p className="flex items-center gap-2 text-sm font-medium text-foreground">
                                <Filter className="h-4 w-4 text-primary" />
                                Filter Records
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Narrow your history, then export only what you need.
                            </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            {activeFilterCount > 0 && (
                                <Button
                                    variant="ghost"
                                    onClick={() => {
                                        setSearchQuery("");
                                        setDoctorFilter("all");
                                        setRecordTypeFilter("all");
                                        setDateRange(undefined);
                                    }}
                                >
                                    Clear Filters
                                </Button>
                            )}
                            <Button onClick={exportRecordsToPdf}>
                                <Download className="mr-2 h-4 w-4" />
                                Export PDF
                            </Button>
                        </div>
                    </div>

                    <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr_0.8fr_1fr]">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search by doctor, diagnosis, notes, symptoms..."
                                value={searchQuery}
                                onChange={(event) => setSearchQuery(event.target.value)}
                                className="pl-10"
                            />
                        </div>

                        <Select value={doctorFilter} onValueChange={setDoctorFilter}>
                            <SelectTrigger>
                                <SelectValue placeholder="All doctors" />
                            </SelectTrigger>
                            <SelectContent className="bg-popover">
                                <SelectItem value="all">All doctors</SelectItem>
                                {doctorOptions.map(([doctorId, doctorName]) => (
                                    <SelectItem key={doctorId} value={doctorId}>
                                        {doctorName}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={recordTypeFilter} onValueChange={setRecordTypeFilter}>
                            <SelectTrigger>
                                <SelectValue placeholder="All record types" />
                            </SelectTrigger>
                            <SelectContent className="bg-popover">
                                <SelectItem value="all">All record types</SelectItem>
                                <SelectItem value="prescriptions">With prescriptions</SelectItem>
                                <SelectItem value="diagnostics">With diagnostics</SelectItem>
                                <SelectItem value="combined">Prescriptions and diagnostics</SelectItem>
                            </SelectContent>
                        </Select>

                        <DateRangePicker
                            value={dateRange}
                            onChange={setDateRange}
                            placeholder="Filter by visit date"
                            numberOfMonths={2}
                        />
                    </div>

                    {activeFilterCount > 0 && (
                        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                            <span>{activeFilterCount} filter{activeFilterCount === 1 ? "" : "s"} applied</span>
                            <span>•</span>
                            <span>{filteredRecords.length} records found</span>
                        </div>
                    )}
                </CardContent>
            </Card>

            {filteredRecords.length === 0 ? (
                <EmptyState
                    icon={FileText}
                    title={records.length === 0 ? "No medical records" : "No records match your filters"}
                    description={
                        records.length === 0
                            ? "Your consultation records will appear here."
                            : "Try adjusting the doctor, date, or record-type filters."
                    }
                />
            ) : (
                <Accordion type="multiple" className="space-y-4">
                    {filteredRecords.map((record, index) => {
                        const start = combineDateAndTime(record.timeslot?.date, record.timeslot?.startTime);
                        const end = combineDateAndTime(record.timeslot?.date, record.timeslot?.endTime);

                        return (
                            <AccordionItem
                                key={record.id || index}
                                value={record.id || `record-${index}`}
                                className="rounded-2xl border bg-card shadow-sm transition hover:border-primary/40"
                            >
                                <AccordionTrigger className="px-5 py-5 hover:no-underline">
                                    <div className="flex w-full items-start content-between gap-3 text-left">
                                        <div className="flex items-start gap-4">
                                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10">
                                                <User className="h-5 w-5 text-primary" />
                                            </div>
                                            <div className="text-left">
                                                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                                                    Medical Record
                                                </p>
                                                <p className="font-semibold text-base">
                                                    {record.doctor?.name || "Doctor"}
                                                </p>
                                                <p className="mt-1 text-sm text-muted-foreground">
                                                    {record.medicalRecords?.diagnosis || "Diagnosis not specified"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="px-5 pb-5">
                                    <div className="grid gap-5 lg:grid-cols-[1.2fr_1fr]">
                                        <div className="space-y-5">
                                            <Card className="border-border/60 bg-white">
                                                <CardContent className="space-y-4 p-5">
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
                                                        <h4 className="mb-1 font-medium">Notes</h4>
                                                        <p className="text-sm text-muted-foreground">
                                                            {record.medicalRecords?.notes || "No notes provided."}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <h4 className="mb-1 font-medium">Diagnosis</h4>
                                                        <p className="text-sm">
                                                            {record.medicalRecords?.diagnosis || "Not specified"}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <h4 className="mb-1 font-medium">Treatment Plan</h4>
                                                        <p className="text-sm text-muted-foreground">
                                                            {record.medicalRecords?.treatment || "Not specified"}
                                                        </p>
                                                    </div>
                                                    {record.medicalRecords?.prescriptions && (
                                                        <div>
                                                            <h4 className="mb-1 font-medium">Prescriptions</h4>
                                                            <p className="text-sm text-muted-foreground">
                                                                {record.medicalRecords.prescriptions}
                                                            </p>
                                                        </div>
                                                    )}
                                                </CardContent>
                                            </Card>

                                            {record.medications?.length ? (
                                                <Card className="border-border/60 bg-white">
                                                    <CardContent className="space-y-4 p-5">
                                                        <div className="flex items-center gap-2">
                                                            <Pill className="h-4 w-4 text-primary" />
                                                            <h4 className="font-medium">Prescriptions</h4>
                                                        </div>
                                                        {record.medications.map((medication) => (
                                                            <div key={medication.id} className="rounded-xl border p-3">
                                                                <div className="mb-2 flex items-center justify-between">
                                                                    <span className="text-sm font-medium">
                                                                        Medication Order
                                                                    </span>
                                                                    <StatusBadge
                                                                        variant={getStatusVariant(
                                                                            medication.status || "pending"
                                                                        )}
                                                                    >
                                                                        {medication.status}
                                                                    </StatusBadge>
                                                                </div>
                                                                <div className="space-y-2">
                                                                    {(medication.drugs || []).map((item) => (
                                                                        <div key={item.id} className="text-sm">
                                                                            {item.medicine?.title} {item.dose}
                                                                            <span className="text-muted-foreground">
                                                                                {" "}
                                                                                • {item.frequency} • {item.duration}
                                                                            </span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                                {medication.notes && (
                                                                    <p className="mt-2 text-xs text-muted-foreground">
                                                                        {medication.notes}
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
                                                <CardContent className="space-y-2 p-5">
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
                                                    <CardContent className="space-y-4 p-5">
                                                        <div className="flex items-center gap-2">
                                                            <FlaskConical className="h-4 w-4 text-primary" />
                                                            <h4 className="font-medium">Diagnostic Tests</h4>
                                                        </div>
                                                        {record.diagnostics.map((diagnostic) => (
                                                            <div key={diagnostic.id} className="space-y-2">
                                                                <div className="flex items-center justify-between">
                                                                    <span className="text-sm font-medium">
                                                                        Lab Request
                                                                    </span>
                                                                    <StatusBadge
                                                                        variant={getStatusVariant(
                                                                            diagnostic.status || "scheduled"
                                                                        )}
                                                                    >
                                                                        {diagnostic.status}
                                                                    </StatusBadge>
                                                                </div>
                                                                <div className="overflow-hidden rounded-xl border">
                                                                    <table className="w-full text-sm">
                                                                        <thead className="bg-muted">
                                                                            <tr>
                                                                                <th className="p-2 text-left font-medium">
                                                                                    Test
                                                                                </th>
                                                                                <th className="p-2 text-left font-medium">
                                                                                    Value
                                                                                </th>
                                                                                <th className="p-2 text-left font-medium">
                                                                                    Reference
                                                                                </th>
                                                                                <th className="p-2 text-left font-medium">
                                                                                    Interpretation
                                                                                </th>
                                                                                <th className="p-2 text-left font-medium">
                                                                                    Report
                                                                                </th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody>
                                                                            {(diagnostic.diagnosticTests || []).map(
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
