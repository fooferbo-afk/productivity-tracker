import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { get, post, put, type ApiError } from '../../api/client';
import type { Facility, FacilityCreate, FacilityUpdate, FacilityListResponse } from '../../types';
import type { RootState } from '../index';

interface FacilitiesState {
    items: Facility[];
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
}

const initialState: FacilitiesState = {
    items: [],
    status: 'idle',
    error: null,
};

export const fetchFacilities = createAsyncThunk(
    'facilities/fetchFacilities',
    async (includeArchived: boolean = false) => {
        const response = await get<FacilityListResponse>('/facilities', {
            include_archived: includeArchived
        });
        return response.facilities;
    }
);

export const createFacility = createAsyncThunk(
    'facilities/createFacility',
    async (data: FacilityCreate) => {
        return await post<Facility>('/facilities', data);
    }
);

export const updateFacility = createAsyncThunk(
    'facilities/updateFacility',
    async ({ id, data }: { id: string; data: FacilityUpdate }) => {
        return await put<Facility>(`/facilities/${id}`, data);
    }
);

export const facilitiesSlice = createSlice({
    name: 'facilities',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch
            .addCase(fetchFacilities.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchFacilities.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.items = action.payload;
            })
            .addCase(fetchFacilities.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message || 'Failed to fetch facilities';
            })
            // Create
            .addCase(createFacility.fulfilled, (state, action) => {
                state.items.push(action.payload);
            })
            // Update
            .addCase(updateFacility.fulfilled, (state, action) => {
                const index = state.items.findIndex(f => f.id === action.payload.id);
                if (index !== -1) {
                    state.items[index] = action.payload;
                }
            });
    },
});

export const { clearError } = facilitiesSlice.actions;

export const selectFacilities = (state: RootState) => state.facilities.items;
export const selectFacilitiesStatus = (state: RootState) => state.facilities.status;
export const selectFacilitiesError = (state: RootState) => state.facilities.error;
export const selectActiveFacilities = (state: RootState) =>
    state.facilities.items.filter(f => !f.is_archived);

export default facilitiesSlice.reducer;
