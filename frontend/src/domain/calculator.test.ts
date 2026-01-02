
import { describe, it, expect } from 'vitest';
import { predictClockOut, validateInputs } from './calculator';
import type { CalculatorInputs } from '../types';

describe('Calculator Domain Logic', () => {
    describe('predictClockOut', () => {
        it('calculates correct time with lunch', () => {
            const inputs: CalculatorInputs = {
                clockInTime: '08:00',
                productivityPercentage: 100,
                totalTreatmentMinutes: 120, // 2 hours work
                lunchMinutes: 30, // 30 mins break
            };

            const result = predictClockOut(inputs);

            // 2 hours work + 30 mins lunch = 2.5 hours at facility
            // 8:00 + 2.5 hours = 10:30
            expect(result.clockOutTime).toBe('10:30');
        });

        it('calculates correct time for 50% productivity + lunch', () => {
            const inputs: CalculatorInputs = {
                clockInTime: '08:00',
                productivityPercentage: 50,
                totalTreatmentMinutes: 120, // 2 hours treatment -> needs 4 hours work
                lunchMinutes: 60, // + 1 hour lunch
            };

            // Total time = 4h work + 1h lunch = 5h
            // 8:00 + 5h = 13:00
            const result = predictClockOut(inputs);

            expect(result.clockOutTime).toBe('13:00');
        });

        it('handles zero lunch', () => {
            const inputs: CalculatorInputs = {
                clockInTime: '09:00',
                productivityPercentage: 80,
                totalTreatmentMinutes: 240, // 4h / 0.8 = 5h work
                lunchMinutes: 0,
            };

            // 9:00 + 5h = 14:00
            const result = predictClockOut(inputs);

            expect(result.clockOutTime).toBe('14:00');
        });
    });

    describe('validateInputs', () => {
        it('validates lunch minutes', () => {
            expect(validateInputs({ lunchMinutes: -10 }).lunchMinutes).toBeDefined();
            expect(validateInputs({ lunchMinutes: 130 }).lunchMinutes).toBeDefined();
            expect(validateInputs({ lunchMinutes: 30 }).lunchMinutes).toBeUndefined();
        });
    });
});
