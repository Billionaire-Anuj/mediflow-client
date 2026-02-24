import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AppointmentService, DiagnosticTestService, MedicineService } from "@mediflow/mediflow-api";
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
import { ArrowLeft, User, Pill, FlaskConical, Save, Plus, X, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { combineDateAndTime } from "@/lib/datetime";

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
        onSuccess: () => {
            toast.success("Encounter saved successfully");
        },
        onError: () => {
            toast.error("Failed to save encounter");
        }
    });

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

            <div className="grid gap-6 lg:grid-cols-4">
                <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle className="text-base">Patient</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col items-center text-center">
                            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                                <User className="h-8 w-8 text-primary" />
                            </div>
                            <h3 className="font-semibold">{appointment.patient?.name}</h3>
                            <p className="text-sm text-muted-foreground">{appointment.patient?.emailAddress}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-base">Encounter Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit((data) => consultMutation.mutate(data))} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="notes">Clinical Notes *</Label>
                                <Textarea
                                    id="notes"
                                    {...register("notes")}
                                    placeholder="Document patient symptoms, examination findings..."
                                    rows={4}
                                    className={errors.notes ? "border-destructive" : ""}
                                />
                                {errors.notes && <p className="text-xs text-destructive">{errors.notes.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="diagnosis">Diagnosis *</Label>
                                <Input
                                    id="diagnosis"
                                    {...register("diagnosis")}
                                    placeholder="Enter diagnosis with ICD code if applicable"
                                    className={errors.diagnosis ? "border-destructive" : ""}
                                />
                                {errors.diagnosis && (
                                    <p className="text-xs text-destructive">{errors.diagnosis.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="treatmentPlan">Treatment Plan *</Label>
                                <Textarea
                                    id="treatmentPlan"
                                    {...register("treatmentPlan")}
                                    placeholder="Outline the treatment approach..."
                                    rows={3}
                                    className={errors.treatmentPlan ? "border-destructive" : ""}
                                />
                                {errors.treatmentPlan && (
                                    <p className="text-xs text-destructive">{errors.treatmentPlan.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="prescriptions">Prescriptions Summary</Label>
                                <Input
                                    id="prescriptions"
                                    {...register("prescriptions")}
                                    placeholder="e.g., Continue current medications"
                                />
                            </div>

                            <Button type="submit" className="w-full" disabled={consultMutation.isPending}>
                                {consultMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                <Save className="h-4 w-4 mr-2" />
                                Save Encounter
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle className="text-base">Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <Button
                            variant="outline"
                            className="w-full justify-start"
                            onClick={() => setPrescriptionOpen(true)}
                        >
                            <Pill className="h-4 w-4 mr-2" />
                            Create Prescription
                        </Button>
                        <Button
                            variant="outline"
                            className="w-full justify-start"
                            onClick={() => setLabRequestOpen(true)}
                        >
                            <FlaskConical className="h-4 w-4 mr-2" />
                            Order Lab Tests
                        </Button>
                    </CardContent>
                </Card>
            </div>

            <Dialog open={prescriptionOpen} onOpenChange={setPrescriptionOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Create Prescription</DialogTitle>
                        <DialogDescription>Add medications for {appointment.patient?.name}</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        {medicines.length > 0 && (
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
                        )}

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
