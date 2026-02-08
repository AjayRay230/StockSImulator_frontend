const EmptyState = ({ title, description, action }) => {
  return (
    <div className="empty-state">
      <h3 className="empty-title">{title}</h3>
      <p className="empty-description">{description}</p>

      {action && <div className="empty-action">{action}</div>}
    </div>
  );
};

export default EmptyState;
