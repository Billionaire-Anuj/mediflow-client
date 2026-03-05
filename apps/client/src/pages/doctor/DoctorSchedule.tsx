import { useEffect, useMemo, useState } from "react";
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
import { DatePicker, DateRangePicker } from "@/components/ui/date-picker";
import { TimeRangePicker } from "@/components/ui/time-picker";
import { toast } from "sonner";
import { isAfter } from "date-fns";
import type { DateRange } from "react-day-picker";
import { getErrorMessage, getResponseMessage } from "@/lib/api";
import { formatDateOnly, parseDateOnly } from "@/lib/datetime";

const dayOptions = Object.values(DayOfWeek);

const parseTimeToMinutes = (time?: string) => {
    if (!time) return null;
    const [hours, minutes] = time.split(":").map((value) => Number(value));
    if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
    return hours * 60 + minutes;
};

export default function DoctorSchedule() {
    const queryClient = useQueryClient();
    const [newSchedule, setNewSchedule] = useState<CreateScheduleDto>({
        dayOfWeek: DayOfWeek.MONDAY,
        startTime: "09:00",
        endTime: "17:00",
        slotDurationInMinutes: 30
    });
    const [editingSchedule, setEditingSchedule] = useState<ScheduleDto | null>(null);
    const [scheduleRange, setScheduleRange] = useState<DateRange | undefined>();
    const [editingRange, setEditingRange] = useState<DateRange | undefined>();
    const [timeslotStart, setTimeslotStart] = useState<Date | undefined>(new Date());
    const [timeslotEnd, setTimeslotEnd] = useState<Date | undefined>(new Date());

    const { data: profileData, isLoading } = useQuery({
        queryKey: ["doctor-profile"],
        queryFn: async () => DoctorService.getDoctorProfile()
    });

    const doctorId = profileData?.result?.id || "";

    const timeslotStartValue = formatDateOnly(timeslotStart);
    const timeslotEndValue = formatDateOnly(timeslotEnd);
    const timeslotRangeError = useMemo(() => {
        if (!timeslotStart || !timeslotEnd) return "Select a start and end date.";
        if (isAfter(timeslotStart, timeslotEnd)) return "Start date cannot be after the end date.";
        return "";
    }, [timeslotEnd, timeslotStart]);

    const { data: timeslotData, isFetching: timeslotLoading } = useQuery({
        queryKey: ["doctor-timeslots", doctorId, timeslotStartValue, timeslotEndValue],
        enabled: Boolean(doctorId && timeslotStartValue && timeslotEndValue && !timeslotRangeError),
        queryFn: async () =>
            DoctorService.getDoctorTimeslots({
                startDate: timeslotStartValue,
                endDate: timeslotEndValue
            })
    });

    const schedules = profileData?.result?.schedules ?? [];
    const timeslots = timeslotData?.result ?? [];

    const scheduleRangeError = useMemo(() => {
        if (!scheduleRange?.from || !scheduleRange?.to) return "Select a valid start and end date.";
        if (isAfter(scheduleRange.from, scheduleRange.to)) return "Start date must be before end date.";
        return "";
    }, [scheduleRange?.from, scheduleRange?.to]);

    const scheduleTimeError = useMemo(() => {
        const startMinutes = parseTimeToMinutes(newSchedule.startTime);
        const endMinutes = parseTimeToMinutes(newSchedule.endTime);
        if (startMinutes === null || endMinutes === null) return "Enter a start and end time.";
        if (startMinutes >= endMinutes) return "End time must be after the start time.";
        return "";
    }, [newSchedule.endTime, newSchedule.startTime]);

    const scheduleDurationError = useMemo(() => {
        if (!newSchedule.slotDurationInMinutes || newSchedule.slotDurationInMinutes <= 0) {
            return "Slot duration must be greater than 0.";
        }
        return "";
    }, [newSchedule.slotDurationInMinutes]);

    const canCreateSchedule = !scheduleRangeError && !scheduleTimeError && !scheduleDurationError;

    const createMutation = useMutation({
        mutationFn: async () =>
            DoctorService.createDoctorSchedule({
                requestBody: {
                    ...newSchedule,
                    validStartDate: formatDateOnly(scheduleRange?.from),
                    validEndDate: formatDateOnly(scheduleRange?.to)
                }
            }),
        onSuccess: (data) => {
            toast.success(getResponseMessage(data));
            queryClient.invalidateQueries({ queryKey: ["doctor-profile"] });
        },
        onError: (error) => toast.error(getErrorMessage(error))
    });

    const editingRangeError = useMemo(() => {
        if (!editingRange?.from || !editingRange?.to) return "Select a valid start and end date.";
        if (isAfter(editingRange.from, editingRange.to)) return "Start date must be before end date.";
        return "";
    }, [editingRange?.from, editingRange?.to]);

    const editingTimeError = useMemo(() => {
        if (!editingSchedule) return "";
        const startMinutes = parseTimeToMinutes(editingSchedule.startTime);
        const endMinutes = parseTimeToMinutes(editingSchedule.endTime);
        if (startMinutes === null || endMinutes === null) return "Enter a start and end time.";
        if (startMinutes >= endMinutes) return "End time must be after the start time.";
        return "";
    }, [editingSchedule]);

    const editingDurationError = useMemo(() => {
        if (!editingSchedule) return "";
        if (!editingSchedule.slotDurationInMinutes || editingSchedule.slotDurationInMinutes <= 0) {
            return "Slot duration must be greater than 0.";
        }
        return "";
    }, [editingSchedule]);

    const canUpdateSchedule = !editingRangeError && !editingTimeError && !editingDurationError;

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
                    validStartDate: formatDateOnly(editingRange?.from),
                    validEndDate: formatDateOnly(editingRange?.to),
                    notes: editingSchedule?.notes
                }
            }),
        onSuccess: (data) => {
            toast.success(getResponseMessage(data));
            queryClient.invalidateQueries({ queryKey: ["doctor-profile"] });
            setEditingSchedule(null);
        },
        onError: (error) => toast.error(getErrorMessage(error))
    });

    useEffect(() => {
        if (!editingSchedule) {
            setEditingRange(undefined);
            return;
        }

        setEditingRange({
            from: parseDateOnly(editingSchedule.validStartDate) ?? undefined,
            to: parseDateOnly(editingSchedule.validEndDate) ?? undefined
        });
    }, [editingSchedule]);

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
                                        <SelectValue placeholder="Select day" />
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
                                    placeholder="30"
                                    onChange={(e) =>
                                        setNewSchedule((prev) => ({
                                            ...prev,
                                            slotDurationInMinutes: Number(e.target.value)
                                        }))
                                    }
                                />
                                {scheduleDurationError && (
                                    <p className="mt-1 text-xs text-destructive">{scheduleDurationError}</p>
                                )}
                            </div>
                            <div className="sm:col-span-2">
                                <Label>Time Range</Label>
                                <TimeRangePicker
                                    startValue={newSchedule.startTime || ""}
                                    endValue={newSchedule.endTime || ""}
                                    onStartChange={(value) =>
                                        setNewSchedule((prev) => ({ ...prev, startTime: value }))
                                    }
                                    onEndChange={(value) => setNewSchedule((prev) => ({ ...prev, endTime: value }))}
                                />
                            </div>
                            {scheduleTimeError && (
                                <div className="sm:col-span-2">
                                    <p className="text-xs text-destructive">{scheduleTimeError}</p>
                                </div>
                            )}
                            <div className="sm:col-span-2">
                                <Label>Valid Date Range</Label>
                                <DateRangePicker
                                    value={scheduleRange}
                                    onChange={setScheduleRange}
                                    placeholder="Select valid date range"
                                />
                                {scheduleRangeError && (
                                    <p className="mt-1 text-xs text-destructive">{scheduleRangeError}</p>
                                )}
                            </div>
                        </div>
                        <div>
                            <Label>Notes</Label>
                            <Input
                                value={newSchedule.notes || ""}
                                placeholder="Additional notes"
                                onChange={(e) => setNewSchedule((prev) => ({ ...prev, notes: e.target.value }))}
                            />
                        </div>
                        <Button
                            onClick={() => createMutation.mutate()}
                            disabled={createMutation.isPending || !canCreateSchedule}
                        >
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
                            <DatePicker
                                value={timeslotStart}
                                onChange={(value) => setTimeslotStart(value ?? undefined)}
                                placeholder="Select start date"
                            />
                        </div>
                        <div>
                            <Label>End Date</Label>
                            <DatePicker
                                value={timeslotEnd}
                                onChange={(value) => setTimeslotEnd(value ?? undefined)}
                                placeholder="Select end date"
                            />
                        </div>
                    </div>
                    {timeslotRangeError && <p className="text-xs text-destructive">{timeslotRangeError}</p>}
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
                                        <SelectValue placeholder="Select day" />
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
                                <Label>Time Range</Label>
                                <TimeRangePicker
                                    startValue={editingSchedule.startTime || ""}
                                    endValue={editingSchedule.endTime || ""}
                                    onStartChange={(value) =>
                                        setEditingSchedule((prev) =>
                                            prev ? { ...prev, startTime: value } : prev
                                        )
                                    }
                                    onEndChange={(value) =>
                                        setEditingSchedule((prev) =>
                                            prev ? { ...prev, endTime: value } : prev
                                        )
                                    }
                                />
                            </div>
                            {editingTimeError && <p className="text-xs text-destructive">{editingTimeError}</p>}
                            <div>
                                <Label>Slot Duration (minutes)</Label>
                                <Input
                                    type="number"
                                    value={editingSchedule.slotDurationInMinutes || 30}
                                    placeholder="30"
                                    onChange={(e) =>
                                        setEditingSchedule((prev) =>
                                            prev ? { ...prev, slotDurationInMinutes: Number(e.target.value) } : prev
                                        )
                                    }
                                />
                                {editingDurationError && (
                                    <p className="mt-1 text-xs text-destructive">{editingDurationError}</p>
                                )}
                            </div>
                            <div>
                                <Label>Valid Date Range</Label>
                                <DateRangePicker
                                    value={editingRange}
                                    onChange={setEditingRange}
                                    placeholder="Select valid date range"
                                />
                                {editingRangeError && (
                                    <p className="mt-1 text-xs text-destructive">{editingRangeError}</p>
                                )}
                            </div>
                            <div>
                                <Label>Notes</Label>
                                <Input
                                    value={editingSchedule.notes || ""}
                                    placeholder="Additional notes"
                                    onChange={(e) =>
                                        setEditingSchedule((prev) =>
                                            prev ? { ...prev, notes: e.target.value } : prev
                                        )
                                    }
                                />
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setEditingSchedule(null)}>
                                    Cancel
                                </Button>
                                <Button
                                    onClick={() => updateMutation.mutate()}
                                    disabled={updateMutation.isPending || !canUpdateSchedule}
                                >
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
