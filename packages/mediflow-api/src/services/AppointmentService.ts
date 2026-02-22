/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AppointmentDtoCollectionDto } from "../models/AppointmentDtoCollectionDto";
import type { AppointmentDtoListResponseDto } from "../models/AppointmentDtoListResponseDto";
import type { AppointmentDtoResponseDto } from "../models/AppointmentDtoResponseDto";
import type { AppointmentStatus } from "../models/AppointmentStatus";
import type { BooleanResponseDto } from "../models/BooleanResponseDto";
import type { CancelAppointmentDto } from "../models/CancelAppointmentDto";
import type { ConsultAppointmentDto } from "../models/ConsultAppointmentDto";
import type { CreateAppointmentDto } from "../models/CreateAppointmentDto";
import type { UpdateAppointmentDto } from "../models/UpdateAppointmentDto";
import type { CancelablePromise } from "../core/CancelablePromise";
import { OpenAPI } from "../core/OpenAPI";
import { request as __request } from "../core/request";
export class AppointmentService {
    /**
     * GetAllAppointments
     * Retrieve all paginated appointments in the system.
     * @returns AppointmentDtoCollectionDto OK
     * @throws ApiError
     */
    public static getAllAppointments({
        pageNumber,
        pageSize,
        globalSearch,
        isActive,
        orderBys,
        doctorId,
        patientId,
        startDate,
        endDate,
        statuses
    }: {
        pageNumber?: number;
        pageSize?: number;
        globalSearch?: string;
        isActive?: Array<boolean>;
        orderBys?: Array<string>;
        doctorId?: string;
        patientId?: string;
        startDate?: string;
        endDate?: string;
        statuses?: Array<AppointmentStatus>;
    }): CancelablePromise<AppointmentDtoCollectionDto> {
        return __request(OpenAPI, {
            method: "GET",
            url: "/api/v1/appointment",
            query: {
                PageNumber: pageNumber,
                PageSize: pageSize,
                GlobalSearch: globalSearch,
                IsActive: isActive,
                OrderBys: orderBys,
                doctorId: doctorId,
                patientId: patientId,
                startDate: startDate,
                endDate: endDate,
                statuses: statuses
            }
        });
    }
    /**
     * BookAppointment
     * Books a new appointment for a patient.
     * @returns BooleanResponseDto OK
     * @throws ApiError
     */
    public static bookAppointment({
        requestBody
    }: {
        requestBody?: CreateAppointmentDto;
    }): CancelablePromise<BooleanResponseDto> {
        return __request(OpenAPI, {
            method: "POST",
            url: "/api/v1/appointment",
            body: requestBody,
            mediaType: "application/json"
        });
    }
    /**
     * GetAllAppointmentsList
     * Retrieve all non-paginated appointments in the system.
     * @returns AppointmentDtoListResponseDto OK
     * @throws ApiError
     */
    public static getAllAppointmentsList({
        globalSearch,
        isActive,
        orderBys,
        doctorId,
        patientId,
        startDate,
        endDate,
        statuses
    }: {
        globalSearch?: string;
        isActive?: Array<boolean>;
        orderBys?: Array<string>;
        doctorId?: string;
        patientId?: string;
        startDate?: string;
        endDate?: string;
        statuses?: Array<AppointmentStatus>;
    }): CancelablePromise<AppointmentDtoListResponseDto> {
        return __request(OpenAPI, {
            method: "GET",
            url: "/api/v1/appointment/list",
            query: {
                GlobalSearch: globalSearch,
                IsActive: isActive,
                OrderBys: orderBys,
                doctorId: doctorId,
                patientId: patientId,
                startDate: startDate,
                endDate: endDate,
                statuses: statuses
            }
        });
    }
    /**
     * GetAppointmentById
     * Retrieve the respective appointment via its identifier in the system.
     * @returns AppointmentDtoResponseDto OK
     * @throws ApiError
     */
    public static getAppointmentById({
        appointmentId
    }: {
        appointmentId: string;
    }): CancelablePromise<AppointmentDtoResponseDto> {
        return __request(OpenAPI, {
            method: "GET",
            url: "/api/v1/appointment/{appointmentId}",
            path: {
                appointmentId: appointmentId
            }
        });
    }
    /**
     * UpdateAppointment
     * Updates an existing appointment details.
     * @returns BooleanResponseDto OK
     * @throws ApiError
     */
    public static updateAppointment({
        appointmentId,
        requestBody
    }: {
        appointmentId: string;
        requestBody?: UpdateAppointmentDto;
    }): CancelablePromise<BooleanResponseDto> {
        return __request(OpenAPI, {
            method: "PUT",
            url: "/api/v1/appointment/{appointmentId}",
            path: {
                appointmentId: appointmentId
            },
            body: requestBody,
            mediaType: "application/json"
        });
    }
    /**
     * CancelAppointment
     * Cancels a scheduled appointment.
     * @returns BooleanResponseDto OK
     * @throws ApiError
     */
    public static cancelAppointment({
        appointmentId,
        requestBody
    }: {
        appointmentId: string;
        requestBody?: CancelAppointmentDto;
    }): CancelablePromise<BooleanResponseDto> {
        return __request(OpenAPI, {
            method: "PATCH",
            url: "/api/v1/appointment/{appointmentId}/cancel",
            path: {
                appointmentId: appointmentId
            },
            body: requestBody,
            mediaType: "application/json"
        });
    }
    /**
     * ConsultAppointment
     * Consults the appointment and records diagnostics and medications.
     * @returns BooleanResponseDto OK
     * @throws ApiError
     */
    public static consultAppointment({
        appointmentId,
        requestBody
    }: {
        appointmentId: string;
        requestBody?: ConsultAppointmentDto;
    }): CancelablePromise<BooleanResponseDto> {
        return __request(OpenAPI, {
            method: "PATCH",
            url: "/api/v1/appointment/{appointmentId}/consult",
            path: {
                appointmentId: appointmentId
            },
            body: requestBody,
            mediaType: "application/json"
        });
    }
}
