import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { mockAppointments, Appointment } from "@/mock/appointments";
import { availableLabTests } from "@/mock/labRequests";
import { ArrowLeft, User, Pill, FlaskConical, Save, Plus, X, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

const encounterSchema = z.object({
    notes: z.string().min(10, "Notes must be at least 10 characters"),
    diagnosis: z.string().min(5, "Diagnosis is required"),
    treatmentPlan: z.string().min(10, "Treatment plan is required"),
    followUp: z.string().optional()
});

type EncounterForm = z.infer<typeof encounterSchema>;

interface MedicineItem {
    id: string;
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
}

export default function DoctorEncounter() {
    const { appointmentId } = useParams<{ appointmentId: string }>();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [appointment, setAppointment] = useState<Appointment | null>(null);

    const [prescriptionOpen, setPrescriptionOpen] = useState(false);
    const [labRequestOpen, setLabRequestOpen] = useState(false);

    const [medicines, setMedicines] = useState<MedicineItem[]>([]);
    const [newMedicine, setNewMedicine] = useState<Partial<MedicineItem>>({});

    const [selectedTests, setSelectedTests] = useState<string[]>([]);
    const [labPriority, setLabPriority] = useState("routine");
    const [labNotes, setLabNotes] = useState("");

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<EncounterForm>({
        resolver: zodResolver(encounterSchema)
    });

    useEffect(() => {
        const timer = setTimeout(() => {
            const apt = mockAppointments.find((a) => a.id === appointmentId);
            setAppointment(apt || null);
            setLoading(false);
        }, 400);
        return () => clearTimeout(timer);
    }, [appointmentId]);

    const onSubmitEncounter = async (data: EncounterForm) => {
        setSaving(true);
        await new Promise((resolve) => setTimeout(resolve, 500));
        console.log("Encounter data:", data);
        toast.success("Encounter saved successfully");
        setSaving(false);
    };

    const addMedicine = () => {
        if (newMedicine.name && newMedicine.dosage) {
            setMedicines((prev) => [
                ...prev,
                {
                    id: Date.now().toString(),
                    name: newMedicine.name || "",
                    dosage: newMedicine.dosage || "",
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

    const savePrescription = () => {
        if (medicines.length === 0) {
            toast.error("Please add at least one medicine");
            return;
        }
        console.log("Prescription:", medicines);
        toast.success("Prescription created");
        setPrescriptionOpen(false);
    };

    const saveLabRequest = () => {
        if (selectedTests.length === 0) {
            toast.error("Please select at least one test");
            return;
        }
        console.log("Lab request:", { tests: selectedTests, priority: labPriority, notes: labNotes });
        toast.success("Lab request created");
        setLabRequestOpen(false);
        setSelectedTests([]);
    };

    if (loading) {
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
                    description={format(new Date(appointment.dateTime), "MMMM d, yyyy")}
                />
            </div>

            <div className="grid gap-6 lg:grid-cols-4">
                {/* Left: Patient Summary */}
                <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle className="text-base">Patient</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col items-center text-center">
                            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                                <User className="h-8 w-8 text-primary" />
                            </div>
                            <h3 className="font-semibold">{appointment.patientName}</h3>
                            <p className="text-sm text-muted-foreground capitalize">{appointment.type}</p>
                        </div>

                        <div className="mt-6 space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Allergies</span>
                                <span>None known</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Blood Type</span>
                                <span>O+</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Center: Encounter Form */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-base">Encounter Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit(onSubmitEncounter)} className="space-y-4">
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
                                <Label htmlFor="followUp">Follow-up</Label>
                                <Input
                                    id="followUp"
                                    {...register("followUp")}
                                    placeholder="e.g., Return in 2 weeks if symptoms persist"
                                />
                            </div>

                            <Button type="submit" className="w-full" disabled={saving}>
                                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                <Save className="h-4 w-4 mr-2" />
                                Save Encounter
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Right: Actions Panel */}
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

            {/* Prescription Dialog */}
            <Dialog open={prescriptionOpen} onOpenChange={setPrescriptionOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Create Prescription</DialogTitle>
                        <DialogDescription>Add medications for {appointment.patientName}</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        {/* Added Medicines */}
                        {medicines.length > 0 && (
                            <div className="space-y-2">
                                {medicines.map((med) => (
                                    <div
                                        key={med.id}
                                        className="flex items-center justify-between p-3 bg-accent/50 rounded-lg"
                                    >
                                        <div>
                                            <p className="font-medium">
                                                {med.name} {med.dosage}
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

                        {/* Add Medicine Form */}
                        <div className="grid grid-cols-2 gap-3 p-4 border rounded-lg">
                            <div>
                                <Label>Medicine Name</Label>
                                <Input
                                    value={newMedicine.name || ""}
                                    onChange={(e) => setNewMedicine((prev) => ({ ...prev, name: e.target.value }))}
                                    placeholder="e.g., Amoxicillin"
                                />
                            </div>
                            <div>
                                <Label>Dosage</Label>
                                <Input
                                    value={newMedicine.dosage || ""}
                                    onChange={(e) => setNewMedicine((prev) => ({ ...prev, dosage: e.target.value }))}
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
                                Cancel
                            </Button>
                            <Button onClick={savePrescription}>Save Prescription</Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Lab Request Dialog */}
            <Dialog open={labRequestOpen} onOpenChange={setLabRequestOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Order Lab Tests</DialogTitle>
                        <DialogDescription>Select tests for {appointment.patientName}</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label>Priority</Label>
                            <Select value={labPriority} onValueChange={setLabPriority}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-popover">
                                    <SelectItem value="routine">Routine</SelectItem>
                                    <SelectItem value="urgent">Urgent</SelectItem>
                                    <SelectItem value="stat">STAT</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label>Select Tests</Label>
                            <ScrollArea className="h-48 border rounded-lg p-3 mt-1">
                                <div className="space-y-2">
                                    {availableLabTests.map((test) => (
                                        <div key={test.id} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={test.id}
                                                checked={selectedTests.includes(test.id)}
                                                onCheckedChange={(checked) => {
                                                    if (checked) {
                                                        setSelectedTests((prev) => [...prev, test.id]);
                                                    } else {
                                                        setSelectedTests((prev) => prev.filter((t) => t !== test.id));
                                                    }
                                                }}
                                            />
                                            <label htmlFor={test.id} className="text-sm cursor-pointer flex-1">
                                                {test.name}
                                                <span className="text-muted-foreground ml-2">({test.category})</span>
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
                                Cancel
                            </Button>
                            <Button onClick={saveLabRequest}>Submit Request</Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
