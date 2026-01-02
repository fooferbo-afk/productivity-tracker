/**
 * HistoryPage.
 * 
 * Displays session history and aggregated statistics.
 */

import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
    fetchSessions,
    fetchSessionSummary,
    deleteSession,
    selectSessions,
    selectSessionSummary,
    selectSessionsStatus,
    selectSessionsError,
    selectSessionFilters
} from '../store/slices/sessionsSlice';
import { SessionCard } from '../components/sessions/SessionCard';
import { SummaryStats } from '../components/history/SummaryStats';
import { SessionFormModal } from '../components/sessions/SessionFormModal';
import { HistoryFilterBar } from '../components/history/HistoryFilterBar';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import type { Session } from '../types';
import './HistoryPage.css';

export function HistoryPage() {
    const dispatch = useAppDispatch();
    const sessions = useAppSelector(selectSessions);
    const summary = useAppSelector(selectSessionSummary);
    const status = useAppSelector(selectSessionsStatus);
    const error = useAppSelector(selectSessionsError);
    const filters = useAppSelector(selectSessionFilters);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSession, setEditingSession] = useState<Session | null>(null);

    // Delete Confirmation State
    const [deletingSession, setDeletingSession] = useState<Session | null>(null);

    useEffect(() => {
        dispatch(fetchSessions(filters));
        dispatch(fetchSessionSummary(filters));
    }, [dispatch, filters]);

    const hasFilters = Object.keys(filters).length > 2;

    // Handlers
    const handleCreate = () => {
        setEditingSession(null);
        setIsModalOpen(true);
    };

    const handleEdit = (session: Session) => {
        setEditingSession(session);
        setIsModalOpen(true);
    };

    const handleDeleteClick = (session: Session) => {
        setDeletingSession(session);
    };

    const handleConfirmDelete = async () => {
        if (deletingSession) {
            await dispatch(deleteSession(deletingSession.id));
            dispatch(fetchSessionSummary(filters)); // Refresh stats after delete
            setDeletingSession(null);
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingSession(null);
    };

    return (
        <div className="history-page">
            <header className="history-page__header">
                <h1 className="history-page__title">Session History</h1>
                <button
                    className="history-page__add-btn"
                    onClick={handleCreate}
                >
                    + Log Session
                </button>
            </header>

            <SummaryStats
                summary={summary}
                filtersActive={hasFilters}
            />

            <HistoryFilterBar />

            {error && <div className="history-page__error">{error}</div>}

            {status === 'loading' && sessions.length === 0 && (
                <div className="history-page__loading">Loading history...</div>
            )}

            <div className="history-page__list">
                {sessions.map(session => (
                    <SessionCard
                        key={session.id}
                        session={session}
                        onEdit={handleEdit}
                        onDelete={handleDeleteClick}
                    />
                ))}

                {status === 'succeeded' && sessions.length === 0 && (
                    <div className="history-page__empty">
                        <div className="history-page__empty-icon">📅</div>
                        <h3>No sessions found</h3>
                        <p>Adjust filters or log a new session.</p>
                    </div>
                )}
            </div>

            {status === 'succeeded' && sessions.length > 0 && (
                <div className="history-page__footer">
                    <span className="history-page__footer-text">
                        Showing {sessions.length} sessions
                    </span>
                </div>
            )}

            {/* Edit/Create Modal */}
            <SessionFormModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                session={editingSession}
            />

            {/* Delete Confirmation */}
            <ConfirmDialog
                isOpen={!!deletingSession}
                title="Delete Session"
                message="Are you sure you want to delete this session? This action cannot be undone."
                confirmLabel="Delete"
                isDestructive={true}
                onConfirm={handleConfirmDelete}
                onCancel={() => setDeletingSession(null)}
            />
        </div>
    );
}
