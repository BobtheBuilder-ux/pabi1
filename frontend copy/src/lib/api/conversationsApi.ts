import { API_SuccessPayload } from "../types";
import { baseApi } from "./baseApi";

export interface Conversation {
  id: string;
  participantId: string;
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount: number;
}

export interface CreateConversationResponse {
  id: string;
}

// Conversations API endpoints
export const conversationsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createConversation: builder.mutation<
      API_SuccessPayload<CreateConversationResponse>,
      { participantId: string }
    >({
      query: (data) => ({
        url: "/conversations",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Conversations"],
    }),
  }),
});

export const {
  useCreateConversationMutation,
} = conversationsApi;