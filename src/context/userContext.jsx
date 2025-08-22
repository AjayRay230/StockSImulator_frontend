import { createContext, useContext, useState, useEffect } from "react";
import { toast } from "react-toastify";

// Create context
export const UserContext = createContext();

// Provider
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (token && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);

        // Basic validation
        if (parsedUser?.userId && parsedUser?.email && parsedUser?.role) {
          setUser(parsedUser);
          setRole(parsedUser.role);
          setIsLoggedIn(true);
        } else {
          throw new Error("Invalid user data");
        }
      } catch (err) {
        toast.error("Failed to load user info.");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
  }, []);

  const login = (responseData) => {
    const { token, userId, role, firstName, lastName, email } = responseData;

    if (!token || !email || !role||!userId) {
      toast.error("Invalid login response from server.");
      return;
    }

    const userData = { userId, role, firstName, lastName, email };

    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));

    setUser(userData);
    setRole(role);
    setIsLoggedIn(true);
    toast.success("Login successful");
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setIsLoggedIn(false);
    setRole(null);
    toast.info("Logged out");
  };

  return (
    <UserContext.Provider value={{ isLoggedIn, role, user, setUser, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};

// Hook for consuming
export const useUser = () => useContext(UserContext);
