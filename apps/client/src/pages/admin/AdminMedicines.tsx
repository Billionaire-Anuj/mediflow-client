import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    MedicineService,
    MedicationTypeService,
    type MedicineDto,
    type MedicationTypeDto
} from "@mediflow/mediflow-api";
import { PageHeader } from "@/components/ui/page-header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CardSkeleton } from "@/components/ui/loading-skeleton";
import { Plus, Edit, Trash2, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";

type EditItem = {
    mode: "create" | "edit";
    id?: string;
    title?: string;
    description?: string;
    medicationTypeId?: string;
    format?: string;
};

export default function AdminMedicines() {
    const queryClient = useQueryClient();
    const [editingItem, setEditingItem] = useState<EditItem | null>(null);

    const { data: medicineData, isLoading: medicineLoading } = useQuery({
        queryKey: ["medicines"],
        queryFn: async () => MedicineService.getAllMedicinesList({})
    });

    const { data: typeData, isLoading: typeLoading } = useQuery({
        queryKey: ["medication-types"],
        queryFn: async () => MedicationTypeService.getAllMedicationTypesList({})
    });

    const medicines = medicineData?.result ?? [];
    const medicationTypes = typeData?.result ?? [];

    const createMutation = useMutation({
        mutationFn: async (payload: EditItem) =>
            MedicineService.createMedicine({
                requestBody: {
                    title: payload.title,
                    description: payload.description,
                    format: payload.format,
                    medicationTypeId: payload.medicationTypeId
                }
            }),
        onSuccess: () => {
            toast.success("Medicine created");
            queryClient.invalidateQueries({ queryKey: ["medicines"] });
            setEditingItem(null);
        },
        onError: () => toast.error("Failed to create medicine")
    });

    const updateMutation = useMutation({
        mutationFn: async (payload: EditItem) =>
            MedicineService.updateMedicine({
                medicineId: payload.id || "",
                requestBody: {
                    id: payload.id,
                    title: payload.title,
                    description: payload.description,
                    format: payload.format,
                    medicationTypeId: payload.medicationTypeId
                }
            }),
        onSuccess: () => {
            toast.success("Medicine updated");
            queryClient.invalidateQueries({ queryKey: ["medicines"] });
            setEditingItem(null);
        },
        onError: () => toast.error("Failed to update medicine")
    });

    const toggleMutation = useMutation({
        mutationFn: async (id: string) => MedicineService.activateDeactivateMedicine({ medicineId: id }),
        onSuccess: () => {
            toast.success("Status updated");
            queryClient.invalidateQueries({ queryKey: ["medicines"] });
        },
        onError: () => toast.error("Failed to update status")
    });

    const handleSave = () => {
        if (!editingItem) return;
        if (editingItem.mode === "create") {
            createMutation.mutate(editingItem);
        } else {
            updateMutation.mutate(editingItem);
        }
    };

    if (medicineLoading || typeLoading) {
        return (
            <div className="space-y-6">
                <PageHeader title="Medicines" />
                <CardSkeleton />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader title="Medicines" description="Manage medicines and formats" />

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-base">Medicines</CardTitle>
                    <Button size="sm" variant="outline" onClick={() => setEditingItem({ mode: "create" })}>
                        <Plus className="h-4 w-4 mr-1" />
                        Add
                    </Button>
                </CardHeader>
                <CardContent className="space-y-2">
                    {medicines.map((item: MedicineDto) => (
                        <div key={item.id} className="flex items-center justify-between p-2 bg-accent/50 rounded">
                            <div>
                                <p className="text-sm font-medium">{item.title}</p>
                                <p className="text-xs text-muted-foreground">
                                    {(item.medicationType?.title || "Medication Type") +
                                        (item.format ? ` • ${item.format}` : "")}
                                </p>
                                {item.description && (
                                    <p className="text-xs text-muted-foreground">{item.description}</p>
                                )}
                            </div>
                            <div className="flex gap-1">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() =>
                                        setEditingItem({
                                            mode: "edit",
                                            id: item.id as string,
                                            title: item.title as string,
                                            description: item.description as string,
                                            medicationTypeId: item.medicationType?.id,
                                            format: item.format as string
                                        })
                                    }
                                >
                                    <Edit className="h-3 w-3" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-destructive"
                                    onClick={() => item.id && toggleMutation.mutate(item.id)}
                                >
                                    <Trash2 className="h-3 w-3" />
                                </Button>
                            </div>
                        </div>
                    ))}
                    {medicines.length === 0 && <div className="text-sm text-muted-foreground">No records found.</div>}
                </CardContent>
            </Card>

            <Dialog open={!!editingItem} onOpenChange={() => setEditingItem(null)}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>{editingItem?.mode === "create" ? "Add" : "Edit"} Medicine</DialogTitle>
                    </DialogHeader>
                    {editingItem && (
                        <div className="space-y-4">
                            <div>
                                <Label>Title</Label>
                                <Input
                                    value={editingItem.title || ""}
                                    onChange={(e) =>
                                        setEditingItem((prev) => (prev ? { ...prev, title: e.target.value } : prev))
                                    }
                                />
                            </div>
                            <div>
                                <Label>Description</Label>
                                <Input
                                    value={editingItem.description || ""}
                                    onChange={(e) =>
                                        setEditingItem((prev) =>
                                            prev ? { ...prev, description: e.target.value } : prev
                                        )
                                    }
                                />
                            </div>
                            <div>
                                <Label>Medication Type</Label>
                                <Select
                                    value={editingItem.medicationTypeId || ""}
                                    onValueChange={(value) =>
                                        setEditingItem((prev) => (prev ? { ...prev, medicationTypeId: value } : prev))
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-popover">
                                        {medicationTypes.map((type: MedicationTypeDto) => (
                                            <SelectItem key={type.id} value={type.id || ""}>
                                                {type.title}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Format</Label>
                                <Input
                                    value={editingItem.format || ""}
                                    onChange={(e) =>
                                        setEditingItem((prev) => (prev ? { ...prev, format: e.target.value } : prev))
                                    }
                                />
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setEditingItem(null)}>
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleSave}
                                    disabled={createMutation.isPending || updateMutation.isPending}
                                >
                                    {(createMutation.isPending || updateMutation.isPending) && (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    )}
                                    <Save className="h-4 w-4 mr-2" />
                                    Save
                                </Button>
                            </DialogFooter>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
