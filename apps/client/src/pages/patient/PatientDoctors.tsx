import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { DoctorService, SpecializationService, type DoctorProfileDto } from "@mediflow/mediflow-api";
import { PageHeader } from "@/components/ui/page-header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { EmptyState } from "@/components/ui/empty-state";
import { ListSkeleton } from "@/components/ui/loading-skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RatingStars } from "@/components/ui/rating";
import { ArrowRight, Search, Sparkles } from "lucide-react";
import { getAvatarUrl } from "@/lib/auth";

export default function PatientDoctors() {
    const [searchParams] = useSearchParams();
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedSpecialization, setSelectedSpecialization] = useState<string>("all");
    const [minRating, setMinRating] = useState<string>("all");

    const { data: doctorsData, isLoading: doctorsLoading } = useQuery({
        queryKey: ["doctors"],
        queryFn: async () => DoctorService.getAllDoctorProfilesList({})
    });

    const { data: specializationsData } = useQuery({
        queryKey: ["specializations"],
        queryFn: async () => SpecializationService.getAllSpecializationsList({})
    });

    const doctors = doctorsData?.result ?? [];
    const specializationOptions = specializationsData?.result ?? [];
    const recommendedSpecialization = searchParams.get("specialization");
    const fromDiscovery = searchParams.get("source") === "discovery";

    useEffect(() => {
        if (recommendedSpecialization?.trim()) {
            setSelectedSpecialization(recommendedSpecialization.trim());
        }
    }, [recommendedSpecialization]);

    const filteredDoctors = useMemo(() => {
        const query = searchQuery.toLowerCase();
        const ratingThreshold = minRating === "all" ? null : Number(minRating);

        return doctors.filter((doctor) => {
            const name = doctor.name?.toLowerCase() || "";
            const specTitles = (doctor.specializations || []).map((spec) => spec.title?.toLowerCase() || "");
            const matchesSearch =
                name.includes(query) || specTitles.some((specialization) => specialization.includes(query));
            const matchesSpecialization =
                selectedSpecialization === "all" ||
                (doctor.specializations || []).some((spec) => spec.title === selectedSpecialization);
            const matchesRating = ratingThreshold === null || (doctor.averageRating ?? 0) >= ratingThreshold;

            return matchesSearch && matchesSpecialization && matchesRating;
        });
    }, [doctors, minRating, searchQuery, selectedSpecialization]);

    const renderDoctorCard = (doctor: DoctorProfileDto) => {
        const specializationLabel =
            (doctor.specializations || [])
                .map((spec) => spec.title)
                .filter(Boolean)
                .join(", ") || "General Practitioner";
        const initials = (doctor.name || "D")
            .split(" ")
            .map((name) => name[0])
            .join("")
            .slice(0, 2)
            .toUpperCase();

        return (
            <Card key={doctor.id} className="group overflow-hidden border-border/60 bg-card/90 shadow-sm">
                <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                        <Avatar className="h-14 w-14 border border-border/70">
                            {doctor.profileImage?.fileUrl && (
                                <AvatarImage
                                    src={getAvatarUrl(doctor.profileImage.fileUrl)}
                                    alt={doctor.name || "Doctor"}
                                />
                            )}
                            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                                {initials}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between gap-2">
                                <h3 className="truncate font-semibold text-foreground">{doctor.name}</h3>
                                <Badge variant={doctor.isActive ? "secondary" : "destructive"}>
                                    {doctor.isActive ? "Available" : "Inactive"}
                                </Badge>
                            </div>
                            <p className="line-clamp-2 text-sm text-muted-foreground">{specializationLabel}</p>
                            <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                                <RatingStars rating={doctor.averageRating ?? 0} />
                                <span>
                                    {doctor.reviewCount && doctor.reviewCount > 0
                                        ? `${(doctor.averageRating ?? 0).toFixed(1)} (${doctor.reviewCount} reviews)`
                                        : "No reviews yet"}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <p className="text-xs text-muted-foreground">Consultation Fee</p>
                            <p className="text-lg font-semibold text-foreground">
                                Rs. {doctor.consultationFee ?? "N/A"}
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <Button asChild variant="outline" size="sm">
                                <Link to={`/patient/doctors/${doctor.id}`}>View Profile</Link>
                            </Button>
                            <Button asChild size="sm">
                                <Link to={`/patient/appointments/book?doctorId=${doctor.id}`}>Book Appointment</Link>
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    };

    if (doctorsLoading) {
        return (
            <div className="space-y-6">
                <PageHeader title="Find Doctors" description="Search and book appointments with our specialists" />
                <ListSkeleton items={4} />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader title="Find Doctors" description="Search, compare, and book your appointment" />

            <Card className="border-none bg-gradient-to-br from-primary/10 via-accent/30 to-background shadow-sm">
                <CardContent className="space-y-4 p-6">
                    <div className="flex flex-col gap-2">
                        <Badge className="w-fit" variant="secondary">
                            Healthcare Services
                        </Badge>
                        <h2 className="text-2xl font-semibold text-foreground">Book with top specialists</h2>
                        <p className="text-sm text-muted-foreground">
                            Discover the right doctor for your needs and schedule a visit in minutes.
                        </p>
                    </div>
                    {fromDiscovery && recommendedSpecialization && (
                        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/80 p-4">
                            <div>
                                <p className="text-sm font-medium text-slate-900">
                                    Specialty filter applied from Symptom Discovery
                                </p>
                                <p className="text-sm text-slate-600">
                                    We filtered this page to{" "}
                                    <span className="font-semibold">{recommendedSpecialization}</span>.
                                </p>
                            </div>
                            <Button variant="outline" asChild>
                                <Link to="/patient/symptom-discovery">Open Discovery</Link>
                            </Button>
                        </div>
                    )}
                    <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search by doctor name or specialization"
                                value={searchQuery}
                                onChange={(event) => setSearchQuery(event.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Select value={selectedSpecialization} onValueChange={setSelectedSpecialization}>
                            <SelectTrigger className="w-full sm:w-[240px]">
                                <SelectValue placeholder="All Specializations" />
                            </SelectTrigger>
                            <SelectContent className="bg-popover">
                                <SelectItem value="all">All Specializations</SelectItem>
                                {specializationOptions.map((spec) => (
                                    <SelectItem key={spec.id || spec.title} value={spec.title || ""}>
                                        {spec.title}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={minRating} onValueChange={setMinRating}>
                            <SelectTrigger className="w-full sm:w-[180px]">
                                <SelectValue placeholder="Any Rating" />
                            </SelectTrigger>
                            <SelectContent className="bg-popover">
                                <SelectItem value="all">Any Rating</SelectItem>
                                <SelectItem value="4.5">4.5+ stars</SelectItem>
                                <SelectItem value="4">4.0+ stars</SelectItem>
                                <SelectItem value="3.5">3.5+ stars</SelectItem>
                                <SelectItem value="3">3.0+ stars</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-dashed border-primary/30 bg-primary/5 shadow-none">
                <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                            <Sparkles className="h-4 w-4 text-primary" />
                            Need help choosing a specialty?
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Use Symptom Discovery to enter vitals and symptom checklists, then come back here with the
                            specialty filter applied.
                        </p>
                    </div>
                    <Button asChild>
                        <Link to="/patient/symptom-discovery">
                            Open Symptom Discovery
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                </CardContent>
            </Card>

            {filteredDoctors.length === 0 ? (
                <EmptyState
                    icon={Search}
                    title="No doctors found"
                    description="Try adjusting your specialty, rating, or search filters."
                />
            ) : (
                <div className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <h3 className="text-lg font-semibold text-foreground">Available Doctors</h3>
                            <p className="text-sm text-muted-foreground">
                                {selectedSpecialization === "all"
                                    ? `Showing ${filteredDoctors.length} doctors across all specialties`
                                    : `Showing ${filteredDoctors.length} doctors in ${selectedSpecialization}`}
                            </p>
                        </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {filteredDoctors.map((doctor) => renderDoctorCard(doctor))}
                    </div>
                </div>
            )}
        </div>
    );
}
