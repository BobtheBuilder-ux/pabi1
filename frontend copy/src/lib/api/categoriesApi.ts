import {baseApi} from "./baseApi";
import {API_SuccessPayload} from "../types";

// Define category types for API responses
export interface APICategory {
  id: string;
  name: string;
  description?: string;
  subcategories?: APISubcategory[];
}

export interface APISubcategory {
  id: string;
  name: string;
  description?: string;
  categoryId: string;
}

export interface APICategorySimplified {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
}

// Categories API endpoints
export const categoriesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all categories
    getCategories: builder.query<API_SuccessPayload<APICategorySimplified[]>, void>({
      query: () => ({
        url: "/categories",
        headers: { "X-SKIP-AUTH": "true" },
      }),
      providesTags: ["Categories"],
    }),

    // Get categories tree (with subcategories)
    getCategoriesTree: builder.query<API_SuccessPayload<APICategory[]>, void>({
      query: () => "/categories/tree",
      providesTags: ["Categories"],
    }),

    // Get category by ID
    getCategoryById: builder.query<API_SuccessPayload<APICategory>, string>({
      query: (id) => `/categories/${id}`,
      providesTags: (result, error, id) => [{ type: "Categories", id }],
    }),

    // Get subcategories for a category
    getSubcategories: builder.query<
      API_SuccessPayload<APISubcategory[]>,
      string
    >({
      query: (categoryId) => `/categories/${categoryId}/subcategories`,
      providesTags: (result, error, categoryId) => [
        { type: "Categories", id: categoryId },
        "Categories",
      ],
    }),
  }),
});

export const {
  useGetCategoriesQuery,
  useGetCategoriesTreeQuery,
  useGetCategoryByIdQuery,
  useGetSubcategoriesQuery,
} = categoriesApi;
