import { useState } from "react";
// import AddUser from "../api/userAxios";
import axios from "axios";
const AddUserForm = ({onAdd})=>{
    const[form,setForm] = useState({
        firstName:"",
        lastName:"",
        username:"",
        password:"",
        email:"",
        role:"USER"
    });
    const handleChange =(e)=>{
      const{name,value} = e.target;
      setForm((prev)=>({...prev,[name]:value}));
    }
    const handleSubmit = async(e)=>{
        e.preventDefault();
        try{
            const token = localStorage.getItem("token");
            await axios.post(`https://stocksimulator-backend.onrender.com/api/user/add`,form,{
                headers:{
                    Authorization:`Bearer ${token}`,
                }
            });
            alert("user registered successfully");
            onAdd?.();
            setForm({
                    firstName:"",
                    lastName:"",
                    username:"",
                    password:"",
                    email:"",
                    role:"USER"
                    });

        }
        catch(err)
        {
            console.log("Error while submitting the form",err);
            alert(err.response?.data||"Registration failed");
        }
    }
    if (!token) {
  alert("Unauthorized. Please login again.");
  return;
}

   return(
    <div className="adduser-container">
        <form onSubmit={handleSubmit} className="adduser-form">
            <input type = "text" onChange={handleChange} value ={form.username} name = "username" placeholder="User Name"/>
            <input type = "text" onChange={handleChange} value = {form.firstName} name = "firstName" placeholder="First Name"/>
            <input type="text" onChange={handleChange} value={form.lastName}  name = "lastName" placeholder="Last Name"/>
            <input type = "Email" onChange={handleChange} value = {form.email} name = "email" placeholder="Enter your Email Id"/>
            <input type ="password" onChange={handleChange} value={form.password} name = "password" placeholder="Enter your password"/>
            <select type ="text" onChange={handleChange} value = {form.role} name = "role" placeholder="Enter role">
                <option value = "USER" >USER</option>
                <option value = "ADMIN">ADMIN</option>
            </select>
            <button type = "submit" >Submit</button>
        </form>
    </div>
   )

}
export default AddUserForm;