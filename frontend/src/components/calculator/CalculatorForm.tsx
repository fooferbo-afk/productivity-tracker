/**
 * CalculatorForm component.
 * 
 * Input form for productivity calculator with real-time validation.
 */

import { useState, type ChangeEvent, useEffect } from 'react';
import type { CalculatorInputs } from '../../types';
import './CalculatorForm.css';

interface CalculatorFormProps {
    inputs: CalculatorInputs;
    errors: Record<string, string>;
    onChange: (inputs: CalculatorInputs) => void;
    onReset: () => void;
}

type TimeUnit = 'minutes' | 'hours';

export function CalculatorForm({ inputs, errors, onChange, onReset }: CalculatorFormProps) {
    const [treatmentUnit, setTreatmentUnit] = useState<TimeUnit>('minutes');
    const [lunchUnit, setLunchUnit] = useState<TimeUnit>('minutes');

    // Local state to handle input text (avoids "dot" loss issue and allows empty state)
    const [treatmentInput, setTreatmentInput] = useState(inputs.totalTreatmentMinutes.toString());
    const [lunchInput, setLunchInput] = useState(inputs.lunchMinutes.toString());

    // Sync local state when props change externally (e.g. Reset), 
    // BUT be careful not to overwrite user typing unless it's a significant change.
    useEffect(() => {
        const currentMinutes = inputs.totalTreatmentMinutes;
        const currentVal = parseFloat(treatmentInput);
        let calculatedPropsVal = currentVal;

        if (isNaN(currentVal)) {
            // Local is empty/invalid. If we decided not to force sync on empty, we skip unless prop is 0 (Reset)
            // But if user cleared it, we don't want to re-fill.
            // Check if prop matches "0" basically.
            calculatedPropsVal = 0;
        } else {
            if (treatmentUnit === 'hours') calculatedPropsVal = currentVal * 60;
        }

        // Allow tolerance for float math
        if (Math.abs(calculatedPropsVal - currentMinutes) > 0.1) {
            const displayVal = treatmentUnit === 'hours'
                ? (currentMinutes / 60).toString()
                : currentMinutes.toString();
            setTreatmentInput(displayVal);
        }
    }, [inputs.totalTreatmentMinutes, treatmentUnit]); // eslint-disable-line react-hooks/exhaustive-deps

    // Similar sync for lunch Minutes
    useEffect(() => {
        const currentMinutes = inputs.lunchMinutes;
        const currentVal = parseFloat(lunchInput);
        let calculatedPropsVal = currentVal;

        if (isNaN(currentVal)) {
            calculatedPropsVal = 0;
        } else {
            if (lunchUnit === 'hours') calculatedPropsVal = currentVal * 60;
        }

        if (Math.abs(calculatedPropsVal - currentMinutes) > 0.1) {
            const displayVal = lunchUnit === 'hours'
                ? (currentMinutes / 60).toString()
                : currentMinutes.toString();
            setLunchInput(displayVal);
        }
    }, [inputs.lunchMinutes, lunchUnit]); // eslint-disable-line react-hooks/exhaustive-deps


    const handleTimeChange = (e: ChangeEvent<HTMLInputElement>) => {
        onChange({ ...inputs, clockInTime: e.target.value });
    };

    const handleProductivityChange = (e: ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value, 10);
        if (!isNaN(value)) {
            onChange({ ...inputs, productivityPercentage: value });
        }
    };

    const handleTreatmentChange = (e: ChangeEvent<HTMLInputElement>) => {
        const valStr = e.target.value;
        setTreatmentInput(valStr);

        if (valStr === '') {
            // When empty, we can internally treat as 0 for the calculator logic
            // or just not update (preserving last valid state in parent).
            // User requested being able to "erase". 
            // Setting it to 0 in parent allows the calculator to run with 0.
            onChange({ ...inputs, totalTreatmentMinutes: 0 });
            return;
        }

        const val = parseFloat(valStr);
        if (!isNaN(val)) {
            let minutes = val;
            if (treatmentUnit === 'hours') {
                minutes = val * 60;
            }
            // Round to nearest minute to keep data clean, or allow decimals?
            // "minutes" usually implies integer in this domain.
            onChange({ ...inputs, totalTreatmentMinutes: Math.round(minutes) });
        }
    };

    const handleLunchChange = (e: ChangeEvent<HTMLInputElement>) => {
        const valStr = e.target.value;
        setLunchInput(valStr);

        if (valStr === '') {
            onChange({ ...inputs, lunchMinutes: 0 });
            return;
        }

        const val = parseFloat(valStr);
        if (!isNaN(val)) {
            let minutes = val;
            if (lunchUnit === 'hours') {
                minutes = val * 60;
            }
            onChange({ ...inputs, lunchMinutes: Math.round(minutes) });
        }
    };

    const handleTreatmentUnitChange = (e: ChangeEvent<HTMLSelectElement>) => {
        const newUnit = e.target.value as TimeUnit;
        const currentVal = parseFloat(treatmentInput);

        if (!isNaN(currentVal)) {
            // Convert the DISPLAY value to the new unit so the minute-value stays same
            // e.g. 60 min -> 1 hour.
            const minutes = (treatmentUnit === 'hours') ? currentVal * 60 : currentVal;

            const newDisplayVal = (newUnit === 'hours') ? (minutes / 60) : minutes;

            // Format to avoid ugly float precision issues (e.g. 1.0000000001)
            // But keep decimals if distinct
            const formatted = parseFloat(newDisplayVal.toFixed(2)).toString();
            setTreatmentInput(formatted);
        }

        setTreatmentUnit(newUnit);
        // Parent state (minutes) remains unchanged basically
    };

    const handleLunchUnitChange = (e: ChangeEvent<HTMLSelectElement>) => {
        const newUnit = e.target.value as TimeUnit;
        const currentVal = parseFloat(lunchInput);

        if (!isNaN(currentVal)) {
            const minutes = (lunchUnit === 'hours') ? currentVal * 60 : currentVal;
            const newDisplayVal = (newUnit === 'hours') ? (minutes / 60) : minutes;
            const formatted = parseFloat(newDisplayVal.toFixed(2)).toString();
            setLunchInput(formatted);
        }
        setLunchUnit(newUnit);
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

            {/* Total Treatment Minutes */}
            <div className="calculator-form__field">
                <label htmlFor="treatmentMinutes" className="calculator-form__label">
                    Total Treatment (Assigned)
                </label>
                <div className="calculator-form__inline">
                    <input
                        type="number"
                        id="treatmentMinutes"
                        className={`calculator-form__input calculator-form__input--small ${errors.totalTreatmentMinutes ? 'calculator-form__input--error' : ''}`}
                        value={treatmentInput}
                        onChange={handleTreatmentChange}
                        min={0}
                        step={treatmentUnit === 'hours' ? 0.25 : 5}
                    />
                    <select
                        className="calculator-form__select"
                        value={treatmentUnit}
                        onChange={handleTreatmentUnitChange}
                    >
                        <option value="minutes">Minutes</option>
                        <option value="hours">Hours</option>
                    </select>
                </div>
                {errors.totalTreatmentMinutes && (
                    <span className="calculator-form__error">{errors.totalTreatmentMinutes}</span>
                )}
            </div>

            {/* Lunch Minutes */}
            <div className="calculator-form__field">
                <label htmlFor="lunchMinutes" className="calculator-form__label">
                    Lunch / Break
                </label>
                <div className="calculator-form__inline">
                    <input
                        type="number"
                        id="lunchMinutes"
                        className={`calculator-form__input calculator-form__input--small ${errors.lunchMinutes ? 'calculator-form__input--error' : ''}`}
                        value={lunchInput}
                        onChange={handleLunchChange}
                        min={0}
                        step={lunchUnit === 'hours' ? 0.25 : 5}
                    />
                    <select
                        className="calculator-form__select"
                        value={lunchUnit}
                        onChange={handleLunchUnitChange}
                    >
                        <option value="minutes">Minutes</option>
                        <option value="hours">Hours</option>
                    </select>
                </div>
                {errors.lunchMinutes && (
                    <span className="calculator-form__error">{errors.lunchMinutes}</span>
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
