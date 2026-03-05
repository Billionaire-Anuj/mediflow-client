import * as React from "react";
import { Check, Clock } from "lucide-react";
import { format } from "date-fns";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";

const buildTimeOptions = (stepMinutes: number) => {
    const options: Array<{ value: string; label: string }> = [];
    for (let hour = 0; hour < 24; hour += 1) {
        for (let minute = 0; minute < 60; minute += stepMinutes) {
            const value = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
            const date = new Date();
            date.setHours(hour, minute, 0, 0);
            options.push({ value, label: format(date, "h:mm a") });
        }
    }
    return options;
};

export type TimePickerProps = {
    value?: string;
    onChange?: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
    buttonClassName?: string;
    stepMinutes?: number;
};

export function TimePicker({
    value,
    onChange,
    placeholder = "Select time",
    disabled,
    className,
    buttonClassName,
    stepMinutes = 30
}: TimePickerProps) {
    const options = React.useMemo(() => buildTimeOptions(stepMinutes), [stepMinutes]);
    const selected = options.find((option) => option.value === value);

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
                    <span>{selected?.label ?? placeholder}</span>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                </Button>
            </PopoverTrigger>
            <PopoverContent
                align="start"
                className={cn(
                    "w-56 rounded-xl border border-border/70 bg-white/95 p-0 shadow-lg backdrop-blur",
                    className
                )}
            >
                <ScrollArea className="h-56">
                    <div className="p-2">
                        {options.map((option) => {
                            const isSelected = option.value === value;
                            return (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => onChange?.(option.value)}
                                    className={cn(
                                        "flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition",
                                        isSelected
                                            ? "bg-primary text-primary-foreground shadow-sm"
                                            : "text-foreground hover:bg-accent/70"
                                    )}
                                >
                                    <span>{option.label}</span>
                                    {isSelected && <Check className="h-4 w-4" />}
                                </button>
                            );
                        })}
                    </div>
                </ScrollArea>
            </PopoverContent>
        </Popover>
    );
}

export type TimeRangePickerProps = {
    startValue?: string;
    endValue?: string;
    onStartChange?: (value: string) => void;
    onEndChange?: (value: string) => void;
    disabled?: boolean;
    className?: string;
    startPlaceholder?: string;
    endPlaceholder?: string;
    stepMinutes?: number;
};

export function TimeRangePicker({
    startValue,
    endValue,
    onStartChange,
    onEndChange,
    disabled,
    className,
    startPlaceholder = "Start time",
    endPlaceholder = "End time",
    stepMinutes = 30
}: TimeRangePickerProps) {
    return (
        <div className={cn("grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-center", className)}>
            <TimePicker
                value={startValue}
                onChange={onStartChange}
                placeholder={startPlaceholder}
                disabled={disabled}
                stepMinutes={stepMinutes}
            />
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">to</span>
            <TimePicker
                value={endValue}
                onChange={onEndChange}
                placeholder={endPlaceholder}
                disabled={disabled}
                stepMinutes={stepMinutes}
            />
        </div>
    );
}
