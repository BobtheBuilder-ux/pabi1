import {createSlice, PayloadAction} from '@reduxjs/toolkit';

export interface PromotedFilters {
    searchText: string;
    category: string;
    country: string;
}

export interface PromotedProfile {
    id: string;
    userType: "BUSINESS" | "INDIVIDUAL";
    profile: {
        companyName: string;
        personalName: string;
        biography: string;
        registrationCountry: string;
        residenceCountry: string;
        profilePictureUrl: string;
        coverPictureUrl: string;
    };
    industries: string[] | [];
    interests: string[] | [];
    connectionStatus:
        | "NONE"
        | "REQUEST_SENT"
        | "REQUEST_RECEIVED"
        | "CONNECTED"
        | "REQUEST_REJECTED"
        | "REQUEST_CANCELLED";
    connectionRequestId?: string;
    connectionReason?: string
    connectionMessage?: string;
    connectionRequestSentAt?: string;
}

// New interfaces for the actual API response structure
export interface PromotedPagination {
    cursor: string;
    nextCursor: string;
    hasNext: boolean;
    size: number;
}

export interface PromotedFilterOptions {
    applied: {
        country?: string;
        userType?: string;
    };
    available: {
        countries: string[];
        userTypes: string[];
    };
}

export interface PromotedResponseData {
    users: PromotedProfile[];
    pagination: PromotedPagination;
    filters: PromotedFilterOptions;
}

export interface PromotedState {
    filters: PromotedFilters;
    promotedResults: PromotedProfile[];
    pagination: PromotedPagination | null;
    availableFilters: PromotedFilterOptions | null;
    isSearching: boolean;
    hasSearched: boolean;
}

const initialFilters: PromotedFilters = {
    searchText: '',
    category: 'all-categories',
    country: 'All Countries'
};

const initialState: PromotedState = {
    filters: initialFilters,
    promotedResults: [],
    pagination: null,
    availableFilters: null,
    isSearching: false,
    hasSearched: false,
};

const promotedSlice = createSlice({
    name: 'promoted',
    initialState,
    reducers: {
        updateFilters: (state, action: PayloadAction<Partial<PromotedFilters>>) => {
            state.filters = {...state.filters, ...action.payload};
        },

        setSearchResults: (state, action: PayloadAction<PromotedResponseData>) => {
            state.promotedResults = action.payload.users;
            state.pagination = action.payload.pagination;
            state.availableFilters = action.payload.filters;
            state.hasSearched = true;
        },

        setSearching: (state, action: PayloadAction<boolean>) => {
            state.isSearching = action.payload;
        },

        clearFilters: (state) => {
            state.filters = initialFilters;
        },

        clearSearchResults: (state) => {
            state.promotedResults = [];
            state.pagination = null;
            state.availableFilters = null;
            state.hasSearched = false;
        },

        resetSearch: (state) => {
            state.filters = initialFilters;
            state.promotedResults = [];
            state.pagination = null;
            state.availableFilters = null;
            state.isSearching = false;
            state.hasSearched = false;
        },

        // Action for immediate search (can be used with RTK Query)
        performSearch: (state, action: PayloadAction<PromotedFilters>) => {
            state.filters = action.payload;
            state.isSearching = true;
        },
    },
});

export const {
    updateFilters,
    setSearchResults,
    setSearching,
    clearFilters,
    clearSearchResults,
    resetSearch,
    performSearch,
} = promotedSlice.actions;

export default promotedSlice.reducer;
