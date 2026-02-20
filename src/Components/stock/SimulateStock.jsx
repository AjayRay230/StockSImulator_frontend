
import apiClient from "../../api/apiClient";
const SimulateStock = ({ onSimulate }) => {

const simulate = async () => {
  try {
    await apiClient.post("/api/stock/simulate", {});

    if (onSimulate) onSimulate();

  } catch (err) {
    console.error("Simulation failed:", err);
  }
};

  return (
    <button onClick={simulate} className="simulate-btn">
      Simulate Stock Price
    </button>
  );
};

export default SimulateStock;
