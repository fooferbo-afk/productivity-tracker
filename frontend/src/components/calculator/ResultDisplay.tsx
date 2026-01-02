/**
 * ResultDisplay component.
 * 
 * Shows the calculated clock-out time prediction with visual flair.
 */

import type { CalculatorResult } from '../../types';
import { formatDuration, formatTimeForDisplay } from '../../domain/calculator';
import './ResultDisplay.css';

interface ResultDisplayProps {
    result: CalculatorResult | null;
    hasErrors: boolean;
    onSave?: () => void;
}

export function ResultDisplay({ result, hasErrors, onSave }: ResultDisplayProps) {
    if (hasErrors) {
        return (
            <div className="result-display result-display--error">
                <div className="result-display__icon">⚠️</div>
                <p className="result-display__message">
                    Please fix the errors above
                </p>
            </div>
        );
    }

    if (!result) {
        return (
            <div className="result-display result-display--empty">
                <div className="result-display__icon">🕐</div>
                <p className="result-display__message">
                    Enter your inputs to see prediction
                </p>
            </div>
        );
    }

    const formattedTime = formatTimeForDisplay(result.clockOutTime);
    const formattedDuration = formatDuration(result.totalWorkMinutes);

    return (
        <div className="result-display result-display--success">
            <div className="result-display__header">
                <span className="result-display__label">Predicted Clock-out</span>
            </div>

            <div className="result-display__time">
                <span className="result-display__time-value">{formattedTime}</span>
                {result.crossesMidnight && (
                    <span className="result-display__next-day">+1 day</span>
                )}
            </div>

            <div className="result-display__details">
                <div className="result-display__detail">
                    <span className="result-display__detail-label">Total Work Time</span>
                    <span className="result-display__detail-value">{formattedDuration}</span>
                </div>
                <div className="result-display__detail">
                    <span className="result-display__detail-label">Raw Time</span>
                    <span className="result-display__detail-value">{result.clockOutTime}</span>
                </div>
            </div>

            {onSave && (
                <button className="result-display__save-btn" onClick={onSave}>
                    Save Session
                </button>
            )}
        </div>
    );
}
