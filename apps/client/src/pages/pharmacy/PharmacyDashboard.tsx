import { useState, useEffect } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge, getStatusVariant } from "@/components/ui/status-badge";
import { ListSkeleton } from "@/components/ui/loading-skeleton";
import { mockPrescriptions } from "@/mock/prescriptions";
import { mockDashboardStats } from "@/mock/config";
import { Pill, Clock, CheckCircle, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export default function PharmacyDashboard() {
    const [loading, setLoading] = useState(true);
    const [prescriptions, setPrescriptions] = useState(mockPrescriptions);
    const stats = mockDashboardStats.pharmacy;

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 400);
        return () => clearTimeout(timer);
    }, []);

    const updateStatus = (id: string, status: "dispensed") => {
        setPrescriptions((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)));
        toast.success("Prescription dispensed");
    };

    if (loading)
        return (
            <div className="space-y-6">
                <PageHeader title="Pharmacy Dashboard" />
                <ListSkeleton items={4} />
            </div>
        );

    const pending = prescriptions.filter((p) => p.status === "pending" || p.status === "partially-dispensed");

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader title="Pharmacy Dashboard" description="Manage prescriptions and dispensing" />

            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-status-warning-bg flex items-center justify-center">
                            <Clock className="h-6 w-6 text-status-warning" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{stats.pendingPrescriptions}</p>
                            <p className="text-sm text-muted-foreground">Pending</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-status-info-bg flex items-center justify-center">
                            <Pill className="h-6 w-6 text-status-info" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{stats.partiallyDispensed}</p>
                            <p className="text-sm text-muted-foreground">Partial</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-status-success-bg flex items-center justify-center">
                            <CheckCircle className="h-6 w-6 text-status-success" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{stats.dispensedToday}</p>
                            <p className="text-sm text-muted-foreground">Dispensed Today</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-status-danger-bg flex items-center justify-center">
                            <AlertTriangle className="h-6 w-6 text-status-danger" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{stats.lowStockAlerts}</p>
                            <p className="text-sm text-muted-foreground">Low Stock</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardContent className="p-6">
                    <h3 className="font-semibold mb-4">Pending Prescriptions</h3>
                    <div className="space-y-3">
                        {pending.map((rx) => (
                            <div key={rx.id} className="flex items-center justify-between p-4 bg-accent/50 rounded-lg">
                                <div>
                                    <p className="font-medium">{rx.patientName}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {rx.items.length} item(s) • {rx.doctorName}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {format(new Date(rx.createdAt), "MMM d, h:mm a")}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <StatusBadge variant={getStatusVariant(rx.status)}>{rx.status}</StatusBadge>
                                    <Button size="sm" onClick={() => updateStatus(rx.id, "dispensed")}>
                                        Dispense
                                    </Button>
                                </div>
                            </div>
                        ))}
                        {pending.length === 0 && (
                            <p className="text-center text-muted-foreground py-4">No pending prescriptions</p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
