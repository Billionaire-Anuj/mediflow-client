/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { NotificationType } from "./NotificationType";
export type NotificationDto = {
    id?: string;
    isActive?: boolean;
    userId?: string;
    type?: NotificationType;
    title?: string | null;
    message?: string | null;
    actionUrl?: string | null;
    isRead?: boolean;
    readAt?: string | null;
    createdAt?: string;
};
