import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AuthenticationService } from "@mediflow/mediflow-api";
import { toast } from "sonner";
import { AlertTriangle, ArrowLeft, KeyRound, Loader2, LockKeyhole, ShieldCheck } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getErrorMessage, getResponseMessage } from "@/lib/api";
import { MediflowLogo } from "@/components/branding/MediflowLogo";

const loginSchema = z.object({
    email: z.string().trim().min(1, "Email or username is required"),
    password: z.string().min(1, "Password is required")
});

const twoFactorSchema = z.object({
    authenticationCode: z.string().trim().length(6, "Enter the 6-digit code")
});

const forgotPasswordRequestSchema = z.object({
    emailOrUsername: z.string().trim().min(1, "Email or username is required")
});

const forgotPasswordResetSchema = z
    .object({
        emailOrUsername: z.string().trim().min(1, "Email or username is required"),
        otp: z.string().trim().length(6, "Enter the 6-digit OTP"),
        password: z.string().min(8, "New password must be at least 8 characters"),
        confirmPassword: z.string().min(1, "Please confirm your new password")
    })
    .refine((data) => data.password === data.confirmPassword, {
        path: ["confirmPassword"],
        message: "Passwords do not match"
    });

type LoginForm = z.infer<typeof loginSchema>;
type TwoFactorForm = z.infer<typeof twoFactorSchema>;
type ForgotPasswordRequestForm = z.infer<typeof forgotPasswordRequestSchema>;
type ForgotPasswordResetForm = z.infer<typeof forgotPasswordResetSchema>;

export default function Login() {
    const navigate = useNavigate();
    const { login, loginWithTwoFactor, isLoading, user, isInitializing } = useAuth();
    const [activeTab, setActiveTab] = useState("sign-in");
    const [authStep, setAuthStep] = useState<"login" | "two-factor">("login");
    const [pendingCredentials, setPendingCredentials] = useState<{ email: string; password: string } | null>(null);
    const [isRequestingReset, setIsRequestingReset] = useState(false);
    const [isResettingPassword, setIsResettingPassword] = useState(false);
    const [forgotIdentifier, setForgotIdentifier] = useState("");

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<LoginForm>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: ""
        }
    });

    const {
        handleSubmit: handleTwoFactorSubmit,
        setValue: setTwoFactorValue,
        watch: watchTwoFactorCode,
        reset: resetTwoFactor,
        formState: { errors: twoFactorErrors }
    } = useForm<TwoFactorForm>({
        resolver: zodResolver(twoFactorSchema),
        defaultValues: {
            authenticationCode: ""
        }
    });

    const {
        register: registerForgotRequest,
        handleSubmit: handleForgotRequestSubmit,
        formState: { errors: forgotRequestErrors }
    } = useForm<ForgotPasswordRequestForm>({
        resolver: zodResolver(forgotPasswordRequestSchema),
        defaultValues: {
            emailOrUsername: ""
        }
    });

    const {
        register: registerForgotReset,
        handleSubmit: handleForgotResetSubmit,
        setValue: setForgotResetValue,
        watch: watchForgotOtp,
        reset: resetForgotReset,
        formState: { errors: forgotResetErrors }
    } = useForm<ForgotPasswordResetForm>({
        resolver: zodResolver(forgotPasswordResetSchema),
        defaultValues: {
            emailOrUsername: "",
            otp: "",
            password: "",
            confirmPassword: ""
        }
    });

    const authenticationCode = watchTwoFactorCode("authenticationCode");
    const forgotOtp = watchForgotOtp("otp");

    if (!isInitializing && user) {
        return <Navigate to={`/${user.role}/dashboard`} replace />;
    }

    const onSubmit = async (data: LoginForm) => {
        const result = await login(data.email, data.password);

        if (result.requiresTwoFactor) {
            setPendingCredentials({ email: data.email, password: data.password });
            setAuthStep("two-factor");
            resetTwoFactor();
            toast.success(result.message || "Enter the authenticator code to continue.");
            return;
        }

        if (result.user) {
            toast.success(result.message || "Login successful.");
            navigate(`/${result.user.role}/dashboard`);
            return;
        }

        toast.error(result.message || "Login failed.");
    };

    const onSubmitTwoFactor = async (data: TwoFactorForm) => {
        if (!pendingCredentials) {
            toast.error("Please sign in again to continue with 2FA verification.");
            setAuthStep("login");
            return;
        }

        const result = await loginWithTwoFactor(
            pendingCredentials.email,
            pendingCredentials.password,
            data.authenticationCode
        );

        if (result.user) {
            toast.success(result.message || "Login successful.");
            navigate(`/${result.user.role}/dashboard`);
            return;
        }

        toast.error(result.message || "Unable to verify the authenticator code.");
    };

    const onForgotPasswordRequest = async (data: ForgotPasswordRequestForm) => {
        setIsRequestingReset(true);
        try {
            const response = await AuthenticationService.forgetPasswordConfirmation({
                requestBody: {
                    emailAddressOrUsername: data.emailOrUsername
                }
            });

            setForgotIdentifier(data.emailOrUsername);
            setForgotResetValue("emailOrUsername", data.emailOrUsername, { shouldValidate: true });
            toast.success(getResponseMessage(response));
        } catch (error) {
            toast.error(getErrorMessage(error));
        } finally {
            setIsRequestingReset(false);
        }
    };

    const onForgotPasswordReset = async (data: ForgotPasswordResetForm) => {
        setIsResettingPassword(true);
        try {
            const response = await AuthenticationService.forgotPasswordVerification({
                requestBody: {
                    emailAddressOrUsername: data.emailOrUsername,
                    otp: data.otp,
                    password: data.password
                }
            });

            toast.success(getResponseMessage(response));
            setAuthStep("login");
            setActiveTab("sign-in");
            setForgotIdentifier("");
            resetForgotReset({
                emailOrUsername: "",
                otp: "",
                password: "",
                confirmPassword: ""
            });
        } catch (error) {
            toast.error(getErrorMessage(error));
        } finally {
            setIsResettingPassword(false);
        }
    };

    const handleBackToLogin = () => {
        setAuthStep("login");
        setPendingCredentials(null);
        resetTwoFactor();
    };

    return (
        <div className="min-h-screen bg-[linear-gradient(135deg,#ecfdf5_0%,#f8fafc_40%,#ecfeff_100%)]">
            <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
                <div className="hidden lg:flex flex-col justify-between border-r border-emerald-100/80 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.22),transparent_35%),linear-gradient(180deg,rgba(5,150,105,0.08),rgba(255,255,255,0.15))] px-14 py-12">
                    <div>
                        <Link to="/" className="inline-flex items-center gap-3">
                            <MediflowLogo
                                markClassName="h-12 w-12"
                                wordmarkClassName="text-lg text-slate-900"
                                tagline="Healthcare access platform"
                                taglineClassName="text-sm text-slate-500"
                            />
                        </Link>

                        <div className="mt-20 max-w-xl space-y-7">
                            <Badge className="rounded-full bg-emerald-100 px-4 py-1.5 text-emerald-800 hover:bg-emerald-100">
                                Secure healthcare portal
                            </Badge>
                            <div className="space-y-4">
                                <h1 className="text-5xl font-semibold leading-tight text-slate-950">
                                    Sign in with stronger account protection.
                                </h1>
                                <p className="text-lg leading-8 text-slate-600">
                                    Access appointments, records, labs, and pharmacy workflows with password recovery
                                    and optional authenticator-based two-factor security.
                                </p>
                            </div>

                            <div className="grid gap-4">
                                <div className="rounded-3xl border border-white/80 bg-white/80 p-5 shadow-sm backdrop-blur">
                                    <div className="flex items-start gap-4">
                                        <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700">
                                            <LockKeyhole className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-900">Password recovery by OTP</p>
                                            <p className="mt-1 text-sm leading-6 text-slate-600">
                                                Users can request a reset code and securely set a new password from the
                                                sign-in screen.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-3xl border border-white/80 bg-white/80 p-5 shadow-sm backdrop-blur">
                                    <div className="flex items-start gap-4">
                                        <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700">
                                            <ShieldCheck className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-900">Authenticator app based 2FA</p>
                                            <p className="mt-1 text-sm leading-6 text-slate-600">
                                                Each user can enable or disable 2FA from profile settings after scanning
                                                a QR and confirming a real TOTP code.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <p className="text-sm text-slate-500">© 2026 Mediflow Health Center</p>
                </div>

                <div className="flex items-center justify-center px-6 py-10 lg:px-12">
                    <div className="w-full max-w-xl">
                        <div className="mb-8 lg:hidden">
                            <Link to="/" className="flex items-center justify-center gap-3">
                                <MediflowLogo
                                    markClassName="h-11 w-11"
                                    wordmarkClassName="text-2xl text-slate-900"
                                    className="gap-3"
                                />
                            </Link>
                        </div>

                        <Card className="overflow-hidden border-emerald-100 bg-white/95 shadow-[0_28px_80px_-36px_rgba(15,23,42,0.45)] backdrop-blur">
                            <CardHeader className="space-y-3 border-b border-emerald-50 bg-[linear-gradient(180deg,rgba(236,253,245,0.95),rgba(255,255,255,0.96))]">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700">
                                        {authStep === "two-factor" ? (
                                            <ShieldCheck className="h-5 w-5" />
                                        ) : (
                                            <LockKeyhole className="h-5 w-5" />
                                        )}
                                    </div>
                                    <div>
                                        <CardTitle className="text-2xl font-semibold text-slate-950">
                                            {authStep === "two-factor" ? "Two-factor verification" : "Welcome back"}
                                        </CardTitle>
                                        <CardDescription className="text-sm text-slate-600">
                                            {authStep === "two-factor"
                                                ? "Enter the 6-digit code from your authenticator app to finish signing in."
                                                : "Sign in to your Mediflow account or recover access securely."}
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="p-6 md:p-8">
                                {authStep === "two-factor" ? (
                                    <div className="space-y-6">
                                        <Alert className="border-emerald-200 bg-emerald-50/70">
                                            <ShieldCheck className="h-4 w-4 text-emerald-700" />
                                            <AlertTitle className="text-emerald-900">Verification required</AlertTitle>
                                            <AlertDescription className="text-emerald-800">
                                                We verified your password. Please enter the live code from your
                                                authenticator app for{" "}
                                                <span className="font-medium">{pendingCredentials?.email}</span>.
                                            </AlertDescription>
                                        </Alert>

                                        <form onSubmit={handleTwoFactorSubmit(onSubmitTwoFactor)} className="space-y-5">
                                            <div className="space-y-3">
                                                <Label htmlFor="authenticationCode">Authenticator Code</Label>
                                                <InputOTP
                                                    id="authenticationCode"
                                                    maxLength={6}
                                                    value={authenticationCode}
                                                    onChange={(value) =>
                                                        setTwoFactorValue(
                                                            "authenticationCode",
                                                            value.replace(/\D/g, "").slice(0, 6),
                                                            { shouldValidate: true }
                                                        )
                                                    }
                                                >
                                                    <InputOTPGroup className="grid w-full grid-cols-6 gap-2">
                                                        {Array.from({ length: 6 }).map((_, index) => (
                                                            <InputOTPSlot
                                                                key={index}
                                                                index={index}
                                                                className="h-12 w-full rounded-2xl border border-emerald-100 bg-white text-base shadow-sm"
                                                            />
                                                        ))}
                                                    </InputOTPGroup>
                                                </InputOTP>
                                                {twoFactorErrors.authenticationCode && (
                                                    <p className="text-xs text-destructive">
                                                        {twoFactorErrors.authenticationCode.message}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
                                                <Button type="button" variant="outline" onClick={handleBackToLogin}>
                                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                                    Back to sign in
                                                </Button>
                                                <Button
                                                    type="submit"
                                                    disabled={isLoading || authenticationCode.length !== 6}
                                                >
                                                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                    Verify and continue
                                                </Button>
                                            </div>
                                        </form>
                                    </div>
                                ) : (
                                    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                                        <TabsList className="grid w-full grid-cols-2">
                                            <TabsTrigger value="sign-in">Sign In</TabsTrigger>
                                            <TabsTrigger value="forgot-password">Forgot Password</TabsTrigger>
                                        </TabsList>

                                        <TabsContent value="sign-in" className="space-y-6">
                                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="email">Email / Username</Label>
                                                    <Input
                                                        id="email"
                                                        placeholder="Enter your email or username"
                                                        {...register("email")}
                                                        className={errors.email ? "border-destructive" : ""}
                                                    />
                                                    {errors.email && (
                                                        <p className="text-xs text-destructive">
                                                            {errors.email.message}
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="password">Password</Label>
                                                    <Input
                                                        id="password"
                                                        type="password"
                                                        placeholder="Enter your password"
                                                        {...register("password")}
                                                        className={errors.password ? "border-destructive" : ""}
                                                    />
                                                    {errors.password && (
                                                        <p className="text-xs text-destructive">
                                                            {errors.password.message}
                                                        </p>
                                                    )}
                                                </div>

                                                <Button type="submit" className="w-full" disabled={isLoading}>
                                                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                    Sign In
                                                </Button>
                                            </form>

                                            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4">
                                                <div className="flex items-start gap-3">
                                                    <ShieldCheck className="mt-0.5 h-4 w-4 text-emerald-700" />
                                                    <div className="text-sm text-emerald-900">
                                                        <p className="font-medium">2FA users</p>
                                                        <p className="mt-1 text-emerald-800">
                                                            If your profile has two-factor authentication enabled, we’ll
                                                            ask for your authenticator code after your password is
                                                            verified.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            <p className="text-center text-sm text-muted-foreground">
                                                Don&apos;t have an account?{" "}
                                                <Link
                                                    to="/register"
                                                    className="font-medium text-primary hover:underline"
                                                >
                                                    Register here
                                                </Link>
                                            </p>
                                        </TabsContent>

                                        <TabsContent value="forgot-password" className="space-y-6">
                                            <Alert className="border-amber-200 bg-amber-50">
                                                <AlertTriangle className="h-4 w-4 text-amber-700" />
                                                <AlertTitle className="text-amber-900">Password recovery</AlertTitle>
                                                <AlertDescription className="text-amber-800">
                                                    First request an OTP using your email or username, then verify that
                                                    OTP and set your new password below.
                                                </AlertDescription>
                                            </Alert>

                                            <div className="grid gap-5">
                                                <div className="rounded-3xl border border-emerald-100 bg-emerald-50/40 p-5">
                                                    <p className="text-sm font-semibold text-slate-900">
                                                        1. Request reset OTP
                                                    </p>
                                                    <p className="mt-1 text-sm text-slate-600">
                                                        We’ll send a confirmation code to the email address linked to
                                                        this account.
                                                    </p>

                                                    <form
                                                        onSubmit={handleForgotRequestSubmit(onForgotPasswordRequest)}
                                                        className="mt-4 space-y-4"
                                                    >
                                                        <div className="space-y-2">
                                                            <Label htmlFor="forgot-emailOrUsername">
                                                                Email / Username
                                                            </Label>
                                                            <Input
                                                                id="forgot-emailOrUsername"
                                                                placeholder="Enter your email or username"
                                                                {...registerForgotRequest("emailOrUsername")}
                                                                className={
                                                                    forgotRequestErrors.emailOrUsername
                                                                        ? "border-destructive"
                                                                        : ""
                                                                }
                                                            />
                                                            {forgotRequestErrors.emailOrUsername && (
                                                                <p className="text-xs text-destructive">
                                                                    {forgotRequestErrors.emailOrUsername.message}
                                                                </p>
                                                            )}
                                                        </div>

                                                        <Button
                                                            type="submit"
                                                            variant="outline"
                                                            disabled={isRequestingReset}
                                                        >
                                                            {isRequestingReset && (
                                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                            )}
                                                            Send OTP
                                                        </Button>
                                                    </form>
                                                </div>

                                                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                                                    <div className="flex flex-wrap items-center gap-3">
                                                        <p className="text-sm font-semibold text-slate-900">
                                                            2. Verify OTP and create new password
                                                        </p>
                                                        {forgotIdentifier ? (
                                                            <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
                                                                OTP sent for {forgotIdentifier}
                                                            </Badge>
                                                        ) : null}
                                                    </div>

                                                    <form
                                                        onSubmit={handleForgotResetSubmit(onForgotPasswordReset)}
                                                        className="mt-4 space-y-4"
                                                    >
                                                        <div className="space-y-2">
                                                            <Label htmlFor="reset-emailOrUsername">
                                                                Email / Username
                                                            </Label>
                                                            <Input
                                                                id="reset-emailOrUsername"
                                                                placeholder="Enter your email or username"
                                                                {...registerForgotReset("emailOrUsername")}
                                                                className={
                                                                    forgotResetErrors.emailOrUsername
                                                                        ? "border-destructive"
                                                                        : ""
                                                                }
                                                            />
                                                            {forgotResetErrors.emailOrUsername && (
                                                                <p className="text-xs text-destructive">
                                                                    {forgotResetErrors.emailOrUsername.message}
                                                                </p>
                                                            )}
                                                        </div>

                                                        <div className="space-y-3">
                                                            <Label htmlFor="reset-otp">OTP Code</Label>
                                                            <InputOTP
                                                                id="reset-otp"
                                                                maxLength={6}
                                                                value={forgotOtp}
                                                                onChange={(value) =>
                                                                    setForgotResetValue(
                                                                        "otp",
                                                                        value.replace(/\D/g, "").slice(0, 6),
                                                                        {
                                                                            shouldValidate: true
                                                                        }
                                                                    )
                                                                }
                                                            >
                                                                <InputOTPGroup className="grid w-full grid-cols-6 gap-2">
                                                                    {Array.from({ length: 6 }).map((_, index) => (
                                                                        <InputOTPSlot
                                                                            key={index}
                                                                            index={index}
                                                                            className="h-12 w-full rounded-2xl border border-emerald-100 bg-white text-base shadow-sm"
                                                                        />
                                                                    ))}
                                                                </InputOTPGroup>
                                                            </InputOTP>
                                                            {forgotResetErrors.otp && (
                                                                <p className="text-xs text-destructive">
                                                                    {forgotResetErrors.otp.message}
                                                                </p>
                                                            )}
                                                        </div>

                                                        <div className="grid gap-4 sm:grid-cols-2">
                                                            <div className="space-y-2">
                                                                <Label htmlFor="reset-password">New Password</Label>
                                                                <Input
                                                                    id="reset-password"
                                                                    type="password"
                                                                    placeholder="Create a new password"
                                                                    {...registerForgotReset("password")}
                                                                    className={
                                                                        forgotResetErrors.password
                                                                            ? "border-destructive"
                                                                            : ""
                                                                    }
                                                                />
                                                                {forgotResetErrors.password && (
                                                                    <p className="text-xs text-destructive">
                                                                        {forgotResetErrors.password.message}
                                                                    </p>
                                                                )}
                                                            </div>

                                                            <div className="space-y-2">
                                                                <Label htmlFor="reset-confirmPassword">
                                                                    Confirm Password
                                                                </Label>
                                                                <Input
                                                                    id="reset-confirmPassword"
                                                                    type="password"
                                                                    placeholder="Re-enter your new password"
                                                                    {...registerForgotReset("confirmPassword")}
                                                                    className={
                                                                        forgotResetErrors.confirmPassword
                                                                            ? "border-destructive"
                                                                            : ""
                                                                    }
                                                                />
                                                                {forgotResetErrors.confirmPassword && (
                                                                    <p className="text-xs text-destructive">
                                                                        {forgotResetErrors.confirmPassword.message}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <Button
                                                            type="submit"
                                                            className="w-full"
                                                            disabled={isResettingPassword}
                                                        >
                                                            {isResettingPassword && (
                                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                            )}
                                                            <KeyRound className="mr-2 h-4 w-4" />
                                                            Update Password
                                                        </Button>
                                                    </form>
                                                </div>
                                            </div>
                                        </TabsContent>
                                    </Tabs>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
