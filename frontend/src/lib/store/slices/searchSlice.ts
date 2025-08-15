import {createSlice, PayloadAction} from "@reduxjs/toolkit";

export interface SearchFilters {
    searchText: string;
    country: string;
    categoryIds?: string[];
}

export interface SearchProfile {
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

export interface SearchInterests {
    name: string;
}

// New interfaces for the actual API response structure
export interface SearchPagination {
    cursor: string;
    nextCursor: string;
    hasNext: boolean;
    size: number;
}

export interface SearchFilterOptions {
    applied: {
        country?: string;
        userType?: string;
    };
    available: {
        countries: string[];
        userTypes: string[];
    };
}

export interface SearchResponseData {
    users: SearchProfile[];
    pagination: SearchPagination;
    filters: SearchFilterOptions;
}

export interface SearchState {
    filters: SearchFilters;
    searchResults: SearchProfile[];
    pagination: SearchPagination | null;
    availableFilters: SearchFilterOptions | null;
    isSearching: boolean;
    hasSearched: boolean;
}

const initialFilters: SearchFilters = {
    searchText: "",
    country: "All Countries",
    categoryIds: [],
};

const initialState: SearchState = {
    filters: initialFilters,
    searchResults: [],
    pagination: null,
    availableFilters: null,
    isSearching: false,
    hasSearched: false,
};

const searchSlice = createSlice({
    name: "search",
    initialState,
    reducers: {
        updateFilters: (state, action: PayloadAction<Partial<SearchFilters>>) => {
            state.filters = {...state.filters, ...action.payload};
        },

        setSearchResults: (state, action: PayloadAction<SearchResponseData>) => {
            state.searchResults = action.payload.users;
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
            state.searchResults = [];
            state.pagination = null;
            state.availableFilters = null;
            state.hasSearched = false;
        },

        resetSearch: (state) => {
            state.filters = initialFilters;
            state.searchResults = [];
            state.pagination = null;
            state.availableFilters = null;
            state.isSearching = false;
            state.hasSearched = false;
        },

        // Action for immediate search (can be used with RTK Query)
        performSearch: (state, action: PayloadAction<SearchFilters>) => {
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
} = searchSlice.actions;

export default searchSlice.reducer;
