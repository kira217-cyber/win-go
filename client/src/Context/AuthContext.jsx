// context/AuthProvider.jsx   (recommended file name)
import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true); // important for protected routes
  console.log(user?.id)
  const userId = user?.id

  // Load user & token from localStorage when app starts
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      const storedToken = localStorage.getItem("token");

      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
      if (storedToken) {
        setToken(storedToken);
      }
    } catch (err) {
      console.error("Failed to load auth from localStorage:", err);
      // Clean corrupted data
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    } finally {
      setLoading(false);
    }
  }, []);

  // Login function – now accepts real data from API
  const login = (userData, jwtToken) => {
    // userData example: { name, email, phone, _id, role, ... }
    setUser(userData);
    setToken(jwtToken);

    // Save to localStorage
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", jwtToken);
  };

  // Logout function
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  // Context value – everything components need
  const authInfo = {
    user,
    userId,
    token, // useful for API calls
    loading, // show spinner while checking auth
    isAuthenticated: !!user && !!token,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={authInfo}>{children}</AuthContext.Provider>
  );
};

export default AuthProvider;
