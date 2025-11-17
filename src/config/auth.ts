// client/src/config/auth.ts
const API_BASE = import.meta.env.VITE_API_BASE || "";

// In prod:  "https://api.mailtrace.ai/api"  -> "https://api.mailtrace.ai"
// In dev:   "/api" or "/api/"               -> ""
export const AUTH_BASE = API_BASE.replace(/\/api\/?$/, "");

export { API_BASE };