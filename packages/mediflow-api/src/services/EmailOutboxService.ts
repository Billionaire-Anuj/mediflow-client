/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BooleanResponseDto } from "../models/BooleanResponseDto";
import type { EmailOutboxDtoCollectionDto } from "../models/EmailOutboxDtoCollectionDto";
import type { EmailOutboxDtoListResponseDto } from "../models/EmailOutboxDtoListResponseDto";
import type { EmailOutboxDtoResponseDto } from "../models/EmailOutboxDtoResponseDto";
import type { EmailProcess } from "../models/EmailProcess";
import type { OutboxStatus } from "../models/OutboxStatus";
import type { CancelablePromise } from "../core/CancelablePromise";
import { OpenAPI } from "../core/OpenAPI";
import { request as __request } from "../core/request";
export class EmailOutboxService {
    /**
     * GetAllEmailOutboxes
     * Returns paginated email outbox details with search and active filters.
     * @returns EmailOutboxDtoCollectionDto OK
     * @throws ApiError
     */
    public static getAllEmailOutboxes({
        pageNumber,
        pageSize,
        globalSearch,
        isActive,
        orderBys,
        toEmail,
        name,
        subject,
        emailProcess,
        minimumAttemptCount,
        maximumAttemptCount,
        minimumNextAttemptDate,
        maximumNextAttemptDate,
        outboxStatuses,
        minimumScheduledDate,
        maximumScheduledDate,
        minimumSentDate,
        maximumSentDate
    }: {
        pageNumber?: number;
        pageSize?: number;
        globalSearch?: string;
        isActive?: Array<boolean>;
        orderBys?: Array<string>;
        toEmail?: string;
        name?: string;
        subject?: string;
        emailProcess?: Array<EmailProcess>;
        minimumAttemptCount?: number;
        maximumAttemptCount?: number;
        minimumNextAttemptDate?: string;
        maximumNextAttemptDate?: string;
        outboxStatuses?: Array<OutboxStatus>;
        minimumScheduledDate?: string;
        maximumScheduledDate?: string;
        minimumSentDate?: string;
        maximumSentDate?: string;
    }): CancelablePromise<EmailOutboxDtoCollectionDto> {
        return __request(OpenAPI, {
            method: "GET",
            url: "/api/v1/email/outbox",
            query: {
                PageNumber: pageNumber,
                PageSize: pageSize,
                GlobalSearch: globalSearch,
                IsActive: isActive,
                OrderBys: orderBys,
                toEmail: toEmail,
                name: name,
                subject: subject,
                emailProcess: emailProcess,
                minimumAttemptCount: minimumAttemptCount,
                maximumAttemptCount: maximumAttemptCount,
                minimumNextAttemptDate: minimumNextAttemptDate,
                maximumNextAttemptDate: maximumNextAttemptDate,
                outboxStatuses: outboxStatuses,
                minimumScheduledDate: minimumScheduledDate,
                maximumScheduledDate: maximumScheduledDate,
                minimumSentDate: minimumSentDate,
                maximumSentDate: maximumSentDate
            }
        });
    }
    /**
     * GetAllEmailOutboxesList
     * Returns paginated email outbox details with search and active filters.
     * @returns EmailOutboxDtoListResponseDto OK
     * @throws ApiError
     */
    public static getAllEmailOutboxesList({
        globalSearch,
        isActive,
        orderBys,
        toEmail,
        name,
        subject,
        emailProcess,
        minimumAttemptCount,
        maximumAttemptCount,
        minimumNextAttemptDate,
        maximumNextAttemptDate,
        outboxStatuses,
        minimumScheduledDate,
        maximumScheduledDate,
        minimumSentDate,
        maximumSentDate
    }: {
        globalSearch?: string;
        isActive?: Array<boolean>;
        orderBys?: Array<string>;
        toEmail?: string;
        name?: string;
        subject?: string;
        emailProcess?: Array<EmailProcess>;
        minimumAttemptCount?: number;
        maximumAttemptCount?: number;
        minimumNextAttemptDate?: string;
        maximumNextAttemptDate?: string;
        outboxStatuses?: Array<OutboxStatus>;
        minimumScheduledDate?: string;
        maximumScheduledDate?: string;
        minimumSentDate?: string;
        maximumSentDate?: string;
    }): CancelablePromise<EmailOutboxDtoListResponseDto> {
        return __request(OpenAPI, {
            method: "GET",
            url: "/api/v1/email/outbox/list",
            query: {
                GlobalSearch: globalSearch,
                IsActive: isActive,
                OrderBys: orderBys,
                toEmail: toEmail,
                name: name,
                subject: subject,
                emailProcess: emailProcess,
                minimumAttemptCount: minimumAttemptCount,
                maximumAttemptCount: maximumAttemptCount,
                minimumNextAttemptDate: minimumNextAttemptDate,
                maximumNextAttemptDate: maximumNextAttemptDate,
                outboxStatuses: outboxStatuses,
                minimumScheduledDate: minimumScheduledDate,
                maximumScheduledDate: maximumScheduledDate,
                minimumSentDate: minimumSentDate,
                maximumSentDate: maximumSentDate
            }
        });
    }
    /**
     * GetEmailOutboxById
     * Returns email outbox details via its identifier.
     * @returns EmailOutboxDtoResponseDto OK
     * @throws ApiError
     */
    public static getEmailOutboxById({
        emailOutboxId
    }: {
        emailOutboxId: string;
    }): CancelablePromise<EmailOutboxDtoResponseDto> {
        return __request(OpenAPI, {
            method: "GET",
            url: "/api/v1/email/outbox/{emailOutboxId}",
            path: {
                emailOutboxId: emailOutboxId
            }
        });
    }
    /**
     * ProcessEmailOutboxAsync
     * Processes a respective email outbox via its identifier.
     * @returns BooleanResponseDto OK
     * @throws ApiError
     */
    public static processEmailOutboxAsync({
        emailOutboxId
    }: {
        emailOutboxId: string;
    }): CancelablePromise<BooleanResponseDto> {
        return __request(OpenAPI, {
            method: "PUT",
            url: "/api/v1/email/outbox/{emailOutboxId}/process",
            path: {
                emailOutboxId: emailOutboxId
            }
        });
    }
}
