import { createContext, useState } from "react";

export const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
  // fake user state
  const [user, setUser] = useState({
    name: "Test User",
    email: "test@example.com",
  });


  const login = () => {
    setUser({
      name: "Test User",
      email: "test@example.com",
    });
  };

  const logout = () => {
    setUser(null);
  };

  const authInfo = {
    user,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={authInfo}>{children}</AuthContext.Provider>
  );
};

export default AuthProvider;
