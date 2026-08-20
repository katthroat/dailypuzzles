export default function HintToolbar({ solver, onBack }) {
  const { progress, revealCurrent, toggleHighlight } = solver;

  return (
    <div className="hint-toolbar">
      <button
        type="button"
        className="hint-btn hint-back-link"
        onClick={onBack}
      >
        &larr; Back
      </button>
      <button
        type="button"
        className="hint-btn hint-btn--reveal"
        onClick={revealCurrent}
      >
        Reveal Letter
      </button>
      <button
        type="button"
        className="hint-btn hint-toggle-btn"
        aria-pressed={progress.highlightCorrect}
        onClick={toggleHighlight}
      >
        Show Correct
      </button>
    </div>
  );
}
