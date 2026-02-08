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
      Simulate. Analyze. <span>Trade Smarter.</span>
    </h1>
    <p>
      A professional stock market simulator with real-time prices and
      risk-free trading.
    </p>

    <div className="hero-actions">
      <button className="cta-btn" onClick={handleGetStarted}>
        Get Started
      </button>
      <button className="secondary-btn-hero">
        View Features
      </button>
    </div>
  </div>
</section>

  );
};

export default HeroSection;
