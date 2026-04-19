import { analysisApi } from "@/api/analysisApi";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import toast from "react-hot-toast";

export const submitGithubAnalysis = createAsyncThunk(
  "analysis/submitGithub",
  async (data, { rejectWithValue }) => {
    try {
      const res = await analysisApi.submitGithub(data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const submitSnippetAnalysis = createAsyncThunk(
  "analysis/submitSnippet",
  async (data, { rejectWithValue }) => {
    try {
      const res = await analysisApi.submitSnippet(data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchReport = createAsyncThunk(
  "analysis/fetchReport",
  async (jobId, { rejectWithValue }) => {
    try {
      const res = await analysisApi.getReport(jobId);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchHistory = createAsyncThunk(
  "analysis/fetchHistory",
  async (params, { rejectWithValue }) => {
    try {
      const res = await analysisApi.getHistory(params);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const deleteReport = createAsyncThunk(
  "analysis/deleteReport",
  async (jobId, { rejectWithValue }) => {
    try {
      await analysisApi.deleteReport(jobId);
      toast.success("Report deleted");
      return jobId;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const analysisSlice = createSlice({
  name: "analysis",
  initialState: {
    // Current active job
    currentJobId: null,
    currentReport: null,
    jobStatus: null, // pending | processing | completed | failed

    // History list
    history: [],
    pagination: null,

    // UI states
    submitting: false,
    loadingReport: false,
    loadingHistory: false,

    // Filters (applied client-side on report)
    activeFilters: {
      severity: [],
      category: [],
    },

    error: null,
  },
  reducers: {
    setJobId: (s, a) => { s.currentJobId = a.payload; },
    setJobStatus: (s, a) => { s.jobStatus = a.payload; },
    clearCurrentJob: (s) => {
      s.currentJobId = null;
      s.currentReport = null;
      s.jobStatus = null;
    },
    setFilter: (s, a) => {
      const { type, value } = a.payload;
      const current = s.activeFilters[type];
      s.activeFilters[type] = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
    },
    clearFilters: (s) => {
      s.activeFilters = { severity: [], category: [] };
    },
  },
  extraReducers: (builder) => {
    // Submit GitHub
    builder
      .addCase(submitGithubAnalysis.pending, (s) => { s.submitting = true; s.error = null; })
      .addCase(submitGithubAnalysis.fulfilled, (s, a) => {
        s.submitting = false;
        s.currentJobId = a.payload.jobId;
        s.jobStatus = "processing";
        toast.success("Analysis started! We'll process it in the background.");
      })
      .addCase(submitGithubAnalysis.rejected, (s, a) => {
        s.submitting = false;
        s.error = a.payload;
        toast.error(a.payload || "Analysis failed to start");
      });

    // Submit Snippet
    builder
      .addCase(submitSnippetAnalysis.pending, (s) => { s.submitting = true; s.error = null; })
      .addCase(submitSnippetAnalysis.fulfilled, (s, a) => {
        s.submitting = false;
        s.currentJobId = a.payload.jobId;
        s.currentReport = a.payload.data;
        s.jobStatus = "completed";
      })
      .addCase(submitSnippetAnalysis.rejected, (s, a) => {
        s.submitting = false;
        s.error = a.payload;
        toast.error(a.payload || "Snippet analysis failed");
      });

    // Fetch report
    builder
      .addCase(fetchReport.pending, (s) => { s.loadingReport = true; })
      .addCase(fetchReport.fulfilled, (s, a) => {
        s.loadingReport = false;
        s.currentReport = a.payload;
        s.jobStatus = a.payload?.status;
      })
      .addCase(fetchReport.rejected, (s, a) => {
        s.loadingReport = false;
        s.error = a.payload;
      });

    // History
    builder
      .addCase(fetchHistory.pending, (s) => { s.loadingHistory = true; })
      .addCase(fetchHistory.fulfilled, (s, a) => {
        s.loadingHistory = false;
        s.history = a.payload.data;
        s.pagination = a.payload.pagination;
      })
      .addCase(fetchHistory.rejected, (s, a) => {
        s.loadingHistory = false;
        s.error = a.payload;
      });

    // Delete report
    builder.addCase(deleteReport.fulfilled, (s, a) => {
      s.history = s.history.filter((r) => r.jobId !== a.payload);
    });
  },
});

export const { setJobId, setJobStatus, clearCurrentJob, setFilter, clearFilters } = analysisSlice.actions;

export const selectCurrentReport = (s) => s.analysis.currentReport;
export const selectCurrentJobId = (s) => s.analysis.currentJobId;
export const selectJobStatus = (s) => s.analysis.jobStatus;
export const selectHistory = (s) => s.analysis.history;
export const selectActiveFilters = (s) => s.analysis.activeFilters;
export const selectSubmitting = (s) => s.analysis.submitting;
export const selectLoadingReport = (s) => s.analysis.loadingReport;
export const selectLoadingHistory = (s) => s.analysis.loadingHistory;

export default analysisSlice.reducer;