import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ProductionTimelineDay, MachineStats } from '../../types';
import apiService from '../../services/api';

interface AnalyticsState {
  productionTimeline: ProductionTimelineDay[];
  factoryStats: {
    totalUnits: number;
    avgOEE: number;
    unclassifiedStoppages: number;
    activeMachines: number;
  };
  loading: boolean;
  error: string | null;
}

const initialState: AnalyticsState = {
  productionTimeline: [],
  factoryStats: {
    totalUnits: 0,
    avgOEE: 0,
    unclassifiedStoppages: 0,
    activeMachines: 0,
  },
  loading: false,
  error: null,
};

// Async thunks
export const fetchProductionTimeline = createAsyncThunk(
  'analytics/fetchProductionTimeline',
  async ({ 
    machineId, 
    params 
  }: { 
    machineId: string; 
    params?: { 
      timeframe?: string;
      startDate?: string;
      endDate?: string;
    } 
  }) => {
    return await apiService.getProductionTimeline(machineId, params);
  }
);

export const fetchFactoryStats = createAsyncThunk(
  'analytics/fetchFactoryStats',
  async () => {
    return await apiService.getFactoryStats();
  }
);

export const addStoppageRecord = createAsyncThunk(
  'analytics/addStoppageRecord',
  async (stoppageData: any) => {
    return await apiService.addStoppageRecord(stoppageData);
  }
);

export const updateProductionAssignment = createAsyncThunk(
  'analytics/updateProductionAssignment',
  async (assignmentData: any) => {
    return await apiService.updateProductionAssignment(assignmentData);
  }
);

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    updateFactoryStatsLocal: (state, action) => {
      state.factoryStats = { ...state.factoryStats, ...action.payload };
    },
    updateProductionTimelineLocal: (state, action) => {
      const { machineId, hour, date, data } = action.payload;
      const dayIndex = state.productionTimeline.findIndex(day => day.date === date);
      if (dayIndex !== -1) {
        const hourIndex = state.productionTimeline[dayIndex].hours.findIndex(h => h.hour === hour);
        if (hourIndex !== -1) {
          state.productionTimeline[dayIndex].hours[hourIndex] = {
            ...state.productionTimeline[dayIndex].hours[hourIndex],
            ...data
          };
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch production timeline
      .addCase(fetchProductionTimeline.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductionTimeline.fulfilled, (state, action) => {
        state.loading = false;
        state.productionTimeline = action.payload.timeline;
      })
      .addCase(fetchProductionTimeline.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch production timeline';
      })
      // Fetch factory stats
      .addCase(fetchFactoryStats.fulfilled, (state, action) => {
        state.factoryStats = action.payload;
      })
      // Add stoppage record
      .addCase(addStoppageRecord.fulfilled, (state) => {
        // Refresh timeline after adding stoppage
        state.error = null;
      })
      // Update production assignment
      .addCase(updateProductionAssignment.fulfilled, (state) => {
        // Refresh timeline after updating assignment
        state.error = null;
      });
  },
});

export const { 
  clearError, 
  updateFactoryStatsLocal, 
  updateProductionTimelineLocal 
} = analyticsSlice.actions;
export default analyticsSlice.reducer;