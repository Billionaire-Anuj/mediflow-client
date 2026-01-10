/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateDoctorRequest } from "../models/CreateDoctorRequest";
import type { DoctorDetailDto } from "../models/DoctorDetailDto";
import type { DoctorListItemDto } from "../models/DoctorListItemDto";
import type { TimeSlotDto } from "../models/TimeSlotDto";
import type { UpdateDoctorRequest } from "../models/UpdateDoctorRequest";
import type { CancelablePromise } from "../core/CancelablePromise";
import { OpenAPI } from "../core/OpenAPI";
import { request as __request } from "../core/request";
export class DoctorsService {
    /**
     * @returns DoctorListItemDto OK
     * @throws ApiError
     */
    public static getApiDoctors({
        specialty,
        name,
        availableOn
    }: {
        specialty?: string;
        name?: string;
        availableOn?: string;
    }): CancelablePromise<Array<DoctorListItemDto>> {
        return __request(OpenAPI, {
            method: "GET",
            url: "/api/Doctors",
            query: {
                specialty: specialty,
                name: name,
                availableOn: availableOn
            }
        });
    }
    /**
     * @returns any OK
     * @throws ApiError
     */
    public static postApiDoctors({ requestBody }: { requestBody?: CreateDoctorRequest }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: "POST",
            url: "/api/Doctors",
            body: requestBody,
            mediaType: "application/json"
        });
    }
    /**
     * @returns DoctorDetailDto OK
     * @throws ApiError
     */
    public static getApiDoctors1({ id }: { id: string }): CancelablePromise<DoctorDetailDto> {
        return __request(OpenAPI, {
            method: "GET",
            url: "/api/Doctors/{id}",
            path: {
                id: id
            }
        });
    }
    /**
     * @returns any OK
     * @throws ApiError
     */
    public static putApiDoctors({
        id,
        requestBody
    }: {
        id: string;
        requestBody?: UpdateDoctorRequest;
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: "PUT",
            url: "/api/Doctors/{id}",
            path: {
                id: id
            },
            body: requestBody,
            mediaType: "application/json"
        });
    }
    /**
     * @returns any OK
     * @throws ApiError
     */
    public static deleteApiDoctors({ id }: { id: string }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: "DELETE",
            url: "/api/Doctors/{id}",
            path: {
                id: id
            }
        });
    }
    /**
     * @returns TimeSlotDto OK
     * @throws ApiError
     */
    public static getApiDoctorsTimeslots({
        doctorId,
        date
    }: {
        doctorId: string;
        date?: string;
    }): CancelablePromise<Array<TimeSlotDto>> {
        return __request(OpenAPI, {
            method: "GET",
            url: "/api/Doctors/{doctorId}/timeslots",
            path: {
                doctorId: doctorId
            },
            query: {
                date: date
            }
        });
    }
}
