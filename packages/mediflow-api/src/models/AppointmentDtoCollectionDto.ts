/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AppointmentDto } from "./AppointmentDto";
export type AppointmentDtoCollectionDto = {
    statusCode?: number;
    message?: string | null;
    readonly currentPage?: number;
    readonly totalPages?: number;
    pageSize?: number;
    readonly totalCount?: number;
    readonly displayCount?: number;
    readonly result?: Array<AppointmentDto> | null;
};
