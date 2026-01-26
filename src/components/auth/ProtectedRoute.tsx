import { useAuth } from '@/hooks/useAuth';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, profile, loading, profileLoading } = useAuth();
  const location = useLocation();

  // Show loading while auth is being determined
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Redirect to auth if not logged in
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Show loading while profile is being fetched
  if (profileLoading && !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading your profile...</p>
        </div>
      </div>
    );
  }

  // Check if user needs to complete onboarding
  // Don't redirect if already on onboarding page to avoid infinite loop
  const isOnboardingPage = location.pathname === '/onboarding';
  const needsOnboarding = profile && !profile.onboarding_completed;

  if (needsOnboarding && !isOnboardingPage) {
    return <Navigate to="/onboarding" replace />;
  }

  // If onboarding is complete and user is on onboarding page, redirect to dashboard
  if (profile?.onboarding_completed && isOnboardingPage) {
    return <Navigate to="/dashboard" replace />;
  }

  return <DashboardLayout>{children}</DashboardLayout>;
};
