/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BooleanResponseDto } from "../models/BooleanResponseDto";
import type { NotificationDtoListResponseDto } from "../models/NotificationDtoListResponseDto";
import type { NotificationType } from "../models/NotificationType";
import type { CancelablePromise } from "../core/CancelablePromise";
import { OpenAPI } from "../core/OpenAPI";
import { request as __request } from "../core/request";

export class NotificationService {
    /**
     * GetMyNotifications
     * Retrieve all notifications for the logged in user.
     * @returns NotificationDtoListResponseDto OK
     * @throws ApiError
     */
    public static getMyNotificationsList({
        globalSearch,
        isActive,
        orderBys,
        types,
        isRead
    }: {
        globalSearch?: string;
        isActive?: Array<boolean>;
        orderBys?: Array<string>;
        types?: Array<NotificationType>;
        isRead?: boolean;
    }): CancelablePromise<NotificationDtoListResponseDto> {
        return __request(OpenAPI, {
            method: "GET",
            url: "/api/v1/notification/list",
            query: {
                GlobalSearch: globalSearch,
                IsActive: isActive,
                OrderBys: orderBys,
                types: types,
                isRead: isRead
            }
        });
    }

    /**
     * MarkNotificationAsRead
     * Marks the respective notification as read.
     * @returns BooleanResponseDto OK
     * @throws ApiError
     */
    public static markNotificationAsRead({ notificationId }: { notificationId: string }): CancelablePromise<BooleanResponseDto> {
        return __request(OpenAPI, {
            method: "PATCH",
            url: "/api/v1/notification/{notificationId}/read",
            path: {
                notificationId: notificationId
            }
        });
    }

    /**
     * MarkAllNotificationsAsRead
     * Marks all notifications for the logged in user as read.
     * @returns BooleanResponseDto OK
     * @throws ApiError
     */
    public static markAllNotificationsAsRead(): CancelablePromise<BooleanResponseDto> {
        return __request(OpenAPI, {
            method: "PATCH",
            url: "/api/v1/notification/read-all"
        });
    }
}
