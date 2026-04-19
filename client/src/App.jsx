import { fetchCurrentUser, selectAuth } from "@/store/slices/authSlice";
import { AnimatePresence } from "framer-motion";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, Route, Routes } from "react-router-dom";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AppLayout from "@/components/layout/AppLayout";
import LoadingScreen from "@/components/ui/LoadingScreen";

import AnalyzePage from "@/pages/AnalyzePage";
import DashboardPage from "@/pages/DashboardPage";
import LandingPage from "@/pages/LandingPage";
import LoginPage from "@/pages/LoginPage";
import NotFoundPage from "@/pages/NotFoundPage";
import RegisterPage from "@/pages/RegisterPage";
import ReportPage from "@/pages/ReportPage";
import RepositoriesPage from "@/pages/RepositoriesPage";
import RepositoryDetailPage from "./pages/Repositorydetailpage ";

export default function App() {
  const dispatch = useDispatch();
  const { token, initialized } = useSelector(selectAuth);

  useEffect(() => {
    if (token && !initialized) {
      dispatch(fetchCurrentUser());
    }
  }, [token, initialized, dispatch]);

  // Show loading screen while verifying token on first load
  if (token && !initialized) return <LoadingScreen />;

  return (
    <AnimatePresence mode="wait">
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected routes — wrapped in AppLayout (sidebar + navbar) */}
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/analyze" element={<AnalyzePage />} />
          <Route path="/report/:jobId" element={<ReportPage />} />
          <Route path="/repositories" element={<RepositoriesPage />} />
          <Route path="/repositories/:id" element={<RepositoryDetailPage />} />
        </Route>

        {/* Redirects */}
        <Route path="/app" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AnimatePresence>
  );
}
