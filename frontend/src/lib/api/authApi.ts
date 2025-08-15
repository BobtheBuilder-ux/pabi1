import {baseApi} from './baseApi';
import {
    API_SuccessPayload,
    ForgotPasswordRequest,
    ForgotPasswordResponse,
    LoginRequest,
    LoginResponse,
    LogoutRequest,
    LogoutResponse,
    RefreshTokenRequest,
    RefreshTokenResponse,
    RegisterCompanyRequest,
    RegisterIndividualRequest,
    RegisterResponse,
    ResetPasswordRequest,
    ResetPasswordResponse,
    VerifyEmailRequest,
    VerifyEmailResponse
} from '../types';

export const authApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // Login endpoint
        login: builder.mutation<API_SuccessPayload<LoginResponse>, LoginRequest>({
            query: (credentials) => ({
                url: '/auth/login',
                method: 'POST',
                body: credentials,
                headers: {'X-SKIP-AUTH': 'true'}, // Skip auth for login
            }),
            invalidatesTags: ['Auth'],
        }),

        // Register individual endpoint
        registerIndividual: builder.mutation<API_SuccessPayload<RegisterResponse>, RegisterIndividualRequest>({
            query: (userData) => ({
                url: '/auth/register/individual',
                method: 'POST',
                body: userData,
                headers: {'X-SKIP-AUTH': 'true'}, // Skip auth for login
            }),
            invalidatesTags: ['Auth'],
        }),

        // Register business endpoint
        registerBusiness: builder.mutation<API_SuccessPayload<RegisterResponse>, RegisterCompanyRequest>({
            query: (userData) => ({
                url: '/auth/register/business',
                method: 'POST',
                body: userData,
                headers: {'X-SKIP-AUTH': 'true'}, // Skip auth for login
            }),
            invalidatesTags: ['Auth'],
        }),

        // Forgot password endpoint
        forgotPassword: builder.mutation<API_SuccessPayload<ForgotPasswordResponse>, ForgotPasswordRequest>({
            query: (data) => ({
                url: '/auth/forgot-password',
                method: 'POST',
                body: data,
                headers: {'X-SKIP-AUTH': 'true'}, // Skip auth for login
            }),
        }),

        // Reset password endpoint
        resetPassword: builder.mutation<API_SuccessPayload<ResetPasswordResponse>, ResetPasswordRequest>({
            query: (data) => ({
                url: '/auth/reset-password',
                method: 'POST',
                body: data,
                headers: {'X-SKIP-AUTH': 'true'}, // Skip auth for login
            }),
            invalidatesTags: ['Auth'],
        }),

        // Refresh token endpoint
        refreshToken: builder.mutation<API_SuccessPayload<RefreshTokenResponse>, RefreshTokenRequest>({
            query: (data) => ({
                url: '/auth/refresh-token',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Auth'],
        }),

        // Logout endpoint
        logout: builder.mutation<API_SuccessPayload<LogoutResponse>, LogoutRequest>({
            query: (data) => ({
                url: '/auth/logout',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Auth'],
        }),

        // Verify email endpoint
        verifyEmail: builder.mutation<API_SuccessPayload<VerifyEmailResponse>, VerifyEmailRequest>({
            query: (data) => ({
                url: '/auth/verify-email',
                method: 'POST',
                params: data,
                headers: {'X-SKIP-AUTH': 'true'}, // Skip auth for login
            }),
            invalidatesTags: ['Auth'],
        }),
    }),
});

export const {
    useLoginMutation,
    useRegisterIndividualMutation,
    useRegisterBusinessMutation,
    useForgotPasswordMutation,
    useResetPasswordMutation,
    useRefreshTokenMutation,
    useLogoutMutation,
    useVerifyEmailMutation
} = authApi; 