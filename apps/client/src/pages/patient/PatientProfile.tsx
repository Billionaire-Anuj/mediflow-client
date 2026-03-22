import { useEffect, useState } from "react";
import type { ChangeEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Gender, PatientService, ProfileService } from "@mediflow/mediflow-api";
import { useAuth } from "@/contexts/AuthContext";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TwoFactorSettingsCard } from "@/components/profile/TwoFactorSettingsCard";
import { toast } from "sonner";
import { Loader2, Camera } from "lucide-react";
import { API_BASE_URL, getErrorMessage, getResponseMessage } from "@/lib/api";

const profileSchema = z.object({
    name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
    username: z.string().trim().min(3, "Username must be at least 3 characters").max(50),
    email: z.string().email("Invalid email address"),
    gender: z.nativeEnum(Gender).optional(),
    phone: z.string().optional(),
    address: z.string().max(500).optional()
});

type ProfileForm = z.infer<typeof profileSchema>;

const passwordSchema = z
    .object({
        currentPassword: z.string().min(1, "Current password is required"),
        newPassword: z.string().min(8, "New password must be at least 8 characters"),
        confirmPassword: z.string().min(1, "Please confirm your new password")
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        path: ["confirmPassword"],
        message: "Passwords do not match"
    });

type PasswordForm = z.infer<typeof passwordSchema>;

export default function PatientProfile() {
    const queryClient = useQueryClient();
    const { user, refreshProfile } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [isLoading, setIsLoading] = useState(false);
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [creditAmount, setCreditAmount] = useState("");
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);
    const [isConfirmingPayment, setIsConfirmingPayment] = useState(false);
    const isPatient = user?.roleName?.toLowerCase() === "patient";

    const { data: profileData } = useQuery({
        queryKey: ["profile"],
        queryFn: async () => ProfileService.getProfile()
    });

    const { data: patientProfileData } = useQuery({
        queryKey: ["patient-profile"],
        queryFn: async () => PatientService.getPatientProfile(),
        enabled: isPatient
    });

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors, isDirty }
    } = useForm<ProfileForm>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            name: "",
            username: "",
            email: "",
            gender: undefined,
            phone: "",
            address: ""
        }
    });

    const {
        register: registerPassword,
        handleSubmit: handlePasswordSubmit,
        reset: resetPassword,
        formState: { errors: passwordErrors, isDirty: isPasswordDirty }
    } = useForm<PasswordForm>({
        resolver: zodResolver(passwordSchema),
        defaultValues: {
            currentPassword: "",
            newPassword: "",
            confirmPassword: ""
        }
    });

    useEffect(() => {
        if (profileData?.result) {
            reset({
                name: profileData.result.name || "",
                username: profileData.result.username || "",
                email: profileData.result.emailAddress || "",
                gender: profileData.result.gender || undefined,
                phone: profileData.result.phoneNumber || "",
                address: profileData.result.address || ""
            });
        }
    }, [profileData, reset]);

    const mutation = useMutation({
        mutationFn: async (data: ProfileForm) =>
            ProfileService.updateProfile({
                requestBody: {
                    name: data.name,
                    username: data.username,
                    emailAddress: data.email,
                    gender: data.gender,
                    phoneNumber: data.phone,
                    address: data.address
                }
            }),
        onSuccess: (data) => {
            toast.success(getResponseMessage(data));
            queryClient.invalidateQueries({ queryKey: ["profile"] });
            refreshProfile();
        },
        onError: (error) => toast.error(getErrorMessage(error))
    });

    const imageMutation = useMutation({
        mutationFn: async (file: File) =>
            ProfileService.updateProfileImage({
                formData: {
                    ProfileImage: file
                }
            }),
        onSuccess: async (data) => {
            toast.success(getResponseMessage(data));
            await refreshProfile();
            queryClient.invalidateQueries({ queryKey: ["profile"] });
        },
        onError: (error) => toast.error(getErrorMessage(error))
    });

    const passwordMutation = useMutation({
        mutationFn: async (data: PasswordForm) =>
            ProfileService.changePassword({
                requestBody: {
                    currentPassword: data.currentPassword,
                    newPassword: data.newPassword,
                    confirmPassword: data.confirmPassword
                }
            }),
        onSuccess: (data) => {
            toast.success(getResponseMessage(data));
            resetPassword();
        },
        onError: (error) => toast.error(getErrorMessage(error))
    });

    const credits = patientProfileData?.result?.creditPoints ?? 0;

    const initiatePayment = async (provider: "khalti" | "esewa") => {
        const amount = Number(creditAmount);

        if (!amount || amount <= 0) {
            toast.error("Enter a valid amount to add credits.");
            return;
        }

        setIsProcessingPayment(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/v1/patient/credits/${provider}/initiate`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify({ amount })
            });

            const payload = await response.json().catch(() => null);

            if (!response.ok) {
                const message =
                    payload && typeof payload === "object" && "message" in payload
                        ? String(payload.message || "")
                        : "";
                throw new Error(message || response.statusText);
            }

            const result = payload?.result;

            if (provider === "khalti") {
                const paymentUrl = result?.paymentUrl;
                if (!paymentUrl) {
                    throw new Error("Unable to redirect to Khalti payment.");
                }
                window.location.href = paymentUrl;
                return;
            }

            const paymentUrl = result?.paymentUrl;
            const formPayload = result?.payload as Record<string, string> | undefined;

            if (!paymentUrl || !formPayload) {
                throw new Error("Unable to initiate eSewa payment.");
            }

            const form = document.createElement("form");
            form.method = "POST";
            form.action = paymentUrl;

            Object.entries(formPayload).forEach(([key, value]) => {
                const input = document.createElement("input");
                input.type = "hidden";
                input.name = key;
                input.value = value;
                form.appendChild(input);
            });

            document.body.appendChild(form);
            form.submit();
            form.remove();
        } catch (error) {
            toast.error(getErrorMessage(error));
        } finally {
            setIsProcessingPayment(false);
        }
    };

    useEffect(() => {
        if (!isPatient || isConfirmingPayment) {
            return;
        }

        const khaltiPidx = searchParams.get("pidx");
        const esewaData = searchParams.get("data");

        if (!khaltiPidx && !esewaData) {
            return;
        }

        const confirmPayment = async () => {
            setIsConfirmingPayment(true);
            try {
                if (khaltiPidx) {
                    const response = await fetch(`${API_BASE_URL}/api/v1/patient/credits/khalti/confirm`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        credentials: "include",
                        body: JSON.stringify({ pidx: khaltiPidx })
                    });

                    const payload = await response.json().catch(() => null);
                    if (!response.ok) {
                        const message =
                            payload && typeof payload === "object" && "message" in payload
                                ? String(payload.message || "")
                                : "";
                        throw new Error(message || response.statusText);
                    }

                    toast.success(getResponseMessage(payload));
                }

                if (esewaData) {
                    const response = await fetch(`${API_BASE_URL}/api/v1/patient/credits/esewa/confirm`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        credentials: "include",
                        body: JSON.stringify({ data: esewaData })
                    });

                    const payload = await response.json().catch(() => null);
                    if (!response.ok) {
                        const message =
                            payload && typeof payload === "object" && "message" in payload
                                ? String(payload.message || "")
                                : "";
                        throw new Error(message || response.statusText);
                    }

                    toast.success(getResponseMessage(payload));
                }

                queryClient.invalidateQueries({ queryKey: ["patient-profile"] });
                navigate("/patient/profile", { replace: true });
            } catch (error) {
                toast.error(getErrorMessage(error));
            } finally {
                setIsConfirmingPayment(false);
            }
        };

        confirmPayment();
    }, [isPatient, isConfirmingPayment, navigate, queryClient, searchParams]);

    const onSubmit = async (data: ProfileForm) => {
        setIsLoading(true);
        await mutation.mutateAsync(data);
        setIsLoading(false);
    };

    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    const genderValue = watch("gender");

    const onGenderChange = (nextGender: Gender, checked: boolean) => {
        setValue("gender", checked ? nextGender : undefined, { shouldDirty: true });
    };

    const onProfileImageChange = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsUploadingImage(true);
        try {
            await imageMutation.mutateAsync(file);
        } finally {
            setIsUploadingImage(false);
            event.target.value = "";
        }
    };

    const defaultTab =
        isPatient && (searchParams.has("pidx") || searchParams.has("data")) ? "security" : "profile";

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader title="Profile" description="Manage your personal information" />
            <Tabs defaultValue={defaultTab} className="space-y-6">
                <TabsList>
                    <TabsTrigger value="profile">Profile</TabsTrigger>
                    <TabsTrigger value="security">Security & Credits</TabsTrigger>
                </TabsList>

                <TabsContent value="profile" className="space-y-6">
                    <div className="grid gap-6 lg:grid-cols-3">
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex flex-col items-center">
                                    <div className="relative">
                                        <Avatar className="h-24 w-24">
                                            {user?.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.name} />}
                                            <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                                                {user ? getInitials(user.name) : "U"}
                                            </AvatarFallback>
                                        </Avatar>
                                        <input
                                            id="profile-image-upload"
                                            type="file"
                                            accept=".jpg,.jpeg,.png"
                                            className="hidden"
                                            onChange={onProfileImageChange}
                                        />
                                        <label
                                            htmlFor="profile-image-upload"
                                            className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md hover:bg-primary/90 transition-colors cursor-pointer"
                                        >
                                            {isUploadingImage ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Camera className="h-4 w-4" />
                                            )}
                                        </label>
                                    </div>
                                    <h3 className="mt-4 font-semibold text-lg">{user?.name}</h3>
                                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                                    <p className="text-xs text-muted-foreground mt-1">{user?.roleName || "Account"}</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="lg:col-span-2">
                            <CardHeader>
                                <CardTitle>Personal Information</CardTitle>
                                <CardDescription>Update your personal details</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">Full Name</Label>
                                            <Input
                                                id="name"
                                                placeholder="Enter your full name"
                                                {...register("name")}
                                                className={errors.name ? "border-destructive" : ""}
                                            />
                                            {errors.name && (
                                                <p className="text-xs text-destructive">{errors.name.message}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="username">Username</Label>
                                            <Input
                                                id="username"
                                                {...register("username")}
                                                placeholder="user.name"
                                                className={errors.username ? "border-destructive" : ""}
                                            />
                                            {errors.username && (
                                                <p className="text-xs text-destructive">{errors.username.message}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                placeholder="you@example.com"
                                                {...register("email")}
                                                className={errors.email ? "border-destructive" : ""}
                                            />
                                            {errors.email && (
                                                <p className="text-xs text-destructive">{errors.email.message}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Gender</Label>
                                            <div className="flex flex-wrap gap-4 mt-5">
                                                <label className="flex items-center gap-2 text-sm mt-2">
                                                    <Checkbox
                                                        checked={genderValue === Gender.MALE}
                                                        onCheckedChange={(checked) =>
                                                            onGenderChange(Gender.MALE, Boolean(checked))
                                                        }
                                                    />
                                                    <span>Male</span>
                                                </label>
                                                <label className="flex items-center gap-2 text-sm mt-2">
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

                                        <div className="space-y-2 sm:col-span-2">
                                            <Label htmlFor="phone">Phone Number</Label>
                                            <Input id="phone" {...register("phone")} placeholder="+1 (555) 000-0000" />
                                        </div>

                                        <div className="space-y-2 sm:col-span-2">
                                            <Label htmlFor="address">Address</Label>
                                            <Textarea
                                                id="address"
                                                {...register("address")}
                                                placeholder="Enter your address"
                                                rows={2}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex justify-end pt-4">
                                        <Button type="submit" disabled={isLoading || !isDirty}>
                                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            Save Changes
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="security" className="space-y-6">
                    <TwoFactorSettingsCard />

                    <Card>
                        <CardHeader>
                            <CardTitle>Change Password</CardTitle>
                            <CardDescription>Update your account password</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form
                                onSubmit={handlePasswordSubmit((data) => passwordMutation.mutate(data))}
                                className="space-y-4"
                            >
                                <div className="space-y-2">
                                    <Label htmlFor="currentPassword">Current Password</Label>
                                    <Input
                                        id="currentPassword"
                                        type="password"
                                        placeholder="Enter current password"
                                        {...registerPassword("currentPassword")}
                                        className={passwordErrors.currentPassword ? "border-destructive" : ""}
                                    />
                                    {passwordErrors.currentPassword && (
                                        <p className="text-xs text-destructive">
                                            {passwordErrors.currentPassword.message}
                                        </p>
                                    )}
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="newPassword">New Password</Label>
                                        <Input
                                            id="newPassword"
                                            type="password"
                                            placeholder="Create a new password"
                                            {...registerPassword("newPassword")}
                                            className={passwordErrors.newPassword ? "border-destructive" : ""}
                                        />
                                        {passwordErrors.newPassword && (
                                            <p className="text-xs text-destructive">
                                                {passwordErrors.newPassword.message}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                                        <Input
                                            id="confirmPassword"
                                            type="password"
                                            placeholder="Re-enter new password"
                                            {...registerPassword("confirmPassword")}
                                            className={passwordErrors.confirmPassword ? "border-destructive" : ""}
                                        />
                                        {passwordErrors.confirmPassword && (
                                            <p className="text-xs text-destructive">
                                                {passwordErrors.confirmPassword.message}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex justify-end">
                                    <Button type="submit" disabled={!isPasswordDirty || passwordMutation.isPending}>
                                        {passwordMutation.isPending && (
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        )}
                                        Update Password
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    {isPatient && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Credits</CardTitle>
                                <CardDescription>1 NPR equals 1 credit</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Available Credits</p>
                                        <p className="text-2xl font-semibold">{credits.toFixed(2)}</p>
                                    </div>
                                    {isConfirmingPayment && (
                                        <div className="flex items-center text-sm text-muted-foreground">
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Confirming payment...
                                        </div>
                                    )}
                                </div>

                                <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
                                    <div className="space-y-2">
                                        <Label htmlFor="creditAmount">Add Credits (NPR)</Label>
                                        <Input
                                            id="creditAmount"
                                            type="number"
                                            min="1"
                                            step="1"
                                            placeholder="Enter amount in NPR"
                                            value={creditAmount}
                                            onChange={(event) => setCreditAmount(event.target.value)}
                                        />
                                    </div>
                                    <div className="flex items-end gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => initiatePayment("esewa")}
                                            disabled={isProcessingPayment}
                                        >
                                            Pay with eSewa
                                        </Button>
                                        <Button
                                            type="button"
                                            onClick={() => initiatePayment("khalti")}
                                            disabled={isProcessingPayment}
                                        >
                                            Pay with Khalti
                                        </Button>
                                    </div>
                                </div>

                                <p className="text-xs text-muted-foreground">
                                    Credits are applied after payment confirmation. 1 NPR = 1 credit.
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
