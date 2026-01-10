import { lazy } from "react";

//#region Authentication & Profile Views
export const Login = lazy(() => import("@/pages/global/authentication/Login"));
export const ForgotPassword = lazy(() => import("@/pages/global/forgot-password/ForgotPassword"));
export const ProfileOverview = lazy(() => import("../pages/user/profile/ProfileOverview"));
//#endregion

//#region Dashboard & Overview
export const DashboardOverview = lazy(() => import("@/pages/user/overview/dashboard/DashboardOverview"));
export const ReportOverview = lazy(() => import("@/pages/user/overview/reports/ReportsOverview"));
//#endregion

//#region Core Data
export const MetricOverview = lazy(() => import("@/pages/user/core-data/metrics/MetricsOverview"));
export const CompaniesOverview = lazy(() => import("@/pages/user/core-data/company/CompaniesOverview"));
export const CompanyDetailOverview = lazy(
    () => import("@/pages/user/core-data/company/details/CompanyDetailsOverview")
);
export const CategoryOverview = lazy(() => import("@/pages/user/core-data/category/CategoriesOverview"));
export const BloodGroupOverview = lazy(() => import("@/pages/user/core-data/blood-group/BloodGroupsOverview"));
export const NationalityOverview = lazy(() => import("@/pages/user/core-data/nationality/NationalitiesOverview"));
export const ReligionOverview = lazy(() => import("@/pages/user/core-data/religion/ReligionsOverview"));
export const DesignationOverview = lazy(() => import("@/pages/user/core-data/designation/DesignationsOverview"));
export const EducationDegreeOverview = lazy(
    () => import("@/pages/user/core-data/education-degree/EducationDegreesOverview")
);
export const LocationOverview = lazy(() => import("@/pages/user/core-data/locations/LocationsOverview"));
//#endregion

//#region Organization
export const ClientTypeOverview = lazy(() => import("@/pages/user/organization/client-type/ClientTypesOverview"));
export const ClientOverview = lazy(() => import("@/pages/user/organization/client/ClientsOverview"));
export const ClientDetailOverview = lazy(
    () => import("@/pages/user/organization/client/details/ClientDetailsOverview")
);
//#endregion

//#region User Management
export const UserManagementOverview = lazy(() => import("@/pages/user/user-management/users/UsersManagementOverview"));
export const RoleOverview = lazy(() => import("@/pages/user/user-management/roles/RolesOverview"));
//#endregion

//#region Recruitment
export const VacancyOverview = lazy(() => import("@/pages/user/recruitment/vacancies/VacanciesOverview"));
export const VacancyDetailOverview = lazy(
    () => import("@/pages/user/recruitment/vacancies/details/VacancyDetailsOverview")
);
export const CandidateOverview = lazy(() => import("@/pages/user/recruitment/candidates/CandidatesOverview"));
export const CandidateDetailOverview = lazy(
    () => import("@/pages/user/recruitment/candidates/details/CandidateDetailsOverview")
);
//#endregion

//#region Logs
export const EmailOutboxLogOverview = lazy(() => import("@/pages/user/logs/email-outbox/EmailOutboxesLogOverview"));
export const UserLoginLogOverview = lazy(() => import("@/pages/user/logs/user-log/UserLoginLogsOverview"));
export const LlmLogOverview = lazy(() => import("@/pages/user/logs/llm/LlmLogsOverview"));
export const ResumeLogOverview = lazy(() => import("@/pages/user/logs/resume/ResumeLogsOverview"));
//#endregion

//#region Settings
export const GlobalSettingOverview = lazy(() => import("@/pages/user/settings/GlobalSettingsOverview"));
//#endregion

//#region External Layout Pages
export const ApplicationOverview = lazy(() => import("@/pages/user/recruitment/applications/ApplicationsOverview"));

export const RegisterExternalCandidateOverview = lazy(
    () => import("@/pages/user/recruitment/candidates/RegisterExternalCandidateOverview")
);
//#endregion
