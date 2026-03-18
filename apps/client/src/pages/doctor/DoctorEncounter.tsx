import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AppointmentService, AppointmentStatus, DiagnosticTestService, MedicineService } from "@mediflow/mediflow-api";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CardSkeleton } from "@/components/ui/loading-skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { StatusBadge, getStatusVariant } from "@/components/ui/status-badge";
import {
    ArrowLeft,
    Pill,
    FlaskConical,
    Save,
    Plus,
    X,
    Loader2,
    Calendar,
    Clock,
    Stethoscope
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { combineDateAndTime } from "@/lib/datetime";
import { getErrorMessage, getResponseMessage } from "@/lib/api";
import { getAvatarUrl } from "@/lib/auth";

const encounterSchema = z.object({
    notes: z.string().min(10, "Notes must be at least 10 characters"),
    diagnosis: z.string().min(5, "Diagnosis is required"),
    treatmentPlan: z.string().min(10, "Treatment plan is required"),
    prescriptions: z.string().optional()
});

type EncounterForm = z.infer<typeof encounterSchema>;

interface MedicineItem {
    id: string;
    medicineId: string;
    name: string;
    dose: string;
    frequency: string;
    duration: string;
    instructions: string;
}

export default function DoctorEncounter() {
    const { appointmentId } = useParams<{ appointmentId: string }>();
    const queryClient = useQueryClient();
    const [prescriptionOpen, setPrescriptionOpen] = useState(false);
    const [labRequestOpen, setLabRequestOpen] = useState(false);

    const [medicines, setMedicines] = useState<MedicineItem[]>([]);
    const [newMedicine, setNewMedicine] = useState<Partial<MedicineItem>>({});

    const [selectedTests, setSelectedTests] = useState<string[]>([]);
    const [labNotes, setLabNotes] = useState("");

    const { data: appointmentData, isLoading } = useQuery({
        queryKey: ["appointment", appointmentId],
        enabled: !!appointmentId,
        queryFn: async () => AppointmentService.getAppointmentById({ appointmentId: appointmentId! })
    });

    const { data: testsData } = useQuery({
        queryKey: ["diagnostic-tests"],
        queryFn: async () => DiagnosticTestService.getAllDiagnosticTestsList({})
    });

    const { data: medicinesData } = useQuery({
        queryKey: ["medicines"],
        queryFn: async () => MedicineService.getAllMedicinesList({})
    });

    const tests = testsData?.result ?? [];
    const medicineOptions = medicinesData?.result ?? [];

    const appointment = appointmentData?.result || null;
    const appointmentDate = combineDateAndTime(appointment?.timeslot?.date, appointment?.timeslot?.startTime);
    const appointmentEnd = combineDateAndTime(appointment?.timeslot?.date, appointment?.timeslot?.endTime);
    const patientInitials =
        appointment?.patient?.name
            ?.split(" ")
            .map((n) => n[0])
            .join("")
            .slice(0, 2) || "P";

    const isPaid = appointment?.isPaidViaGateway || appointment?.isPaidViaOfflineMedium;
    const paymentLabel = appointment?.isPaidViaGateway
        ? "Paid via Credits"
        : appointment?.isPaidViaOfflineMedium
          ? "Paid Offline"
          : "Unpaid";

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<EncounterForm>({
        resolver: zodResolver(encounterSchema)
    });

    const consultMutation = useMutation({
        mutationFn: async (data: EncounterForm) => {
            if (!appointmentId) throw new Error("Missing appointment");
            return AppointmentService.consultAppointment({
                appointmentId,
                requestBody: {
                    appointmentId,
                    diagnosis: data.diagnosis,
                    treatment: data.treatmentPlan,
                    notes: data.notes,
                    prescriptions: data.prescriptions,
                    diagnostics:
                        selectedTests.length > 0
                            ? [
                                  {
                                      notes: labNotes,
                                      diagnosticTests: selectedTests.map((testId) => ({
                                          diagnosticTestId: testId
                                      }))
                                  }
                              ]
                            : [],
                    medications:
                        medicines.length > 0
                            ? [
                                  {
                                      notes: data.prescriptions || "",
                                      drugs: medicines.map((med) => ({
                                          medicineId: med.medicineId,
                                          dose: med.dose,
                                          frequency: med.frequency,
                                          duration: med.duration,
                                          instructions: med.instructions
                                      }))
                                  }
                              ]
                            : []
                }
            });
        },
        onSuccess: (data) => {
            toast.success(getResponseMessage(data));
            queryClient.invalidateQueries({ queryKey: ["appointment", appointmentId] });
        },
        onError: (error) => toast.error(getErrorMessage(error))
    });

    const isEncounterLocked =
        consultMutation.isSuccess ||
        appointment?.status === AppointmentStatus.COMPLETED ||
        appointment?.status === AppointmentStatus.CANCELED ||
        !!appointment?.medicalRecords;

    const addMedicine = () => {
        if (newMedicine.medicineId && newMedicine.dose) {
            const selected = medicineOptions.find((m) => m.id === newMedicine.medicineId);
            setMedicines((prev) => [
                ...prev,
                {
                    id: Date.now().toString(),
                    medicineId: newMedicine.medicineId || "",
                    name: selected?.title || newMedicine.name || "Medicine",
                    dose: newMedicine.dose || "",
                    frequency: newMedicine.frequency || "Once daily",
                    duration: newMedicine.duration || "7 days",
                    instructions: newMedicine.instructions || ""
                }
            ]);
            setNewMedicine({});
        }
    };

    const removeMedicine = (id: string) => {
        setMedicines((prev) => prev.filter((m) => m.id !== id));
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <PageHeader title="Encounter" />
                <CardSkeleton />
            </div>
        );
    }

    if (!appointment) {
        return (
            <div className="space-y-6">
                <PageHeader title="Appointment Not Found" />
                <Button asChild>
                    <Link to="/doctor/appointments">Back to Appointments</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link to="/doctor/appointments">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <PageHeader
                        title="Patient Encounter"
                        description={appointmentDate ? format(appointmentDate, "MMMM d, yyyy") : ""}
                    />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge variant={getStatusVariant(appointment.status || "scheduled")}>
                        {appointment.status}
                    </StatusBadge>
                    <Badge
                        variant={isPaid ? "secondary" : "outline"}
                        className={
                            isPaid
                                ? "bg-emerald-600 text-white hover:bg-emerald-600"
                                : "border-rose-200 text-rose-600"
                        }
                    >
                        {paymentLabel}
                    </Badge>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
                <div className="space-y-6">
                    {isEncounterLocked && (
                        <Card className="border-amber-200 bg-amber-50/70">
                            <CardContent className="p-4 text-sm text-amber-900">
                                This encounter has been completed. Editing is now locked.
                            </CardContent>
                        </Card>
                    )}
                    <Card className="border-border/60 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-base">Clinical Notes</CardTitle>
                            <p className="text-sm text-muted-foreground">
                                Capture the diagnosis, treatment plan, and supporting notes.
                            </p>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit((data) => consultMutation.mutate(data))} className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="diagnosis">Diagnosis *</Label>
                                        <Input
                                            id="diagnosis"
                                            {...register("diagnosis")}
                                            placeholder="Enter diagnosis with ICD code if applicable"
                                            disabled={isEncounterLocked || consultMutation.isPending}
                                            className={errors.diagnosis ? "border-destructive" : ""}
                                        />
                                        {errors.diagnosis && (
                                            <p className="text-xs text-destructive">{errors.diagnosis.message}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="treatmentPlan">Treatment Plan *</Label>
                                        <Input
                                            id="treatmentPlan"
                                            {...register("treatmentPlan")}
                                            placeholder="Outline the treatment approach"
                                            disabled={isEncounterLocked || consultMutation.isPending}
                                            className={errors.treatmentPlan ? "border-destructive" : ""}
                                        />
                                        {errors.treatmentPlan && (
                                            <p className="text-xs text-destructive">{errors.treatmentPlan.message}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="notes">Clinical Notes *</Label>
                                    <Textarea
                                        id="notes"
                                        {...register("notes")}
                                        placeholder="Document patient symptoms, examination findings..."
                                        rows={4}
                                        disabled={isEncounterLocked || consultMutation.isPending}
                                        className={errors.notes ? "border-destructive" : ""}
                                    />
                                    {errors.notes && <p className="text-xs text-destructive">{errors.notes.message}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="prescriptions">Prescriptions Summary</Label>
                                    <Input
                                        id="prescriptions"
                                        {...register("prescriptions")}
                                        placeholder="e.g., Continue current medications"
                                        disabled={isEncounterLocked || consultMutation.isPending}
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full"
                                    disabled={consultMutation.isPending || isEncounterLocked}
                                >
                                    {consultMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    <Save className="h-4 w-4 mr-2" />
                                    Save Encounter
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    <Card className="border-border/60 shadow-sm">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-base">Orders & Prescriptions</CardTitle>
                                <Badge variant="secondary">
                                    {medicines.length} Medications • {selectedTests.length} Diagnostic Tests
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <p className="text-sm font-medium">Medications</p>
                                {medicines.length > 0 ? (
                                    <div className="space-y-2">
                                        {medicines.map((med) => (
                                            <div
                                                key={med.id}
                                                className="flex items-center justify-between p-3 bg-accent/50 rounded-lg"
                                            >
                                                <div>
                                                    <p className="font-medium">
                                                        {med.name} {med.dose}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {med.frequency} • {med.duration}
                                                    </p>
                                                </div>
                                                <Button variant="ghost" size="icon" onClick={() => removeMedicine(med.id)}>
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground">No medications added yet.</p>
                                )}
                                <Button
                                    variant="outline"
                                    className="w-full justify-start"
                                    onClick={() => setPrescriptionOpen(true)}
                                    disabled={isEncounterLocked}
                                >
                                    <Pill className="h-4 w-4 mr-2" />
                                    Add Medication
                                </Button>
                            </div>

                            <div className="space-y-2">
                                <p className="text-sm font-medium">Lab Requests</p>
                                {selectedTests.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {selectedTests.map((testId) => {
                                            const test = tests.find((t) => t.id === testId);
                                            return (
                                                <span key={testId} className="px-2 py-1 rounded bg-accent text-sm">
                                                    {test?.title || "Test"}
                                                </span>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground">No lab tests selected.</p>
                                )}
                                <Button
                                    variant="outline"
                                    className="w-full justify-start"
                                    onClick={() => setLabRequestOpen(true)}
                                    disabled={isEncounterLocked}
                                >
                                    <FlaskConical className="h-4 w-4 mr-2" />
                                    Order Lab Tests
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-4">
                    <Card className="border-border/60 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-base">Patient Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center gap-4">
                                <Avatar className="h-14 w-14 ring-2 ring-primary/10">
                                    <AvatarImage
                                        src={getAvatarUrl(appointment.patient?.profileImage?.fileUrl)}
                                        alt={appointment.patient?.name || "Patient"}
                                    />
                                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                                        {patientInitials}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <h3 className="font-semibold">{appointment.patient?.name}</h3>
                                    <p className="text-sm text-muted-foreground">
                                        {appointment.patient?.emailAddress || "No email on file"}
                                    </p>
                                    {appointment.patient?.phoneNumber && (
                                        <p className="text-sm text-muted-foreground">{appointment.patient.phoneNumber}</p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-border/60 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-base">Visit Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                <span>
                                    {appointmentDate ? format(appointmentDate, "MMMM d, yyyy") : "Date not set"}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                <span>
                                    {appointmentDate && appointmentEnd
                                        ? `${format(appointmentDate, "h:mm a")} - ${format(appointmentEnd, "h:mm a")}`
                                        : ""}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Stethoscope className="h-4 w-4" />
                                <span>Fee: Rs. {appointment.fee ?? 0}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">Payment:</span>
                                <Badge
                                    variant={isPaid ? "secondary" : "outline"}
                                    className={
                                        isPaid
                                            ? "bg-emerald-600 text-white hover:bg-emerald-600"
                                            : "border-rose-200 text-rose-600"
                                    }
                                >
                                    {paymentLabel}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <Dialog open={prescriptionOpen} onOpenChange={setPrescriptionOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Create Prescription</DialogTitle>
                        <DialogDescription>Add medications for {appointment.patient?.name}</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3 p-4 border rounded-lg">
                            <div className="col-span-2">
                                <Label>Medicine</Label>
                                <Select
                                    value={newMedicine.medicineId || ""}
                                    onValueChange={(value) =>
                                        setNewMedicine((prev) => ({ ...prev, medicineId: value }))
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select medicine" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-popover">
                                        {medicineOptions.map((med) => (
                                            <SelectItem key={med.id} value={med.id || ""}>
                                                {med.title}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Dosage</Label>
                                <Input
                                    value={newMedicine.dose || ""}
                                    onChange={(e) => setNewMedicine((prev) => ({ ...prev, dose: e.target.value }))}
                                    placeholder="e.g., 500mg"
                                />
                            </div>
                            <div>
                                <Label>Frequency</Label>
                                <Select
                                    value={newMedicine.frequency || ""}
                                    onValueChange={(v) => setNewMedicine((prev) => ({ ...prev, frequency: v }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-popover">
                                        <SelectItem value="Once daily">Once daily</SelectItem>
                                        <SelectItem value="Twice daily">Twice daily</SelectItem>
                                        <SelectItem value="Three times daily">Three times daily</SelectItem>
                                        <SelectItem value="Every 6 hours">Every 6 hours</SelectItem>
                                        <SelectItem value="As needed">As needed</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Duration</Label>
                                <Select
                                    value={newMedicine.duration || ""}
                                    onValueChange={(v) => setNewMedicine((prev) => ({ ...prev, duration: v }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-popover">
                                        <SelectItem value="3 days">3 days</SelectItem>
                                        <SelectItem value="5 days">5 days</SelectItem>
                                        <SelectItem value="7 days">7 days</SelectItem>
                                        <SelectItem value="14 days">14 days</SelectItem>
                                        <SelectItem value="30 days">30 days</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="col-span-2">
                                <Label>Instructions</Label>
                                <Input
                                    value={newMedicine.instructions || ""}
                                    onChange={(e) =>
                                        setNewMedicine((prev) => ({ ...prev, instructions: e.target.value }))
                                    }
                                    placeholder="e.g., Take with food"
                                />
                            </div>
                            <div className="col-span-2">
                                <Button type="button" variant="outline" onClick={addMedicine} className="w-full">
                                    <Plus className="h-4 w-4 mr-1" />
                                    Add Medicine
                                </Button>
                            </div>
                        </div>

                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setPrescriptionOpen(false)}>
                                Close
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={labRequestOpen} onOpenChange={setLabRequestOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Order Lab Tests</DialogTitle>
                        <DialogDescription>Select tests for {appointment.patient?.name}</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label>Select Tests</Label>
                            <ScrollArea className="h-48 border rounded-lg p-3 mt-1">
                                <div className="space-y-2">
                                    {tests.map((test) => (
                                        <div key={test.id} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={test.id}
                                                checked={selectedTests.includes(test.id || "")}
                                                onCheckedChange={(checked) => {
                                                    if (checked) {
                                                        setSelectedTests((prev) => [...prev, test.id || ""]);
                                                    } else {
                                                        setSelectedTests((prev) => prev.filter((t) => t !== test.id));
                                                    }
                                                }}
                                            />
                                            <label htmlFor={test.id} className="text-sm cursor-pointer flex-1">
                                                {test.title}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </div>

                        <div>
                            <Label>Clinical Notes</Label>
                            <Textarea
                                value={labNotes}
                                onChange={(e) => setLabNotes(e.target.value)}
                                placeholder="Reason for tests..."
                                rows={2}
                            />
                        </div>

                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setLabRequestOpen(false)}>
                                Close
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
