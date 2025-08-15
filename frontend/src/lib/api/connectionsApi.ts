import {ConnectionRequestBody} from "../store/slices/connections.ts";
import {API_SuccessPayload} from "../types";
import {baseApi} from "./baseApi";

// User API endpoints
export const connectionsApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        sendConnectionRequest: builder.mutation<
            API_SuccessPayload<{}>,
            ConnectionRequestBody
        >({
            query: (params) => ({
                url: "/connections/requests",
                body: params,
                method: "POST",
            }),
            invalidatesTags: ["Search Boosted", "Search"],
        }),

        acceptConnectionRequest: builder.mutation<API_SuccessPayload<{}>, { requestId: string }>({
            query: ({requestId}) => ({
                url: `/connections/requests/${requestId}/accept`,
                method: "PATCH",
            }),
            invalidatesTags: ["Search Boosted", "Search"],
        }),

        rejectConnectionRequest: builder.mutation<API_SuccessPayload<{}>, { requestId: string }>({
            query: ({requestId}) => ({
                url: `/connections/requests/${requestId}/reject`,
                method: "PATCH",
            }),
            invalidatesTags: ["Search Boosted", "Search"],
        }),
    }),
});

export const {
    useSendConnectionRequestMutation,
    useAcceptConnectionRequestMutation,
    useRejectConnectionRequestMutation,
} = connectionsApi;
