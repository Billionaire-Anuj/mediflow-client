import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    DiagnosticTestService,
    DiagnosticTypeService,
    MedicationTypeService,
    MedicineService,
    SpecializationService,
    type DiagnosticTestDto,
    type DiagnosticTypeDto,
    type MedicationTypeDto,
    type MedicineDto,
    type SpecializationDto
} from "@mediflow/mediflow-api";
import { PageHeader } from "@/components/ui/page-header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CardSkeleton } from "@/components/ui/loading-skeleton";
import { Settings, Plus, Edit, Trash2, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";

const tabs = [
    { id: "specializations", label: "Specializations" },
    { id: "diagnostic-types", label: "Diagnostic Types" },
    { id: "diagnostic-tests", label: "Diagnostic Tests" },
    { id: "medication-types", label: "Medication Types" },
    { id: "medicines", label: "Medicines" }
] as const;

type EditType = "specialization" | "diagnosticType" | "diagnosticTest" | "medicationType" | "medicine";

type EditItem = {
    type: EditType;
    mode: "create" | "edit";
    id?: string;
    title?: string;
    description?: string;
    diagnosticTypeId?: string;
    medicationTypeId?: string;
    specimen?: string;
    format?: string;
};

export default function AdminConfig() {
    const queryClient = useQueryClient();
    const [editingItem, setEditingItem] = useState<EditItem | null>(null);

    const { data: specializationData, isLoading: specializationLoading } = useQuery({
        queryKey: ["specializations"],
        queryFn: async () => SpecializationService.getAllSpecializationsList({})
    });

    const { data: diagnosticTypeData, isLoading: diagnosticTypeLoading } = useQuery({
        queryKey: ["diagnostic-types"],
        queryFn: async () => DiagnosticTypeService.getAllDiagnosticTypesList({})
    });

    const { data: diagnosticTestData, isLoading: diagnosticTestLoading } = useQuery({
        queryKey: ["diagnostic-tests"],
        queryFn: async () => DiagnosticTestService.getAllDiagnosticTestsList({})
    });

    const { data: medicationTypeData, isLoading: medicationTypeLoading } = useQuery({
        queryKey: ["medication-types"],
        queryFn: async () => MedicationTypeService.getAllMedicationTypesList({})
    });

    const { data: medicineData, isLoading: medicineLoading } = useQuery({
        queryKey: ["medicines"],
        queryFn: async () => MedicineService.getAllMedicinesList({})
    });

    const specializations = specializationData?.result ?? [];
    const diagnosticTypes = diagnosticTypeData?.result ?? [];
    const diagnosticTests = diagnosticTestData?.result ?? [];
    const medicationTypes = medicationTypeData?.result ?? [];
    const medicines = medicineData?.result ?? [];

    const invalidateAll = () => {
        queryClient.invalidateQueries({ queryKey: ["specializations"] });
        queryClient.invalidateQueries({ queryKey: ["diagnostic-types"] });
        queryClient.invalidateQueries({ queryKey: ["diagnostic-tests"] });
        queryClient.invalidateQueries({ queryKey: ["medication-types"] });
        queryClient.invalidateQueries({ queryKey: ["medicines"] });
    };

    const createMutation = useMutation({
        mutationFn: async (payload: EditItem) => {
            switch (payload.type) {
                case "specialization":
                    return SpecializationService.createSpecialization({
                        requestBody: { title: payload.title, description: payload.description }
                    });
                case "diagnosticType":
                    return DiagnosticTypeService.createDiagnosticType({
                        requestBody: { title: payload.title, description: payload.description }
                    });
                case "diagnosticTest":
                    return DiagnosticTestService.createDiagnosticTest({
                        requestBody: {
                            title: payload.title,
                            description: payload.description,
                            specimen: payload.specimen,
                            diagnosticTypeId: payload.diagnosticTypeId
                        }
                    });
                case "medicationType":
                    return MedicationTypeService.createMedicationType({
                        requestBody: { title: payload.title, description: payload.description }
                    });
                case "medicine":
                    return MedicineService.createMedicine({
                        requestBody: {
                            title: payload.title,
                            description: payload.description,
                            format: payload.format,
                            medicationTypeId: payload.medicationTypeId
                        }
                    });
            }
        },
        onSuccess: () => {
            toast.success("Created successfully");
            invalidateAll();
            setEditingItem(null);
        },
        onError: () => toast.error("Failed to create record")
    });

    const updateMutation = useMutation({
        mutationFn: async (payload: EditItem) => {
            switch (payload.type) {
                case "specialization":
                    return SpecializationService.updateSpecialization({
                        specializationId: payload.id || "",
                        requestBody: { id: payload.id, title: payload.title, description: payload.description }
                    });
                case "diagnosticType":
                    return DiagnosticTypeService.updateDiagnosticType({
                        diagnosticTypeId: payload.id || "",
                        requestBody: { id: payload.id, title: payload.title, description: payload.description }
                    });
                case "diagnosticTest":
                    return DiagnosticTestService.updateDiagnosticTest({
                        diagnosticTestId: payload.id || "",
                        requestBody: {
                            id: payload.id,
                            title: payload.title,
                            description: payload.description,
                            specimen: payload.specimen,
                            diagnosticTypeId: payload.diagnosticTypeId
                        }
                    });
                case "medicationType":
                    return MedicationTypeService.updateMedicationType({
                        medicationTypeId: payload.id || "",
                        requestBody: { id: payload.id, title: payload.title, description: payload.description }
                    });
                case "medicine":
                    return MedicineService.updateMedicine({
                        medicineId: payload.id || "",
                        requestBody: {
                            id: payload.id,
                            title: payload.title,
                            description: payload.description,
                            format: payload.format,
                            medicationTypeId: payload.medicationTypeId
                        }
                    });
            }
        },
        onSuccess: () => {
            toast.success("Updated successfully");
            invalidateAll();
            setEditingItem(null);
        },
        onError: () => toast.error("Failed to update record")
    });

    const toggleMutation = useMutation({
        mutationFn: async ({ type, id }: { type: EditType; id: string }) => {
            switch (type) {
                case "specialization":
                    return SpecializationService.activateDeactivateSpecialization({ specializationId: id });
                case "diagnosticType":
                    return DiagnosticTypeService.activateDeactivateDiagnosticType({ diagnosticTypeId: id });
                case "diagnosticTest":
                    return DiagnosticTestService.activateDeactivateDiagnosticTest({ diagnosticTestId: id });
                case "medicationType":
                    return MedicationTypeService.activateDeactivateMedicationType({ medicationTypeId: id });
                case "medicine":
                    return MedicineService.activateDeactivateMedicine({ medicineId: id });
            }
        },
        onSuccess: () => {
            toast.success("Status updated");
            invalidateAll();
        },
        onError: () => toast.error("Failed to update status")
    });

    const isLoading =
        specializationLoading ||
        diagnosticTypeLoading ||
        diagnosticTestLoading ||
        medicationTypeLoading ||
        medicineLoading;

    const openEditor = (payload: EditItem) => setEditingItem(payload);

    const handleSave = () => {
        if (!editingItem) return;
        if (editingItem.mode === "create") {
            createMutation.mutate(editingItem);
        } else {
            updateMutation.mutate(editingItem);
        }
    };

    const renderList = (
        type: EditType,
        items: Array<
            SpecializationDto | DiagnosticTypeDto | DiagnosticTestDto | MedicationTypeDto | MedicineDto
        >
    ) => (
        <div className="space-y-2">
            {items.map((item: any) => (
                <div key={item.id} className="flex items-center justify-between p-2 bg-accent/50 rounded">
                    <div>
                        <p className="text-sm font-medium">{item.title}</p>
                        {item.description && <p className="text-xs text-muted-foreground">{item.description}</p>}
                    </div>
                    <div className="flex gap-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() =>
                                openEditor({
                                    type,
                                    mode: "edit",
                                    id: item.id,
                                    title: item.title,
                                    description: item.description,
                                    diagnosticTypeId: item.diagnosticType?.id,
                                    medicationTypeId: item.medicationType?.id,
                                    specimen: item.specimen,
                                    format: item.format
                                })
                            }
                        >
                            <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() => item.id && toggleMutation.mutate({ type, id: item.id })}
                        >
                            <Trash2 className="h-3 w-3" />
                        </Button>
                    </div>
                </div>
            ))}
            {items.length === 0 && (
                <div className="text-sm text-muted-foreground">No records found.</div>
            )}
        </div>
    );

    if (isLoading) {
        return (
            <div className="space-y-6">
                <PageHeader title="Configuration" />
                <CardSkeleton />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader title="Master Data" description="Manage specializations, diagnostics, and medicines" />

            <Tabs defaultValue="specializations" className="space-y-4">
                <TabsList>
                    {tabs.map((tab) => (
                        <TabsTrigger key={tab.id} value={tab.id} className="gap-2">
                            <Settings className="h-4 w-4" />
                            {tab.label}
                        </TabsTrigger>
                    ))}
                </TabsList>

                <TabsContent value="specializations">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-base">Specializations</CardTitle>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openEditor({ type: "specialization", mode: "create" })}
                            >
                                <Plus className="h-4 w-4 mr-1" />
                                Add
                            </Button>
                        </CardHeader>
                        <CardContent>{renderList("specialization", specializations)}</CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="diagnostic-types">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-base">Diagnostic Types</CardTitle>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openEditor({ type: "diagnosticType", mode: "create" })}
                            >
                                <Plus className="h-4 w-4 mr-1" />
                                Add
                            </Button>
                        </CardHeader>
                        <CardContent>{renderList("diagnosticType", diagnosticTypes)}</CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="diagnostic-tests">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-base">Diagnostic Tests</CardTitle>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openEditor({ type: "diagnosticTest", mode: "create" })}
                            >
                                <Plus className="h-4 w-4 mr-1" />
                                Add
                            </Button>
                        </CardHeader>
                        <CardContent>{renderList("diagnosticTest", diagnosticTests)}</CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="medication-types">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-base">Medication Types</CardTitle>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openEditor({ type: "medicationType", mode: "create" })}
                            >
                                <Plus className="h-4 w-4 mr-1" />
                                Add
                            </Button>
                        </CardHeader>
                        <CardContent>{renderList("medicationType", medicationTypes)}</CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="medicines">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-base">Medicines</CardTitle>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openEditor({ type: "medicine", mode: "create" })}
                            >
                                <Plus className="h-4 w-4 mr-1" />
                                Add
                            </Button>
                        </CardHeader>
                        <CardContent>{renderList("medicine", medicines)}</CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <Dialog open={!!editingItem} onOpenChange={() => setEditingItem(null)}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            {editingItem?.mode === "create" ? "Add" : "Edit"} {editingItem?.type}
                        </DialogTitle>
                    </DialogHeader>
                    {editingItem && (
                        <div className="space-y-4">
                            <div>
                                <Label>Title</Label>
                                <Input
                                    value={editingItem.title || ""}
                                    onChange={(e) =>
                                        setEditingItem((prev) =>
                                            prev ? { ...prev, title: e.target.value } : prev
                                        )
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

                            {editingItem.type === "diagnosticTest" && (
                                <>
                                    <div>
                                        <Label>Diagnostic Type</Label>
                                        <Select
                                            value={editingItem.diagnosticTypeId || ""}
                                            onValueChange={(value) =>
                                                setEditingItem((prev) =>
                                                    prev ? { ...prev, diagnosticTypeId: value } : prev
                                                )
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select type" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-popover">
                                                {diagnosticTypes.map((type) => (
                                                    <SelectItem key={type.id} value={type.id || ""}>
                                                        {type.title}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label>Specimen</Label>
                                        <Input
                                            value={editingItem.specimen || ""}
                                            onChange={(e) =>
                                                setEditingItem((prev) =>
                                                    prev ? { ...prev, specimen: e.target.value } : prev
                                                )
                                            }
                                        />
                                    </div>
                                </>
                            )}

                            {editingItem.type === "medicine" && (
                                <>
                                    <div>
                                        <Label>Medication Type</Label>
                                        <Select
                                            value={editingItem.medicationTypeId || ""}
                                            onValueChange={(value) =>
                                                setEditingItem((prev) =>
                                                    prev ? { ...prev, medicationTypeId: value } : prev
                                                )
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select type" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-popover">
                                                {medicationTypes.map((type) => (
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
                                                setEditingItem((prev) =>
                                                    prev ? { ...prev, format: e.target.value } : prev
                                                )
                                            }
                                        />
                                    </div>
                                </>
                            )}

                            <DialogFooter>
                                <Button variant="outline" onClick={() => setEditingItem(null)}>
                                    Cancel
                                </Button>
                                <Button onClick={handleSave} disabled={createMutation.isPending || updateMutation.isPending}>
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
