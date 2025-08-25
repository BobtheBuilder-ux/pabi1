import {baseApi} from "./baseApi";
import {API_SuccessPayload, IUser, ProfileDetailsUpdateRequest, UserPublicProfile} from "../types";
import {SearchResponseData} from "../store/slices/searchSlice";
import {PromotedResponseData} from "../store/slices/promotedSlice.ts";
import {AddOrRemoveCategoryPreferenceRequest, CategoryPreferenceResponse,} from "../store/slices/preferencesSlice.ts";

// User preference types
export interface UserPreferencesUpdate {
    myCategories: string[];
    mySubcategories: string[];
    lookingForCategories: string[];
    lookingForSubcategories: string[];
}

// Search parameters
export interface SearchParams {
    q?: string;
    categoryIds?: string[];
    country?: string;
    hasConnection?: boolean;
    size?: number;
    cursor?: string;
}

// User API endpoints
export const userApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // Get user profile
        getUserProfile: builder.query<API_SuccessPayload<IUser>, void>({
            query: () => "/profile",
            providesTags: ["Profile"],
        }),

        // Update user profile details
        updateUserProfile: builder.mutation<
            API_SuccessPayload<{}>,
            Partial<ProfileDetailsUpdateRequest>
        >({
            query: (data) => ({
                url: "/profile/me",
                method: "PATCH",
                body: data,
            }),
            invalidatesTags: ["Profile"],
        }),

        // Global search
        globalSearch: builder.query<
            API_SuccessPayload<SearchResponseData>,
            SearchParams
        >({
            query: (params) => ({
                url: "/search",
                params,
            }),
            providesTags: ["Search"],
        }),

        // Promoted search
        promotedSearch: builder.query<
            API_SuccessPayload<PromotedResponseData>,
            SearchParams
        >({
            query: function (params) {
                return {
                    url: "/search/boosted",
                    params,
                };
            },
            providesTags: ["Search Boosted"],
        }),

        getUserInterests: builder.query<
            API_SuccessPayload<CategoryPreferenceResponse>,
            void
        >({
            query: () => ({
                url: "/profile/interests",
            }),
            providesTags: ["ProfileInterests"],
        }),

        getUserIndustries: builder.query<
            API_SuccessPayload<CategoryPreferenceResponse>,
            void
        >({
            query: () => ({
                url: "/profile/industries",
            }),
            providesTags: ["ProfileIndustries"],
        }),

        addUserInterests: builder.mutation<
            API_SuccessPayload<CategoryPreferenceResponse>,
            AddOrRemoveCategoryPreferenceRequest
        >({
            query: (data) => ({
                url: "/profile/interests",
                method: "POST",
                body: data,
            }),
        }),

        removeUserInterests: builder.mutation<
            API_SuccessPayload<CategoryPreferenceResponse>,
            AddOrRemoveCategoryPreferenceRequest
        >({
            query: (data) => ({
                url: "/profile/interests",
                method: "DELETE",
                body: data,
            }),
            invalidatesTags: [],
        }),

        // Update user industries
        addUserIndustries: builder.mutation<
            API_SuccessPayload<CategoryPreferenceResponse>,
            AddOrRemoveCategoryPreferenceRequest
        >({
            query: (data) => ({
                url: "/profile/industries",
                method: "POST",
                body: data,
            }),
            invalidatesTags: [],
        }),

        // Remove user industries
        removeUserIndustries: builder.mutation<
            API_SuccessPayload<CategoryPreferenceResponse>,
            AddOrRemoveCategoryPreferenceRequest
        >({
            query: (data) => ({
                url: "/profile/industries",
                method: "DELETE",
                body: data,
            }),
            invalidatesTags: [],
        }),

        // Connect to profile
        connectToProfile: builder.mutation<
            API_SuccessPayload<IUser>,
            { profileId: string; reason: string; description: string }
        >({
            query: (data) => ({
                url: "/profile/connect",
                method: "POST",
                body: data,
            }),
        }),

        // Fetch user public profile
        getUserPublicProfile: builder.query<API_SuccessPayload<UserPublicProfile>, string>({
            query: (userId) => ({
                url: `/profile/${userId}/public-details`,
                method: "GET",
            }),
        }),
    }),
});

export const {
    useGetUserProfileQuery,
    useUpdateUserProfileMutation,
    useGlobalSearchQuery,
    usePromotedSearchQuery,
    useAddUserInterestsMutation,
    useAddUserIndustriesMutation,
    useGetUserInterestsQuery,
    useGetUserIndustriesQuery,
    useRemoveUserInterestsMutation,
    useRemoveUserIndustriesMutation,
    useGetUserPublicProfileQuery,
} = userApi;
