/**
 * CalculatorForm component.
 * 
 * Input form for productivity calculator with real-time validation.
 */

import { type ChangeEvent } from 'react';
import type { CalculatorInputs } from '../../types';
import './CalculatorForm.css';

interface CalculatorFormProps {
    inputs: CalculatorInputs;
    errors: Record<string, string>;
    onChange: (inputs: CalculatorInputs) => void;
    onReset: () => void;
}

export function CalculatorForm({ inputs, errors, onChange, onReset }: CalculatorFormProps) {
    const handleTimeChange = (e: ChangeEvent<HTMLInputElement>) => {
        onChange({ ...inputs, clockInTime: e.target.value });
    };

    const handleProductivityChange = (e: ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value, 10);
        if (!isNaN(value)) {
            onChange({ ...inputs, productivityPercentage: value });
        }
    };

    const handleDurationChange = (e: ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value, 10);
        if (!isNaN(value)) {
            onChange({ ...inputs, sessionDurationMinutes: value });
        }
    };

    const handleSessionsChange = (e: ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value, 10);
        if (!isNaN(value)) {
            onChange({ ...inputs, totalSessionsExpected: value });
        }
    };

    const incrementProductivity = () => {
        if (inputs.productivityPercentage < 100) {
            onChange({ ...inputs, productivityPercentage: inputs.productivityPercentage + 5 });
        }
    };

    const decrementProductivity = () => {
        if (inputs.productivityPercentage > 5) {
            onChange({ ...inputs, productivityPercentage: inputs.productivityPercentage - 5 });
        }
    };

    return (
        <div className="calculator-form">
            {/* Clock-in time */}
            <div className="calculator-form__field">
                <label htmlFor="clockInTime" className="calculator-form__label">
                    Clock-in Time
                </label>
                <input
                    type="time"
                    id="clockInTime"
                    className={`calculator-form__input ${errors.clockInTime ? 'calculator-form__input--error' : ''}`}
                    value={inputs.clockInTime}
                    onChange={handleTimeChange}
                />
                {errors.clockInTime && (
                    <span className="calculator-form__error">{errors.clockInTime}</span>
                )}
            </div>

            {/* Productivity percentage */}
            <div className="calculator-form__field">
                <label htmlFor="productivity" className="calculator-form__label">
                    Target Productivity
                </label>
                <div className="calculator-form__stepper">
                    <button
                        type="button"
                        className="calculator-form__stepper-btn"
                        onClick={decrementProductivity}
                        disabled={inputs.productivityPercentage <= 5}
                        aria-label="Decrease productivity"
                    >
                        −
                    </button>
                    <div className="calculator-form__stepper-value">
                        <input
                            type="number"
                            id="productivity"
                            className={`calculator-form__stepper-input ${errors.productivityPercentage ? 'calculator-form__input--error' : ''}`}
                            value={inputs.productivityPercentage}
                            onChange={handleProductivityChange}
                            min={1}
                            max={100}
                        />
                        <span className="calculator-form__stepper-suffix">%</span>
                    </div>
                    <button
                        type="button"
                        className="calculator-form__stepper-btn"
                        onClick={incrementProductivity}
                        disabled={inputs.productivityPercentage >= 100}
                        aria-label="Increase productivity"
                    >
                        +
                    </button>
                </div>
                {errors.productivityPercentage && (
                    <span className="calculator-form__error">{errors.productivityPercentage}</span>
                )}
            </div>

            {/* Session duration */}
            <div className="calculator-form__field">
                <label htmlFor="duration" className="calculator-form__label">
                    Session Duration
                </label>
                <div className="calculator-form__inline">
                    <input
                        type="number"
                        id="duration"
                        className={`calculator-form__input calculator-form__input--small ${errors.sessionDurationMinutes ? 'calculator-form__input--error' : ''}`}
                        value={inputs.sessionDurationMinutes}
                        onChange={handleDurationChange}
                        min={5}
                        max={180}
                    />
                    <span className="calculator-form__suffix">minutes</span>
                </div>
                {errors.sessionDurationMinutes && (
                    <span className="calculator-form__error">{errors.sessionDurationMinutes}</span>
                )}
            </div>

            {/* Total sessions */}
            <div className="calculator-form__field">
                <label htmlFor="sessions" className="calculator-form__label">
                    Expected Sessions
                </label>
                <input
                    type="number"
                    id="sessions"
                    className={`calculator-form__input calculator-form__input--small ${errors.totalSessionsExpected ? 'calculator-form__input--error' : ''}`}
                    value={inputs.totalSessionsExpected}
                    onChange={handleSessionsChange}
                    min={1}
                    max={20}
                />
                {errors.totalSessionsExpected && (
                    <span className="calculator-form__error">{errors.totalSessionsExpected}</span>
                )}
            </div>

            {/* Reset button */}
            <button
                type="button"
                className="calculator-form__reset"
                onClick={onReset}
            >
                Reset to Defaults
            </button>
        </div>
    );
}
