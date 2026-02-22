/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BooleanResponseDto } from "../models/BooleanResponseDto";
import type { CreateSpecializationDto } from "../models/CreateSpecializationDto";
import type { SpecializationDtoCollectionDto } from "../models/SpecializationDtoCollectionDto";
import type { SpecializationDtoListResponseDto } from "../models/SpecializationDtoListResponseDto";
import type { SpecializationDtoResponseDto } from "../models/SpecializationDtoResponseDto";
import type { UpdateSpecializationDto } from "../models/UpdateSpecializationDto";
import type { CancelablePromise } from "../core/CancelablePromise";
import { OpenAPI } from "../core/OpenAPI";
import { request as __request } from "../core/request";
export class SpecializationService {
    /**
     * GetAllSpecializations
     * Retrieve all paginated specializations in the system.
     * @returns SpecializationDtoCollectionDto OK
     * @throws ApiError
     */
    public static getAllSpecializations({
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
    }): CancelablePromise<SpecializationDtoCollectionDto> {
        return __request(OpenAPI, {
            method: "GET",
            url: "/api/v1/specialization",
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
     * CreateSpecialization
     * Creates a new record of specialization.
     * @returns BooleanResponseDto OK
     * @throws ApiError
     */
    public static createSpecialization({
        requestBody
    }: {
        requestBody?: CreateSpecializationDto;
    }): CancelablePromise<BooleanResponseDto> {
        return __request(OpenAPI, {
            method: "POST",
            url: "/api/v1/specialization",
            body: requestBody,
            mediaType: "application/json"
        });
    }
    /**
     * GetAllSpecializationsList
     * Retrieve all non-paginated specializations in the system.
     * @returns SpecializationDtoListResponseDto OK
     * @throws ApiError
     */
    public static getAllSpecializationsList({
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
    }): CancelablePromise<SpecializationDtoListResponseDto> {
        return __request(OpenAPI, {
            method: "GET",
            url: "/api/v1/specialization/list",
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
     * GetSpecializationById
     * Retrieve the respective specialization via its identifier in the system.
     * @returns SpecializationDtoResponseDto OK
     * @throws ApiError
     */
    public static getSpecializationById({
        specializationId
    }: {
        specializationId: string;
    }): CancelablePromise<SpecializationDtoResponseDto> {
        return __request(OpenAPI, {
            method: "GET",
            url: "/api/v1/specialization/{specializationId}",
            path: {
                specializationId: specializationId
            }
        });
    }
    /**
     * UpdateSpecialization
     * Updates an existing record of specialization.
     * @returns BooleanResponseDto OK
     * @throws ApiError
     */
    public static updateSpecialization({
        specializationId,
        requestBody
    }: {
        specializationId: string;
        requestBody?: UpdateSpecializationDto;
    }): CancelablePromise<BooleanResponseDto> {
        return __request(OpenAPI, {
            method: "PUT",
            url: "/api/v1/specialization/{specializationId}",
            path: {
                specializationId: specializationId
            },
            body: requestBody,
            mediaType: "application/json"
        });
    }
    /**
     * ActivateDeactivateSpecialization
     * Updates the activation status of a specialization.
     * @returns BooleanResponseDto OK
     * @throws ApiError
     */
    public static activateDeactivateSpecialization({
        specializationId
    }: {
        specializationId: string;
    }): CancelablePromise<BooleanResponseDto> {
        return __request(OpenAPI, {
            method: "PATCH",
            url: "/api/v1/specialization/{specializationId}/status",
            path: {
                specializationId: specializationId
            }
        });
    }
}
