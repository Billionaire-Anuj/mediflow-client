/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BooleanResponseDto } from "../models/BooleanResponseDto";
import type { CreateRoleDto } from "../models/CreateRoleDto";
import type { RoleDtoCollectionDto } from "../models/RoleDtoCollectionDto";
import type { RoleDtoListResponseDto } from "../models/RoleDtoListResponseDto";
import type { RoleDtoResponseDto } from "../models/RoleDtoResponseDto";
import type { UpdateRoleDto } from "../models/UpdateRoleDto";
import type { CancelablePromise } from "../core/CancelablePromise";
import { OpenAPI } from "../core/OpenAPI";
import { request as __request } from "../core/request";
export class RoleService {
    /**
     * GetAllRoles
     * Retrieve all paginated roles in the system.
     * @returns RoleDtoCollectionDto OK
     * @throws ApiError
     */
    public static getAllRoles({
        pageNumber,
        pageSize,
        globalSearch,
        isActive,
        orderBys,
        name,
        description
    }: {
        pageNumber?: number;
        pageSize?: number;
        globalSearch?: string;
        isActive?: Array<boolean>;
        orderBys?: Array<string>;
        name?: string;
        description?: string;
    }): CancelablePromise<RoleDtoCollectionDto> {
        return __request(OpenAPI, {
            method: "GET",
            url: "/api/v1/role",
            query: {
                PageNumber: pageNumber,
                PageSize: pageSize,
                GlobalSearch: globalSearch,
                IsActive: isActive,
                OrderBys: orderBys,
                name: name,
                description: description
            }
        });
    }
    /**
     * CreateRole
     * Creates a new record of role.
     * @returns BooleanResponseDto OK
     * @throws ApiError
     */
    public static createRole({ requestBody }: { requestBody?: CreateRoleDto }): CancelablePromise<BooleanResponseDto> {
        return __request(OpenAPI, {
            method: "POST",
            url: "/api/v1/role",
            body: requestBody,
            mediaType: "application/json"
        });
    }
    /**
     * GetAllRolesList
     * Retrieve all non-paginated roles in the system.
     * @returns RoleDtoListResponseDto OK
     * @throws ApiError
     */
    public static getAllRolesList({
        globalSearch,
        isActive,
        orderBys,
        name,
        description
    }: {
        globalSearch?: string;
        isActive?: Array<boolean>;
        orderBys?: Array<string>;
        name?: string;
        description?: string;
    }): CancelablePromise<RoleDtoListResponseDto> {
        return __request(OpenAPI, {
            method: "GET",
            url: "/api/v1/role/list",
            query: {
                GlobalSearch: globalSearch,
                IsActive: isActive,
                OrderBys: orderBys,
                name: name,
                description: description
            }
        });
    }
    /**
     * GetAllAvailableRoles
     * Retrieve all paginated available roles in the system.
     * @returns RoleDtoCollectionDto OK
     * @throws ApiError
     */
    public static getAllAvailableRoles({
        pageNumber,
        pageSize,
        globalSearch,
        isActive,
        orderBys,
        name,
        description
    }: {
        pageNumber?: number;
        pageSize?: number;
        globalSearch?: string;
        isActive?: Array<boolean>;
        orderBys?: Array<string>;
        name?: string;
        description?: string;
    }): CancelablePromise<RoleDtoCollectionDto> {
        return __request(OpenAPI, {
            method: "GET",
            url: "/api/v1/role/available",
            query: {
                PageNumber: pageNumber,
                PageSize: pageSize,
                GlobalSearch: globalSearch,
                IsActive: isActive,
                OrderBys: orderBys,
                name: name,
                description: description
            }
        });
    }
    /**
     * GetAllAvailableRolesList
     * Retrieve all non-paginated available roles in the system.
     * @returns RoleDtoListResponseDto OK
     * @throws ApiError
     */
    public static getAllAvailableRolesList({
        globalSearch,
        isActive,
        orderBys,
        name,
        description
    }: {
        globalSearch?: string;
        isActive?: Array<boolean>;
        orderBys?: Array<string>;
        name?: string;
        description?: string;
    }): CancelablePromise<RoleDtoListResponseDto> {
        return __request(OpenAPI, {
            method: "GET",
            url: "/api/v1/role/list/available",
            query: {
                GlobalSearch: globalSearch,
                IsActive: isActive,
                OrderBys: orderBys,
                name: name,
                description: description
            }
        });
    }
    /**
     * GetRoleById
     * Retrieve the respective role via its identifier in the system.
     * @returns RoleDtoResponseDto OK
     * @throws ApiError
     */
    public static getRoleById({ roleId }: { roleId: string }): CancelablePromise<RoleDtoResponseDto> {
        return __request(OpenAPI, {
            method: "GET",
            url: "/api/v1/role/{roleId}",
            path: {
                roleId: roleId
            }
        });
    }
    /**
     * UpdateRole
     * Updates an existing record of role.
     * @returns BooleanResponseDto OK
     * @throws ApiError
     */
    public static updateRole({
        roleId,
        requestBody
    }: {
        roleId: string;
        requestBody?: UpdateRoleDto;
    }): CancelablePromise<BooleanResponseDto> {
        return __request(OpenAPI, {
            method: "PUT",
            url: "/api/v1/role/{roleId}",
            path: {
                roleId: roleId
            },
            body: requestBody,
            mediaType: "application/json"
        });
    }
    /**
     * ActivateDeactivateRole
     * Updates the activation status of a role.
     * @returns BooleanResponseDto OK
     * @throws ApiError
     */
    public static activateDeactivateRole({ roleId }: { roleId: string }): CancelablePromise<BooleanResponseDto> {
        return __request(OpenAPI, {
            method: "PATCH",
            url: "/api/v1/role/{roleId}/status",
            path: {
                roleId: roleId
            }
        });
    }
}
