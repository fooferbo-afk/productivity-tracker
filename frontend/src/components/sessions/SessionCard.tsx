/**
 * SessionCard component.
 * 
 * Displays summary of a past work session.
 */

import type { Session } from '../../types';
import './SessionCard.css';

interface SessionCardProps {
    session: Session;
    onEdit: (session: Session) => void;
    onDelete: (session: Session) => void;
}

export function SessionCard({ session, onEdit, onDelete }: SessionCardProps) {
    // Format times: "8:00 AM - 4:00 PM"
    const startTime = session.start_time.substring(0, 5); // HH:MM
    const endTime = session.end_time.substring(0, 5);

    return (
        <div className="session-card">
            <div className="session-card__left">
                <div className="session-card__date-badge">
                    <span className="session-card__month">
                        {new Date(session.session_date).toLocaleDateString(undefined, { month: 'short' })}
                    </span>
                    <span className="session-card__day">
                        {new Date(session.session_date).getDate()}
                    </span>
                </div>
                <div className="session-card__info">
                    <div className="session-card__facility">
                        {session.facility_name || 'Unknown Facility'}
                    </div>
                    <div className="session-card__time">
                        {startTime} - {endTime}
                        <span className="session-card__duration">
                            ({Math.round(session.duration_minutes / 60 * 10) / 10}h)
                        </span>
                    </div>
                </div>
            </div>

            <div className="session-card__right">
                <div className="session-card__productivity">
                    <div className="session-card__prod-value">
                        {session.productivity_percentage}%
                    </div>
                    <div className="session-card__prod-label">Prod.</div>
                </div>
            </div>

            <div className="session-card__actions">
                <button
                    className="icon-btn edit-btn"
                    onClick={() => onEdit(session)}
                    title="Edit Session"
                >
                    ✏️
                </button>
                <button
                    className="icon-btn delete-btn"
                    onClick={() => onDelete(session)}
                    title="Delete Session"
                >
                    🗑️
                </button>
            </div>

            {/* Notes tooltip or indicator could go here if notes exist */}
            {session.notes && (
                <div className="session-card__notes-indicator" title={session.notes}>📝</div>
            )}
        </div>
    );
}
