// routes/PrivateRoute.jsx
import React from "react";
import { Navigate, useLocation } from "react-router";
import useAuth from "../hook/useAuth";

const PrivateRoute = ({ children }) => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  // Show loading UI while checking auth from localStorage
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-950 via-red-950 to-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-orange-200 text-lg font-medium">
            যাচাই করা হচ্ছে...
          </p>
        </div>
      </div>
    );
  }

  // If not authenticated → redirect to login with original location
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Optional: Add role-based protection (uncomment if you have roles)
  // if (admin.role !== 'user' && admin.role !== 'admin') {
  //   return <Navigate to="/unauthorized" replace />;
  // }

  // If authenticated → render the protected content (children)
  return children;
};

export default PrivateRoute;
