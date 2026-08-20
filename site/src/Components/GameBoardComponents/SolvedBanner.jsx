export default function SolvedBanner({ hintsUsed }) {
  return (
    <div className="solved-banner">
      <span>Solved! Nicely done.</span>
      <span className="hints-used-note">
        {hintsUsed
          ? `${hintsUsed} letter${hintsUsed === 1 ? "" : "s"} revealed`
          : "no hints used"}
      </span>
    </div>
  );
}
