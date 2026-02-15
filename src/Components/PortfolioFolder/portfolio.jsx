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
import { MdPriceCheck } from "react-icons/md";
import { BiTrendingUp, BiTrendingDown } from "react-icons/bi";
import { toast, ToastContainer } from "react-toastify";
import Modal from "../common/modal/Modal";
import { deletePortfolioItem, fetchPortfoli } from "../../api/portfolioAxios";
import { useUser } from "../../context/userContext";
import AddPortfolioForm from "./AddPortfolioForm";
import StockPrice from "../stock/StockPrice";
import BuySellForm from "../../Transactions/BuySellForm";
import axios from "axios";
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
    console.log("Portfolio raw data:", data);

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
  
  return (
    <div className="portfolio-page1">
      <div className="portfolio-header">
        <h1>Your Stock Portfolio</h1>
      </div>

      <div className="portfolio-summary">
        <p>
          <FaWallet /> Invested: ${totalInvestment.toFixed(2)}
        </p>
        <p>
          <FaChartLine /> Current: ${totalCurrentValue.toFixed(2)}
        </p>
        <p className={totalProfitLoss >= 0 ? "profit" : "loss"}>
          {totalProfitLoss >= 0 ? <FaArrowUp /> : <FaArrowDown />}
          Profit/Loss: ${totalProfitLoss.toFixed(2)}
        </p>
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
                <h2 onClick={() => setSelectedSymbol(item.stocksymbol)}>
                  {item.stocksymbol}
                </h2>
                <button
                  onClick={() => handleDelete(item.stocksymbol)}
                  className="delete-btn-portfolio"
                >
                  <FaTrash />
                </button>
              </div>

              <p><FaBoxes /> Qty: {item.quantity}</p>
              <p><FaDollarSign /> Avg: ${item.averagebuyprice}</p>
              <p><FaChartLine /> Invested: ${item.totalInvestment.toFixed(2)}</p>

              {item.currentPrice != null ? (
                <>
                  <p><FaMoneyBill /> Current: ${item.currentPrice}</p>

                  <p style={{ color: item.change >= 0 ? "green" : "red" }}>
                    {item.change >= 0 ? <FaArrowUp /> : <FaArrowDown />}
                    ${item.change.toFixed(2)} ({item.changePercent.toFixed(2)}%)
                  </p>

                  <p>
                    <MdPriceCheck /> Value: ${item.totalCurrentValue.toFixed(2)}
                  </p>

                  <p style={{ color: item.profitLoss >= 0 ? "green" : "red" }}>
                    {item.profitLoss >= 0 ? <BiTrendingUp /> : <BiTrendingDown />}
                    ${item.profitLoss.toFixed(2)}
                  </p>
                </>
              ) : (
                <FaSpinner className="icons-spin" />
              )}
            </div>
          ))}
        </div>
      )}

      {selectedSymbol && (
        <div className="stock-chart">
          <div className="chart-header">
            <h3>{selectedSymbol} Chart</h3>
            <button onClick={() => setSelectedSymbol(null)}>
              <FaTimes />
            </button>
          </div>
          <StockPrice symbol={selectedSymbol} />
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