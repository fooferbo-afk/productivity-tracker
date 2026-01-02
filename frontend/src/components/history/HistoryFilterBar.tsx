/**
 * HistoryFilterBar component.
 * 
 * Filter controls for the history page matches the 'Report' dashboard style.
 * Supports date range and facility filtering.
 */

import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setFilters, fetchSessions, fetchSessionSummary, selectSessionFilters } from '../../store/slices/sessionsSlice';
import { selectFacilities, fetchFacilities } from '../../store/slices/facilitiesSlice';
import './HistoryFilterBar.css';

export function HistoryFilterBar() {
    const dispatch = useAppDispatch();
    const filters = useAppSelector(selectSessionFilters);
    const facilities = useAppSelector(selectFacilities);

    // Local state for debouncing or immediate apply
    // For now, applying immediately on change

    useEffect(() => {
        // Load facilities if empty
        if (facilities.length === 0) {
            dispatch(fetchFacilities(false));
        }
    }, [dispatch, facilities.length]);

    const handleDateChange = (field: 'date_from' | 'date_to', value: string) => {
        const newFilters = { ...filters, [field]: value || undefined, offset: 0 };
        dispatch(setFilters(newFilters));
        // Fetch handled by HistoryPage effect
        // But maybe we should trigger it here to be explicit? 
        // HistoryPage has dependency on filters, so it will trigger.
    };

    const handleFacilityChange = (facilityId: string) => {
        const newFilters = { ...filters, facility_id: facilityId || undefined, offset: 0 };
        dispatch(setFilters(newFilters));
    };

    const handleClear = () => {
        dispatch(setFilters({ limit: 20, offset: 0 }));
    };

    const hasActiveFilters = filters.date_from || filters.date_to || filters.facility_id;

    return (
        <div className="filter-bar">
            <div className="filter-group">
                <select
                    className="filter-select"
                    value={filters.facility_id || ''}
                    onChange={(e) => handleFacilityChange(e.target.value)}
                >
                    <option value="">All Facilities</option>
                    {facilities.map(f => (
                        <option key={f.id} value={f.id}>{f.name}</option>
                    ))}
                </select>
            </div>

            <div className="filter-group date-group">
                <input
                    type="date"
                    className="filter-date"
                    value={filters.date_from || ''}
                    onChange={(e) => handleDateChange('date_from', e.target.value)}
                    placeholder="From"
                />
                <span className="date-separator">-</span>
                <input
                    type="date"
                    className="filter-date"
                    value={filters.date_to || ''}
                    onChange={(e) => handleDateChange('date_to', e.target.value)}
                    placeholder="To"
                />
            </div>

            {hasActiveFilters && (
                <button className="filter-clear-btn" onClick={handleClear}>
                    Clear all
                </button>
            )}
        </div>
    );
}
