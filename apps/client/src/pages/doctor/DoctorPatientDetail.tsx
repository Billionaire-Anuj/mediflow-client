import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge, getStatusVariant } from "@/components/ui/status-badge";
import { CardSkeleton } from "@/components/ui/loading-skeleton";
import { mockAppointments } from "@/mock/appointments";
import { mockEncounters } from "@/mock/encounters";
import { mockPrescriptions } from "@/mock/prescriptions";
import { mockLabRequests } from "@/mock/labRequests";
import { ArrowLeft, User, FileText, Pill, FlaskConical, Calendar } from "lucide-react";
import { format } from "date-fns";

export default function DoctorPatientDetail() {
    const { id } = useParams<{ id: string }>();
    const [loading, setLoading] = useState(true);
    const [patient, setPatient] = useState<{ id: string; name: string } | null>(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            const apt = mockAppointments.find((a) => a.patientId === id);
            if (apt) {
                setPatient({ id: apt.patientId, name: apt.patientName });
            }
            setLoading(false);
        }, 400);
        return () => clearTimeout(timer);
    }, [id]);

    const encounters = mockEncounters.filter((e) => e.patientId === id);
    const prescriptions = mockPrescriptions.filter((p) => p.patientId === id);
    const labRequests = mockLabRequests.filter((l) => l.patientId === id);

    if (loading) {
        return (
            <div className="space-y-6">
                <PageHeader title="Patient Details" />
                <CardSkeleton />
            </div>
        );
    }

    if (!patient) {
        return (
            <div className="space-y-6">
                <PageHeader title="Patient Not Found" />
                <Button asChild>
                    <Link to="/doctor/patients">Back to Patients</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link to="/doctor/patients">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                </Button>
                <PageHeader title={patient.name} />
            </div>

            {/* Patient Summary */}
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

            {/* Tabs */}
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
                        Labs ({labRequests.length})
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="encounters" className="space-y-4">
                    {encounters.map((enc) => (
                        <Card key={enc.id}>
                            <CardContent className="p-4">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                                            <Calendar className="h-4 w-4" />
                                            {format(new Date(enc.dateTime), "MMM d, yyyy")}
                                        </div>
                                        <h3 className="font-medium">{enc.diagnosis}</h3>
                                        <p className="text-sm text-muted-foreground mt-1">{enc.notes}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </TabsContent>

                <TabsContent value="prescriptions" className="space-y-4">
                    {prescriptions.map((rx) => (
                        <Card key={rx.id}>
                            <CardContent className="p-4">
                                <div className="flex items-start justify-between mb-2">
                                    <span className="text-sm text-muted-foreground">
                                        {format(new Date(rx.createdAt), "MMM d, yyyy")}
                                    </span>
                                    <StatusBadge variant={getStatusVariant(rx.status)}>{rx.status}</StatusBadge>
                                </div>
                                <div className="space-y-2">
                                    {rx.items.map((item) => (
                                        <div key={item.id} className="p-2 bg-accent/50 rounded">
                                            <p className="font-medium">
                                                {item.medicineName} {item.dosage}
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
                    {labRequests.map((lab) => (
                        <Card key={lab.id}>
                            <CardContent className="p-4">
                                <div className="flex items-start justify-between mb-2">
                                    <span className="text-sm text-muted-foreground">
                                        {format(new Date(lab.createdAt), "MMM d, yyyy")}
                                    </span>
                                    <StatusBadge variant={getStatusVariant(lab.status)}>{lab.status}</StatusBadge>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {lab.tests.map((test) => (
                                        <span key={test.id} className="px-2 py-1 bg-accent rounded text-sm">
                                            {test.name}
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
