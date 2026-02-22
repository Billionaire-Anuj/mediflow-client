/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AppointmentDtoCollectionDto } from "../models/AppointmentDtoCollectionDto";
import type { AppointmentDtoListResponseDto } from "../models/AppointmentDtoListResponseDto";
import type { AppointmentMedicationsDtoResponseDto } from "../models/AppointmentMedicationsDtoResponseDto";
import type { BooleanResponseDto } from "../models/BooleanResponseDto";
import type { DiagnosticStatus } from "../models/DiagnosticStatus";
import type { CancelablePromise } from "../core/CancelablePromise";
import { OpenAPI } from "../core/OpenAPI";
import { request as __request } from "../core/request";
export class AppointmentMedicationsService {
    /**
     * GetAllAppointmentMedications
     * Retrieve all paginated appointment medications with appointment details.
     * @returns AppointmentDtoCollectionDto OK
     * @throws ApiError
     */
    public static getAllAppointmentMedications({
        pageNumber,
        pageSize,
        globalSearch,
        isActive,
        orderBys,
        appointmentId,
        doctorId,
        patientId,
        pharmacistId,
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
        pharmacistId?: string;
        startDate?: string;
        endDate?: string;
        statuses?: Array<DiagnosticStatus>;
    }): CancelablePromise<AppointmentDtoCollectionDto> {
        return __request(OpenAPI, {
            method: "GET",
            url: "/api/v1/appointment/medications",
            query: {
                PageNumber: pageNumber,
                PageSize: pageSize,
                GlobalSearch: globalSearch,
                IsActive: isActive,
                OrderBys: orderBys,
                appointmentId: appointmentId,
                doctorId: doctorId,
                patientId: patientId,
                pharmacistId: pharmacistId,
                startDate: startDate,
                endDate: endDate,
                statuses: statuses
            }
        });
    }
    /**
     * GetAllAppointmentMedicationsList
     * Retrieve all non-paginated appointment medications with appointment details.
     * @returns AppointmentDtoListResponseDto OK
     * @throws ApiError
     */
    public static getAllAppointmentMedicationsList({
        globalSearch,
        isActive,
        orderBys,
        appointmentId,
        doctorId,
        patientId,
        pharmacistId,
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
        pharmacistId?: string;
        startDate?: string;
        endDate?: string;
        statuses?: Array<DiagnosticStatus>;
    }): CancelablePromise<AppointmentDtoListResponseDto> {
        return __request(OpenAPI, {
            method: "GET",
            url: "/api/v1/appointment/medications/list",
            query: {
                GlobalSearch: globalSearch,
                IsActive: isActive,
                OrderBys: orderBys,
                appointmentId: appointmentId,
                doctorId: doctorId,
                patientId: patientId,
                pharmacistId: pharmacistId,
                startDate: startDate,
                endDate: endDate,
                statuses: statuses
            }
        });
    }
    /**
     * GetAppointmentMedicationsById
     * Retrieve the respective appointment medications via its identifier in the system.
     * @returns AppointmentMedicationsDtoResponseDto OK
     * @throws ApiError
     */
    public static getAppointmentMedicationsById({
        appointmentMedicationsId
    }: {
        appointmentMedicationsId: string;
    }): CancelablePromise<AppointmentMedicationsDtoResponseDto> {
        return __request(OpenAPI, {
            method: "GET",
            url: "/api/v1/appointment/medications/{appointmentMedicationsId}",
            path: {
                appointmentMedicationsId: appointmentMedicationsId
            }
        });
    }
    /**
     * DispenseAppointmentMedications
     * Dispenses the medications for an appointment.
     * @returns BooleanResponseDto OK
     * @throws ApiError
     */
    public static dispenseAppointmentMedications({
        appointmentMedicationsId
    }: {
        appointmentMedicationsId: string;
    }): CancelablePromise<BooleanResponseDto> {
        return __request(OpenAPI, {
            method: "PATCH",
            url: "/api/v1/appointment/medications/{appointmentMedicationsId}/dispense",
            path: {
                appointmentMedicationsId: appointmentMedicationsId
            }
        });
    }
}
