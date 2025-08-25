export interface BusinessProfile {
  companyName: string;
  companyEmail: string;
  companyPhone: string;
  ownerName: string;
  ownerPersonalEmail: string;
  biography: string;
  registrationCountry: string;
  residenceCountry: string;
  location: string;
  profileImageUrl: string;
  coverImageUrl: string;
  isBoosted: boolean;
  boostExpiresAt: string;
}

export interface IndividualProfile {
  name: string;
  phone: string;
  biography: string;
  nationality: string;
  residenceCountry: string;
  location: string;
  profileImageUrl: string;
  coverImageUrl: string;
  isBoosted: boolean;
  boostExpiresAt: string;
}

export interface IUser {
  userId: string;
  email: string;
  userType: UserType;
  onboardingCompletedAt: string;
  businessProfile?: BusinessProfile;
  individualProfile?: IndividualProfile;
  createdAt: string;
  updatedAt: string;
}

export type UserType = "BUSINESS" | "INDIVIDUAL" | "ADMIN";

export interface AuthState {
  userInfo: IUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  onboardingCompletedAt: string | null;
}

export type LoginResponse = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  userType: string;
  email: string;
  onboardingCompletedAt: string | null;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterIndividualRequest = {
  accountType: "individual";
  name: string;
  email: string;
  phone: string;
  password: string;
  nationality: string;
  residenceCountry: string;
  biography: string;
};

export type RegisterCompanyRequest = {
  accountType: "company";
  companyName: string;
  companyEmail: string;
  companyPhone: string;
  personalName: string;
  personalEmail: string;
  password: string;
  registrationCountry: string;
  residenceCountry: string;
  biography: string;
};

export type RegisterRequest =
  | RegisterIndividualRequest
  | RegisterCompanyRequest;

export type RegisterResponse = {
  accessToken: string;
  refreshToken: string;
  user: IUser;
  message: string;
};

export type ForgotPasswordRequest = {
  email: string;
};

export type ForgotPasswordResponse = {
  message: string;
  success: boolean;
};

export type ResetPasswordRequest = {
  token: string;
  newPassword: string;
};

export type ResetPasswordResponse = {
  message: string;
  success: boolean;
};

export type ChangePasswordRequest = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export type ChangePasswordResponse = {
  message: string;
  success: boolean;
};

export type RefreshTokenRequest = {
  refreshToken: string;
};

export type RefreshTokenResponse = {
  accessToken: string;
  refreshToken: string;
};

export type LogoutRequest = {
  refreshToken: string;
};

export type LogoutResponse = {
  message: string;
  success: boolean;
};

export type VerifyEmailRequest = {
  token: string;
};

export type VerifyEmailResponse = {
  userId: string;
  email: string;
  message: string;
};

export type ImageUploadResponse = {
  imageUrl: string;
};

export type UserPublicProfile = {
  userId: string;
  name: string;
  email: string;
  phone: string;
  boosted: boolean;
  industries: string[];
  interests: string[];
  countryOfRegistration: string;
  countryOfResidence: string;
  connectionStatus:
    | "NONE"
    | "REQUEST_SENT"
    | "REQUEST_RECEIVED"
    | "CONNECTED"
    | "REQUEST_REJECTED"
    | "REQUEST_CANCELLED";
  biography: string;
  profilePictureUrl: string;
  coverPictureUrl: string;
  joinedAt: string;
};

export type ProfileDetailsUpdateRequest = {
  name: string;
  phone: string;
  biography: string;
  nationality: string;
  countryOfResidence: string;
};
