import { useState, useEffect } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge, getStatusVariant } from "@/components/ui/status-badge";
import { ListSkeleton } from "@/components/ui/loading-skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { mockEncounters, Encounter } from "@/mock/encounters";
import { mockPrescriptions, Prescription } from "@/mock/prescriptions";
import { mockLabRequests, LabRequest } from "@/mock/labRequests";
import { FileText, Pill, FlaskConical, User } from "lucide-react";
import { format } from "date-fns";

export default function PatientRecords() {
    const [loading, setLoading] = useState(true);
    const [encounters, setEncounters] = useState<Encounter[]>([]);
    const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
    const [labRequests, setLabRequests] = useState<LabRequest[]>([]);
    const [selectedEncounter, setSelectedEncounter] = useState<Encounter | null>(null);
    const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
    const [selectedLabRequest, setSelectedLabRequest] = useState<LabRequest | null>(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            setEncounters(mockEncounters.filter((e) => e.patientId === "patient-1"));
            setPrescriptions(mockPrescriptions.filter((p) => p.patientId === "patient-1"));
            setLabRequests(mockLabRequests.filter((l) => l.patientId === "patient-1"));
            setLoading(false);
        }, 400);
        return () => clearTimeout(timer);
    }, []);

    if (loading) {
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
            <PageHeader title="Medical Records" description="View your encounters, prescriptions, and lab results" />

            <Tabs defaultValue="encounters" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="encounters" className="gap-2">
                        <FileText className="h-4 w-4" />
                        Encounters ({encounters.length})
                    </TabsTrigger>
                    <TabsTrigger value="prescriptions" className="gap-2">
                        <Pill className="h-4 w-4" />
                        Prescriptions ({prescriptions.length})
                    </TabsTrigger>
                    <TabsTrigger value="labs" className="gap-2">
                        <FlaskConical className="h-4 w-4" />
                        Lab Results ({labRequests.length})
                    </TabsTrigger>
                </TabsList>

                {/* Encounters Tab */}
                <TabsContent value="encounters" className="space-y-4">
                    {encounters.length === 0 ? (
                        <EmptyState
                            icon={FileText}
                            title="No encounters"
                            description="Your consultation records will appear here"
                        />
                    ) : (
                        encounters.map((enc) => (
                            <Card
                                key={enc.id}
                                className="card-interactive cursor-pointer"
                                onClick={() => setSelectedEncounter(enc)}
                            >
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex gap-4">
                                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                <User className="h-5 w-5 text-primary" />
                                            </div>
                                            <div>
                                                <h3 className="font-medium">{enc.doctorName}</h3>
                                                <p className="text-sm text-muted-foreground">{enc.diagnosis}</p>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {format(new Date(enc.dateTime), "MMM d, yyyy")}
                                                </p>
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="sm">
                                            View
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </TabsContent>

                {/* Prescriptions Tab */}
                <TabsContent value="prescriptions" className="space-y-4">
                    {prescriptions.length === 0 ? (
                        <EmptyState
                            icon={Pill}
                            title="No prescriptions"
                            description="Your prescriptions will appear here"
                        />
                    ) : (
                        prescriptions.map((rx) => (
                            <Card
                                key={rx.id}
                                className="card-interactive cursor-pointer"
                                onClick={() => setSelectedPrescription(rx)}
                            >
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-medium">{rx.doctorName}</h3>
                                                <StatusBadge variant={getStatusVariant(rx.status)}>
                                                    {rx.status}
                                                </StatusBadge>
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                {rx.items.length} medication{rx.items.length !== 1 ? "s" : ""}
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {format(new Date(rx.createdAt), "MMM d, yyyy")}
                                            </p>
                                        </div>
                                        <Button variant="ghost" size="sm">
                                            View
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </TabsContent>

                {/* Lab Results Tab */}
                <TabsContent value="labs" className="space-y-4">
                    {labRequests.length === 0 ? (
                        <EmptyState
                            icon={FlaskConical}
                            title="No lab results"
                            description="Your lab results will appear here"
                        />
                    ) : (
                        labRequests.map((lab) => (
                            <Card
                                key={lab.id}
                                className="card-interactive cursor-pointer"
                                onClick={() => setSelectedLabRequest(lab)}
                            >
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-medium">
                                                    {lab.tests.map((t) => t.name).join(", ")}
                                                </h3>
                                                <StatusBadge variant={getStatusVariant(lab.status)}>
                                                    {lab.status}
                                                </StatusBadge>
                                            </div>
                                            <p className="text-sm text-muted-foreground">Ordered by {lab.doctorName}</p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {format(new Date(lab.createdAt), "MMM d, yyyy")}
                                            </p>
                                        </div>
                                        <Button variant="ghost" size="sm">
                                            View
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </TabsContent>
            </Tabs>

            {/* Encounter Detail Dialog */}
            <Dialog open={!!selectedEncounter} onOpenChange={() => setSelectedEncounter(null)}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Encounter Details</DialogTitle>
                        <DialogDescription>
                            {selectedEncounter && format(new Date(selectedEncounter.dateTime), "MMMM d, yyyy")}
                        </DialogDescription>
                    </DialogHeader>
                    {selectedEncounter && (
                        <ScrollArea className="max-h-[60vh]">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 p-3 bg-accent/50 rounded-lg">
                                    <User className="h-5 w-5 text-primary" />
                                    <div>
                                        <p className="font-medium">{selectedEncounter.doctorName}</p>
                                    </div>
                                </div>

                                {selectedEncounter.vitals && (
                                    <div>
                                        <h4 className="font-medium mb-2">Vitals</h4>
                                        <div className="grid grid-cols-3 gap-3">
                                            <div className="p-2 bg-muted rounded text-center">
                                                <p className="text-xs text-muted-foreground">Blood Pressure</p>
                                                <p className="font-medium">{selectedEncounter.vitals.bloodPressure}</p>
                                            </div>
                                            <div className="p-2 bg-muted rounded text-center">
                                                <p className="text-xs text-muted-foreground">Heart Rate</p>
                                                <p className="font-medium">{selectedEncounter.vitals.heartRate} bpm</p>
                                            </div>
                                            <div className="p-2 bg-muted rounded text-center">
                                                <p className="text-xs text-muted-foreground">Temperature</p>
                                                <p className="font-medium">{selectedEncounter.vitals.temperature}°F</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <h4 className="font-medium mb-1">Chief Complaint</h4>
                                    <p className="text-sm text-muted-foreground">{selectedEncounter.chiefComplaint}</p>
                                </div>
                                <div>
                                    <h4 className="font-medium mb-1">Notes</h4>
                                    <p className="text-sm text-muted-foreground">{selectedEncounter.notes}</p>
                                </div>
                                <div>
                                    <h4 className="font-medium mb-1">Diagnosis</h4>
                                    <p className="text-sm">{selectedEncounter.diagnosis}</p>
                                </div>
                                <div>
                                    <h4 className="font-medium mb-1">Treatment Plan</h4>
                                    <p className="text-sm text-muted-foreground">{selectedEncounter.treatmentPlan}</p>
                                </div>
                                {selectedEncounter.followUp && (
                                    <div>
                                        <h4 className="font-medium mb-1">Follow-up</h4>
                                        <p className="text-sm text-muted-foreground">{selectedEncounter.followUp}</p>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    )}
                </DialogContent>
            </Dialog>

            {/* Prescription Detail Dialog */}
            <Dialog open={!!selectedPrescription} onOpenChange={() => setSelectedPrescription(null)}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Prescription Details</DialogTitle>
                        <DialogDescription>
                            {selectedPrescription && `Prescribed by ${selectedPrescription.doctorName}`}
                        </DialogDescription>
                    </DialogHeader>
                    {selectedPrescription && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">
                                    {format(new Date(selectedPrescription.createdAt), "MMM d, yyyy")}
                                </span>
                                <StatusBadge variant={getStatusVariant(selectedPrescription.status)}>
                                    {selectedPrescription.status}
                                </StatusBadge>
                            </div>

                            <div className="space-y-3">
                                {selectedPrescription.items.map((item) => (
                                    <div key={item.id} className="p-3 border rounded-lg">
                                        <div className="flex items-center justify-between mb-1">
                                            <h4 className="font-medium">
                                                {item.medicineName} {item.dosage}
                                            </h4>
                                            {item.dispensed && <StatusBadge variant="success">Dispensed</StatusBadge>}
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            {item.frequency} • {item.duration} • Qty: {item.quantity}
                                        </p>
                                        {item.instructions && (
                                            <p className="text-xs text-muted-foreground mt-1">{item.instructions}</p>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {selectedPrescription.pharmacyNotes && (
                                <div className="p-3 bg-accent/50 rounded-lg">
                                    <p className="text-sm font-medium">Pharmacy Notes</p>
                                    <p className="text-sm text-muted-foreground">
                                        {selectedPrescription.pharmacyNotes}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Lab Result Detail Dialog */}
            <Dialog open={!!selectedLabRequest} onOpenChange={() => setSelectedLabRequest(null)}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Lab Results</DialogTitle>
                        <DialogDescription>
                            {selectedLabRequest && `Ordered by ${selectedLabRequest.doctorName}`}
                        </DialogDescription>
                    </DialogHeader>
                    {selectedLabRequest && (
                        <ScrollArea className="max-h-[60vh]">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">
                                        {format(new Date(selectedLabRequest.createdAt), "MMM d, yyyy")}
                                    </span>
                                    <StatusBadge variant={getStatusVariant(selectedLabRequest.status)}>
                                        {selectedLabRequest.status}
                                    </StatusBadge>
                                </div>

                                <div>
                                    <h4 className="font-medium mb-2">Tests Ordered</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedLabRequest.tests.map((test) => (
                                            <span key={test.id} className="px-2 py-1 bg-accent rounded text-sm">
                                                {test.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {selectedLabRequest.results && selectedLabRequest.results.length > 0 && (
                                    <div>
                                        <h4 className="font-medium mb-2">Results</h4>
                                        <div className="border rounded-lg overflow-hidden">
                                            <table className="w-full text-sm">
                                                <thead className="bg-muted">
                                                    <tr>
                                                        <th className="text-left p-2 font-medium">Test</th>
                                                        <th className="text-left p-2 font-medium">Value</th>
                                                        <th className="text-left p-2 font-medium">Reference</th>
                                                        <th className="text-left p-2 font-medium">Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {selectedLabRequest.results.map((result, idx) => (
                                                        <tr key={idx} className="border-t">
                                                            <td className="p-2">{result.testName}</td>
                                                            <td className="p-2">
                                                                {result.value} {result.unit}
                                                            </td>
                                                            <td className="p-2 text-muted-foreground">
                                                                {result.referenceRange}
                                                            </td>
                                                            <td className="p-2">
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
                                    </div>
                                )}

                                {selectedLabRequest.resultNotes && (
                                    <div className="p-3 bg-accent/50 rounded-lg">
                                        <p className="text-sm font-medium">Notes</p>
                                        <p className="text-sm text-muted-foreground">
                                            {selectedLabRequest.resultNotes}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
