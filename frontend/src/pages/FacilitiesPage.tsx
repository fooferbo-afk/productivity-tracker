/**
 * FacilitiesPage placeholder.
 * 
 * Manage facilities/workplaces.
 */

import './PageStyles.css';

export function FacilitiesPage() {
    return (
        <div className="page">
            <div className="page__placeholder">
                <div className="page__placeholder-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 21h18" />
                        <path d="M5 21V5a2 2 0 012-2h10a2 2 0 012 2v16" />
                        <path d="M9 8h1" />
                        <path d="M9 12h1" />
                        <path d="M9 16h1" />
                        <path d="M14 8h1" />
                        <path d="M14 12h1" />
                        <path d="M14 16h1" />
                    </svg>
                </div>
                <h2 className="page__placeholder-title">Facilities</h2>
                <p className="page__placeholder-text">
                    Manage your workplaces and facilities.
                </p>
            </div>
        </div>
    );
}
