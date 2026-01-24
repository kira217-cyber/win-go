// context/AuthProvider.jsx
import { createContext, useState, useEffect, useCallback } from "react";
import axios from "axios";

export const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Balance related states
  const [balanceData, setBalanceData] = useState(null);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [balanceError, setBalanceError] = useState(null);

  const userId = user?._id || user?.id; // handle both _id and id cases

  // Load user & token from localStorage on mount
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
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    } finally {
      setLoading(false);
    }
  }, []);

  // ────────────────────────────────────────────────
  // Fetch balance function
  // ────────────────────────────────────────────────
  const fetchBalance = useCallback(async () => {
    if (!userId) {
      console.log("No userId available → skipping balance fetch");
      return;
    }

    setBalanceLoading(true);
    setBalanceError(null);

    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/user/balance/${userId}`,
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
            // If your backend doesn't require token → you can remove the Authorization header
          },
        },
      );

      if (res.data?.success) {
        setBalanceData(res.data.data);
        console.log("Balance fetched successfully:", res.data.data);
      } else {
        throw new Error(res.data?.message || "Failed to get balance");
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || err.message || "Unknown error";
      setBalanceError(errorMsg);
      console.error("Balance fetch failed:", errorMsg);
    } finally {
      setBalanceLoading(false);
    }
  }, [userId, token]);

  // Automatically fetch balance when userId appears (after login)
  useEffect(() => {
    if (userId) {
      fetchBalance();
    }
  }, [userId, fetchBalance]);

  // ────────────────────────────────────────────────
  // Refresh balance – can be called from any component
  // ────────────────────────────────────────────────
  const refreshBalance = () => {
    console.log("Manually refreshing balance...");
    fetchBalance();
  };

  // Login function
  const login = (userData, jwtToken) => {
    setUser(userData);
    setToken(jwtToken);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", jwtToken);
    // Balance will auto-fetch via the useEffect above
  };

  // Logout
  const logout = () => {
    setUser(null);
    setToken(null);
    setBalanceData(null);
    setBalanceError(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  const authInfo = {
    user,
    userId,
    token,
    loading,
    isAuthenticated: !!user && !!token,
    balanceData, 
    balanceLoading,
    balanceError,
    refreshBalance,

    login,
    logout,
  };

  return (
    <AuthContext.Provider value={authInfo}>{children}</AuthContext.Provider>
  );
};

export default AuthProvider;
