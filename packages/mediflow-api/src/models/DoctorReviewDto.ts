/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { UserDto } from "./UserDto";
export type DoctorReviewDto = {
    id?: string;
    isActive?: boolean;
    appointmentId?: string;
    doctorId?: string;
    patientId?: string;
    rating?: number;
    review?: string | null;
    createdAt?: string;
    patient?: UserDto;
};
