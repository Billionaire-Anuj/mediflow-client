import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Gender } from "@mediflow/mediflow-api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { API_BASE_URL, getErrorMessage, getResponseMessage } from "@/lib/api";
import { MediflowLogo } from "@/components/branding/MediflowLogo";

const AUTH_BASE_URL = API_BASE_URL.replace(/\/$/, "");

const registerSchema = z.object({
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

    const mutation = useMutation({
        mutationFn: async (data: RegisterForm) => {
            const formData = new FormData();

            formData.append("Password", data.password);
            formData.append("Name", data.fullName);
            formData.append("Username", data.username);
            formData.append("EmailAddress", data.email);

            if (data.gender) {
                formData.append("Gender", data.gender);
            }

            if (data.address) {
                formData.append("Address", data.address);
            }

            if (data.phone) {
                formData.append("PhoneNumber", data.phone);
            }

            const response = await fetch(`${AUTH_BASE_URL}/api/v1/authentication/register/patient`, {
                method: "POST",
                body: formData
            });

            const payload = await response.json().catch(() => null);

            if (!response.ok) {
                const message =
                    payload && typeof payload === "object" && "message" in payload ? String(payload.message || "") : "";
                throw new Error(message || response.statusText);
            }

            return payload;
        },
        onSuccess: (_data, variables) => {
            toast.success(getResponseMessage(_data));
            const emailParam = encodeURIComponent(variables.email);
            navigate(`/verify-email?email=${emailParam}`);
        },
        onError: (error) => {
            toast.error(getErrorMessage(error));
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
                    <MediflowLogo markClassName="h-10 w-10" wordmarkClassName="text-2xl" className="gap-2" />
                </Link>

                <div className="max-w-md">
                    <h1 className="text-4xl font-display font-bold text-foreground mb-4">Create Your Account</h1>
                    <p className="text-lg text-muted-foreground">
                        Sign up as a patient to manage appointments, records, and care.
                    </p>
                </div>

                <p className="text-sm text-muted-foreground">© 2026 Mediflow Health Center</p>
            </div>

            <div className="flex-1 flex items-center justify-center p-6 lg:p-12 overflow-auto">
                <div className="w-full max-w-md">
                    <div className="lg:hidden mb-8">
                        <Link to="/" className="flex items-center gap-2 justify-center mb-6">
                            <MediflowLogo markClassName="h-10 w-10" wordmarkClassName="text-2xl" className="gap-2" />
                        </Link>
                    </div>

                    <Card className="border-border">
                        <CardHeader className="space-y-1">
                            <CardTitle className="text-2xl font-display">Patient Registration</CardTitle>
                            <CardDescription>Create your Mediflow patient account</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

                                <Button type="submit" className="w-full" disabled={mutation.isPending}>
                                    {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Create Account
                                </Button>

                                <p className="text-xs text-muted-foreground text-center mt-4">
                                    We will send an OTP to confirm your email address.
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
