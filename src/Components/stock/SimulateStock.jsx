import axios from "axios";

const SimulateStock = ({ onSimulate }) => {

  const simulate = async () => {
    try {
      const token = localStorage.getItem("token");

      await axios.post(
        "https://stocksimulator-backend.onrender.com/api/stock/simulate",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

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
