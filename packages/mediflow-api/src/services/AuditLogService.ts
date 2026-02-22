/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AuditLogDtoListResponseDto } from "../models/AuditLogDtoListResponseDto";
import type { CancelablePromise } from "../core/CancelablePromise";
import { OpenAPI } from "../core/OpenAPI";
import { request as __request } from "../core/request";
export class AuditLogService {
    /**
     * GetAuditLogsByEntityId
     * Returns the audited logs for a respective entity.
     * @returns AuditLogDtoListResponseDto OK
     * @throws ApiError
     */
    public static getAuditLogsByEntityId({
        entityId
    }: {
        entityId: string;
    }): CancelablePromise<AuditLogDtoListResponseDto> {
        return __request(OpenAPI, {
            method: "GET",
            url: "/api/v1/audit/log/{entityId}",
            path: {
                entityId: entityId
            }
        });
    }
}
