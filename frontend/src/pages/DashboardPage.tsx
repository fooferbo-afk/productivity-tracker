/**
 * DashboardPage placeholder.
 * 
 * Main overview screen showing key metrics.
 */

import './PageStyles.css';

export function DashboardPage() {
    return (
        <div className="page">
            <div className="page__placeholder">
                <div className="page__placeholder-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="7" height="7" />
                        <rect x="14" y="3" width="7" height="7" />
                        <rect x="14" y="14" width="7" height="7" />
                        <rect x="3" y="14" width="7" height="7" />
                    </svg>
                </div>
                <h2 className="page__placeholder-title">Dashboard</h2>
                <p className="page__placeholder-text">
                    Overview of your productivity metrics will appear here.
                </p>
            </div>
        </div>
    );
}
