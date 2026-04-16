import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    AppointmentDiagnosticsService,
    type AppointmentDto,
    type AppointmentDiagnosticsDto
} from "@mediflow/mediflow-api";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StatusBadge, getStatusVariant } from "@/components/ui/status-badge";
import { CardSkeleton } from "@/components/ui/loading-skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, User, Upload, Loader2, Save, Calendar, Clock, Stethoscope, Download } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { combineDateAndTime } from "@/lib/datetime";
import { useAuth } from "@/contexts/AuthContext";
import { getErrorMessage, getResponseMessage } from "@/lib/api";
import { getAvatarUrl, getDiagnosticReportUrl } from "@/lib/auth";

interface LabItem {
    appointment: AppointmentDto;
    diagnostics: AppointmentDiagnosticsDto;
}

interface ResultEntry {
    value: string;
    unit: string;
    lowerRange: string;
    upperRange: string;
    interpretation: string;
}

export default function LabRequestDetail() {
    const { id } = useParams<{ id: string }>();
    const queryClient = useQueryClient();
    const { user } = useAuth();
    const [resultNotes, setResultNotes] = useState("");
    const [results, setResults] = useState<Record<string, ResultEntry>>({});
    const [lockedTests, setLockedTests] = useState<Set<string>>(new Set());
    const [openTests, setOpenTests] = useState<string[]>([]);

    const { data, isLoading } = useQuery({
        queryKey: ["lab-requests"],
        queryFn: async () => AppointmentDiagnosticsService.getAllAppointmentDiagnosticsList({})
    });

    const labItem = useMemo<LabItem | null>(() => {
        const appointments = data?.result ?? [];
        for (const apt of appointments) {
            for (const diag of apt.diagnostics || []) {
                if (diag.id === id) {
                    return { appointment: apt, diagnostics: diag };
                }
            }
        }
        return null;
    }, [data, id]);

    useEffect(() => {
        if (!labItem) return;
        const initial: Record<string, ResultEntry> = {};
        (labItem.diagnostics.diagnosticTests || []).forEach((test) => {
            if (!test.id) return;
            initial[test.id] = {
                value: test.result?.value || "",
                unit: test.result?.unit || "",
                lowerRange: test.result?.lowerRange || "",
                upperRange: test.result?.upperRange || "",
                interpretation: test.result?.interpretation || ""
            };
        });
        setResults(initial);
        setResultNotes(labItem.diagnostics.notes || "");
        setLockedTests(new Set());
        const incomplete = (labItem.diagnostics.diagnosticTests || [])
            .map((test, index) => ({
                test,
                key: test.id || `test-${index}`
            }))
            .filter(({ test }) => !test.result && !test.report)
            .map(({ key }) => key);
        setOpenTests(incomplete);
    }, [labItem]);

    const assignMutation = useMutation({
        mutationFn: async () => AppointmentDiagnosticsService.assignLabTechnician({ appointmentDiagnosticsId: id! }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["lab-requests"] });
        }
    });

    const submitResultMutation = useMutation({
        mutationFn: async ({ testId, entry }: { testId: string; entry: ResultEntry }) => {
            return AppointmentDiagnosticsService.submitDiagnosticTestResult({
                appointmentDiagnosticTestId: testId,
                requestBody: {
                    appointmentDiagnosticTestId: testId,
                    value: entry.value,
                    unit: entry.unit,
                    lowerRange: entry.lowerRange,
                    upperRange: entry.upperRange,
                    interpretation: entry.interpretation
                }
            });
        },
        onSuccess: (data, variables) => {
            toast.success(getResponseMessage(data));
            if (variables?.testId) {
                setLockedTests((prev) => {
                    const next = new Set(prev);
                    next.add(variables.testId);
                    return next;
                });
            }
            queryClient.invalidateQueries({ queryKey: ["lab-requests"] });
        },
        onError: (error) => toast.error(getErrorMessage(error))
    });

    const uploadMutation = useMutation({
        mutationFn: async ({ testId, file }: { testId: string; file: File }) => {
            return AppointmentDiagnosticsService.uploadDiagnosticReport({
                appointmentDiagnosticTestId: testId,
                formData: {
                    AppointmentDiagnosticTestId: testId,
                    Report: file
                }
            });
        },
        onSuccess: (data, variables) => {
            toast.success(getResponseMessage(data));
            if (variables?.testId) {
                setLockedTests((prev) => {
                    const next = new Set(prev);
                    next.add(variables.testId);
                    return next;
                });
            }
            queryClient.invalidateQueries({ queryKey: ["lab-requests"] });
        },
        onError: (error) => toast.error(getErrorMessage(error))
    });

    if (isLoading) {
        return (
            <div className="space-y-6">
                <PageHeader title="Lab Request" />
                <CardSkeleton />
            </div>
        );
    }

    if (!labItem) {
        return (
            <div className="space-y-6">
                <PageHeader title="Request Not Found" />
                <Button asChild>
                    <Link to="/lab/requests">Back to Requests</Link>
                </Button>
            </div>
        );
    }

    const { appointment, diagnostics } = labItem;
    const start = combineDateAndTime(appointment.timeslot?.date, appointment.timeslot?.startTime);
    const assignedTechnician = diagnostics.labTechnician;
    const assignedName =
        assignedTechnician?.name ||
        assignedTechnician?.username ||
        assignedTechnician?.emailAddress ||
        "Assigned Technician";
    const isAssigned = Boolean(assignedTechnician?.id);
    const isAssignedToMe = Boolean(user?.id && assignedTechnician?.id === user.id);
    const assignLabel = assignMutation.isPending
        ? "Assigning..."
        : isAssigned
          ? isAssignedToMe
              ? "Assigned to You"
              : `Assigned to ${assignedName}`
          : "Assign to Me";
    const patientInitials =
        appointment.patient?.name
            ?.split(" ")
            .map((n) => n[0])
            .join("")
            .slice(0, 2) || "P";
    const isResulted = diagnostics.status === "Resulted";
    const totalTests = diagnostics.diagnosticTests?.length || 0;
    const completedTests = (diagnostics.diagnosticTests || []).filter((test) => test.result || test.report).length;

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link to="/lab/requests">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                </Button>
                <PageHeader
                    title={`Lab Request #${diagnostics.id?.slice(-4)}`}
                    description={start ? format(start, "MMMM d, yyyy") : ""}
                />
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.1fr_1.9fr]">
                <Card className="border-border/60">
                    <CardHeader>
                        <CardTitle className="text-base">Request Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-5">
                        <div className="flex items-center gap-4">
                            <Avatar className="h-14 w-14 ring-2 ring-primary/10">
                                <AvatarImage
                                    src={getAvatarUrl(appointment.patient?.profileImage?.fileUrl)}
                                    alt={appointment.patient?.name || "Patient"}
                                />
                                <AvatarFallback className="bg-primary/10 text-primary font-medium">
                                    {patientInitials}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-semibold">{appointment.patient?.name}</p>
                                <p className="text-sm text-muted-foreground">Patient</p>
                            </div>
                        </div>

                        <div className="space-y-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                                <Stethoscope className="h-4 w-4" />
                                <span>Ordered by {appointment.doctor?.name || "Doctor"}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                <span>Assigned: {assignedTechnician ? assignedName : "Unassigned"}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                <span>{start ? format(start, "MMM d, yyyy") : ""}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                <span>{start ? format(start, "h:mm a") : ""}</span>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <StatusBadge variant={getStatusVariant(diagnostics.status || "scheduled")}>
                                {diagnostics.status}
                            </StatusBadge>
                            {isResulted && (
                                <Badge className="bg-emerald-600 text-white hover:bg-emerald-600">Resulted</Badge>
                            )}
                            <Badge variant="secondary">
                                {completedTests}/{totalTests} tests completed
                            </Badge>
                        </div>

                        <div>
                            <p className="text-sm font-medium mb-2">Tests Ordered</p>
                            <div className="space-y-1">
                                {(diagnostics.diagnosticTests || []).map((test) => (
                                    <div key={test.id} className="p-2 bg-accent/50 rounded text-sm">
                                        {test.diagnosticTest?.title}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {diagnostics.notes && (
                            <div>
                                <p className="text-sm font-medium mb-1">Clinical Notes</p>
                                <p className="text-sm text-muted-foreground">{diagnostics.notes}</p>
                            </div>
                        )}

                        <Button
                            className="w-full"
                            variant="outline"
                            onClick={() => assignMutation.mutate()}
                            disabled={assignMutation.isPending || isAssigned || isResulted}
                        >
                            {assignLabel}
                        </Button>
                    </CardContent>
                </Card>

                <Card className="border-border/60">
                    <CardHeader>
                        <CardTitle className="text-base">Lab Results</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea>
                            <Accordion
                                type="multiple"
                                value={openTests}
                                onValueChange={setOpenTests}
                                className="space-y-3"
                            >
                                {(diagnostics.diagnosticTests || []).map((test, index) => {
                                    const testKey = test.id || `test-${index}`;
                                    const entry = results[test.id || ""] || {
                                        value: "",
                                        unit: "",
                                        lowerRange: "",
                                        upperRange: "",
                                        interpretation: ""
                                    };
                                    const isTestLocked =
                                        isResulted || lockedTests.has(test.id || "") || !!test.result || !!test.report;
                                    const reportUrl = getDiagnosticReportUrl(test.report?.fileUrl);
                                    return (
                                        <AccordionItem key={testKey} value={testKey} className="border rounded-xl">
                                            <AccordionTrigger className="px-4 py-3 hover:no-underline">
                                                <div className="flex w-full items-start justify-between gap-3 text-left">
                                                    <div>
                                                        <p className="font-medium">{test.diagnosticTest?.title}</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {test.diagnosticTest?.description}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs">
                                                        {isTestLocked ? (
                                                            <Badge className="bg-emerald-600 text-white hover:bg-emerald-600">
                                                                {test.report ? "Report Attached" : "Result Saved"}
                                                            </Badge>
                                                        ) : (
                                                            <Badge variant="secondary">Pending</Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            </AccordionTrigger>
                                            <AccordionContent className="px-4 pb-4">
                                                <div className="space-y-3">
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div>
                                                            <Label className="text-xs">Value</Label>
                                                            <Input
                                                                value={entry.value}
                                                                onChange={(e) =>
                                                                    setResults((prev) => ({
                                                                        ...prev,
                                                                        [test.id || ""]: {
                                                                            ...entry,
                                                                            value: e.target.value
                                                                        }
                                                                    }))
                                                                }
                                                                placeholder="Result value"
                                                                disabled={isTestLocked}
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label className="text-xs">Unit</Label>
                                                            <Input
                                                                value={entry.unit}
                                                                onChange={(e) =>
                                                                    setResults((prev) => ({
                                                                        ...prev,
                                                                        [test.id || ""]: {
                                                                            ...entry,
                                                                            unit: e.target.value
                                                                        }
                                                                    }))
                                                                }
                                                                placeholder="Unit"
                                                                disabled={isTestLocked}
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label className="text-xs">Lower Range</Label>
                                                            <Input
                                                                value={entry.lowerRange}
                                                                onChange={(e) =>
                                                                    setResults((prev) => ({
                                                                        ...prev,
                                                                        [test.id || ""]: {
                                                                            ...entry,
                                                                            lowerRange: e.target.value
                                                                        }
                                                                    }))
                                                                }
                                                                placeholder="Lower"
                                                                disabled={isTestLocked}
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label className="text-xs">Upper Range</Label>
                                                            <Input
                                                                value={entry.upperRange}
                                                                onChange={(e) =>
                                                                    setResults((prev) => ({
                                                                        ...prev,
                                                                        [test.id || ""]: {
                                                                            ...entry,
                                                                            upperRange: e.target.value
                                                                        }
                                                                    }))
                                                                }
                                                                placeholder="Upper"
                                                                disabled={isTestLocked}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <Label className="text-xs">Interpretation</Label>
                                                        <Textarea
                                                            value={entry.interpretation}
                                                            onChange={(e) =>
                                                                setResults((prev) => ({
                                                                    ...prev,
                                                                    [test.id || ""]: {
                                                                        ...entry,
                                                                        interpretation: e.target.value
                                                                    }
                                                                }))
                                                            }
                                                            placeholder="Interpretation or remarks"
                                                            rows={2}
                                                            disabled={isTestLocked}
                                                        />
                                                    </div>
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <Button
                                                            onClick={() =>
                                                                submitResultMutation.mutate({
                                                                    testId: test.id || "",
                                                                    entry
                                                                })
                                                            }
                                                            disabled={submitResultMutation.isPending || isTestLocked}
                                                        >
                                                            {submitResultMutation.isPending ? (
                                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                            ) : (
                                                                <Save className="h-4 w-4 mr-2" />
                                                            )}
                                                            {isTestLocked ? "Saved" : "Save Result"}
                                                        </Button>
                                                        <div>
                                                            <label className="inline-flex items-center gap-2 cursor-pointer text-sm text-primary">
                                                                <input
                                                                    type="file"
                                                                    className="hidden"
                                                                    accept=".pdf,.jpg,.png"
                                                                    disabled={isTestLocked || uploadMutation.isPending}
                                                                    onChange={(e) => {
                                                                        const file = e.target.files?.[0];
                                                                        if (file && test.id) {
                                                                            uploadMutation.mutate({
                                                                                testId: test.id,
                                                                                file
                                                                            });
                                                                        }
                                                                    }}
                                                                />
                                                                <Upload className="h-4 w-4" />
                                                                {isTestLocked ? "Report Locked" : "Upload Report"}
                                                            </label>
                                                        </div>
                                                        {reportUrl && (
                                                            <a
                                                                href={reportUrl}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="inline-flex items-center gap-2 text-sm text-primary underline-offset-4 hover:underline"
                                                            >
                                                                <Download className="h-4 w-4" />
                                                                Download Report
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>
                                    );
                                })}
                            </Accordion>
                        </ScrollArea>

                        <div className="mt-4">
                            <Label>Result Notes</Label>
                            <Textarea
                                value={resultNotes}
                                onChange={(e) => setResultNotes(e.target.value)}
                                placeholder="Additional notes..."
                                rows={3}
                                className="mt-1"
                                disabled={isResulted}
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
