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
import { MessagesPage } from "../screens/MessagesPage";
import { NotificationsPage } from "../screens/NotificationsPage/NotificationsPage";
import ForgotPasswordPage from "../screens/ForgotPassword/ForgotPassword";
import ResetPasswordPage from "../screens/ForgotPassword/ResetPassword";
import { AdminDashboard } from "../screens/AdminDashboard";
import { OverviewPage } from "../screens/AdminDashboard/OverviewPage";
import { AccountsPage } from "../screens/AdminDashboard/AccountsPage";
import { CreateAccountPage } from "../screens/AdminDashboard/CreateAccountPage";
import { BoostRequestsPage } from "../screens/AdminDashboard/BoostRequestsPage";
import { BillingPage } from "../screens/AdminDashboard/BillingPage";
import ContentModerationPage from '../screens/AdminDashboard/ContentModerationPage';
import AnalyticsPage from '../screens/AdminDashboard/AnalyticsPage';
import MessagingSystemPage from '../screens/AdminDashboard/MessagingSystemPage';
import AdminControlsPage from '../screens/AdminDashboard/AdminControlsPage';
import ActivityViewerPage from '../screens/AdminDashboard/ActivityViewerPage';
import TicketSystemPage from '../screens/AdminDashboard/TicketSystemPage';

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

const LandingRoute: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
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

  return children ? <>{children}</> : <LandingPage />;
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
      <Route 
        path="/my-connections" 
        element={
          <ProtectedRoute>
            <MyConnections />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/messages" 
        element={
          <ProtectedRoute>
            <MessagesPage />
          </ProtectedRoute>
        }
      />
      <Route 
        path="/notifications" 
        element={
          <ProtectedRoute>
            <NotificationsPage />
          </ProtectedRoute>
        }
      />
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
      
      {/* Admin Dashboard Routes */}
      <Route
        path="/admin"
        element={<AdminDashboard />}
      >
        <Route index element={<OverviewPage />} />
        <Route path="accounts" element={<AccountsPage />} />
        <Route path="accounts/create" element={<CreateAccountPage />} />
        <Route path="boost-requests" element={<BoostRequestsPage />} />
        <Route path="networking" element={<ActivityViewerPage />} />
        <Route path="messaging" element={<MessagingSystemPage />} />
        <Route path="products" element={<AnalyticsPage />} />
        <Route path="events" element={<div className="p-6"><h1 className="text-2xl font-bold">Event Scheduling</h1><p className="text-gray-600">Coming soon...</p></div>} />
        <Route path="billing" element={<BillingPage />} />
        <Route path="support" element={<TicketSystemPage />} />
        <Route path="moderation" element={<ContentModerationPage />} />
        <Route path="settings" element={<AdminControlsPage />} />
      </Route>
    </Routes>
  );
};
