// FeaturesSection.jsx
const features = [
  {
    title: "Live Market Prices",
    description: "Low-latency real-time stock price updates.",
    icon: "📈",
  },
  {
    title: "Stock Simulation",
    description: "Test trading strategies without risking capital.",
    icon: "🧪",
  },
  {
    title: "Watchlist",
    description: "Track selected stocks in a focused dashboard.",
    icon: "⭐",
  },
];

const FeaturesSection = () => {
  return (
    <section className="features">
      <h2>Why Choose Our Platform?</h2>

<div className="features-grid">
  {features.map((feature, index) => (
    <div key={index} className="feature-card">
      <div className="feature-icon">{feature.icon}</div>
      <h3>{feature.title}</h3>
      <p>{feature.description}</p>
    </div>
  ))}
</div>

    </section>
  );
};

export default FeaturesSection;
