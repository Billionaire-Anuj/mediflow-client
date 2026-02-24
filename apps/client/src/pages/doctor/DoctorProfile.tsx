import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DoctorService, SpecializationService } from "@mediflow/mediflow-api";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ListSkeleton } from "@/components/ui/loading-skeleton";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const profileSchema = z.object({
    about: z.string().optional(),
    licenseNumber: z.string().optional(),
    educationInformation: z.string().optional(),
    experienceInformation: z.string().optional(),
    consultationFee: z.string().optional(),
    specializationIds: z.array(z.string()).optional()
});

type DoctorProfileForm = z.infer<typeof profileSchema>;

export default function DoctorProfile() {
    const queryClient = useQueryClient();

    const { data: profileData, isLoading } = useQuery({
        queryKey: ["doctor-profile"],
        queryFn: async () => DoctorService.getDoctorProfile()
    });

    const { data: specializationData } = useQuery({
        queryKey: ["specializations"],
        queryFn: async () => SpecializationService.getAllSpecializationsList({})
    });

    const profile = profileData?.result;
    const specializations = specializationData?.result ?? [];

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { isDirty }
    } = useForm<DoctorProfileForm>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            about: "",
            licenseNumber: "",
            educationInformation: "",
            experienceInformation: "",
            consultationFee: "",
            specializationIds: []
        }
    });

    useEffect(() => {
        if (profile) {
            reset({
                about: profile.about || "",
                licenseNumber: profile.licenseNumber || "",
                educationInformation: profile.educationInformation || "",
                experienceInformation: profile.experienceInformation || "",
                consultationFee: profile.consultationFee?.toString() || "",
                specializationIds: (profile.specializations || []).map((spec) => spec.id || "").filter(Boolean)
            });
        }
    }, [profile, reset]);

    const selectedIds = watch("specializationIds") || [];

    const toggleSpecialization = (id: string, checked: boolean) => {
        const next = checked ? [...selectedIds, id] : selectedIds.filter((item) => item !== id);
        setValue("specializationIds", next, { shouldDirty: true });
    };

    const mutation = useMutation({
        mutationFn: async (data: DoctorProfileForm) =>
            DoctorService.updateDoctorProfile({
                requestBody: {
                    about: data.about || undefined,
                    licenseNumber: data.licenseNumber || undefined,
                    educationInformation: data.educationInformation || undefined,
                    experienceInformation: data.experienceInformation || undefined,
                    consultationFee: data.consultationFee ? Number(data.consultationFee) : undefined,
                    specializationIds: data.specializationIds || []
                }
            }),
        onSuccess: () => {
            toast.success("Profile updated successfully");
            queryClient.invalidateQueries({ queryKey: ["doctor-profile"] });
        },
        onError: () => toast.error("Failed to update profile")
    });

    if (isLoading) {
        return (
            <div className="space-y-6">
                <PageHeader title="Doctor Profile" />
                <ListSkeleton items={2} />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader title="Doctor Profile" description="Manage your professional information" />

            <div className="grid gap-6 lg:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle>Profile Details</CardTitle>
                        <CardDescription>Read-only account details</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        <div className="flex justify-between py-2 border-b">
                            <span className="text-muted-foreground">Name</span>
                            <span>{profile?.name}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                            <span className="text-muted-foreground">Email</span>
                            <span>{profile?.emailAddress}</span>
                        </div>
                        <div className="flex justify-between py-2">
                            <span className="text-muted-foreground">Phone</span>
                            <span>{profile?.phoneNumber || "N/A"}</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Professional Details</CardTitle>
                        <CardDescription>Update your doctor profile details</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="about">About</Label>
                                <Textarea id="about" rows={3} {...register("about")} />
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="licenseNumber">License Number</Label>
                                    <Input id="licenseNumber" {...register("licenseNumber")} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="consultationFee">Consultation Fee</Label>
                                    <Input
                                        id="consultationFee"
                                        type="number"
                                        step="0.01"
                                        {...register("consultationFee")}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="educationInformation">Education</Label>
                                    <Input id="educationInformation" {...register("educationInformation")} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="experienceInformation">Experience</Label>
                                    <Input id="experienceInformation" {...register("experienceInformation")} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Specializations</Label>
                                <div className="grid gap-2 sm:grid-cols-2">
                                    {specializations.map((spec) => (
                                        <label key={spec.id} className="flex items-center gap-2 text-sm">
                                            <Checkbox
                                                checked={selectedIds.includes(spec.id || "")}
                                                onCheckedChange={(checked) =>
                                                    toggleSpecialization(spec.id || "", Boolean(checked))
                                                }
                                            />
                                            <span>{spec.title}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <Button type="submit" disabled={mutation.isPending || !isDirty}>
                                    {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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
