import { Navigate } from "react-router-dom";
import { useUser } from "../../context/userContext";

const ProtectedRoute = ({ children }) => {
  const { isLoggedIn, authReady } = useUser();

  if (!authReady) return null; // or loader

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
