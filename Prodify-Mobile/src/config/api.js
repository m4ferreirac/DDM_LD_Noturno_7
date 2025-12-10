// API Configuration
// Uses environment variables with EXPO_PUBLIC_ prefix for Expo compatibility

// Base URL for the backend API
// Set EXPO_PUBLIC_API_BASE_URL in .env file
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL || "http://localhost:3000";

// Alternative URLs for different environments
export const API_URLS = {
  // For Android Emulator
  androidEmulator: "http://10.0.2.2:3000",
  // For iOS Simulator
  iosSimulator: "http://localhost:3000",
  // For physical device (replace with your machine's IP)
  physicalDevice: "http://192.168.1.100:3000",
  // Production URL (when deployed)
  production: process.env.EXPO_PUBLIC_API_PRODUCTION_URL || "",
};

// API Endpoints
export const API_ENDPOINTS = {
  // Health check
  HEALTH: "/",

  // User endpoints
  USERS: "/User",
  USERS_PUBLIC: "/User/public/names",
  USER_BY_ID: (uid) => `/User/${uid}`,

  // Task endpoints
  TASKS: "/Task",
  TASK_BY_ID: (id) => `/Task/${id}`,
  TASK_KANBAN: "/Task/kanban",
  TASK_MOVE: (id) => `/Task/${id}/move`,

  // TaskType endpoints
  TASK_TYPES: "/TaskType",
  TASK_TYPE_BY_ID: (id) => `/TaskType/${id}`,

  // Stats endpoints
  STATS_PROGRAMMER_COMPLETED: "/stats/programmer/completed",
  STATS_MANAGER_COMPLETED: "/stats/manager/completed",
  STATS_MANAGER_PENDING: "/stats/manager/pending",
  STATS_MANAGER_FORECAST: "/stats/manager/todo-forecast",

  // Export endpoints
  EXPORT_MANAGER_COMPLETED: "/export/manager/completed.csv",
};

// Build full URL for an endpoint
export const buildUrl = (endpoint) => {
  return `${API_BASE_URL}${endpoint}`;
};

// Timeout configuration (in milliseconds)
export const API_TIMEOUT = {
  default: 30000, // 30 seconds
  upload: 60000, // 60 seconds for file uploads
  download: 60000, // 60 seconds for file downloads
  healthCheck: 5000, // 5 seconds for health check
};

export default {
  API_BASE_URL,
  API_URLS,
  API_ENDPOINTS,
  API_TIMEOUT,
  buildUrl,
};
