import { describe, it, expect } from "vitest";
import {
    getAvatarUrl,
    getDiagnosticReportUrl,
    getRoleSlug,
    getRoleLabel,
    mapProfileToUser,
    getRoleIdFromRole,
    USER_IMAGE_BASE_URL,
    DIAGNOSTIC_REPORT_BASE_URL
} from "./auth";

describe("auth utilities", () => {
    describe("getAvatarUrl", () => {
        it("returns undefined when input is falsy or purely whitespace", () => {
            expect(getAvatarUrl()).toBeUndefined();
            expect(getAvatarUrl(null)).toBeUndefined();
            expect(getAvatarUrl("")).toBeUndefined();
            expect(getAvatarUrl("   ")).toBeUndefined();
        });

        it("returns properly formatted URL string when parsed", () => {
            expect(getAvatarUrl("avatar.jpg")).toBe(`${USER_IMAGE_BASE_URL}avatar.jpg`);
            expect(getAvatarUrl(" avatar.jpg ")).toBe(`${USER_IMAGE_BASE_URL}avatar.jpg`);
        });
    });

    describe("getDiagnosticReportUrl", () => {
        it("returns undefined when input is falsy or purely whitespace", () => {
            expect(getDiagnosticReportUrl()).toBeUndefined();
            expect(getDiagnosticReportUrl(null)).toBeUndefined();
            expect(getDiagnosticReportUrl("")).toBeUndefined();
            expect(getDiagnosticReportUrl("   ")).toBeUndefined();
        });

        it("returns properly formatted URL string when parsed", () => {
            expect(getDiagnosticReportUrl("report.pdf")).toBe(`${DIAGNOSTIC_REPORT_BASE_URL}report.pdf`);
            expect(getDiagnosticReportUrl(" report.pdf ")).toBe(`${DIAGNOSTIC_REPORT_BASE_URL}report.pdf`);
        });
    });

    describe("getRoleSlug", () => {
        it("defaults to 'patient' when role is not provided or unrecognized", () => {
            expect(getRoleSlug()).toBe("patient");
            expect(getRoleSlug(null)).toBe("patient");
            expect(getRoleSlug("unknown_role")).toBe("patient");
        });

        it("maps known string roles to AppRole slug", () => {
            expect(getRoleSlug("super admin")).toBe("admin");
            expect(getRoleSlug("admin")).toBe("admin");
            expect(getRoleSlug("doctor")).toBe("doctor");
            expect(getRoleSlug("lab technician")).toBe("lab");
            expect(getRoleSlug("pharmacist")).toBe("pharmacist");
            expect(getRoleSlug("patient")).toBe("patient");
        });

        it("is case insensitive", () => {
            expect(getRoleSlug("DoctoR")).toBe("doctor");
            expect(getRoleSlug("   Admin   ")).toBe("admin");
        });
    });

    describe("getRoleLabel", () => {
        it("returns the provided roleName if it exists", () => {
            expect(getRoleLabel("doctor", "Custom Doctor Name")).toBe("Custom Doctor Name");
        });

        it("returns the mapped fallback label if roleName is falsy", () => {
            expect(getRoleLabel("admin")).toBe("Administrator");
            expect(getRoleLabel("doctor")).toBe("Doctor");
            expect(getRoleLabel("lab")).toBe("Lab Technician");
            expect(getRoleLabel("pharmacist")).toBe("Pharmacist");
            expect(getRoleLabel("patient")).toBe("Patient");
        });
    });

    describe("mapProfileToUser", () => {
        it("returns null if profile is falsy", () => {
            expect(mapProfileToUser()).toBeNull();
            expect(mapProfileToUser(null)).toBeNull();
        });

        it("maps a sparse profile successfully to a user object", () => {
            // Using a basic object simulation
            const profile = {
                id: "123",
                username: "jdoe"
            };
            const result = mapProfileToUser(profile);
            expect(result).toEqual({
                id: "123",
                name: "jdoe",
                email: "",
                role: "patient",
                roleName: "",
                phone: undefined,
                address: undefined,
                avatarUrl: undefined
            });
        });

        it("maps a comprehensive profile successfully", () => {
            const profile = {
                id: "456",
                name: "John Doe",
                username: "jdoe2",
                emailAddress: "jdoe@example.com",
                phoneNumber: "555-1234",
                address: "123 Main St",
                role: { name: "Doctor" },
                profileImage: { fileUrl: "john.jpg" }
            };
            const result = mapProfileToUser(profile);
            expect(result).toEqual({
                id: "456",
                name: "John Doe",
                email: "jdoe@example.com",
                role: "doctor",
                roleName: "Doctor",
                phone: "555-1234",
                address: "123 Main St",
                avatarUrl: `${USER_IMAGE_BASE_URL}john.jpg`
            });
        });
    });

    describe("getRoleIdFromRole", () => {
        it("extracts ID from role object", () => {
            expect(getRoleIdFromRole({ id: "role-123", name: "Admin" })).toBe("role-123");
        });

        it("returns empty string if role or ID is missing", () => {
            expect(getRoleIdFromRole(null)).toBe("");
            expect(getRoleIdFromRole(undefined)).toBe("");
            expect(getRoleIdFromRole({ name: "Admin" })).toBe("");
        });
    });
});
