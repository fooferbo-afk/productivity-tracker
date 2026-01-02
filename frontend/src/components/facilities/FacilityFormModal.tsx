/**
 * FacilityFormModal component.
 * 
 * Modal for creating or editing a facility.
 */

import { useState, useEffect } from 'react';
import type { Facility, FacilityCreate } from '../../types';
import './FacilityFormModal.css';

interface FacilityFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: FacilityCreate) => Promise<void>;
    initialData?: Facility;
    title: string;
}

export function FacilityFormModal({
    isOpen,
    onClose,
    onSubmit,
    initialData,
    title
}: FacilityFormModalProps) {
    const [name, setName] = useState('');
    const [location, setLocation] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Reset form when opening or changing initialData
    useEffect(() => {
        if (isOpen) {
            setName(initialData?.name || '');
            setLocation(initialData?.location || '');
            setError(null);
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim()) {
            setError('Name is required');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            await onSubmit({
                name: name.trim(),
                location: location.trim() || undefined
            });
            onClose();
        } catch (err: any) {
            setError(err.message || 'Failed to save facility');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <button className="modal-close" onClick={onClose}>&times;</button>

                <h2 className="modal-title">{title}</h2>

                <form onSubmit={handleSubmit}>
                    {error && <div className="modal-error">{error}</div>}

                    <div className="form-group">
                        <label htmlFor="name">Facility Name *</label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="form-control"
                            placeholder="e.g. City Hospital, Home Health"
                            autoFocus
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="location">Location (Optional)</label>
                        <input
                            type="text"
                            id="location"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            className="form-control"
                            placeholder="e.g. 123 Main St, Ward 4B"
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
                            disabled={isSubmitting || !name.trim()}
                        >
                            {isSubmitting ? 'Saving...' : 'Save Facility'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
