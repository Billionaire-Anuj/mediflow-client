import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    AppointmentService,
    DoctorRecommendationService,
    DoctorService,
    SpecializationService,
    type DoctorProfileDto
} from "@mediflow/mediflow-api";
import { PageHeader } from "@/components/ui/page-header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge, getStatusVariant } from "@/components/ui/status-badge";
import { ListSkeleton } from "@/components/ui/loading-skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, Calendar, Clock } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { combineDateAndTime } from "@/lib/datetime";

export default function PatientDoctors() {
    const queryClient = useQueryClient();
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedSpecialization, setSelectedSpecialization] = useState<string>("all");
    const [selectedDoctor, setSelectedDoctor] = useState<DoctorProfileDto | null>(null);
    const [bookingDoctor, setBookingDoctor] = useState<DoctorProfileDto | null>(null);
    const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));
    const [selectedTimeslotId, setSelectedTimeslotId] = useState<string>("");
    const [reason, setReason] = useState("");
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

    const doctors = doctorsData?.result ?? [];
    const specializationOptions = specializationsData?.result ?? [];

    const filteredDoctors = useMemo(() => {
        const query = searchQuery.toLowerCase();
        return doctors.filter((doc) => {
            const name = doc.name?.toLowerCase() || "";
            const specTitles = (doc.specializations || []).map((s) => s.title?.toLowerCase() || "");
            const matchesSearch = name.includes(query) || specTitles.some((s) => s.includes(query));
            const matchesSpec =
                selectedSpecialization === "all" ||
                (doc.specializations || []).some((s) => s.title === selectedSpecialization);
            return matchesSearch && matchesSpec;
        });
    }, [doctors, searchQuery, selectedSpecialization]);

    const selectedDateRange = useMemo(() => {
        if (!selectedDate) return null;
        return {
            startDate: selectedDate,
            endDate: selectedDate
        };
    }, [selectedDate]);

    const { data: timeslotsData, isLoading: timeslotsLoading } = useQuery({
        queryKey: ["timeslots", bookingDoctor?.id, selectedDate],
        enabled: !!bookingDoctor && !!selectedDateRange,
        queryFn: async () =>
            DoctorService.getDoctorTimeslots({
                doctorId: bookingDoctor!.id || "",
                startDate: selectedDateRange!.startDate,
                endDate: selectedDateRange!.endDate
            })
    });

    const availableTimeslots = (timeslotsData?.result ?? []).filter((slot) => !slot.isBooked);

    const { data: recommendationData, isFetching: recommendationLoading } = useQuery({
        queryKey: ["doctor-recommendations", recommendationQuery, recommendationCity],
        enabled: recommendationQuery.trim().length > 0,
        queryFn: async () =>
            DoctorRecommendationService.getDoctorRecommendations({
                query: recommendationQuery,
                city: recommendationCity || undefined,
                limit: 5
            })
    });

    const recommendedDoctors = recommendationData?.result?.doctors ?? [];
    const recommendedFallback = recommendationData?.result?.datasetFallback ?? [];

    const bookMutation = useMutation({
        mutationFn: async () => {
            if (!bookingDoctor?.id || !selectedTimeslotId) {
                throw new Error("Missing booking details");
            }
            return AppointmentService.bookAppointment({
                requestBody: {
                    doctorId: bookingDoctor.id,
                    timeslotId: selectedTimeslotId,
                    symptoms: reason || undefined,
                    notes: reason || undefined
                }
            });
        },
        onSuccess: () => {
            toast.success(`Appointment booked with ${bookingDoctor?.name}`);
            setBookingDoctor(null);
            setSelectedTimeslotId("");
            setReason("");
            queryClient.invalidateQueries({ queryKey: ["timeslots", bookingDoctor?.id, selectedDate] });
        },
        onError: () => {
            toast.error("Unable to book appointment. Please try another timeslot.");
        }
    });

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
            <PageHeader title="Find Doctors" description="Search and book appointments with our specialists" />

            <Card>
                <CardContent className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-semibold text-foreground">Doctor Recommendations</h3>
                            <p className="text-sm text-muted-foreground">
                                Describe symptoms or a specialization to get recommendations.
                            </p>
                        </div>
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
                        </Button>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <label className="text-sm font-medium">Query</label>
                            <Input
                                className="mt-1"
                                placeholder="e.g., chest pain, cardiology"
                                value={recommendationInput}
                                onChange={(e) => setRecommendationInput(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium">City (optional)</label>
                            <Input
                                className="mt-1"
                                placeholder="e.g., New York"
                                value={recommendationCityInput}
                                onChange={(e) => setRecommendationCityInput(e.target.value)}
                            />
                        </div>
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
                                    {recommendedDoctors.map((doctor) => (
                                        <Card key={doctor.id} className="card-interactive">
                                            <CardContent className="p-4">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="font-medium">{doctor.name}</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {(doctor.specializations || [])
                                                                .map((spec) => spec.title)
                                                                .filter(Boolean)
                                                                .join(", ") || "General Practitioner"}
                                                        </p>
                                                    </div>
                                                    {doctor.id && (
                                                        <Button size="sm" onClick={() => setBookingDoctor(doctor)}>
                                                            Book
                                                        </Button>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            ) : recommendedFallback.length > 0 ? (
                                <div className="grid gap-3 md:grid-cols-2">
                                    {recommendedFallback.map((doc, idx) => (
                                        <Card key={`${doc.name}-${idx}`} className="card-interactive">
                                            <CardContent className="p-4">
                                                <p className="font-medium">{doc.name}</p>
                                                <p className="text-xs text-muted-foreground">{doc.category}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {doc.city} {doc.address ? `• ${doc.address}` : ""}
                                                </p>
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

            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by name or specialization..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Select value={selectedSpecialization} onValueChange={setSelectedSpecialization}>
                    <SelectTrigger className="w-full sm:w-[220px]">
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
            </div>

            {filteredDoctors.length === 0 ? (
                <EmptyState
                    icon={Search}
                    title="No doctors found"
                    description="Try adjusting your search or filter criteria"
                />
            ) : (
                <div className="grid gap-4 md:grid-cols-2">
                    {filteredDoctors.map((doctor) => (
                        <Card key={doctor.id} className="card-interactive">
                            <CardContent className="p-6">
                                <div className="flex gap-4">
                                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                        <span className="text-xl font-semibold text-primary">
                                            {doctor.name
                                                ?.split(" ")
                                                .slice(0, 2)
                                                .map((n) => n[0])
                                                .join("") || "D"}
                                        </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <h3 className="font-semibold text-foreground">{doctor.name}</h3>
                                                <p className="text-sm text-muted-foreground">
                                                    {(doctor.specializations || [])
                                                        .map((spec) => spec.title)
                                                        .filter(Boolean)
                                                        .join(", ") || "General Practitioner"}
                                                </p>
                                            </div>
                                            <StatusBadge variant={getStatusVariant(doctor.isActive ? "active" : "inactive")}
                                            >
                                                {doctor.isActive ? "Active" : "Inactive"}
                                            </StatusBadge>
                                        </div>

                                        {doctor.schedules && doctor.schedules.length > 0 && (
                                            <div className="flex items-center gap-1 mt-2 text-sm">
                                                <Clock className="h-4 w-4 text-muted-foreground" />
                                                <span className="text-muted-foreground">Availability: </span>
                                                <span className="text-foreground font-medium">{doctor.schedules.length} days/week</span>
                                            </div>
                                        )}

                                        <div className="flex gap-2 mt-4">
                                            <Button variant="outline" size="sm" onClick={() => setSelectedDoctor(doctor)}>
                                                View Profile
                                            </Button>
                                            <Button size="sm" onClick={() => setBookingDoctor(doctor)}>
                                                <Calendar className="h-4 w-4 mr-1" />
                                                Book
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <Dialog open={!!selectedDoctor} onOpenChange={() => setSelectedDoctor(null)}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{selectedDoctor?.name}</DialogTitle>
                        <DialogDescription>
                            {(selectedDoctor?.specializations || [])
                                .map((spec) => spec.title)
                                .filter(Boolean)
                                .join(", ") || "General Practitioner"}
                        </DialogDescription>
                    </DialogHeader>
                    {selectedDoctor && (
                        <div className="space-y-4">
                            <div>
                                <h4 className="font-medium mb-1">About</h4>
                                <p className="text-sm text-muted-foreground">
                                    {selectedDoctor.about || "No profile description available."}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h4 className="font-medium mb-1">Education</h4>
                                    <p className="text-sm text-muted-foreground">
                                        {selectedDoctor.educationInformation || "Not provided"}
                                    </p>
                                </div>
                                <div>
                                    <h4 className="font-medium mb-1">Experience</h4>
                                    <p className="text-sm text-muted-foreground">
                                        {selectedDoctor.experienceInformation || "Not provided"}
                                    </p>
                                </div>
                            </div>

                            {selectedDoctor.schedules && selectedDoctor.schedules.length > 0 && (
                                <div>
                                    <h4 className="font-medium mb-2">Schedule</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedDoctor.schedules.map((s) => (
                                            <span key={s.id || s.dayOfWeek} className="px-2 py-1 bg-accent rounded text-xs">
                                                {s.dayOfWeek}: {s.startTime} - {s.endTime}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {selectedDoctor.consultationFee !== undefined && (
                                <div className="flex justify-between items-center pt-4 border-t">
                                    <div>
                                        <span className="text-2xl font-bold">${selectedDoctor.consultationFee}</span>
                                        <span className="text-muted-foreground text-sm"> / consultation</span>
                                    </div>
                                    <Button
                                        onClick={() => {
                                            setSelectedDoctor(null);
                                            setBookingDoctor(selectedDoctor);
                                        }}
                                    >
                                        Book Appointment
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            <Dialog open={!!bookingDoctor} onOpenChange={() => setBookingDoctor(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Book Appointment</DialogTitle>
                        <DialogDescription>Schedule an appointment with {bookingDoctor?.name}</DialogDescription>
                    </DialogHeader>
                    {bookingDoctor && (
                        <div className="space-y-4">
                            <div className="p-4 bg-accent/50 rounded-lg">
                                <p className="font-medium">{bookingDoctor.name}</p>
                                <p className="text-sm text-muted-foreground">
                                    {(bookingDoctor.specializations || [])
                                        .map((spec) => spec.title)
                                        .filter(Boolean)
                                        .join(", ") || "General Practitioner"}
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium">Date</label>
                                    <Input
                                        type="date"
                                        className="mt-1"
                                        value={selectedDate}
                                        onChange={(e) => setSelectedDate(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Time</label>
                                    <Select value={selectedTimeslotId} onValueChange={setSelectedTimeslotId}>
                                        <SelectTrigger className="mt-1">
                                            <SelectValue placeholder={timeslotsLoading ? "Loading..." : "Select time"} />
                                        </SelectTrigger>
                                        <SelectContent className="bg-popover">
                                            {availableTimeslots.map((slot) => {
                                                const start = combineDateAndTime(slot.date, slot.startTime);
                                                return (
                                                    <SelectItem key={slot.id} value={slot.id || ""}>
                                                        {start ? format(start, "h:mm a") : slot.startTime}
                                                    </SelectItem>
                                                );
                                            })}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium">Reason for visit</label>
                                <Input
                                    className="mt-1"
                                    placeholder="Brief description..."
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={() => setBookingDoctor(null)}>
                                    Cancel
                                </Button>
                                <Button
                                    onClick={() => bookMutation.mutate()}
                                    disabled={!selectedTimeslotId || bookMutation.isPending}
                                >
                                    {bookMutation.isPending ? "Booking..." : "Confirm Booking"}
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
