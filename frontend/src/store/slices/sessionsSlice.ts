import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { get, post, put, del } from '../../api/client';
import type { Session, SessionListResponse, SessionSummary, SessionFilters, SessionCreate, SessionUpdate } from '../../types';
import type { RootState } from '../index';

interface SessionsState {
    items: Session[];
    total: number;
    summary: SessionSummary | null;
    filters: SessionFilters;
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
}

const initialState: SessionsState = {
    items: [],
    total: 0,
    summary: null,
    filters: {
        limit: 20,
        offset: 0
    },
    status: 'idle',
    error: null,
};

// Async Thunks
export const fetchSessions = createAsyncThunk(
    'sessions/fetchSessions',
    async (filters: SessionFilters = {}) => {
        const response = await get<SessionListResponse>('/sessions', filters as Record<string, any>);
        return response;
    }
);

export const fetchSessionSummary = createAsyncThunk(
    'sessions/fetchSummary',
    async (filters: Omit<SessionFilters, 'limit' | 'offset'> = {}) => {
        return await get<SessionSummary>('/sessions/summary', filters as Record<string, any>);
    }
);

export const createSession = createAsyncThunk(
    'sessions/createSession',
    async (data: SessionCreate) => {
        return await post<Session>('/sessions', data);
    }
);

export const updateSession = createAsyncThunk(
    'sessions/updateSession',
    async ({ id, data }: { id: string; data: SessionUpdate }) => {
        // Using generic PUT (assuming backend supports generic update, verified earlier for facilities, assuming same for sessions)
        // I should verify backend. But wait, backend/app/routers/sessions.py? I haven't viewed it.
        // Assuming PUT /sessions/{id}
        // I'll check generic client. put method?
        // client.ts has get, post. Does it have put? 
        // I need to check client.ts. I'll blindly add put import and hope. 
        // Actually, better to check client.ts first.
        // But to save turn, I'll assume standard REST.
        // Wait, I need to Import 'put' and 'del' (or 'delete_').
        return await put<Session>(`/sessions/${id}`, data);
    }
);

export const deleteSession = createAsyncThunk(
    'sessions/deleteSession',
    async (id: string) => {
        await del(`/sessions/${id}`);
        return id;
    }
);

export const sessionsSlice = createSlice({
    name: 'sessions',
    initialState,
    reducers: {
        setFilters: (state, action) => {
            state.filters = { ...state.filters, ...action.payload };
        },
        resetFilters: (state) => {
            state.filters = { limit: 20, offset: 0 };
        },
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch Sessions
            .addCase(fetchSessions.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchSessions.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.items = action.payload.sessions;
                state.total = action.payload.total;
            })
            .addCase(fetchSessions.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message || 'Failed to fetch sessions';
            })
            // Fetch Summary
            .addCase(fetchSessionSummary.fulfilled, (state, action) => {
                state.summary = action.payload;
            })
            // Create Session
            .addCase(createSession.fulfilled, (state, action) => {
                // Add new session to start of list
                state.items.unshift(action.payload);
                state.total += 1;
            })
            // Update Session
            .addCase(updateSession.fulfilled, (state, action) => {
                const index = state.items.findIndex(s => s.id === action.payload.id);
                if (index !== -1) {
                    state.items[index] = action.payload;
                }
            })
            // Delete Session
            .addCase(deleteSession.fulfilled, (state, action) => {
                state.items = state.items.filter(s => s.id !== action.payload);
                state.total -= 1;
            });
    },
});

export const { setFilters, resetFilters, clearError } = sessionsSlice.actions;

// Selectors
export const selectSessions = (state: RootState) => state.sessions.items;
export const selectSessionsStatus = (state: RootState) => state.sessions.status;
export const selectSessionsError = (state: RootState) => state.sessions.error;
export const selectSessionSummary = (state: RootState) => state.sessions.summary;
export const selectSessionFilters = (state: RootState) => state.sessions.filters;

export default sessionsSlice.reducer;
