import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

const loginSchema = z.object({
    email: z.string().email("Please enter a valid email"),
    password: z.string().min(1, "Password is required")
});

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
    const navigate = useNavigate();
    const { login, isLoading } = useAuth();

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<LoginForm>({
        resolver: zodResolver(loginSchema)
    });

    const onSubmit = async (data: LoginForm) => {
        const user = await login(data.email, data.password);
        if (user) {
            toast.success("Welcome back!");
            navigate(`/${user.role}/dashboard`);
        } else {
            toast.error("Invalid credentials or 2FA required.");
        }
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
