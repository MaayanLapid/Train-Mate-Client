import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ role }) {
  const { auth } = useAuth();

  // Not logged in → go to login page
  if (!auth) return <Navigate to="/login" replace />;

  // If role is specified and doesn't match → redirect home (or 403 page)
  if (role && auth.role !== role) return <Navigate to="/" replace />;

  // Authorized → render nested routes
  return <Outlet />;
}
