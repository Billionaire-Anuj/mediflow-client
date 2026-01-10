import { useState, useEffect } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ListSkeleton } from "@/components/ui/loading-skeleton";
import { mockUsers } from "@/mock/users";
import { mockDashboardStats } from "@/mock/config";
import { Users, Calendar, Pill, UserCheck, UserX } from "lucide-react";
import { toast } from "sonner";

export default function AdminDashboard() {
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState(mockUsers);
    const stats = mockDashboardStats.admin;

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 400);
        return () => clearTimeout(timer);
    }, []);

    const approveUser = (id: string) => {
        setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, status: "active" as const } : u)));
        toast.success("User approved");
    };

    const rejectUser = (id: string) => {
        setUsers((prev) => prev.filter((u) => u.id !== id));
        toast.success("User rejected");
    };

    if (loading)
        return (
            <div className="space-y-6">
                <PageHeader title="Admin Dashboard" />
                <ListSkeleton items={4} />
            </div>
        );

    const pendingUsers = users.filter((u) => u.status === "pending");

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader title="Admin Dashboard" description="System overview and management" />

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                            <Calendar className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{stats.appointmentsToday}</p>
                            <p className="text-sm text-muted-foreground">Appointments Today</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-status-danger-bg flex items-center justify-center">
                            <span className="text-lg font-bold text-status-danger">{stats.cancellationRate}%</span>
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{stats.cancellationRate}%</p>
                            <p className="text-sm text-muted-foreground">Cancellation Rate</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-status-success-bg flex items-center justify-center">
                            <Pill className="h-6 w-6 text-status-success" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{stats.prescriptionsThisWeek}</p>
                            <p className="text-sm text-muted-foreground">Prescriptions/Week</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-status-info-bg flex items-center justify-center">
                            <Users className="h-6 w-6 text-status-info" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{stats.activeUsers}</p>
                            <p className="text-sm text-muted-foreground">Active Users</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardContent className="p-6">
                    <h3 className="font-semibold mb-4">Pending Approvals ({pendingUsers.length})</h3>
                    <div className="space-y-3">
                        {pendingUsers.map((user) => (
                            <div
                                key={user.id}
                                className="flex items-center justify-between p-4 bg-accent/50 rounded-lg"
                            >
                                <div>
                                    <p className="font-medium">{user.name}</p>
                                    <p className="text-sm text-muted-foreground capitalize">
                                        {user.role} • {user.department}
                                    </p>
                                    <p className="text-xs text-muted-foreground">{user.email}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button size="sm" variant="outline" onClick={() => rejectUser(user.id)}>
                                        <UserX className="h-4 w-4" />
                                    </Button>
                                    <Button size="sm" onClick={() => approveUser(user.id)}>
                                        <UserCheck className="h-4 w-4 mr-1" />
                                        Approve
                                    </Button>
                                </div>
                            </div>
                        ))}
                        {pendingUsers.length === 0 && (
                            <p className="text-center text-muted-foreground py-4">No pending approvals</p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
