/**
 * Time utilities for consistent date/time handling.
 */

/**
 * Get today's date in ISO format (YYYY-MM-DD).
 */
export function getTodayISO(): string {
    return new Date().toISOString().split('T')[0];
}

/**
 * Get current time in 24-hour format (HH:MM).
 */
export function getCurrentTime(): string {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
}

/**
 * Format an ISO date string for display (e.g., "Dec 30, 2024").
 */
export function formatDateForDisplay(isoDate: string): string {
    const date = new Date(isoDate + 'T00:00:00');
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

/**
 * Format a date as a relative string (e.g., "Today", "Yesterday", or the date).
 */
export function formatRelativeDate(isoDate: string): string {
    const today = getTodayISO();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayISO = yesterday.toISOString().split('T')[0];

    if (isoDate === today) {
        return 'Today';
    }
    if (isoDate === yesterdayISO) {
        return 'Yesterday';
    }
    return formatDateForDisplay(isoDate);
}

/**
 * Get the start of the current week (Sunday).
 */
export function getWeekStartISO(): string {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const start = new Date(now);
    start.setDate(now.getDate() - dayOfWeek);
    return start.toISOString().split('T')[0];
}

/**
 * Get the start of the current month.
 */
export function getMonthStartISO(): string {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
}

/**
 * Calculate days between two dates.
 */
export function daysBetween(startISO: string, endISO: string): number {
    const start = new Date(startISO);
    const end = new Date(endISO);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Check if a date is within a range.
 */
export function isDateInRange(dateISO: string, startISO: string, endISO: string): boolean {
    return dateISO >= startISO && dateISO <= endISO;
}
