/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { EmailProcess } from "./EmailProcess";
import type { OutboxStatus } from "./OutboxStatus";
export type EmailOutboxDto = {
    id?: string;
    isActive?: boolean;
    toEmail?: string | null;
    name?: string | null;
    subject?: string | null;
    process?: EmailProcess;
    payloadJson?: string | null;
    attemptCount?: number;
    nextAttemptDate?: string;
    status?: OutboxStatus;
    scheduledDate?: string;
    sentDate?: string | null;
    lastError?: string | null;
};
