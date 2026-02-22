import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DoctorService } from "@mediflow/mediflow-api";
import { PageHeader } from "@/components/ui/page-header";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ListSkeleton } from "@/components/ui/loading-skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Search, Stethoscope, Star } from "lucide-react";

export default function AdminDoctors() {
    const [searchQuery, setSearchQuery] = useState("");

    const { data, isLoading } = useQuery({
        queryKey: ["admin-doctors"],
        queryFn: async () => DoctorService.getAllDoctorProfilesList({})
    });

    const doctors = useMemo(() => data?.result ?? [], [data]);

    const filteredDoctors = doctors.filter((doc) => {
        const name = doc.name?.toLowerCase() || "";
        const spec = (doc.specializations || [])
            .map((s) => s.title?.toLowerCase() || "")
            .join(" ");
        return name.includes(searchQuery.toLowerCase()) || spec.includes(searchQuery.toLowerCase());
    });

    if (isLoading) {
        return (
            <div className="space-y-6">
                <PageHeader title="Doctor Management" />
                <ListSkeleton items={4} />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader title="Doctor Management" description="View doctor profiles and schedules" />

            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search doctors..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                />
            </div>

            {filteredDoctors.length === 0 ? (
                <EmptyState icon={Stethoscope} title="No doctors found" />
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredDoctors.map((doctor) => (
                        <Card key={doctor.id} className="card-interactive">
                            <CardContent className="p-4">
                                <div className="flex items-start gap-4">
                                    <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                        <span className="font-semibold text-primary">
                                            {doctor.name
                                                ?.split(" ")
                                                .slice(0, 2)
                                                .map((n) => n[0])
                                                .join("") || "D"}
                                        </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-medium truncate">{doctor.name}</h3>
                                        <p className="text-sm text-muted-foreground">
                                            {(doctor.specializations || [])
                                                .map((spec) => spec.title)
                                                .filter(Boolean)
                                                .join(", ") || "General Practitioner"}
                                        </p>
                                        <p className="text-xs text-muted-foreground">{doctor.emailAddress}</p>
                                        <div className="flex items-center gap-2 mt-2">
                                            <Star className="h-4 w-4 text-status-warning fill-status-warning" />
                                            <span className="text-sm">{doctor.consultationFee ?? "N/A"}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 pt-4 border-t">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium">Schedule</span>
                                    </div>
                                    <div className="flex flex-wrap gap-1">
                                        {doctor.schedules?.map((s) => (
                                            <span key={s.id || s.dayOfWeek} className="px-2 py-0.5 bg-accent rounded text-xs">
                                                {s.dayOfWeek?.slice(0, 3)}
                                            </span>
                                        ))}
                                        {!doctor.schedules?.length && (
                                            <span className="text-xs text-muted-foreground">No schedule set</span>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
