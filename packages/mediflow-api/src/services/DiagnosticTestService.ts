/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BooleanResponseDto } from "../models/BooleanResponseDto";
import type { CreateDiagnosticTestDto } from "../models/CreateDiagnosticTestDto";
import type { DiagnosticTestDtoCollectionDto } from "../models/DiagnosticTestDtoCollectionDto";
import type { DiagnosticTestDtoListResponseDto } from "../models/DiagnosticTestDtoListResponseDto";
import type { DiagnosticTestDtoResponseDto } from "../models/DiagnosticTestDtoResponseDto";
import type { UpdateDiagnosticTestDto } from "../models/UpdateDiagnosticTestDto";
import type { CancelablePromise } from "../core/CancelablePromise";
import { OpenAPI } from "../core/OpenAPI";
import { request as __request } from "../core/request";
export class DiagnosticTestService {
    /**
     * GetAllDiagnosticTests
     * Retrieve all paginated diagnostic tests in the system.
     * @returns DiagnosticTestDtoCollectionDto OK
     * @throws ApiError
     */
    public static getAllDiagnosticTests({
        pageNumber,
        pageSize,
        globalSearch,
        isActive,
        orderBys,
        diagnosticTypeIds,
        title,
        description,
        specimen
    }: {
        pageNumber?: number;
        pageSize?: number;
        globalSearch?: string;
        isActive?: Array<boolean>;
        orderBys?: Array<string>;
        diagnosticTypeIds?: Array<string>;
        title?: string;
        description?: string;
        specimen?: string;
    }): CancelablePromise<DiagnosticTestDtoCollectionDto> {
        return __request(OpenAPI, {
            method: "GET",
            url: "/api/v1/diagnostic/test",
            query: {
                PageNumber: pageNumber,
                PageSize: pageSize,
                GlobalSearch: globalSearch,
                IsActive: isActive,
                OrderBys: orderBys,
                diagnosticTypeIds: diagnosticTypeIds,
                title: title,
                description: description,
                specimen: specimen
            }
        });
    }
    /**
     * CreateDiagnosticTest
     * Creates a new record of diagnosticTest.
     * @returns BooleanResponseDto OK
     * @throws ApiError
     */
    public static createDiagnosticTest({
        requestBody
    }: {
        requestBody?: CreateDiagnosticTestDto;
    }): CancelablePromise<BooleanResponseDto> {
        return __request(OpenAPI, {
            method: "POST",
            url: "/api/v1/diagnostic/test",
            body: requestBody,
            mediaType: "application/json"
        });
    }
    /**
     * GetAllDiagnosticTestsList
     * Retrieve all non-paginated diagnostic tests in the system.
     * @returns DiagnosticTestDtoListResponseDto OK
     * @throws ApiError
     */
    public static getAllDiagnosticTestsList({
        globalSearch,
        isActive,
        orderBys,
        diagnosticTypeIds,
        title,
        description,
        specimen
    }: {
        globalSearch?: string;
        isActive?: Array<boolean>;
        orderBys?: Array<string>;
        diagnosticTypeIds?: Array<string>;
        title?: string;
        description?: string;
        specimen?: string;
    }): CancelablePromise<DiagnosticTestDtoListResponseDto> {
        return __request(OpenAPI, {
            method: "GET",
            url: "/api/v1/diagnostic/test/list",
            query: {
                GlobalSearch: globalSearch,
                IsActive: isActive,
                OrderBys: orderBys,
                diagnosticTypeIds: diagnosticTypeIds,
                title: title,
                description: description,
                specimen: specimen
            }
        });
    }
    /**
     * GetDiagnosticTestById
     * Retrieve the respective diagnosticTest via its identifier in the system.
     * @returns DiagnosticTestDtoResponseDto OK
     * @throws ApiError
     */
    public static getDiagnosticTestById({
        diagnosticTestId
    }: {
        diagnosticTestId: string;
    }): CancelablePromise<DiagnosticTestDtoResponseDto> {
        return __request(OpenAPI, {
            method: "GET",
            url: "/api/v1/diagnostic/test/{diagnosticTestId}",
            path: {
                diagnosticTestId: diagnosticTestId
            }
        });
    }
    /**
     * UpdateDiagnosticTest
     * Updates an existing record of diagnosticTest.
     * @returns BooleanResponseDto OK
     * @throws ApiError
     */
    public static updateDiagnosticTest({
        diagnosticTestId,
        requestBody
    }: {
        diagnosticTestId: string;
        requestBody?: UpdateDiagnosticTestDto;
    }): CancelablePromise<BooleanResponseDto> {
        return __request(OpenAPI, {
            method: "PUT",
            url: "/api/v1/diagnostic/test/{diagnosticTestId}",
            path: {
                diagnosticTestId: diagnosticTestId
            },
            body: requestBody,
            mediaType: "application/json"
        });
    }
    /**
     * ActivateDeactivateDiagnosticTest
     * Updates the activation status of a diagnosticTest.
     * @returns BooleanResponseDto OK
     * @throws ApiError
     */
    public static activateDeactivateDiagnosticTest({
        diagnosticTestId
    }: {
        diagnosticTestId: string;
    }): CancelablePromise<BooleanResponseDto> {
        return __request(OpenAPI, {
            method: "PATCH",
            url: "/api/v1/diagnostic/test/{diagnosticTestId}/status",
            path: {
                diagnosticTestId: diagnosticTestId
            }
        });
    }
}
