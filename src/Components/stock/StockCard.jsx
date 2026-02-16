import { useNavigate } from "react-router-dom";
import LivePrice from "./LivePrice";

const StockCard = ({ stock }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/trade/${stock.symbol}`);
  };

  return (
    <div
      className="stockcard-container"
      onClick={handleClick}
      style={{ cursor: "pointer" }}
    >
      <h3>
        {stock.symbol} - {stock.companyname}
      </h3>
            <button
      className="trade-btn"
      onClick={(e) => {
        e.stopPropagation(); // prevent double trigger
        navigate(`/trade/${stock.symbol}`);
      }}
    >
      Trade
    </button>
    
      <p>Initial Price: {stock.currentprice}</p>
      <p>Changes: {stock.changepercent}</p>
      <p>
        Last Updated:{" "}
        {new Date(stock.lastupdate).toLocaleDateString()}
      </p>

      <div className="liveprice-wrapper">
        <LivePrice symbol={stock.symbol} />
      </div>
    </div>
  );
};

export default StockCard;
