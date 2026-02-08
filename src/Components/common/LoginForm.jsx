import axios from "axios";
import { useState } from "react"
import {Link, redirect,useLocation}  from "react-router-dom"
import { useUser } from "../../context/userContext";
import { jwtDecode } from "jwt-decode";
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

  if (isSubmitting) return; // prevent double click

  try {
    setIsSubmitting(true);

    const res = await axios.post(
      "https://stocksimulator-backend.onrender.com/api/user/login",
      form
    );

    const { token, userId, role, firstName, lastName, email } = res.data;

    if (!token) throw new Error("No token returned");

    const userData = { userId, role, firstName, lastName, email };

    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));

    login(res.data);

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



    return(
        <div className="login-container">
return (
  <div className="login-container">

    {/* ✅ STATUS BANNER — EXACT PLACE */}
    {reason && (
      <div className={`auth-banner ${reason}`}>
        {reason === "expired" && (
          <>⏳ Session expired. Please login again.</>
        )}
        {reason === "manual" && (
          <>✅ You have logged out successfully.</>
        )}
      </div>
    )}

    <form onSubmit={handleLogin} className="loginForm">
      ...
    </form>

  </div>
);


        <form onSubmit={handleLogin} className="loginForm">
        <input onChange={handleChange} placeholder="Enter UserName"
         value = {form.username}
          name = "username"
          type = "text"
          required
         />
         <input onChange={handleChange} placeholder="Enter Email Id"
            value ={form.email}
            name  = "email"
            type = "email" required />
         <input onChange={handleChange} placeholder="Enter Password" name = "password" type = "password"  value = {form.password} required/>
         <button type="submit" disabled={isSubmitting}>
  {isSubmitting ? "Logging in..." : "Login"}
</button>
{isSubmitting && (
  <p className="login-wait-message">
    ⏳ Authenticating... Did you know?  
    <br />
    📈 The first stock exchange was established in Amsterdam in 1602.
  </p>
)}

         <p className="forgot-password">
  <Link to="/forgot-password">Forgot Password?</Link>
</p>

          <p className="register-link">New User ?<Link to = "/register" >Sign Up</Link></p>
         </form>
         
        </div>
    )
}
export default LoginForm;