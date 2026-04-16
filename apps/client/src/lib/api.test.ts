import { describe, it, expect } from "vitest";
import { getResponseMessage, getErrorMessage } from "./api";
import { ApiError } from "@mediflow/mediflow-api";

describe("api helper functions", () => {
    describe("getResponseMessage", () => {
        it("returns the message when present in the response", () => {
            const response = { message: "Action successful" };
            expect(getResponseMessage(response)).toBe("Action successful");
        });

        it("returns the default fallback when response is undefined", () => {
            expect(getResponseMessage(undefined)).toBe("Success.");
        });

        it("returns the default fallback when response has no message", () => {
            expect(getResponseMessage({})).toBe("Success.");
        });

        it("returns a custom fallback when response is null and fallback provided", () => {
            expect(getResponseMessage(null, "Completed")).toBe("Completed");
        });
    });

    describe("getErrorMessage", () => {
        it("extracts message from ApiError with body", () => {
            const apiError = new ApiError(
                { method: "GET", url: "test" },
                { status: 400, statusText: "Bad", url: "test", body: { message: "API Failed" }, ok: false },
                "API Failed"
            );
            expect(getErrorMessage(apiError)).toBe("API Failed");
        });

        it("extracts fallback message from ApiError when body has no message", () => {
            const apiError = new ApiError(
                { method: "GET", url: "test" },
                { status: 500, statusText: "Server Error", url: "test", body: {}, ok: false },
                "Base Message"
            );
            expect(getErrorMessage(apiError)).toBe("Base Message");
        });

        it("extracts message from generic Error object", () => {
            const genericError = new Error("Generic failure message");
            expect(getErrorMessage(genericError)).toBe("Generic failure message");
        });

        it("handles non-string generic error message object appropriately", () => {
            const malformedError = { message: { complex: "object" } };
            expect(getErrorMessage(malformedError)).toBe("Something went wrong.");
        });

        it("returns the fallback when error is completely unreadable", () => {
            expect(getErrorMessage("Just a string")).toBe("Something went wrong.");
        });

        it("returns a custom fallback when error is empty", () => {
            expect(getErrorMessage(null, "Custom Error")).toBe("Custom Error");
        });
    });
});
