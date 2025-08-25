import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { RootState } from '../store';
import { 
  setPreferences, 
  updatePreferences,
  completeOnboarding,
  setOnboardingStatus,
  setLoading,
  initializePreferences,
  clearPreferences 
} from '../store/slices/preferencesSlice';
import { 
  hasCompletedOnboarding as checkHasCompletedOnboarding,
  markOnboardingCompleted
} from '../utils/tokenHelpers';
import { UserPreferences } from '../../types/categories';

export const usePreferences = () => {
  const dispatch = useDispatch();
  const preferences = useSelector((state: RootState) => state.preferences as any);
  const { preferences: userPreferences, isLoading } = preferences;

  // Get onboarding status from localStorage instead of Redux
  const hasCompletedOnboarding = checkHasCompletedOnboarding();

  // Initialize preferences on mount
  useEffect(() => {
    dispatch(initializePreferences());
  }, [dispatch]);

  // Set preferences
  const setPreferencesHandler = (newPreferences: UserPreferences) => {
    dispatch(setPreferences(newPreferences));
  };

  // Update preferences
  const updatePreferencesHandler = (partialPreferences: Partial<UserPreferences>) => {
    dispatch(updatePreferences(partialPreferences));
  };

  // Complete onboarding - use localStorage helper
  const completeOnboardingHandler = () => {
    markOnboardingCompleted();
    // Also update Redux state for consistency
    dispatch(completeOnboarding());
  };

  // Set onboarding status
  const setOnboardingStatusHandler = (status: boolean) => {
    dispatch(setOnboardingStatus(status));
  };

  // Clear preferences
  const clearPreferencesHandler = () => {
    dispatch(clearPreferences());
  };

  return {
    preferences: userPreferences,
    hasCompletedOnboarding,
    isLoading,
    setPreferences: setPreferencesHandler,
    updatePreferences: updatePreferencesHandler,
    completeOnboarding: completeOnboardingHandler,
    setOnboardingStatus: setOnboardingStatusHandler,
    clearPreferences: clearPreferencesHandler,
  };
}; 