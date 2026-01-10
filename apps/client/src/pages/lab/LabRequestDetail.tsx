import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge, getStatusVariant } from "@/components/ui/status-badge";
import { CardSkeleton } from "@/components/ui/loading-skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { mockLabRequests, LabRequest } from "@/mock/labRequests";
import { ArrowLeft, User, Upload, Plus, X, Loader2, Save, FileText } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

interface ResultEntry {
    testName: string;
    value: string;
    unit: string;
    referenceRange: string;
    flag: "normal" | "low" | "high" | "critical";
    remarks: string;
}

export default function LabRequestDetail() {
    const { id } = useParams<{ id: string }>();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [request, setRequest] = useState<LabRequest | null>(null);
    const [results, setResults] = useState<ResultEntry[]>([]);
    const [resultNotes, setResultNotes] = useState("");
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            const req = mockLabRequests.find((r) => r.id === id);
            setRequest(req || null);
            if (req?.results) {
                setResults(
                    req.results.map((r) => ({
                        testName: r.testName,
                        value: r.value,
                        unit: r.unit,
                        referenceRange: r.referenceRange,
                        flag: r.flag || "normal",
                        remarks: r.remarks || ""
                    }))
                );
            }
            if (req?.resultNotes) {
                setResultNotes(req.resultNotes);
            }
            setLoading(false);
        }, 400);
        return () => clearTimeout(timer);
    }, [id]);

    const addResultRow = () => {
        setResults((prev) => [
            ...prev,
            {
                testName: "",
                value: "",
                unit: "",
                referenceRange: "",
                flag: "normal",
                remarks: ""
            }
        ]);
    };

    const updateResult = (index: number, field: keyof ResultEntry, value: string) => {
        setResults((prev) => prev.map((r, i) => (i === index ? { ...r, [field]: value } : r)));
    };

    const removeResult = (index: number) => {
        setResults((prev) => prev.filter((_, i) => i !== index));
    };

    const updateStatus = async (status: LabRequest["status"]) => {
        setSaving(true);
        await new Promise((resolve) => setTimeout(resolve, 500));
        setRequest((prev) => (prev ? { ...prev, status } : null));
        toast.success(`Status updated to ${status}`);
        setSaving(false);
    };

    const submitResults = async () => {
        if (results.length === 0) {
            toast.error("Please add at least one result");
            return;
        }

        const incompleteResults = results.filter((r) => !r.testName || !r.value);
        if (incompleteResults.length > 0) {
            toast.error("Please complete all result fields");
            return;
        }

        setSaving(true);
        await new Promise((resolve) => setTimeout(resolve, 800));

        setRequest((prev) =>
            prev
                ? {
                      ...prev,
                      status: "completed",
                      results: results.map((r) => ({
                          testId: "",
                          testName: r.testName,
                          value: r.value,
                          unit: r.unit,
                          referenceRange: r.referenceRange,
                          flag: r.flag,
                          remarks: r.remarks
                      })),
                      resultNotes,
                      processedBy: "Emma Rodriguez",
                      processedAt: new Date().toISOString()
                  }
                : null
        );

        toast.success("Results submitted successfully");
        setSaving(false);
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <PageHeader title="Lab Request" />
                <CardSkeleton />
            </div>
        );
    }

    if (!request) {
        return (
            <div className="space-y-6">
                <PageHeader title="Request Not Found" />
                <Button asChild>
                    <Link to="/lab/requests">Back to Requests</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link to="/lab/requests">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                </Button>
                <PageHeader
                    title={`Lab Request #${request.id.slice(-4)}`}
                    description={format(new Date(request.createdAt), "MMMM d, yyyy")}
                />
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Request Details */}
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
                                <p className="font-medium">{request.patientName}</p>
                                <p className="text-sm text-muted-foreground">Patient</p>
                            </div>
                        </div>

                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Ordered by</span>
                                <span>{request.doctorName}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Priority</span>
                                <StatusBadge variant={getStatusVariant(request.priority)}>
                                    {request.priority}
                                </StatusBadge>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Status</span>
                                <StatusBadge variant={getStatusVariant(request.status)}>{request.status}</StatusBadge>
                            </div>
                        </div>

                        <div>
                            <p className="text-sm font-medium mb-2">Tests Ordered</p>
                            <div className="space-y-1">
                                {request.tests.map((test) => (
                                    <div key={test.id} className="p-2 bg-accent/50 rounded text-sm">
                                        {test.name}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {request.clinicalNotes && (
                            <div>
                                <p className="text-sm font-medium mb-1">Clinical Notes</p>
                                <p className="text-sm text-muted-foreground">{request.clinicalNotes}</p>
                            </div>
                        )}

                        {request.status === "requested" && (
                            <Button className="w-full" onClick={() => updateStatus("in-progress")} disabled={saving}>
                                Start Processing
                            </Button>
                        )}
                    </CardContent>
                </Card>

                {/* Results Entry */}
                <Card className="lg:col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-base">Lab Results</CardTitle>
                        {request.status !== "completed" && (
                            <Button size="sm" variant="outline" onClick={addResultRow}>
                                <Plus className="h-4 w-4 mr-1" /> Add Row
                            </Button>
                        )}
                    </CardHeader>
                    <CardContent>
                        {request.status === "completed" && request.results ? (
                            <div className="space-y-4">
                                <div className="border rounded-lg overflow-hidden">
                                    <table className="w-full text-sm">
                                        <thead className="bg-muted">
                                            <tr>
                                                <th className="text-left p-3 font-medium">Test</th>
                                                <th className="text-left p-3 font-medium">Value</th>
                                                <th className="text-left p-3 font-medium">Reference</th>
                                                <th className="text-left p-3 font-medium">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {request.results.map((result, idx) => (
                                                <tr key={idx} className="border-t">
                                                    <td className="p-3">{result.testName}</td>
                                                    <td className="p-3">
                                                        {result.value} {result.unit}
                                                    </td>
                                                    <td className="p-3 text-muted-foreground">
                                                        {result.referenceRange}
                                                    </td>
                                                    <td className="p-3">
                                                        <StatusBadge
                                                            variant={
                                                                result.flag === "normal"
                                                                    ? "success"
                                                                    : result.flag === "critical"
                                                                      ? "danger"
                                                                      : "warning"
                                                            }
                                                        >
                                                            {result.flag || "normal"}
                                                        </StatusBadge>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                {request.resultNotes && (
                                    <div className="p-3 bg-accent/50 rounded-lg">
                                        <p className="text-sm font-medium">Notes</p>
                                        <p className="text-sm text-muted-foreground">{request.resultNotes}</p>
                                    </div>
                                )}
                                <div className="text-sm text-muted-foreground">
                                    Processed by {request.processedBy} on{" "}
                                    {format(new Date(request.processedAt!), "MMM d, yyyy h:mm a")}
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <ScrollArea className="max-h-[400px]">
                                    <div className="space-y-3">
                                        {results.map((result, index) => (
                                            <div
                                                key={index}
                                                className="grid grid-cols-6 gap-2 p-3 border rounded-lg items-end"
                                            >
                                                <div className="col-span-2">
                                                    <Label className="text-xs">Test Name</Label>
                                                    <Input
                                                        value={result.testName}
                                                        onChange={(e) =>
                                                            updateResult(index, "testName", e.target.value)
                                                        }
                                                        placeholder="Test name"
                                                        className="h-9"
                                                    />
                                                </div>
                                                <div>
                                                    <Label className="text-xs">Value</Label>
                                                    <Input
                                                        value={result.value}
                                                        onChange={(e) => updateResult(index, "value", e.target.value)}
                                                        placeholder="0.0"
                                                        className="h-9"
                                                    />
                                                </div>
                                                <div>
                                                    <Label className="text-xs">Unit</Label>
                                                    <Input
                                                        value={result.unit}
                                                        onChange={(e) => updateResult(index, "unit", e.target.value)}
                                                        placeholder="mg/dL"
                                                        className="h-9"
                                                    />
                                                </div>
                                                <div>
                                                    <Label className="text-xs">Flag</Label>
                                                    <Select
                                                        value={result.flag}
                                                        onValueChange={(v) => updateResult(index, "flag", v)}
                                                    >
                                                        <SelectTrigger className="h-9">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent className="bg-popover">
                                                            <SelectItem value="normal">Normal</SelectItem>
                                                            <SelectItem value="low">Low</SelectItem>
                                                            <SelectItem value="high">High</SelectItem>
                                                            <SelectItem value="critical">Critical</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="flex justify-end">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => removeResult(index)}
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </ScrollArea>

                                {results.length === 0 && (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                        <p>No results added yet</p>
                                        <Button variant="outline" size="sm" className="mt-2" onClick={addResultRow}>
                                            Add First Result
                                        </Button>
                                    </div>
                                )}

                                <div>
                                    <Label>Upload Report (Optional)</Label>
                                    <div className="mt-1 border-2 border-dashed border-border rounded-lg p-4 text-center hover:border-primary/50 transition-colors cursor-pointer">
                                        <input
                                            type="file"
                                            id="report"
                                            className="hidden"
                                            accept=".pdf,.jpg,.png"
                                            onChange={(e) => setUploadedFile(e.target.files?.[0] || null)}
                                        />
                                        <label htmlFor="report" className="cursor-pointer">
                                            <Upload className="h-6 w-6 mx-auto text-muted-foreground mb-1" />
                                            {uploadedFile ? (
                                                <p className="text-sm font-medium">{uploadedFile.name}</p>
                                            ) : (
                                                <p className="text-sm text-muted-foreground">
                                                    Click to upload PDF or image
                                                </p>
                                            )}
                                        </label>
                                    </div>
                                </div>

                                <div>
                                    <Label>Result Notes</Label>
                                    <Textarea
                                        value={resultNotes}
                                        onChange={(e) => setResultNotes(e.target.value)}
                                        placeholder="Add any notes or observations..."
                                        rows={3}
                                        className="mt-1"
                                    />
                                </div>

                                <Button
                                    className="w-full"
                                    onClick={submitResults}
                                    disabled={saving || results.length === 0}
                                >
                                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    <Save className="h-4 w-4 mr-2" />
                                    Submit Results
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
