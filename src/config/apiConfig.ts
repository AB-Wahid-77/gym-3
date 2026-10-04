// Base URL for the backend API. Empty string means same-origin (used in local dev
// and any single-host deployment). Set VITE_API_BASE_URL at build time to point
// the frontend at a separately-hosted backend (e.g. "https://mygym.bonto.run").
export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
