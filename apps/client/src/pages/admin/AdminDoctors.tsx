import { useState, useEffect } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { ListSkeleton } from "@/components/ui/loading-skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { mockDoctors, Doctor, DoctorSchedule } from "@/mock/doctors";
import { Search, Stethoscope, Star, Edit, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const timeSlots = Array.from({ length: 24 }, (_, i) => {
    const hour = i.toString().padStart(2, "0");
    return [`${hour}:00`, `${hour}:30`];
}).flat();

export default function AdminDoctors() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
    const [editingSchedule, setEditingSchedule] = useState<DoctorSchedule[]>([]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDoctors(mockDoctors);
            setLoading(false);
        }, 400);
        return () => clearTimeout(timer);
    }, []);

    const filteredDoctors = doctors.filter(
        (doc) =>
            doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            doc.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
            doc.department.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const openScheduleEditor = (doctor: Doctor) => {
        setSelectedDoctor(doctor);
        // Initialize schedule for all days
        const fullSchedule = daysOfWeek.map((day) => {
            const existing = doctor.schedule.find((s) => s.day === day);
            return existing || { day, startTime: "09:00", endTime: "17:00", slotDuration: 30 };
        });
        setEditingSchedule(fullSchedule);
    };

    const updateScheduleDay = (day: string, field: keyof DoctorSchedule, value: string | number) => {
        setEditingSchedule((prev) => prev.map((s) => (s.day === day ? { ...s, [field]: value } : s)));
    };

    const toggleDayEnabled = (day: string, enabled: boolean) => {
        if (enabled) {
            setEditingSchedule((prev) => {
                if (prev.some((s) => s.day === day)) return prev;
                return [...prev, { day, startTime: "09:00", endTime: "17:00", slotDuration: 30 }];
            });
        } else {
            setEditingSchedule((prev) => prev.filter((s) => s.day !== day));
        }
    };

    const saveSchedule = async () => {
        if (!selectedDoctor) return;

        setSaving(true);
        await new Promise((resolve) => setTimeout(resolve, 500));

        setDoctors((prev) =>
            prev.map((doc) =>
                doc.id === selectedDoctor.id
                    ? {
                          ...doc,
                          schedule: editingSchedule.filter((s) => editingSchedule.some((es) => es.day === s.day))
                      }
                    : doc
            )
        );

        toast.success("Schedule updated successfully");
        setSaving(false);
        setSelectedDoctor(null);
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <PageHeader title="Doctor Management" />
                <ListSkeleton items={4} />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader title="Doctor Management" description="Manage doctor profiles and schedules" />

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
                                                .split(" ")
                                                .slice(1)
                                                .map((n) => n[0])
                                                .join("")}
                                        </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-medium truncate">{doctor.name}</h3>
                                        <p className="text-sm text-muted-foreground">{doctor.specialty}</p>
                                        <p className="text-xs text-muted-foreground">{doctor.department}</p>
                                        <div className="flex items-center gap-2 mt-2">
                                            <Star className="h-4 w-4 text-status-warning fill-status-warning" />
                                            <span className="text-sm">{doctor.rating}</span>
                                            <span className="text-xs text-muted-foreground">
                                                ({doctor.reviewCount} reviews)
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 pt-4 border-t">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium">Schedule</span>
                                        <Button variant="ghost" size="sm" onClick={() => openScheduleEditor(doctor)}>
                                            <Edit className="h-4 w-4 mr-1" />
                                            Edit
                                        </Button>
                                    </div>
                                    <div className="flex flex-wrap gap-1">
                                        {doctor.schedule.map((s) => (
                                            <span key={s.day} className="px-2 py-0.5 bg-accent rounded text-xs">
                                                {s.day.slice(0, 3)}
                                            </span>
                                        ))}
                                        {doctor.schedule.length === 0 && (
                                            <span className="text-xs text-muted-foreground">No schedule set</span>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Schedule Editor Dialog */}
            <Dialog open={!!selectedDoctor} onOpenChange={() => setSelectedDoctor(null)}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Edit Schedule</DialogTitle>
                        <DialogDescription>{selectedDoctor?.name}</DialogDescription>
                    </DialogHeader>
                    <ScrollArea className="max-h-[60vh]">
                        <div className="space-y-4">
                            {daysOfWeek.map((day) => {
                                const schedule = editingSchedule.find((s) => s.day === day);
                                const isEnabled = !!schedule;

                                return (
                                    <div key={day} className="flex items-center gap-4 p-3 border rounded-lg">
                                        <div className="flex items-center gap-2 w-28">
                                            <Checkbox
                                                id={day}
                                                checked={isEnabled}
                                                onCheckedChange={(checked) => toggleDayEnabled(day, !!checked)}
                                            />
                                            <label htmlFor={day} className="text-sm font-medium cursor-pointer">
                                                {day}
                                            </label>
                                        </div>

                                        {isEnabled && schedule && (
                                            <>
                                                <div className="flex items-center gap-2">
                                                    <Label className="text-xs text-muted-foreground">From</Label>
                                                    <Select
                                                        value={schedule.startTime}
                                                        onValueChange={(v) => updateScheduleDay(day, "startTime", v)}
                                                    >
                                                        <SelectTrigger className="w-24 h-8">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent className="bg-popover max-h-48">
                                                            {timeSlots.map((time) => (
                                                                <SelectItem key={time} value={time}>
                                                                    {time}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <Label className="text-xs text-muted-foreground">To</Label>
                                                    <Select
                                                        value={schedule.endTime}
                                                        onValueChange={(v) => updateScheduleDay(day, "endTime", v)}
                                                    >
                                                        <SelectTrigger className="w-24 h-8">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent className="bg-popover max-h-48">
                                                            {timeSlots.map((time) => (
                                                                <SelectItem key={time} value={time}>
                                                                    {time}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <Label className="text-xs text-muted-foreground">Slot</Label>
                                                    <Select
                                                        value={schedule.slotDuration.toString()}
                                                        onValueChange={(v) =>
                                                            updateScheduleDay(day, "slotDuration", parseInt(v))
                                                        }
                                                    >
                                                        <SelectTrigger className="w-20 h-8">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent className="bg-popover">
                                                            <SelectItem value="15">15 min</SelectItem>
                                                            <SelectItem value="20">20 min</SelectItem>
                                                            <SelectItem value="30">30 min</SelectItem>
                                                            <SelectItem value="45">45 min</SelectItem>
                                                            <SelectItem value="60">60 min</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </>
                                        )}

                                        {!isEnabled && (
                                            <span className="text-sm text-muted-foreground">Not available</span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </ScrollArea>

                    <div className="flex justify-end gap-2 pt-4 border-t">
                        <Button variant="outline" onClick={() => setSelectedDoctor(null)}>
                            Cancel
                        </Button>
                        <Button onClick={saveSchedule} disabled={saving}>
                            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            <Save className="h-4 w-4 mr-2" />
                            Save Schedule
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
