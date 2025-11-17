// src/config/auth.ts
const API_BASE = import.meta.env.VITE_API_BASE || "";

// Strip trailing "/api" so we get just the origin
export const AUTH_BASE = API_BASE.replace(/\/api\/?$/, "");