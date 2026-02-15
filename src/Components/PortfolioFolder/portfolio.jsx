import { useEffect, useState,useMemo } from "react";
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
import { BiTrendingUp, BiTrendingDown } from "react-icons/bi";
import { toast, ToastContainer } from "react-toastify";
import Modal from "../common/modal/Modal";
import { deletePortfolioItem, fetchPortfoli } from "../../api/portfolioAxios";
import { useUser } from "../../context/userContext";
import AddPortfolioForm from "./AddPortfolioForm";
import StockPrice from "../stock/StockPrice";
import BuySellForm from "../../Transactions/BuySellForm";

import EmptyPortfolio from "../common/empty/EmptyPortfolio";

const Portfolio = () => {
  const { user } = useUser();
  const isAuthenticated = !!user;

  const [portfolio, setPortfolio] = useState([]);
  const [totalInvestment, setTotalInvestment] = useState(0);
  const [totalCurrentValue, setTotalCurrentValue] = useState(0);
  const [totalProfitLoss, setTotalProfitLoss] = useState(0);
  const [selectedSymbol, setSelectedSymbol] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTradeModal, setShowTradeModal] = useState(false);

const loadPortfolio = async () => {
  try {
    setLoading(true);

    const { data } = await fetchPortfoli();
  

    let totalInvestmentSum = 0;
    let totalCurrentValueSum = 0;
    let totalProfitLossSum = 0;

    const enrichedData = data.map((item) => {
      const quantity = Number(item.quantity) || 0;
      const avgPrice = Number(item.averagebuyprice) || 0;

      const totalInvestment = avgPrice * quantity;

      const currentPrice = Number(item.stock?.currentprice) || 0;
      const changePercent = Number(item.stock?.changepercent) || 0;

      const totalCurrentValue = currentPrice * quantity;
      const profitLoss = totalCurrentValue - totalInvestment;

      // Accumulate totals in same pass
      totalInvestmentSum += totalInvestment;
      totalCurrentValueSum += totalCurrentValue;
      totalProfitLossSum += profitLoss;

      return {
        ...item,
        totalInvestment,
        currentPrice,
        changePercent,
        totalCurrentValue,
        profitLoss,
      };
    });

    setPortfolio(enrichedData);
    setTotalInvestment(totalInvestmentSum);
    setTotalCurrentValue(totalCurrentValueSum);
    setTotalProfitLoss(totalProfitLossSum);

  } catch (error) {
    console.error("Portfolio load error:", error);
    toast.error("Failed to load portfolio");
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    if (isAuthenticated) loadPortfolio();
  }, [isAuthenticated]);

  const handleDelete = async (stocksymbol) => {
    if (!window.confirm(`Delete ${stocksymbol}?`)) return;

    try {
      await deletePortfolioItem(stocksymbol);
      toast.success(`${stocksymbol} removed`);
      loadPortfolio();
    } catch {
      toast.error("Delete failed");
    }
  };
  const selectedStock = useMemo(() => {
  return portfolio.find(
    (item) => item.stocksymbol === selectedSymbol
  );
}, [portfolio, selectedSymbol]);
  return (
<div className="portfolio-page1">

  
  <div className="portfolio-header">
    <h1>Portfolio</h1>
    <span className="portfolio-subtitle">
      Track performance & manage your investments
    </span>
  </div>


  <div className="portfolio-summary">
    <div className="summary-card">
      <FaWallet />
      <div>
        <span>Invested</span>
        <strong>${totalInvestment.toFixed(2)}</strong>
      </div>
    </div>

    <div className="summary-card">
      <FaChartLine />
      <div>
        <span>Current Value</span>
        <strong>${totalCurrentValue.toFixed(2)}</strong>
      </div>
    </div>

    <div className={`summary-card ${totalProfitLoss >= 0 ? "profit" : "loss"}`}>
      {totalProfitLoss >= 0 ? <FaArrowUp /> : <FaArrowDown />}
      <div>
        <span>Total P/L</span>
        <strong>${totalProfitLoss.toFixed(2)}</strong>
      </div>
    </div>
  </div>

 
  <div className="dashboard-actions">
    <button className="primary-btn" onClick={() => setShowAddModal(true)}>
      + Add Stock
    </button>

    <button
      className="secondary-btn"
      disabled={!portfolio.length || loading}
      onClick={() => setShowTradeModal(true)}
    >
      Buy / Sell
    </button>
  </div>

  
  {!loading && portfolio.length === 0 && <EmptyPortfolio />}


  {loading && (
    <div className="loading-container">
      Loading portfolio... <FaSpinner className="icons-spin" />
    </div>
  )}


  {!loading && portfolio.length > 0 && (
    <div className="portfolio-grid">
      {portfolio.map((item) => (
        <div className="portfolio-card" key={item.stocksymbol}>

     
          <div className="card-header">
            <div
              className="stock-info"
              onClick={() => setSelectedSymbol(item.stocksymbol)}
            >
              <h2 className="company-name">
                {item.stock?.companyname || item.stocksymbol}
              </h2>
              <span className="stock-symbol">
                {item.stocksymbol}
              </span>
            </div>

            <button
              onClick={() => handleDelete(item.stocksymbol)}
              className="delete-btn-portfolio"
            >
              <FaTrash />
            </button>
          </div>

       
          <div className="price-section">
            <span className="current-price">
              ${item.currentPrice.toFixed(2)}
            </span>

            <span
              className={`price-change ${
                item.changePercent >= 0 ? "profit" : "loss"
              }`}
            >
              {item.changePercent >= 0 ? <FaArrowUp /> : <FaArrowDown />}
              {item.changePercent.toFixed(2)}%
            </span>
          </div>

         
          <div className="metrics-grid">
            <div>
              <span>Qty</span>
              <strong>{item.quantity}</strong>
            </div>
            <div>
              <span>Avg Price</span>
              <strong>${item.averagebuyprice}</strong>
            </div>
            <div>
              <span>Invested</span>
              <strong>${item.totalInvestment.toFixed(2)}</strong>
            </div>
            <div>
              <span>Value</span>
              <strong>${item.totalCurrentValue.toFixed(2)}</strong>
            </div>
          </div>

     
          <div
            className={`profit-section ${
              item.profitLoss >= 0 ? "profit" : "loss"
            }`}
          >
            {item.profitLoss >= 0 ? <BiTrendingUp /> : <BiTrendingDown />}
            ${item.profitLoss.toFixed(2)}
          </div>

        </div>
      ))}
    </div>
  )}

{selectedSymbol && (
  <div className="stock-chart">
    <div className="chart-header">
      <h3>
        {selectedStock?.stock?.companyname || selectedSymbol}
      </h3>
      <button
        className="close-chart-btn"
        onClick={() => setSelectedSymbol(null)}
      >
        <FaTimes />
      </button>
    </div>

    <StockPrice
      symbol={selectedSymbol}
      companyName={selectedStock?.stock?.companyname}
    />
  </div>
)}

 
  {showAddModal && (
    <Modal onClose={() => setShowAddModal(false)}>
      <AddPortfolioForm
        onAdd={() => {
          loadPortfolio();
          setShowAddModal(false);
        }}
      />
    </Modal>
  )}

  {showTradeModal && (
    <Modal onClose={() => setShowTradeModal(false)}>
      <BuySellForm
        onSuccess={() => {
          loadPortfolio();
          setShowTradeModal(false);
        }}
      />
    </Modal>
  )}

  <ToastContainer position="top-right" autoClose={3000} />
</div>
  );
};

export default Portfolio;