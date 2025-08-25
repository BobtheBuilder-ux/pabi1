import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ConversationState {
  selectedConversationId: string | null;
  isTyping: boolean;
  typingUsers: string[];
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'reconnecting' | 'error';
}

const initialState: ConversationState = {
  selectedConversationId: null,
  isTyping: false,
  typingUsers: [],
  connectionStatus: 'disconnected',
};

const conversationsSlice = createSlice({
  name: 'conversations',
  initialState,
  reducers: {
    setSelectedConversation: (state, action: PayloadAction<string | null>) => {
      state.selectedConversationId = action.payload;
    },
    
    setTyping: (state, action: PayloadAction<boolean>) => {
      state.isTyping = action.payload;
    },
    
    addTypingUser: (state, action: PayloadAction<string>) => {
      if (!state.typingUsers.includes(action.payload)) {
        state.typingUsers.push(action.payload);
      }
    },
    
    removeTypingUser: (state, action: PayloadAction<string>) => {
      state.typingUsers = state.typingUsers.filter(userId => userId !== action.payload);
    },
    
    setConnectionStatus: (state, action: PayloadAction<ConversationState['connectionStatus']>) => {
      state.connectionStatus = action.payload;
    },
    
    clearConversationState: (state) => {
      state.selectedConversationId = null;
      state.isTyping = false;
      state.typingUsers = [];
    },
  },
});

export const {
  setSelectedConversation,
  setTyping,
  addTypingUser,
  removeTypingUser,
  setConnectionStatus,
  clearConversationState,
} = conversationsSlice.actions;

export default conversationsSlice.reducer;