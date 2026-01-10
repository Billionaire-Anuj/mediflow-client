/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { LoginRequest } from "../models/LoginRequest";
import type { RegisterRequest } from "../models/RegisterRequest";
import type { CancelablePromise } from "../core/CancelablePromise";
import { OpenAPI } from "../core/OpenAPI";
import { request as __request } from "../core/request";
export class AuthService {
    /**
     * @returns any OK
     * @throws ApiError
     */
    public static postApiAuthenticationRegister({
        requestBody
    }: {
        requestBody?: RegisterRequest;
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: "POST",
            url: "/api/authentication/register",
            body: requestBody,
            mediaType: "application/json"
        });
    }
    /**
     * @returns any OK
     * @throws ApiError
     */
    public static postApiAuthenticationLogin({ requestBody }: { requestBody?: LoginRequest }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: "POST",
            url: "/api/authentication/login",
            body: requestBody,
            mediaType: "application/json"
        });
    }
    /**
     * @returns any OK
     * @throws ApiError
     */
    public static getApiAuthenticationProfile(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: "GET",
            url: "/api/authentication/profile"
        });
    }
}
