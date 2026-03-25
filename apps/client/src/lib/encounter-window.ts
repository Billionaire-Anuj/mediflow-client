import { addMinutes, format } from "date-fns";

export interface EncounterWindowState {
    windowStart: Date;
    windowEnd: Date;
    isWithinWindow: boolean;
    hasWindowPassed: boolean;
    hasWindowNotStarted: boolean;
    helperText: string;
}

export const getEncounterWindowState = (appointmentStart?: Date | null): EncounterWindowState | null => {
    if (!appointmentStart) return null;

    const windowStart = addMinutes(appointmentStart, -30);
    const windowEnd = addMinutes(appointmentStart, 30);
    const now = new Date();
    const isWithinWindow = now >= windowStart && now <= windowEnd;
    const hasWindowNotStarted = now < windowStart;
    const hasWindowPassed = now > windowEnd;

    let helperText = `Encounter allowed from ${format(windowStart, "h:mm a")} to ${format(windowEnd, "h:mm a")}.`;

    if (hasWindowNotStarted) {
        helperText = `Encounter opens at ${format(windowStart, "h:mm a")} and closes at ${format(windowEnd, "h:mm a")}.`;
    } else if (hasWindowPassed) {
        helperText = `Encounter window closed at ${format(windowEnd, "h:mm a")}.`;
    } else {
        helperText = `Encounter is open until ${format(windowEnd, "h:mm a")}.`;
    }

    return {
        windowStart,
        windowEnd,
        isWithinWindow,
        hasWindowPassed,
        hasWindowNotStarted,
        helperText
    };
};
