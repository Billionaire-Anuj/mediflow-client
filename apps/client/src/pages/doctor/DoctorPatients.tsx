import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AppointmentService, AppointmentStatus, DoctorService, Gender } from "@mediflow/mediflow-api";
import { PageHeader } from "@/components/ui/page-header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ListSkeleton } from "@/components/ui/loading-skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import { Search, User, Calendar, FileText, Users, CalendarCheck, Clock, UserPlus, CalendarPlus } from "lucide-react";
import { format } from "date-fns";
import { combineDateAndTime } from "@/lib/datetime";
import { getAvatarUrl } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { getErrorMessage, getResponseMessage } from "@/lib/api";

interface PatientSummary {
    id: string;
    name: string;
    lastVisit?: Date;
    nextVisit?: Date;
    totalVisits: number;
    email?: string;
    phone?: string;
    profileImageUrl?: string | null;
}

export default function DoctorPatients() {
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState<"recent" | "visits" | "name">("recent");
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [appointmentDate, setAppointmentDate] = useState<Date | undefined>(new Date());
    const [selectedTimeslotId, setSelectedTimeslotId] = useState("");
    const [appointmentNotes, setAppointmentNotes] = useState("");
    const [appointmentSymptoms, setAppointmentSymptoms] = useState("");
    const [patientForm, setPatientForm] = useState({
        name: "",
        username: "",
        emailAddress: "",
        phoneNumber: "",
        address: "",
        gender: Gender.MALE
    });
    const queryClient = useQueryClient();

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
        enabled: createDialogOpen && !!selectedDateString,
        queryFn: async () =>
            DoctorService.getDoctorTimeslots({
                startDate: selectedDateString,
                endDate: selectedDateString
            })
    });

    const timeslots = timeslotsData?.result ?? [];

    useEffect(() => {
        setSelectedTimeslotId("");
    }, [selectedDateString]);

    useEffect(() => {
        if (!createDialogOpen) {
            setAppointmentDate(new Date());
            setSelectedTimeslotId("");
            setAppointmentNotes("");
            setAppointmentSymptoms("");
            setPatientForm({
                name: "",
                username: "",
                emailAddress: "",
                phoneNumber: "",
                address: "",
                gender: Gender.MALE
            });
        }
    }, [createDialogOpen]);

    const createPatientMutation = useMutation({
        mutationFn: async () => {
            const response = await DoctorService.registerPatientByDoctor({
                formData: {
                    Name: patientForm.name.trim(),
                    Username: patientForm.username.trim(),
                    EmailAddress: patientForm.emailAddress.trim(),
                    PhoneNumber: patientForm.phoneNumber.trim(),
                    Address: patientForm.address.trim() || undefined,
                    Gender: patientForm.gender
                }
            });

            const patientId = response.result;
            if (!patientId) {
                throw new Error("Patient identifier could not be retrieved.");
            }

            const appointmentResponse = await AppointmentService.bookAppointmentByDoctor({
                requestBody: {
                    patientId,
                    timeslotId: selectedTimeslotId,
                    notes: appointmentNotes.trim() || null,
                    symptoms: appointmentSymptoms.trim() || null
                }
            });

            return { patientResponse: response, appointmentResponse };
        },
        onSuccess: ({ patientResponse, appointmentResponse }) => {
            toast.success(getResponseMessage(patientResponse));
            toast.success(getResponseMessage(appointmentResponse));
            queryClient.invalidateQueries({ queryKey: ["doctor-appointments", doctorId] });
            queryClient.invalidateQueries({ queryKey: ["doctor-appointments"] });
            setCreateDialogOpen(false);
        },
        onError: (error) => toast.error(getErrorMessage(error))
    });

    const canSubmit =
        !!patientForm.name.trim() &&
        !!patientForm.username.trim() &&
        !!patientForm.emailAddress.trim() &&
        !!patientForm.phoneNumber.trim() &&
        !!selectedTimeslotId;

    const handleCreatePatient = () => {
        if (canSubmit) {
            createPatientMutation.mutate();
        }
    };

    const patients = useMemo<PatientSummary[]>(() => {
        const list = new Map<string, PatientSummary>();
        const now = new Date();
        (appointmentsData?.result ?? []).forEach((apt) => {
            const patient = apt.patient;
            if (!patient?.id) return;
            const visitDate = combineDateAndTime(apt.timeslot?.date, apt.timeslot?.startTime);
            const isUpcoming =
                visitDate && visitDate > now && apt.status === AppointmentStatus.SCHEDULED ? visitDate : undefined;
            const existing = list.get(patient.id);
            if (!existing) {
                list.set(patient.id, {
                    id: patient.id,
                    name: patient.name || "Patient",
                    lastVisit: visitDate || undefined,
                    nextVisit: isUpcoming,
                    totalVisits: 1,
                    email: patient.emailAddress || undefined,
                    phone: patient.phoneNumber || undefined,
                    profileImageUrl: patient.profileImage?.fileUrl
                });
            } else {
                existing.totalVisits += 1;
                if (visitDate && (!existing.lastVisit || visitDate > existing.lastVisit)) {
                    existing.lastVisit = visitDate;
                }
                if (isUpcoming && (!existing.nextVisit || isUpcoming < existing.nextVisit)) {
                    existing.nextVisit = isUpcoming;
                }
                if (!existing.profileImageUrl && patient.profileImage?.fileUrl) {
                    existing.profileImageUrl = patient.profileImage.fileUrl;
                }
            }
        });
        return Array.from(list.values());
    }, [appointmentsData]);

    const filteredPatients = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        const filtered = query
            ? patients.filter((p) => {
                  const name = p.name.toLowerCase();
                  const email = p.email?.toLowerCase() || "";
                  const phone = p.phone?.toLowerCase() || "";
                  return name.includes(query) || email.includes(query) || phone.includes(query);
              })
            : patients;

        const sorted = [...filtered];
        if (sortBy === "visits") {
            sorted.sort((a, b) => b.totalVisits - a.totalVisits);
        } else if (sortBy === "name") {
            sorted.sort((a, b) => a.name.localeCompare(b.name));
        } else {
            sorted.sort((a, b) => {
                const aDate = a.lastVisit?.getTime() || 0;
                const bDate = b.lastVisit?.getTime() || 0;
                return bDate - aDate;
            });
        }
        return sorted;
    }, [patients, searchQuery, sortBy]);

    const stats = useMemo(() => {
        const totalVisits = patients.reduce((sum, patient) => sum + patient.totalVisits, 0);
        const upcoming = patients.filter((patient) => patient.nextVisit).length;
        const recentVisit = patients
            .map((patient) => patient.lastVisit?.getTime() || 0)
            .reduce((max, value) => Math.max(max, value), 0);
        return {
            totalPatients: patients.length,
            totalVisits,
            upcoming,
            recentVisit: recentVisit ? new Date(recentVisit) : null
        };
    }, [patients]);

    if (isLoading) {
        return (
            <div className="space-y-6">
                <PageHeader title="Patients" />
                <ListSkeleton items={4} />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <PageHeader title="Patients" description="View and manage your patients" />
                <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
                    <UserPlus className="h-4 w-4" />
                    Add Patient & Appointment
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card className="bg-primary/5 border-primary/20">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-xs uppercase tracking-wide text-muted-foreground">Patients</p>
                            <p className="text-2xl font-semibold">{stats.totalPatients}</p>
                        </div>
                        <Users className="h-5 w-5 text-primary" />
                    </CardContent>
                </Card>
                <Card className="bg-emerald-50/60 border-emerald-200">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-xs uppercase tracking-wide text-muted-foreground">Total Visits</p>
                            <p className="text-2xl font-semibold">{stats.totalVisits}</p>
                        </div>
                        <CalendarCheck className="h-5 w-5 text-emerald-600" />
                    </CardContent>
                </Card>
                <Card className="bg-amber-50/70 border-amber-200">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-xs uppercase tracking-wide text-muted-foreground">Upcoming</p>
                            <p className="text-2xl font-semibold">{stats.upcoming}</p>
                        </div>
                        <Clock className="h-5 w-5 text-amber-600" />
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardContent className="p-4 space-y-4">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        <div className="relative w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search patients by name, email, or phone"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
                            <Select value={sortBy} onValueChange={(value) => setSortBy(value as typeof sortBy)}>
                                <SelectTrigger className="w-full sm:w-[190px]">
                                    <SelectValue placeholder="Sort by" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="recent">Recent visit</SelectItem>
                                    <SelectItem value="visits">Most visits</SelectItem>
                                    <SelectItem value="name">Patient name</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                        {filteredPatients.length} patient{filteredPatients.length !== 1 ? "s" : ""} shown
                        {stats.recentVisit && (
                            <span className="ml-2">• Latest visit {format(stats.recentVisit, "MMM d, yyyy")}</span>
                        )}
                    </div>
                </CardContent>
            </Card>

            {filteredPatients.length === 0 ? (
                <EmptyState
                    icon={User}
                    title="No patients found"
                    description={searchQuery ? "Try a different search term" : "No patient records yet"}
                />
            ) : (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {filteredPatients.map((patient) => (
                        <Card key={patient.id} className="card-interactive">
                            <CardContent className="p-5 space-y-4">
                                <div className="flex items-start gap-4">
                                    <Avatar className="h-12 w-12 ring-2 ring-primary/10">
                                        <AvatarImage src={getAvatarUrl(patient.profileImageUrl)} alt={patient.name} />
                                        <AvatarFallback className="bg-primary/10 text-primary font-medium">
                                            {patient.name
                                                .split(" ")
                                                .map((n) => n[0])
                                                .join("")
                                                .slice(0, 2)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0 space-y-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h3 className="font-semibold truncate">{patient.name}</h3>
                                            {patient.nextVisit && (
                                                <Badge className="bg-emerald-600 text-white hover:bg-emerald-600">
                                                    Upcoming
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            {patient.email || "No email on file"}
                                        </p>
                                        {patient.phone && (
                                            <p className="text-sm text-muted-foreground">{patient.phone}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="grid gap-2 text-sm text-muted-foreground">
                                    <div className="flex items-center justify-between">
                                        <span className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4" />
                                            Last Visit
                                        </span>
                                        <span>
                                            {patient.lastVisit ? format(patient.lastVisit, "MMM d, yyyy") : "N/A"}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4" />
                                            Next Visit
                                        </span>
                                        <span>
                                            {patient.nextVisit ? format(patient.nextVisit, "MMM d, yyyy") : "N/A"}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="flex items-center gap-2">
                                            <FileText className="h-4 w-4" />
                                            Total Visits
                                        </span>
                                        <span>{patient.totalVisits}</span>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button size="sm" className="flex-1" asChild>
                                        <Link to={`/doctor/appointments/create?patientId=${patient.id}`}>
                                            <CalendarPlus className="mr-1 h-4 w-4" />
                                            Book Appointment
                                        </Link>
                                    </Button>
                                    <Button variant="outline" size="sm" className="flex-1" asChild>
                                        <Link to={`/doctor/patient/${patient.id}`}>
                                            <FileText className="h-4 w-4 mr-1" />
                                            View Records
                                        </Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogContent className="max-w-4xl">
                    <DialogHeader>
                        <DialogTitle>New Patient & Appointment</DialogTitle>
                        <DialogDescription>
                            Create a patient profile and book their appointment with you.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
                        <Card className="border-border/60 shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-base">Patient Details</CardTitle>
                            </CardHeader>
                            <CardContent className="grid gap-4">
                                <div className="grid gap-3 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label>Name *</Label>
                                        <Input
                                            placeholder="Full name"
                                            value={patientForm.name}
                                            onChange={(event) =>
                                                setPatientForm((prev) => ({ ...prev, name: event.target.value }))
                                            }
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Username *</Label>
                                        <Input
                                            placeholder="Unique username"
                                            value={patientForm.username}
                                            onChange={(event) =>
                                                setPatientForm((prev) => ({ ...prev, username: event.target.value }))
                                            }
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Email *</Label>
                                        <Input
                                            placeholder="patient@email.com"
                                            type="email"
                                            value={patientForm.emailAddress}
                                            onChange={(event) =>
                                                setPatientForm((prev) => ({
                                                    ...prev,
                                                    emailAddress: event.target.value
                                                }))
                                            }
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Phone *</Label>
                                        <Input
                                            placeholder="98XXXXXXXX"
                                            value={patientForm.phoneNumber}
                                            onChange={(event) =>
                                                setPatientForm((prev) => ({ ...prev, phoneNumber: event.target.value }))
                                            }
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Gender</Label>
                                        <Select
                                            value={patientForm.gender}
                                            onValueChange={(value) =>
                                                setPatientForm((prev) => ({ ...prev, gender: value as Gender }))
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select gender" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value={Gender.MALE}>Male</SelectItem>
                                                <SelectItem value={Gender.FEMALE}>Female</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Address</Label>
                                        <Input
                                            placeholder="City, street, ward"
                                            value={patientForm.address}
                                            onChange={(event) =>
                                                setPatientForm((prev) => ({ ...prev, address: event.target.value }))
                                            }
                                        />
                                    </div>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Credentials will be emailed to the patient after creation.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="border-border/60 shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-base">Appointment Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Date *</Label>
                                    <DatePicker
                                        value={appointmentDate}
                                        onChange={(date) => setAppointmentDate(date as Date)}
                                        placeholder="Select appointment date"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Timeslot *</Label>
                                    {timeslotsLoading ? (
                                        <p className="text-sm text-muted-foreground">Loading timeslots...</p>
                                    ) : timeslots.length === 0 ? (
                                        <p className="text-sm text-muted-foreground">
                                            No timeslots available for the selected date.
                                        </p>
                                    ) : (
                                        <div className="grid gap-2 sm:grid-cols-2">
                                            {timeslots.map((slot) => {
                                                const start = combineDateAndTime(slot.date, slot.startTime);
                                                const end = combineDateAndTime(slot.date, slot.endTime);
                                                const isSelected = selectedTimeslotId === slot.id;
                                                const isBooked = !!slot.isBooked;
                                                return (
                                                    <button
                                                        key={slot.id}
                                                        type="button"
                                                        disabled={isBooked}
                                                        onClick={() => setSelectedTimeslotId(slot.id || "")}
                                                        className={cn(
                                                            "flex items-center justify-between rounded-lg border px-3 py-2 text-sm transition",
                                                            isBooked
                                                                ? "border-rose-200 bg-rose-50 text-rose-500 cursor-not-allowed"
                                                                : isSelected
                                                                  ? "border-primary bg-primary/10 text-primary"
                                                                  : "border-border hover:border-primary/50"
                                                        )}
                                                    >
                                                        <span>{start ? format(start, "h:mm a") : "Time"}</span>
                                                        <span className="text-xs text-muted-foreground">
                                                            {end ? format(end, "h:mm a") : ""}
                                                        </span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label>Symptoms</Label>
                                    <Textarea
                                        placeholder="Describe symptoms for the visit"
                                        value={appointmentSymptoms}
                                        onChange={(event) => setAppointmentSymptoms(event.target.value)}
                                        rows={3}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Notes</Label>
                                    <Textarea
                                        placeholder="Add any notes for the appointment"
                                        value={appointmentNotes}
                                        onChange={(event) => setAppointmentNotes(event.target.value)}
                                        rows={3}
                                    />
                                </div>
                                {!canSubmit && (
                                    <p className="text-xs text-muted-foreground">
                                        Complete required fields and select a timeslot to continue.
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleCreatePatient} disabled={!canSubmit || createPatientMutation.isPending}>
                            {createPatientMutation.isPending ? (
                                "Creating..."
                            ) : (
                                <>
                                    <CalendarPlus className="h-4 w-4 mr-2" />
                                    Create & Book
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
