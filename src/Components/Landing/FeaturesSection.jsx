// FeaturesSection.jsx
const features = [
  {
    title: "Live Market Prices",
    description: "Track real-time stock prices with minimal latency.",
  },
  {
    title: "Stock Simulation",
    description: "Practice trading strategies without real money.",
  },
  {
    title: "Watchlist",
    description: "Monitor your favorite stocks in one place.",
  },
];

const FeaturesSection = () => {
  return (
    <section className="features">
      <h2>Why Choose Our Platform?</h2>

      <div className="features-grid">
        {features.map((feature, index) => (
          <div key={index} className="feature-card">
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FeaturesSection;
