import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    AppointmentDiagnosticsService,
    type AppointmentDto,
    type AppointmentDiagnosticsDto,
    type AppointmentDiagnosticTestsDto
} from "@mediflow/mediflow-api";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge, getStatusVariant } from "@/components/ui/status-badge";
import { CardSkeleton } from "@/components/ui/loading-skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, User, Upload, Loader2, Save } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { combineDateAndTime } from "@/lib/datetime";

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
    const [resultNotes, setResultNotes] = useState("");
    const [results, setResults] = useState<Record<string, ResultEntry>>({});

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
        onSuccess: () => {
            toast.success("Result saved");
            queryClient.invalidateQueries({ queryKey: ["lab-requests"] });
        },
        onError: () => toast.error("Failed to save result")
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
        onSuccess: () => {
            toast.success("Report uploaded");
            queryClient.invalidateQueries({ queryKey: ["lab-requests"] });
        },
        onError: () => toast.error("Failed to upload report")
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

            <div className="grid gap-6 lg:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Request Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                                <User className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <p className="font-medium">{appointment.patient?.name}</p>
                                <p className="text-sm text-muted-foreground">Patient</p>
                            </div>
                        </div>

                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Ordered by</span>
                                <span>{appointment.doctor?.name}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Status</span>
                                <StatusBadge variant={getStatusVariant(diagnostics.status || "scheduled")}>
                                    {diagnostics.status}
                                </StatusBadge>
                            </div>
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
                            disabled={assignMutation.isPending}
                        >
                            {assignMutation.isPending ? "Assigning..." : "Assign to Me"}
                        </Button>
                    </CardContent>
                </Card>

                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-base">Lab Results</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="max-h-[500px]">
                            <div className="space-y-4">
                                {(diagnostics.diagnosticTests || []).map((test) => {
                                    const entry = results[test.id || ""] || {
                                        value: "",
                                        unit: "",
                                        lowerRange: "",
                                        upperRange: "",
                                        interpretation: ""
                                    };
                                    return (
                                        <div key={test.id} className="p-4 border rounded-lg space-y-3">
                                            <div>
                                                <p className="font-medium">{test.diagnosticTest?.title}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {test.diagnosticTest?.description}
                                                </p>
                                            </div>
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
                                                    rows={2}
                                                />
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                <Button
                                                    onClick={() =>
                                                        submitResultMutation.mutate({
                                                            testId: test.id || "",
                                                            entry
                                                        })
                                                    }
                                                    disabled={submitResultMutation.isPending}
                                                >
                                                    {submitResultMutation.isPending ? (
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <Save className="h-4 w-4 mr-2" />
                                                    )}
                                                    Save Result
                                                </Button>
                                                <div>
                                                    <label className="inline-flex items-center gap-2 cursor-pointer">
                                                        <input
                                                            type="file"
                                                            className="hidden"
                                                            accept=".pdf,.jpg,.png"
                                                            onChange={(e) => {
                                                                const file = e.target.files?.[0];
                                                                if (file && test.id) {
                                                                    uploadMutation.mutate({ testId: test.id, file });
                                                                }
                                                            }}
                                                        />
                                                        <Upload className="h-4 w-4" />
                                                        Upload Report
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </ScrollArea>

                        <div className="mt-4">
                            <Label>Result Notes</Label>
                            <Textarea
                                value={resultNotes}
                                onChange={(e) => setResultNotes(e.target.value)}
                                placeholder="Additional notes..."
                                rows={3}
                                className="mt-1"
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
