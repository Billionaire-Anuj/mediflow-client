/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateAppointmentDiagnosticsDto } from "./CreateAppointmentDiagnosticsDto";
import type { CreateAppointmentMedicationsDto } from "./CreateAppointmentMedicationsDto";
export type ConsultAppointmentDto = {
    appointmentId?: string;
    diagnosis?: string | null;
    treatment?: string | null;
    prescriptions?: string | null;
    notes?: string | null;
    diagnostics?: Array<CreateAppointmentDiagnosticsDto> | null;
    medications?: Array<CreateAppointmentMedicationsDto> | null;
};
