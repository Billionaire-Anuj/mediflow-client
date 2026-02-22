import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { UserLoginLogService, LoginEventType, LoginStatus } from "@mediflow/mediflow-api";
import { PageHeader } from "@/components/ui/page-header";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ListSkeleton } from "@/components/ui/loading-skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Search, History, Calendar } from "lucide-react";
import { format } from "date-fns";

export default function AdminAuditLogs() {
    const [searchQuery, setSearchQuery] = useState("");
    const [eventFilter, setEventFilter] = useState<string>("all");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [ipFilter, setIpFilter] = useState("");

    const { data, isLoading } = useQuery({
        queryKey: ["login-logs", searchQuery, eventFilter, statusFilter, ipFilter],
        queryFn: async () =>
            UserLoginLogService.getAllUserLoginLogsList({
                globalSearch: searchQuery || undefined,
                eventTypes: eventFilter === "all" ? undefined : [eventFilter as LoginEventType],
                statuses: statusFilter === "all" ? undefined : [statusFilter as LoginStatus],
                ipAddress: ipFilter || undefined
            })
    });

    const logs = data?.result ?? [];

    const filteredLogs = useMemo(() => {
        return logs;
    }, [logs]);

    if (isLoading) {
        return (
            <div className="space-y-6">
                <PageHeader title="Login Logs" />
                <ListSkeleton items={5} />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader title="Login Logs" description="Track login and logout activity" />

            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by user or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Input
                    placeholder="IP Address"
                    value={ipFilter}
                    onChange={(e) => setIpFilter(e.target.value)}
                    className="w-full sm:w-[180px]"
                />
                <Select value={eventFilter} onValueChange={setEventFilter}>
                    <SelectTrigger className="w-full sm:w-[150px]">
                        <SelectValue placeholder="Event" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover">
                        <SelectItem value="all">All Events</SelectItem>
                        <SelectItem value={LoginEventType.LOGIN}>Login</SelectItem>
                        <SelectItem value={LoginEventType.LOGOUT}>Logout</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-[170px]">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover">
                        <SelectItem value="all">All Statuses</SelectItem>
                        {Object.values(LoginStatus).map((status) => (
                            <SelectItem key={status} value={status}>
                                {status}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {filteredLogs.length === 0 ? (
                <EmptyState icon={History} title="No login logs" description="Try adjusting your filters" />
            ) : (
                <Card>
                    <CardContent className="p-0">
                        <ScrollArea className="w-full">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[180px]">Timestamp</TableHead>
                                        <TableHead>User</TableHead>
                                        <TableHead className="w-[120px]">Event</TableHead>
                                        <TableHead className="w-[200px]">Status</TableHead>
                                        <TableHead className="w-[140px]">IP Address</TableHead>
                                        <TableHead>User Agent</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredLogs.map((log, idx) => (
                                        <TableRow key={`${log.emailAddressOrUsername}-${idx}`}>
                                            <TableCell className="text-muted-foreground text-sm">
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    {log.actionDate
                                                        ? format(new Date(log.actionDate), "MMM d, h:mm a")
                                                        : ""}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{log.user?.name || "Unknown"}</span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {log.emailAddressOrUsername}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">{log.eventType}</TableCell>
                                            <TableCell className="text-muted-foreground">{log.status}</TableCell>
                                            <TableCell className="text-muted-foreground text-sm font-mono">
                                                {log.ipAddress}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground text-sm truncate max-w-[240px]">
                                                {log.userAgent}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            <ScrollBar orientation="horizontal" />
                        </ScrollArea>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
