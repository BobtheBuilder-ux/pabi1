import { baseApi } from './baseApi';
import { API_SuccessPayload } from '../types';

// Conversation types
export interface Conversation {
  id: string;
  participantId: string;
  participantName: string;
  participantAvatar: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isOnline: boolean;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  read: boolean;
  messageType: 'text' | 'image' | 'file';
}

export interface CreateConversationRequest {
  participantId: string;
  initialMessage?: string;
}

export interface SendMessageRequest {
  conversationId: string;
  content: string;
  messageType?: 'text' | 'image' | 'file';
}

// Conversations API endpoints
export const conversationsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all conversations for current user
    getConversations: builder.query<API_SuccessPayload<Conversation[]>, void>({
      query: () => '/conversations',
      providesTags: ['Conversations'],
    }),

    // Get messages for a specific conversation
    getConversationMessages: builder.query<API_SuccessPayload<Message[]>, string>({
      query: (conversationId) => `/conversations/${conversationId}/messages`,
      providesTags: (result, error, conversationId) => [
        { type: 'Messages', id: conversationId },
        'Messages'
      ],
    }),

    // Create a new conversation
    createConversation: builder.mutation<API_SuccessPayload<Conversation>, CreateConversationRequest>({
      query: (data) => ({
        url: '/conversations',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Conversations'],
    }),

    // Send a message
    sendMessage: builder.mutation<API_SuccessPayload<Message>, SendMessageRequest>({
      query: (data) => ({
        url: `/conversations/${data.conversationId}/messages`,
        method: 'POST',
        body: {
          content: data.content,
          messageType: data.messageType || 'text'
        },
      }),
      invalidatesTags: (result, error, { conversationId }) => [
        { type: 'Messages', id: conversationId },
        'Conversations'
      ],
    }),

    // Mark conversation as read
    markConversationAsRead: builder.mutation<API_SuccessPayload<void>, string>({
      query: (conversationId) => ({
        url: `/conversations/${conversationId}/read`,
        method: 'PATCH',
      }),
      invalidatesTags: (result, error, conversationId) => [
        { type: 'Messages', id: conversationId },
        'Conversations'
      ],
    }),

    // Delete a conversation
    deleteConversation: builder.mutation<API_SuccessPayload<void>, string>({
      query: (conversationId) => ({
        url: `/conversations/${conversationId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Conversations'],
    }),
  }),
});

export const {
  useGetConversationsQuery,
  useGetConversationMessagesQuery,
  useCreateConversationMutation,
  useSendMessageMutation,
  useMarkConversationAsReadMutation,
  useDeleteConversationMutation,
} = conversationsApi;