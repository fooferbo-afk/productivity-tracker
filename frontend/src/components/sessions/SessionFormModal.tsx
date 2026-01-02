/**
 * SessionFormModal component.
 * 
 * Modal for manually logging a session.
 */

import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { createSession, updateSession, fetchSessionSummary } from '../../store/slices/sessionsSlice';
import { fetchFacilities, selectFacilities } from '../../store/slices/facilitiesSlice';
import type { SessionCreate, Session } from '../../types';
import './SessionFormModal.css';

interface SessionFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    session?: Session | null; // If provided, mode is EDIT
}

export function SessionFormModal({ isOpen, onClose, session }: SessionFormModalProps) {
    const dispatch = useAppDispatch();
    const facilities = useAppSelector(selectFacilities);
    const isEditMode = !!session;

    // Form State
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [startTime, setStartTime] = useState('09:00');
    const [endTime, setEndTime] = useState('17:00');
    const [facilityId, setFacilityId] = useState('');
    const [productivity, setProductivity] = useState(100);
    const [notes, setNotes] = useState('');

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch facilities if needed
    useEffect(() => {
        if (isOpen && facilities.length === 0) {
            dispatch(fetchFacilities(false));
        }
    }, [isOpen, facilities.length, dispatch]);

    // Reset or Populate form on open
    useEffect(() => {
        if (isOpen) {
            setError(null);
            if (session) {
                // Populate from session
                setDate(session.session_date);
                setStartTime(session.start_time.substring(0, 5));
                setEndTime(session.end_time.substring(0, 5));
                setFacilityId(session.facility_id);
                setProductivity(session.productivity_percentage);
                setNotes(session.notes || '');
            } else {
                // Reset to defaults
                setDate(new Date().toISOString().split('T')[0]);
                setStartTime('09:00');
                setEndTime('17:00');
                setProductivity(100);
                setNotes('');
                if (facilities.length > 0) setFacilityId(facilities[0].id);
                else setFacilityId('');
            }
        }
    }, [isOpen, session, facilities]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Validation
        if (!facilityId) {
            setError('Please select a facility');
            return;
        }

        if (startTime >= endTime) {
            setError('End time must be after start time');
            return;
        }

        setIsSubmitting(true);

        const payload = {
            session_date: date,
            start_time: startTime + ':00', // Append seconds
            end_time: endTime + ':00',
            facility_id: facilityId,
            productivity_percentage: productivity,
            notes: notes.trim() || undefined
        };

        try {
            if (isEditMode && session) {
                await dispatch(updateSession({ id: session.id, data: payload })).unwrap();
            } else {
                await dispatch(createSession(payload as SessionCreate)).unwrap();
            }
            dispatch(fetchSessionSummary({})); // Refresh stats
            onClose();
        } catch (err: any) {
            setError(err.message || `Failed to ${isEditMode ? 'update' : 'create'} session`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <button className="modal-close" onClick={onClose}>&times;</button>

                <h2 className="modal-title">{isEditMode ? 'Edit Session' : 'Log Session'}</h2>

                <form onSubmit={handleSubmit}>
                    {error && <div className="modal-error">{error}</div>}

                    <div className="form-group">
                        <label htmlFor="date">Date</label>
                        <input
                            type="date"
                            id="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="form-control"
                            required
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="startTime">Start Time</label>
                            <input
                                type="time"
                                id="startTime"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                className="form-control"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="endTime">End Time</label>
                            <input
                                type="time"
                                id="endTime"
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                                className="form-control"
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="facility">Facility</label>
                        <select
                            id="facility"
                            value={facilityId}
                            onChange={(e) => setFacilityId(e.target.value)}
                            className="form-control"
                            required
                        >
                            <option value="">Select a facility...</option>
                            {facilities.map(f => (
                                <option key={f.id} value={f.id}>{f.name}</option>
                            ))}
                        </select>
                        {facilities.length === 0 && (
                            <small className="form-hint">No facilities found. Create one in Facilities.</small>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="productivity">Productivity ({productivity}%)</label>
                        <input
                            type="range"
                            id="productivity"
                            min="1"
                            max="100"
                            value={productivity}
                            onChange={(e) => setProductivity(Number(e.target.value))}
                            className="form-range"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="notes">Notes (Optional)</label>
                        <textarea
                            id="notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="form-control"
                            rows={3}
                        />
                    </div>

                    <div className="modal-actions">
                        <button
                            type="button"
                            className="btn-secondary"
                            onClick={onClose}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Saving...' : 'Log Session'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
