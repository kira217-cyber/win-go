// routes/PrivateRoute.jsx
import React from "react";
import { Navigate, useLocation } from "react-router";
import useAuth from "../hook/useAuth"; // adjust path if needed

const PrivateRoute = ({ children }) => {
  const { admin, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  // Show loading state while checking auth (prevents flash of content)
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-950 via-red-950 to-black">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-orange-200 text-lg font-medium">
            যাচাই করা হচ্ছে...
          </p>
        </div>
      </div>
    );
  }

  // If not authenticated → redirect to login
  if (!isAuthenticated || !admin) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Optional: Role-based protection (uncomment if you add role to admin)
  // if (admin.role !== 'admin') {
  //   return <Navigate to="/unauthorized" replace />;
  // }

  // If authenticated → show the protected content
  return children;
};

export default PrivateRoute;
