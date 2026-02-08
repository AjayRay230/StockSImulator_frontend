import EmptyState from "./EmptyState";
import { Link } from "react-router-dom";

const EmptyPortfolio = () => {
  return (
    <EmptyState
      title="Your portfolio is empty"
      description="You don’t own any stocks yet. Start investing to build your portfolio."
      action={<Link to="/stock">Browse Stocks</Link>}
    />
  );
};

export default EmptyPortfolio;
