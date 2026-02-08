import EmptyState from "./EmptyState";

const EmptyTransactions = () => {
  return (
    <EmptyState
      title="No transactions found"
      description="You haven’t made any trades yet."
    />
  );
};

export default EmptyTransactions;
