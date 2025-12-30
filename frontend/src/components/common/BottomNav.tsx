/**
 * BottomNav component.
 * 
 * Mobile-friendly bottom navigation with icons.
 */

import { NavLink } from 'react-router-dom';
import './BottomNav.css';

interface NavItem {
    path: string;
    label: string;
    icon: React.ReactNode;
}

const navItems: NavItem[] = [
    {
        path: '/dashboard',
        label: 'Home',
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
        ),
    },
    {
        path: '/calculator',
        label: 'Calculate',
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="4" y="2" width="16" height="20" rx="2" />
                <line x1="8" y1="6" x2="16" y2="6" />
                <line x1="8" y1="10" x2="8" y2="10.01" />
                <line x1="12" y1="10" x2="12" y2="10.01" />
                <line x1="16" y1="10" x2="16" y2="10.01" />
                <line x1="8" y1="14" x2="8" y2="14.01" />
                <line x1="12" y1="14" x2="12" y2="14.01" />
                <line x1="16" y1="14" x2="16" y2="14.01" />
                <line x1="8" y1="18" x2="8" y2="18.01" />
                <line x1="12" y1="18" x2="12" y2="18.01" />
                <line x1="16" y1="18" x2="16" y2="18.01" />
            </svg>
        ),
    },
    {
        path: '/history',
        label: 'History',
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
            </svg>
        ),
    },
    {
        path: '/facilities',
        label: 'Facilities',
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 21h18" />
                <path d="M9 8h1" />
                <path d="M9 12h1" />
                <path d="M9 16h1" />
                <path d="M14 8h1" />
                <path d="M14 12h1" />
                <path d="M14 16h1" />
                <path d="M5 21V5a2 2 0 012-2h10a2 2 0 012 2v16" />
            </svg>
        ),
    },
];

export function BottomNav() {
    return (
        <nav className="bottom-nav">
            {navItems.map((item) => (
                <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                        `bottom-nav__item ${isActive ? 'bottom-nav__item--active' : ''}`
                    }
                >
                    <span className="bottom-nav__icon">{item.icon}</span>
                    <span className="bottom-nav__label">{item.label}</span>
                </NavLink>
            ))}
        </nav>
    );
}
