import { BaseQueryFn, createApi, FetchArgs, fetchBaseQuery, FetchBaseQueryError } from "@reduxjs/toolkit/query/react";
import { ENV_VALUES } from "../../config/env.config";
import { clearTokens, getTokens, updateTokens } from "../utils/tokenHelpers";
import { API_ENDPOINTS } from "../config/api.endpoints";

const baseQuery = fetchBaseQuery({
    baseUrl: ENV_VALUES.BASE_URL,
    prepareHeaders: (headers) => {
        const token = getTokens()?.accessToken;
        if (token) {
            headers.set("authorization", `Bearer ${token}`);
        }

        headers.set("Accept", "application/json");
        headers.set("ngrok-skip-browser-warning", "true");

        const skipAuth = headers.get("X-SKIP-AUTH");
        if (skipAuth) {
            headers.delete("authorization");
            headers.delete("X-SKIP-AUTH");
        }

        return headers;
    },
    credentials: "include",
});

const baseQueryWithReauth: BaseQueryFn<
    string | FetchArgs,
    unknown,
    FetchBaseQueryError
> = async (args, api, extraOptions) => {
    let result = await baseQuery(args, api, extraOptions);

    if (result.error && result.error.status === 401) {
        const tokens = getTokens();
        const refreshToken = tokens?.refreshToken;

        if (refreshToken) {
            const refreshResult = await baseQuery(
                {
                    url: API_ENDPOINTS.AUTH.REFRESH_TOKEN,
                    method: "POST",
                    body: { refreshToken },
                },
                api,
                extraOptions
            );

            if (refreshResult.data) {
                const refreshData = refreshResult.data as any;
                const newAccessToken = refreshData.data?.accessToken || refreshData.accessToken;
                const newRefreshToken = refreshData.data?.refreshToken || refreshData.refreshToken;

                if (newAccessToken && newRefreshToken) {
                    updateTokens(newAccessToken, newRefreshToken);
                    result = await baseQuery(args, api, extraOptions);
                } else {
                    clearTokens();
                    window.location.href = "/login";
                }
            } else {
                clearTokens();
                window.location.href = "/login";
            }
        } else {
            clearTokens();
            window.location.href = "/login";
        }
    }

    return result;
};

export const baseApi = createApi({
    reducerPath: "api",
    baseQuery: baseQueryWithReauth,
    tagTypes: [
        "Auth",
        "User",
        "Profile",
        "Search",
        "Search Boosted",
        "ProfileInterests",
        "ProfileIndustries",
        "Conversations",
        "Messages"
    ],
    endpoints: () => ({}),
    keepUnusedDataFor: 180,
    refetchOnReconnect: true,
});
