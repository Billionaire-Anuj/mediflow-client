import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { PageHeader } from "@/components/ui/page-header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge, getStatusVariant } from "@/components/ui/status-badge";
import { ListSkeleton } from "@/components/ui/loading-skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { mockPrescriptions, Prescription } from "@/mock/prescriptions";
import { Search, Pill, Clock, User, ArrowRight } from "lucide-react";
import { format } from "date-fns";

export default function PharmacyPrescriptions() {
    const [loading, setLoading] = useState(true);
    const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");

    useEffect(() => {
        const timer = setTimeout(() => {
            setPrescriptions(mockPrescriptions);
            setLoading(false);
        }, 400);
        return () => clearTimeout(timer);
    }, []);

    const filteredPrescriptions = prescriptions.filter((rx) => {
        const matchesSearch =
            rx.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            rx.doctorName.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === "all" || rx.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    if (loading) {
        return (
            <div className="space-y-6">
                <PageHeader title="Prescriptions" />
                <ListSkeleton items={4} />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader title="Prescriptions" description="Manage and dispense prescriptions" />

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by patient or doctor..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover">
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="partially-dispensed">Partially Dispensed</SelectItem>
                        <SelectItem value="dispensed">Dispensed</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Prescriptions List */}
            {filteredPrescriptions.length === 0 ? (
                <EmptyState icon={Pill} title="No prescriptions found" description="Try adjusting your filters" />
            ) : (
                <div className="space-y-3">
                    {filteredPrescriptions.map((rx) => (
                        <Card key={rx.id} className="card-interactive">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex gap-4">
                                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                            <User className="h-6 w-6 text-primary" />
                                        </div>
                                        <div>
                                            <h3 className="font-medium">{rx.patientName}</h3>
                                            <p className="text-sm text-muted-foreground">
                                                Prescribed by {rx.doctorName}
                                            </p>
                                            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                                <Clock className="h-3 w-3" />
                                                {format(new Date(rx.createdAt), "MMM d, yyyy h:mm a")}
                                            </div>
                                            <div className="flex flex-wrap gap-1 mt-2">
                                                {rx.items.slice(0, 2).map((item) => (
                                                    <span
                                                        key={item.id}
                                                        className="px-2 py-0.5 bg-accent rounded text-xs"
                                                    >
                                                        {item.medicineName} {item.dosage}
                                                    </span>
                                                ))}
                                                {rx.items.length > 2 && (
                                                    <span className="px-2 py-0.5 bg-muted rounded text-xs">
                                                        +{rx.items.length - 2} more
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <StatusBadge variant={getStatusVariant(rx.status)}>{rx.status}</StatusBadge>
                                        <Button size="sm" asChild>
                                            <Link to={`/pharmacy/prescription/${rx.id}`}>
                                                Open <ArrowRight className="h-4 w-4 ml-1" />
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
