// context/AuthProvider.jsx   (or wherever you keep it)
import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load admin & token from localStorage when app starts
  useEffect(() => {
    try {
      const storedAdmin = localStorage.getItem("admin");
      const storedToken = localStorage.getItem("adminToken");

      if (storedAdmin && storedToken) {
        setAdmin(JSON.parse(storedAdmin));
        setToken(storedToken);
      }
    } catch (err) {
      console.error("Failed to parse stored auth data:", err);
      // Optional: clear corrupted data
      localStorage.removeItem("admin");
      localStorage.removeItem("adminToken");
    } finally {
      setLoading(false);
    }
  }, []);

  const login = (adminData, jwtToken) => {
    // adminData should contain at least: { _id, email, name?, role?, ... }
    setAdmin(adminData);
    setToken(jwtToken);

    // Save to localStorage
    localStorage.setItem("admin", JSON.stringify(adminData));
    localStorage.setItem("adminToken", jwtToken);
  };

  const logout = () => {
    setAdmin(null);
    setToken(null);
    // Clear storage
    localStorage.removeItem("admin");
    localStorage.removeItem("adminToken");
  };

  const value = {
    admin,
    token,
    loading,
    isAuthenticated: !!admin && !!token,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;