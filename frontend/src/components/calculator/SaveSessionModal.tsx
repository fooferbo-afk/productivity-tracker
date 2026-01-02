/**
 * SaveSessionModal component.
 * 
 * Dialog to save a calculated session to the backend.
 * Allows selecting a facility and adding notes.
 */

import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
    fetchFacilities,
    createFacility,
    selectActiveFacilities,
    selectFacilitiesStatus
} from '../../store/slices/facilitiesSlice';
import type { CalculatorInputs, CalculatorResult } from '../../types';
import { apiRequest } from '../../api/client';
import './SaveSessionModal.css';

interface SaveSessionModalProps {
    isOpen: boolean;
    onClose: () => void;
    inputs: CalculatorInputs;
    result: CalculatorResult;
}

export function SaveSessionModal({ isOpen, onClose, inputs, result }: SaveSessionModalProps) {
    const dispatch = useAppDispatch();
    const facilities = useAppSelector(selectActiveFacilities);
    const facilitiesStatus = useAppSelector(selectFacilitiesStatus);

    const [selectedFacilityId, setSelectedFacilityId] = useState<string>('');
    const [notes, setNotes] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    // Quick add facility state
    const [isAddingFacility, setIsAddingFacility] = useState(false);
    const [newFacilityName, setNewFacilityName] = useState('');

    useEffect(() => {
        if (isOpen && facilitiesStatus === 'idle') {
            dispatch(fetchFacilities(false)); // fetch only active
        }
    }, [isOpen, facilitiesStatus, dispatch]);

    // Select first facility by default if available
    useEffect(() => {
        if (!selectedFacilityId && facilities.length > 0) {
            setSelectedFacilityId(facilities[0].id);
        }
    }, [facilities, selectedFacilityId]);

    if (!isOpen) return null;

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsSaving(true);

        try {
            if (!selectedFacilityId) {
                throw new Error('Please select a facility');
            }

            // Create session payload
            const sessionData = {
                facility_id: selectedFacilityId,
                session_date: new Date().toISOString().split('T')[0], // Today
                start_time: inputs.clockInTime + ':00', // Add seconds
                end_time: result.clockOutTime + ':00',
                productivity_percentage: inputs.productivityPercentage,
                total_treatment_minutes: inputs.totalTreatmentMinutes,
                lunch_minutes: inputs.lunchMinutes,
                notes: notes.trim() || undefined
            };

            await apiRequest('/sessions', {
                method: 'POST',
                body: JSON.stringify(sessionData)
            });

            setSuccess(true);
            setTimeout(() => {
                onClose();
                setSuccess(false);
            }, 2000); // Close after 2 seconds
        } catch (err: any) {
            setError(err.message || 'Failed to save session');
        } finally {
            setIsSaving(false);
        }
    };

    const handleQuickAddFacility = async () => {
        if (!newFacilityName.trim()) return;

        try {
            const result = await dispatch(createFacility({ name: newFacilityName })).unwrap();
            setSelectedFacilityId(result.id);
            setIsAddingFacility(false);
            setNewFacilityName('');
        } catch (err) {
            // Error handling handled by global listener or local checking
            console.error('Failed to create facility', err);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <button className="modal-close" onClick={onClose}>&times;</button>

                <h2 className="modal-title">Save Session</h2>

                {success ? (
                    <div className="modal-success">
                        <div className="modal-success-icon">✅</div>
                        <p>Session saved successfully!</p>
                    </div>
                ) : (
                    <form onSubmit={handleSave}>
                        {error && <div className="modal-error">{error}</div>}

                        <div className="modal-summary">
                            <div className="modal-summary-item">
                                <label>Date</label>
                                <span>{new Date().toLocaleDateString()}</span>
                            </div>
                            <div className="modal-summary-item">
                                <label>Hours</label>
                                <span>{inputs.clockInTime} — {result.clockOutTime}</span>
                            </div>
                            <div className="modal-summary-item">
                                <label>Productivity</label>
                                <span>{inputs.productivityPercentage}%</span>
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="facility">Facility</label>

                            {!isAddingFacility ? (
                                <div className="facility-select-group">
                                    <select
                                        id="facility"
                                        value={selectedFacilityId}
                                        onChange={(e) => setSelectedFacilityId(e.target.value)}
                                        className="form-control"
                                        disabled={facilities.length === 0}
                                    >
                                        <option value="" disabled>Select a facility...</option>
                                        {facilities.map(f => (
                                            <option key={f.id} value={f.id}>{f.name}</option>
                                        ))}
                                    </select>
                                    <button
                                        type="button"
                                        className="btn-secondary btn-sm"
                                        onClick={() => setIsAddingFacility(true)}
                                    >
                                        + New
                                    </button>
                                </div>
                            ) : (
                                <div className="facility-add-group">
                                    <input
                                        type="text"
                                        value={newFacilityName}
                                        onChange={(e) => setNewFacilityName(e.target.value)}
                                        placeholder="Enter facility name"
                                        className="form-control"
                                        autoFocus
                                    />
                                    <button
                                        type="button"
                                        className="btn-primary btn-sm"
                                        onClick={handleQuickAddFacility}
                                        disabled={!newFacilityName.trim()}
                                    >
                                        Add
                                    </button>
                                    <button
                                        type="button"
                                        className="btn-text btn-sm"
                                        onClick={() => setIsAddingFacility(false)}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            )}

                            {facilities.length === 0 && !isAddingFacility && (
                                <p className="help-text">You need a facility to save a session.</p>
                            )}
                        </div>

                        <div className="form-group">
                            <label htmlFor="notes">Notes (Optional)</label>
                            <textarea
                                id="notes"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                className="form-control"
                                rows={3}
                                placeholder="Any details to remember..."
                            />
                        </div>

                        <div className="modal-actions">
                            <button type="button" className="btn-secondary" onClick={onClose}>
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn-primary"
                                disabled={isSaving || !selectedFacilityId}
                            >
                                {isSaving ? 'Saving...' : 'Save Session'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
