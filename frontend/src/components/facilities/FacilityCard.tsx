/**
 * FacilityCard component.
 * 
 * Displays summary of a facility with actions.
 */

import type { Facility } from '../../types';
import './FacilityCard.css';

interface FacilityCardProps {
    facility: Facility;
    onEdit: (facility: Facility) => void;
    onArchive: (facility: Facility) => void;
}

export function FacilityCard({ facility, onEdit, onArchive }: FacilityCardProps) {
    return (
        <div className={`facility-card ${facility.is_archived ? 'facility-card--archived' : ''}`}>
            <div className="facility-card__content">
                <div className="facility-card__header">
                    <h3 className="facility-card__name">{facility.name}</h3>
                    {facility.is_archived && (
                        <span className="facility-card__badge">Archived</span>
                    )}
                </div>

                {facility.location && (
                    <div className="facility-card__location">
                        <span className="facility-card__icon">📍</span>
                        {facility.location}
                    </div>
                )}
            </div>

            <div className="facility-card__actions">
                <button
                    className="facility-card__action-btn"
                    onClick={() => onEdit(facility)}
                    aria-label="Edit facility"
                >
                    Edit
                </button>
                <button
                    className="facility-card__action-btn facility-card__action-btn--danger"
                    onClick={() => onArchive(facility)}
                    aria-label={facility.is_archived ? "Unarchive facility" : "Archive facility"}
                >
                    {facility.is_archived ? 'Restore' : 'Archive'}
                </button>
            </div>
        </div>
    );
}
