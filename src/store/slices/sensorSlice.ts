import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Sensor } from '../../types';
import apiService from '../../services/api';

interface SensorState {
  sensors: Sensor[];
  loading: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalSensors: number;
    limit: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  } | null;
  filters: {
    search: string;
    department: string;
    status: string;
    sensorType: string;
    sortBy: string;
    sortOrder: string;
  };
}

const initialState: SensorState = {
  sensors: [],
  loading: false,
  error: null,
  pagination: null,
  filters: {
    search: '',
    department: '',
    status: '',
    sensorType: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  },
};

// Async thunks
export const fetchSensors = createAsyncThunk(
  'sensors/fetchSensors',
  async () => {
    return await apiService.getSensors();
  }
);

export const fetchSensorsAdmin = createAsyncThunk(
  'sensors/fetchSensorsAdmin',
  async (params: {
    page?: number;
    limit?: number;
    search?: string;
    department?: string;
    status?: string;
    sensorType?: string;
    sortBy?: string;
    sortOrder?: string;
  }) => {
    return await apiService.getSensorsAdmin(params);
  }
);

export const fetchSensorsByMachine = createAsyncThunk(
  'sensors/fetchSensorsByMachine',
  async (machineId: string) => {
    return await apiService.getSensorsByMachine(machineId);
  }
);

export const createSensor = createAsyncThunk(
  'sensors/createSensor',
  async (sensorData: Partial<Sensor>) => {
    return await apiService.createSensor(sensorData);
  }
);

export const updateSensor = createAsyncThunk(
  'sensors/updateSensor',
  async ({ id, data }: { id: string; data: Partial<Sensor> }) => {
    return await apiService.updateSensor(id, data);
  }
);

export const deleteSensor = createAsyncThunk(
  'sensors/deleteSensor',
  async (id: string) => {
    await apiService.deleteSensor(id);
    return id;
  }
);

const sensorSlice = createSlice({
  name: 'sensors',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch sensors
      .addCase(fetchSensors.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSensors.fulfilled, (state, action) => {
        state.loading = false;
        state.sensors = action.payload;
      })
      .addCase(fetchSensors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch sensors';
      })
      // Fetch sensors admin
      .addCase(fetchSensorsAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.sensors = action.payload.sensors;
        state.pagination = action.payload.pagination;
        state.filters = action.payload.filters;
      })
      // Fetch sensors by machine
      .addCase(fetchSensorsByMachine.fulfilled, (state, action) => {
        state.sensors = action.payload;
      })
      // Create sensor
      .addCase(createSensor.fulfilled, (state, action) => {
        state.sensors.push(action.payload);
      })
      // Update sensor
      .addCase(updateSensor.fulfilled, (state, action) => {
        const index = state.sensors.findIndex(s => s._id === action.payload._id);
        if (index !== -1) {
          state.sensors[index] = action.payload;
        }
      })
      // Delete sensor
      .addCase(deleteSensor.fulfilled, (state, action) => {
        state.sensors = state.sensors.filter(s => s._id !== action.payload);
      });
  },
});

export const { clearError, setFilters } = sensorSlice.actions;
export default sensorSlice.reducer;