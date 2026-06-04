export default function Spinner({ inline = false }) {
  if (inline) {
    return (
      <div className="gridSpinnerWrap">
        <div className="spinnerRing" />
      </div>
    );
  }
  return (
    <div className="spinnerOverlay">
      <div className="spinnerRing" />
    </div>
  );
}
