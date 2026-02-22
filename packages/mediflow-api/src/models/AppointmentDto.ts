/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AppointmentDiagnosticsDto } from "./AppointmentDiagnosticsDto";
import type { AppointmentMedicationsDto } from "./AppointmentMedicationsDto";
import type { AppointmentStatus } from "./AppointmentStatus";
import type { DoctorProfileDto } from "./DoctorProfileDto";
import type { MedicalRecordDto } from "./MedicalRecordDto";
import type { PatientProfileDto } from "./PatientProfileDto";
import type { TimeslotDto } from "./TimeslotDto";
export type AppointmentDto = {
    id?: string;
    isActive?: boolean;
    doctor?: DoctorProfileDto;
    patient?: PatientProfileDto;
    bookedDate?: string;
    timeslot?: TimeslotDto;
    cancelledDate?: string | null;
    status?: AppointmentStatus;
    notes?: string | null;
    symptoms?: string | null;
    fee?: number;
    isPaidViaGateway?: boolean;
    isPaidViaOfflineMedium?: boolean;
    cancellationReason?: string | null;
    medicalRecords?: MedicalRecordDto;
    medications?: Array<AppointmentMedicationsDto> | null;
    diagnostics?: Array<AppointmentDiagnosticsDto> | null;
};
