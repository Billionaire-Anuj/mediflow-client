import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DiagnosticTypeService, type DiagnosticTypeDto } from "@mediflow/mediflow-api";
import { PageHeader } from "@/components/ui/page-header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { CardSkeleton } from "@/components/ui/loading-skeleton";
import { Plus, Edit, Trash2, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";

type EditItem = {
    mode: "create" | "edit";
    id?: string;
    title?: string;
    description?: string;
};

export default function AdminDiagnosticTypes() {
    const queryClient = useQueryClient();
    const [editingItem, setEditingItem] = useState<EditItem | null>(null);

    const { data, isLoading } = useQuery({
        queryKey: ["diagnostic-types"],
        queryFn: async () => DiagnosticTypeService.getAllDiagnosticTypesList({})
    });

    const items = data?.result ?? [];

    const createMutation = useMutation({
        mutationFn: async (payload: EditItem) =>
            DiagnosticTypeService.createDiagnosticType({
                requestBody: { title: payload.title, description: payload.description }
            }),
        onSuccess: () => {
            toast.success("Diagnostic type created");
            queryClient.invalidateQueries({ queryKey: ["diagnostic-types"] });
            setEditingItem(null);
        },
        onError: () => toast.error("Failed to create diagnostic type")
    });

    const updateMutation = useMutation({
        mutationFn: async (payload: EditItem) =>
            DiagnosticTypeService.updateDiagnosticType({
                diagnosticTypeId: payload.id || "",
                requestBody: { id: payload.id, title: payload.title, description: payload.description }
            }),
        onSuccess: () => {
            toast.success("Diagnostic type updated");
            queryClient.invalidateQueries({ queryKey: ["diagnostic-types"] });
            setEditingItem(null);
        },
        onError: () => toast.error("Failed to update diagnostic type")
    });

    const toggleMutation = useMutation({
        mutationFn: async (id: string) =>
            DiagnosticTypeService.activateDeactivateDiagnosticType({ diagnosticTypeId: id }),
        onSuccess: () => {
            toast.success("Status updated");
            queryClient.invalidateQueries({ queryKey: ["diagnostic-types"] });
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

    if (isLoading) {
        return (
            <div className="space-y-6">
                <PageHeader title="Diagnostic Types" />
                <CardSkeleton />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader title="Diagnostic Types" description="Manage diagnostic categories" />

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-base">Diagnostic Types</CardTitle>
                    <Button size="sm" variant="outline" onClick={() => setEditingItem({ mode: "create" })}>
                        <Plus className="h-4 w-4 mr-1" />
                        Add
                    </Button>
                </CardHeader>
                <CardContent className="space-y-2">
                    {items.map((item: DiagnosticTypeDto) => (
                        <div key={item.id} className="flex items-center justify-between p-2 bg-accent/50 rounded">
                            <div>
                                <p className="text-sm font-medium">{item.title}</p>
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
                                            description: item.description as string
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
                    {items.length === 0 && <div className="text-sm text-muted-foreground">No records found.</div>}
                </CardContent>
            </Card>

            <Dialog open={!!editingItem} onOpenChange={() => setEditingItem(null)}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>{editingItem?.mode === "create" ? "Add" : "Edit"} Diagnostic Type</DialogTitle>
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
