import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {UserPreferences} from "../../../types/categories";

export interface PreferencesState {
  preferences: UserPreferences | null;
  hasCompletedOnboarding: boolean;
  isLoading: boolean;
}

const initialState: PreferencesState = {
  preferences: null,
  hasCompletedOnboarding: false,
  isLoading: true,
};

export interface CategoryPreferenceResponse {
  userId: string;
  categories: Category[];
}

export interface AddOrRemoveCategoryPreferenceRequest {
  categories: string[];
}

export interface Category {
  id: string;
  name: string;
  description: string;
  subCategories: SubCategory[];
}

export interface SubCategory {
  id: string;
  name: string;
  description: string;
  boosted: boolean;
  boostExpiresAt: string | null;
}

const preferencesSlice = createSlice({
  name: "preferences",
  initialState,
  reducers: {
    setPreferences: (state, action: PayloadAction<UserPreferences>) => {
      state.preferences = action.payload;
      // Persist to localStorage
      localStorage.setItem("userPreferences", JSON.stringify(action.payload));
    },

    updatePreferences: (
      state,
      action: PayloadAction<Partial<UserPreferences>>
    ) => {
      if (state.preferences) {
        state.preferences = { ...state.preferences, ...action.payload };
        localStorage.setItem(
          "userPreferences",
          JSON.stringify(state.preferences)
        );
      }
    },

    completeOnboarding: (state) => {
      state.hasCompletedOnboarding = true;
      localStorage.setItem("onboardingCompleted", "true");
    },

    setOnboardingStatus: (state, action: PayloadAction<boolean>) => {
      state.hasCompletedOnboarding = action.payload;
      if (action.payload) {
        localStorage.setItem("onboardingCompleted", "true");
      } else {
        localStorage.removeItem("onboardingCompleted");
      }
    },

    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    initializePreferences: (state) => {
      // Load from localStorage
      const savedPreferences = localStorage.getItem("userPreferences");
      const onboardingCompleted = localStorage.getItem("onboardingCompleted");

      if (savedPreferences) {
        state.preferences = JSON.parse(savedPreferences);
      }

      if (onboardingCompleted === "true") {
        state.hasCompletedOnboarding = true;
      }

      state.isLoading = false;
    },

    clearPreferences: (state) => {
      state.preferences = null;
      state.hasCompletedOnboarding = false;
      localStorage.removeItem("userPreferences");
      localStorage.removeItem("onboardingCompleted");
    },
  },
});

export const {
  setPreferences,
  updatePreferences,
  completeOnboarding,
  setOnboardingStatus,
  setLoading,
  initializePreferences,
  clearPreferences,
} = preferencesSlice.actions;

export default preferencesSlice.reducer;
