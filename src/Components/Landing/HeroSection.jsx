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
      <h1>Simulate. Analyze. Trade Smarter.</h1>
      <p>Practice stock trading with real-time market data.</p>
      <button onClick={handleGetStarted}>Get Started</button>
    </section>
  );
};

export default HeroSection;
