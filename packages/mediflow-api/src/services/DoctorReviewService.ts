/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BooleanResponseDto } from "../models/BooleanResponseDto";
import type { CreateDoctorReviewDto } from "../models/CreateDoctorReviewDto";
import type { DoctorReviewDtoListResponseDto } from "../models/DoctorReviewDtoListResponseDto";
import type { CancelablePromise } from "../core/CancelablePromise";
import { OpenAPI } from "../core/OpenAPI";
import { request as __request } from "../core/request";

export class DoctorReviewService {
    /**
     * GetDoctorReviewsByDoctorId
     * Retrieve all reviews for a doctor.
     * @returns DoctorReviewDtoListResponseDto OK
     * @throws ApiError
     */
    public static getDoctorReviewsByDoctorId({
        doctorId
    }: {
        doctorId: string;
    }): CancelablePromise<DoctorReviewDtoListResponseDto> {
        return __request(OpenAPI, {
            method: "GET",
            url: "/api/v1/doctor/{doctorId}/reviews",
            path: {
                doctorId: doctorId
            }
        });
    }

    /**
     * CreateDoctorReview
     * Creates a review for a completed appointment.
     * @returns BooleanResponseDto OK
     * @throws ApiError
     */
    public static createDoctorReview({
        appointmentId,
        requestBody
    }: {
        appointmentId: string;
        requestBody?: CreateDoctorReviewDto;
    }): CancelablePromise<BooleanResponseDto> {
        return __request(OpenAPI, {
            method: "POST",
            url: "/api/v1/appointment/{appointmentId}/review",
            path: {
                appointmentId: appointmentId
            },
            body: requestBody,
            mediaType: "application/json"
        });
    }
}
