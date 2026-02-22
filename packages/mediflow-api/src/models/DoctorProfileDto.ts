/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AssetDto } from "./AssetDto";
import type { Gender } from "./Gender";
import type { RoleDto } from "./RoleDto";
import type { ScheduleDto } from "./ScheduleDto";
import type { SpecializationDto } from "./SpecializationDto";
export type DoctorProfileDto = {
    id?: string;
    isActive?: boolean;
    name?: string | null;
    emailAddress?: string | null;
    username?: string | null;
    phoneNumber?: string | null;
    address?: string | null;
    is2FactorAuthenticationEnabled?: boolean;
    gender?: Gender;
    role?: RoleDto;
    profileImage?: AssetDto;
    about?: string | null;
    licenseNumber?: string | null;
    educationInformation?: string | null;
    experienceInformation?: string | null;
    consultationFee?: number;
    schedules?: Array<ScheduleDto> | null;
    specializations?: Array<SpecializationDto> | null;
};
