import { Link, useParams } from "react-router-dom";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { addDays, format } from "date-fns";
import { AppointmentService, DoctorReviewService, DoctorService } from "@mediflow/mediflow-api";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ListSkeleton } from "@/components/ui/loading-skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { RatingStars } from "@/components/ui/rating";
import { CalendarDays, Clock, Stethoscope, Users } from "lucide-react";
import { getAvatarUrl } from "@/lib/auth";

export default function PatientDoctorProfile() {
    const { doctorId } = useParams<{ doctorId: string }>();

    const { data: doctorData, isLoading } = useQuery({
        queryKey: ["doctor-profile", doctorId],
        enabled: !!doctorId,
        queryFn: async () => DoctorService.getDoctorProfileById({ doctorId: doctorId! })
    });

    const { data: appointmentsData } = useQuery({
        queryKey: ["doctor-appointments-count", doctorId],
        enabled: !!doctorId,
        queryFn: async () =>
            AppointmentService.getAllAppointments({
                doctorId: doctorId!,
                pageNumber: 1,
                pageSize: 1
            })
    });

    const { data: timeslotsData } = useQuery({
        queryKey: ["doctor-timeslots-preview", doctorId],
        enabled: !!doctorId,
        queryFn: async () =>
            DoctorService.getDoctorTimeslotsById({
                doctorId: doctorId!,
                startDate: format(new Date(), "yyyy-MM-dd"),
                endDate: format(addDays(new Date(), 6), "yyyy-MM-dd")
            })
    });

    const { data: reviewsData, isLoading: reviewsLoading } = useQuery({
        queryKey: ["doctor-reviews", doctorId],
        enabled: !!doctorId,
        queryFn: async () => DoctorReviewService.getDoctorReviewsByDoctorId({ doctorId: doctorId! })
    });

    const doctor = doctorData?.result;
    const timeslots = timeslotsData?.result ?? [];
    const reviews = reviewsData?.result ?? [];
    const totalAppointments = appointmentsData?.totalCount ?? 0;
    const availableTimeslots = timeslots.filter((slot) => !slot.isBooked).length;
    const bookedTimeslots = timeslots.filter((slot) => slot.isBooked).length;

    const specializationLabel =
        (doctor?.specializations || [])
            .map((spec) => spec.title)
            .filter(Boolean)
            .join(", ") || "General Practitioner";

    const initials = (doctor?.name || "D")
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

    const scheduleRows = useMemo(() => {
        return (doctor?.schedules || []).map((schedule) => ({
            id: schedule.id,
            day: schedule.dayOfWeek,
            start: schedule.startTime,
            end: schedule.endTime,
            validFrom: schedule.validStartDate,
            validTo: schedule.validEndDate
        }));
    }, [doctor?.schedules]);

    if (isLoading) {
        return (
            <div className="space-y-6">
                <PageHeader title="Doctor Profile" />
                <ListSkeleton items={3} />
            </div>
        );
    }

    if (!doctor) {
        return <EmptyState icon={Stethoscope} title="Doctor not found" description="Try another profile." />;
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader
                title="Doctor Profile"
                description="Review professional details, availability, and appointment insights."
            />

            <Card className="border-none bg-gradient-to-br from-primary/10 via-accent/30 to-background">
                <CardContent className="p-6">
                    <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center gap-4">
                            <Avatar className="h-20 w-20 border border-border/70">
                                {doctor.profileImage?.fileUrl && (
                                    <AvatarImage
                                        src={getAvatarUrl(doctor.profileImage.fileUrl)}
                                        alt={doctor.name || "Doctor"}
                                    />
                                )}
                                <AvatarFallback className="bg-primary/10 text-primary text-2xl font-semibold">
                                    {initials}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <h2 className="text-2xl font-semibold text-foreground">{doctor.name}</h2>
                                    <Badge variant={doctor.isActive ? "secondary" : "destructive"}>
                                        {doctor.isActive ? "Available" : "Inactive"}
                                    </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">{specializationLabel}</p>
                                <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                                    <RatingStars rating={doctor.averageRating ?? 0} />
                                    <span>
                                        {doctor.reviewCount && doctor.reviewCount > 0
                                            ? `${(doctor.averageRating ?? 0).toFixed(1)} (${doctor.reviewCount} reviews)`
                                            : "No reviews yet"}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <Button asChild variant="outline">
                                <Link to="/patient/doctors">Back to Doctors</Link>
                            </Button>
                            <Button asChild>
                                <Link to={`/patient/appointments/book?doctorId=${doctor.id}`}>Book Appointment</Link>
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>About</CardTitle>
                            <CardDescription>Professional overview and background</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm text-muted-foreground">
                            <p>{doctor.about || "No biography available yet."}</p>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <p className="text-xs uppercase tracking-wide text-muted-foreground">License</p>
                                    <p className="font-medium text-foreground">{doctor.licenseNumber || "N/A"}</p>
                                </div>
                                <div>
                                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Experience</p>
                                    <p className="font-medium text-foreground">
                                        {doctor.experienceInformation || "Not specified"}
                                    </p>
                                </div>
                            </div>
                            <div>
                                <p className="text-xs uppercase tracking-wide text-muted-foreground">Education</p>
                                <p className="font-medium text-foreground">
                                    {doctor.educationInformation || "Professional medical practitioner"}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Availability</CardTitle>
                            <CardDescription>Working hours and schedule coverage</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {scheduleRows.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No schedules available yet.</p>
                            ) : (
                                scheduleRows.map((schedule) => (
                                    <div
                                        key={schedule.id}
                                        className="flex flex-col gap-2 rounded-lg border border-border/70 p-4 md:flex-row md:items-center md:justify-between"
                                    >
                                        <div>
                                            <p className="font-medium text-foreground">{schedule.day}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {schedule.validFrom || ""}{" "}
                                                {schedule.validTo ? `- ${schedule.validTo}` : ""}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Clock className="h-4 w-4" />
                                            <span>
                                                {schedule.start} - {schedule.end}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Patient Reviews</CardTitle>
                            <CardDescription>Ratings from recent appointments</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {reviewsLoading ? (
                                <p className="text-sm text-muted-foreground">Loading reviews...</p>
                            ) : reviews.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No reviews submitted yet.</p>
                            ) : (
                                reviews.map((review) => {
                                    const patientInitials = (review.patient?.name || "P")
                                        .split(" ")
                                        .map((n) => n[0])
                                        .join("")
                                        .slice(0, 2)
                                        .toUpperCase();

                                    return (
                                        <div
                                            key={review.id}
                                            className="flex flex-col gap-3 rounded-lg border border-border/70 p-4"
                                        >
                                            <div className="flex items-start gap-3">
                                                <Avatar className="h-10 w-10">
                                                    {review.patient?.profileImage?.fileUrl && (
                                                        <AvatarImage
                                                            src={getAvatarUrl(review.patient.profileImage.fileUrl)}
                                                            alt={review.patient?.name || "Patient"}
                                                        />
                                                    )}
                                                    <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                                                        {patientInitials}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <p className="text-sm font-semibold text-foreground">
                                                            {review.patient?.name || "Patient"}
                                                        </p>
                                                        <RatingStars rating={review.rating ?? 0} />
                                                        {review.createdAt && (
                                                            <span className="text-xs text-muted-foreground">
                                                                {format(new Date(review.createdAt), "MMM d, yyyy")}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="mt-2 text-sm text-muted-foreground">
                                                        {review.review || "No written review provided."}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>At a Glance</CardTitle>
                            <CardDescription>Quick appointment and timeslot insights</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Users className="h-4 w-4" />
                                    Total Appointments
                                </div>
                                <p className="text-lg font-semibold text-foreground">{totalAppointments}</p>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <CalendarDays className="h-4 w-4" />
                                    Available Timeslots (7 days)
                                </div>
                                <p className="text-lg font-semibold text-foreground">{availableTimeslots}</p>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <CalendarDays className="h-4 w-4" />
                                    Booked Timeslots (7 days)
                                </div>
                                <p className="text-lg font-semibold text-foreground">{bookedTimeslots}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Consultation Fee</CardTitle>
                            <CardDescription>Plan your visit budget</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-semibold text-foreground">
                                Rs. {doctor.consultationFee ?? "N/A"}
                            </p>
                            <p className="text-xs text-muted-foreground mt-2">
                                Includes consultation and initial assessment.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
