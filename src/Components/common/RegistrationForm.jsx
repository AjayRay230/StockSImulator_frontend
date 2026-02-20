import { useState } from "react"
import axios from "axios";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { useUser } from "../../context/userContext";
import apiClient from "../../api/apiClient";
const RegistrationForm = ({OnRegister})=>{
    const[form,setForm] = useState({
        username:"",
        password:"",
        firstName:"",
        lastName:"",
        confirmPassword :"",
        acceptTerms:false,
        role:"USER",
        email:"",

    });
  const {login} = useUser();
    const handleChange = (e)=>{
        const{name,value} = e.target;
        setForm({...form,[name]:value});
    }
const handleSubmit = async (e) => {
  e.preventDefault();

  if (!form.acceptTerms) {
    alert("Please accept the terms and conditions");
    return;
  }

  if (form.password !== form.confirmPassword) {
    toast.warn("Passwords do not match. Please enter the same password.");
    return;
  }

  const payload = {
    firstName: form.firstName,
    lastName: form.lastName,
    password: form.password,
    email: form.email,
    role: "USER",
    username: form.username,
  };

  try {
    const res = await apiClient.post("/api/user/register", payload);

    login(res.data);
    OnRegister?.();

    setForm({
      username: "",
      password: "",
      firstName: "",
      lastName: "",
      role: "USER",
      email: "",
      confirmPassword: "",
      acceptTerms: false,
    });

    toast.success("Registration has been successful");

  } catch (err) {
    if (err.response?.status === 409) {
      toast.warn("Username or email already exists. Please use a different one.");
    } else {
      console.error("Registration failed", err);
      toast.warn("Registration failed. Please try again.");
    }
  }
};
    const handleCheckBoxChange = (e)=>{
    setForm({...form,[e.target.name]:e.target.checked})
}
   return (
  <div className="auth-register-page">
    <div className="auth-register-card">

      <h2 className="auth-register-title">Create your account</h2>
      <p className="auth-register-subtitle">
        Start your stock trading journey today
      </p>

      <form onSubmit={handleSubmit} className="auth-register-form">

        <input
          type="text"
          name="username"
          placeholder="Username"
          value={form.username}
          onChange={handleChange}
          required
        />

        <div className="auth-register-row">
          <input
            type="text"
            name="firstName"
            placeholder="First name"
            value={form.firstName}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="lastName"
            placeholder="Last name"
            value={form.lastName}
            onChange={handleChange}
            required
          />
        </div>

        <input
          type="email"
          name="email"
          placeholder="Email address"
          value={form.email}
          onChange={handleChange}
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
        />

        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm password"
          value={form.confirmPassword}
          onChange={handleChange}
          required
        />

<div className="auth-register-terms">
  <label className="auth-register-terms-label">
    <input
      type="checkbox"
      name="acceptTerms"
      checked={form.acceptTerms}
      onChange={handleCheckBoxChange}
    />
    <span>I accept the terms & conditions</span>
  </label>
</div>


        <button type="submit" className="auth-register-btn">
          Register
        </button>

        <p className="auth-register-footer">
          Already have an account? <Link to="/login">Login</Link>
        </p>

      </form>
    </div>
  </div>
);

}
export default RegistrationForm;