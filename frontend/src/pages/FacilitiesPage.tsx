/**
 * FacilitiesPage.
 * 
 * Manage facilities (create, edit, archive).
 */

import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
    fetchFacilities,
    createFacility,
    updateFacility,
    selectFacilities,
    selectFacilitiesStatus,
    selectFacilitiesError
} from '../store/slices/facilitiesSlice';
import { FacilityCard } from '../components/facilities/FacilityCard';
import { FacilityFormModal } from '../components/facilities/FacilityFormModal';
import type { Facility, FacilityCreate } from '../types';
import './FacilitiesPage.css';

export function FacilitiesPage() {
    const dispatch = useAppDispatch();
    const facilities = useAppSelector(selectFacilities);
    const status = useAppSelector(selectFacilitiesStatus);
    const error = useAppSelector(selectFacilitiesError);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingFacility, setEditingFacility] = useState<Facility | undefined>(undefined);

    useEffect(() => {
        if (status === 'idle') {
            dispatch(fetchFacilities(true)); // Include archived
        }
    }, [status, dispatch]);

    const handleCreate = () => {
        setEditingFacility(undefined);
        setIsModalOpen(true);
    };

    const handleEdit = (facility: Facility) => {
        setEditingFacility(facility);
        setIsModalOpen(true);
    };

    const handleArchive = async (facility: Facility) => {
        if (confirm(`${facility.is_archived ? 'Restore' : 'Archive'} ${facility.name}?`)) {
            // Note: In a real app we'd handle the type casting better or have a separate update type
            // The API expects Partial<FacilityUpdate>, so we just send what changed.
            await dispatch(updateFacility({
                id: facility.id,
                data: { is_archived: !facility.is_archived } as any
            }));
            dispatch(fetchFacilities(true));
        }
    };

    const handleSubmit = async (data: FacilityCreate) => {
        if (editingFacility) {
            await dispatch(updateFacility({
                id: editingFacility.id,
                data
            })).unwrap();
        } else {
            await dispatch(createFacility(data)).unwrap();
        }
    };

    return (
        <div className="facilities-page">
            <header className="facilities-page__header">
                <div>
                    <h1 className="facilities-page__title">Facilities</h1>
                    <p className="facilities-page__subtitle">
                        Manage your work locations and clinics
                    </p>
                </div>
                <button
                    className="facilities-page__add-btn"
                    onClick={handleCreate}
                >
                    + Add Facility
                </button>
            </header>

            {status === 'loading' && facilities.length === 0 && (
                <div className="facilities-page__loading">Loading facilities...</div>
            )}

            {error && (
                <div className="facilities-page__error">
                    {error}
                </div>
            )}

            <div className="facilities-page__grid">
                {facilities.map(facility => (
                    <FacilityCard
                        key={facility.id}
                        facility={facility}
                        onEdit={handleEdit}
                        onArchive={handleArchive}
                    />
                ))}
            </div>

            {status === 'succeeded' && facilities.length === 0 && (
                <div className="facilities-page__empty">
                    <div className="facilities-page__empty-icon">🏥</div>
                    <h3>No facilities yet</h3>
                    <p>Add your first facility to start tracking sessions.</p>
                    <button
                        className="facilities-page__empty-btn"
                        onClick={handleCreate}
                    >
                        Create Facility
                    </button>
                </div>
            )}

            <FacilityFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleSubmit}
                initialData={editingFacility}
                title={editingFacility ? 'Edit Facility' : 'New Facility'}
            />
        </div>
    );
}
