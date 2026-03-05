import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
    DoctorRecommendationService,
    DoctorService,
    SpecializationService,
    type DoctorProfileDto
} from "@mediflow/mediflow-api";
import { PageHeader } from "@/components/ui/page-header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { EmptyState } from "@/components/ui/empty-state";
import { ListSkeleton } from "@/components/ui/loading-skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RatingStars } from "@/components/ui/rating";
import { Search, Sparkles, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { getAvatarUrl } from "@/lib/auth";

export default function PatientDoctors() {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedSpecialization, setSelectedSpecialization] = useState<string>("all");
    const [minRating, setMinRating] = useState<string>("all");
    const [recommendationQuery, setRecommendationQuery] = useState("");
    const [recommendationCity, setRecommendationCity] = useState("");
    const [recommendationInput, setRecommendationInput] = useState("");
    const [recommendationCityInput, setRecommendationCityInput] = useState("");

    const { data: doctorsData, isLoading: doctorsLoading } = useQuery({
        queryKey: ["doctors"],
        queryFn: async () => DoctorService.getAllDoctorProfilesList({})
    });

    const { data: specializationsData } = useQuery({
        queryKey: ["specializations"],
        queryFn: async () => SpecializationService.getAllSpecializationsList({})
    });

    const { data: recommendationData, isFetching: recommendationLoading } = useQuery({
        queryKey: ["doctor-recommendations", recommendationQuery, recommendationCity],
        enabled: recommendationQuery.trim().length > 0,
        queryFn: async () =>
            DoctorRecommendationService.getDoctorRecommendations({
                query: recommendationQuery,
                city: recommendationCity || undefined,
                limit: 6
            })
    });

    const doctors = doctorsData?.result ?? [];
    const specializationOptions = specializationsData?.result ?? [];
    const recommendedDoctors = recommendationData?.result?.doctors ?? [];
    const recommendedFallback = recommendationData?.result?.datasetFallback ?? [];

    const filteredDoctors = useMemo(() => {
        const query = searchQuery.toLowerCase();
        const ratingThreshold = minRating === "all" ? null : Number(minRating);
        return doctors.filter((doc) => {
            const name = doc.name?.toLowerCase() || "";
            const specTitles = (doc.specializations || []).map((s) => s.title?.toLowerCase() || "");
            const matchesSearch = name.includes(query) || specTitles.some((s) => s.includes(query));
            const matchesSpec =
                selectedSpecialization === "all" ||
                (doc.specializations || []).some((s) => s.title === selectedSpecialization);
            const matchesRating =
                ratingThreshold === null || (doc.averageRating ?? 0) >= ratingThreshold;
            return matchesSearch && matchesSpec && matchesRating;
        });
    }, [doctors, searchQuery, selectedSpecialization, minRating]);

    const renderDoctorCard = (doctor: DoctorProfileDto) => {
        const specializationLabel =
            (doctor.specializations || [])
                .map((spec) => spec.title)
                .filter(Boolean)
                .join(", ") || "General Practitioner";
        const initials = (doctor.name || "D")
            .split(" ")
            .map((n) => n[0])
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
                                <h3 className="font-semibold text-foreground truncate">{doctor.name}</h3>
                                <Badge variant={doctor.isActive ? "secondary" : "destructive"}>
                                    {doctor.isActive ? "Available" : "Inactive"}
                                </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2">{specializationLabel}</p>
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
                            <p className="text-lg font-semibold text-foreground">Rs. {doctor.consultationFee ?? "N/A"}</p>
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
                <CardContent className="p-6 space-y-4">
                    <div className="flex flex-col gap-2">
                        <Badge className="w-fit" variant="secondary">
                            Healthcare Services
                        </Badge>
                        <h2 className="text-2xl font-semibold text-foreground">Book with top specialists</h2>
                        <p className="text-sm text-muted-foreground">
                            Discover the right doctor for your needs and schedule a visit in minutes.
                        </p>
                    </div>
                    <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by doctor name or specialization"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
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

            <Card className="border-border/70">
                <CardHeader className="space-y-1">
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Sparkles className="h-4 w-4 text-primary" />
                        Doctor Recommendations
                    </CardTitle>
                    <CardDescription>Describe your symptoms or specialization to get tailored suggestions.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto]">
                        <Input
                            placeholder="e.g., chest pain, cardiology"
                            value={recommendationInput}
                            onChange={(e) => setRecommendationInput(e.target.value)}
                        />
                        <Input
                            placeholder="City (optional)"
                            value={recommendationCityInput}
                            onChange={(e) => setRecommendationCityInput(e.target.value)}
                        />
                        <Button
                            onClick={() => {
                                if (!recommendationInput.trim()) {
                                    toast.error("Please enter symptoms or a specialization");
                                    return;
                                }
                                setRecommendationQuery(recommendationInput.trim());
                                setRecommendationCity(recommendationCityInput.trim());
                            }}
                            disabled={recommendationLoading}
                        >
                            {recommendationLoading ? "Loading..." : "Recommend"}
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </div>

                    {recommendationQuery && (
                        <div className="space-y-3">
                            {recommendationData?.result?.recommendedSpecialization && (
                                <p className="text-sm text-muted-foreground">
                                    Recommended specialization:{" "}
                                    <span className="font-medium text-foreground">
                                        {recommendationData.result.recommendedSpecialization}
                                    </span>
                                </p>
                            )}

                            {recommendedDoctors.length > 0 ? (
                                <div className="grid gap-3 md:grid-cols-2">
                                    {recommendedDoctors.map((doctor) => renderDoctorCard(doctor))}
                                </div>
                            ) : recommendedFallback.length > 0 ? (
                                <div className="grid gap-3 md:grid-cols-2">
                                    {recommendedFallback.map((doc, idx) => (
                                        <Card key={`${doc.name}-${idx}`} className="border-dashed">
                                            <CardContent className="p-4">
                                                <p className="font-medium">{doc.name}</p>
                                                <p className="text-xs text-muted-foreground">{doc.category}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {doc.city} {doc.address ? `• ${doc.address}` : ""}
                                                </p>
                                                {doc.rating !== undefined && (
                                                    <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                                                        <RatingStars rating={doc.rating} />
                                                        <span>{doc.rating.toFixed(1)} rating</span>
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">No recommendations yet.</p>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {filteredDoctors.length === 0 ? (
                <EmptyState
                    icon={Search}
                    title="No doctors found"
                    description="Try adjusting your search or filter criteria"
                />
            ) : (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {filteredDoctors.map((doctor) => renderDoctorCard(doctor))}
                </div>
            )}
        </div>
    );
}
