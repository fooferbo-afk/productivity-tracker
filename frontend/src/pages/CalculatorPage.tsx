/**
 * CalculatorPage placeholder.
 * 
 * Productivity calculator for predicting clock-out time.
 */

import './PageStyles.css';

export function CalculatorPage() {
    return (
        <div className="page">
            <div className="page__placeholder">
                <div className="page__placeholder-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="4" y="2" width="16" height="20" rx="2" />
                        <line x1="8" y1="6" x2="16" y2="6" />
                        <line x1="8" y1="10" x2="8" y2="10.01" />
                        <line x1="12" y1="10" x2="12" y2="10.01" />
                        <line x1="16" y1="10" x2="16" y2="10.01" />
                        <line x1="8" y1="14" x2="8" y2="14.01" />
                        <line x1="12" y1="14" x2="12" y2="14.01" />
                        <line x1="16" y1="14" x2="16" y2="14.01" />
                    </svg>
                </div>
                <h2 className="page__placeholder-title">Calculator</h2>
                <p className="page__placeholder-text">
                    Predict your clock-out time based on productivity targets.
                </p>
            </div>
        </div>
    );
}
