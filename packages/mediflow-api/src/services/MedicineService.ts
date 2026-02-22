/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BooleanResponseDto } from "../models/BooleanResponseDto";
import type { CreateMedicineDto } from "../models/CreateMedicineDto";
import type { MedicineDtoCollectionDto } from "../models/MedicineDtoCollectionDto";
import type { MedicineDtoListResponseDto } from "../models/MedicineDtoListResponseDto";
import type { MedicineDtoResponseDto } from "../models/MedicineDtoResponseDto";
import type { UpdateMedicineDto } from "../models/UpdateMedicineDto";
import type { CancelablePromise } from "../core/CancelablePromise";
import { OpenAPI } from "../core/OpenAPI";
import { request as __request } from "../core/request";
export class MedicineService {
    /**
     * GetAllMedicines
     * Retrieve all paginated medicines in the system.
     * @returns MedicineDtoCollectionDto OK
     * @throws ApiError
     */
    public static getAllMedicines({
        pageNumber,
        pageSize,
        globalSearch,
        isActive,
        orderBys,
        medicationTypeIds,
        title,
        description,
        format
    }: {
        pageNumber?: number;
        pageSize?: number;
        globalSearch?: string;
        isActive?: Array<boolean>;
        orderBys?: Array<string>;
        medicationTypeIds?: Array<string>;
        title?: string;
        description?: string;
        format?: string;
    }): CancelablePromise<MedicineDtoCollectionDto> {
        return __request(OpenAPI, {
            method: "GET",
            url: "/api/v1/medicine",
            query: {
                PageNumber: pageNumber,
                PageSize: pageSize,
                GlobalSearch: globalSearch,
                IsActive: isActive,
                OrderBys: orderBys,
                medicationTypeIds: medicationTypeIds,
                title: title,
                description: description,
                format: format
            }
        });
    }
    /**
     * CreateMedicine
     * Creates a new record of medicine.
     * @returns BooleanResponseDto OK
     * @throws ApiError
     */
    public static createMedicine({
        requestBody
    }: {
        requestBody?: CreateMedicineDto;
    }): CancelablePromise<BooleanResponseDto> {
        return __request(OpenAPI, {
            method: "POST",
            url: "/api/v1/medicine",
            body: requestBody,
            mediaType: "application/json"
        });
    }
    /**
     * GetAllMedicinesList
     * Retrieve all non-paginated medicines in the system.
     * @returns MedicineDtoListResponseDto OK
     * @throws ApiError
     */
    public static getAllMedicinesList({
        globalSearch,
        isActive,
        orderBys,
        medicationTypeIds,
        title,
        description,
        format
    }: {
        globalSearch?: string;
        isActive?: Array<boolean>;
        orderBys?: Array<string>;
        medicationTypeIds?: Array<string>;
        title?: string;
        description?: string;
        format?: string;
    }): CancelablePromise<MedicineDtoListResponseDto> {
        return __request(OpenAPI, {
            method: "GET",
            url: "/api/v1/medicine/list",
            query: {
                GlobalSearch: globalSearch,
                IsActive: isActive,
                OrderBys: orderBys,
                medicationTypeIds: medicationTypeIds,
                title: title,
                description: description,
                format: format
            }
        });
    }
    /**
     * GetMedicineById
     * Retrieve the respective medicine via its identifier in the system.
     * @returns MedicineDtoResponseDto OK
     * @throws ApiError
     */
    public static getMedicineById({ medicineId }: { medicineId: string }): CancelablePromise<MedicineDtoResponseDto> {
        return __request(OpenAPI, {
            method: "GET",
            url: "/api/v1/medicine/{medicineId}",
            path: {
                medicineId: medicineId
            }
        });
    }
    /**
     * UpdateMedicine
     * Updates an existing record of medicine.
     * @returns BooleanResponseDto OK
     * @throws ApiError
     */
    public static updateMedicine({
        medicineId,
        requestBody
    }: {
        medicineId: string;
        requestBody?: UpdateMedicineDto;
    }): CancelablePromise<BooleanResponseDto> {
        return __request(OpenAPI, {
            method: "PUT",
            url: "/api/v1/medicine/{medicineId}",
            path: {
                medicineId: medicineId
            },
            body: requestBody,
            mediaType: "application/json"
        });
    }
    /**
     * ActivateDeactivateMedicine
     * Updates the activation status of a medicine.
     * @returns BooleanResponseDto OK
     * @throws ApiError
     */
    public static activateDeactivateMedicine({
        medicineId
    }: {
        medicineId: string;
    }): CancelablePromise<BooleanResponseDto> {
        return __request(OpenAPI, {
            method: "PATCH",
            url: "/api/v1/medicine/{medicineId}/status",
            path: {
                medicineId: medicineId
            }
        });
    }
}
