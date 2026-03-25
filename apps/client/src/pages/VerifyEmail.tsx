import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Loader2, MailCheck } from "lucide-react";
import { API_BASE_URL, getErrorMessage, getResponseMessage } from "@/lib/api";

const AUTH_BASE_URL = API_BASE_URL.replace(/\/$/, "");

const verificationSchema = z.object({
    email: z.string().email("Please enter a valid email"),
    otp: z.string().min(6, "Enter the 6-digit OTP").max(6, "Enter the 6-digit OTP")
});

type VerificationForm = z.infer<typeof verificationSchema>;

export default function VerifyEmail() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const emailFromQuery = searchParams.get("email") || "";

    const mutation = useMutation({
        mutationFn: async (data: VerificationForm) => {
            const response = await fetch(`${AUTH_BASE_URL}/api/v1/authentication/confirm/email`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    emailAddressOrUsername: data.email,
                    otp: data.otp
                })
            });

            const payload = await response.json().catch(() => null);

            if (!response.ok) {
                const message =
                    payload && typeof payload === "object" && "message" in payload
                        ? String(payload.message || "")
                        : "";
                throw new Error(message || response.statusText);
            }

            return payload;
        },
        onSuccess: (data) => {
            toast.success(getResponseMessage(data));
            navigate("/login");
        },
        onError: (error) => {
            toast.error(getErrorMessage(error));
        }
    });

    const {
        register,
        handleSubmit,
        control,
        formState: { errors }
    } = useForm<VerificationForm>({
        resolver: zodResolver(verificationSchema),
        defaultValues: {
            email: emailFromQuery,
            otp: ""
        }
    });

    const onSubmit = (data: VerificationForm) => {
        mutation.mutate(data);
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6">
            <div className="w-full max-w-md">
                <Card className="border-border">
                    <CardHeader className="space-y-2 text-center">
                        <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <MailCheck className="h-6 w-6 text-primary" />
                        </div>
                        <CardTitle className="text-2xl font-display">Verify your email</CardTitle>
                        <CardDescription>
                            Enter the 6-digit OTP sent to your email to activate your account.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    {...register("email")}
                                    className={errors.email ? "border-destructive" : ""}
                                />
                                {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label>OTP</Label>
                                <Controller
                                    control={control}
                                    name="otp"
                                    render={({ field }) => (
                                        <InputOTP
                                            maxLength={6}
                                            type="text"
                                            value={field.value}
                                            onChange={field.onChange}
                                            containerClassName="justify-center"
                                        >
                                            <InputOTPGroup>
                                                {Array.from({ length: 6 }).map((_, index) => (
                                                    <InputOTPSlot key={index} index={index} />
                                                ))}
                                            </InputOTPGroup>
                                        </InputOTP>
                                    )}
                                />
                                {errors.otp && <p className="text-xs text-destructive">{errors.otp.message}</p>}
                            </div>

                            <Button type="submit" className="w-full" disabled={mutation.isPending}>
                                {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Verify Email
                            </Button>

                            <p className="text-xs text-muted-foreground text-center">
                                Didn’t receive the code? Check your spam folder or contact support.
                            </p>
                        </form>

                        <p className="text-center text-sm text-muted-foreground mt-6">
                            Already verified?{" "}
                            <Link to="/login" className="text-primary hover:underline font-medium">
                                Sign in
                            </Link>
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
