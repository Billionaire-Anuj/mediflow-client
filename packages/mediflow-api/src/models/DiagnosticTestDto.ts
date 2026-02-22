/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { DiagnosticTypeDto } from "./DiagnosticTypeDto";
export type DiagnosticTestDto = {
    id?: string;
    isActive?: boolean;
    diagnosticType?: DiagnosticTypeDto;
    title?: string | null;
    description?: string | null;
    specimen?: string | null;
};
