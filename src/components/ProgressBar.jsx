export default function ProgressBar({ percentage = 0, label }) {
  return (
    <div className="progressBarWrap">
      <div className="progressBarTrack">
        <div className="progressBarFill" style={{ width: `${percentage}%` }} />
      </div>
      {label && <span className="progressBarText">{label}</span>}
    </div>
  );
}
