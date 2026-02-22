/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { FieldDataType } from "./FieldDataType";
export type AuditLogHistoryDto = {
    id?: string;
    isActive?: boolean;
    fieldName?: string | null;
    fieldDataType?: FieldDataType;
    oldValue?: any;
    newValue?: any;
    remarks?: string | null;
};
