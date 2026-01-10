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
import { mockLabRequests, LabRequest } from "@/mock/labRequests";
import { Search, FlaskConical, Clock, User, ArrowRight } from "lucide-react";
import { format } from "date-fns";

export default function LabRequests() {
    const [loading, setLoading] = useState(true);
    const [requests, setRequests] = useState<LabRequest[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [priorityFilter, setPriorityFilter] = useState<string>("all");

    useEffect(() => {
        const timer = setTimeout(() => {
            setRequests(mockLabRequests);
            setLoading(false);
        }, 400);
        return () => clearTimeout(timer);
    }, []);

    const filteredRequests = requests.filter((req) => {
        const matchesSearch =
            req.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            req.doctorName.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === "all" || req.status === statusFilter;
        const matchesPriority = priorityFilter === "all" || req.priority === priorityFilter;
        return matchesSearch && matchesStatus && matchesPriority;
    });

    if (loading) {
        return (
            <div className="space-y-6">
                <PageHeader title="Lab Requests" />
                <ListSkeleton items={4} />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader title="Lab Requests" description="Manage and process lab test requests" />

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
                    <SelectTrigger className="w-full sm:w-[160px]">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover">
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="requested">Requested</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger className="w-full sm:w-[160px]">
                        <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover">
                        <SelectItem value="all">All Priority</SelectItem>
                        <SelectItem value="routine">Routine</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                        <SelectItem value="stat">STAT</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Requests List */}
            {filteredRequests.length === 0 ? (
                <EmptyState icon={FlaskConical} title="No requests found" description="Try adjusting your filters" />
            ) : (
                <div className="space-y-3">
                    {filteredRequests.map((req) => (
                        <Card key={req.id} className="card-interactive">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex gap-4">
                                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                            <User className="h-6 w-6 text-primary" />
                                        </div>
                                        <div>
                                            <h3 className="font-medium">{req.patientName}</h3>
                                            <p className="text-sm text-muted-foreground">Ordered by {req.doctorName}</p>
                                            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                                <Clock className="h-3 w-3" />
                                                {format(new Date(req.createdAt), "MMM d, yyyy h:mm a")}
                                            </div>
                                            <div className="flex flex-wrap gap-1 mt-2">
                                                {req.tests.slice(0, 2).map((test) => (
                                                    <span
                                                        key={test.id}
                                                        className="px-2 py-0.5 bg-accent rounded text-xs"
                                                    >
                                                        {test.name}
                                                    </span>
                                                ))}
                                                {req.tests.length > 2 && (
                                                    <span className="px-2 py-0.5 bg-muted rounded text-xs">
                                                        +{req.tests.length - 2} more
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="flex flex-col items-end gap-1">
                                            <StatusBadge variant={getStatusVariant(req.status)}>
                                                {req.status}
                                            </StatusBadge>
                                            <StatusBadge variant={getStatusVariant(req.priority)}>
                                                {req.priority}
                                            </StatusBadge>
                                        </div>
                                        <Button size="sm" asChild>
                                            <Link to={`/lab/request/${req.id}`}>
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
