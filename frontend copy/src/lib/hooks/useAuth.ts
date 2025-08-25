import {useState} from 'react';
import {useLoginMutation, useRegisterBusinessMutation, useRegisterIndividualMutation,} from '../api/authApi';
import {
    clearTokens,
    getTokens,
    hasCompletedOnboarding as checkHasCompletedOnboarding,
    isAuthenticated as checkIsAuthenticated,
    markOnboardingCompleted as markOnboardingCompletedLocal,
    setTokens
} from '../utils/tokenHelpers';
import {LoginRequest, RegisterCompanyRequest, RegisterIndividualRequest} from '../types';
import {useGetUserProfileQuery} from '../api/userApi';

interface LoginResult {
    success: boolean;
    hasCompletedOnboarding: boolean;
}

interface User {
    id: string;
    email: string;
    name: string;
    avatar?: string;
    coverImage?: string;
    isNewUser?: boolean;
    biography?: string;
    nationality?: string;
    phone?: string;
    countryOfResidence?: string;
}

const DEFAULT_AVATAR = '/ellipse-10-4.svg';

export const useAuth = () => {
    const [isLoading, setIsLoading] = useState(false);

    const accessToken = getTokens()?.accessToken;
    const refreshToken = getTokens()?.refreshToken;
    const isAuthenticated = checkIsAuthenticated();
    const hasCompletedOnboarding = checkHasCompletedOnboarding();

    const [loginMutation] = useLoginMutation();
    const [registerIndividualMutation] = useRegisterIndividualMutation();
    const [registerBusinessMutation] = useRegisterBusinessMutation();

    const {data: userProfile, isLoading: isLoadingProfile} = useGetUserProfileQuery(undefined, {
        skip: !isAuthenticated,
    });

    const convertApiUserToLocalUser = (apiUser: any, isNewUser: boolean = false): User => {
        return {
            id: apiUser.id?.toString() || '',
            email: apiUser.email || '',
            name: apiUser.businessProfile?.companyName || apiUser.individualProfile?.name || apiUser.names || apiUser.name || '',
            biography: apiUser.businessProfile?.biography || apiUser.individualProfile?.biography || '',
            nationality: apiUser.businessProfile?.registrationCountry || apiUser.individualProfile?.nationality || '',
            phone: apiUser.businessProfile?.companyPhone || apiUser.individualProfile?.phone || '',
            countryOfResidence: apiUser.businessProfile?.residenceCountry || apiUser.individualProfile?.residenceCountry || '',
            avatar: apiUser.businessProfile?.profileImageUrl || apiUser.individualProfile?.profileImageUrl || DEFAULT_AVATAR,
            coverImage: apiUser.businessProfile?.coverImageUrl || apiUser.individualProfile?.coverImageUrl || '',
            isNewUser
        };
    };

    const login = async (email: string, password: string): Promise<LoginResult> => {
        setIsLoading(true);

        try {
            const loginRequest: LoginRequest = {email, password};
            const response = await loginMutation(loginRequest).unwrap();

            if (response.data) {
                const {
                    accessToken: newAccessToken,
                    refreshToken: newRefreshToken,
                    onboardingCompletedAt: onboarding
                } = response.data;

                setTokens({
                    accessToken: newAccessToken,
                    refreshToken: newRefreshToken,
                    expiresIn: response.data.expiresIn || 0,
                    userType: response.data.userType || '',
                    email: response.data.email || email,
                    onboardingCompletedAt: onboarding
                });

                const hasCompletedOnboarding = !!onboarding;
                setIsLoading(false);

                return {success: true, hasCompletedOnboarding};
            }

            setIsLoading(false);
            return {success: false, hasCompletedOnboarding: false};
        } catch (error) {
            console.error('Login failed:', error);
            setIsLoading(false);
            return {success: false, hasCompletedOnboarding: false};
        }
    };

    const logout = async (): Promise<void> => {
        clearTokens();
        window.location.href = '/login';
    };

    const registerIndividual = async (userData: RegisterIndividualRequest) => {
        try {
            const response = await registerIndividualMutation(userData).unwrap();
            return response;
        } catch (error) {
            console.error('Registration failed:', error);
            throw error;
        }
    };

    const registerBusiness = async (userData: RegisterCompanyRequest) => {
        try {
            const response = await registerBusinessMutation(userData).unwrap();
            return response;
        } catch (error) {
            console.error('Registration failed:', error);
            throw error;
        }
    };

    const markUserAsExisting = () => {
        markOnboardingCompletedLocal();
    };

    const handleLoginSuccess = (response: any, email: string) => {
        if (response.data?.payload) {
            const {
                accessToken: newAccessToken,
                refreshToken: newRefreshToken,
                onboardingCompletedAt
            } = response.data.payload;

            if (newAccessToken && newRefreshToken) {
                setTokens({
                    accessToken: newAccessToken,
                    refreshToken: newRefreshToken,
                    expiresIn: 0,
                    userType: '',
                    email: email,
                    onboardingCompletedAt: onboardingCompletedAt || null
                });
            }
        }
    };

    const handleRegistrationSuccess = (response: any) => {
        if (response.data?.payload) {
            const {
                accessToken: newAccessToken,
                refreshToken: newRefreshToken,
                onboardingCompletedAt
            } = response.data.payload;

            if (newAccessToken && newRefreshToken) {
                setTokens({
                    accessToken: newAccessToken,
                    refreshToken: newRefreshToken,
                    expiresIn: 0,
                    userType: '',
                    email: '',
                    onboardingCompletedAt: onboardingCompletedAt || null
                });
            }
        }
    };

    const user: User | null = userProfile?.data ? convertApiUserToLocalUser(userProfile.data, !hasCompletedOnboarding) : null;

    return {
        user,
        login,
        logout,
        registerIndividual,
        registerBusiness,
        isLoading: isLoading || isLoadingProfile,
        markUserAsExisting,
        accessToken,
        refreshToken,
        isAuthenticated,
        hasCompletedOnboarding,
        handleLoginSuccess,
        handleRegistrationSuccess,
        userProfile,
    };
}; 