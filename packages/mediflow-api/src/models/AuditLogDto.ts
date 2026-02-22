/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AuditLogHistoryDto } from "./AuditLogHistoryDto";
import type { ChangeType } from "./ChangeType";
import type { UserDto } from "./UserDto";
export type AuditLogDto = {
    id?: string;
    isActive?: boolean;
    user?: UserDto;
    changeType?: ChangeType;
    remarks?: string | null;
    isAutomation?: boolean;
    auditedDate?: string;
    auditLogHistories?: Array<AuditLogHistoryDto> | null;
};
