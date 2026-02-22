/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { LoginEventType } from "./LoginEventType";
import type { LoginStatus } from "./LoginStatus";
import type { UserDto } from "./UserDto";
export type UserLoginLogDto = {
    user?: UserDto;
    emailAddressOrUsername?: string | null;
    eventType?: LoginEventType;
    status?: LoginStatus;
    accessToken?: string | null;
    ipAddress?: string | null;
    userAgent?: string | null;
    isActiveSession?: boolean;
    actionDate?: string;
    loggedOutDate?: string | null;
};
