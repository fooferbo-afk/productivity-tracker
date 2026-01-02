/**
 * CalculatorPage.
 * 
 * Productivity calculator for predicting clock-out time.
 * Manages state for inputs and uses domain logic for calculations.
 */

import { useState, useMemo } from 'react';
import { CalculatorForm } from '../components/calculator/CalculatorForm';
import { ResultDisplay } from '../components/calculator/ResultDisplay';
import { SaveSessionModal } from '../components/calculator/SaveSessionModal';
import {
    predictClockOut,
    validateInputs,
    DEFAULT_INPUTS
} from '../domain/calculator';
import type { CalculatorInputs } from '../types';
import './CalculatorPage.css';

export function CalculatorPage() {
    const [inputs, setInputs] = useState<CalculatorInputs>(DEFAULT_INPUTS);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Calculate result and validation state
    const { result, errors } = useMemo(() => {
        const validationdModel = validateInputs(inputs);
        const hasErrors = Object.keys(validationdModel).length > 0;

        let calculatedResult = null;
        if (!hasErrors) {
            try {
                calculatedResult = predictClockOut(inputs);
            } catch (e) {
                // Should not happen if validation passes
                console.error('Calculation error:', e);
            }
        }

        return {
            result: calculatedResult,
            errors: validationdModel
        };
    }, [inputs]);

    const handleReset = () => {
        setInputs(DEFAULT_INPUTS);
    };

    return (
        <div className="calculator-page">
            <header className="calculator-page__header">
                <h1 className="calculator-page__title">Calculator</h1>
                <p className="calculator-page__subtitle">
                    Predict your clock-out time based on productivity targets
                </p>
            </header>

            <div className="calculator-page__content">
                <section className="calculator-page__form-section">
                    <CalculatorForm
                        inputs={inputs}
                        errors={errors}
                        onChange={setInputs}
                        onReset={handleReset}
                    />
                </section>

                <section className="calculator-page__result-section">
                    <ResultDisplay
                        result={result}
                        hasErrors={Object.keys(errors).length > 0}
                        onSave={() => setIsModalOpen(true)}
                    />
                </section>
            </div>

            {result && (
                <SaveSessionModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    inputs={inputs}
                    result={result}
                />
            )}
        </div>
    );
}
