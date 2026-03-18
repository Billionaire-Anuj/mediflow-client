/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { DoctorRecommendationAssessmentDto } from "../models/DoctorRecommendationAssessmentDto";
import type { DoctorRecommendationResultDtoResponseDto } from "../models/DoctorRecommendationResultDtoResponseDto";
import type { CancelablePromise } from "../core/CancelablePromise";
import { OpenAPI } from "../core/OpenAPI";
import { request as __request } from "../core/request";
export class DoctorRecommendationService {
    /**
     * GetDoctorRecommendations
     * Recommend doctors based on user input (specialization or keywords).
     * @returns DoctorRecommendationResultDtoResponseDto OK
     * @throws ApiError
     */
    public static getDoctorRecommendations({
        query,
        city,
        limit = 5
    }: {
        query?: string;
        city?: string;
        limit?: number;
    }): CancelablePromise<DoctorRecommendationResultDtoResponseDto> {
        return __request(OpenAPI, {
            method: "GET",
            url: "/api/v1/doctor/recommendation",
            query: {
                query: query,
                city: city,
                limit: limit
            }
        });
    }

    /**
     * GetDoctorRecommendationsFromAssessment
     * Recommend doctors based on clinical assessment inputs.
     * @returns DoctorRecommendationResultDtoResponseDto OK
     * @throws ApiError
     */
    public static getDoctorRecommendationsFromAssessment({
        requestBody
    }: {
        requestBody?: DoctorRecommendationAssessmentDto;
    }): CancelablePromise<DoctorRecommendationResultDtoResponseDto> {
        return __request(OpenAPI, {
            method: "POST",
            url: "/api/v1/doctor/recommendation/assessment",
            body: requestBody,
            mediaType: "application/json"
        });
    }
}
