import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppointmentService, PatientService, type AppointmentDto, type AppointmentDiagnosticsDto, type AppointmentMedicationsDto } from "@mediflow/mediflow-api";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge, getStatusVariant } from "@/components/ui/status-badge";
import { ListSkeleton } from "@/components/ui/loading-skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Pill, FlaskConical, User } from "lucide-react";
import { format } from "date-fns";
import { combineDateAndTime } from "@/lib/datetime";

interface EncounterSummary {
    appointment: AppointmentDto;
}

interface PrescriptionSummary {
    appointment: AppointmentDto;
    medication: AppointmentMedicationsDto;
}

interface LabSummary {
    appointment: AppointmentDto;
    diagnostics: AppointmentDiagnosticsDto;
}

export default function PatientRecords() {
    const [selectedEncounter, setSelectedEncounter] = useState<EncounterSummary | null>(null);
    const [selectedPrescription, setSelectedPrescription] = useState<PrescriptionSummary | null>(null);
    const [selectedLabRequest, setSelectedLabRequest] = useState<LabSummary | null>(null);

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

    const encounters = useMemo<EncounterSummary[]>(() => {
        return appointments
            .filter((apt) => apt.medicalRecords)
            .map((apt) => ({ appointment: apt }));
    }, [appointments]);

    const prescriptions = useMemo<PrescriptionSummary[]>(() => {
        const list: PrescriptionSummary[] = [];
        appointments.forEach((apt) => {
            (apt.medications || []).forEach((med) => {
                list.push({ appointment: apt, medication: med });
            });
        });
        return list;
    }, [appointments]);

    const labs = useMemo<LabSummary[]>(() => {
        const list: LabSummary[] = [];
        appointments.forEach((apt) => {
            (apt.diagnostics || []).forEach((diag) => {
                list.push({ appointment: apt, diagnostics: diag });
            });
        });
        return list;
    }, [appointments]);

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
                        Lab Results ({labs.length})
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="encounters" className="space-y-4">
                    {encounters.length === 0 ? (
                        <EmptyState
                            icon={FileText}
                            title="No encounters"
                            description="Your consultation records will appear here"
                        />
                    ) : (
                        encounters.map((enc) => {
                            const start = combineDateAndTime(
                                enc.appointment.timeslot?.date,
                                enc.appointment.timeslot?.startTime
                            );
                            return (
                                <Card
                                    key={enc.appointment.id}
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
                                                    <h3 className="font-medium">{enc.appointment.doctor?.name}</h3>
                                                    <p className="text-sm text-muted-foreground">
                                                        {enc.appointment.medicalRecords?.diagnosis || "Diagnosis"}
                                                    </p>
                                                    {start && (
                                                        <p className="text-xs text-muted-foreground mt-1">
                                                            {format(start, "MMM d, yyyy")}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <Button variant="ghost" size="sm">
                                                View
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })
                    )}
                </TabsContent>

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
                                key={rx.medication.id}
                                className="card-interactive cursor-pointer"
                                onClick={() => setSelectedPrescription(rx)}
                            >
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-medium">{rx.appointment.doctor?.name}</h3>
                                                <StatusBadge variant={getStatusVariant(rx.medication.status || "pending")}
                                                >
                                                    {rx.medication.status}
                                                </StatusBadge>
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                {(rx.medication.drugs || []).length} medication
                                                {(rx.medication.drugs || []).length !== 1 ? "s" : ""}
                                            </p>
                                            {rx.appointment.bookedDate && (
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {format(new Date(rx.appointment.bookedDate), "MMM d, yyyy")}
                                                </p>
                                            )}
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

                <TabsContent value="labs" className="space-y-4">
                    {labs.length === 0 ? (
                        <EmptyState
                            icon={FlaskConical}
                            title="No lab results"
                            description="Your lab results will appear here"
                        />
                    ) : (
                        labs.map((lab) => (
                            <Card
                                key={lab.diagnostics.id}
                                className="card-interactive cursor-pointer"
                                onClick={() => setSelectedLabRequest(lab)}
                            >
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-medium">
                                                    {(lab.diagnostics.diagnosticTests || [])
                                                        .map((t) => t.diagnosticTest?.title)
                                                        .filter(Boolean)
                                                        .join(", ") || "Lab Tests"}
                                                </h3>
                                                <StatusBadge variant={getStatusVariant(lab.diagnostics.status || "scheduled")}
                                                >
                                                    {lab.diagnostics.status}
                                                </StatusBadge>
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                Ordered by {lab.appointment.doctor?.name}
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

            <Dialog open={!!selectedEncounter} onOpenChange={() => setSelectedEncounter(null)}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Encounter Details</DialogTitle>
                        <DialogDescription>
                            {selectedEncounter &&
                                selectedEncounter.appointment.timeslot?.date &&
                                format(new Date(selectedEncounter.appointment.timeslot.date), "MMMM d, yyyy")}
                        </DialogDescription>
                    </DialogHeader>
                    {selectedEncounter && (
                        <ScrollArea className="max-h-[60vh]">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 p-3 bg-accent/50 rounded-lg">
                                    <User className="h-5 w-5 text-primary" />
                                    <div>
                                        <p className="font-medium">{selectedEncounter.appointment.doctor?.name}</p>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="font-medium mb-1">Notes</h4>
                                    <p className="text-sm text-muted-foreground">
                                        {selectedEncounter.appointment.medicalRecords?.notes || "No notes provided."}
                                    </p>
                                </div>
                                <div>
                                    <h4 className="font-medium mb-1">Diagnosis</h4>
                                    <p className="text-sm">
                                        {selectedEncounter.appointment.medicalRecords?.diagnosis || "Not specified"}
                                    </p>
                                </div>
                                <div>
                                    <h4 className="font-medium mb-1">Treatment Plan</h4>
                                    <p className="text-sm text-muted-foreground">
                                        {selectedEncounter.appointment.medicalRecords?.treatment || "Not specified"}
                                    </p>
                                </div>
                                {selectedEncounter.appointment.medicalRecords?.prescriptions && (
                                    <div>
                                        <h4 className="font-medium mb-1">Prescriptions</h4>
                                        <p className="text-sm text-muted-foreground">
                                            {selectedEncounter.appointment.medicalRecords?.prescriptions}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    )}
                </DialogContent>
            </Dialog>

            <Dialog open={!!selectedPrescription} onOpenChange={() => setSelectedPrescription(null)}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Prescription Details</DialogTitle>
                        <DialogDescription>
                            {selectedPrescription && `Prescribed by ${selectedPrescription.appointment.doctor?.name}`}
                        </DialogDescription>
                    </DialogHeader>
                    {selectedPrescription && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">
                                    {selectedPrescription.appointment.bookedDate
                                        ? format(new Date(selectedPrescription.appointment.bookedDate), "MMM d, yyyy")
                                        : ""}
                                </span>
                                <StatusBadge
                                    variant={getStatusVariant(selectedPrescription.medication.status || "pending")}
                                >
                                    {selectedPrescription.medication.status}
                                </StatusBadge>
                            </div>

                            <div className="space-y-3">
                                {(selectedPrescription.medication.drugs || []).map((item) => (
                                    <div key={item.id} className="p-3 border rounded-lg">
                                        <div className="flex items-center justify-between mb-1">
                                            <h4 className="font-medium">
                                                {item.medicine?.title} {item.dose}
                                            </h4>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            {item.frequency} • {item.duration}
                                        </p>
                                        {item.instructions && (
                                            <p className="text-xs text-muted-foreground mt-1">{item.instructions}</p>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {selectedPrescription.medication.notes && (
                                <div className="p-3 bg-accent/50 rounded-lg">
                                    <p className="text-sm font-medium">Pharmacy Notes</p>
                                    <p className="text-sm text-muted-foreground">
                                        {selectedPrescription.medication.notes}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            <Dialog open={!!selectedLabRequest} onOpenChange={() => setSelectedLabRequest(null)}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Lab Results</DialogTitle>
                        <DialogDescription>
                            {selectedLabRequest && `Ordered by ${selectedLabRequest.appointment.doctor?.name}`}
                        </DialogDescription>
                    </DialogHeader>
                    {selectedLabRequest && (
                        <ScrollArea className="max-h-[60vh]">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">
                                        {selectedLabRequest.appointment.bookedDate
                                            ? format(new Date(selectedLabRequest.appointment.bookedDate), "MMM d, yyyy")
                                            : ""}
                                    </span>
                                    <StatusBadge
                                        variant={getStatusVariant(selectedLabRequest.diagnostics.status || "scheduled")}
                                    >
                                        {selectedLabRequest.diagnostics.status}
                                    </StatusBadge>
                                </div>

                                <div>
                                    <h4 className="font-medium mb-2">Tests Ordered</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {(selectedLabRequest.diagnostics.diagnosticTests || []).map((test) => (
                                            <span key={test.id} className="px-2 py-1 bg-accent rounded text-sm">
                                                {test.diagnosticTest?.title}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h4 className="font-medium mb-2">Results</h4>
                                    <div className="border rounded-lg overflow-hidden">
                                        <table className="w-full text-sm">
                                            <thead className="bg-muted">
                                                <tr>
                                                    <th className="text-left p-2 font-medium">Test</th>
                                                    <th className="text-left p-2 font-medium">Value</th>
                                                    <th className="text-left p-2 font-medium">Reference</th>
                                                    <th className="text-left p-2 font-medium">Interpretation</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {(selectedLabRequest.diagnostics.diagnosticTests || []).map((result) => (
                                                    <tr key={result.id} className="border-t">
                                                        <td className="p-2">{result.diagnosticTest?.title}</td>
                                                        <td className="p-2">
                                                            {result.result?.value} {result.result?.unit}
                                                        </td>
                                                        <td className="p-2 text-muted-foreground">
                                                            {result.result?.lowerRange} - {result.result?.upperRange}
                                                        </td>
                                                        <td className="p-2">
                                                            {result.result?.interpretation || ""}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </ScrollArea>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
