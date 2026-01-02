/**
 * SummaryStats component.
 * 
 * Displays aggregate metrics at the top of the history page.
 */

import type { SessionSummary } from '../../types';
import './SummaryStats.css';

interface SummaryStatsProps {
    summary: SessionSummary | null;
    filtersActive: boolean;
}

export function SummaryStats({ summary, filtersActive }: SummaryStatsProps) {
    if (!summary) return null;

    const totalHours = Math.round(summary.total_hours * 10) / 10;

    return (
        <div className="summary-stats">
            {filtersActive && (
                <div className="summary-stats__filter-badge">
                    Filtered Results
                </div>
            )}

            <div className="summary-stats__grid">
                <div className="stat-card">
                    <div className="stat-card__label">Total Sessions</div>
                    <div className="stat-card__value">{summary.total_sessions}</div>
                </div>

                <div className="stat-card">
                    <div className="stat-card__label">Total Hours</div>
                    <div className="stat-card__value">{totalHours}h</div>
                </div>

                <div className="stat-card">
                    <div className="stat-card__label">Avg. Productivity</div>
                    <div className="stat-card__value">
                        {Math.round(summary.average_productivity)}%
                    </div>
                </div>
            </div>
        </div>
    );
}
