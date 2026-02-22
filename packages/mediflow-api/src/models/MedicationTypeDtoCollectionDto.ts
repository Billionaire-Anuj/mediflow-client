/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { MedicationTypeDto } from "./MedicationTypeDto";
export type MedicationTypeDtoCollectionDto = {
    statusCode?: number;
    message?: string | null;
    readonly currentPage?: number;
    readonly totalPages?: number;
    pageSize?: number;
    readonly totalCount?: number;
    readonly displayCount?: number;
    readonly result?: Array<MedicationTypeDto> | null;
};
