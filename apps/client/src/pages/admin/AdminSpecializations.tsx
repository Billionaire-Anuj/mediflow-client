import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { SpecializationService, type SpecializationDto } from "@mediflow/mediflow-api";
import { PageHeader } from "@/components/ui/page-header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { CardSkeleton } from "@/components/ui/loading-skeleton";
import { Plus, Edit, Trash2, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getErrorMessage, getResponseMessage } from "@/lib/api";

type EditItem = {
    mode: "create" | "edit";
    id?: string;
    title?: string;
    description?: string;
};

export default function AdminSpecializations() {
    const queryClient = useQueryClient();
    const [editingItem, setEditingItem] = useState<EditItem | null>(null);

    const { data, isLoading } = useQuery({
        queryKey: ["specializations"],
        queryFn: async () => SpecializationService.getAllSpecializationsList({})
    });

    const items = data?.result ?? [];

    const createMutation = useMutation({
        mutationFn: async (payload: EditItem) =>
            SpecializationService.createSpecialization({
                requestBody: { title: payload.title, description: payload.description }
            }),
        onSuccess: (data) => {
            toast.success(getResponseMessage(data));
            queryClient.invalidateQueries({ queryKey: ["specializations"] });
            setEditingItem(null);
        },
        onError: (error) => toast.error(getErrorMessage(error))
    });

    const updateMutation = useMutation({
        mutationFn: async (payload: EditItem) =>
            SpecializationService.updateSpecialization({
                specializationId: payload.id || "",
                requestBody: { id: payload.id, title: payload.title, description: payload.description }
            }),
        onSuccess: (data) => {
            toast.success(getResponseMessage(data));
            queryClient.invalidateQueries({ queryKey: ["specializations"] });
            setEditingItem(null);
        },
        onError: (error) => toast.error(getErrorMessage(error))
    });

    const toggleMutation = useMutation({
        mutationFn: async (id: string) =>
            SpecializationService.activateDeactivateSpecialization({ specializationId: id }),
        onSuccess: (data) => {
            toast.success(getResponseMessage(data));
            queryClient.invalidateQueries({ queryKey: ["specializations"] });
        },
        onError: (error) => toast.error(getErrorMessage(error))
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
                <PageHeader title="Specializations" />
                <CardSkeleton />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader title="Specializations" description="Manage doctor specializations" />

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-base">Specializations</CardTitle>
                    <Button size="sm" variant="outline" onClick={() => setEditingItem({ mode: "create" })}>
                        <Plus className="h-4 w-4 mr-1" />
                        Add
                    </Button>
                </CardHeader>
                <CardContent className="space-y-2">
                    {items.map((item: SpecializationDto) => (
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
                        <DialogTitle>{editingItem?.mode === "create" ? "Add" : "Edit"} Specialization</DialogTitle>
                    </DialogHeader>
                    {editingItem && (
                        <div className="space-y-4">
                            <div>
                                <Label>Title</Label>
                                <Input
                                    placeholder="Enter specialization name"
                                    value={editingItem.title || ""}
                                    onChange={(e) =>
                                        setEditingItem((prev) => (prev ? { ...prev, title: e.target.value } : prev))
                                    }
                                />
                            </div>
                            <div>
                                <Label>Description</Label>
                                <Input
                                    placeholder="Short description"
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
