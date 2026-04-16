import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ProfileService } from "@mediflow/mediflow-api";
import { toast } from "sonner";
import { AlertTriangle, Copy, KeyRound, Loader2, QrCode, ShieldCheck, Smartphone } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Switch } from "@/components/ui/switch";
import { getErrorMessage, getResponseMessage } from "@/lib/api";

export function TwoFactorSettingsCard() {
    const queryClient = useQueryClient();
    const [setup, setSetup] = useState<{ qrCodeImageBase64?: string | null; manualEntryKey?: string | null } | null>(
        null
    );
    const [verificationCode, setVerificationCode] = useState("");

    const { data: twoFactorStatus } = useQuery({
        queryKey: ["two-factor-status"],
        queryFn: async () => ProfileService.getTwoFactorStatus()
    });

    const isEnabled = Boolean(twoFactorStatus?.result?.isEnabled);
    const isPendingSetup = !isEnabled && Boolean(setup);

    const enableMutation = useMutation({
        mutationFn: async () => ProfileService.enableTwoFactorAuthentication(),
        onSuccess: (response) => {
            setSetup(response.result ?? null);
            setVerificationCode("");
            toast.success(getResponseMessage(response));
            queryClient.invalidateQueries({ queryKey: ["two-factor-status"] });
        },
        onError: (error) => toast.error(getErrorMessage(error))
    });

    const confirmMutation = useMutation({
        mutationFn: async (authenticationCode: string) =>
            ProfileService.confirmTwoFactorAuthentication({
                requestBody: {
                    authenticationCode
                }
            }),
        onSuccess: (response) => {
            setSetup(null);
            setVerificationCode("");
            toast.success(getResponseMessage(response));
            queryClient.invalidateQueries({ queryKey: ["two-factor-status"] });
        },
        onError: (error) => toast.error(getErrorMessage(error))
    });

    const disableMutation = useMutation({
        mutationFn: async () => ProfileService.disableTwoFactorAuthentication(),
        onSuccess: (response) => {
            setSetup(null);
            setVerificationCode("");
            toast.success(getResponseMessage(response));
            queryClient.invalidateQueries({ queryKey: ["two-factor-status"] });
        },
        onError: (error) => toast.error(getErrorMessage(error))
    });

    const qrImageUrl = useMemo(() => {
        if (!setup?.qrCodeImageBase64) {
            return null;
        }

        return `data:image/png;base64,${setup.qrCodeImageBase64}`;
    }, [setup?.qrCodeImageBase64]);

    const isBusy = enableMutation.isPending || confirmMutation.isPending || disableMutation.isPending;

    const handleToggle = async (checked: boolean) => {
        if (checked) {
            await enableMutation.mutateAsync();
            return;
        }

        if (isEnabled) {
            await disableMutation.mutateAsync();
            return;
        }

        setSetup(null);
        setVerificationCode("");
        toast.success("Two-factor setup cancelled.");
    };

    const handleCopyKey = async () => {
        if (!setup?.manualEntryKey) {
            return;
        }

        try {
            await navigator.clipboard.writeText(setup.manualEntryKey);
            toast.success("Manual key copied.");
        } catch {
            toast.error("Unable to copy the manual key.");
        }
    };

    return (
        <Card className="border-emerald-100 shadow-sm">
            <CardHeader className="space-y-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
                            <ShieldCheck className="h-3.5 w-3.5" />
                            Security Shield
                        </div>
                        <div>
                            <CardTitle>Two-Factor Authentication</CardTitle>
                            <CardDescription>
                                Protect your account with an authenticator app. You will scan the QR and confirm one
                                code before 2FA becomes active.
                            </CardDescription>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/70 px-4 py-3">
                        <div>
                            <p className="text-xs font-medium uppercase tracking-[0.24em] text-emerald-700">Status</p>
                            <div className="mt-1 flex items-center gap-2">
                                <Badge
                                    variant="secondary"
                                    className={
                                        isEnabled
                                            ? "bg-emerald-100 text-emerald-800"
                                            : isPendingSetup
                                              ? "bg-amber-100 text-amber-800"
                                              : "bg-slate-100 text-slate-700"
                                    }
                                >
                                    {isEnabled ? "Enabled" : isPendingSetup ? "Pending verification" : "Disabled"}
                                </Badge>
                            </div>
                        </div>
                        <Switch
                            checked={isEnabled || isPendingSetup}
                            disabled={isBusy}
                            onCheckedChange={handleToggle}
                        />
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-5">
                {isEnabled && (
                    <Alert className="border-emerald-200 bg-emerald-50/70">
                        <ShieldCheck className="h-4 w-4 text-emerald-700" />
                        <AlertTitle className="text-emerald-900">2FA is active</AlertTitle>
                        <AlertDescription className="text-emerald-800">
                            Your next sign-in will require a 6-digit code from Google Authenticator, Microsoft
                            Authenticator, or a similar TOTP app.
                        </AlertDescription>
                    </Alert>
                )}

                {isPendingSetup && (
                    <div className="grid gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
                        <div className="rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-5 text-center shadow-sm">
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                                <QrCode className="h-6 w-6" />
                            </div>
                            <p className="mt-4 text-sm font-medium text-slate-900">Scan with your authenticator app</p>
                            <p className="mt-2 text-xs text-slate-500">
                                Compatible with Google Authenticator, Authy, Microsoft Authenticator, and similar apps.
                            </p>
                            {qrImageUrl ? (
                                <img
                                    src={qrImageUrl}
                                    alt="Two-factor QR code"
                                    className="mx-auto mt-5 rounded-2xl border border-emerald-100 bg-white p-3 shadow-sm"
                                />
                            ) : null}
                        </div>

                        <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="grid gap-4 md:grid-cols-3">
                                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                                        <Smartphone className="h-4 w-4 text-emerald-700" />
                                        Step 1
                                    </div>
                                    <p className="mt-2 text-sm text-slate-600">
                                        Open your authenticator app and add a new account.
                                    </p>
                                </div>
                                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                                        <QrCode className="h-4 w-4 text-emerald-700" />
                                        Step 2
                                    </div>
                                    <p className="mt-2 text-sm text-slate-600">
                                        Scan the QR code or use the manual key below if scanning is unavailable.
                                    </p>
                                </div>
                                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                                        <ShieldCheck className="h-4 w-4 text-emerald-700" />
                                        Step 3
                                    </div>
                                    <p className="mt-2 text-sm text-slate-600">
                                        Enter the current 6-digit code to activate protection on this account.
                                    </p>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4">
                                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                    <div>
                                        <p className="text-sm font-semibold text-emerald-900">Manual entry key</p>
                                        <p className="mt-1 break-all font-mono text-sm text-emerald-800">
                                            {setup?.manualEntryKey || "Unavailable"}
                                        </p>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="border-emerald-200"
                                        onClick={handleCopyKey}
                                    >
                                        <Copy className="mr-2 h-4 w-4" />
                                        Copy Key
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <p className="text-sm font-medium text-slate-900">Verify the code from your app</p>
                                <InputOTP
                                    maxLength={6}
                                    value={verificationCode}
                                    onChange={(value) => setVerificationCode(value.replace(/\D/g, "").slice(0, 6))}
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
                            </div>

                            <Alert className="border-amber-200 bg-amber-50">
                                <AlertTriangle className="h-4 w-4 text-amber-700" />
                                <AlertTitle className="text-amber-900">
                                    Activation completes only after verification
                                </AlertTitle>
                                <AlertDescription className="text-amber-800">
                                    Until the 6-digit code is confirmed, 2FA is not active yet and you can still cancel
                                    this setup.
                                </AlertDescription>
                            </Alert>

                            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => handleToggle(false)}
                                    disabled={isBusy}
                                >
                                    Cancel Setup
                                </Button>
                                <Button
                                    type="button"
                                    onClick={() => confirmMutation.mutate(verificationCode)}
                                    disabled={verificationCode.length !== 6 || isBusy}
                                >
                                    {confirmMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Verify and Enable
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {!isEnabled && !isPendingSetup && (
                    <div className="rounded-3xl border border-dashed border-emerald-200 bg-gradient-to-r from-emerald-50/70 to-white p-5">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div className="space-y-1">
                                <p className="text-sm font-semibold text-slate-900">
                                    Enable stronger sign-in protection
                                </p>
                                <p className="text-sm text-slate-600">
                                    Turn this on to require a time-based code from your authenticator app in addition to
                                    your password.
                                </p>
                            </div>
                            <Button type="button" onClick={() => enableMutation.mutate()} disabled={isBusy}>
                                {enableMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                <KeyRound className="mr-2 h-4 w-4" />
                                Start Setup
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
