import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiService from '../../services/api';

interface Report {
  _id: string;
  type: 'daily' | 'weekly' | 'monthly' | 'yearly';
  period: {
    start: string;
    end: string;
  };
  departmentId?: any;
  machineId?: any;
  metrics: {
    oee: number;
    mttr: number;
    mtbf: number;
    availability: number;
    quality: number;
    performance: number;
    totalUnitsProduced: number;
    totalDefectiveUnits: number;
    totalRunningMinutes: number;
    totalStoppageMinutes: number;
    totalStoppages: number;
  };
  shiftData: Array<{
    shiftName: string;
    startTime: string;
    endTime: string;
    metrics: {
      oee: number;
      unitsProduced: number;
      defectiveUnits: number;
      runningMinutes: number;
      stoppageMinutes: number;
    };
  }>;
  generatedBy: {
    username: string;
  };
  emailSent: boolean;
  emailSentAt?: string;
  createdAt: string;
}

interface ReportState {
  reports: Report[];
  loading: boolean;
  generating: boolean;
  error: string | null;
}

const initialState: ReportState = {
  reports: [],
  loading: false,
  generating: false,
  error: null,
};

// Async thunks
export const fetchReports = createAsyncThunk(
  'reports/fetchReports',
  async (filters?: any) => {
    return await apiService.getReports(filters);
  }
);

export const generateReport = createAsyncThunk(
  'reports/generateReport',
  async (reportData: any) => {
    return await apiService.generateReport(reportData);
  }
);

export const emailReport = createAsyncThunk(
  'reports/emailReport',
  async (reportId: string) => {
    await apiService.emailReport(reportId);
    return reportId;
  }
);

export const downloadReportPDF = createAsyncThunk(
  'reports/downloadReportPDF',
  async ({ reportId, reportType, startDate }: { 
    reportId: string; 
    reportType: string; 
    startDate: string 
  }) => {
    await apiService.downloadReportPDF(reportId, reportType, startDate);
    return reportId;
  }
);

const reportSlice = createSlice({
  name: 'reports',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch reports
      .addCase(fetchReports.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReports.fulfilled, (state, action) => {
        state.loading = false;
        state.reports = action.payload;
      })
      .addCase(fetchReports.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch reports';
      })
      // Generate report
      .addCase(generateReport.pending, (state) => {
        state.generating = true;
        state.error = null;
      })
      .addCase(generateReport.fulfilled, (state, action) => {
        state.generating = false;
        state.reports.unshift(action.payload);
      })
      .addCase(generateReport.rejected, (state, action) => {
        state.generating = false;
        state.error = action.error.message || 'Failed to generate report';
      })
      // Email report
      .addCase(emailReport.fulfilled, (state, action) => {
        const report = state.reports.find(r => r._id === action.payload);
        if (report) {
          report.emailSent = true;
          report.emailSentAt = new Date().toISOString();
        }
      });
  },
});

export const { clearError } = reportSlice.actions;
export default reportSlice.reducer;