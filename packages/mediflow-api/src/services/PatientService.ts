/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PatientProfileDtoResponseDto } from "../models/PatientProfileDtoResponseDto";
import type { CancelablePromise } from "../core/CancelablePromise";
import { OpenAPI } from "../core/OpenAPI";
import { request as __request } from "../core/request";
export class PatientService {
    /**
     * GetPatientProfile
     * Retrieve the logged in patient's profile.
     * @returns PatientProfileDtoResponseDto OK
     * @throws ApiError
     */
    public static getPatientProfile(): CancelablePromise<PatientProfileDtoResponseDto> {
        return __request(OpenAPI, {
            method: "GET",
            url: "/api/v1/patient/profile"
        });
    }
    /**
     * GetPatientProfileById
     * Retrieve the respective patient profile via its identifier in the system.
     * @returns PatientProfileDtoResponseDto OK
     * @throws ApiError
     */
    public static getPatientProfileById({
        patientId
    }: {
        patientId: string;
    }): CancelablePromise<PatientProfileDtoResponseDto> {
        return __request(OpenAPI, {
            method: "GET",
            url: "/api/v1/patient/{patientId}",
            path: {
                patientId: patientId
            }
        });
    }
}
