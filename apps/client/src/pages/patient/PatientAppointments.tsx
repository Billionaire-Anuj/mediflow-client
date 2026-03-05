import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    AppointmentService,
    DoctorReviewService,
    DoctorService,
    PatientService,
    AppointmentStatus,
    type AppointmentDto
} from "@mediflow/mediflow-api";
import { PageHeader } from "@/components/ui/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge, getStatusVariant } from "@/components/ui/status-badge";
import { ListSkeleton } from "@/components/ui/loading-skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, Search, ChevronDown, ChevronUp } from "lucide-react";
import { format, isPast } from "date-fns";
import { combineDateAndTime, formatDateOnly } from "@/lib/datetime";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { getErrorMessage, getResponseMessage } from "@/lib/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RatingInput, RatingStars } from "@/components/ui/rating";
import { getAvatarUrl } from "@/lib/auth";
import { DatePicker } from "@/components/ui/date-picker";
import { DateRangePicker } from "@/components/ui/date-picker";
import type { DateRange } from "react-day-picker";

export default function PatientAppointments() {
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState("upcoming");
    const [canceling, setCanceling] = useState<AppointmentDto | null>(null);
    const [rescheduling, setRescheduling] = useState<AppointmentDto | null>(null);
    const [cancellationReason, setCancellationReason] = useState("");
    const [rescheduleDate, setRescheduleDate] = useState<Date | undefined>(new Date());
    const [rescheduleTimeslot, setRescheduleTimeslot] = useState("");
    const [selectedDoctorId, setSelectedDoctorId] = useState<string>("all");
    const [doctorPickerOpen, setDoctorPickerOpen] = useState(false);
    const [reviewing, setReviewing] = useState<AppointmentDto | null>(null);
    const [reviewRating, setReviewRating] = useState(0);
    const [reviewComment, setReviewComment] = useState("");
    const [searchText, setSearchText] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [paymentFilter, setPaymentFilter] = useState<string>("all");
    const [dateRange, setDateRange] = useState<DateRange | undefined>();
    const [minFee, setMinFee] = useState("");
    const [maxFee, setMaxFee] = useState("");
    const [sortOrder, setSortOrder] = useState<string>("soonest");
    const [filtersOpen, setFiltersOpen] = useState(true);

    const { data: profileData } = useQuery({
        queryKey: ["patient-profile"],
        queryFn: async () => PatientService.getPatientProfile()
    });

    const patientId = profileData?.result?.id;
    const creditPoints = profileData?.result?.creditPoints ?? 0;

    const { data: doctorsData } = useQuery({
        queryKey: ["doctors-list"],
        queryFn: async () => DoctorService.getAllDoctorProfilesList({})
    });

    const doctors = doctorsData?.result ?? [];
    const doctorFilterId = selectedDoctorId === "all" ? undefined : selectedDoctorId;

    const { data: appointmentsData, isLoading } = useQuery({
        queryKey: ["patient-appointments", patientId, doctorFilterId],
        enabled: !!patientId,
        queryFn: async () =>
            AppointmentService.getAllAppointmentsList({
                patientId,
                doctorId: doctorFilterId
            })
    });

    const appointments = appointmentsData?.result ?? [];

    const filteredAppointments = useMemo(() => {
        const minFeeValue = minFee ? Number(minFee) : undefined;
        const maxFeeValue = maxFee ? Number(maxFee) : undefined;
        const searchValue = searchText.trim().toLowerCase();

        return appointments.filter((apt) => {
            if (selectedDoctorId !== "all" && apt.doctor?.id !== selectedDoctorId) return false;

            if (statusFilter !== "all" && apt.status !== statusFilter) return false;

            const isPaid = apt.isPaidViaGateway || apt.isPaidViaOfflineMedium;
            if (paymentFilter === "paid" && !isPaid) return false;
            if (paymentFilter === "unpaid" && isPaid) return false;

            if (minFeeValue !== undefined && (apt.fee ?? 0) < minFeeValue) return false;
            if (maxFeeValue !== undefined && (apt.fee ?? 0) > maxFeeValue) return false;

            const start = combineDateAndTime(apt.timeslot?.date, apt.timeslot?.startTime);
            if (dateRange?.from && (!start || start < dateRange.from)) return false;
            if (dateRange?.to && (!start || start > dateRange.to)) return false;

            if (searchValue) {
                const doctorName = apt.doctor?.name?.toLowerCase() ?? "";
                const doctorEmail = apt.doctor?.emailAddress?.toLowerCase() ?? "";
                const specialization =
                    (apt.doctor?.specializations || []).map((spec) => spec.title?.toLowerCase()).join(" ") ?? "";
                if (
                    !doctorName.includes(searchValue) &&
                    !doctorEmail.includes(searchValue) &&
                    !specialization.includes(searchValue)
                ) {
                    return false;
                }
            }

            return true;
        });
    }, [
        appointments,
        dateRange?.from,
        dateRange?.to,
        maxFee,
        minFee,
        paymentFilter,
        searchText,
        selectedDoctorId,
        statusFilter
    ]);

    const [upcomingAppointments, pastAppointments] = useMemo(() => {
        const upcoming: AppointmentDto[] = [];
        const past: AppointmentDto[] = [];

        filteredAppointments.forEach((apt) => {
            const start = combineDateAndTime(apt.timeslot?.date, apt.timeslot?.startTime);
            if (start && isPast(start)) {
                past.push(apt);
            } else {
                upcoming.push(apt);
            }
        });

        const sortMultiplier = sortOrder === "latest" ? -1 : 1;
        const sortFn = (a: AppointmentDto, b: AppointmentDto) =>
            ((combineDateAndTime(a.timeslot?.date, a.timeslot?.startTime)?.getTime() || 0) -
                (combineDateAndTime(b.timeslot?.date, b.timeslot?.startTime)?.getTime() || 0)) *
            sortMultiplier;

        return [upcoming.sort(sortFn), past.sort(sortFn)];
    }, [filteredAppointments, sortOrder]);

    const rescheduleDateValue = formatDateOnly(rescheduleDate);
    const { data: timeslotsData } = useQuery({
        queryKey: ["reschedule-timeslots", rescheduling?.doctor?.id, rescheduleDateValue],
        enabled: !!rescheduling?.doctor?.id && !!rescheduleDateValue,
        queryFn: async () =>
            DoctorService.getDoctorTimeslotsById({
                doctorId: rescheduling!.doctor!.id || "",
                startDate: rescheduleDateValue,
                endDate: rescheduleDateValue
            })
    });

    const availableTimeslots = (timeslotsData?.result ?? []).filter((slot) => !slot.isBooked);

    const cancelMutation = useMutation({
        mutationFn: async (appointment: AppointmentDto) => {
            return AppointmentService.cancelAppointment({
                appointmentId: appointment.id || "",
                requestBody: {
                    appointmentId: appointment.id,
                    cancellationReason: cancellationReason || undefined
                }
            });
        },
        onSuccess: (data) => {
            toast.success(getResponseMessage(data));
            setCanceling(null);
            setCancellationReason("");
            queryClient.invalidateQueries({ queryKey: ["patient-appointments", patientId] });
        },
        onError: (error) => toast.error(getErrorMessage(error))
    });

    const updateMutation = useMutation({
        mutationFn: async (appointment: AppointmentDto) => {
            return AppointmentService.updateAppointment({
                appointmentId: appointment.id || "",
                requestBody: {
                    appointmentId: appointment.id,
                    timeslotId: rescheduleTimeslot,
                    notes: appointment.notes || undefined,
                    symptoms: appointment.symptoms || undefined
                }
            });
        },
        onSuccess: (data) => {
            toast.success(getResponseMessage(data));
            setRescheduling(null);
            setRescheduleTimeslot("");
            queryClient.invalidateQueries({ queryKey: ["patient-appointments", patientId] });
        },
        onError: (error) => toast.error(getErrorMessage(error))
    });

    const reviewMutation = useMutation({
        mutationFn: async (appointment: AppointmentDto) => {
            return DoctorReviewService.createDoctorReview({
                appointmentId: appointment.id || "",
                requestBody: {
                    appointmentId: appointment.id,
                    rating: reviewRating,
                    review: reviewComment || undefined
                }
            });
        },
        onSuccess: (data, appointment) => {
            toast.success(getResponseMessage(data));
            setReviewing(null);
            setReviewRating(0);
            setReviewComment("");
            queryClient.invalidateQueries({ queryKey: ["patient-appointments", patientId] });
            queryClient.invalidateQueries({ queryKey: ["doctor-reviews", appointment.doctor?.id] });
        },
        onError: (error) => toast.error(getErrorMessage(error))
    });

    const payWithCreditsMutation = useMutation({
        mutationFn: async (appointment: AppointmentDto) =>
            AppointmentService.payAppointmentWithCredits({ appointmentId: appointment.id || "" }),
        onSuccess: (data) => {
            toast.success(getResponseMessage(data));
            queryClient.invalidateQueries({ queryKey: ["patient-appointments", patientId] });
            queryClient.invalidateQueries({ queryKey: ["appointment"] });
            queryClient.invalidateQueries({ queryKey: ["patient-profile"] });
        },
        onError: (error) => toast.error(getErrorMessage(error))
    });

    const getPaymentLabel = (appointment: AppointmentDto) => {
        if (appointment.isPaidViaGateway) return "Paid via Credits";
        if (appointment.isPaidViaOfflineMedium) return "Paid Offline";
        return "Unpaid";
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <PageHeader title="Appointments" description="Manage your upcoming and past appointments" />
                <ListSkeleton items={3} />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader title="Appointments" description="Manage your upcoming and past appointments" />

            <div className="grid gap-4 md:grid-cols-3">
                <Card className="border-border/60 shadow-sm">
                    <CardContent className="p-4">
                        <p className="text-xs uppercase text-muted-foreground">Upcoming</p>
                        <p className="mt-2 text-2xl font-semibold">{upcomingAppointments.length}</p>
                    </CardContent>
                </Card>
                <Card className="border-border/60 shadow-sm">
                    <CardContent className="p-4">
                        <p className="text-xs uppercase text-muted-foreground">Past</p>
                        <p className="mt-2 text-2xl font-semibold">{pastAppointments.length}</p>
                    </CardContent>
                </Card>
                <Card className="border-border/60 shadow-sm">
                    <CardContent className="p-4">
                        <p className="text-xs uppercase text-muted-foreground">Credits</p>
                        <p className="mt-2 text-2xl font-semibold">{creditPoints.toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground">1 NPR = 1 credit</p>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-border/60 shadow-sm">
                <CardContent className="p-5 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                            <Search className="h-4 w-4" />
                            Refine Appointments
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{filteredAppointments.length} results</span>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setFiltersOpen((prev) => !prev)}
                                className="flex items-center gap-1"
                            >
                                {filtersOpen ? "Hide" : "Show"} filters
                                {filtersOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </Button>
                        </div>
                    </div>
                    {filtersOpen && (
                        <>
                            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                                <div className="space-y-1">
                                    <Label>Search</Label>
                                    <Input
                                        placeholder="Doctor name, email, or specialization"
                                        value={searchText}
                                        onChange={(event) => setSearchText(event.target.value)}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label>Doctor</Label>
                                    <Select value={selectedDoctorId} onValueChange={setSelectedDoctorId}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="All Doctors" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-popover">
                                            <SelectItem value="all">All Doctors</SelectItem>
                                            {doctors.map((doctor) => (
                                                <SelectItem key={doctor.id} value={doctor.id || ""}>
                                                    {doctor.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1">
                                    <Label>Status</Label>
                                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="All Statuses" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-popover">
                                            <SelectItem value="all">All Statuses</SelectItem>
                                            <SelectItem value={AppointmentStatus.SCHEDULED}>Scheduled</SelectItem>
                                            <SelectItem value={AppointmentStatus.COMPLETED}>Completed</SelectItem>
                                            <SelectItem value={AppointmentStatus.CANCELED}>Canceled</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1">
                                    <Label>Payment</Label>
                                    <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="All Payments" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-popover">
                                            <SelectItem value="all">All Payments</SelectItem>
                                            <SelectItem value="paid">Paid</SelectItem>
                                            <SelectItem value="unpaid">Unpaid</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1">
                                    <Label>Date Range</Label>
                                    <DateRangePicker
                                        value={dateRange}
                                        onChange={setDateRange}
                                        placeholder="Select range"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label>Min Fee (NPR)</Label>
                                    <Input
                                        placeholder="0"
                                        value={minFee}
                                        onChange={(event) => setMinFee(event.target.value)}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label>Max Fee (NPR)</Label>
                                    <Input
                                        placeholder="1000"
                                        value={maxFee}
                                        onChange={(event) => setMaxFee(event.target.value)}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label>Sort By</Label>
                                    <Select value={sortOrder} onValueChange={setSortOrder}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Sort order" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-popover">
                                            <SelectItem value="soonest">Soonest First</SelectItem>
                                            <SelectItem value="latest">Latest First</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                                <Button variant="outline" onClick={() => setDoctorPickerOpen(true)}>
                                    Choose Doctor
                                </Button>
                                <Button
                                    variant="ghost"
                                    onClick={() => {
                                        setSearchText("");
                                        setSelectedDoctorId("all");
                                        setStatusFilter("all");
                                        setPaymentFilter("all");
                                        setDateRange(undefined);
                                        setMinFee("");
                                        setMaxFee("");
                                        setSortOrder("soonest");
                                    }}
                                >
                                    Clear Filters
                                </Button>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList>
                    <TabsTrigger value="upcoming">Upcoming ({upcomingAppointments.length})</TabsTrigger>
                    <TabsTrigger value="past">Past ({pastAppointments.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="upcoming" className="space-y-4">
                    {upcomingAppointments.length === 0 ? (
                        <EmptyState
                            icon={Calendar}
                            title="No upcoming appointments"
                            description="Book an appointment with one of our doctors"
                            action={
                                <Button asChild variant="outline">
                                    <Link to="/patient/doctors">Find Doctors</Link>
                                </Button>
                            }
                        />
                    ) : (
                        upcomingAppointments.map((appointment) => {
                            const start = combineDateAndTime(
                                appointment.timeslot?.date,
                                appointment.timeslot?.startTime
                            );
                            const end = combineDateAndTime(appointment.timeslot?.date, appointment.timeslot?.endTime);
                            const reviewCount = appointment.doctor?.reviewCount ?? 0;
                            const averageRating = appointment.doctor?.averageRating ?? 0;
                            const isPaid = appointment.isPaidViaGateway || appointment.isPaidViaOfflineMedium;
                            const paymentLabel = getPaymentLabel(appointment);
                            const canPayWithCredits =
                                !isPaid &&
                                appointment.status === "Scheduled" &&
                                (appointment.fee ?? 0) > 0 &&
                                creditPoints >= (appointment.fee ?? 0);
                            return (
                                <Card key={appointment.id} className="card-interactive">
                                    <CardContent className="p-5">
                                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                            <div className="flex flex-1 gap-4">
                                                <div className="min-w-[96px] rounded-xl border border-border/60 bg-muted/30 p-3 text-center">
                                                    {start ? (
                                                        <>
                                                            <p className="text-xs uppercase text-muted-foreground">
                                                                {format(start, "EEE")}
                                                            </p>
                                                            <p className="text-2xl font-semibold">
                                                                {format(start, "d")}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground">
                                                                {format(start, "MMM yyyy")}
                                                            </p>
                                                            <StatusBadge
                                                                variant={getStatusVariant(
                                                                    appointment.status || "scheduled"
                                                                )}
                                                            >
                                                                {appointment.status}
                                                            </StatusBadge>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <p className="text-xs text-muted-foreground">TBD</p>
                                                            <StatusBadge
                                                                variant={getStatusVariant(
                                                                    appointment.status || "scheduled"
                                                                )}
                                                            >
                                                                {appointment.status}
                                                            </StatusBadge>
                                                        </>
                                                    )}
                                                </div>
                                                <div className="flex-1 space-y-2">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="h-12 w-12">
                                                            {appointment.doctor?.profileImage?.fileUrl && (
                                                                <AvatarImage
                                                                    src={getAvatarUrl(
                                                                        appointment.doctor.profileImage.fileUrl
                                                                    )}
                                                                    alt={appointment.doctor?.name || "Doctor"}
                                                                />
                                                            )}
                                                            <AvatarFallback className="bg-primary/10 text-primary font-medium">
                                                                {appointment.doctor?.name
                                                                    ?.split(" ")
                                                                    .map((n) => n[0])
                                                                    .join("") || "D"}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <h3 className="font-medium">{appointment.doctor?.name}</h3>
                                                            <p className="text-sm text-muted-foreground">
                                                                {(appointment.doctor?.specializations || [])
                                                                    .map((spec) => spec.title)
                                                                    .filter(Boolean)
                                                                    .join(", ") || "General Practitioner"}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                                        <RatingStars rating={averageRating} />
                                                        <span>
                                                            {reviewCount > 0
                                                                ? `${averageRating.toFixed(1)} (${reviewCount})`
                                                                : "No reviews"}
                                                        </span>
                                                        {start && (
                                                            <span className="flex items-center gap-1">
                                                                <Clock className="h-3 w-3" />
                                                                {format(start, "h:mm a")}
                                                                {end ? ` - ${format(end, "h:mm a")}` : ""}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                                        <span className="rounded-full border border-border/60 px-2.5 py-1">
                                                            Fee: NPR {appointment.fee?.toFixed(2) ?? "0.00"}
                                                        </span>
                                                        <span
                                                            className={`rounded-full border px-2.5 py-1 ${
                                                                isPaid
                                                                    ? "border-emerald-100 bg-emerald-50 text-emerald-700"
                                                                    : "border-amber-100 bg-amber-50 text-amber-700"
                                                            }`}
                                                        >
                                                            {paymentLabel}
                                                        </span>
                                                        {!isPaid && (
                                                            <span className="rounded-full border border-border/60 px-2.5 py-1">
                                                                Credits: {creditPoints.toFixed(2)}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-2">
                                                {!isPaid && appointment.status === "Scheduled" && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        disabled={
                                                            !canPayWithCredits || payWithCreditsMutation.isPending
                                                        }
                                                        onClick={() => payWithCreditsMutation.mutate(appointment)}
                                                    >
                                                        {payWithCreditsMutation.isPending
                                                            ? "Processing..."
                                                            : "Pay with Credits"}
                                                    </Button>
                                                )}
                                                {appointment.status === "Scheduled" && (
                                                    <>
                                                        <Button size="sm" variant="outline" asChild>
                                                            <Link to={`/patient/appointments/${appointment.id}`}>
                                                                Details
                                                            </Link>
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => {
                                                                setRescheduling(appointment);
                                                                setRescheduleTimeslot("");
                                                                setRescheduleDate(new Date());
                                                            }}
                                                        >
                                                            Reschedule
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="destructive"
                                                            onClick={() => setCanceling(appointment)}
                                                        >
                                                            Cancel
                                                        </Button>
                                                    </>
                                                )}
                                                {appointment.status !== "Scheduled" && (
                                                    <Button size="sm" variant="outline" asChild>
                                                        <Link to={`/patient/appointments/${appointment.id}`}>
                                                            Details
                                                        </Link>
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })
                    )}
                </TabsContent>

                <TabsContent value="past" className="space-y-4">
                    {pastAppointments.length === 0 ? (
                        <EmptyState
                            icon={Calendar}
                            title="No past appointments"
                            description="Your completed appointments will appear here"
                        />
                    ) : (
                        pastAppointments.map((appointment) => {
                            const start = combineDateAndTime(
                                appointment.timeslot?.date,
                                appointment.timeslot?.startTime
                            );
                            const canReview = appointment.status === "Completed" && !appointment.hasReview;
                            const reviewCount = appointment.doctor?.reviewCount ?? 0;
                            const averageRating = appointment.doctor?.averageRating ?? 0;
                            const isPaid = appointment.isPaidViaGateway || appointment.isPaidViaOfflineMedium;
                            const paymentLabel = getPaymentLabel(appointment);
                            return (
                                <Card key={appointment.id} className="card-interactive">
                                    <CardContent className="p-5">
                                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                            <div className="flex flex-1 gap-4">
                                                <div className="min-w-[96px] rounded-xl border border-border/60 bg-muted/30 p-3 text-center">
                                                    {start ? (
                                                        <>
                                                            <p className="text-xs uppercase text-muted-foreground">
                                                                {format(start, "EEE")}
                                                            </p>
                                                            <p className="text-2xl font-semibold">
                                                                {format(start, "d")}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground">
                                                                {format(start, "MMM yyyy")}
                                                            </p>
                                                        </>
                                                    ) : (
                                                        <p className="text-xs text-muted-foreground">TBD</p>
                                                    )}
                                                </div>
                                                <div className="flex-1 space-y-2">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="h-12 w-12">
                                                            {appointment.doctor?.profileImage?.fileUrl && (
                                                                <AvatarImage
                                                                    src={getAvatarUrl(
                                                                        appointment.doctor.profileImage.fileUrl
                                                                    )}
                                                                    alt={appointment.doctor?.name || "Doctor"}
                                                                />
                                                            )}
                                                            <AvatarFallback className="bg-primary/10 text-primary font-medium">
                                                                {appointment.doctor?.name
                                                                    ?.split(" ")
                                                                    .map((n) => n[0])
                                                                    .join("") || "D"}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <h3 className="font-medium">{appointment.doctor?.name}</h3>
                                                            <p className="text-sm text-muted-foreground">
                                                                {(appointment.doctor?.specializations || [])
                                                                    .map((spec) => spec.title)
                                                                    .filter(Boolean)
                                                                    .join(", ") || "General Practitioner"}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                                        <RatingStars rating={averageRating} />
                                                        <span>
                                                            {reviewCount > 0
                                                                ? `${averageRating.toFixed(1)} (${reviewCount})`
                                                                : "No reviews"}
                                                        </span>
                                                        {start && (
                                                            <span className="flex items-center gap-1">
                                                                <Calendar className="h-3 w-3" />
                                                                {format(start, "MMM d, yyyy")}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                                        <span className="rounded-full border border-border/60 px-2.5 py-1">
                                                            Fee: NPR {appointment.fee?.toFixed(2) ?? "0.00"}
                                                        </span>
                                                        <span
                                                            className={`rounded-full border px-2.5 py-1 ${
                                                                isPaid
                                                                    ? "border-emerald-100 bg-emerald-50 text-emerald-700"
                                                                    : "border-amber-100 bg-amber-50 text-amber-700"
                                                            }`}
                                                        >
                                                            {paymentLabel}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-2">
                                                <StatusBadge
                                                    variant={getStatusVariant(appointment.status || "completed")}
                                                >
                                                    {appointment.status}
                                                </StatusBadge>
                                                {appointment.hasReview && (
                                                    <div className="hidden items-center gap-1 text-xs text-muted-foreground sm:flex">
                                                        <RatingStars rating={appointment.reviewRating ?? 0} />
                                                        <span>Reviewed</span>
                                                    </div>
                                                )}
                                                {canReview && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => {
                                                            setReviewing(appointment);
                                                            setReviewRating(0);
                                                            setReviewComment("");
                                                        }}
                                                    >
                                                        Leave Review
                                                    </Button>
                                                )}
                                                <Button size="sm" variant="outline" asChild>
                                                    <Link to={`/patient/appointments/${appointment.id}`}>Details</Link>
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })
                    )}
                </TabsContent>
            </Tabs>

            <Dialog open={!!canceling} onOpenChange={() => setCanceling(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Cancel Appointment</DialogTitle>
                        <DialogDescription>Provide a reason for cancelling this appointment.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <Input
                            placeholder="Cancellation Reason"
                            value={cancellationReason}
                            onChange={(e) => setCancellationReason(e.target.value)}
                        />
                        <p className="text-sm text-muted-foreground">
                            Refund policy: Cancel 2 days before the booking for a full refund. Cancel within 2 days for
                            a 50% refund. Same-day cancellations are not refundable.
                        </p>
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setCanceling(null)}>
                                Close
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={() => canceling && cancelMutation.mutate(canceling)}
                                disabled={cancelMutation.isPending}
                            >
                                {cancelMutation.isPending ? "Cancelling..." : "Confirm Cancel"}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={!!rescheduling} onOpenChange={() => setRescheduling(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reschedule Appointment</DialogTitle>
                        <DialogDescription>Select a new date and time.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label className="text-sm font-medium">Date</Label>
                                <div className="mt-1">
                                    <DatePicker
                                        value={rescheduleDate}
                                        onChange={(value) => setRescheduleDate(value ?? undefined)}
                                        placeholder="Select date"
                                    />
                                </div>
                            </div>
                            <div>
                                <Label className="text-sm font-medium">Time</Label>
                                <Select value={rescheduleTimeslot} onValueChange={setRescheduleTimeslot}>
                                    <SelectTrigger className="mt-1">
                                        <SelectValue placeholder="Select time" />
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
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setRescheduling(null)}>
                                Close
                            </Button>
                            <Button
                                onClick={() => rescheduling && updateMutation.mutate(rescheduling)}
                                disabled={!rescheduleTimeslot || updateMutation.isPending}
                            >
                                {updateMutation.isPending ? "Updating..." : "Update Appointment"}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={doctorPickerOpen} onOpenChange={setDoctorPickerOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Select Doctor</DialogTitle>
                        <DialogDescription>Filter appointments by doctor.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                        <button
                            type="button"
                            onClick={() => {
                                setSelectedDoctorId("all");
                                setDoctorPickerOpen(false);
                            }}
                            className={`flex w-full items-center justify-between rounded-lg border p-3 text-left transition ${
                                selectedDoctorId === "all"
                                    ? "border-primary bg-primary/5"
                                    : "border-border/70 hover:border-primary/40"
                            }`}
                        >
                            <div>
                                <p className="font-medium">All Doctors</p>
                                <p className="text-xs text-muted-foreground">Show every appointment</p>
                            </div>
                            {selectedDoctorId === "all" && <span className="text-xs text-primary">Selected</span>}
                        </button>
                        {doctors.map((doctor) => {
                            const isSelected = doctor.id === selectedDoctorId;
                            const initials = (doctor.name || "D")
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .slice(0, 2)
                                .toUpperCase();
                            return (
                                <button
                                    key={doctor.id}
                                    type="button"
                                    onClick={() => {
                                        setSelectedDoctorId(doctor.id || "all");
                                        setDoctorPickerOpen(false);
                                    }}
                                    className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left transition ${
                                        isSelected
                                            ? "border-primary bg-primary/5"
                                            : "border-border/70 hover:border-primary/40"
                                    }`}
                                >
                                    <Avatar className="h-10 w-10">
                                        {doctor.profileImage?.fileUrl && (
                                            <AvatarImage
                                                src={getAvatarUrl(doctor.profileImage.fileUrl)}
                                                alt={doctor.name || "Doctor"}
                                            />
                                        )}
                                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                                            {initials}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <p className="font-medium">{doctor.name}</p>
                                        <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                                            <RatingStars rating={doctor.averageRating ?? 0} />
                                            <span>
                                                {doctor.reviewCount && doctor.reviewCount > 0
                                                    ? `${(doctor.averageRating ?? 0).toFixed(1)} (${doctor.reviewCount})`
                                                    : "No reviews"}
                                            </span>
                                        </div>
                                    </div>
                                    {isSelected && <span className="text-xs text-primary">Selected</span>}
                                </button>
                            );
                        })}
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog
                open={!!reviewing}
                onOpenChange={(open) => {
                    if (!open) {
                        setReviewing(null);
                        setReviewRating(0);
                        setReviewComment("");
                    }
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Leave a Review</DialogTitle>
                        <DialogDescription>Share your feedback about this completed appointment.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">Rating</Label>
                            <RatingInput value={reviewRating} onChange={setReviewRating} />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">Review</Label>
                            <Textarea
                                rows={4}
                                placeholder="Share your experience (optional)"
                                value={reviewComment}
                                onChange={(event) => setReviewComment(event.target.value)}
                            />
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setReviewing(null)}>
                                Close
                            </Button>
                            <Button
                                onClick={() => reviewing && reviewMutation.mutate(reviewing)}
                                disabled={reviewRating === 0 || reviewMutation.isPending}
                            >
                                {reviewMutation.isPending ? "Submitting..." : "Submit Review"}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
