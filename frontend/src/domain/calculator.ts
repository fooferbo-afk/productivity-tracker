/**
 * Productivity calculator domain logic.
 * 
 * Pure functions for clock-out time prediction.
 * This module contains NO UI logic - only business calculations.
 */

import type { CalculatorInputs, CalculatorResult } from '../types';

/**
 * Parse a time string (HH:MM) into hours and minutes.
 */
function parseTime(timeStr: string): { hours: number; minutes: number } {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return { hours: hours || 0, minutes: minutes || 0 };
}

/**
 * Format hours and minutes into a time string (HH:MM).
 */
function formatTime(hours: number, minutes: number): string {
    const h = hours.toString().padStart(2, '0');
    const m = minutes.toString().padStart(2, '0');
    return `${h}:${m}`;
}

/**
 * Calculate the predicted clock-out time based on productivity inputs.
 * 
 * Formula explanation:
 * If productivity target is 75% and you need 60 minutes of productive time per session:
 * - Actual time needed per session = 60 / 0.75 = 80 minutes
 * - This accounts for non-productive time (breaks, documentation, travel, etc.)
 * 
 * Total work time = (session duration / productivity %) × number of sessions
 * 
 * @param inputs - Calculator inputs
 * @returns Predicted clock-out time and metadata
 */
export function predictClockOut(inputs: CalculatorInputs): CalculatorResult {
    const { clockInTime, productivityPercentage, sessionDurationMinutes, totalSessionsExpected } = inputs;

    // Validate inputs
    if (productivityPercentage <= 0 || productivityPercentage > 100) {
        throw new Error('Productivity percentage must be between 0 and 100');
    }
    if (sessionDurationMinutes <= 0) {
        throw new Error('Session duration must be positive');
    }
    if (totalSessionsExpected <= 0) {
        throw new Error('Number of sessions must be positive');
    }

    // Calculate total productive time needed (in minutes)
    const totalProductiveMinutes = sessionDurationMinutes * totalSessionsExpected;

    // Calculate actual work time needed (accounting for productivity)
    // If 75% productive, need more total time to achieve the productive minutes
    const productivityDecimal = productivityPercentage / 100;
    const totalWorkMinutes = Math.round(totalProductiveMinutes / productivityDecimal);

    // Parse clock-in time
    const clockIn = parseTime(clockInTime);

    // Calculate clock-out time
    let totalMinutesFromMidnight = clockIn.hours * 60 + clockIn.minutes + totalWorkMinutes;

    // Check if crosses midnight
    const crossesMidnight = totalMinutesFromMidnight >= 24 * 60;

    // Normalize to within a day (handle midnight crossing)
    if (crossesMidnight) {
        totalMinutesFromMidnight = totalMinutesFromMidnight % (24 * 60);
    }

    // Convert back to hours and minutes
    const clockOutHours = Math.floor(totalMinutesFromMidnight / 60);
    const clockOutMinutes = totalMinutesFromMidnight % 60;

    return {
        clockOutTime: formatTime(clockOutHours, clockOutMinutes),
        crossesMidnight,
        totalWorkMinutes,
    };
}

/**
 * Validate calculator inputs and return any errors.
 * 
 * @param inputs - Partial calculator inputs
 * @returns Object with field names as keys and error messages as values
 */
export function validateInputs(inputs: Partial<CalculatorInputs>): Record<string, string> {
    const errors: Record<string, string> = {};

    if (inputs.clockInTime !== undefined) {
        if (!inputs.clockInTime || !/^\d{2}:\d{2}$/.test(inputs.clockInTime)) {
            errors.clockInTime = 'Please enter a valid time (HH:MM)';
        }
    }

    if (inputs.productivityPercentage !== undefined) {
        if (inputs.productivityPercentage <= 0 || inputs.productivityPercentage > 100) {
            errors.productivityPercentage = 'Productivity must be between 1 and 100';
        }
    }

    if (inputs.sessionDurationMinutes !== undefined) {
        if (inputs.sessionDurationMinutes < 5 || inputs.sessionDurationMinutes > 180) {
            errors.sessionDurationMinutes = 'Session duration must be between 5 and 180 minutes';
        }
    }

    if (inputs.totalSessionsExpected !== undefined) {
        if (inputs.totalSessionsExpected < 1 || inputs.totalSessionsExpected > 20) {
            errors.totalSessionsExpected = 'Number of sessions must be between 1 and 20';
        }
    }

    return errors;
}

/**
 * Default calculator inputs.
 */
export const DEFAULT_INPUTS: CalculatorInputs = {
    clockInTime: '08:00',
    productivityPercentage: 75,
    sessionDurationMinutes: 45,
    totalSessionsExpected: 8,
};

/**
 * Format minutes as hours and minutes string (e.g., "8h 30m").
 */
export function formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours === 0) {
        return `${mins}m`;
    }
    if (mins === 0) {
        return `${hours}h`;
    }
    return `${hours}h ${mins}m`;
}

/**
 * Format a time string for display (e.g., "3:45 PM").
 */
export function formatTimeForDisplay(time24: string): string {
    const { hours, minutes } = parseTime(time24);
    const period = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12;
    return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
}
