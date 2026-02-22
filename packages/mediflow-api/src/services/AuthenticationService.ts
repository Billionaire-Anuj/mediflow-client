/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AuthenticationDtoResponseDto } from "../models/AuthenticationDtoResponseDto";
import type { AuthenticationViaSpaDtoResponseDto } from "../models/AuthenticationViaSpaDtoResponseDto";
import type { BooleanResponseDto } from "../models/BooleanResponseDto";
import type { ForgotPasswordConfirmationDto } from "../models/ForgotPasswordConfirmationDto";
import type { ForgotPasswordResetDto } from "../models/ForgotPasswordResetDto";
import type { Login2FactorAuthenticationDto } from "../models/Login2FactorAuthenticationDto";
import type { LoginDto } from "../models/LoginDto";
import type { LoginSpaDtoResponseDto } from "../models/LoginSpaDtoResponseDto";
import type { TokenDtoResponseDto } from "../models/TokenDtoResponseDto";
import type { CancelablePromise } from "../core/CancelablePromise";
import { OpenAPI } from "../core/OpenAPI";
import { request as __request } from "../core/request";
export class AuthenticationService {
    /**
     * Login
     * Login using credentials.
     * @returns AuthenticationDtoResponseDto OK
     * @throws ApiError
     */
    public static login({ requestBody }: { requestBody?: LoginDto }): CancelablePromise<AuthenticationDtoResponseDto> {
        return __request(OpenAPI, {
            method: "POST",
            url: "/api/v1/authentication/login",
            body: requestBody,
            mediaType: "application/json"
        });
    }
    /**
     * LoginViaSpa
     * Login via SPA using credentials.
     * @returns AuthenticationViaSpaDtoResponseDto OK
     * @throws ApiError
     */
    public static loginViaSpa({
        requestBody
    }: {
        requestBody?: LoginDto;
    }): CancelablePromise<AuthenticationViaSpaDtoResponseDto> {
        return __request(OpenAPI, {
            method: "POST",
            url: "/api/v1/authentication/login/spa",
            body: requestBody,
            mediaType: "application/json"
        });
    }
    /**
     * Login2FactorAuthentication
     * Login with 2FA Credentials using credentials.
     * @returns TokenDtoResponseDto OK
     * @throws ApiError
     */
    public static login2FactorAuthentication({
        requestBody
    }: {
        requestBody?: Login2FactorAuthenticationDto;
    }): CancelablePromise<TokenDtoResponseDto> {
        return __request(OpenAPI, {
            method: "POST",
            url: "/api/v1/authentication/login/2fa",
            body: requestBody,
            mediaType: "application/json"
        });
    }
    /**
     * Login2FactorAuthenticationViaSpa
     * Login with 2FA Credentials via SPA using credentials.
     * @returns LoginSpaDtoResponseDto OK
     * @throws ApiError
     */
    public static login2FactorAuthenticationViaSpa({
        requestBody
    }: {
        requestBody?: Login2FactorAuthenticationDto;
    }): CancelablePromise<LoginSpaDtoResponseDto> {
        return __request(OpenAPI, {
            method: "POST",
            url: "/api/v1/authentication/login/2fa/spa",
            body: requestBody,
            mediaType: "application/json"
        });
    }
    /**
     * ForgetPasswordConfirmation
     * Triggers an email address for forgot password confirmation.
     * @returns BooleanResponseDto OK
     * @throws ApiError
     */
    public static forgetPasswordConfirmation({
        requestBody
    }: {
        requestBody?: ForgotPasswordConfirmationDto;
    }): CancelablePromise<BooleanResponseDto> {
        return __request(OpenAPI, {
            method: "POST",
            url: "/api/v1/authentication/forgot/password",
            body: requestBody,
            mediaType: "application/json"
        });
    }
    /**
     * ForgotPasswordVerification
     * Verifies the OTP and password confirmation.
     * @returns BooleanResponseDto OK
     * @throws ApiError
     */
    public static forgotPasswordVerification({
        requestBody
    }: {
        requestBody?: ForgotPasswordResetDto;
    }): CancelablePromise<BooleanResponseDto> {
        return __request(OpenAPI, {
            method: "POST",
            url: "/api/v1/authentication/forgot/password/verification",
            body: requestBody,
            mediaType: "application/json"
        });
    }
    /**
     * Logout
     * Logout from the application.
     * @returns BooleanResponseDto OK
     * @throws ApiError
     */
    public static logout(): CancelablePromise<BooleanResponseDto> {
        return __request(OpenAPI, {
            method: "POST",
            url: "/api/v1/authentication/logout"
        });
    }
}
