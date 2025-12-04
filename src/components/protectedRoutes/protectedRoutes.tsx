import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/authcontext';

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, checkAuth, loading } = useAuth();
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    // Only check auth once when component mounts
    if (!hasChecked && !user) {
      checkAuth().finally(() => setHasChecked(true));
    } else if (user) {
      // If user already exists, no need to check
      setHasChecked(true);
    }
  }, []); // ✅ Empty array - only runs once on mount

  // Show loading while checking authentication
  if (!hasChecked || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  // After checking, if no user, redirect to login
  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  // User is authenticated, show the protected content
  return <>{children}</>;
};