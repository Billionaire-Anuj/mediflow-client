import * as React from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { format, isAfter, isBefore, startOfDay } from "date-fns";
import type { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export type DatePickerProps = {
    value?: Date | null;
    onChange: (value?: Date | null) => void;
    placeholder?: string;
    disabled?: boolean;
    minDate?: Date;
    maxDate?: Date;
    className?: string;
    buttonClassName?: string;
    disabledDates?: (date: Date) => boolean;
};

export function DatePicker({
    value,
    onChange,
    placeholder = "Select date",
    disabled,
    minDate,
    maxDate,
    className,
    buttonClassName,
    disabledDates
}: DatePickerProps) {
    const isDateDisabled = React.useCallback(
        (date: Date) => {
            const normalized = startOfDay(date);
            if (minDate && isBefore(normalized, startOfDay(minDate))) return true;
            if (maxDate && isAfter(normalized, startOfDay(maxDate))) return true;
            return disabledDates ? disabledDates(date) : false;
        },
        [disabledDates, maxDate, minDate]
    );

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    type="button"
                    variant="outline"
                    disabled={disabled}
                    className={cn(
                        "w-full justify-between rounded-lg border border-input bg-background/80 px-3 py-2 text-left text-foreground shadow-sm transition hover:border-primary/30 hover:bg-accent/40 focus-visible:ring-2 focus-visible:ring-primary/20",
                        !value && "text-muted-foreground",
                        buttonClassName
                    )}
                >
                    <span>{value ? format(value, "MMM d, yyyy") : placeholder}</span>
                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                </Button>
            </PopoverTrigger>
            <PopoverContent
                align="start"
                className={cn(
                    "w-auto rounded-xl border border-border/70 bg-white/95 p-0 shadow-lg backdrop-blur",
                    className
                )}
            >
                <Calendar
                    mode="single"
                    selected={value ?? undefined}
                    onSelect={(selected) => onChange(selected ?? null)}
                    disabled={isDateDisabled}
                    initialFocus
                    classNames={{
                        caption: "flex justify-center pt-2 relative items-center px-2",
                        caption_label: "text-sm font-semibold text-foreground",
                        nav_button: cn(
                            "h-7 w-7 rounded-full border border-border/70 bg-white/80 text-foreground shadow-sm transition hover:bg-accent/60"
                        ),
                        day: "h-9 w-9 rounded-md text-sm font-medium text-foreground hover:bg-accent/70",
                        day_selected: "bg-primary text-primary-foreground hover:bg-primary focus:bg-primary shadow-sm",
                        day_today: "border border-primary/40 text-primary",
                        day_range_middle: "aria-selected:bg-primary/10 aria-selected:text-foreground",
                        day_range_end: "day-range-end",
                        day_outside:
                            "day-outside text-muted-foreground/50 opacity-70 aria-selected:bg-accent/60 aria-selected:text-muted-foreground",
                        day_disabled: "text-muted-foreground/40 opacity-40",
                        cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected])]:bg-primary/5 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20"
                    }}
                />
            </PopoverContent>
        </Popover>
    );
}

export type DateRangePickerProps = {
    value?: DateRange;
    onChange: (value?: DateRange) => void;
    placeholder?: string;
    disabled?: boolean;
    minDate?: Date;
    maxDate?: Date;
    className?: string;
    buttonClassName?: string;
    numberOfMonths?: number;
    disabledDates?: (date: Date) => boolean;
};

export function DateRangePicker({
    value,
    onChange,
    placeholder = "Select date range",
    disabled,
    minDate,
    maxDate,
    className,
    buttonClassName,
    numberOfMonths = 2,
    disabledDates
}: DateRangePickerProps) {
    const isDateDisabled = React.useCallback(
        (date: Date) => {
            const normalized = startOfDay(date);
            if (minDate && isBefore(normalized, startOfDay(minDate))) return true;
            if (maxDate && isAfter(normalized, startOfDay(maxDate))) return true;
            return disabledDates ? disabledDates(date) : false;
        },
        [disabledDates, maxDate, minDate]
    );

    const label = React.useMemo(() => {
        if (value?.from && value?.to) {
            return `${format(value.from, "MMM d, yyyy")} - ${format(value.to, "MMM d, yyyy")}`;
        }
        if (value?.from) {
            return `${format(value.from, "MMM d, yyyy")} - ...`;
        }
        return placeholder;
    }, [placeholder, value?.from, value?.to]);

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    type="button"
                    variant="outline"
                    disabled={disabled}
                    className={cn(
                        "w-full justify-between rounded-lg border border-input bg-background/80 px-3 py-2 text-left text-foreground shadow-sm transition hover:border-primary/30 hover:bg-accent/40 focus-visible:ring-2 focus-visible:ring-primary/20",
                        !value?.from && "text-muted-foreground",
                        buttonClassName
                    )}
                >
                    <span>{label}</span>
                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                </Button>
            </PopoverTrigger>
            <PopoverContent
                align="start"
                className={cn(
                    "w-auto rounded-xl border border-border/70 bg-white/95 p-0 shadow-lg backdrop-blur",
                    className
                )}
            >
                <Calendar
                    mode="range"
                    selected={value}
                    onSelect={onChange}
                    disabled={isDateDisabled}
                    numberOfMonths={numberOfMonths}
                    initialFocus
                    classNames={{
                        caption: "flex justify-center pt-2 relative items-center px-2",
                        caption_label: "text-sm font-semibold text-foreground",
                        nav_button: cn(
                            "h-7 w-7 rounded-full border border-border/70 bg-white/80 text-foreground shadow-sm transition hover:bg-accent/60"
                        ),
                        day: "h-9 w-9 rounded-md text-sm font-medium text-foreground hover:bg-accent/70",
                        day_selected: "bg-primary text-primary-foreground hover:bg-primary focus:bg-primary shadow-sm",
                        day_today: "border border-primary/40 text-primary",
                        day_range_middle: "aria-selected:bg-primary/10 aria-selected:text-foreground",
                        day_range_end: "day-range-end",
                        day_outside:
                            "day-outside text-muted-foreground/50 opacity-70 aria-selected:bg-accent/60 aria-selected:text-muted-foreground",
                        day_disabled: "text-muted-foreground/40 opacity-40",
                        cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected])]:bg-primary/5 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20"
                    }}
                />
            </PopoverContent>
        </Popover>
    );
}
