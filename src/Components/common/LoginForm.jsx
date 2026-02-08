import axios from "axios";
import { useState } from "react"
import {Link}  from "react-router-dom"
import { useUser } from "../../context/userContext";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const LoginForm = ({onLogin})=>{
    const[form,setForm] = useState({username:"",password:"",email:""});
     const {login} = useUser();
      const navigate = useNavigate();

    const handleChange = (e)=>{
        setForm({...form,[e.target.name]:e.target.value});
    }
const handleLogin = async (e) => {
  e.preventDefault();

  try {
    const res = await axios.post(
      "https://stocksimulator-backend.onrender.com/api/user/login",
      form
    );

    const { token, userId, role, firstName, lastName, email } = res.data;

    if (!token) throw new Error("No token returned");

    const userData = {
      userId,
      role,
      firstName,
      lastName,
      email,
    };

    // Store auth data
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));

    // Update context
    login(userData);

    toast.success("Login successful");

    // ✅ NAVIGATE AFTER LOGIN
    navigate("/dashboard");

    // optional
    if (onLogin) onLogin();

  } catch (err) {
    console.error("Failed to Login", err);
    toast.warn("Failed to login");
  }
};



    return(
        <div className="login-container">
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
         <button type="submit">Login</button>
         <p className="forgot-password">
  <Link to="/forgot-password">Forgot Password?</Link>
</p>

          <p className="register-link">New User ?<Link to = "/register" >Sign Up</Link></p>
         </form>
         
        </div>
    )
}
export default LoginForm;