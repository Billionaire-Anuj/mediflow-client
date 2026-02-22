import { OpenAPI } from "@mediflow/mediflow-api";

const baseUrl = import.meta.env.VITE_API_URL || "/api";

OpenAPI.BASE = baseUrl;
OpenAPI.WITH_CREDENTIALS = true;
OpenAPI.CREDENTIALS = "include";

export const API_BASE_URL = baseUrl;
