import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DayOfWeek, DoctorService, type CreateScheduleDto, type ScheduleDto } from "@mediflow/mediflow-api";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ListSkeleton } from "@/components/ui/loading-skeleton";
import { toast } from "sonner";
import { format } from "date-fns";

const dayOptions = Object.values(DayOfWeek);

export default function DoctorSchedule() {
    const queryClient = useQueryClient();
    const [newSchedule, setNewSchedule] = useState<CreateScheduleDto>({
        dayOfWeek: DayOfWeek.MONDAY,
        startTime: "09:00",
        endTime: "17:00",
        slotDurationInMinutes: 30
    });
    const [editingSchedule, setEditingSchedule] = useState<ScheduleDto | null>(null);
    const [timeslotStart, setTimeslotStart] = useState(format(new Date(), "yyyy-MM-dd"));
    const [timeslotEnd, setTimeslotEnd] = useState(format(new Date(), "yyyy-MM-dd"));

    const { data: profileData, isLoading } = useQuery({
        queryKey: ["doctor-profile"],
        queryFn: async () => DoctorService.getDoctorProfile()
    });

    const doctorId = profileData?.result?.id || "";

    const { data: timeslotData, isFetching: timeslotLoading } = useQuery({
        queryKey: ["doctor-timeslots", doctorId, timeslotStart, timeslotEnd],
        enabled: Boolean(doctorId && timeslotStart && timeslotEnd),
        queryFn: async () =>
            DoctorService.getDoctorTimeslots({
                startDate: timeslotStart,
                endDate: timeslotEnd
            })
    });

    const schedules = profileData?.result?.schedules ?? [];
    const timeslots = timeslotData?.result ?? [];

    const createMutation = useMutation({
        mutationFn: async () => DoctorService.createDoctorSchedule({ requestBody: newSchedule }),
        onSuccess: () => {
            toast.success("Schedule created");
            queryClient.invalidateQueries({ queryKey: ["doctor-profile"] });
        },
        onError: () => toast.error("Failed to create schedule")
    });

    const updateMutation = useMutation({
        mutationFn: async () =>
            DoctorService.updateDoctorSchedule({
                scheduleId: editingSchedule?.id || "",
                requestBody: {
                    id: editingSchedule?.id,
                    dayOfWeek: editingSchedule?.dayOfWeek,
                    startTime: editingSchedule?.startTime,
                    endTime: editingSchedule?.endTime,
                    slotDurationInMinutes: editingSchedule?.slotDurationInMinutes,
                    validStartDate: editingSchedule?.validStartDate,
                    validEndDate: editingSchedule?.validEndDate,
                    notes: editingSchedule?.notes
                }
            }),
        onSuccess: () => {
            toast.success("Schedule updated");
            queryClient.invalidateQueries({ queryKey: ["doctor-profile"] });
            setEditingSchedule(null);
        },
        onError: () => toast.error("Failed to update schedule")
    });

    if (isLoading) {
        return (
            <div className="space-y-6">
                <PageHeader title="Schedule" />
                <ListSkeleton items={2} />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader title="Schedule" description="Manage your availability and timeslots" />

            <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Create Schedule</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <Label>Day</Label>
                                <Select
                                    value={newSchedule.dayOfWeek}
                                    onValueChange={(value) =>
                                        setNewSchedule((prev) => ({ ...prev, dayOfWeek: value as DayOfWeek }))
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-popover">
                                        {dayOptions.map((day) => (
                                            <SelectItem key={day} value={day}>
                                                {day}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Slot Duration (minutes)</Label>
                                <Input
                                    type="number"
                                    value={newSchedule.slotDurationInMinutes || 30}
                                    onChange={(e) =>
                                        setNewSchedule((prev) => ({
                                            ...prev,
                                            slotDurationInMinutes: Number(e.target.value)
                                        }))
                                    }
                                />
                            </div>
                            <div>
                                <Label>Start Time</Label>
                                <Input
                                    type="time"
                                    value={newSchedule.startTime || ""}
                                    onChange={(e) => setNewSchedule((prev) => ({ ...prev, startTime: e.target.value }))}
                                />
                            </div>
                            <div>
                                <Label>End Time</Label>
                                <Input
                                    type="time"
                                    value={newSchedule.endTime || ""}
                                    onChange={(e) => setNewSchedule((prev) => ({ ...prev, endTime: e.target.value }))}
                                />
                            </div>
                            <div>
                                <Label>Valid Start Date</Label>
                                <Input
                                    type="date"
                                    value={newSchedule.validStartDate || ""}
                                    onChange={(e) =>
                                        setNewSchedule((prev) => ({ ...prev, validStartDate: e.target.value }))
                                    }
                                />
                            </div>
                            <div>
                                <Label>Valid End Date</Label>
                                <Input
                                    type="date"
                                    value={newSchedule.validEndDate || ""}
                                    onChange={(e) =>
                                        setNewSchedule((prev) => ({ ...prev, validEndDate: e.target.value }))
                                    }
                                />
                            </div>
                        </div>
                        <div>
                            <Label>Notes</Label>
                            <Input
                                value={newSchedule.notes || ""}
                                onChange={(e) => setNewSchedule((prev) => ({ ...prev, notes: e.target.value }))}
                            />
                        </div>
                        <Button onClick={() => createMutation.mutate()} disabled={createMutation.isPending}>
                            {createMutation.isPending ? "Saving..." : "Create Schedule"}
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Your Schedules</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {schedules.length === 0 && (
                            <p className="text-sm text-muted-foreground">No schedules created yet.</p>
                        )}
                        {schedules.map((schedule) => (
                            <div key={schedule.id} className="flex items-center justify-between p-3 border rounded-lg">
                                <div>
                                    <p className="font-medium">
                                        {schedule.dayOfWeek}: {schedule.startTime} - {schedule.endTime}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {schedule.slotDurationInMinutes} min slots
                                    </p>
                                </div>
                                <Button size="sm" variant="outline" onClick={() => setEditingSchedule(schedule)}>
                                    Edit
                                </Button>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Timeslots</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <Label>Start Date</Label>
                            <Input
                                type="date"
                                value={timeslotStart}
                                onChange={(e) => setTimeslotStart(e.target.value)}
                            />
                        </div>
                        <div>
                            <Label>End Date</Label>
                            <Input type="date" value={timeslotEnd} onChange={(e) => setTimeslotEnd(e.target.value)} />
                        </div>
                    </div>
                    {timeslotLoading ? (
                        <p className="text-sm text-muted-foreground">Loading timeslots...</p>
                    ) : (
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {timeslots.map((slot) => (
                                <div key={slot.id} className="p-3 border rounded-lg">
                                    <p className="font-medium">{slot.date}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {slot.startTime} - {slot.endTime}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {slot.isBooked ? "Booked" : "Available"}
                                    </p>
                                </div>
                            ))}
                            {timeslots.length === 0 && (
                                <p className="text-sm text-muted-foreground">No timeslots in range.</p>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            <Dialog open={!!editingSchedule} onOpenChange={() => setEditingSchedule(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Schedule</DialogTitle>
                    </DialogHeader>
                    {editingSchedule && (
                        <div className="space-y-4">
                            <div>
                                <Label>Day</Label>
                                <Select
                                    value={editingSchedule.dayOfWeek || DayOfWeek.MONDAY}
                                    onValueChange={(value) =>
                                        setEditingSchedule((prev) =>
                                            prev ? { ...prev, dayOfWeek: value as DayOfWeek } : prev
                                        )
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-popover">
                                        {dayOptions.map((day) => (
                                            <SelectItem key={day} value={day}>
                                                {day}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <Label>Start Time</Label>
                                    <Input
                                        type="time"
                                        value={editingSchedule.startTime || ""}
                                        onChange={(e) =>
                                            setEditingSchedule((prev) =>
                                                prev ? { ...prev, startTime: e.target.value } : prev
                                            )
                                        }
                                    />
                                </div>
                                <div>
                                    <Label>End Time</Label>
                                    <Input
                                        type="time"
                                        value={editingSchedule.endTime || ""}
                                        onChange={(e) =>
                                            setEditingSchedule((prev) =>
                                                prev ? { ...prev, endTime: e.target.value } : prev
                                            )
                                        }
                                    />
                                </div>
                            </div>
                            <div>
                                <Label>Slot Duration (minutes)</Label>
                                <Input
                                    type="number"
                                    value={editingSchedule.slotDurationInMinutes || 30}
                                    onChange={(e) =>
                                        setEditingSchedule((prev) =>
                                            prev ? { ...prev, slotDurationInMinutes: Number(e.target.value) } : prev
                                        )
                                    }
                                />
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setEditingSchedule(null)}>
                                    Cancel
                                </Button>
                                <Button onClick={() => updateMutation.mutate()} disabled={updateMutation.isPending}>
                                    {updateMutation.isPending ? "Saving..." : "Save"}
                                </Button>
                            </DialogFooter>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
