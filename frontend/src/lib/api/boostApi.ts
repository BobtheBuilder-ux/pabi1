import {baseApi} from "./baseApi";
import {API_SuccessPayload} from "../types";
import {BoostIndustryRequest, BoostPlan} from "../types/boost.type.ts";

// User API endpoints
export const boostApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // Get boost plans
        getBoostPlans: builder.query<API_SuccessPayload<BoostPlan[]>, void>({
            query: () => ({
                url: "/boost-plans",
                headers: {"X-SKIP-AUTH": "true"},
            }),
        }),

        // Boost industry
        boostIndustry: builder.mutation<API_SuccessPayload<{}>, BoostIndustryRequest>({
            query: (data) => ({
                url: "/boost/industry",
                method: "POST",
                body: data,
            }),
            invalidatesTags: [],
        }),

        //UnBoost industry
        unBoostIndustry: builder.mutation<API_SuccessPayload<{}>, { industryId: string }>({
            query: (data) => ({
                url: `/boost/industry/${data.industryId}`,
                method: "DELETE",
            }),
            invalidatesTags: [],
        }),
    }),
});

export const {
    useGetBoostPlansQuery,
    useBoostIndustryMutation,
    useUnBoostIndustryMutation,
} = boostApi;