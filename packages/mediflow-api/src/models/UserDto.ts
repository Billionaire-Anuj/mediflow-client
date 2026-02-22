/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AssetDto } from "./AssetDto";
import type { Gender } from "./Gender";
import type { RoleDto } from "./RoleDto";
export type UserDto = {
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
};
