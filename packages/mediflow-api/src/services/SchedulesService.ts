/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateScheduleRequest } from "../models/CreateScheduleRequest";
import type { ScheduleDto } from "../models/ScheduleDto";
import type { CancelablePromise } from "../core/CancelablePromise";
import { OpenAPI } from "../core/OpenAPI";
import { request as __request } from "../core/request";
export class SchedulesService {
    /**
     * @returns any OK
     * @throws ApiError
     */
    public static postApiDoctorsSchedules({
        doctorId,
        requestBody
    }: {
        doctorId: string;
        requestBody?: CreateScheduleRequest;
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: "POST",
            url: "/api/doctors/{doctorId}/schedules",
            path: {
                doctorId: doctorId
            },
            body: requestBody,
            mediaType: "application/json"
        });
    }
    /**
     * @returns ScheduleDto OK
     * @throws ApiError
     */
    public static getApiDoctorsSchedules({
        doctorId,
        from,
        to
    }: {
        doctorId: string;
        from?: string;
        to?: string;
    }): CancelablePromise<Array<ScheduleDto>> {
        return __request(OpenAPI, {
            method: "GET",
            url: "/api/doctors/{doctorId}/schedules",
            path: {
                doctorId: doctorId
            },
            query: {
                from: from,
                to: to
            }
        });
    }
    /**
     * @returns any OK
     * @throws ApiError
     */
    public static getApiSchedules({ scheduleId }: { scheduleId: string }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: "GET",
            url: "/api/schedules/{scheduleId}",
            path: {
                scheduleId: scheduleId
            }
        });
    }
    /**
     * @returns any OK
     * @throws ApiError
     */
    public static deleteApiSchedules({ scheduleId }: { scheduleId: string }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: "DELETE",
            url: "/api/schedules/{scheduleId}",
            path: {
                scheduleId: scheduleId
            }
        });
    }
    /**
     * @returns any OK
     * @throws ApiError
     */
    public static postApiSchedulesPublish({ scheduleId }: { scheduleId: string }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: "POST",
            url: "/api/schedules/{scheduleId}/publish",
            path: {
                scheduleId: scheduleId
            }
        });
    }
    /**
     * @returns any OK
     * @throws ApiError
     */
    public static postApiSchedulesUnpublish({ scheduleId }: { scheduleId: string }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: "POST",
            url: "/api/schedules/{scheduleId}/unpublish",
            path: {
                scheduleId: scheduleId
            }
        });
    }
}
