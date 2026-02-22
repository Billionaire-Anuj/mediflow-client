/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AssignedPermissionsDtoListResponseDto } from "../models/AssignedPermissionsDtoListResponseDto";
import type { BooleanResponseDto } from "../models/BooleanResponseDto";
import type { GrantPermissionsDto } from "../models/GrantPermissionsDto";
import type { CancelablePromise } from "../core/CancelablePromise";
import { OpenAPI } from "../core/OpenAPI";
import { request as __request } from "../core/request";
export class PermissionService {
    /**
     * GetAssignedPermissions
     * Retrieve the assigned permissions based on the active user's role.
     * @returns AssignedPermissionsDtoListResponseDto OK
     * @throws ApiError
     */
    public static getAssignedPermissions(): CancelablePromise<AssignedPermissionsDtoListResponseDto> {
        return __request(OpenAPI, {
            method: "GET",
            url: "/api/v1/permission"
        });
    }
    /**
     * GrantPermissions
     * Grant and revoke permission access to a specified role.
     * @returns BooleanResponseDto OK
     * @throws ApiError
     */
    public static grantPermissions({
        requestBody
    }: {
        requestBody?: GrantPermissionsDto;
    }): CancelablePromise<BooleanResponseDto> {
        return __request(OpenAPI, {
            method: "POST",
            url: "/api/v1/permission",
            body: requestBody,
            mediaType: "application/json"
        });
    }
    /**
     * GetAllocatedPermissions
     * Retrieve the allocated permissions based on their role.
     * @returns AssignedPermissionsDtoListResponseDto OK
     * @throws ApiError
     */
    public static getAllocatedPermissions({
        roleId
    }: {
        roleId: string;
    }): CancelablePromise<AssignedPermissionsDtoListResponseDto> {
        return __request(OpenAPI, {
            method: "GET",
            url: "/api/v1/permission/{roleId}",
            path: {
                roleId: roleId
            }
        });
    }
}
