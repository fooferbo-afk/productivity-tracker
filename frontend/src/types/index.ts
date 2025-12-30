/**
 * TypeScript interfaces for the application.
 * These match the backend Pydantic schemas.
 */

// ============================================
// Auth / Therapist Types
// ============================================

export interface Therapist {
    id: string;
    email: string;
    name: string;
    role: 'therapist' | 'manager';
    created_at: string;
    updated_at: string;
}

export interface TherapistUpdate {
    name?: string;
}

// ============================================
// Facility Types
// ============================================

export interface Facility {
    id: string;
    therapist_id: string;
    name: string;
    location: string | null;
    is_archived: boolean;
    created_at: string;
    updated_at: string;
}

export interface FacilityCreate {
    name: string;
    location?: string;
}

export interface FacilityUpdate {
    name?: string;
    location?: string;
}

export interface FacilityListResponse {
    facilities: Facility[];
    total: number;
    include_archived: boolean;
}

// ============================================
// Session Types
// ============================================

export interface Session {
    id: string;
    therapist_id: string;
    facility_id: string;
    facility_name: string | null;
    session_date: string; // ISO date string (YYYY-MM-DD)
    start_time: string;   // Time string (HH:MM:SS)
    end_time: string;     // Time string (HH:MM:SS)
    productivity_percentage: number;
    notes: string | null;
    duration_minutes: number;
    created_at: string;
    updated_at: string;
}

export interface SessionCreate {
    facility_id: string;
    session_date: string;
    start_time: string;
    end_time: string;
    productivity_percentage: number;
    notes?: string;
}

export interface SessionUpdate {
    facility_id?: string;
    session_date?: string;
    start_time?: string;
    end_time?: string;
    productivity_percentage?: number;
    notes?: string;
}

export interface SessionListResponse {
    sessions: Session[];
    total: number;
}

export interface SessionSummary {
    total_sessions: number;
    total_hours: number;
    average_hours: number;
    average_productivity: number;
    date_range_start: string | null;
    date_range_end: string | null;
    facility_id: string | null;
}

// ============================================
// Calculator Types
// ============================================

export interface CalculatorInputs {
    clockInTime: string;          // Time string (HH:MM)
    productivityPercentage: number;
    sessionDurationMinutes: number;
    totalSessionsExpected: number;
}

export interface CalculatorResult {
    clockOutTime: string;         // Time string (HH:MM)
    crossesMidnight: boolean;
    totalWorkMinutes: number;
}

// ============================================
// API Error Types
// ============================================

export interface APIError {
    detail: string;
    status: number;
}

// ============================================
// Auth State Types
// ============================================

export type AuthStatus = 'unknown' | 'loading' | 'authenticated' | 'unauthenticated';

export interface AuthState {
    status: AuthStatus;
    user: Therapist | null;
    firebaseUid: string | null;
    token: string | null;
    error: string | null;
}

// ============================================
// Filter Types
// ============================================

export interface SessionFilters {
    facility_id?: string;
    date_from?: string;
    date_to?: string;
    limit?: number;
    offset?: number;
}
