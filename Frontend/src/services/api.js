// src/services/api.js
import axios from "axios";

/* ===========================
   AUTH API (NO TOKEN HERE)
=========================== */
const API = axios.create({
  baseURL: "http://localhost:3000/api/auth",
});

export const signup = (data) => API.post("/signup", data);
export const login = (data) => API.post("/login", data);

/* ===========================
   MAIN API (TOKEN REQUIRED)
=========================== */
const EXPO_API = axios.create({
  baseURL: "http://localhost:3000/api",
});

// Attach token to every request
EXPO_API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/* ===========================
   EXPO CRUD
=========================== */
export const createExpo = (expoData) =>
  EXPO_API.post("/expos", expoData);

export const getExpos = () =>
  EXPO_API.get("/expos");

export const getExpoById = (id) =>
  EXPO_API.get(`/expos/${id}`);

export const updateExpo = (id, expoData) =>
  EXPO_API.put(`/expos/${id}`, expoData);

export const deleteExpo = (id) =>
  EXPO_API.delete(`/expos/${id}`);

/* ===========================
   EXHIBITOR CRUD
=========================== */
export const createExhibitor = (exhibitorData) =>
  EXPO_API.post("/exhibitors", exhibitorData);

export const getExhibitors = () =>
  EXPO_API.get("/exhibitors");

export const getExhibitorById = (id) =>
  EXPO_API.get(`/exhibitors/${id}`);

export const updateExhibitor = (id, exhibitorData) =>
  EXPO_API.put(`/exhibitors/${id}`, exhibitorData);

export const deleteExhibitor = (id) =>
  EXPO_API.delete(`/exhibitors/${id}`);

export const searchExhibitors = (searchTerm) =>
  EXPO_API.get(`/exhibitors/search?q=${searchTerm}`);

/* ===========================
   EXPO REGISTRATION (✅ NEW)
=========================== */

// Register exhibitor for an expo
export const registerForExpo = (data) =>
  EXPO_API.post("/expo-registrations", data);

// Get registrations for a specific expo (Admin)
export const getRegistrationsByExpo = (expoId) =>
  EXPO_API.get(`/expo-registrations/expo/${expoId}`);

// Update registration status (Approve / Reject)
export const updateRegistrationStatus = (id, status) =>
  EXPO_API.put(`/expo-registrations/${id}/status`, { status });

/* ===========================
   ANALYTICS
=========================== */
export const getAnalytics = (expoId) =>
  EXPO_API.get(`/analytics/${expoId}`);

export const getAnalyticsSummary = () =>
  EXPO_API.get("/analytics/summary");
