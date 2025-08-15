/**
 * API ENDPOINTS CONFIGURATION
 *
 * This file contains all API endpoint configurations.
 * Centralized endpoint management makes it easier to maintain and update URLs.
 */

export const API_ENDPOINTS = {
  // Authentication endpoints
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register", // Keep for backward compatibility
    REGISTER_INDIVIDUAL: "auth/register/individual",
    REGISTER_BUSINESS: "auth/register/business",
    LOGOUT: "/auth/logout",
    REFRESH_TOKEN: "/auth/refresh-token",
    FORGOT_PASSWORD: "/auth/forgot-password",
    RESET_PASSWORD: "/auth/reset-password",
    CHANGE_PASSWORD: "/auth/change-password",
    VERIFY_TOKEN: "/auth/verify-token",
    VERIFY_EMAIL: "/auth/verify-email",
    PROFILE: "/auth/profile",
  },

  // User management endpoints
  USER: {
    LIST: "/users",
    GET_BY_ID: (id: string) => `/users/${id}`,
    UPDATE: (id: string) => `/users/${id}`,
    DELETE: (id: string) => `/users/${id}`,
    SEARCH: "/users/search",
    UPLOAD_AVATAR: "/users/avatar",
  },

  // Profile endpoints
  PROFILE: {
    GET: "/profile",
    UPDATE: "/profile",
    UPLOAD_PHOTO: "/profile/photo",
    PREFERENCES: "/profile/preferences",
  },

  // Categories endpoints
  CATEGORIES: {
    LIST: "/categories",
    GET_BY_ID: (id: string) => `/categories/${id}`,
    SUBCATEGORIES: (id: string) => `/categories/${id}/subcategories`,
    TREE: "/categories/tree",
  },

  // Networking endpoints
  NETWORKING: {
    CONNECTIONS: "/networking/connections",
    REQUESTS: "/networking/requests",
    SEND_REQUEST: "/networking/send-request",
    ACCEPT_REQUEST: "/networking/accept-request",
    REJECT_REQUEST: "/networking/reject-request",
    RECOMMENDATIONS: "/networking/recommendations",
  },

  // Jobs endpoints
  JOBS: {
    LIST: "/jobs",
    GET_BY_ID: (id: string) => `/jobs/${id}`,
    CREATE: "/jobs",
    UPDATE: (id: string) => `/jobs/${id}`,
    DELETE: (id: string) => `/jobs/${id}`,
    APPLY: (id: string) => `/jobs/${id}/apply`,
    SEARCH: "/jobs/search",
  },

  // Products endpoints
  PRODUCTS: {
    LIST: "/products",
    GET_BY_ID: (id: string) => `/products/${id}`,
    CREATE: "/products",
    UPDATE: (id: string) => `/products/${id}`,
    DELETE: (id: string) => `/products/${id}`,
    SEARCH: "/products/search",
  },

  // Services endpoints
  SERVICES: {
    LIST: "/services",
    GET_BY_ID: (id: string) => `/services/${id}`,
    CREATE: "/services",
    UPDATE: (id: string) => `/services/${id}`,
    DELETE: (id: string) => `/services/${id}`,
    SEARCH: "/services/search",
  },

  // Notifications endpoints
  NOTIFICATIONS: {
    LIST: "/notifications",
    MARK_READ: (id: string) => `/notifications/${id}/read`,
    MARK_ALL_READ: "/notifications/mark-all-read",
    DELETE: (id: string) => `/notifications/${id}`,
  },

  // Settings endpoints
  SETTINGS: {
    GET: "/settings",
    UPDATE: "/settings",
    PRIVACY: "/settings/privacy",
    NOTIFICATIONS: "/settings/notifications",
  },

  // Search endpoints
  SEARCH: {
    GLOBAL: "/search",
    USERS: "/search/users",
    JOBS: "/search/jobs",
    PRODUCTS: "/search/products",
    SERVICES: "/search/services",
  },

  // Upload endpoints
  UPLOAD: {
    IMAGE: "/upload/image",
    FILE: "/upload/file",
    AVATAR: "/upload/avatar",
    DOCUMENT: "/upload/document",
  },
} as const;

// Helper function to build endpoint URLs with parameters
export const buildEndpoint = (
  endpoint: string,
  params?: Record<string, string | number>
) => {
  if (!params) return endpoint;

  let builtEndpoint = endpoint;
  Object.entries(params).forEach(([key, value]) => {
    builtEndpoint = builtEndpoint.replace(`{${key}}`, value.toString());
  });

  return builtEndpoint;
};

// Helper function to build query parameters
export const buildQueryParams = (params: Record<string, any>) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (Array.isArray(value)) {
        value.forEach((item) => searchParams.append(key, item.toString()));
      } else {
        searchParams.append(key, value.toString());
      }
    }
  });

  return searchParams.toString();
};

// Type-safe endpoint access
export type EndpointKey = keyof typeof API_ENDPOINTS;
export type AuthEndpointKey = keyof typeof API_ENDPOINTS.AUTH;
export type UserEndpointKey = keyof typeof API_ENDPOINTS.USER;
