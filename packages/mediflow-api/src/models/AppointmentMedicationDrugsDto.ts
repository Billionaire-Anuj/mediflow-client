/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { MedicineDto } from "./MedicineDto";
export type AppointmentMedicationDrugsDto = {
    id?: string;
    isActive?: boolean;
    medicine?: MedicineDto;
    dose?: string | null;
    frequency?: string | null;
    duration?: string | null;
    instructions?: string | null;
};
