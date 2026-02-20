import { useEffect, useState, useContext } from "react";
import {
  FaArrowDown,
  FaArrowUp,
  FaChartLine,
  FaSpinner,
  FaTimes,
  FaWallet,
} from "react-icons/fa";
import { BiTrendingUp, BiTrendingDown } from "react-icons/bi";
import { toast, ToastContainer } from "react-toastify";
import Modal from "../common/modal/Modal";
import { fetchPortfolio } from "../../api/portfolioAxios";
import { useUser } from "../../context/userContext";
import BuySellForm from "../../Transactions/BuySellForm";
import { WebSocketContext } from "../../context/WebSocketContext";
import EmptyPortfolio from "../common/empty/EmptyPortfolio";
import { motion } from "framer-motion";

const Portfolio = () => {
  const { user, refreshUser } = useUser();
  const isAuthenticated = !!user;
  const { latestUpdate } = useContext(WebSocketContext);

  const [portfolio, setPortfolio] = useState([]);
  const [totalInvestment, setTotalInvestment] = useState(0);
  const [totalCurrentValue, setTotalCurrentValue] = useState(0);
  const [totalProfitLoss, setTotalProfitLoss] = useState(0);

  const [loading, setLoading] = useState(false);
  const [showTradeModal, setShowTradeModal] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);
  const [tradeMode, setTradeMode] = useState("BUY"); // NEW

  const loadPortfolio = async () => {
    try {
      setLoading(true);
      const data = await fetchPortfolio();

      let totalInvestmentSum = 0;
      let totalCurrentValueSum = 0;
      let totalProfitLossSum = 0;

      const enrichedData = data.map((item) => {
        const quantity = Number(item.quantity) || 0;
        const avgPrice = Number(item.averagebuyprice) || 0;

        const totalInvestment = avgPrice * quantity;

        const currentPrice =
          item.stock?.currentprice != null
            ? Number(item.stock.currentprice)
            : 0;

        const changePercent =
          item.stock?.changepercent != null
            ? Number(item.stock.changepercent)
            : 0;

        const totalCurrentValue = currentPrice * quantity;
        const profitLoss = totalCurrentValue - totalInvestment;

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
      toast.error("Failed to load portfolio");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) loadPortfolio();
  }, [isAuthenticated]);

  useEffect(() => {
    if (!latestUpdate || portfolio.length === 0) return;

    let totalCurrentValueSum = 0;
    let totalProfitLossSum = 0;

    const updatedPortfolio = portfolio.map((item) => {
      const livePrice = latestUpdate[item.stocksymbol];

      const quantity = Number(item.quantity) || 0;
      const avgPrice = Number(item.averagebuyprice) || 0;

      const priceToUse = livePrice ?? item.currentPrice;

      const totalInvestment = avgPrice * quantity;
      const totalCurrentValue = priceToUse * quantity;
      const profitLoss = totalCurrentValue - totalInvestment;

      totalCurrentValueSum += totalCurrentValue;
      totalProfitLossSum += profitLoss;

      return {
        ...item,
        currentPrice: priceToUse,
        totalCurrentValue,
        profitLoss,
      };
    });

    setPortfolio(updatedPortfolio);
    setTotalCurrentValue(totalCurrentValueSum);
    setTotalProfitLoss(totalProfitLossSum);
  }, [latestUpdate]);

  const openBuyModal = () => {
    setTradeMode("BUY");
    setSelectedStock(null);
    setShowTradeModal(true);
  };

  const openSellModal = (item) => {
    setTradeMode("SELL");
    setSelectedStock(item);
    setShowTradeModal(true);
  };

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
            <motion.strong
              key={totalCurrentValue}
              initial={{ opacity: 0.5 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              ${totalCurrentValue.toFixed(2)}
            </motion.strong>
          </div>
        </div>

        <div
          className={`summary-card ${
            totalProfitLoss >= 0 ? "profit" : "loss"
          }`}
        >
          {totalProfitLoss >= 0 ? <FaArrowUp /> : <FaArrowDown />}
          <div>
            <span>Total P/L</span>
            <strong>${totalProfitLoss.toFixed(2)}</strong>
          </div>
        </div>
      </div>

      <div className="dashboard-actions">
        <button className="primary-btn" onClick={openBuyModal}>
          Buy Stock
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
                  onClick={() => setSelectedStock(item)}
                >
                  <h2 className="company-name">
                    {item.stock?.companyname || item.stocksymbol}
                  </h2>
                  <span className="stock-symbol">
                    {item.stocksymbol}
                  </span>
                </div>

                <button
                  className="sell-btn"
                  onClick={() => openSellModal(item)}
                >
                  Sell
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
                  {item.changePercent >= 0 ? (
                    <FaArrowUp />
                  ) : (
                    <FaArrowDown />
                  )}
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
                {item.profitLoss >= 0 ? (
                  <BiTrendingUp />
                ) : (
                  <BiTrendingDown />
                )}
                ${item.profitLoss.toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      )}

      {showTradeModal && (
        <Modal onClose={() => setShowTradeModal(false)}>
          <BuySellForm
            mode={tradeMode}
            stock={selectedStock}
            onSuccess={() => {
              loadPortfolio();
              if (refreshUser) refreshUser();
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
