import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AppointmentService, AppointmentStatus, DoctorService } from "@mediflow/mediflow-api";
import { format } from "date-fns";
import { ArrowLeft, CalendarDays, CalendarPlus, Clock3, Search, Stethoscope, UserRound } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/date-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { EmptyState } from "@/components/ui/empty-state";
import { ListSkeleton } from "@/components/ui/loading-skeleton";
import { cn } from "@/lib/utils";
import { combineDateAndTime } from "@/lib/datetime";
import { getAvatarUrl } from "@/lib/auth";
import { getErrorMessage, getResponseMessage } from "@/lib/api";
import { toast } from "sonner";

interface DoctorPatientOption {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    totalVisits: number;
    nextVisit?: Date;
    profileImageUrl?: string | null;
}

export default function DoctorCreateAppointment() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const initialPatientId = searchParams.get("patientId") || "";

    const [selectedPatientId, setSelectedPatientId] = useState(initialPatientId);
    const [patientSearch, setPatientSearch] = useState("");
    const [appointmentDate, setAppointmentDate] = useState<Date | undefined>(new Date());
    const [selectedTimeslotId, setSelectedTimeslotId] = useState("");
    const [symptoms, setSymptoms] = useState("");
    const [notes, setNotes] = useState("");

    const { data: doctorProfile } = useQuery({
        queryKey: ["doctor-profile"],
        queryFn: async () => DoctorService.getDoctorProfile()
    });

    const doctorId = doctorProfile?.result?.id;

    const { data: appointmentsData, isLoading } = useQuery({
        queryKey: ["doctor-appointments", doctorId],
        enabled: !!doctorId,
        queryFn: async () => AppointmentService.getAllAppointmentsList({ doctorId })
    });

    const selectedDateString = appointmentDate ? format(appointmentDate, "yyyy-MM-dd") : "";

    const { data: timeslotsData, isLoading: timeslotsLoading } = useQuery({
        queryKey: ["doctor-timeslots", selectedDateString],
        enabled: !!selectedDateString,
        queryFn: async () =>
            DoctorService.getDoctorTimeslots({
                startDate: selectedDateString,
                endDate: selectedDateString
            })
    });

    useEffect(() => {
        setSelectedTimeslotId("");
    }, [selectedDateString]);

    const patients = useMemo<DoctorPatientOption[]>(() => {
        const map = new Map<string, DoctorPatientOption>();
        const now = new Date();

        for (const appointment of appointmentsData?.result ?? []) {
            const patient = appointment.patient;
            if (!patient?.id) continue;

            const start = combineDateAndTime(appointment.timeslot?.date, appointment.timeslot?.startTime);
            const upcoming =
                start && start > now && appointment.status === AppointmentStatus.SCHEDULED ? start : undefined;
            const existing = map.get(patient.id);

            if (!existing) {
                map.set(patient.id, {
                    id: patient.id,
                    name: patient.name || "Patient",
                    email: patient.emailAddress || undefined,
                    phone: patient.phoneNumber || undefined,
                    totalVisits: 1,
                    nextVisit: upcoming,
                    profileImageUrl: patient.profileImage?.fileUrl
                });
                continue;
            }

            existing.totalVisits += 1;
            if (upcoming && (!existing.nextVisit || upcoming < existing.nextVisit)) {
                existing.nextVisit = upcoming;
            }
            if (!existing.profileImageUrl && patient.profileImage?.fileUrl) {
                existing.profileImageUrl = patient.profileImage.fileUrl;
            }
        }

        return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
    }, [appointmentsData?.result]);

    useEffect(() => {
        if (!selectedPatientId && patients.length > 0) {
            setSelectedPatientId(
                initialPatientId && patients.some((patient) => patient.id === initialPatientId)
                    ? initialPatientId
                    : patients[0].id
            );
        }
    }, [initialPatientId, patients, selectedPatientId]);

    const filteredPatients = useMemo(() => {
        const query = patientSearch.trim().toLowerCase();
        if (!query) return patients;

        return patients.filter((patient) => {
            const blob = [patient.name, patient.email, patient.phone].filter(Boolean).join(" ").toLowerCase();
            return blob.includes(query);
        });
    }, [patientSearch, patients]);

    const selectedPatient = patients.find((patient) => patient.id === selectedPatientId) || null;
    const availableTimeslots = (timeslotsData?.result ?? []).filter((slot) => !slot.isBooked);

    const createAppointmentMutation = useMutation({
        mutationFn: async () =>
            AppointmentService.bookAppointmentByDoctor({
                requestBody: {
                    patientId: selectedPatientId,
                    timeslotId: selectedTimeslotId,
                    notes: notes.trim() || null,
                    symptoms: symptoms.trim() || null
                }
            }),
        onSuccess: (response) => {
            toast.success(getResponseMessage(response));
            queryClient.invalidateQueries({ queryKey: ["doctor-appointments"] });
            navigate("/doctor/appointments");
        },
        onError: (error) => toast.error(getErrorMessage(error))
    });

    const canSubmit = !!selectedPatientId && !!selectedTimeslotId;

    if (isLoading) {
        return (
            <div className="space-y-6">
                <PageHeader title="Create Appointment" />
                <ListSkeleton items={3} />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader
                title="Create Appointment"
                description="Schedule an appointment for one of your patients using your available timeslots."
            >
                <Button variant="outline" asChild>
                    <Link to="/doctor/appointments">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Appointments
                    </Link>
                </Button>
            </PageHeader>

            <div className="grid gap-4 md:grid-cols-3">
                <Card className="border-primary/20 bg-primary/5">
                    <CardContent className="flex items-center justify-between p-4">
                        <div>
                            <p className="text-xs uppercase tracking-wide text-muted-foreground">Patients In Care</p>
                            <p className="text-2xl font-semibold">{patients.length}</p>
                        </div>
                        <UserRound className="h-5 w-5 text-primary" />
                    </CardContent>
                </Card>
                <Card className="border-emerald-200 bg-emerald-50/70">
                    <CardContent className="flex items-center justify-between p-4">
                        <div>
                            <p className="text-xs uppercase tracking-wide text-muted-foreground">Open Slots</p>
                            <p className="text-2xl font-semibold">{availableTimeslots.length}</p>
                        </div>
                        <Clock3 className="h-5 w-5 text-emerald-600" />
                    </CardContent>
                </Card>
                <Card className="border-amber-200 bg-amber-50/70">
                    <CardContent className="flex items-center justify-between p-4">
                        <div>
                            <p className="text-xs uppercase tracking-wide text-muted-foreground">Selected Date</p>
                            <p className="text-lg font-semibold">
                                {appointmentDate ? format(appointmentDate, "MMM d, yyyy") : "Not selected"}
                            </p>
                        </div>
                        <CalendarDays className="h-5 w-5 text-amber-600" />
                    </CardContent>
                </Card>
            </div>

            {patients.length === 0 ? (
                <Card>
                    <CardContent className="p-6">
                        <EmptyState
                            icon={UserRound}
                            title="No patients available yet"
                            description="Create a patient first, then come back here to schedule an appointment for them."
                            action={
                                <Button asChild>
                                    <Link to="/doctor/patients">Open Patients</Link>
                                </Button>
                            }
                        />
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
                    <Card className="overflow-hidden border-border/60 shadow-sm">
                        <CardHeader className="border-b bg-gradient-to-r from-emerald-50 to-white">
                            <CardTitle className="text-base">Select Patient</CardTitle>
                            <CardDescription>
                                Pick an existing patient, then choose a date and timeslot.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 p-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    value={patientSearch}
                                    onChange={(event) => setPatientSearch(event.target.value)}
                                    placeholder="Search patient by name, email, or phone"
                                    className="pl-10"
                                />
                            </div>

                            <div className="space-y-3">
                                {filteredPatients.length === 0 ? (
                                    <div className="rounded-2xl border border-dashed p-4 text-sm text-muted-foreground">
                                        No matching patients found.
                                    </div>
                                ) : (
                                    filteredPatients.map((patient) => {
                                        const isSelected = patient.id === selectedPatientId;

                                        return (
                                            <button
                                                key={patient.id}
                                                type="button"
                                                onClick={() => setSelectedPatientId(patient.id)}
                                                className={cn(
                                                    "w-full rounded-2xl border p-4 text-left transition",
                                                    isSelected
                                                        ? "border-primary bg-primary/[0.06] shadow-sm"
                                                        : "border-border hover:border-primary/40 hover:bg-accent/40"
                                                )}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <Avatar className="h-12 w-12 ring-2 ring-primary/10">
                                                        <AvatarImage
                                                            src={getAvatarUrl(patient.profileImageUrl)}
                                                            alt={patient.name}
                                                        />
                                                        <AvatarFallback className="bg-primary/10 text-primary">
                                                            {patient.name
                                                                .split(" ")
                                                                .map((chunk) => chunk[0])
                                                                .join("")
                                                                .slice(0, 2)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="min-w-0 flex-1 space-y-1">
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <p className="truncate font-semibold">{patient.name}</p>
                                                            {isSelected && <Badge variant="secondary">Selected</Badge>}
                                                        </div>
                                                        <p className="truncate text-sm text-muted-foreground">
                                                            {patient.email || "No email on file"}
                                                        </p>
                                                        {patient.phone && (
                                                            <p className="text-sm text-muted-foreground">
                                                                {patient.phone}
                                                            </p>
                                                        )}
                                                        <div className="flex flex-wrap gap-2 pt-1 text-xs text-muted-foreground">
                                                            <span>
                                                                {patient.totalVisits} visit
                                                                {patient.totalVisits === 1 ? "" : "s"}
                                                            </span>
                                                            {patient.nextVisit && (
                                                                <span>
                                                                    Next: {format(patient.nextVisit, "MMM d, yyyy")}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </button>
                                        );
                                    })
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <div className="space-y-6">
                        <Card className="border-border/60 shadow-sm">
                            <CardHeader className="border-b bg-gradient-to-r from-white to-emerald-50/70">
                                <CardTitle className="text-base">Appointment Setup</CardTitle>
                                <CardDescription>
                                    Choose the date, timeslot, and visit details for this patient.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-6 p-5 lg:grid-cols-[minmax(0,1fr)_320px]">
                                <div className="space-y-5">
                                    <div className="grid gap-5 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label>Date</Label>
                                            <DatePicker
                                                value={appointmentDate}
                                                onChange={(date) => setAppointmentDate(date as Date)}
                                                placeholder="Select appointment date"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Patient</Label>
                                            <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select patient" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {patients.map((patient) => (
                                                        <SelectItem key={patient.id} value={patient.id}>
                                                            {patient.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Timeslot</Label>
                                        {timeslotsLoading ? (
                                            <p className="text-sm text-muted-foreground">
                                                Loading available timeslots...
                                            </p>
                                        ) : timeslotsData?.result?.length ? (
                                            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                                                {timeslotsData.result.map((slot) => {
                                                    const start = combineDateAndTime(slot.date, slot.startTime);
                                                    const end = combineDateAndTime(slot.date, slot.endTime);
                                                    const isSelected = selectedTimeslotId === slot.id;

                                                    return (
                                                        <button
                                                            key={slot.id}
                                                            type="button"
                                                            disabled={!!slot.isBooked}
                                                            onClick={() => setSelectedTimeslotId(slot.id || "")}
                                                            className={cn(
                                                                "rounded-2xl border px-4 py-3 text-left transition",
                                                                slot.isBooked
                                                                    ? "cursor-not-allowed border-rose-200 bg-rose-50 text-rose-500"
                                                                    : isSelected
                                                                      ? "border-primary bg-primary/[0.08] shadow-sm"
                                                                      : "border-border hover:border-primary/40 hover:bg-accent/40"
                                                            )}
                                                        >
                                                            <div className="flex items-center justify-between gap-2">
                                                                <span className="font-medium">
                                                                    {start ? format(start, "h:mm a") : "Time"}
                                                                </span>
                                                                {slot.isBooked ? (
                                                                    <Badge className="bg-rose-600 text-white hover:bg-rose-600">
                                                                        Booked
                                                                    </Badge>
                                                                ) : isSelected ? (
                                                                    <Badge variant="secondary">Selected</Badge>
                                                                ) : null}
                                                            </div>
                                                            <p className="mt-1 text-xs text-muted-foreground">
                                                                {end
                                                                    ? `Until ${format(end, "h:mm a")}`
                                                                    : "Available slot"}
                                                            </p>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <div className="rounded-2xl border border-dashed p-4 text-sm text-muted-foreground">
                                                No timeslots are available for the selected date.
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Symptoms / Reason for Visit</Label>
                                        <Textarea
                                            value={symptoms}
                                            onChange={(event) => setSymptoms(event.target.value)}
                                            placeholder="Describe the concern, symptoms, or reason for this visit"
                                            rows={4}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Internal Notes</Label>
                                        <Textarea
                                            value={notes}
                                            onChange={(event) => setNotes(event.target.value)}
                                            placeholder="Add any scheduling or visit notes for your team"
                                            rows={4}
                                        />
                                    </div>
                                </div>

                                <Card className="border-emerald-200 bg-gradient-to-b from-emerald-50 to-white shadow-none">
                                    <CardHeader>
                                        <CardTitle className="text-base">Booking Summary</CardTitle>
                                        <CardDescription>Review the appointment before confirming it.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4 text-sm">
                                        {selectedPatient ? (
                                            <div className="flex items-center gap-3 rounded-2xl border border-emerald-100 bg-white p-3">
                                                <Avatar className="h-12 w-12 ring-2 ring-primary/10">
                                                    <AvatarImage
                                                        src={getAvatarUrl(selectedPatient.profileImageUrl)}
                                                        alt={selectedPatient.name}
                                                    />
                                                    <AvatarFallback className="bg-primary/10 text-primary">
                                                        {selectedPatient.name
                                                            .split(" ")
                                                            .map((chunk) => chunk[0])
                                                            .join("")
                                                            .slice(0, 2)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="min-w-0">
                                                    <p className="truncate font-semibold">{selectedPatient.name}</p>
                                                    <p className="truncate text-muted-foreground">
                                                        {selectedPatient.email || "No email on file"}
                                                    </p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="rounded-2xl border border-dashed p-4 text-muted-foreground">
                                                Select a patient to continue.
                                            </div>
                                        )}

                                        <div className="space-y-3 rounded-2xl border bg-white p-4">
                                            <div className="flex items-center justify-between gap-3">
                                                <span className="text-muted-foreground">Date</span>
                                                <span className="font-medium">
                                                    {appointmentDate
                                                        ? format(appointmentDate, "MMM d, yyyy")
                                                        : "Not selected"}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between gap-3">
                                                <span className="text-muted-foreground">Timeslot</span>
                                                <span className="font-medium">
                                                    {selectedTimeslotId
                                                        ? (() => {
                                                              const selectedSlot = timeslotsData?.result?.find(
                                                                  (slot) => slot.id === selectedTimeslotId
                                                              );
                                                              const start = combineDateAndTime(
                                                                  selectedSlot?.date,
                                                                  selectedSlot?.startTime
                                                              );
                                                              return start ? format(start, "h:mm a") : "Selected";
                                                          })()
                                                        : "Not selected"}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between gap-3">
                                                <span className="text-muted-foreground">Visit notes</span>
                                                <span className="font-medium">{notes.trim() ? "Added" : "None"}</span>
                                            </div>
                                            <div className="flex items-center justify-between gap-3">
                                                <span className="text-muted-foreground">Symptoms</span>
                                                <span className="font-medium">
                                                    {symptoms.trim() ? "Added" : "None"}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="rounded-2xl border border-primary/15 bg-primary/[0.04] p-4 text-muted-foreground">
                                            The appointment will be created under your own schedule, and the patient
                                            will receive a notification once it is booked.
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            <Button
                                                onClick={() => createAppointmentMutation.mutate()}
                                                disabled={!canSubmit || createAppointmentMutation.isPending}
                                            >
                                                <CalendarPlus className="mr-2 h-4 w-4" />
                                                {createAppointmentMutation.isPending
                                                    ? "Creating..."
                                                    : "Create Appointment"}
                                            </Button>
                                            <Button variant="outline" asChild>
                                                <Link to="/doctor/patients">
                                                    <Stethoscope className="mr-2 h-4 w-4" />
                                                    Manage Patients
                                                </Link>
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </CardContent>
                        </Card>

                        <Card className="border-border/60 shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-base">Quick Notes</CardTitle>
                            </CardHeader>
                            <CardContent className="grid gap-3 md:grid-cols-3">
                                <div className="rounded-2xl border bg-accent/30 p-4">
                                    <p className="font-medium">Existing patients only</p>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        This page is for scheduling current patients already in your care list.
                                    </p>
                                </div>
                                <div className="rounded-2xl border bg-accent/30 p-4">
                                    <p className="font-medium">Booked slots stay locked</p>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Timeslots already booked are shown but disabled to avoid double-booking.
                                    </p>
                                </div>
                                <div className="rounded-2xl border bg-accent/30 p-4">
                                    <p className="font-medium">Need a new patient?</p>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Use the Patients page to create a patient account and book in one flow.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}
        </div>
    );
}
