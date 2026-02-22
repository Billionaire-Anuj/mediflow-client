/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AppointmentDiagnosticTestsDto } from "./AppointmentDiagnosticTestsDto";
import type { DiagnosticStatus } from "./DiagnosticStatus";
import type { UserDto } from "./UserDto";
export type AppointmentDiagnosticsDto = {
    id?: string;
    isActive?: boolean;
    labTechnician?: UserDto;
    notes?: string | null;
    status?: DiagnosticStatus;
    completedDate?: string | null;
    diagnosticTests?: Array<AppointmentDiagnosticTestsDto> | null;
};
