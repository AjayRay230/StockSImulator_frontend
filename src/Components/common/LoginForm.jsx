
import { useState } from "react"
import {Link,useLocation}  from "react-router-dom"
import { useUser } from "../../context/userContext";
import apiClient from "../../api/apiClient";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const LoginForm = ({onLogin})=>{
    const[form,setForm] = useState({username:"",password:"",email:""});
     const {login} = useUser();
      const navigate = useNavigate();
      const [isSubmitting, setIsSubmitting] = useState(false);
const location = useLocation();
const reason =
  location.state?.reason ||
  new URLSearchParams(location.search).get("reason");
    const handleChange = (e)=>{
        setForm({...form,[e.target.name]:e.target.value});
    }
const handleLogin = async (e) => {
  e.preventDefault();

  if (isSubmitting) return;

  try {
    setIsSubmitting(true);

    const res = await apiClient.post("/api/user/login", form);

    if (!res.data?.token) {
      throw new Error("No token returned");
    }

    login(res.data); // single source of truth
    toast.success("Login successful");

    navigate("/dashboard", { replace: true });

    if (onLogin) onLogin();

  } catch (err) {
    console.error("Failed to Login", err);
    toast.warn("Failed to login");
  } finally {
    setIsSubmitting(false);
  }
};



return (
  <div className="auth-login-page">
    <div className="auth-login-card">

      {/* STATUS BANNER */}
      {reason && (
        <div className={`auth-login-banner auth-login-banner--${reason}`}>
          {reason === "manual" && "✅ You have logged out successfully"}
          {reason === "expired" && "⏳ Session expired. Please login again"}
        </div>
      )}

      <form onSubmit={handleLogin} className="auth-login-form">

        <input
          name="username"
          type="text"
          placeholder="Username"
          value={form.username}
          onChange={handleChange}
          required
        />

        <input
          name="email"
          type="email"
          placeholder="Email address"
          value={form.email}
          onChange={handleChange}
          required
        />

        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
        />

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Logging in..." : "Login"}
        </button>

        {isSubmitting && (
          <p className="auth-login-hint">
            ⏳ Authenticating securely…
          </p>
        )}

        <div className="auth-login-links">
          <Link to="/forgot-password">Forgot password?</Link>
          <span>
            New user? <Link to="/register">Sign up</Link>
          </span>
        </div>

      </form>
    </div>
  </div>
);
}
export default LoginForm; 