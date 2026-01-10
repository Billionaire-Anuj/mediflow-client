import { useState, useEffect } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge, getStatusVariant } from "@/components/ui/status-badge";
import { ListSkeleton } from "@/components/ui/loading-skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { mockDoctors, departments, Doctor } from "@/mock/doctors";
import { Search, Star, Clock, Calendar } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export default function PatientDoctors() {
    const [loading, setLoading] = useState(true);
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
    const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
    const [bookingDoctor, setBookingDoctor] = useState<Doctor | null>(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDoctors(mockDoctors);
            setLoading(false);
        }, 400);
        return () => clearTimeout(timer);
    }, []);

    const filteredDoctors = doctors.filter((doc) => {
        const matchesSearch =
            doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            doc.specialty.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesDept = selectedDepartment === "all" || doc.department === selectedDepartment;
        return matchesSearch && matchesDept;
    });

    const handleBookAppointment = (doctor: Doctor) => {
        toast.success(`Appointment request sent to ${doctor.name}`, {
            description: "You will receive a confirmation shortly."
        });
        setBookingDoctor(null);
    };

    if (loading) {
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

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by name or specialty..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                    <SelectTrigger className="w-full sm:w-[200px]">
                        <SelectValue placeholder="All Departments" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover">
                        <SelectItem value="all">All Departments</SelectItem>
                        {departments.map((dept) => (
                            <SelectItem key={dept} value={dept}>
                                {dept}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Doctor List */}
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
                                                .split(" ")
                                                .slice(1)
                                                .map((n) => n[0])
                                                .join("")}
                                        </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <h3 className="font-semibold text-foreground">{doctor.name}</h3>
                                                <p className="text-sm text-muted-foreground">{doctor.specialty}</p>
                                            </div>
                                            <StatusBadge variant={getStatusVariant(doctor.status)}>
                                                {doctor.status}
                                            </StatusBadge>
                                        </div>

                                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <Star className="h-4 w-4 text-status-warning fill-status-warning" />
                                                {doctor.rating} ({doctor.reviewCount})
                                            </span>
                                            <span>{doctor.experience} yrs exp</span>
                                        </div>

                                        {doctor.nextAvailable && (
                                            <div className="flex items-center gap-1 mt-2 text-sm">
                                                <Clock className="h-4 w-4 text-muted-foreground" />
                                                <span className="text-muted-foreground">Next: </span>
                                                <span className="text-foreground font-medium">
                                                    {format(new Date(doctor.nextAvailable), "MMM d, h:mm a")}
                                                </span>
                                            </div>
                                        )}

                                        <div className="flex gap-2 mt-4">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setSelectedDoctor(doctor)}
                                            >
                                                View Profile
                                            </Button>
                                            <Button
                                                size="sm"
                                                onClick={() => setBookingDoctor(doctor)}
                                                disabled={doctor.status === "offline"}
                                            >
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

            {/* Doctor Profile Dialog */}
            <Dialog open={!!selectedDoctor} onOpenChange={() => setSelectedDoctor(null)}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{selectedDoctor?.name}</DialogTitle>
                        <DialogDescription>{selectedDoctor?.specialty}</DialogDescription>
                    </DialogHeader>
                    {selectedDoctor && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                                    <span className="text-2xl font-semibold text-primary">
                                        {selectedDoctor.name
                                            .split(" ")
                                            .slice(1)
                                            .map((n) => n[0])
                                            .join("")}
                                    </span>
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <Star className="h-4 w-4 text-status-warning fill-status-warning" />
                                        <span className="font-medium">{selectedDoctor.rating}</span>
                                        <span className="text-muted-foreground">
                                            ({selectedDoctor.reviewCount} reviews)
                                        </span>
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-1">{selectedDoctor.department}</p>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-medium mb-1">About</h4>
                                <p className="text-sm text-muted-foreground">{selectedDoctor.bio}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h4 className="font-medium mb-1">Education</h4>
                                    <p className="text-sm text-muted-foreground">{selectedDoctor.education}</p>
                                </div>
                                <div>
                                    <h4 className="font-medium mb-1">Experience</h4>
                                    <p className="text-sm text-muted-foreground">{selectedDoctor.experience} years</p>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-medium mb-2">Schedule</h4>
                                <div className="flex flex-wrap gap-2">
                                    {selectedDoctor.schedule.map((s) => (
                                        <span key={s.day} className="px-2 py-1 bg-accent rounded text-xs">
                                            {s.day}: {s.startTime} - {s.endTime}
                                        </span>
                                    ))}
                                </div>
                            </div>

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
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Booking Dialog */}
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
                                <p className="text-sm text-muted-foreground">{bookingDoctor.specialty}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium">Date</label>
                                    <Input type="date" className="mt-1" />
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Time</label>
                                    <Select>
                                        <SelectTrigger className="mt-1">
                                            <SelectValue placeholder="Select time" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-popover">
                                            <SelectItem value="09:00">9:00 AM</SelectItem>
                                            <SelectItem value="09:30">9:30 AM</SelectItem>
                                            <SelectItem value="10:00">10:00 AM</SelectItem>
                                            <SelectItem value="10:30">10:30 AM</SelectItem>
                                            <SelectItem value="11:00">11:00 AM</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium">Reason for visit</label>
                                <Input className="mt-1" placeholder="Brief description..." />
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={() => setBookingDoctor(null)}>
                                    Cancel
                                </Button>
                                <Button onClick={() => handleBookAppointment(bookingDoctor)}>Confirm Booking</Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
