export default function EmptyState({ icon = "📚", title, text, action }) {
  return (
    <div className="emptyState">
      <span className="emptyStateIcon">{icon}</span>
      {title && <h3 className="emptyStateTitle">{title}</h3>}
      {text && <p className="emptyStateText">{text}</p>}
      {action}
    </div>
  );
}
