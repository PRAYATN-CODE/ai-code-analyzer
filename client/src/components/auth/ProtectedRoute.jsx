import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";
import { selectIsAuthenticated, selectAuth } from "@/store/slices/authSlice";
import LoadingScreen from "@/components/ui/LoadingScreen";

export default function ProtectedRoute({ children }) {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const { token, initialized } = useSelector(selectAuth);
  const location = useLocation();

  if (token && !initialized) return <LoadingScreen />;

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
