import { ApiError, OpenAPI } from "@mediflow/mediflow-api";

const baseUrl = import.meta.env.VITE_API_URL || "/api";

OpenAPI.BASE = baseUrl;
OpenAPI.WITH_CREDENTIALS = true;
OpenAPI.CREDENTIALS = "include";

export const API_BASE_URL = baseUrl;

type ResponseWithMessage = {
    message?: string | null;
};

export const getResponseMessage = (response?: ResponseWithMessage | null, fallback = "Success.") => {
    return response?.message || fallback;
};

export const getErrorMessage = (error: unknown, fallback = "Something went wrong.") => {
    if (error instanceof ApiError) {
        return error.body?.message || error.message || fallback;
    }

    if (error && typeof error === "object" && "message" in error) {
        const message = (error as { message?: unknown }).message;
        if (typeof message === "string" && message.trim()) return message;
    }

    return fallback;
};
