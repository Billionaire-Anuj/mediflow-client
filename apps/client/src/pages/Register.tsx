import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { departments } from "@/mock/doctors";
import { Loader2, Upload } from "lucide-react";

const registerSchema = z.object({
    role: z.enum(["doctor", "pharmacist", "lab"]),
    fullName: z.string().min(2, "Full name is required"),
    email: z.string().email("Please enter a valid email"),
    licenseNumber: z.string().min(3, "License/Specification number is required"),
    education: z.string().min(2, "Education is required"),
    department: z.string().min(1, "Please select a department"),
    experience: z.string().optional()
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function Register() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [resumeFile, setResumeFile] = useState<File | null>(null);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors }
    } = useForm<RegisterForm>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            role: "doctor"
        }
    });

    const selectedRole = watch("role");

    const onSubmit = async (data: RegisterForm) => {
        setIsLoading(true);
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        console.log("Registration data:", data, resumeFile);

        toast.success("Registration request submitted!", {
            description: "You will receive an email once your application is reviewed."
        });

        setIsLoading(false);
        navigate("/login");
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
                    <h1 className="text-4xl font-display font-bold text-foreground mb-4">Join Our Team</h1>
                    <p className="text-lg text-muted-foreground">
                        Register as a healthcare professional to join our platform and provide quality care to patients.
                    </p>
                </div>

                <p className="text-sm text-muted-foreground">© 2026 Mediflow Health Center</p>
            </div>

            {/* Right Panel - Registration Form */}
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
                                    <Select
                                        value={selectedRole}
                                        onValueChange={(value) => setValue("role", value as RegisterForm["role"])}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select your role" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-popover">
                                            <SelectItem value="doctor">Doctor</SelectItem>
                                            <SelectItem value="pharmacist">Pharmacist</SelectItem>
                                            <SelectItem value="lab">Lab Technician</SelectItem>
                                        </SelectContent>
                                    </Select>
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
                                    <Label htmlFor="licenseNumber">License / Specification Number</Label>
                                    <Input
                                        id="licenseNumber"
                                        placeholder="Enter your license number"
                                        {...register("licenseNumber")}
                                        className={errors.licenseNumber ? "border-destructive" : ""}
                                    />
                                    {errors.licenseNumber && (
                                        <p className="text-xs text-destructive">{errors.licenseNumber.message}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="education">Education</Label>
                                    <Input
                                        id="education"
                                        placeholder="e.g., MD, Harvard Medical School"
                                        {...register("education")}
                                        className={errors.education ? "border-destructive" : ""}
                                    />
                                    {errors.education && (
                                        <p className="text-xs text-destructive">{errors.education.message}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label>Department / Specialty</Label>
                                    <Select onValueChange={(value) => setValue("department", value)}>
                                        <SelectTrigger className={errors.department ? "border-destructive" : ""}>
                                            <SelectValue placeholder="Select department" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-popover">
                                            {departments.map((dept) => (
                                                <SelectItem key={dept} value={dept}>
                                                    {dept}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.department && (
                                        <p className="text-xs text-destructive">{errors.department.message}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label>Resume / Documents</Label>
                                    <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
                                        <input
                                            type="file"
                                            id="resume"
                                            className="hidden"
                                            accept=".pdf,.doc,.docx"
                                            onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                                        />
                                        <label htmlFor="resume" className="cursor-pointer">
                                            <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                                            {resumeFile ? (
                                                <p className="text-sm text-foreground font-medium">{resumeFile.name}</p>
                                            ) : (
                                                <>
                                                    <p className="text-sm text-muted-foreground">
                                                        Click to upload your resume/documents
                                                    </p>
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        PDF, DOC up to 10MB
                                                    </p>
                                                </>
                                            )}
                                        </label>
                                    </div>
                                </div>

                                <Button type="submit" className="w-full" disabled={isLoading}>
                                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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
