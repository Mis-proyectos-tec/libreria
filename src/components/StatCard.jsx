export default function StatCard({ icon, value, label }) {
  return (
    <div className="statCard">
      <span className="statCardIcon">{icon}</span>
      <div>
        <p className="statCardValue">{value}</p>
        <p className="statCardLabel">{label}</p>
      </div>
    </div>
  );
}
