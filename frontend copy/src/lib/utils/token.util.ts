import { jwtDecode, JwtPayload } from 'jwt-decode';
import { 
  getAccessToken, 
  getRefreshToken, 
  updateTokens, 
  clearTokens 
} from './tokenHelpers';

// Simple token validation using localStorage
export const tokenValidation = async () => {
  let accessToken = getAccessToken() || '';
  let refreshToken = getRefreshToken() || '';

  let isTokenValid = true;
  
  if (accessToken && refreshToken) {
    const now = Date.now() / 1000;
    
    try {
      const refreshTKNDecoded = jwtDecode<JwtPayload>(refreshToken);

      // 0. Check if refresh token is expired
      if (!refreshTKNDecoded?.exp || refreshTKNDecoded.exp < now) {
        clearTokens();
        isTokenValid = false;
        return {
          accessToken: '',
          isTokenValid,
          refreshToken: '',
        };
      }

      // 1. Check if access token is expired
      const accessTKNDecoded = jwtDecode<JwtPayload>(accessToken);
      if (!accessTKNDecoded?.exp || accessTKNDecoded.exp < now) {
        // Access token is expired but refresh token is still valid
        // The baseApi will handle the refresh automatically
        isTokenValid = false;
      }
    } catch (error) {
      // If token parsing fails, clear tokens
      console.error('Token validation error:', error);
      clearTokens();
      isTokenValid = false;
      accessToken = '';
      refreshToken = '';
    }
  } else {
    isTokenValid = false;
  }

  return {
    accessToken,
    isTokenValid,
    refreshToken,
  };
};
