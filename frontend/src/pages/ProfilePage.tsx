/**
 * ProfilePage.
 * 
 * User profile and settings with logout.
 */

import { useNavigate } from 'react-router-dom';
import { signOut } from '../firebase';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { logout, selectCurrentUser } from '../store/slices/authSlice';
import './PageStyles.css';
import './ProfilePage.css';

export function ProfilePage() {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const currentUser = useAppSelector(selectCurrentUser);

    const handleLogout = async () => {
        try {
            await signOut();
            dispatch(logout());
            navigate('/login', { replace: true });
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <div className="page">
            <div className="profile">
                <div className="profile__header">
                    <div className="profile__avatar">
                        {currentUser?.name?.charAt(0).toUpperCase() ||
                            currentUser?.email?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <h2 className="profile__name">
                        {currentUser?.name || 'User'}
                    </h2>
                    <p className="profile__email">
                        {currentUser?.email}
                    </p>
                </div>

                <div className="profile__section">
                    <h3 className="profile__section-title">Account</h3>
                    <div className="profile__info">
                        <div className="profile__info-row">
                            <span className="profile__info-label">Role</span>
                            <span className="profile__info-value">
                                {currentUser?.role === 'therapist' ? 'Therapist' : currentUser?.role}
                            </span>
                        </div>
                        <div className="profile__info-row">
                            <span className="profile__info-label">Member since</span>
                            <span className="profile__info-value">
                                {currentUser?.created_at
                                    ? new Date(currentUser.created_at).toLocaleDateString()
                                    : '-'}
                            </span>
                        </div>
                    </div>
                </div>

                <button
                    className="profile__logout"
                    onClick={handleLogout}
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    Log out
                </button>
            </div>
        </div>
    );
}
