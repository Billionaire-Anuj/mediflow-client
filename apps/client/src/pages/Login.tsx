import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole } from "@/mock/users";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Stethoscope, FlaskConical, Pill, Shield, Loader2 } from "lucide-react";

const loginSchema = z.object({
    email: z.string().email("Please enter a valid email"),
    password: z.string().min(1, "Password is required")
});

type LoginForm = z.infer<typeof loginSchema>;

const demoButtons: { role: UserRole; label: string; icon: React.ElementType }[] = [
    { role: "patient", label: "Patient", icon: User },
    { role: "doctor", label: "Doctor", icon: Stethoscope },
    { role: "lab", label: "Lab Tech", icon: FlaskConical },
    { role: "pharmacist", label: "Pharmacist", icon: Pill },
    { role: "admin", label: "Admin", icon: Shield }
];

export default function Login() {
    const navigate = useNavigate();
    const { login, loginAs, isLoading } = useAuth();
    const [demoLoading, setDemoLoading] = useState<UserRole | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<LoginForm>({
        resolver: zodResolver(loginSchema)
    });

    const onSubmit = async (data: LoginForm) => {
        const success = await login(data.email, data.password);
        if (success) {
            toast.success("Welcome back!");
            // Navigate based on user role (will be determined by the auth context)
            navigate("/patient/dashboard");
        } else {
            toast.error("Invalid credentials. Try one of the demo accounts.");
        }
    };

    const handleDemoLogin = async (role: UserRole) => {
        setDemoLoading(role);
        // Simulate loading
        await new Promise((resolve) => setTimeout(resolve, 300));
        loginAs(role);
        toast.success(`Logged in as ${role}`);
        navigate(`/${role}/dashboard`);
        setDemoLoading(null);
    };

    return (
        <div className="min-h-screen bg-background flex">
            {/* Left Panel - Branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary/10 via-accent to-background p-12 flex-col justify-between">
                <Link to="/" className="flex items-center gap-2">
                    <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
                        <span className="text-primary-foreground font-bold text-lg">M</span>
                    </div>
                    <span className="font-display font-semibold text-2xl">Mediflow</span>
                </Link>

                <div className="max-w-md">
                    <h1 className="text-4xl font-display font-bold text-foreground mb-4">Welcome Back</h1>
                    <p className="text-lg text-muted-foreground">
                        Access your healthcare portal to manage appointments, view records, and connect with your care
                        team.
                    </p>
                </div>

                <p className="text-sm text-muted-foreground">© 2026 Mediflow Health Center</p>
            </div>

            {/* Right Panel - Login Form */}
            <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
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
                            <CardTitle className="text-2xl font-display">Sign In</CardTitle>
                            <CardDescription>Enter your credentials to access your account</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="password">Password</Label>
                                        <Link to="/forgot-password" className="text-xs text-primary hover:underline">
                                            Forgot password?
                                        </Link>
                                    </div>
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="Enter your password"
                                        {...register("password")}
                                        className={errors.password ? "border-destructive" : ""}
                                    />
                                    {errors.password && (
                                        <p className="text-xs text-destructive">{errors.password.message}</p>
                                    )}
                                </div>

                                <Button type="submit" className="w-full" disabled={isLoading}>
                                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Sign In
                                </Button>
                            </form>

                            <div className="mt-6">
                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <Separator />
                                    </div>
                                    <div className="relative flex justify-center text-xs uppercase">
                                        <span className="bg-card px-2 text-muted-foreground">
                                            Or login as demo user
                                        </span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-5 gap-2 mt-4">
                                    {demoButtons.map(({ role, label, icon: Icon }) => (
                                        <Button
                                            key={role}
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="flex flex-col h-auto py-3 px-2 gap-1"
                                            onClick={() => handleDemoLogin(role)}
                                            disabled={demoLoading !== null}
                                        >
                                            {demoLoading === role ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Icon className="h-4 w-4" />
                                            )}
                                            <span className="text-[10px]">{label}</span>
                                        </Button>
                                    ))}
                                </div>
                            </div>

                            <p className="text-center text-sm text-muted-foreground mt-6">
                                Don't have an account?{" "}
                                <Link to="/register" className="text-primary hover:underline font-medium">
                                    Register here
                                </Link>
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
