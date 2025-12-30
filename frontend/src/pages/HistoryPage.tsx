/**
 * HistoryPage placeholder.
 * 
 * View and filter past sessions.
 */

import './PageStyles.css';

export function HistoryPage() {
    return (
        <div className="page">
            <div className="page__placeholder">
                <div className="page__placeholder-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                    </svg>
                </div>
                <h2 className="page__placeholder-title">History</h2>
                <p className="page__placeholder-text">
                    Review your past sessions and productivity trends.
                </p>
            </div>
        </div>
    );
}
