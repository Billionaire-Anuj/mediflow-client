/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BooleanResponseDto } from "../models/BooleanResponseDto";
import type { CreateMedicationTypeDto } from "../models/CreateMedicationTypeDto";
import type { MedicationTypeDtoCollectionDto } from "../models/MedicationTypeDtoCollectionDto";
import type { MedicationTypeDtoListResponseDto } from "../models/MedicationTypeDtoListResponseDto";
import type { MedicationTypeDtoResponseDto } from "../models/MedicationTypeDtoResponseDto";
import type { UpdateMedicationTypeDto } from "../models/UpdateMedicationTypeDto";
import type { CancelablePromise } from "../core/CancelablePromise";
import { OpenAPI } from "../core/OpenAPI";
import { request as __request } from "../core/request";
export class MedicationTypeService {
    /**
     * GetAllMedicationTypes
     * Retrieve all paginated medication types in the system.
     * @returns MedicationTypeDtoCollectionDto OK
     * @throws ApiError
     */
    public static getAllMedicationTypes({
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
    }): CancelablePromise<MedicationTypeDtoCollectionDto> {
        return __request(OpenAPI, {
            method: "GET",
            url: "/api/v1/medication/type",
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
     * CreateMedicationType
     * Creates a new record of medicationType.
     * @returns BooleanResponseDto OK
     * @throws ApiError
     */
    public static createMedicationType({
        requestBody
    }: {
        requestBody?: CreateMedicationTypeDto;
    }): CancelablePromise<BooleanResponseDto> {
        return __request(OpenAPI, {
            method: "POST",
            url: "/api/v1/medication/type",
            body: requestBody,
            mediaType: "application/json"
        });
    }
    /**
     * GetAllMedicationTypesList
     * Retrieve all non-paginated medication types in the system.
     * @returns MedicationTypeDtoListResponseDto OK
     * @throws ApiError
     */
    public static getAllMedicationTypesList({
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
    }): CancelablePromise<MedicationTypeDtoListResponseDto> {
        return __request(OpenAPI, {
            method: "GET",
            url: "/api/v1/medication/type/list",
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
     * GetMedicationTypeById
     * Retrieve the respective medicationType via its identifier in the system.
     * @returns MedicationTypeDtoResponseDto OK
     * @throws ApiError
     */
    public static getMedicationTypeById({
        medicationTypeId
    }: {
        medicationTypeId: string;
    }): CancelablePromise<MedicationTypeDtoResponseDto> {
        return __request(OpenAPI, {
            method: "GET",
            url: "/api/v1/medication/type/{medicationTypeId}",
            path: {
                medicationTypeId: medicationTypeId
            }
        });
    }
    /**
     * UpdateMedicationType
     * Updates an existing record of medicationType.
     * @returns BooleanResponseDto OK
     * @throws ApiError
     */
    public static updateMedicationType({
        medicationTypeId,
        requestBody
    }: {
        medicationTypeId: string;
        requestBody?: UpdateMedicationTypeDto;
    }): CancelablePromise<BooleanResponseDto> {
        return __request(OpenAPI, {
            method: "PUT",
            url: "/api/v1/medication/type/{medicationTypeId}",
            path: {
                medicationTypeId: medicationTypeId
            },
            body: requestBody,
            mediaType: "application/json"
        });
    }
    /**
     * ActivateDeactivateMedicationType
     * Updates the activation status of a medicationType.
     * @returns BooleanResponseDto OK
     * @throws ApiError
     */
    public static activateDeactivateMedicationType({
        medicationTypeId
    }: {
        medicationTypeId: string;
    }): CancelablePromise<BooleanResponseDto> {
        return __request(OpenAPI, {
            method: "PATCH",
            url: "/api/v1/medication/type/{medicationTypeId}/status",
            path: {
                medicationTypeId: medicationTypeId
            }
        });
    }
}
