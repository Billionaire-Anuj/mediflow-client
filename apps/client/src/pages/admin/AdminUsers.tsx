import { useState, useEffect } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge, getStatusVariant } from "@/components/ui/status-badge";
import { ListSkeleton } from "@/components/ui/loading-skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { mockUsers, User } from "@/mock/users";
import { Search, Users, UserCheck, UserX, Eye, Ban, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export default function AdminUsers() {
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState<User[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [confirmAction, setConfirmAction] = useState<{
        user: User;
        action: "approve" | "reject" | "suspend" | "activate";
    } | null>(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            setUsers(mockUsers);
            setLoading(false);
        }, 400);
        return () => clearTimeout(timer);
    }, []);

    const handleAction = () => {
        if (!confirmAction) return;

        const { user, action } = confirmAction;

        if (action === "reject") {
            setUsers((prev) => prev.filter((u) => u.id !== user.id));
            toast.success("User registration rejected");
        } else {
            const newStatus = action === "approve" || action === "activate" ? "active" : "suspended";
            setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, status: newStatus } : u)));
            toast.success(
                `User ${action === "approve" ? "approved" : action === "activate" ? "activated" : "suspended"}`
            );
        }

        setConfirmAction(null);
    };

    const filteredUsers = users.filter(
        (u) =>
            u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const pendingUsers = filteredUsers.filter((u) => u.status === "pending");
    const activeUsers = filteredUsers.filter((u) => u.status === "active");
    const suspendedUsers = filteredUsers.filter((u) => u.status === "suspended");

    const getRoleColor = (role: string) => {
        const colors: Record<string, string> = {
            patient: "bg-blue-100 text-blue-800",
            doctor: "bg-green-100 text-green-800",
            lab: "bg-purple-100 text-purple-800",
            pharmacist: "bg-orange-100 text-orange-800",
            admin: "bg-red-100 text-red-800"
        };
        return colors[role] || "bg-gray-100 text-gray-800";
    };

    const UserCard = ({ user, showActions = true }: { user: User; showActions?: boolean }) => (
        <Card className="card-interactive">
            <CardContent className="p-4">
                <div className="flex items-center justify-between">
                    <div className="flex gap-4">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <span className="font-medium text-primary">
                                {user.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")
                                    .slice(0, 2)}
                            </span>
                        </div>
                        <div>
                            <h3 className="font-medium">{user.name}</h3>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                            <div className="flex items-center gap-2 mt-1">
                                <span
                                    className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${getRoleColor(user.role)}`}
                                >
                                    {user.role}
                                </span>
                                {user.department && (
                                    <span className="text-xs text-muted-foreground">{user.department}</span>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <StatusBadge variant={getStatusVariant(user.status)}>{user.status}</StatusBadge>
                        <Button variant="ghost" size="icon" onClick={() => setSelectedUser(user)}>
                            <Eye className="h-4 w-4" />
                        </Button>
                        {showActions && user.status === "pending" && (
                            <>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setConfirmAction({ user, action: "reject" })}
                                >
                                    <UserX className="h-4 w-4" />
                                </Button>
                                <Button size="sm" onClick={() => setConfirmAction({ user, action: "approve" })}>
                                    <UserCheck className="h-4 w-4 mr-1" />
                                    Approve
                                </Button>
                            </>
                        )}
                        {showActions && user.status === "active" && user.role !== "admin" && (
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setConfirmAction({ user, action: "suspend" })}
                            >
                                <Ban className="h-4 w-4 mr-1" />
                                Suspend
                            </Button>
                        )}
                        {showActions && user.status === "suspended" && (
                            <Button size="sm" onClick={() => setConfirmAction({ user, action: "activate" })}>
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Activate
                            </Button>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );

    if (loading) {
        return (
            <div className="space-y-6">
                <PageHeader title="User Management" />
                <ListSkeleton items={4} />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader title="User Management" description="Manage user accounts and approvals" />

            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                />
            </div>

            <Tabs defaultValue="pending" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="pending" className="gap-2">
                        Pending Approvals
                        {pendingUsers.length > 0 && (
                            <span className="ml-1 px-2 py-0.5 rounded-full bg-status-warning text-status-warning-foreground text-xs">
                                {pendingUsers.length}
                            </span>
                        )}
                    </TabsTrigger>
                    <TabsTrigger value="active">Active Users ({activeUsers.length})</TabsTrigger>
                    <TabsTrigger value="suspended">Suspended ({suspendedUsers.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="pending" className="space-y-3">
                    {pendingUsers.length === 0 ? (
                        <EmptyState
                            icon={Users}
                            title="No pending approvals"
                            description="All registration requests have been processed"
                        />
                    ) : (
                        pendingUsers.map((user) => <UserCard key={user.id} user={user} />)
                    )}
                </TabsContent>

                <TabsContent value="active" className="space-y-3">
                    {activeUsers.length === 0 ? (
                        <EmptyState icon={Users} title="No active users" />
                    ) : (
                        activeUsers.map((user) => <UserCard key={user.id} user={user} />)
                    )}
                </TabsContent>

                <TabsContent value="suspended" className="space-y-3">
                    {suspendedUsers.length === 0 ? (
                        <EmptyState icon={Users} title="No suspended users" />
                    ) : (
                        suspendedUsers.map((user) => <UserCard key={user.id} user={user} />)
                    )}
                </TabsContent>
            </Tabs>

            {/* User Detail Dialog */}
            <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>User Details</DialogTitle>
                        <DialogDescription>{selectedUser?.email}</DialogDescription>
                    </DialogHeader>
                    {selectedUser && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                                    <span className="text-xl font-semibold text-primary">
                                        {selectedUser.name
                                            .split(" ")
                                            .map((n) => n[0])
                                            .join("")
                                            .slice(0, 2)}
                                    </span>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg">{selectedUser.name}</h3>
                                    <div className="flex items-center gap-2">
                                        <span
                                            className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${getRoleColor(selectedUser.role)}`}
                                        >
                                            {selectedUser.role}
                                        </span>
                                        <StatusBadge variant={getStatusVariant(selectedUser.status)}>
                                            {selectedUser.status}
                                        </StatusBadge>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between py-2 border-b">
                                    <span className="text-muted-foreground">Email</span>
                                    <span>{selectedUser.email}</span>
                                </div>
                                {selectedUser.phone && (
                                    <div className="flex justify-between py-2 border-b">
                                        <span className="text-muted-foreground">Phone</span>
                                        <span>{selectedUser.phone}</span>
                                    </div>
                                )}
                                {selectedUser.department && (
                                    <div className="flex justify-between py-2 border-b">
                                        <span className="text-muted-foreground">Department</span>
                                        <span>{selectedUser.department}</span>
                                    </div>
                                )}
                                {selectedUser.specialty && (
                                    <div className="flex justify-between py-2 border-b">
                                        <span className="text-muted-foreground">Specialty</span>
                                        <span>{selectedUser.specialty}</span>
                                    </div>
                                )}
                                {selectedUser.licenseNumber && (
                                    <div className="flex justify-between py-2 border-b">
                                        <span className="text-muted-foreground">License Number</span>
                                        <span>{selectedUser.licenseNumber}</span>
                                    </div>
                                )}
                                <div className="flex justify-between py-2">
                                    <span className="text-muted-foreground">Registered</span>
                                    <span>{format(new Date(selectedUser.createdAt), "MMM d, yyyy")}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Confirm Action Dialog */}
            <ConfirmDialog
                open={!!confirmAction}
                onOpenChange={() => setConfirmAction(null)}
                title={
                    confirmAction?.action === "approve"
                        ? "Approve User"
                        : confirmAction?.action === "reject"
                          ? "Reject Registration"
                          : confirmAction?.action === "suspend"
                            ? "Suspend User"
                            : "Activate User"
                }
                description={
                    confirmAction?.action === "approve"
                        ? `Are you sure you want to approve ${confirmAction.user.name}?`
                        : confirmAction?.action === "reject"
                          ? `Are you sure you want to reject ${confirmAction?.user.name}'s registration? This cannot be undone.`
                          : confirmAction?.action === "suspend"
                            ? `Are you sure you want to suspend ${confirmAction?.user.name}?`
                            : `Are you sure you want to activate ${confirmAction?.user.name}?`
                }
                confirmLabel={
                    confirmAction?.action === "reject" || confirmAction?.action === "suspend"
                        ? "Yes, proceed"
                        : "Confirm"
                }
                variant={
                    confirmAction?.action === "reject" || confirmAction?.action === "suspend"
                        ? "destructive"
                        : "default"
                }
                onConfirm={handleAction}
            />
        </div>
    );
}
