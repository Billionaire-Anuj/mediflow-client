import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { UserService, type UserDto } from "@mediflow/mediflow-api";
import { PageHeader } from "@/components/ui/page-header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge, getStatusVariant } from "@/components/ui/status-badge";
import { ListSkeleton } from "@/components/ui/loading-skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, Users, Eye, Ban, CheckCircle } from "lucide-react";
import { toast } from "sonner";

export default function AdminUsers() {
    const queryClient = useQueryClient();
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedUser, setSelectedUser] = useState<UserDto | null>(null);

    const { data, isLoading } = useQuery({
        queryKey: ["admin-users"],
        queryFn: async () => UserService.getAllUsersList({})
    });

    const toggleMutation = useMutation({
        mutationFn: async (userId: string) => UserService.activateDeactivateUser({ userId }),
        onSuccess: () => {
            toast.success("User status updated");
            queryClient.invalidateQueries({ queryKey: ["admin-users"] });
        },
        onError: () => toast.error("Failed to update user status")
    });

    const users = useMemo(() => data?.result ?? [], [data]);

    const filteredUsers = users.filter((u) => {
        const name = u.name?.toLowerCase() || "";
        const email = u.emailAddress?.toLowerCase() || "";
        return name.includes(searchQuery.toLowerCase()) || email.includes(searchQuery.toLowerCase());
    });

    const activeUsers = filteredUsers.filter((u) => u.isActive);
    const inactiveUsers = filteredUsers.filter((u) => !u.isActive);

    const getRoleColor = (role?: string | null) => {
        const colors: Record<string, string> = {
            patient: "bg-blue-100 text-blue-800",
            doctor: "bg-green-100 text-green-800",
            "lab technician": "bg-purple-100 text-purple-800",
            pharmacist: "bg-orange-100 text-orange-800",
            "super admin": "bg-red-100 text-red-800",
            admin: "bg-red-100 text-red-800"
        };
        return colors[role?.toLowerCase() || ""] || "bg-gray-100 text-gray-800";
    };

    const UserCard = ({ user }: { user: UserDto }) => (
        <Card className="card-interactive">
            <CardContent className="p-4">
                <div className="flex items-center justify-between">
                    <div className="flex gap-4">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <span className="font-medium text-primary">
                                {(user.name || "U")
                                    .split(" ")
                                    .map((n: string) => n[0])
                                    .join("")
                                    .slice(0, 2)}
                            </span>
                        </div>
                        <div>
                            <h3 className="font-medium">{user.name}</h3>
                            <p className="text-sm text-muted-foreground">{user.emailAddress}</p>
                            <div className="flex items-center gap-2 mt-1">
                                <span
                                    className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${getRoleColor(
                                        user.role?.name
                                    )}`}
                                >
                                    {user.role?.name}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <StatusBadge variant={getStatusVariant(user.isActive ? "active" : "inactive")}>
                            {user.isActive ? "Active" : "Inactive"}
                        </StatusBadge>
                        <Button variant="ghost" size="icon" onClick={() => setSelectedUser(user)}>
                            <Eye className="h-4 w-4" />
                        </Button>
                        {user.isActive ? (
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => user.id && toggleMutation.mutate(user.id)}
                            >
                                <Ban className="h-4 w-4 mr-1" />
                                Deactivate
                            </Button>
                        ) : (
                            <Button size="sm" onClick={() => user.id && toggleMutation.mutate(user.id)}>
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Activate
                            </Button>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );

    if (isLoading) {
        return (
            <div className="space-y-6">
                <PageHeader title="User Management" />
                <ListSkeleton items={4} />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader title="User Management" description="Manage user accounts" />

            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                />
            </div>

            <Tabs defaultValue="active" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="active">Active Users ({activeUsers.length})</TabsTrigger>
                    <TabsTrigger value="inactive">Inactive Users ({inactiveUsers.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="active" className="space-y-3">
                    {activeUsers.length === 0 ? (
                        <EmptyState icon={Users} title="No active users" />
                    ) : (
                        activeUsers.map((user) => <UserCard key={user.id} user={user} />)
                    )}
                </TabsContent>

                <TabsContent value="inactive" className="space-y-3">
                    {inactiveUsers.length === 0 ? (
                        <EmptyState icon={Users} title="No inactive users" />
                    ) : (
                        inactiveUsers.map((user) => <UserCard key={user.id} user={user} />)
                    )}
                </TabsContent>
            </Tabs>

            <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>User Details</DialogTitle>
                        <DialogDescription>{selectedUser?.emailAddress}</DialogDescription>
                    </DialogHeader>
                    {selectedUser && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                                    <span className="text-xl font-semibold text-primary">
                                        {(selectedUser.name || "U")
                                            .split(" ")
                                            .map((n: string) => n[0])
                                            .join("")
                                            .slice(0, 2)}
                                    </span>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg">{selectedUser.name}</h3>
                                    <div className="flex items-center gap-2">
                                        <span
                                            className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${getRoleColor(
                                                selectedUser.role?.name
                                            )}`}
                                        >
                                            {selectedUser.role?.name}
                                        </span>
                                        <StatusBadge
                                            variant={getStatusVariant(selectedUser.isActive ? "active" : "inactive")}
                                        >
                                            {selectedUser.isActive ? "Active" : "Inactive"}
                                        </StatusBadge>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between py-2 border-b">
                                    <span className="text-muted-foreground">Email</span>
                                    <span>{selectedUser.emailAddress}</span>
                                </div>
                                {selectedUser.phoneNumber && (
                                    <div className="flex justify-between py-2 border-b">
                                        <span className="text-muted-foreground">Phone</span>
                                        <span>{selectedUser.phoneNumber}</span>
                                    </div>
                                )}
                                {selectedUser.address && (
                                    <div className="flex justify-between py-2 border-b">
                                        <span className="text-muted-foreground">Address</span>
                                        <span>{selectedUser.address}</span>
                                    </div>
                                )}
                                <div className="flex justify-between py-2">
                                    <span className="text-muted-foreground">Registered</span>
                                    <span>N/A</span>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
