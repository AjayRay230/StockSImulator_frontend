import { useState } from "react"
import axios from "axios";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { useUser } from "../../context/userContext";
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
    const handleSubmit = async(e)=>{
        e.preventDefault();
        if(!form.acceptTerms)
        {
            alert("Please accepts the terms and conditions ");
            return;
        }
        if(form.password!==form.confirmPassword)
        {
            toast.warn("password do not matched  please enter the same password");
            return;
        } 
        const payload = {
            firstName:form.firstName,
            lastName:form.lastName,
            password:form.password,
            email:form.email,
            role:"USER",
            username:form.username

        }
        try{
            
          const res =    await axios.post(`https://stocksimulator-backend.onrender.com/api/user/register`,payload
                
            );
            login(res.data);
            OnRegister?.();
            setForm({username:"",password:"",firstName:"",lastName:"",role:"USER",email:"",confirmPassword:"",acceptTerms:false});
            toast.success("registration has been successful");
        }
       catch (err) {
                    if (err.response?.status === 409) {
                    toast.warn("Username or email already exists. Please use a different one.");
             } else {
                     console.error("Registration failed", err);
                    toast.warn("Registration failed. Please try again.");
  }
}


    }
    const handleCheckBoxChange = (e)=>{
    setForm({...form,[e.target.name]:e.target.checked})
}
    return(
         <div className="adduser-container">
        <form onSubmit={handleSubmit} className="adduser-form">
            <input type = "text" onChange={handleChange} value ={form.username} name = "username" placeholder="User Name"/>
            <input type="text" onChange={handleChange} value={form.firstName} name = "firstName" placeholder="Enter your first Name"/>
            <input type = "text" onChange={handleChange} value  = {form.lastName} name  = "lastName" placeholder="Enter your last Name"/>
            <input type = "email" onChange={handleChange} value = {form.email} name = "email" placeholder="Enter your Email Id"/>
            <input type ="password" onChange={handleChange} value={form.password} name = "password" placeholder="Enter your password"/>
            <input type = "password" onChange={handleChange} value = {form.confirmPassword} name = "confirmPassword" placeholder="Confirm Password"/>
            {/* <select onChange={handleChange} value = {form.role} name = "role" placeholder="Enter role">
                <option value = "USER" >USER</option>
                <option value = "ADMIN">ADMIN</option>
            </select> */}
            <label className="termsCondition-label">
                <input type = "checkbox" 
                name = "acceptTerms"
               checked= {form.acceptTerms}
               onChange={handleCheckBoxChange}/>
                I  accept all terms & conditions
                
            </label>
            <button type = "submit" >Register</button>
            <p className="login-link" >Already Have an account ?<Link to = "/login">Login</Link></p>
        </form>
    </div>
    )
}
export default RegistrationForm;