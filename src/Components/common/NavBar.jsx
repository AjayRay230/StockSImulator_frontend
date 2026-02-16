import { useEffect, useState } from "react";
import {Link, useNavigate,useLocation}  from "react-router-dom";
import {FaChartLine, FaClipboard, FaMoon,FaSearch,FaSignOutAlt,FaSun, FaUser, FaUserPlus, FaWallet,FaHome,FaTools, FaBell,FaBars} from "react-icons/fa";
import { useUser } from "../../context/userContext";
import { MdAnalytics } from "react-icons/md";
import { useWebSocket } from "../../context/WebSocketContext";
import { isMarketOpen } from "../../utils/marketStatus";
const Navbar =()=>{
    const[searchTerm ,setSearchTerm] = useState('');
    const navigate = useNavigate();
    const{isLoggedIn,role,user,logout} = useUser();
    const[isSidebarOpen,setIsSidebarOpen] = useState(false);
    const { connected } = useWebSocket();
    const marketOpen = isMarketOpen();
    const toggleSidebar = ()=>{
      setIsSidebarOpen(prev=>!prev);
    }
    const getInitialTheme = ()=>{
        const storedTheme = localStorage.getItem("theme");
        return storedTheme?storedTheme :"light";
    }
    const handleSearch =()=>{
        if(!searchTerm.trim()) return ;
        navigate(`/search-stock/${searchTerm.trim().toUpperCase()}`);
    }

    const[theme,setTheme] = useState(getInitialTheme);
    const toggleTheme = ()=>{
        const newTheme = theme==='light'?'dark':'light';
        setTheme(newTheme);
        localStorage.setItem("theme",newTheme);
    }

    const handleLogout = () => {
  logout("manual");
  navigate("/login", {
    replace: true,
    state: { reason: "manual" }
  });
};

  useEffect(() => {
  document.documentElement.setAttribute("data-theme", theme);
}, [theme]);

    return(
      <>
        <div className="navbar">
            <div className="navbar-left">
              <h1>Stock Simulator </h1></div>
            
      <div className="navbar-search">
        <input
      type="search"
       placeholder={
      isLoggedIn ? "Search stock..." : "Login to search stocks"
      }
      className="search-box"
      value={searchTerm}
      disabled={!isLoggedIn}
      onChange={(e) => setSearchTerm(e.target.value)}
      onKeyDown={(e) => {
      if (isLoggedIn && e.key === "Enter") handleSearch();
    }}
      />

<button
  onClick={handleSearch}
  disabled={!isLoggedIn}
  className={!isLoggedIn ? "disabled-btn" : ""}
>
  <FaSearch />
</button>

      </div>
<div className="navbar-right">


<div className={`market-badge ${marketOpen ? "open" : "closed"}`}>
  {marketOpen ? "🟢 Market Open" : "🔴 Market Closed"}
</div>
  <button className="theme-toggle" onClick={toggleTheme}>
    {theme === 'light' ? <FaSun /> : <FaMoon />}
  </button>

  <FaBell className="icon1"/>
    <div className={`connection-badge ${connected ? "online" : "offline"}`}>
  <span className="dot" />
  {connected ? "Live Market" : "Reconnecting..."}
</div>


</div>
      </div>
      
         <div className={`sidebar ${isSidebarOpen? 'active':''}`}>
          <div className="toggle-btn" onClick={toggleSidebar}>
            <FaBars className = "toggle-icon"/>
          </div>
            <ul className="sidebar-menu">
            {isLoggedIn && user &&(
              <div className="user-welcome">
                <FaUser className="icon1"/>
               <strong className="user-name">Hello Mr. {" "} {user.firstName}{" "}{user.lastName}</strong>
                </div>
            )}
           
              
            {isLoggedIn && (
    <>
      <li><Link to="/portfolio"><FaWallet className="icon1"/>
      <span className= "link-text" >

      
      Portfolio
      </span></Link></li>
      <li><Link to="/stock"><FaChartLine className="icon1"/>
      <span className={`link-text ${isSidebarOpen ?"show":""}` }>Live Prices</span>
      </Link></li>
      <li><Link to="/transaction"><FaClipboard className="icon1"/>  
       <span className={`link-text ${isSidebarOpen ?"show":""}` }>Transactions</span>
      </Link></li>
      <li><Link to="/watchlist"><FaHome className = "icon1"/>
       <span className={`link-text ${isSidebarOpen ?"show":""}` }>Watchlist</span>
      </Link></li>
     
    </>
  )}
            {role === 'ADMIN' && (
    <>
      <li><Link to="/add-user"><FaUserPlus className="icon1"/> 
       <span className={`link-text ${isSidebarOpen ? 'show' : ''}`}>
       Add User
       </span>
       </Link></li>
      <li><Link to="/admin-userControl"><FaTools className = "icon1"/> 
       <span className={`link-text ${isSidebarOpen ? 'show' : ''}`}>
       Admin User Control
       </span></Link></li>
       <li><Link to = "/admin-trade-stats"><MdAnalytics className="icon1"/> 
       <span className={`link-text ${isSidebarOpen ? 'show' : ''}`}>
        Admin Trade Stats 
       </span>
       </Link></li>
    </>
  )}

  {!isLoggedIn   ? (
    <li><Link to="/login"><FaUser className= "icon1"/>
    <span className={`link-text ${isSidebarOpen ? 'show' : ''}`}>

    
      Login
      </span></Link></li>
  ) : (
<li>
  <button onClick={handleLogout}>
    <FaSignOutAlt className="icon1"/>
    <span className={`link-text ${isSidebarOpen ? 'show' : ''}`}>
      Logout
    </span>
  </button>
</li>

  )}

            </ul>
           
            
             
            </div>
            </>
        
    )
}
export default Navbar;