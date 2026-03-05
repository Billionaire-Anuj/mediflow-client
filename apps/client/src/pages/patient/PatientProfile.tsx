import { useEffect, useState } from "react";
import type { ChangeEvent } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Gender, ProfileService } from "@mediflow/mediflow-api";
import { useAuth } from "@/contexts/AuthContext";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Loader2, Camera } from "lucide-react";

const profileSchema = z.object({
    name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
    username: z.string().trim().min(3, "Username must be at least 3 characters").max(50),
    email: z.string().email("Invalid email address"),
    gender: z.nativeEnum(Gender).optional(),
    phone: z.string().optional(),
    address: z.string().max(500).optional()
});

type ProfileForm = z.infer<typeof profileSchema>;

export default function PatientProfile() {
    const queryClient = useQueryClient();
    const { user, refreshProfile } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [isUploadingImage, setIsUploadingImage] = useState(false);

    const { data: profileData } = useQuery({
        queryKey: ["profile"],
        queryFn: async () => ProfileService.getProfile()
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
        onSuccess: () => {
            toast.success("Profile updated successfully");
            queryClient.invalidateQueries({ queryKey: ["profile"] });
            refreshProfile();
        },
        onError: () => toast.error("Failed to update profile")
    });

    const imageMutation = useMutation({
        mutationFn: async (file: File) =>
            ProfileService.updateProfileImage({
                formData: {
                    ProfileImage: file
                }
            }),
        onSuccess: async () => {
            toast.success("Profile image updated");
            await refreshProfile();
            queryClient.invalidateQueries({ queryKey: ["profile"] });
        },
        onError: () => toast.error("Failed to update profile image")
    });

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

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader title="Profile" description="Manage your personal information" />

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
                                        {...register("name")}
                                        className={errors.name ? "border-destructive" : ""}
                                    />
                                    {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
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
                                        {...register("email")}
                                        className={errors.email ? "border-destructive" : ""}
                                    />
                                    {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
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
        </div>
    );
}
