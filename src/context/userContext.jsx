import { createContext, useContext, useState, useEffect } from "react";
import { toast } from "react-toastify";
import { jwtDecode } from "jwt-decode";

// Create context
export const UserContext = createContext();

// Provider
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authReady, setAuthReady] = useState(false);

useEffect(() => {
  const token = localStorage.getItem("token");
  const storedUser = localStorage.getItem("user");

  if (token && storedUser) {
    try {
      const parsedUser = JSON.parse(storedUser);

      if (parsedUser?.role && parsedUser?.firstName && parsedUser?.username) {
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

  // IMPORTANT
  setAuthReady(true);

}, []);


const login = (responseData) => {
  const { token, role, firstName, lastName  } = responseData;

  if (!token || !role) {
    toast.error("Invalid login response from server.");
    return;
  }

  const decoded = jwtDecode(token);
  const expiryTime = decoded.exp * 1000;

  // 🔥 EXTRACT USERNAME FROM JWT
  const username = decoded.sub; // subject = username

  const userData = {
    username,        // ✅ ADD THIS
    role,
    firstName,
    lastName
  };

  localStorage.setItem("token", token);
  localStorage.setItem("tokenExpiry", expiryTime);
  localStorage.setItem("user", JSON.stringify(userData));

  setUser(userData);
  setRole(role);
  setIsLoggedIn(true);

  toast.success("Login successful");
};
useEffect(() => {
  if (!isLoggedIn) return;

  const expiry = localStorage.getItem("tokenExpiry");
  if (!expiry) return;

  const timeLeft = expiry - Date.now();

  if (timeLeft <= 0) {
    forceLogout();
    return;
  }

  const timer = setTimeout(forceLogout, timeLeft);

  return () => clearTimeout(timer);

}, [isLoggedIn]);


const forceLogout = () => {
  logout("expired");
  window.location.href = "/login?reason=expired";
};

const logout = (reason = "manual") => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("tokenExpiry");

  setUser(null);
  setIsLoggedIn(false);
  setRole(null);

  if (reason === "manual") {
    toast.info("Logged out");
  }
};


  return (
   <UserContext.Provider value={{ isLoggedIn, role, user, setUser, login, logout, authReady }}>

      {children}
    </UserContext.Provider>
  );
};

// Hook for consuming
export const useUser = () => useContext(UserContext);
