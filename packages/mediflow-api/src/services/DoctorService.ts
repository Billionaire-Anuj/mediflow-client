/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BooleanResponseDto } from "../models/BooleanResponseDto";
import type { CreateScheduleDto } from "../models/CreateScheduleDto";
import type { DoctorProfileDtoCollectionDto } from "../models/DoctorProfileDtoCollectionDto";
import type { DoctorProfileDtoListResponseDto } from "../models/DoctorProfileDtoListResponseDto";
import type { DoctorProfileDtoResponseDto } from "../models/DoctorProfileDtoResponseDto";
import type { TimeslotDtoListResponseDto } from "../models/TimeslotDtoListResponseDto";
import type { UpdateDoctorProfileDto } from "../models/UpdateDoctorProfileDto";
import type { UpdateScheduleDto } from "../models/UpdateScheduleDto";
import type { CancelablePromise } from "../core/CancelablePromise";
import { OpenAPI } from "../core/OpenAPI";
import { request as __request } from "../core/request";
export class DoctorService {
    /**
     * GetDoctorProfile
     * Retrieve the logged in doctor's profile.
     * @returns DoctorProfileDtoResponseDto OK
     * @throws ApiError
     */
    public static getDoctorProfile(): CancelablePromise<DoctorProfileDtoResponseDto> {
        return __request(OpenAPI, {
            method: "GET",
            url: "/api/v1/doctor/profile"
        });
    }
    /**
     * UpdateDoctorProfile
     * Updates the logged in doctor's profile.
     * @returns BooleanResponseDto OK
     * @throws ApiError
     */
    public static updateDoctorProfile({
        requestBody
    }: {
        requestBody?: UpdateDoctorProfileDto;
    }): CancelablePromise<BooleanResponseDto> {
        return __request(OpenAPI, {
            method: "PUT",
            url: "/api/v1/doctor/profile",
            body: requestBody,
            mediaType: "application/json"
        });
    }
    /**
     * GetDoctorProfileById
     * Retrieve the respective doctor profile via its identifier in the system.
     * @returns DoctorProfileDtoResponseDto OK
     * @throws ApiError
     */
    public static getDoctorProfileById({
        doctorId
    }: {
        doctorId: string;
    }): CancelablePromise<DoctorProfileDtoResponseDto> {
        return __request(OpenAPI, {
            method: "GET",
            url: "/api/v1/doctor/{doctorId}",
            path: {
                doctorId: doctorId
            }
        });
    }
    /**
     * GetAllDoctorProfiles
     * Retrieve all paginated doctor profiles in the system.
     * @returns DoctorProfileDtoCollectionDto OK
     * @throws ApiError
     */
    public static getAllDoctorProfiles({
        pageNumber,
        pageSize,
        globalSearch,
        isActive,
        orderBys,
        name,
        username,
        emailAddress,
        address,
        phoneNumber,
        specializationIds
    }: {
        pageNumber?: number;
        pageSize?: number;
        globalSearch?: string;
        isActive?: Array<boolean>;
        orderBys?: Array<string>;
        name?: string;
        username?: string;
        emailAddress?: string;
        address?: string;
        phoneNumber?: string;
        specializationIds?: Array<string>;
    }): CancelablePromise<DoctorProfileDtoCollectionDto> {
        return __request(OpenAPI, {
            method: "GET",
            url: "/api/v1/doctor",
            query: {
                PageNumber: pageNumber,
                PageSize: pageSize,
                GlobalSearch: globalSearch,
                IsActive: isActive,
                OrderBys: orderBys,
                name: name,
                username: username,
                emailAddress: emailAddress,
                address: address,
                phoneNumber: phoneNumber,
                specializationIds: specializationIds
            }
        });
    }
    /**
     * GetAllDoctorProfilesList
     * Retrieve all non-paginated doctor profiles in the system.
     * @returns DoctorProfileDtoListResponseDto OK
     * @throws ApiError
     */
    public static getAllDoctorProfilesList({
        globalSearch,
        isActive,
        orderBys,
        name,
        username,
        emailAddress,
        address,
        phoneNumber,
        specializationIds
    }: {
        globalSearch?: string;
        isActive?: Array<boolean>;
        orderBys?: Array<string>;
        name?: string;
        username?: string;
        emailAddress?: string;
        address?: string;
        phoneNumber?: string;
        specializationIds?: Array<string>;
    }): CancelablePromise<DoctorProfileDtoListResponseDto> {
        return __request(OpenAPI, {
            method: "GET",
            url: "/api/v1/doctor/list",
            query: {
                GlobalSearch: globalSearch,
                IsActive: isActive,
                OrderBys: orderBys,
                name: name,
                username: username,
                emailAddress: emailAddress,
                address: address,
                phoneNumber: phoneNumber,
                specializationIds: specializationIds
            }
        });
    }
    /**
     * CreateDoctorSchedule
     * Creates a schedule for the logged in doctor.
     * @returns BooleanResponseDto OK
     * @throws ApiError
     */
    public static createDoctorSchedule({
        requestBody
    }: {
        requestBody?: CreateScheduleDto;
    }): CancelablePromise<BooleanResponseDto> {
        return __request(OpenAPI, {
            method: "POST",
            url: "/api/v1/doctor/schedules",
            body: requestBody,
            mediaType: "application/json"
        });
    }
    /**
     * UpdateDoctorSchedule
     * Updates a doctor's schedule.
     * @returns BooleanResponseDto OK
     * @throws ApiError
     */
    public static updateDoctorSchedule({
        scheduleId,
        requestBody
    }: {
        scheduleId: string;
        requestBody?: UpdateScheduleDto;
    }): CancelablePromise<BooleanResponseDto> {
        return __request(OpenAPI, {
            method: "PUT",
            url: "/api/v1/doctor/schedules/{scheduleId}",
            path: {
                scheduleId: scheduleId
            },
            body: requestBody,
            mediaType: "application/json"
        });
    }
    /**
     * GetDoctorTimeslots
     * Retrieve timeslots for a doctor in a date range.
     * @returns TimeslotDtoListResponseDto OK
     * @throws ApiError
     */
    public static getDoctorTimeslots({
        doctorId,
        startDate,
        endDate
    }: {
        doctorId: string;
        startDate?: string;
        endDate?: string;
    }): CancelablePromise<TimeslotDtoListResponseDto> {
        return __request(OpenAPI, {
            method: "GET",
            url: "/api/v1/doctor/{doctorId}/timeslots",
            path: {
                doctorId: doctorId
            },
            query: {
                startDate: startDate,
                endDate: endDate
            }
        });
    }
}
