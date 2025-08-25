// Token management utilities using localStorage
export interface TokenData {
  accessToken: string;
  refreshToken: string;
  expiresIn?: number;
  userType?: string;
  email?: string;
  onboardingCompletedAt?: string | null;
}

const TOKEN_STORAGE_KEY = 'authTokens';
const ONBOARDING_COMPLETED_KEY = 'onboardingCompleted';

export const getTokens = (): TokenData | null => {
  try {
    const tokenData = localStorage.getItem(TOKEN_STORAGE_KEY);
    return tokenData ? JSON.parse(tokenData) : null;
  } catch (error) {
    console.error('Error parsing stored tokens:', error);
    return null;
  }
};

export const getAccessToken = (): string | null => {
  const tokens = getTokens();
  return tokens?.accessToken || null;
};

export const getRefreshToken = (): string | null => {
  const tokens = getTokens();
  return tokens?.refreshToken || null;
};

export const setTokens = (tokenData: TokenData): void => {
  try {
    localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(tokenData));
    
    if (tokenData.onboardingCompletedAt) {
      localStorage.setItem(ONBOARDING_COMPLETED_KEY, 'true');
    }
  } catch (error) {
    console.error('Error storing tokens:', error);
  }
};

export const updateTokens = (accessToken: string, refreshToken: string): void => {
  const currentTokens = getTokens();
  if (currentTokens) {
    setTokens({
      ...currentTokens,
      accessToken,
      refreshToken,
    });
  } else {
    setTokens({ accessToken, refreshToken });
  }
};

export const clearTokens = (): void => {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  localStorage.removeItem(ONBOARDING_COMPLETED_KEY);
  localStorage.removeItem('user');
  localStorage.removeItem('userPreferences');
};

export const isAuthenticated = (): boolean => {
  const accessToken = getTokens()?.accessToken;
  return !!accessToken;
};

export const hasCompletedOnboarding = (): boolean => {
  const tokens = getTokens();
  return !!(tokens?.onboardingCompletedAt || localStorage.getItem(ONBOARDING_COMPLETED_KEY) === 'true');
};

export const markOnboardingCompleted = (): void => {
  const currentTokens = getTokens();
  if (currentTokens) {
    setTokens({
      ...currentTokens,
      onboardingCompletedAt: new Date().toISOString(),
    });
  }
  localStorage.setItem(ONBOARDING_COMPLETED_KEY, 'true');
};

export const getAuthHeader = (): { Authorization: string } | {} => {
  const accessToken = getTokens()?.accessToken;
  return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
}; 