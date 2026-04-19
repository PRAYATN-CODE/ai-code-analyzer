import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import analysisReducer from "./slices/analysisSlice";
import themeReducer from "./slices/themeSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    analysis: analysisReducer,
    theme: themeReducer,
  },
  middleware: (getDefault) =>
    getDefault({ serializableCheck: { ignoredPaths: ["analysis.currentReport"] } }),
});
