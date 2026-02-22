import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { AppointmentService, DoctorService } from "@mediflow/mediflow-api";
import { PageHeader } from "@/components/ui/page-header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ListSkeleton } from "@/components/ui/loading-skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Search, User, Calendar, FileText } from "lucide-react";
import { format } from "date-fns";
import { combineDateAndTime } from "@/lib/datetime";

interface PatientSummary {
    id: string;
    name: string;
    lastVisit?: Date;
    totalVisits: number;
}

export default function DoctorPatients() {
    const [searchQuery, setSearchQuery] = useState("");

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

    const patients = useMemo<PatientSummary[]>(() => {
        const list = new Map<string, PatientSummary>();
        (appointmentsData?.result ?? []).forEach((apt) => {
            const patient = apt.patient;
            if (!patient?.id) return;
            const visitDate = combineDateAndTime(apt.timeslot?.date, apt.timeslot?.startTime);
            const existing = list.get(patient.id);
            if (!existing) {
                list.set(patient.id, {
                    id: patient.id,
                    name: patient.name || "Patient",
                    lastVisit: visitDate || undefined,
                    totalVisits: 1
                });
            } else {
                existing.totalVisits += 1;
                if (visitDate && (!existing.lastVisit || visitDate > existing.lastVisit)) {
                    existing.lastVisit = visitDate;
                }
            }
        });
        return Array.from(list.values());
    }, [appointmentsData]);

    const filteredPatients = patients.filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

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
            <PageHeader title="Patients" description="View and manage your patients" />

            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search patients..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                />
            </div>

            {filteredPatients.length === 0 ? (
                <EmptyState
                    icon={User}
                    title="No patients found"
                    description={searchQuery ? "Try a different search term" : "No patient records yet"}
                />
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredPatients.map((patient) => (
                        <Card key={patient.id} className="card-interactive">
                            <CardContent className="p-4">
                                <div className="flex items-start gap-4">
                                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                        <span className="font-medium text-primary">
                                            {patient.name
                                                .split(" ")
                                                .map((n) => n[0])
                                                .join("")}
                                        </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-medium truncate">{patient.name}</h3>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                            <Calendar className="h-3 w-3" />
                                            <span>
                                                Last:{" "}
                                                {patient.lastVisit ? format(patient.lastVisit, "MMM d, yyyy") : "N/A"}
                                            </span>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            {patient.totalVisits} visit{patient.totalVisits !== 1 ? "s" : ""}
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-4 flex gap-2">
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
        </div>
    );
}
