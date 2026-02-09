import { useEffect, useState } from "react";
import {
  FaArrowDown,
  FaArrowUp,
  FaBoxes,
  FaChartLine,
  FaDollarSign,
  FaMoneyBill,
  FaSpinner,
  FaTimes,
  FaTrash,
  FaWallet,
} from "react-icons/fa";
import Modal from "../common/modal/Modal";

import { MdPriceCheck } from "react-icons/md";
import { BiTrendingUp, BiTrendingDown } from "react-icons/bi";
// import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { toast, ToastContainer } from "react-toastify";
import { deletePortfolioItem, fetchPortfoli } from "../../api/portfolioAxios";
import { useUser } from "../../context/userContext";
import AddPortfolioForm from "./AddPortfolioForm";
import StockPrice from "../stock/StockPrice";
import BuySellForm from "../../Transactions/BuySellForm";
import axios from "axios";
import EmptyPortfolio from "../common/empty/EmptyPortfolio";


const Portfolio = () => {
  const userContext = useUser();
  const [portfolio, setPortfoli] = useState([]);
  const [totalInvestment, setTotalInvestment] = useState(0);
  const [selectedSymbol, setSelectedSymbol] = useState(null);
  const [loading, setLoading] = useState(false);
  const [totalCurrentValue, setTotalCurrentValue] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTradeModal, setShowTradeModal] = useState(false);

 const[totalProfitLoss,setTotalProfitLoss] = useState(0);
  if (!userContext) return <p>Loading user context...</p>;

  const { user } = userContext;

  const isAuthenticated = !!user;




//  console.log("userId",userId);
  const loadPortfolio = async () => {
    try {
      setLoading(true);
      const response = await fetchPortfoli();
     // console.log("Portfolio API Response:", response);
      const responseData = response.data;
      const token = localStorage.getItem("token");
     const withLiveData = await Promise.all(
      responseData.map(async(item)=>{
          const totalInvestment  = item.averagebuyprice*item.quantity;
          try{
          const token = localStorage.getItem("token");

const liveRes = await axios.get(
  `https://stocksimulator-backend.onrender.com/api/stock-price/closing-price?stocksymbol=${item.stocksymbol}`,
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
);




            const liveData = liveRes.data.meta;
            const currentPrice = liveData.currentPrice;
            const totalCurrentValue = currentPrice*item.quantity??0;
            const profitLoss  = totalCurrentValue-totalInvestment;
           //  console.log(`Symbol: ${item.stocksymbol}, Quantity: ${item.quantity}, CurrentPrice: ${currentPrice}`);
            return{
              ...item,
              totalInvestment,
              currentPrice,
              change:liveData.change,
              changePercent:liveData.changePercent,
              totalCurrentValue,
              profitLoss
            }
          }
          catch(err)
          {
            toast.warn("Error while getting the live price");
            console.error("error while getting the profit loss ",err);
            return {
              ...item,
              totalInvestment,
              currentPrice:null,
              change:null,
              changePercent:null,
              totalCurrentValue:0,
              profitLoss:0,
              
            }
          }

      })
     )
      
      const totalInvestment = withLiveData.reduce(
        (acc, item) => acc + item.totalInvestment,
        0
      );
      const totalProfitLoss = withLiveData.reduce((acc,item)=>
        acc+(item.profitLoss??0),0
      )
      const totalCurrentValue = withLiveData.reduce((acc,item)=>
        acc+(item.totalCurrentValue||0),0
      )
      setPortfoli(withLiveData);
      setTotalInvestment(totalInvestment);
      setTotalCurrentValue(totalCurrentValue);
      setTotalProfitLoss(totalProfitLoss);
    } catch (err) {
      toast.error("An error occurred while loading your portfolio.");
    } finally {
      setLoading(false);
    }
  };

 useEffect(() => {
  if (isAuthenticated) {
    loadPortfolio();
  }
}, [isAuthenticated]);

  const handleDelete = async (stocksymbol) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${stocksymbol}?`
    );
    if (!confirmed) return;

    try {
      await deletePortfolioItem(stocksymbol);
      toast.success(`${stocksymbol} successfully removed from portfolio`);
      loadPortfolio();
    } catch (err) {
      toast.error("Failed to delete stock.");
    }
  };
    
  return (
    <div className="portfolio-page1">
      <div className="portfolio-header">
        <h1>Your Stock Portfolio</h1>
      </div>
       <div className="portfolio-summary">
        <p>
          <FaWallet /> Invested Value: $ {totalInvestment.toFixed(2)}
      </p>
      <p>
        <FaChartLine /> Current Value: $ {totalCurrentValue.toFixed(2)}
      </p>
       <p style={{ color: totalProfitLoss >= 0 ? "green" : "red" }}>
           {totalProfitLoss >= 0 ? <FaArrowUp /> : <FaArrowDown />} Profit/Loss: ${" "}
        {totalProfitLoss.toFixed(2)}
     </p>
        </div>

      <div className="portfolio-container">
        {/* <p className="totalInvestment">
          Total Investment: $ {totalInvestment.toFixed(2)}
        </p> */}
        <div className="dashboard-actions">
<button
  className="primary-btn"
  onClick={() => setShowAddModal(true)}
>
  + Add Stock
</button>

<button
  className="secondary-btn"
  disabled={portfolio.length === 0 || loading}
  onClick={() => setShowTradeModal(true)}
>
  Buy / Sell
</button>

    </div>


        
        {/* <div className="portfolio-forms">
          <AddPortfolioForm userId={userId} onAdd={loadPortfolio} />
          <BuySellForm userId={userId} onSuccess={loadPortfolio} />
        </div> */}

        {/* Spinner while loading */}

{!loading && portfolio.length === 0 && <EmptyPortfolio />}



       
        {loading && (
  <div className="loading-container">
    Loading your portfolio... <FaSpinner className="icons-spin" />
  </div>
)}

{!loading && portfolio.length > 0 && (
  <div className="portfolio-grid">
    {portfolio.map((item, index) => (
      <div className="portfolio-card" key={index}>
        <div className="card-header">
          <h2 onClick={() => setSelectedSymbol(item.stocksymbol)}>
            {item.stocksymbol}
          </h2>
          <button
            onClick={() => handleDelete(item.stocksymbol)}
            className="delete-btn-portfolio"
            title="Delete Stock"
          >
            <FaTrash />
          </button>
        </div>

        <p>
          <FaBoxes /> Quantity: {item.quantity}
        </p>

        <p>
          <FaDollarSign /> Avg. Buy Price: $ {item.averagebuyprice}
        </p>

        <p>
          <FaChartLine /> Total Investment: ${" "}
          {item.totalInvestment.toFixed(2)}
        </p>

        {item.currentPrice != null ? (
          <>
            <p>
              <FaMoneyBill /> Current Price: $ {item.currentPrice}
            </p>

            <p>
              <span style={{ marginRight: "6px" }}>
                {item.change >= 0 ? (
                  <FaArrowUp style={{ color: "green" }} />
                ) : (
                  <FaArrowDown style={{ color: "red" }} />
                )}
              </span>
              Change:{" "}
              <span style={{ color: item.change >= 0 ? "green" : "red" }}>
                $ {item.change.toFixed(2)} ({item.changePercent.toFixed(2)}%)
              </span>
            </p>

            <p>
              <MdPriceCheck
                style={{ marginRight: "6px", color: "#1565c0" }}
              />
              Current Value: $ {item.totalCurrentValue.toFixed(2)}
            </p>

            <p>
              {item.profitLoss >= 0 ? (
                <BiTrendingUp
                  style={{ marginRight: "6px", color: "green" }}
                />
              ) : (
                <BiTrendingDown
                  style={{ marginRight: "6px", color: "red" }}
                />
              )}
              Profit/Loss:{" "}
              <span
                style={{ color: item.profitLoss >= 0 ? "green" : "red" }}
              >
                $ {item.profitLoss.toFixed(2)}
              </span>
            </p>
          </>
        ) : (
          <>
            Loading
            <FaSpinner
              className="icons-spin"
              style={{ marginLeft: "10px" }}
            />
          </>
        )}
      </div>
    ))}
  </div>
)}

        
        {selectedSymbol && (
          <div className="stock-chart">
            <div className="chart-header">
              <h3>Candlestick Chart for {selectedSymbol}</h3>
              <button
                className="close-chart-btn"
                onClick={() => setSelectedSymbol(null)}
                title="Close Chart"
              >
                <FaTimes />
              </button>
            </div>
            <StockPrice symbol={selectedSymbol} />
          </div>
        )}
      </div>

     {showAddModal && (
  <Modal onClose={() => setShowAddModal(false)}>
<AddPortfolioForm onAdd={() => {
  loadPortfolio();
  setShowAddModal(false);
}} />

  </Modal>
)}

{showTradeModal && (
  <Modal onClose={() => setShowTradeModal(false)}>
    <BuySellForm onSuccess={() => {
  loadPortfolio();
  setShowTradeModal(false);
}} />

  </Modal>
)}

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default Portfolio;
