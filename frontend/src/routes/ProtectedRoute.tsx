/**
 * ProtectedRoute component.
 * 
 * Redirects unauthenticated users to login.
 * Shows loading state while auth status is being determined.
 */

import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';
import { selectAuthStatus, selectIsAuthenticated } from '../store/slices/authSlice';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
    const status = useAppSelector(selectAuthStatus);
    const isAuthenticated = useAppSelector(selectIsAuthenticated);
    const location = useLocation();

    // Still determining auth state
    if (status === 'unknown' || status === 'loading') {
        return (
            <div className="route-loading">
                <div className="route-loading__spinner" />
            </div>
        );
    }

    // Not authenticated - redirect to login
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Authenticated - render children
    return <>{children}</>;
}
