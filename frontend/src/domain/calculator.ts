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
 * Time in Facility = Total Treatment Minutes / (Productivity % / 100)
 * 
 * Example:
 * - 120 minutes treatment assigned
 * - 80% productivity target
 * - Time in Facility = 120 / 0.8 = 150 minutes
 * 
 * @param inputs - Calculator inputs
 * @returns Predicted clock-out time and metadata
 */
export function predictClockOut(inputs: CalculatorInputs): CalculatorResult {
    const { clockInTime, productivityPercentage, totalTreatmentMinutes, lunchMinutes } = inputs;

    // Validate inputs
    if (productivityPercentage <= 0 || productivityPercentage > 100) {
        throw new Error('Productivity percentage must be between 0 and 100');
    }
    if (totalTreatmentMinutes < 0) {
        throw new Error('Treatment minutes must be positive');
    }
    if (lunchMinutes < 0) {
        throw new Error('Lunch minutes must be positive');
    }

    // Calculate total time in facility needed for TREATMENT
    const productivityDecimal = productivityPercentage / 100;

    // Avoid division by zero (though validated above)
    if (productivityDecimal === 0) return { clockOutTime: clockInTime, crossesMidnight: false, totalWorkMinutes: 0 };

    const workMinutesForTreatment = Math.round(totalTreatmentMinutes / productivityDecimal);

    // Total time = Work Time + Lunch Time (Dead time)
    const totalMinutesAtFacility = workMinutesForTreatment + lunchMinutes;

    // Parse clock-in time
    const clockIn = parseTime(clockInTime);

    // Calculate clock-out time
    let totalMinutesFromMidnight = clockIn.hours * 60 + clockIn.minutes + totalMinutesAtFacility;

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
        totalWorkMinutes: totalMinutesAtFacility,
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

    if (inputs.totalTreatmentMinutes !== undefined) {
        if (inputs.totalTreatmentMinutes < 0 || inputs.totalTreatmentMinutes > 720) { // Max 12 hours reasonably
            errors.totalTreatmentMinutes = 'Treatment minutes must be between 0 and 720';
        }
    }

    if (inputs.lunchMinutes !== undefined) {
        if (inputs.lunchMinutes < 0 || inputs.lunchMinutes > 120) {
            errors.lunchMinutes = 'Lunch minutes must be between 0 and 120';
        }
    }

    return errors;
}

/**
 * Default calculator inputs.
 */
export const DEFAULT_INPUTS: CalculatorInputs = {
    clockInTime: '08:00',
    productivityPercentage: 100, // Default to 100% per requirements
    totalTreatmentMinutes: 240, // Default 4 hours
    lunchMinutes: 30, // Default 30 min lunch
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
