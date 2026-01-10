import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { StatusBadge, getStatusVariant } from "@/components/ui/status-badge";
import { CardSkeleton } from "@/components/ui/loading-skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { mockPrescriptions, Prescription, PrescriptionStatus } from "@/mock/prescriptions";
import { ArrowLeft, User, Pill, Loader2, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export default function PharmacyPrescriptionDetail() {
    const { id } = useParams<{ id: string }>();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [prescription, setPrescription] = useState<Prescription | null>(null);
    const [dispensedItems, setDispensedItems] = useState<Set<string>>(new Set());
    const [pharmacyNotes, setPharmacyNotes] = useState("");
    const [status, setStatus] = useState<PrescriptionStatus>("pending");

    useEffect(() => {
        const timer = setTimeout(() => {
            const rx = mockPrescriptions.find((r) => r.id === id);
            setPrescription(rx || null);
            if (rx) {
                setStatus(rx.status);
                setPharmacyNotes(rx.pharmacyNotes || "");
                const dispensed = new Set(rx.items.filter((i) => i.dispensed).map((i) => i.id));
                setDispensedItems(dispensed);
            }
            setLoading(false);
        }, 400);
        return () => clearTimeout(timer);
    }, [id]);

    const toggleDispensed = (itemId: string) => {
        setDispensedItems((prev) => {
            const next = new Set(prev);
            if (next.has(itemId)) {
                next.delete(itemId);
            } else {
                next.add(itemId);
            }
            return next;
        });
    };

    const handleSave = async () => {
        if (!prescription) return;

        setSaving(true);
        await new Promise((resolve) => setTimeout(resolve, 600));

        const allDispensed = prescription.items.every((item) => dispensedItems.has(item.id));
        const someDispensed = prescription.items.some((item) => dispensedItems.has(item.id));

        let newStatus: PrescriptionStatus = status;
        if (allDispensed) {
            newStatus = "dispensed";
        } else if (someDispensed) {
            newStatus = "partially-dispensed";
        }

        setPrescription((prev) =>
            prev
                ? {
                      ...prev,
                      status: newStatus,
                      pharmacyNotes,
                      items: prev.items.map((item) => ({
                          ...item,
                          dispensed: dispensedItems.has(item.id)
                      })),
                      dispensedBy: "David Thompson",
                      dispensedAt: new Date().toISOString()
                  }
                : null
        );

        setStatus(newStatus);
        toast.success("Prescription updated successfully");
        setSaving(false);
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <PageHeader title="Prescription" />
                <CardSkeleton />
            </div>
        );
    }

    if (!prescription) {
        return (
            <div className="space-y-6">
                <PageHeader title="Prescription Not Found" />
                <Button asChild>
                    <Link to="/pharmacy/prescriptions">Back to Prescriptions</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link to="/pharmacy/prescriptions">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                </Button>
                <PageHeader
                    title={`Prescription #${prescription.id.slice(-4)}`}
                    description={format(new Date(prescription.createdAt), "MMMM d, yyyy")}
                />
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Prescription Info */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Prescription Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                                <User className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <p className="font-medium">{prescription.patientName}</p>
                                <p className="text-sm text-muted-foreground">Patient</p>
                            </div>
                        </div>

                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Prescribed by</span>
                                <span>{prescription.doctorName}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Date</span>
                                <span>{format(new Date(prescription.createdAt), "MMM d, yyyy")}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Status</span>
                                <StatusBadge variant={getStatusVariant(status)}>{status}</StatusBadge>
                            </div>
                        </div>

                        {prescription.dispensedBy && (
                            <div className="pt-4 border-t text-sm text-muted-foreground">
                                Dispensed by {prescription.dispensedBy}
                                {prescription.dispensedAt && (
                                    <> on {format(new Date(prescription.dispensedAt), "MMM d, h:mm a")}</>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Medications & Dispense Panel */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-base">Medications</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-3">
                            {prescription.items.map((item) => (
                                <div
                                    key={item.id}
                                    className={`flex items-start justify-between p-4 border rounded-lg transition-colors ${
                                        dispensedItems.has(item.id)
                                            ? "bg-status-success-bg border-status-success/30"
                                            : ""
                                    }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <Checkbox
                                            id={item.id}
                                            checked={dispensedItems.has(item.id)}
                                            onCheckedChange={() => toggleDispensed(item.id)}
                                            disabled={status === "dispensed"}
                                        />
                                        <div>
                                            <label htmlFor={item.id} className="font-medium cursor-pointer">
                                                {item.medicineName} {item.dosage}
                                            </label>
                                            <p className="text-sm text-muted-foreground">
                                                {item.frequency} • {item.duration}
                                            </p>
                                            <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                                            {item.instructions && (
                                                <p className="text-xs text-muted-foreground mt-1 italic">
                                                    {item.instructions}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    {dispensedItems.has(item.id) && (
                                        <CheckCircle className="h-5 w-5 text-status-success flex-shrink-0" />
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="pt-4 border-t">
                            <Label>Status</Label>
                            <Select
                                value={status}
                                onValueChange={(v) => setStatus(v as PrescriptionStatus)}
                                disabled={status === "dispensed"}
                            >
                                <SelectTrigger className="mt-1">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-popover">
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="partially-dispensed">Partially Dispensed</SelectItem>
                                    <SelectItem value="dispensed">Dispensed</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label>Pharmacy Notes</Label>
                            <Textarea
                                value={pharmacyNotes}
                                onChange={(e) => setPharmacyNotes(e.target.value)}
                                placeholder="Add any notes about dispensing..."
                                rows={3}
                                className="mt-1"
                                disabled={status === "dispensed"}
                            />
                        </div>

                        {status !== "dispensed" && (
                            <Button className="w-full" onClick={handleSave} disabled={saving}>
                                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                <Pill className="h-4 w-4 mr-2" />
                                Save & Update
                            </Button>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
