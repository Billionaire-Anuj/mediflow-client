import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { addDays, format, isSameDay } from "date-fns";
import {
    AppointmentService,
    DoctorService,
    type TimeslotDto
} from "@mediflow/mediflow-api";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ListSkeleton } from "@/components/ui/loading-skeleton";
import { RatingStars } from "@/components/ui/rating";
import { cn } from "@/lib/utils";
import { getAvatarUrl } from "@/lib/auth";
import { getErrorMessage, getResponseMessage } from "@/lib/api";
import { toast } from "sonner";
import { CalendarDays, CheckCircle2, Clock, Stethoscope, XCircle } from "lucide-react";

const buildDateOptions = (start: Date) =>
    Array.from({ length: 7 }).map((_, index) => addDays(start, index));

export default function PatientBookAppointment() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const preselectedDoctorId = searchParams.get("doctorId") || "";

    const [selectedDoctorId, setSelectedDoctorId] = useState<string>(preselectedDoctorId);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [selectedTimeslotId, setSelectedTimeslotId] = useState<string>("");
    const [reason, setReason] = useState("");

    const { data: doctorsData, isLoading } = useQuery({
        queryKey: ["doctors"],
        queryFn: async () => DoctorService.getAllDoctorProfilesList({})
    });

    const doctors = doctorsData?.result ?? [];

    useEffect(() => {
        if (doctors.length === 0) return;

        const exists = selectedDoctorId && doctors.some((doc) => doc.id === selectedDoctorId);

        if (!exists) {
            setSelectedDoctorId(doctors[0].id || "");
        }
    }, [doctors, selectedDoctorId]);

    const selectedDoctor = useMemo(
        () => doctors.find((doc) => doc.id === selectedDoctorId),
        [doctors, selectedDoctorId]
    );

    const selectedDateString = format(selectedDate, "yyyy-MM-dd");

    const { data: timeslotsData, isLoading: timeslotsLoading } = useQuery({
        queryKey: ["doctor-timeslots-booking", selectedDoctorId, selectedDateString],
        enabled: !!selectedDoctorId,
        queryFn: async () =>
            DoctorService.getDoctorTimeslotsById({
                doctorId: selectedDoctorId,
                startDate: selectedDateString,
                endDate: selectedDateString
            })
    });

    const timeslots = timeslotsData?.result ?? [];

    useEffect(() => {
        setSelectedTimeslotId("");
    }, [selectedDoctorId, selectedDateString]);

    const bookMutation = useMutation({
        mutationFn: async () => {
            if (!selectedDoctorId || !selectedTimeslotId) {
                throw new Error("Please select a doctor and a timeslot.");
            }
            return AppointmentService.bookAppointment({
                requestBody: {
                    doctorId: selectedDoctorId,
                    timeslotId: selectedTimeslotId,
                    symptoms: reason || undefined,
                    notes: reason || undefined
                }
            });
        },
        onSuccess: (data) => {
            toast.success(getResponseMessage(data));
            navigate("/patient/appointments", { replace: true });
        },
        onError: (error) => toast.error(getErrorMessage(error))
    });

    const dateOptions = useMemo(() => buildDateOptions(new Date()), []);

    const specializationLabel =
        (selectedDoctor?.specializations || [])
            .map((spec) => spec.title)
            .filter(Boolean)
            .join(", ") || "General Practitioner";

    const initials = (selectedDoctor?.name || "D")
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

    if (isLoading) {
        return (
            <div className="space-y-6">
                <PageHeader title="Book Appointment" />
                <ListSkeleton items={3} />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader
                title="Book Your Appointment"
                description="Select a doctor, date, and time for your visit"
            />

            <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm">
                                    1
                                </span>
                                Select Doctor
                            </CardTitle>
                            <CardDescription>Choose the specialist you want to visit.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-3">
                                {doctors.map((doctor) => {
                                    const isSelected = doctor.id === selectedDoctorId;
                                    const doctorSpecializations =
                                        (doctor.specializations || [])
                                            .map((spec) => spec.title)
                                            .filter(Boolean)
                                            .join(", ") || "General Practitioner";
                                    return (
                                        <button
                                            key={doctor.id}
                                            type="button"
                                            onClick={() => setSelectedDoctorId(doctor.id || "")}
                                            className={cn(
                                                "flex w-full items-center gap-4 rounded-xl border p-4 text-left transition",
                                                isSelected
                                                    ? "border-primary bg-primary/5 shadow-sm"
                                                    : "border-border/70 hover:border-primary/40"
                                            )}
                                        >
                                            <Avatar className="h-12 w-12 border border-border/60">
                                                {doctor.profileImage?.fileUrl && (
                                                    <AvatarImage
                                                        src={getAvatarUrl(doctor.profileImage.fileUrl)}
                                                        alt={doctor.name || "Doctor"}
                                                    />
                                                )}
                                                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                                                    {(doctor.name || "D")
                                                        .split(" ")
                                                        .map((n) => n[0])
                                                        .join("")
                                                        .slice(0, 2)
                                                        .toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <p className="font-semibold text-foreground">{doctor.name}</p>
                                                    {isSelected && (
                                                        <Badge variant="secondary">Selected</Badge>
                                                    )}
                                                </div>
                                                <p className="text-sm text-muted-foreground">{doctorSpecializations}</p>
                                                <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                                                    <RatingStars rating={doctor.averageRating ?? 0} />
                                                    <span>
                                                        {doctor.reviewCount && doctor.reviewCount > 0
                                                            ? `${(doctor.averageRating ?? 0).toFixed(1)} (${doctor.reviewCount} reviews)`
                                                            : "No reviews yet"}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs text-muted-foreground">Fee</p>
                                                <p className="font-semibold">Rs. {doctor.consultationFee ?? "N/A"}</p>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm">
                                    2
                                </span>
                                Select Date & Time
                            </CardTitle>
                            <CardDescription>Pick an available date and timeslot.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            <div className="flex flex-wrap gap-3">
                                {dateOptions.map((date) => (
                                    <button
                                        key={date.toISOString()}
                                        type="button"
                                        onClick={() => setSelectedDate(date)}
                                        className={cn(
                                            "flex flex-col items-center rounded-xl border px-4 py-3 text-sm transition",
                                            isSameDay(date, selectedDate)
                                                ? "border-emerald-500 bg-emerald-600 text-white shadow-sm"
                                                : "border-emerald-100/80 bg-white/80 text-emerald-800 hover:border-emerald-300 hover:bg-emerald-50/70"
                                        )}
                                    >
                                        <span className="text-xs uppercase">{format(date, "EEE")}</span>
                                        <span className="text-lg font-semibold">{format(date, "d")}</span>
                                        <span className="text-xs">{format(date, "MMM")}</span>
                                    </button>
                                ))}
                            </div>

                            <div className="rounded-xl border border-border/70 bg-muted/30 p-4">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <CalendarDays className="h-4 w-4" />
                                    {format(selectedDate, "EEEE, MMMM d, yyyy")}
                                </div>
                                <div className="mt-4">
                                    {timeslotsLoading ? (
                                        <p className="text-sm text-muted-foreground">Loading timeslots...</p>
                                    ) : timeslots.length === 0 ? (
                                        <p className="text-sm text-muted-foreground">No timeslots for this date.</p>
                                    ) : (
                                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                            {timeslots.map((slot: TimeslotDto) => {
                                                const isSelected = slot.id === selectedTimeslotId;
                                                return (
                                                    <button
                                                        key={slot.id}
                                                        type="button"
                                                        disabled={slot.isBooked}
                                                        onClick={() => setSelectedTimeslotId(slot.id || "")}
                                                        className={cn(
                                                            "flex items-center justify-between rounded-xl border px-3 py-2 text-sm transition shadow-sm",
                                                            slot.isBooked
                                                                ? "border-destructive/40 bg-destructive/10 text-destructive cursor-not-allowed"
                                                                : "border-emerald-100/80 bg-white/80 hover:border-emerald-300 hover:bg-emerald-50/70",
                                                            isSelected && !slot.isBooked
                                                                ? "border-emerald-500 bg-emerald-50 text-emerald-900 ring-1 ring-emerald-200"
                                                                : ""
                                                        )}
                                                    >
                                                        <span className="flex items-center gap-2">
                                                            <Clock className="h-4 w-4" />
                                                            {slot.startTime} - {slot.endTime}
                                                        </span>
                                                        {slot.isBooked ? (
                                                            <XCircle className="h-4 w-4" />
                                                        ) : (
                                                            isSelected && <CheckCircle2 className="h-4 w-4 text-primary" />
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm">
                                    3
                                </span>
                                Appointment Information
                            </CardTitle>
                            <CardDescription>Share a brief reason for your visit.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Textarea
                                rows={4}
                                placeholder="Describe your symptoms or reason for visit"
                                value={reason}
                                onChange={(event) => setReason(event.target.value)}
                            />
                        </CardContent>
                    </Card>

                    <div className="flex flex-wrap items-center gap-3">
                        <Button asChild variant="outline">
                            <Link to="/patient/doctors">Back to Doctors</Link>
                        </Button>
                        <Button
                            onClick={() => bookMutation.mutate()}
                            disabled={!selectedTimeslotId || bookMutation.isPending || !selectedDoctorId}
                        >
                            {bookMutation.isPending ? "Booking..." : "Confirm Appointment"}
                        </Button>
                    </div>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Appointment Summary</CardTitle>
                            <CardDescription>Review the details before confirming.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3">
                                <Avatar className="h-24 w-24 border border-border/60">
                                    {selectedDoctor?.profileImage?.fileUrl && (
                                        <AvatarImage
                                            src={getAvatarUrl(selectedDoctor.profileImage.fileUrl)}
                                            alt={selectedDoctor.name || "Doctor"}
                                        />
                                    )}
                                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                                        {initials}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-semibold text-foreground">
                                        {selectedDoctor?.name || "Select a doctor"}
                                    </p>
                                    <p className="text-sm text-muted-foreground">{specializationLabel}</p>
                                    {selectedDoctor && (
                                        <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                                            <RatingStars rating={selectedDoctor.averageRating ?? 0} />
                                            <span>
                                                {selectedDoctor.reviewCount && selectedDoctor.reviewCount > 0
                                                    ? `${(selectedDoctor.averageRating ?? 0).toFixed(1)} (${selectedDoctor.reviewCount} reviews)`
                                                    : "No reviews yet"}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2 text-sm">
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Date</span>
                                    <span>{format(selectedDate, "MMM d, yyyy")}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Time</span>
                                    <span>
                                        {timeslots.find((slot) => slot.id === selectedTimeslotId)?.startTime ||
                                            "Not selected"}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Consultation Fee</span>
                                    <span>Rs. {selectedDoctor?.consultationFee ?? "N/A"}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Reason</span>
                                    <span className="text-right line-clamp-2 max-w-[150px]">
                                        {reason || "Not provided"}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Doctor Schedule</CardTitle>
                            <CardDescription>Weekly working hours</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            {(selectedDoctor?.schedules || []).length === 0 && (
                                <p className="text-muted-foreground">No schedule shared yet.</p>
                            )}
                            {(selectedDoctor?.schedules || []).map((schedule) => (
                                <div key={schedule.id} className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium">{schedule.dayOfWeek}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {schedule.validStartDate || ""} {schedule.validEndDate ? `- ${schedule.validEndDate}` : ""}
                                        </p>
                                    </div>
                                    <span className="text-muted-foreground">
                                        {schedule.startTime} - {schedule.endTime}
                                    </span>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Helpful Tips</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm text-muted-foreground">
                            <div className="flex items-start gap-2">
                                <Badge className="h-6 w-6 rounded-full p-0 flex items-center justify-center" variant="secondary">
                                    <Clock className="h-3 w-3" />
                                </Badge>
                                <div>
                                    <p className="font-medium text-foreground">Be on time</p>
                                    <p>Arrive 10-15 minutes early for a smoother check-in.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-2">
                                <Badge className="h-6 w-6 rounded-full p-0 flex items-center justify-center" variant="secondary">
                                    <Stethoscope className="h-3 w-3" />
                                </Badge>
                                <div>
                                    <p className="font-medium text-foreground">Bring documents</p>
                                    <p>Carry prior reports, prescriptions, or insurance details.</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
