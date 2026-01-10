/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { TimeSlotDto } from "../models/TimeSlotDto";
import type { CancelablePromise } from "../core/CancelablePromise";
import { OpenAPI } from "../core/OpenAPI";
import { request as __request } from "../core/request";
export class TimeSlotsService {
    /**
     * @returns TimeSlotDto OK
     * @throws ApiError
     */
    public static getApiTimeSlots({ id }: { id: string }): CancelablePromise<TimeSlotDto> {
        return __request(OpenAPI, {
            method: "GET",
            url: "/api/TimeSlots/{id}",
            path: {
                id: id
            }
        });
    }
}
