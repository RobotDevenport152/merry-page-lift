import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** If provided, user must have this role in user_roles table */
  requiredRole?: 'admin' | 'moderator' | 'grower' | 'customer';
  /** Where to redirect unauthenticated users (default: /login) */
  redirectTo?: string;
}

/**
 * P1 FIX: Route-level authentication + RBAC guard.
 *
 * Previously /admin had no route protection — any unauthenticated visitor
 * could reach the page; Admin.tsx relied on internal checks.
 *
 * This component:
 * 1. Redirects unauthenticated users to /login (preserving intended destination)
 * 2. Optionally checks user_roles table for required role
 * 3. Shows a loading state while auth is initialising (prevents flash)
 */
export default function ProtectedRoute({
  children,
  requiredRole,
  redirectTo = '/login',
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [roleChecked, setRoleChecked] = useState(!requiredRole);
  const [hasRole, setHasRole] = useState(false);

  useEffect(() => {
    if (!requiredRole || !user) {
      setRoleChecked(true);
      return;
    }

    supabase
      .rpc('has_role', { _user_id: user.id, _role: requiredRole })
      .then(({ data }) => {
        setHasRole(!!data);
        setRoleChecked(true);
      })
      .catch(() => {
        setHasRole(false);
        setRoleChecked(true);
      });
  }, [user, requiredRole]);

  // Show spinner while auth state is resolving (prevents redirect flash)
  if (loading || !roleChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Not authenticated → redirect to login, preserving the intended URL
  if (!user) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Authenticated but missing required role → redirect to home
  if (requiredRole && !hasRole) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
