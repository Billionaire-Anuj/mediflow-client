/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BooleanResponseDto } from "../models/BooleanResponseDto";
import type { CreateDiagnosticTypeDto } from "../models/CreateDiagnosticTypeDto";
import type { DiagnosticTypeDtoCollectionDto } from "../models/DiagnosticTypeDtoCollectionDto";
import type { DiagnosticTypeDtoListResponseDto } from "../models/DiagnosticTypeDtoListResponseDto";
import type { DiagnosticTypeDtoResponseDto } from "../models/DiagnosticTypeDtoResponseDto";
import type { UpdateDiagnosticTypeDto } from "../models/UpdateDiagnosticTypeDto";
import type { CancelablePromise } from "../core/CancelablePromise";
import { OpenAPI } from "../core/OpenAPI";
import { request as __request } from "../core/request";
export class DiagnosticTypeService {
    /**
     * GetAllDiagnosticTypes
     * Retrieve all paginated diagnostic types in the system.
     * @returns DiagnosticTypeDtoCollectionDto OK
     * @throws ApiError
     */
    public static getAllDiagnosticTypes({
        pageNumber,
        pageSize,
        globalSearch,
        isActive,
        orderBys,
        title,
        description
    }: {
        pageNumber?: number;
        pageSize?: number;
        globalSearch?: string;
        isActive?: Array<boolean>;
        orderBys?: Array<string>;
        title?: string;
        description?: string;
    }): CancelablePromise<DiagnosticTypeDtoCollectionDto> {
        return __request(OpenAPI, {
            method: "GET",
            url: "/api/v1/diagnostic/type",
            query: {
                PageNumber: pageNumber,
                PageSize: pageSize,
                GlobalSearch: globalSearch,
                IsActive: isActive,
                OrderBys: orderBys,
                title: title,
                description: description
            }
        });
    }
    /**
     * CreateDiagnosticType
     * Creates a new record of diagnosticType.
     * @returns BooleanResponseDto OK
     * @throws ApiError
     */
    public static createDiagnosticType({
        requestBody
    }: {
        requestBody?: CreateDiagnosticTypeDto;
    }): CancelablePromise<BooleanResponseDto> {
        return __request(OpenAPI, {
            method: "POST",
            url: "/api/v1/diagnostic/type",
            body: requestBody,
            mediaType: "application/json"
        });
    }
    /**
     * GetAllDiagnosticTypesList
     * Retrieve all non-paginated diagnostic types in the system.
     * @returns DiagnosticTypeDtoListResponseDto OK
     * @throws ApiError
     */
    public static getAllDiagnosticTypesList({
        globalSearch,
        isActive,
        orderBys,
        title,
        description
    }: {
        globalSearch?: string;
        isActive?: Array<boolean>;
        orderBys?: Array<string>;
        title?: string;
        description?: string;
    }): CancelablePromise<DiagnosticTypeDtoListResponseDto> {
        return __request(OpenAPI, {
            method: "GET",
            url: "/api/v1/diagnostic/type/list",
            query: {
                GlobalSearch: globalSearch,
                IsActive: isActive,
                OrderBys: orderBys,
                title: title,
                description: description
            }
        });
    }
    /**
     * GetDiagnosticTypeById
     * Retrieve the respective diagnosticType via its identifier in the system.
     * @returns DiagnosticTypeDtoResponseDto OK
     * @throws ApiError
     */
    public static getDiagnosticTypeById({
        diagnosticTypeId
    }: {
        diagnosticTypeId: string;
    }): CancelablePromise<DiagnosticTypeDtoResponseDto> {
        return __request(OpenAPI, {
            method: "GET",
            url: "/api/v1/diagnostic/type/{diagnosticTypeId}",
            path: {
                diagnosticTypeId: diagnosticTypeId
            }
        });
    }
    /**
     * UpdateDiagnosticType
     * Updates an existing record of diagnosticType.
     * @returns BooleanResponseDto OK
     * @throws ApiError
     */
    public static updateDiagnosticType({
        diagnosticTypeId,
        requestBody
    }: {
        diagnosticTypeId: string;
        requestBody?: UpdateDiagnosticTypeDto;
    }): CancelablePromise<BooleanResponseDto> {
        return __request(OpenAPI, {
            method: "PUT",
            url: "/api/v1/diagnostic/type/{diagnosticTypeId}",
            path: {
                diagnosticTypeId: diagnosticTypeId
            },
            body: requestBody,
            mediaType: "application/json"
        });
    }
    /**
     * ActivateDeactivateDiagnosticType
     * Updates the activation status of a diagnosticType.
     * @returns BooleanResponseDto OK
     * @throws ApiError
     */
    public static activateDeactivateDiagnosticType({
        diagnosticTypeId
    }: {
        diagnosticTypeId: string;
    }): CancelablePromise<BooleanResponseDto> {
        return __request(OpenAPI, {
            method: "PATCH",
            url: "/api/v1/diagnostic/type/{diagnosticTypeId}/status",
            path: {
                diagnosticTypeId: diagnosticTypeId
            }
        });
    }
}
