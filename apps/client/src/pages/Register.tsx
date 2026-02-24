import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { RoleService, UserService, Gender } from "@mediflow/mediflow-api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Upload } from "lucide-react";

const registerSchema = z.object({
    roleId: z.string().min(1, "Please select a role"),
    fullName: z.string().min(2, "Full name is required"),
    email: z.string().email("Please enter a valid email"),
    username: z.string().min(3, "Username is required"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    phone: z.string().optional(),
    address: z.string().optional(),
    gender: z.enum([Gender.MALE, Gender.FEMALE]).optional()
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function Register() {
    const navigate = useNavigate();
    const [profileImage, setProfileImage] = useState<File | null>(null);

    const { data: rolesData } = useQuery({
        queryKey: ["registerable-roles"],
        queryFn: async () => RoleService.getAllAvailableRolesList({})
    });

    const roles = rolesData?.result ?? [];

    const mutation = useMutation({
        mutationFn: async (data: RegisterForm) => {
            return UserService.registerUser({
                formData: {
                    Password: data.password,
                    RoleId: data.roleId,
                    Gender: data.gender,
                    Name: data.fullName,
                    Username: data.username,
                    EmailAddress: data.email,
                    Address: data.address,
                    PhoneNumber: data.phone,
                    ProfileImage: profileImage || undefined
                }
            });
        },
        onSuccess: () => {
            toast.success("Registration submitted", {
                description: "You will receive an email once your application is reviewed."
            });
            navigate("/login");
        },
        onError: () => {
            toast.error("Registration failed", {
                description: "Please verify your details and try again."
            });
        }
    });

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors }
    } = useForm<RegisterForm>({
        resolver: zodResolver(registerSchema)
    });

    const onSubmit = (data: RegisterForm) => {
        mutation.mutate(data);
    };

    return (
        <div className="min-h-screen bg-background flex">
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary/10 via-accent to-background p-12 flex-col justify-between">
                <Link to="/" className="flex items-center gap-2">
                    <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
                        <span className="text-primary-foreground font-bold text-lg">M</span>
                    </div>
                    <span className="font-display font-semibold text-2xl">Mediflow</span>
                </Link>

                <div className="max-w-md">
                    <h1 className="text-4xl font-display font-bold text-foreground mb-4">Join Our Team</h1>
                    <p className="text-lg text-muted-foreground">
                        Register as a healthcare professional to join our platform and provide quality care to patients.
                    </p>
                </div>

                <p className="text-sm text-muted-foreground">© 2026 Mediflow Health Center</p>
            </div>

            <div className="flex-1 flex items-center justify-center p-6 lg:p-12 overflow-auto">
                <div className="w-full max-w-md">
                    <div className="lg:hidden mb-8">
                        <Link to="/" className="flex items-center gap-2 justify-center mb-6">
                            <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
                                <span className="text-primary-foreground font-bold text-lg">M</span>
                            </div>
                            <span className="font-display font-semibold text-2xl">Mediflow</span>
                        </Link>
                    </div>

                    <Card className="border-border">
                        <CardHeader className="space-y-1">
                            <CardTitle className="text-2xl font-display">Staff Registration</CardTitle>
                            <CardDescription>Submit your application to join Mediflow</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Role</Label>
                                    <Select onValueChange={(value) => setValue("roleId", value)}>
                                        <SelectTrigger className={errors.roleId ? "border-destructive" : ""}>
                                            <SelectValue placeholder="Select your role" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-popover">
                                            {roles.map((role) => (
                                                <SelectItem key={role.id} value={role.id || ""}>
                                                    {role.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.roleId && (
                                        <p className="text-xs text-destructive">{errors.roleId.message}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="fullName">Full Name</Label>
                                    <Input
                                        id="fullName"
                                        placeholder="Enter your full name"
                                        {...register("fullName")}
                                        className={errors.fullName ? "border-destructive" : ""}
                                    />
                                    {errors.fullName && (
                                        <p className="text-xs text-destructive">{errors.fullName.message}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="Enter your email"
                                        {...register("email")}
                                        className={errors.email ? "border-destructive" : ""}
                                    />
                                    {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
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

                                <div className="space-y-2">
                                    <Label htmlFor="password">Password</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="Create a password"
                                        {...register("password")}
                                        className={errors.password ? "border-destructive" : ""}
                                    />
                                    {errors.password && (
                                        <p className="text-xs text-destructive">{errors.password.message}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label>Gender</Label>
                                    <Select onValueChange={(value) => setValue("gender", value as Gender)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select gender" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-popover">
                                            <SelectItem value={Gender.MALE}>Male</SelectItem>
                                            <SelectItem value={Gender.FEMALE}>Female</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone</Label>
                                    <Input id="phone" placeholder="Phone number" {...register("phone")} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="address">Address</Label>
                                    <Input id="address" placeholder="Address" {...register("address")} />
                                </div>

                                <div className="space-y-2">
                                    <Label>Profile Image</Label>
                                    <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
                                        <input
                                            type="file"
                                            id="profileImage"
                                            className="hidden"
                                            accept=".jpg,.jpeg,.png"
                                            onChange={(e) => setProfileImage(e.target.files?.[0] || null)}
                                        />
                                        <label htmlFor="profileImage" className="cursor-pointer">
                                            <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
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

                                <Button type="submit" className="w-full" disabled={mutation.isPending}>
                                    {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Request Registration
                                </Button>

                                <p className="text-xs text-muted-foreground text-center mt-4">
                                    Applications are typically reviewed within 2-3 business days. You will receive an
                                    email notification once approved.
                                </p>
                            </form>

                            <p className="text-center text-sm text-muted-foreground mt-6">
                                Already have an account?{" "}
                                <Link to="/login" className="text-primary hover:underline font-medium">
                                    Sign in
                                </Link>
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
