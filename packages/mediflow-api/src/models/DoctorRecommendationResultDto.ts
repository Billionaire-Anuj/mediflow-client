/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { DoctorDirectoryDto } from "./DoctorDirectoryDto";
import type { DoctorProfileDto } from "./DoctorProfileDto";
export type DoctorRecommendationResultDto = {
    query?: string | null;
    recommendedSpecialization?: string | null;
    doctors?: Array<DoctorProfileDto> | null;
    datasetFallback?: Array<DoctorDirectoryDto> | null;
};
