import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "../lib/hooks/useAuth";
import { usePreferences } from "../lib/hooks/usePreferences";
import { LandingPage } from "../screens/LandingPage/LandingPage";
import LoginPage from "../screens/LoginPage/LoginPage";
import { SignupPage } from "../screens/SignupPage/SignupPage";
import { VerifyAccountPage } from "../screens/VerifyAccountPage";
import { OnboardingPage } from "../screens/OnboardingPage/OnboardingPage";
import { ProfilePage } from "../screens/ProfilePage/ProfilePage";
import { SettingsPage } from "../screens/SettingsPage/SettingsPage";
import { UserProfilePage } from "../screens/UserProfilePage";
import { CategoriesTestPage } from "../screens/CategoriesTestPage";
import GLoader from "../components/ui/loader";
import { MyConnections } from "../screens/MyConnections/MyConnections";
import ForgotPasswordPage from "../screens/ForgotPassword/ForgotPassword";
import ResetPasswordPage from "../screens/ForgotPassword/ResetPassword";

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#8a358a]"></div>
      </div>
    );
  }

  return user ? <>{children}</> : <Navigate to="/login" />;
};

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#8a358a]"></div>
      </div>
    );
  }

  return user ? <Navigate to="/" /> : <>{children}</>;
};

const OnboardingRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isLoading } = useAuth();
  const { hasCompletedOnboarding, isLoading: preferencesLoading } =
    usePreferences();

  if (isLoading || preferencesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#8a358a]"></div>
      </div>
    );
  }

  if (hasCompletedOnboarding) {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
};

const LandingRoute: React.FC = () => {
  const { user, isLoading } = useAuth();
  const { hasCompletedOnboarding, isLoading: preferencesLoading } =
    usePreferences();

  if (isLoading || preferencesLoading) {
    return <GLoader fullScreen />;
  }

  // If user is logged in but hasn't completed onboarding, redirect to onboarding
  if (user && !hasCompletedOnboarding) {
    return <Navigate to="/onboarding" />;
  }

  return <LandingPage />;
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingRoute />} />
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage onLogin={() => {}} />
          </PublicRoute>
        }
      />
      <Route path="/my-connections" element={<MyConnections />} />
      <Route
        path="/signup"
        element={
          <PublicRoute>
            <SignupPage />
          </PublicRoute>
        }
      />
      <Route
        path="/onboarding"
        element={
          <OnboardingRoute>
            <OnboardingPage />
          </OnboardingRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <PublicRoute>
            <ForgotPasswordPage />
          </PublicRoute>
        }
      />
      <Route
        path="/reset-password"
        element={
          <PublicRoute>
            <ResetPasswordPage />
          </PublicRoute>
        }
      />
      <Route path="/user/:userId" element={<UserProfilePage />} />
      <Route
        path="/verify-account"
        element={
          <PublicRoute>
            <VerifyAccountPage />
          </PublicRoute>
        }
      />
      <Route path="/test-categories" element={<CategoriesTestPage />} />
    </Routes>
  );
};
