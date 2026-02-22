/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { MedicationTypeDto } from "./MedicationTypeDto";
export type MedicineDto = {
    id?: string;
    isActive?: boolean;
    medicationType?: MedicationTypeDto;
    title?: string | null;
    description?: string | null;
    format?: string | null;
};
