/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { DayOfWeek } from "./DayOfWeek";
export type UpdateScheduleDto = {
    dayOfWeek?: DayOfWeek;
    startTime?: string;
    endTime?: string;
    slotDurationInMinutes?: number;
    validStartDate?: string;
    validEndDate?: string;
    notes?: string | null;
    id?: string;
};
