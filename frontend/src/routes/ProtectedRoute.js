import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

// This protects pages that should only open after login.
export default function ProtectedRoute({ children }) {
  // This reads the current logged-in user from global auth state.
  const { user } = useContext(AuthContext);

  // This sends visitors back to login when they are not logged in.
  if (!user) return <Navigate to="/login" />;

  // This shows the protected page when the user is logged in.
  return children;
}
