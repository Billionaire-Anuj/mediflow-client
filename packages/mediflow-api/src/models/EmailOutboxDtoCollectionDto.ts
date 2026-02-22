/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { EmailOutboxDto } from "./EmailOutboxDto";
export type EmailOutboxDtoCollectionDto = {
    statusCode?: number;
    message?: string | null;
    readonly currentPage?: number;
    readonly totalPages?: number;
    pageSize?: number;
    readonly totalCount?: number;
    readonly displayCount?: number;
    readonly result?: Array<EmailOutboxDto> | null;
};
