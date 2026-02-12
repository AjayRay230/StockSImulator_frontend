import { useNavigate } from "react-router-dom";

const HeroSection = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    const token = localStorage.getItem("token");

    if (token) {
      navigate("/dashboard");
    } else {
      navigate("/login");
    }
  };

  return (
  <section className="hero">
  <div className="hero-content">
    <h1>
      Simulate Execution. Model Risk. <span>Optimize Alpha.</span>
    </h1>

    <p>
      A deterministic trading environment engineered for strategy validation,
      real-time portfolio state tracking, and capital-efficient decision modeling.
    </p>

    <div className="hero-actions">
      <button className="cta-btn" onClick={handleGetStarted}>
        Initialize Trading Session
      </button>
<button
  className="secondary-btn-hero"
  onClick={() =>
    document.getElementById("features")
      ?.scrollIntoView({ behavior: "smooth" })
  }
>
  Review Infrastructure
</button>

    </div>

    {/* Metrics Row */}
    <div className="hero-metrics">
      <div className="metric">
        <span className="metric-value">1.84</span>
        <span className="metric-label">Simulated Sharpe</span>
      </div>

      <div className="metric">
        <span className="metric-value">12ms</span>
        <span className="metric-label">Data Latency</span>
      </div>

      <div className="metric">
        <span className="metric-value">42,317</span>
        <span className="metric-label">Executed Trades</span>
      </div>

      <div className="metric">
        <span className="metric-value">$18.4M</span>
        <span className="metric-label">Simulated Volume</span>
      </div>
    </div>
  </div>
</section>


  );
};

export default HeroSection;
