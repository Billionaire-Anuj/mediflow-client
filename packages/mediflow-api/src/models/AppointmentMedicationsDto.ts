/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AppointmentMedicationDrugsDto } from "./AppointmentMedicationDrugsDto";
import type { DiagnosticStatus } from "./DiagnosticStatus";
import type { UserDto } from "./UserDto";
export type AppointmentMedicationsDto = {
    id?: string;
    isActive?: boolean;
    pharmacist?: UserDto;
    notes?: string | null;
    status?: DiagnosticStatus;
    completedDate?: string | null;
    drugs?: Array<AppointmentMedicationDrugsDto> | null;
};
