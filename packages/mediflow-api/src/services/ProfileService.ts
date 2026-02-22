/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BooleanResponseDto } from "../models/BooleanResponseDto";
import type { ChangePasswordDto } from "../models/ChangePasswordDto";
import type { ProfileDtoResponseDto } from "../models/ProfileDtoResponseDto";
import type { RoleDtoResponseDto } from "../models/RoleDtoResponseDto";
import type { TwoFactorSetupDtoResponseDto } from "../models/TwoFactorSetupDtoResponseDto";
import type { TwoFactorStatusDtoResponseDto } from "../models/TwoFactorStatusDtoResponseDto";
import type { TwoFactorVerificationDto } from "../models/TwoFactorVerificationDto";
import type { UpdateProfileDto } from "../models/UpdateProfileDto";
import type { CancelablePromise } from "../core/CancelablePromise";
import { OpenAPI } from "../core/OpenAPI";
import { request as __request } from "../core/request";
export class ProfileService {
    /**
     * GetProfile
     * Retrieve the logged in user's respective profile details.
     * @returns ProfileDtoResponseDto OK
     * @throws ApiError
     */
    public static getProfile(): CancelablePromise<ProfileDtoResponseDto> {
        return __request(OpenAPI, {
            method: "GET",
            url: "/api/v1/profile"
        });
    }
    /**
     * UpdateProfile
     * Update the logged in user's profile details.
     * @returns BooleanResponseDto OK
     * @throws ApiError
     */
    public static updateProfile({
        requestBody
    }: {
        requestBody?: UpdateProfileDto;
    }): CancelablePromise<BooleanResponseDto> {
        return __request(OpenAPI, {
            method: "PUT",
            url: "/api/v1/profile",
            body: requestBody,
            mediaType: "application/json"
        });
    }
    /**
     * GetAssignedRole
     * Retrieves the logged in user's assigned roles.
     * @returns RoleDtoResponseDto OK
     * @throws ApiError
     */
    public static getAssignedRole(): CancelablePromise<RoleDtoResponseDto> {
        return __request(OpenAPI, {
            method: "GET",
            url: "/api/v1/profile/assigned/role"
        });
    }
    /**
     * UpdateProfileImage
     * Update the logged in user's profile image.
     * @returns BooleanResponseDto OK
     * @throws ApiError
     */
    public static updateProfileImage({
        formData
    }: {
        formData?: {
            ProfileImage: Blob;
        };
    }): CancelablePromise<BooleanResponseDto> {
        return __request(OpenAPI, {
            method: "PUT",
            url: "/api/v1/profile/image",
            formData: formData,
            mediaType: "multipart/form-data"
        });
    }
    /**
     * ChangePassword
     * Change the logged in user's password.
     * @returns BooleanResponseDto OK
     * @throws ApiError
     */
    public static changePassword({
        requestBody
    }: {
        requestBody?: ChangePasswordDto;
    }): CancelablePromise<BooleanResponseDto> {
        return __request(OpenAPI, {
            method: "PUT",
            url: "/api/v1/profile/change/password",
            body: requestBody,
            mediaType: "application/json"
        });
    }
    /**
     * GetTwoFactorStatus
     * Retrieve the logged in user's 2FA status.
     * @returns TwoFactorStatusDtoResponseDto OK
     * @throws ApiError
     */
    public static getTwoFactorStatus(): CancelablePromise<TwoFactorStatusDtoResponseDto> {
        return __request(OpenAPI, {
            method: "GET",
            url: "/api/v1/profile/configuration/2fa"
        });
    }
    /**
     * EnableTwoFactorAuthentication
     * Enables the logged in user's 2FA status.
     * @returns TwoFactorSetupDtoResponseDto OK
     * @throws ApiError
     */
    public static enableTwoFactorAuthentication(): CancelablePromise<TwoFactorSetupDtoResponseDto> {
        return __request(OpenAPI, {
            method: "POST",
            url: "/api/v1/profile/configuration/2fa/enable"
        });
    }
    /**
     * ConfirmTwoFactorAuthentication
     * Confirms the logged in user's 2FA status.
     * @returns BooleanResponseDto OK
     * @throws ApiError
     */
    public static confirmTwoFactorAuthentication({
        requestBody
    }: {
        requestBody?: TwoFactorVerificationDto;
    }): CancelablePromise<BooleanResponseDto> {
        return __request(OpenAPI, {
            method: "POST",
            url: "/api/v1/profile/configuration/2fa/confirm",
            body: requestBody,
            mediaType: "application/json"
        });
    }
    /**
     * DisableTwoFactorAuthentication
     * Disables the logged in user's 2FA status.
     * @returns BooleanResponseDto OK
     * @throws ApiError
     */
    public static disableTwoFactorAuthentication(): CancelablePromise<BooleanResponseDto> {
        return __request(OpenAPI, {
            method: "DELETE",
            url: "/api/v1/profile/configuration/2fa/disable"
        });
    }
}
