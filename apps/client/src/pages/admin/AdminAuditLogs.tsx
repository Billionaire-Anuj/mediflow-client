import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AuditLogService } from "@mediflow/mediflow-api";
import { PageHeader } from "@/components/ui/page-header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ListSkeleton } from "@/components/ui/loading-skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Search, History, Calendar } from "lucide-react";
import { format } from "date-fns";

export default function AdminAuditLogs() {
    const [entityId, setEntityId] = useState("");
    const [submittedId, setSubmittedId] = useState("");

    const { data, isLoading } = useQuery({
        queryKey: ["audit-logs", submittedId],
        enabled: !!submittedId,
        queryFn: async () => AuditLogService.getAuditLogsByEntityId({ entityId: submittedId })
    });

    const logs = data?.result ?? [];

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader title="Audit Logs" description="Track changes for a specific entity" />

            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Enter entity ID..."
                        value={entityId}
                        onChange={(e) => setEntityId(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Button onClick={() => setSubmittedId(entityId)} disabled={!entityId}>
                    Load Logs
                </Button>
            </div>

            {isLoading ? (
                <div className="space-y-6">
                    <ListSkeleton items={5} />
                </div>
            ) : submittedId && logs.length === 0 ? (
                <EmptyState icon={History} title="No logs found" description="Try a different entity ID" />
            ) : submittedId ? (
                <Card>
                    <CardContent className="p-0">
                        <ScrollArea className="w-full">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[180px]">Timestamp</TableHead>
                                        <TableHead>User</TableHead>
                                        <TableHead className="w-[120px]">Change</TableHead>
                                        <TableHead>Remarks</TableHead>
                                        <TableHead className="w-[120px]">Fields</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {logs.map((log) => (
                                        <TableRow key={log.id}>
                                            <TableCell className="text-muted-foreground text-sm">
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    {log.auditedDate
                                                        ? format(new Date(log.auditedDate), "MMM d, h:mm a")
                                                        : ""}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                                        <span className="text-xs font-medium text-primary">
                                                            {(log.user?.name || "U")
                                                                .split(" ")
                                                                .map((n) => n[0])
                                                                .join("")
                                                                .slice(0, 2)}
                                                        </span>
                                                    </div>
                                                    <span className="font-medium">{log.user?.name}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {log.changeType}
                                            </TableCell>
                                            <TableCell className="max-w-[300px] truncate text-sm">
                                                {log.remarks || ""}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground text-sm">
                                                {log.auditLogHistories?.length || 0}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            <ScrollBar orientation="horizontal" />
                        </ScrollArea>
                    </CardContent>
                </Card>
            ) : (
                <EmptyState icon={History} title="Search audit logs" description="Enter an entity ID to view logs." />
            )}
        </div>
    );
}
