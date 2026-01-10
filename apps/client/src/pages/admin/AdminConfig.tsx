import { useState, useEffect } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { CardSkeleton } from "@/components/ui/loading-skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { mockClinicConfig, ClinicConfig } from "@/mock/config";
import { departments, specialties } from "@/mock/doctors";
import { Settings, Building, Clock, Plus, Edit, Trash2, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function AdminConfig() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [config, setConfig] = useState<ClinicConfig>(mockClinicConfig);
    const [departmentList, setDepartmentList] = useState<string[]>(departments);
    const [specialtyList, setSpecialtyList] = useState<string[]>(specialties);

    const [editingItem, setEditingItem] = useState<{
        type: "department" | "specialty";
        value: string;
        isNew: boolean;
    } | null>(null);
    const [itemName, setItemName] = useState("");

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 400);
        return () => clearTimeout(timer);
    }, []);

    const saveConfig = async () => {
        setSaving(true);
        await new Promise((resolve) => setTimeout(resolve, 500));
        toast.success("Configuration saved successfully");
        setSaving(false);
    };

    const updateClinicHour = (day: string, field: "open" | "close" | "closed", value: string | boolean) => {
        setConfig((prev) => ({
            ...prev,
            clinicHours: prev.clinicHours.map((h) => (h.day === day ? { ...h, [field]: value } : h))
        }));
    };

    const openAddEdit = (type: "department" | "specialty", value?: string) => {
        setEditingItem({ type, value: value || "", isNew: !value });
        setItemName(value || "");
    };

    const saveItem = () => {
        if (!editingItem || !itemName.trim()) return;

        if (editingItem.type === "department") {
            if (editingItem.isNew) {
                setDepartmentList((prev) => [...prev, itemName.trim()]);
            } else {
                setDepartmentList((prev) => prev.map((d) => (d === editingItem.value ? itemName.trim() : d)));
            }
        } else {
            if (editingItem.isNew) {
                setSpecialtyList((prev) => [...prev, itemName.trim()]);
            } else {
                setSpecialtyList((prev) => prev.map((s) => (s === editingItem.value ? itemName.trim() : s)));
            }
        }

        toast.success(
            `${editingItem.type === "department" ? "Department" : "Specialty"} ${editingItem.isNew ? "added" : "updated"}`
        );
        setEditingItem(null);
        setItemName("");
    };

    const deleteItem = (type: "department" | "specialty", value: string) => {
        if (type === "department") {
            setDepartmentList((prev) => prev.filter((d) => d !== value));
        } else {
            setSpecialtyList((prev) => prev.filter((s) => s !== value));
        }
        toast.success(`${type === "department" ? "Department" : "Specialty"} deleted`);
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <PageHeader title="Configuration" />
                <CardSkeleton />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader title="Configuration" description="Manage clinic settings and configurations">
                <Button onClick={saveConfig} disabled={saving}>
                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <Save className="h-4 w-4 mr-2" />
                    Save All
                </Button>
            </PageHeader>

            <Tabs defaultValue="general" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="general" className="gap-2">
                        <Building className="h-4 w-4" />
                        General
                    </TabsTrigger>
                    <TabsTrigger value="hours" className="gap-2">
                        <Clock className="h-4 w-4" />
                        Clinic Hours
                    </TabsTrigger>
                    <TabsTrigger value="departments" className="gap-2">
                        <Settings className="h-4 w-4" />
                        Departments
                    </TabsTrigger>
                </TabsList>

                {/* General Settings */}
                <TabsContent value="general">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Clinic Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <Label>Clinic Name</Label>
                                    <Input
                                        value={config.clinicName}
                                        onChange={(e) => setConfig((prev) => ({ ...prev, clinicName: e.target.value }))}
                                        className="mt-1"
                                    />
                                </div>
                                <div>
                                    <Label>Phone</Label>
                                    <Input
                                        value={config.phone}
                                        onChange={(e) => setConfig((prev) => ({ ...prev, phone: e.target.value }))}
                                        className="mt-1"
                                    />
                                </div>
                                <div>
                                    <Label>Email</Label>
                                    <Input
                                        value={config.email}
                                        onChange={(e) => setConfig((prev) => ({ ...prev, email: e.target.value }))}
                                        className="mt-1"
                                    />
                                </div>
                                <div>
                                    <Label>Default Slot Duration (minutes)</Label>
                                    <Select
                                        value={config.defaultSlotDuration.toString()}
                                        onValueChange={(v) =>
                                            setConfig((prev) => ({ ...prev, defaultSlotDuration: parseInt(v) }))
                                        }
                                    >
                                        <SelectTrigger className="mt-1">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-popover">
                                            <SelectItem value="15">15 minutes</SelectItem>
                                            <SelectItem value="20">20 minutes</SelectItem>
                                            <SelectItem value="30">30 minutes</SelectItem>
                                            <SelectItem value="45">45 minutes</SelectItem>
                                            <SelectItem value="60">60 minutes</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="md:col-span-2">
                                    <Label>Address</Label>
                                    <Input
                                        value={config.address}
                                        onChange={(e) => setConfig((prev) => ({ ...prev, address: e.target.value }))}
                                        className="mt-1"
                                    />
                                </div>
                                <div>
                                    <Label>Cancellation Window (hours)</Label>
                                    <Input
                                        type="number"
                                        value={config.cancellationWindowHours}
                                        onChange={(e) =>
                                            setConfig((prev) => ({
                                                ...prev,
                                                cancellationWindowHours: parseInt(e.target.value) || 0
                                            }))
                                        }
                                        className="mt-1"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Clinic Hours */}
                <TabsContent value="hours">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Operating Hours</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {config.clinicHours.map((hour) => (
                                    <div key={hour.day} className="flex items-center gap-4 p-3 border rounded-lg">
                                        <div className="w-28 font-medium">{hour.day}</div>
                                        <Switch
                                            checked={!hour.closed}
                                            onCheckedChange={(checked) =>
                                                updateClinicHour(hour.day, "closed", !checked)
                                            }
                                        />
                                        {!hour.closed && (
                                            <>
                                                <div className="flex items-center gap-2">
                                                    <Label className="text-xs text-muted-foreground">Open</Label>
                                                    <Input
                                                        type="time"
                                                        value={hour.open}
                                                        onChange={(e) =>
                                                            updateClinicHour(hour.day, "open", e.target.value)
                                                        }
                                                        className="w-32 h-9"
                                                    />
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Label className="text-xs text-muted-foreground">Close</Label>
                                                    <Input
                                                        type="time"
                                                        value={hour.close}
                                                        onChange={(e) =>
                                                            updateClinicHour(hour.day, "close", e.target.value)
                                                        }
                                                        className="w-32 h-9"
                                                    />
                                                </div>
                                            </>
                                        )}
                                        {hour.closed && <span className="text-muted-foreground">Closed</span>}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Departments & Specialties */}
                <TabsContent value="departments">
                    <div className="grid gap-6 md:grid-cols-2">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle className="text-base">Departments</CardTitle>
                                <Button size="sm" variant="outline" onClick={() => openAddEdit("department")}>
                                    <Plus className="h-4 w-4 mr-1" />
                                    Add
                                </Button>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {departmentList.map((dept) => (
                                        <div
                                            key={dept}
                                            className="flex items-center justify-between p-2 bg-accent/50 rounded"
                                        >
                                            <span className="text-sm">{dept}</span>
                                            <div className="flex gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    onClick={() => openAddEdit("department", dept)}
                                                >
                                                    <Edit className="h-3 w-3" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-destructive"
                                                    onClick={() => deleteItem("department", dept)}
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle className="text-base">Specialties</CardTitle>
                                <Button size="sm" variant="outline" onClick={() => openAddEdit("specialty")}>
                                    <Plus className="h-4 w-4 mr-1" />
                                    Add
                                </Button>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {specialtyList.map((spec) => (
                                        <div
                                            key={spec}
                                            className="flex items-center justify-between p-2 bg-accent/50 rounded"
                                        >
                                            <span className="text-sm">{spec}</span>
                                            <div className="flex gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    onClick={() => openAddEdit("specialty", spec)}
                                                >
                                                    <Edit className="h-3 w-3" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-destructive"
                                                    onClick={() => deleteItem("specialty", spec)}
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>

            {/* Add/Edit Dialog */}
            <Dialog open={!!editingItem} onOpenChange={() => setEditingItem(null)}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle>
                            {editingItem?.isNew ? "Add" : "Edit"}{" "}
                            {editingItem?.type === "department" ? "Department" : "Specialty"}
                        </DialogTitle>
                    </DialogHeader>
                    <div>
                        <Label>Name</Label>
                        <Input
                            value={itemName}
                            onChange={(e) => setItemName(e.target.value)}
                            placeholder={`Enter ${editingItem?.type} name`}
                            className="mt-1"
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditingItem(null)}>
                            Cancel
                        </Button>
                        <Button onClick={saveItem}>Save</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
