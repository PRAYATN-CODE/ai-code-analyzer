import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { authApi } from "@/api/authApi";
import toast from "react-hot-toast";

// ─── Async thunks ──────────────────────────────────────────────────────────────
export const registerUser = createAsyncThunk("auth/register", async (data, { rejectWithValue }) => {
  try {
    const res = await authApi.register(data);
    localStorage.setItem("token", res.data.token);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.message || "Registration failed");
  }
});

export const loginUser = createAsyncThunk("auth/login", async (data, { rejectWithValue }) => {
  try {
    const res = await authApi.login(data);
    localStorage.setItem("token", res.data.token);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.message || "Login failed");
  }
});

export const fetchCurrentUser = createAsyncThunk("auth/fetchMe", async (_, { rejectWithValue }) => {
  try {
    const res = await authApi.getMe();
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

// ─── Slice ─────────────────────────────────────────────────────────────────────
const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    token: localStorage.getItem("token") || null,
    loading: false,
    initialized: false,
    error: null,
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem("token");
      toast.success("Logged out successfully");
    },
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    // Register
    builder
      .addCase(registerUser.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(registerUser.fulfilled, (s, a) => {
        s.loading = false;
        s.user = a.payload.user;
        s.token = a.payload.token;
        toast.success(`Welcome, ${a.payload.user.name}!`);
      })
      .addCase(registerUser.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
        toast.error(a.payload);
      });

    // Login
    builder
      .addCase(loginUser.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(loginUser.fulfilled, (s, a) => {
        s.loading = false;
        s.user = a.payload.user;
        s.token = a.payload.token;
        toast.success(`Welcome back, ${a.payload.user.name}!`);
      })
      .addCase(loginUser.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
        toast.error(a.payload);
      });

    // Fetch me
    builder
      .addCase(fetchCurrentUser.pending, (s) => { s.loading = true; })
      .addCase(fetchCurrentUser.fulfilled, (s, a) => {
        s.loading = false;
        s.user = a.payload;
        s.initialized = true;
      })
      .addCase(fetchCurrentUser.rejected, (s) => {
        s.loading = false;
        s.initialized = true;
        s.user = null;
        s.token = null;
        localStorage.removeItem("token");
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export const selectAuth = (s) => s.auth;
export const selectUser = (s) => s.auth.user;
export const selectIsAuthenticated = (s) => !!s.auth.token && !!s.auth.user;

export default authSlice.reducer;
