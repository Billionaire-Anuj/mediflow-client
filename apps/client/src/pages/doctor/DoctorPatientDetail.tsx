import { useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
    AppointmentService,
    PatientService,
    type AppointmentDto,
    type AppointmentDiagnosticsDto,
    type AppointmentMedicationsDto
} from "@mediflow/mediflow-api";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge, getStatusVariant } from "@/components/ui/status-badge";
import { CardSkeleton } from "@/components/ui/loading-skeleton";
import { ArrowLeft, User, FileText, Pill, FlaskConical, Calendar } from "lucide-react";
import { format } from "date-fns";
import { combineDateAndTime } from "@/lib/datetime";

interface PrescriptionSummary {
    appointment: AppointmentDto;
    medication: AppointmentMedicationsDto;
}

interface LabSummary {
    appointment: AppointmentDto;
    diagnostics: AppointmentDiagnosticsDto;
}

export default function DoctorPatientDetail() {
    const { id } = useParams<{ id: string }>();

    const { data: patientProfile, isLoading: patientLoading } = useQuery({
        queryKey: ["patient-profile", id],
        enabled: !!id,
        queryFn: async () => PatientService.getPatientProfileById({ patientId: id! })
    });

    const { data: appointmentsData, isLoading: appointmentsLoading } = useQuery({
        queryKey: ["patient-appointments", id],
        enabled: !!id,
        queryFn: async () => AppointmentService.getAllAppointmentsList({ patientId: id })
    });

    const appointments = appointmentsData?.result ?? [];

    const encounters = appointments.filter((apt) => apt.medicalRecords);

    const prescriptions = useMemo<PrescriptionSummary[]>(() => {
        const list: PrescriptionSummary[] = [];
        appointments.forEach((apt) => {
            (apt.medications || []).forEach((med) => list.push({ appointment: apt, medication: med }));
        });
        return list;
    }, [appointments]);

    const labs = useMemo<LabSummary[]>(() => {
        const list: LabSummary[] = [];
        appointments.forEach((apt) => {
            (apt.diagnostics || []).forEach((diag) => list.push({ appointment: apt, diagnostics: diag }));
        });
        return list;
    }, [appointments]);

    if (patientLoading || appointmentsLoading) {
        return (
            <div className="space-y-6">
                <PageHeader title="Patient Details" />
                <CardSkeleton />
            </div>
        );
    }

    if (!patientProfile?.result) {
        return (
            <div className="space-y-6">
                <PageHeader title="Patient Not Found" />
                <Button asChild>
                    <Link to="/doctor/patients">Back to Patients</Link>
                </Button>
            </div>
        );
    }

    const patient = patientProfile.result;

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link to="/doctor/patients">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                </Button>
                <PageHeader title={patient.name || "Patient"} />
            </div>

            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-8 w-8 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold">{patient.name}</h2>
                            <p className="text-muted-foreground">Patient ID: {patient.id}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Tabs defaultValue="encounters" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="encounters" className="gap-2">
                        <FileText className="h-4 w-4" />
                        Encounters ({encounters.length})
                    </TabsTrigger>
                    <TabsTrigger value="prescriptions" className="gap-2">
                        <Pill className="h-4 w-4" />
                        Prescriptions ({prescriptions.length})
                    </TabsTrigger>
                    <TabsTrigger value="labs" className="gap-2">
                        <FlaskConical className="h-4 w-4" />
                        Labs ({labs.length})
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="encounters" className="space-y-4">
                    {encounters.map((enc) => {
                        const start = combineDateAndTime(enc.timeslot?.date, enc.timeslot?.startTime);
                        return (
                            <Card key={enc.id}>
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                                                <Calendar className="h-4 w-4" />
                                                {start ? format(start, "MMM d, yyyy") : ""}
                                            </div>
                                            <h3 className="font-medium">{enc.medicalRecords?.diagnosis}</h3>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                {enc.medicalRecords?.notes}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </TabsContent>

                <TabsContent value="prescriptions" className="space-y-4">
                    {prescriptions.map((rx) => (
                        <Card key={rx.medication.id}>
                            <CardContent className="p-4">
                                <div className="flex items-start justify-between mb-2">
                                    <span className="text-sm text-muted-foreground">
                                        {rx.appointment.bookedDate
                                            ? format(new Date(rx.appointment.bookedDate), "MMM d, yyyy")
                                            : ""}
                                    </span>
                                    <StatusBadge variant={getStatusVariant(rx.medication.status || "pending")}>
                                        {rx.medication.status}
                                    </StatusBadge>
                                </div>
                                <div className="space-y-2">
                                    {(rx.medication.drugs || []).map((item) => (
                                        <div key={item.id} className="p-2 bg-accent/50 rounded">
                                            <p className="font-medium">
                                                {item.medicine?.title} {item.dose}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {item.frequency} • {item.duration}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </TabsContent>

                <TabsContent value="labs" className="space-y-4">
                    {labs.map((lab) => (
                        <Card key={lab.diagnostics.id}>
                            <CardContent className="p-4">
                                <div className="flex items-start justify-between mb-2">
                                    <span className="text-sm text-muted-foreground">
                                        {lab.appointment.bookedDate
                                            ? format(new Date(lab.appointment.bookedDate), "MMM d, yyyy")
                                            : ""}
                                    </span>
                                    <StatusBadge variant={getStatusVariant(lab.diagnostics.status || "scheduled")}>
                                        {lab.diagnostics.status}
                                    </StatusBadge>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {(lab.diagnostics.diagnosticTests || []).map((test) => (
                                        <span key={test.id} className="px-2 py-1 bg-accent rounded text-sm">
                                            {test.diagnosticTest?.title}
                                        </span>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </TabsContent>
            </Tabs>
        </div>
    );
}
