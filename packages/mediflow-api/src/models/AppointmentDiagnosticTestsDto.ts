/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AppointmentDiagnosticTestResultDto } from "./AppointmentDiagnosticTestResultDto";
import type { AssetDto } from "./AssetDto";
import type { DiagnosticTestDto } from "./DiagnosticTestDto";
export type AppointmentDiagnosticTestsDto = {
    id?: string;
    isActive?: boolean;
    diagnosticTest?: DiagnosticTestDto;
    result?: AppointmentDiagnosticTestResultDto;
    report?: AssetDto;
};
