import { useState, useEffect } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { ListSkeleton } from "@/components/ui/loading-skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { mockAuditLogs, AuditLog, AuditAction } from "@/mock/auditLogs";
import { Search, History, User, FileText, Calendar, Settings, Pill, UserCheck, UserX } from "lucide-react";
import { format } from "date-fns";

const actionIcons: Record<AuditAction, React.ElementType> = {
    login: User,
    logout: User,
    create: FileText,
    update: Settings,
    delete: FileText,
    view: FileText,
    approve: UserCheck,
    reject: UserX,
    dispense: Pill
};

const actionColors: Record<AuditAction, string> = {
    login: "info",
    logout: "neutral",
    create: "success",
    update: "warning",
    delete: "danger",
    view: "neutral",
    approve: "success",
    reject: "danger",
    dispense: "success"
};

export default function AdminAuditLogs() {
    const [loading, setLoading] = useState(true);
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [roleFilter, setRoleFilter] = useState<string>("all");
    const [actionFilter, setActionFilter] = useState<string>("all");

    useEffect(() => {
        const timer = setTimeout(() => {
            setLogs(mockAuditLogs);
            setLoading(false);
        }, 400);
        return () => clearTimeout(timer);
    }, []);

    const filteredLogs = logs.filter((log) => {
        const matchesSearch =
            log.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            log.details.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRole = roleFilter === "all" || log.userRole === roleFilter;
        const matchesAction = actionFilter === "all" || log.action === actionFilter;
        return matchesSearch && matchesRole && matchesAction;
    });

    if (loading) {
        return (
            <div className="space-y-6">
                <PageHeader title="Audit Logs" />
                <ListSkeleton items={5} />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader title="Audit Logs" description="Track all system activities and changes" />

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by user or details..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="w-full sm:w-[150px]">
                        <SelectValue placeholder="Role" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover">
                        <SelectItem value="all">All Roles</SelectItem>
                        <SelectItem value="patient">Patient</SelectItem>
                        <SelectItem value="doctor">Doctor</SelectItem>
                        <SelectItem value="lab">Lab Tech</SelectItem>
                        <SelectItem value="pharmacist">Pharmacist</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={actionFilter} onValueChange={setActionFilter}>
                    <SelectTrigger className="w-full sm:w-[150px]">
                        <SelectValue placeholder="Action" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover">
                        <SelectItem value="all">All Actions</SelectItem>
                        <SelectItem value="login">Login</SelectItem>
                        <SelectItem value="logout">Logout</SelectItem>
                        <SelectItem value="create">Create</SelectItem>
                        <SelectItem value="update">Update</SelectItem>
                        <SelectItem value="delete">Delete</SelectItem>
                        <SelectItem value="view">View</SelectItem>
                        <SelectItem value="approve">Approve</SelectItem>
                        <SelectItem value="reject">Reject</SelectItem>
                        <SelectItem value="dispense">Dispense</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Logs Table */}
            {filteredLogs.length === 0 ? (
                <EmptyState icon={History} title="No logs found" description="Try adjusting your filters" />
            ) : (
                <Card>
                    <CardContent className="p-0">
                        <ScrollArea className="w-full">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[180px]">Timestamp</TableHead>
                                        <TableHead>User</TableHead>
                                        <TableHead className="w-[100px]">Role</TableHead>
                                        <TableHead className="w-[100px]">Action</TableHead>
                                        <TableHead className="w-[100px]">Entity</TableHead>
                                        <TableHead>Details</TableHead>
                                        <TableHead className="w-[120px]">IP Address</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredLogs.map((log) => {
                                        const Icon = actionIcons[log.action];
                                        return (
                                            <TableRow key={log.id}>
                                                <TableCell className="text-muted-foreground text-sm">
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="h-3 w-3" />
                                                        {format(new Date(log.timestamp), "MMM d, h:mm a")}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                                            <span className="text-xs font-medium text-primary">
                                                                {log.userName
                                                                    .split(" ")
                                                                    .map((n) => n[0])
                                                                    .join("")
                                                                    .slice(0, 2)}
                                                            </span>
                                                        </div>
                                                        <span className="font-medium">{log.userName}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="px-2 py-0.5 rounded text-xs font-medium capitalize bg-muted">
                                                        {log.userRole}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <StatusBadge variant={actionColors[log.action] as any}>
                                                        <Icon className="h-3 w-3 mr-1" />
                                                        {log.action}
                                                    </StatusBadge>
                                                </TableCell>
                                                <TableCell className="capitalize text-muted-foreground">
                                                    {log.entity.replace("_", " ")}
                                                </TableCell>
                                                <TableCell className="max-w-[300px] truncate text-sm">
                                                    {log.details}
                                                </TableCell>
                                                <TableCell className="text-muted-foreground text-sm font-mono">
                                                    {log.ipAddress}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                            <ScrollBar orientation="horizontal" />
                        </ScrollArea>
                    </CardContent>
                </Card>
            )}

            {/* Pagination placeholder */}
            <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                    Showing {filteredLogs.length} of {logs.length} entries
                </p>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" disabled>
                        Previous
                    </Button>
                    <Button variant="outline" size="sm" disabled>
                        Next
                    </Button>
                </div>
            </div>
        </div>
    );
}
