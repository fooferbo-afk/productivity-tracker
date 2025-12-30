/**
 * Layout component.
 * 
 * App shell with header and bottom navigation for mobile.
 */

import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../store/hooks';
import { selectCurrentUser } from '../../store/slices/authSlice';
import { BottomNav } from './BottomNav';
import './Layout.css';

export function Layout() {
    const currentUser = useAppSelector(selectCurrentUser);
    const location = useLocation();
    const navigate = useNavigate();

    // Get page title based on current route
    const getPageTitle = (): string => {
        const path = location.pathname;
        if (path.includes('dashboard')) return 'Dashboard';
        if (path.includes('calculator')) return 'Calculator';
        if (path.includes('history')) return 'History';
        if (path.includes('facilities')) return 'Facilities';
        if (path.includes('profile')) return 'Profile';
        return 'Productivity Tracker';
    };

    return (
        <div className="layout">
            <header className="layout__header">
                <h1 className="layout__title">{getPageTitle()}</h1>
                {currentUser && (
                    <button
                        className="layout__profile-btn"
                        onClick={() => navigate('/profile')}
                        aria-label="Profile"
                    >
                        <span className="layout__avatar">
                            {currentUser.name?.charAt(0).toUpperCase() || currentUser.email?.charAt(0).toUpperCase() || '?'}
                        </span>
                    </button>
                )}
            </header>

            <main className="layout__main">
                <Outlet />
            </main>

            <BottomNav />
        </div>
    );
}
