/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AppointmentDiagnosticsDtoResponseDto } from "../models/AppointmentDiagnosticsDtoResponseDto";
import type { AppointmentDtoCollectionDto } from "../models/AppointmentDtoCollectionDto";
import type { AppointmentDtoListResponseDto } from "../models/AppointmentDtoListResponseDto";
import type { BooleanResponseDto } from "../models/BooleanResponseDto";
import type { DiagnosticStatus } from "../models/DiagnosticStatus";
import type { UpdateAppointmentDiagnosticTestResultDto } from "../models/UpdateAppointmentDiagnosticTestResultDto";
import type { CancelablePromise } from "../core/CancelablePromise";
import { OpenAPI } from "../core/OpenAPI";
import { request as __request } from "../core/request";
export class AppointmentDiagnosticsService {
    /**
     * GetAllAppointmentDiagnostics
     * Retrieve all paginated appointment diagnostics with appointment details.
     * @returns AppointmentDtoCollectionDto OK
     * @throws ApiError
     */
    public static getAllAppointmentDiagnostics({
        pageNumber,
        pageSize,
        globalSearch,
        isActive,
        orderBys,
        appointmentId,
        doctorId,
        patientId,
        labTechnicianId,
        startDate,
        endDate,
        statuses
    }: {
        pageNumber?: number;
        pageSize?: number;
        globalSearch?: string;
        isActive?: Array<boolean>;
        orderBys?: Array<string>;
        appointmentId?: string;
        doctorId?: string;
        patientId?: string;
        labTechnicianId?: string;
        startDate?: string;
        endDate?: string;
        statuses?: Array<DiagnosticStatus>;
    }): CancelablePromise<AppointmentDtoCollectionDto> {
        return __request(OpenAPI, {
            method: "GET",
            url: "/api/v1/appointment/diagnostics",
            query: {
                PageNumber: pageNumber,
                PageSize: pageSize,
                GlobalSearch: globalSearch,
                IsActive: isActive,
                OrderBys: orderBys,
                appointmentId: appointmentId,
                doctorId: doctorId,
                patientId: patientId,
                labTechnicianId: labTechnicianId,
                startDate: startDate,
                endDate: endDate,
                statuses: statuses
            }
        });
    }
    /**
     * GetAllAppointmentDiagnosticsList
     * Retrieve all non-paginated appointment diagnostics with appointment details.
     * @returns AppointmentDtoListResponseDto OK
     * @throws ApiError
     */
    public static getAllAppointmentDiagnosticsList({
        globalSearch,
        isActive,
        orderBys,
        appointmentId,
        doctorId,
        patientId,
        labTechnicianId,
        startDate,
        endDate,
        statuses
    }: {
        globalSearch?: string;
        isActive?: Array<boolean>;
        orderBys?: Array<string>;
        appointmentId?: string;
        doctorId?: string;
        patientId?: string;
        labTechnicianId?: string;
        startDate?: string;
        endDate?: string;
        statuses?: Array<DiagnosticStatus>;
    }): CancelablePromise<AppointmentDtoListResponseDto> {
        return __request(OpenAPI, {
            method: "GET",
            url: "/api/v1/appointment/diagnostics/list",
            query: {
                GlobalSearch: globalSearch,
                IsActive: isActive,
                OrderBys: orderBys,
                appointmentId: appointmentId,
                doctorId: doctorId,
                patientId: patientId,
                labTechnicianId: labTechnicianId,
                startDate: startDate,
                endDate: endDate,
                statuses: statuses
            }
        });
    }
    /**
     * GetAppointmentDiagnosticsById
     * Retrieve the respective appointment diagnostics via its identifier in the system.
     * @returns AppointmentDiagnosticsDtoResponseDto OK
     * @throws ApiError
     */
    public static getAppointmentDiagnosticsById({
        appointmentDiagnosticsId
    }: {
        appointmentDiagnosticsId: string;
    }): CancelablePromise<AppointmentDiagnosticsDtoResponseDto> {
        return __request(OpenAPI, {
            method: "GET",
            url: "/api/v1/appointment/diagnostics/{appointmentDiagnosticsId}",
            path: {
                appointmentDiagnosticsId: appointmentDiagnosticsId
            }
        });
    }
    /**
     * AssignLabTechnician
     * Assigns the logged in lab technician to the diagnostics.
     * @returns BooleanResponseDto OK
     * @throws ApiError
     */
    public static assignLabTechnician({
        appointmentDiagnosticsId
    }: {
        appointmentDiagnosticsId: string;
    }): CancelablePromise<BooleanResponseDto> {
        return __request(OpenAPI, {
            method: "PATCH",
            url: "/api/v1/appointment/diagnostics/{appointmentDiagnosticsId}/assign",
            path: {
                appointmentDiagnosticsId: appointmentDiagnosticsId
            }
        });
    }
    /**
     * UploadDiagnosticReport
     * Uploads a diagnostic report for the test.
     * @returns BooleanResponseDto OK
     * @throws ApiError
     */
    public static uploadDiagnosticReport({
        appointmentDiagnosticTestId,
        formData
    }: {
        appointmentDiagnosticTestId: string;
        formData?: {
            AppointmentDiagnosticTestId?: string;
            Report?: Blob;
        };
    }): CancelablePromise<BooleanResponseDto> {
        return __request(OpenAPI, {
            method: "POST",
            url: "/api/v1/appointment/diagnostics/{appointmentDiagnosticTestId}/report",
            path: {
                appointmentDiagnosticTestId: appointmentDiagnosticTestId
            },
            formData: formData,
            mediaType: "multipart/form-data"
        });
    }
    /**
     * SubmitDiagnosticTestResult
     * Submits diagnostic test results for the test.
     * @returns BooleanResponseDto OK
     * @throws ApiError
     */
    public static submitDiagnosticTestResult({
        appointmentDiagnosticTestId,
        requestBody
    }: {
        appointmentDiagnosticTestId: string;
        requestBody?: UpdateAppointmentDiagnosticTestResultDto;
    }): CancelablePromise<BooleanResponseDto> {
        return __request(OpenAPI, {
            method: "POST",
            url: "/api/v1/appointment/diagnostics/{appointmentDiagnosticTestId}/result",
            path: {
                appointmentDiagnosticTestId: appointmentDiagnosticTestId
            },
            body: requestBody,
            mediaType: "application/json"
        });
    }
}
