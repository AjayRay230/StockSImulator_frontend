import { useState } from 'react'
import { useParams } from 'react-router-dom';
import SearchStock from './Components/stock/searchStock';
import StockSelector from './Components/stock/StockSelector';
import Navbar from "./Components/common/NavBar";
import StockDashboard from './Components/stock/StockDashboard';
import AddUserForm from "./Components/user/AddUserForm";
import {BrowserRouter as Router ,Routes,Route,useNavigate} from "react-router-dom";
import './App.css'
import Portfolio from './Components/PortfolioFolder/portfolio';
import TransactionHistory from './Transactions/TransactionHistory';
import WatchList from './Components/Watchlist';
import StockPage from './Components/stock/StockPage';
import LoginForm from './Components/common/LoginForm';
import RegistrationForm from './Components/common/RegistrationForm';
import StockPrice from './Components/stock/StockPrice';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AdminUserControl from './Components/common/AdminUserControl';
import AdminTradeStats from './Components/common/AdminTradeStats';
import ResetPassword from './Components/common/ResetPassword';
import ForgotPassword from './Components/common/ForgotPassWord';
import LandingPage from "./pages/Landing/LandingPage";
function App() {
  const[selectedSymbol,setSelectedSymbol]  = useState("");
  const[loginIn,setLoginIn] = useState(false);
  const navigate = useNavigate();
  const handleUserAdded = () => {
    console.log("User successfully added!");
    alert("User added Successfully!! ")
    
  };
  
  const handleLoginSucess = ()=>{
        setLoginIn(true);
        alert("Login Successful");
        navigate('/portfolio');
  }

  return (
    <>
      
        <Navbar selectedSymbol= {selectedSymbol}
         setSelectedSymbol = {setSelectedSymbol}
        />
        <div className='main-content'>
         <Routes>
          <Route path= "/portfolio" element = {<div className='portfolio-parent'>
         
           <Portfolio/>
           <div style={{marginTop:"1rem"}}>
          
           {/* <StockPrice symbol={symbol}/> */}
           
           </div>
          </div>}/>
         
         <Route path='/admin-trade-stats' element = {<AdminTradeStats/>}/>
         <Route path = "/admin-userControl" element = {<AdminUserControl/>}/>
          <Route path = "/dashboard" element = {<StockDashboard/>}/>
           <Route path="/" element={<LandingPage />} />
          <Route path = "/prices" element = {<div>Stock Chart  Page</div>}/>
          <Route path = "/transaction" element = {<TransactionHistory/>}/>
          <Route path = "/add-user" element = {<div>
            <h3>User Management </h3>
            <AddUserForm onAdd={handleUserAdded}/>
              </div>}/>
            <Route path = "/login" element = {<div>
              <h3>Login Page </h3>
              <LoginForm onLogin={handleLoginSucess}/>
            </div>}></Route>
             <Route path = "/register" element = {<RegistrationForm/>} />
             
          <Route path  = "/watchlist" element = {<WatchList/>}/>
          
          <Route path="/stock" element={<StockPage/>}/>
          <Route path = "/search-stock" element = {<SearchStock/>}/>
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
         </Routes>
         </div>
       <ToastContainer/>
      
      </>
  )
}

export default App
