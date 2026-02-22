/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { LoginEventType } from "../models/LoginEventType";
import type { LoginStatus } from "../models/LoginStatus";
import type { UserLoginLogDtoCollectionDto } from "../models/UserLoginLogDtoCollectionDto";
import type { UserLoginLogDtoListResponseDto } from "../models/UserLoginLogDtoListResponseDto";
import type { UserLoginLogDtoResponseDto } from "../models/UserLoginLogDtoResponseDto";
import type { CancelablePromise } from "../core/CancelablePromise";
import { OpenAPI } from "../core/OpenAPI";
import { request as __request } from "../core/request";
export class UserLoginLogService {
    /**
     * GetAllUserLoginLogs
     * Retrieve all paginated user login logs in the system.
     * @returns UserLoginLogDtoCollectionDto OK
     * @throws ApiError
     */
    public static getAllUserLoginLogs({
        pageNumber,
        pageSize,
        globalSearch,
        isActive,
        orderBys,
        userIds,
        emailAddressOrUsername,
        eventTypes,
        statuses,
        ipAddress,
        userAgent,
        isActiveSession,
        minimumActionDate,
        maximumActionDate,
        minimumLoggedOutDate,
        maximumLoggedOutDate
    }: {
        pageNumber?: number;
        pageSize?: number;
        globalSearch?: string;
        isActive?: Array<boolean>;
        orderBys?: Array<string>;
        userIds?: Array<string>;
        emailAddressOrUsername?: string;
        eventTypes?: Array<LoginEventType>;
        statuses?: Array<LoginStatus>;
        ipAddress?: string;
        userAgent?: string;
        isActiveSession?: Array<boolean>;
        minimumActionDate?: string;
        maximumActionDate?: string;
        minimumLoggedOutDate?: string;
        maximumLoggedOutDate?: string;
    }): CancelablePromise<UserLoginLogDtoCollectionDto> {
        return __request(OpenAPI, {
            method: "GET",
            url: "/api/v1/user/login/log",
            query: {
                PageNumber: pageNumber,
                PageSize: pageSize,
                GlobalSearch: globalSearch,
                IsActive: isActive,
                OrderBys: orderBys,
                userIds: userIds,
                emailAddressOrUsername: emailAddressOrUsername,
                eventTypes: eventTypes,
                statuses: statuses,
                ipAddress: ipAddress,
                userAgent: userAgent,
                isActiveSession: isActiveSession,
                minimumActionDate: minimumActionDate,
                maximumActionDate: maximumActionDate,
                minimumLoggedOutDate: minimumLoggedOutDate,
                maximumLoggedOutDate: maximumLoggedOutDate
            }
        });
    }
    /**
     * GetAllUserLoginLogsList
     * Retrieve all paginated user login logs in the system.
     * @returns UserLoginLogDtoListResponseDto OK
     * @throws ApiError
     */
    public static getAllUserLoginLogsList({
        globalSearch,
        isActive,
        orderBys,
        userIds,
        emailAddressOrUsername,
        eventTypes,
        statuses,
        ipAddress,
        userAgent,
        isActiveSession,
        minimumActionDate,
        maximumActionDate,
        minimumLoggedOutDate,
        maximumLoggedOutDate
    }: {
        globalSearch?: string;
        isActive?: Array<boolean>;
        orderBys?: Array<string>;
        userIds?: Array<string>;
        emailAddressOrUsername?: string;
        eventTypes?: Array<LoginEventType>;
        statuses?: Array<LoginStatus>;
        ipAddress?: string;
        userAgent?: string;
        isActiveSession?: Array<boolean>;
        minimumActionDate?: string;
        maximumActionDate?: string;
        minimumLoggedOutDate?: string;
        maximumLoggedOutDate?: string;
    }): CancelablePromise<UserLoginLogDtoListResponseDto> {
        return __request(OpenAPI, {
            method: "GET",
            url: "/api/v1/user/login/log/list",
            query: {
                GlobalSearch: globalSearch,
                IsActive: isActive,
                OrderBys: orderBys,
                userIds: userIds,
                emailAddressOrUsername: emailAddressOrUsername,
                eventTypes: eventTypes,
                statuses: statuses,
                ipAddress: ipAddress,
                userAgent: userAgent,
                isActiveSession: isActiveSession,
                minimumActionDate: minimumActionDate,
                maximumActionDate: maximumActionDate,
                minimumLoggedOutDate: minimumLoggedOutDate,
                maximumLoggedOutDate: maximumLoggedOutDate
            }
        });
    }
    /**
     * GetAllUserLoginLogsByUserId
     * Retrieve all paginated user login logs in the system via user identifier query.
     * @returns UserLoginLogDtoCollectionDto OK
     * @throws ApiError
     */
    public static getAllUserLoginLogsByUserId({
        userId,
        pageNumber,
        pageSize,
        globalSearch,
        isActive,
        orderBys,
        emailAddressOrUsername,
        eventTypes,
        statuses,
        ipAddress,
        userAgent,
        isActiveSession,
        minimumActionDate,
        maximumActionDate,
        minimumLoggedOutDate,
        maximumLoggedOutDate
    }: {
        userId: string;
        pageNumber?: number;
        pageSize?: number;
        globalSearch?: string;
        isActive?: Array<boolean>;
        orderBys?: Array<string>;
        emailAddressOrUsername?: string;
        eventTypes?: Array<LoginEventType>;
        statuses?: Array<LoginStatus>;
        ipAddress?: string;
        userAgent?: string;
        isActiveSession?: Array<boolean>;
        minimumActionDate?: string;
        maximumActionDate?: string;
        minimumLoggedOutDate?: string;
        maximumLoggedOutDate?: string;
    }): CancelablePromise<UserLoginLogDtoCollectionDto> {
        return __request(OpenAPI, {
            method: "GET",
            url: "/api/v1/user/login/log/user/{userId}",
            path: {
                userId: userId
            },
            query: {
                PageNumber: pageNumber,
                PageSize: pageSize,
                GlobalSearch: globalSearch,
                IsActive: isActive,
                OrderBys: orderBys,
                emailAddressOrUsername: emailAddressOrUsername,
                eventTypes: eventTypes,
                statuses: statuses,
                ipAddress: ipAddress,
                userAgent: userAgent,
                isActiveSession: isActiveSession,
                minimumActionDate: minimumActionDate,
                maximumActionDate: maximumActionDate,
                minimumLoggedOutDate: minimumLoggedOutDate,
                maximumLoggedOutDate: maximumLoggedOutDate
            }
        });
    }
    /**
     * GetAllUserLoginLogsByUserIdList
     * Retrieve all non-paginated user login logs in the system via user identifier query.
     * @returns UserLoginLogDtoListResponseDto OK
     * @throws ApiError
     */
    public static getAllUserLoginLogsByUserIdList({
        userId,
        globalSearch,
        isActive,
        orderBys,
        emailAddressOrUsername,
        eventTypes,
        statuses,
        ipAddress,
        userAgent,
        isActiveSession,
        minimumActionDate,
        maximumActionDate,
        minimumLoggedOutDate,
        maximumLoggedOutDate
    }: {
        userId: string;
        globalSearch?: string;
        isActive?: Array<boolean>;
        orderBys?: Array<string>;
        emailAddressOrUsername?: string;
        eventTypes?: Array<LoginEventType>;
        statuses?: Array<LoginStatus>;
        ipAddress?: string;
        userAgent?: string;
        isActiveSession?: Array<boolean>;
        minimumActionDate?: string;
        maximumActionDate?: string;
        minimumLoggedOutDate?: string;
        maximumLoggedOutDate?: string;
    }): CancelablePromise<UserLoginLogDtoListResponseDto> {
        return __request(OpenAPI, {
            method: "GET",
            url: "/api/v1/user/login/log/list/user/{userId}",
            path: {
                userId: userId
            },
            query: {
                GlobalSearch: globalSearch,
                IsActive: isActive,
                OrderBys: orderBys,
                emailAddressOrUsername: emailAddressOrUsername,
                eventTypes: eventTypes,
                statuses: statuses,
                ipAddress: ipAddress,
                userAgent: userAgent,
                isActiveSession: isActiveSession,
                minimumActionDate: minimumActionDate,
                maximumActionDate: maximumActionDate,
                minimumLoggedOutDate: minimumLoggedOutDate,
                maximumLoggedOutDate: maximumLoggedOutDate
            }
        });
    }
    /**
     * GetUserLoginLogById
     * Retrieve a record user login logs in the system via the identifier.
     * @returns UserLoginLogDtoResponseDto OK
     * @throws ApiError
     */
    public static getUserLoginLogById({
        userLoginLogId
    }: {
        userLoginLogId: string;
    }): CancelablePromise<UserLoginLogDtoResponseDto> {
        return __request(OpenAPI, {
            method: "GET",
            url: "/api/v1/user/login/log/{userLoginLogId}",
            path: {
                userLoginLogId: userLoginLogId
            }
        });
    }
}
