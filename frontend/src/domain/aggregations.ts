/**
 * Aggregation utilities for session statistics.
 * 
 * Pure functions for computing averages and totals from session data.
 */

import type { Session, SessionSummary } from '../types';

/**
 * Calculate aggregate statistics from a list of sessions.
 * 
 * @param sessions - Array of sessions to aggregate
 * @returns Summary statistics
 */
export function calculateSessionSummary(sessions: Session[]): SessionSummary {
    if (sessions.length === 0) {
        return {
            total_sessions: 0,
            total_hours: 0,
            average_hours: 0,
            average_productivity: 0,
            date_range_start: null,
            date_range_end: null,
            facility_id: null,
        };
    }

    // Calculate totals
    const totalMinutes = sessions.reduce((sum, s) => sum + s.duration_minutes, 0);
    const totalHours = totalMinutes / 60;

    const totalProductivity = sessions.reduce(
        (sum, s) => sum + s.productivity_percentage,
        0
    );
    const averageProductivity = totalProductivity / sessions.length;

    // Find date range
    const dates = sessions.map(s => s.session_date).sort();

    return {
        total_sessions: sessions.length,
        total_hours: Math.round(totalHours * 100) / 100,
        average_hours: Math.round((totalHours / sessions.length) * 100) / 100,
        average_productivity: Math.round(averageProductivity * 100) / 100,
        date_range_start: dates[0] || null,
        date_range_end: dates[dates.length - 1] || null,
        facility_id: null,
    };
}

/**
 * Group sessions by date.
 * 
 * @param sessions - Array of sessions
 * @returns Map of date string to sessions
 */
export function groupSessionsByDate(sessions: Session[]): Map<string, Session[]> {
    const grouped = new Map<string, Session[]>();

    for (const session of sessions) {
        const date = session.session_date;
        const existing = grouped.get(date) || [];
        grouped.set(date, [...existing, session]);
    }

    return grouped;
}

/**
 * Group sessions by facility.
 * 
 * @param sessions - Array of sessions
 * @returns Map of facility ID to sessions
 */
export function groupSessionsByFacility(sessions: Session[]): Map<string, Session[]> {
    const grouped = new Map<string, Session[]>();

    for (const session of sessions) {
        const facilityId = session.facility_id;
        const existing = grouped.get(facilityId) || [];
        grouped.set(facilityId, [...existing, session]);
    }

    return grouped;
}

/**
 * Format hours for display (e.g., "8.5 hours").
 */
export function formatHours(hours: number): string {
    if (hours === 1) {
        return '1 hour';
    }
    return `${hours.toFixed(1)} hours`;
}

/**
 * Format productivity percentage for display.
 */
export function formatProductivity(percentage: number): string {
    return `${percentage.toFixed(1)}%`;
}
