import { useState } from "react";
import { useUser } from "../../context/userContext";
import { addPortfolioItem } from "../../api/portfolioAxios";
import StockSelector from "../stock/StockSelector";
import { toast } from "react-toastify";
import {
  FaHashtag,
  FaSortNumericUp,
  FaDollarSign,
  FaSpinner
} from "react-icons/fa";

const AddPortfolioForm = ({ onAdd }) => {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    stocksymbol: "",
    quantity: "",
    averagebuyprice: ""
  });

  
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]:
        name === "quantity" || name === "averagebuyprice"
          ? value === "" ? "" : Number(value)
          : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.stocksymbol) {
      toast.warn("Please select a stock");
      return;
    }

    if (!form.quantity || form.quantity <= 0) {
      toast.warn("Quantity must be greater than 0");
      return;
    }

    if (!form.averagebuyprice || form.averagebuyprice <= 0) {
      toast.warn("Average price must be greater than 0");
      return;
    }

    try {
      setLoading(true);

      await addPortfolioItem({
        stocksymbol: form.stocksymbol.toUpperCase(),
        quantity: form.quantity,
        averagebuyprice: form.averagebuyprice
      });

      toast.success("Stock added successfully");

      // Refresh portfolio
      onAdd();

      // Clean reset (no 0 flicker)
      setForm({
        stocksymbol: "",
        quantity: "",
        averagebuyprice: ""
      });

    } catch (err) {
      toast.error("Failed to add stock");
    } finally {
      setLoading(false);
    }
  };
      useEffect(() => {
  console.log("Portfolio Symbol:", item);
}, [item]);
  return (
    <form onSubmit={handleSubmit} className="portfolio-form">
      <h3 className="form-title">
        Add Stock to Portfolio
      </h3>

      <label>
        <FaHashtag className="icon" />
        Stock Symbol:
        <StockSelector
          selectedSymbol={form.stocksymbol}
          onChange={(symbol) =>
            setForm((prev) => ({
              ...prev,
              stocksymbol: symbol
            }))
          }
        />
      </label>

      <label>
        <FaSortNumericUp className="icon" />
        Quantity:
        <input
          type="number"
          name="quantity"
          placeholder="Quantity"
          value={form.quantity}
          onChange={handleChange}
          min="0"
          step="any"
        />
      </label>

      <label>
        <FaDollarSign className="icon" />
        Avg. Buy Price:
        <input
          type="number"
          name="averagebuyprice"
          placeholder="Avg Buy Price"
          value={form.averagebuyprice}
          onChange={handleChange}
          min="0"
          step="any"
        />
      </label>

      <button type="submit" disabled={loading}>
        {loading ? (
          <>
            <FaSpinner className="icons-spin" /> Processing...
          </>
        ) : (
          "Add"
        )}
      </button>
    </form>
  );
};

export default AddPortfolioForm;