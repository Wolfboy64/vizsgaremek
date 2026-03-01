import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <p>Betöltés...</p>
      </div>
    );
  }

  if (!isAuthenticated()) {
    return <Navigate to="/ugyfelportal/login" replace />;
  }

  if (adminOnly && !isAdmin()) {
    return <Navigate to="/ugyfelportal/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
