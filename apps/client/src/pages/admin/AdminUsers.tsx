import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Gender, RoleService, UserService, type RoleDto, type UserDto } from "@mediflow/mediflow-api";
import { PageHeader } from "@/components/ui/page-header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge, getStatusVariant } from "@/components/ui/status-badge";
import { ListSkeleton } from "@/components/ui/loading-skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getAvatarUrl } from "@/lib/auth";
import { API_BASE_URL, getErrorMessage, getResponseMessage } from "@/lib/api";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Users, Eye, Ban, CheckCircle, UserPlus, Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";

const USER_API_BASE_URL = API_BASE_URL.replace(/\/$/, "");

const createUserSchema = z.object({
    roleId: z.string().min(1, "Role is required"),
    name: z.string().min(2, "Name is required"),
    email: z.string().email("Valid email is required"),
    username: z.string().min(3, "Username is required"),
    phone: z.string().optional(),
    address: z.string().optional(),
    gender: z.nativeEnum(Gender).optional()
});

type CreateUserForm = z.infer<typeof createUserSchema>;

export default function AdminUsers() {
    const queryClient = useQueryClient();
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedUser, setSelectedUser] = useState<UserDto | null>(null);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [profileImage, setProfileImage] = useState<File | null>(null);

    const { data, isLoading } = useQuery({
        queryKey: ["admin-users"],
        queryFn: async () => UserService.getAllUsersList({})
    });

    const { data: rolesData } = useQuery({
        queryKey: ["admin-roles"],
        queryFn: async () => RoleService.getAllRolesList({})
    });

    const roles = rolesData?.result ?? [];

    const toggleMutation = useMutation({
        mutationFn: async (userId: string) => UserService.activateDeactivateUser({ userId }),
        onSuccess: (data) => {
            toast.success(getResponseMessage(data));
            queryClient.invalidateQueries({ queryKey: ["admin-users"] });
        },
        onError: (error) => toast.error(getErrorMessage(error))
    });

    const createMutation = useMutation({
        mutationFn: async (payload: CreateUserForm) => {
            const formData = new FormData();
            formData.append("RoleId", payload.roleId);
            formData.append("Name", payload.name);
            formData.append("EmailAddress", payload.email);
            formData.append("Username", payload.username);

            if (payload.gender) {
                formData.append("Gender", payload.gender);
            }

            if (payload.phone) {
                formData.append("PhoneNumber", payload.phone);
            }

            if (payload.address) {
                formData.append("Address", payload.address);
            }

            if (profileImage) {
                formData.append("ProfileImage", profileImage);
            }

            const response = await fetch(`${USER_API_BASE_URL}/api/v1/user/admin/register`, {
                method: "POST",
                body: formData,
                credentials: "include"
            });

            const payloadJson = await response.json().catch(() => null);

            if (!response.ok) {
                const message =
                    payloadJson && typeof payloadJson === "object" && "message" in payloadJson
                        ? String(payloadJson.message || "")
                        : "";
                throw new Error(message || response.statusText);
            }

            return payloadJson;
        },
        onSuccess: (data) => {
            toast.success(getResponseMessage(data));
            setIsCreateOpen(false);
            setProfileImage(null);
            queryClient.invalidateQueries({ queryKey: ["admin-users"] });
        },
        onError: (error) => toast.error(getErrorMessage(error))
    });

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors }
    } = useForm<CreateUserForm>({
        resolver: zodResolver(createUserSchema),
        defaultValues: {
            roleId: "",
            name: "",
            email: "",
            username: "",
            phone: "",
            address: "",
            gender: undefined
        }
    });

    const genderValue = watch("gender");

    const onGenderChange = (nextGender: Gender, checked: boolean) => {
        setValue("gender", checked ? nextGender : undefined, { shouldDirty: true });
    };

    const onCreateSubmit = (payload: CreateUserForm) => {
        createMutation.mutate(payload);
    };

    const onOpenChange = (open: boolean) => {
        setIsCreateOpen(open);
        if (!open) {
            reset();
            setProfileImage(null);
        }
    };

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
                        <Avatar className="h-12 w-12">
                            {user.profileImage?.fileUrl && (
                                <AvatarImage src={getAvatarUrl(user.profileImage.fileUrl)} alt={user.name || "User"} />
                            )}
                            <AvatarFallback className="bg-primary/10 text-primary font-medium">
                                {(user.name || "U")
                                    .split(" ")
                                    .map((n: string) => n[0])
                                    .join("")
                                    .slice(0, 2)}
                            </AvatarFallback>
                        </Avatar>
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
                                disabled={user.role?.name === "Super Admin"}
                                onClick={() => user.id && toggleMutation.mutate(user.id)}
                            >
                                <Ban className="h-4 w-4 mr-1" />
                                Deactivate
                            </Button>
                        ) : (
                            <Button
                                size="sm"
                                disabled={user.role?.name === "Super Admin"}
                                onClick={() => user.id && toggleMutation.mutate(user.id)}
                            >
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
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <PageHeader title="User Management" description="Manage user accounts" />
                <Dialog open={isCreateOpen} onOpenChange={onOpenChange}>
                    <Button onClick={() => setIsCreateOpen(true)} className="sm:self-end">
                        <UserPlus className="h-4 w-4 mr-2" />
                        Add User
                    </Button>
                    <DialogContent className="max-w-lg">
                        <DialogHeader>
                            <DialogTitle>Create User</DialogTitle>
                            <DialogDescription>
                                Create a new user account. A temporary password will be generated and emailed.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit(onCreateSubmit)} className="space-y-4">
                            <div className="space-y-2">
                                <Label>Role</Label>
                                <Select onValueChange={(value) => setValue("roleId", value)}>
                                    <SelectTrigger className={errors.roleId ? "border-destructive" : ""}>
                                        <SelectValue placeholder="Select role" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-popover">
                                        {roles.map((role: RoleDto) => (
                                            <SelectItem key={role.id} value={role.id || ""}>
                                                {role.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.roleId && <p className="text-xs text-destructive">{errors.roleId.message}</p>}
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Full Name</Label>
                                    <Input
                                        id="name"
                                        placeholder="Enter full name"
                                        {...register("name")}
                                        className={errors.name ? "border-destructive" : ""}
                                    />
                                    {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="username">Username</Label>
                                    <Input
                                        id="username"
                                        placeholder="Choose a username"
                                        {...register("username")}
                                        className={errors.username ? "border-destructive" : ""}
                                    />
                                    {errors.username && (
                                        <p className="text-xs text-destructive">{errors.username.message}</p>
                                    )}
                                </div>

                                <div className="space-y-2 sm:col-span-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="Enter email address"
                                        {...register("email")}
                                        className={errors.email ? "border-destructive" : ""}
                                    />
                                    {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Gender</Label>
                                <div className="flex flex-wrap gap-4">
                                    <label className="flex items-center gap-2 text-sm">
                                        <Checkbox
                                            checked={genderValue === Gender.MALE}
                                            onCheckedChange={(checked) =>
                                                onGenderChange(Gender.MALE, Boolean(checked))
                                            }
                                        />
                                        <span>Male</span>
                                    </label>
                                    <label className="flex items-center gap-2 text-sm">
                                        <Checkbox
                                            checked={genderValue === Gender.FEMALE}
                                            onCheckedChange={(checked) =>
                                                onGenderChange(Gender.FEMALE, Boolean(checked))
                                            }
                                        />
                                        <span>Female</span>
                                    </label>
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone</Label>
                                    <Input id="phone" placeholder="Phone number" {...register("phone")} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="address">Address</Label>
                                    <Input id="address" placeholder="Street address" {...register("address")} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Profile Image</Label>
                                <div className="border-2 border-dashed border-border rounded-lg p-4 text-center hover:border-primary/50 transition-colors">
                                    <input
                                        type="file"
                                        id="admin-profile-image"
                                        className="hidden"
                                        accept=".jpg,.jpeg,.png"
                                        onChange={(e) => setProfileImage(e.target.files?.[0] || null)}
                                    />
                                    <label htmlFor="admin-profile-image" className="cursor-pointer">
                                        <Upload className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
                                        {profileImage ? (
                                            <p className="text-sm text-foreground font-medium">
                                                {profileImage.name}
                                            </p>
                                        ) : (
                                            <p className="text-sm text-muted-foreground">
                                                Click to upload a profile image
                                            </p>
                                        )}
                                    </label>
                                </div>
                            </div>

                            <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                                {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Create User
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

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
                                <Avatar className="h-16 w-16">
                                    {selectedUser.profileImage?.fileUrl && (
                                        <AvatarImage
                                            src={getAvatarUrl(selectedUser.profileImage.fileUrl)}
                                            alt={selectedUser.name || "User"}
                                        />
                                    )}
                                    <AvatarFallback className="bg-primary/10 text-primary text-xl font-semibold">
                                        {(selectedUser.name || "U")
                                            .split(" ")
                                            .map((n: string) => n[0])
                                            .join("")
                                            .slice(0, 2)}
                                    </AvatarFallback>
                                </Avatar>
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
