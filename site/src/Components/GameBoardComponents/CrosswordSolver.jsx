import { useCrosswordPuzzle } from "../../Hooks/useCrosswordPuzzle";
import { useCrosswordSolver } from "../../Hooks/useCrosswordSolver";
import CrosswordGrid from "./CrosswordGrid";
import ClueBar from "./ClueBar";
import ClueRail from "./ClueRail";
import HintToolbar from "./HintToolbar";
import SolvedBanner from "./SolvedBanner";

export default function CrosswordSolver({ puzzleId, onBack }) {
  const { meta, error } = useCrosswordPuzzle(puzzleId);

  if (error) {
    return (
      <div className="empty-state">
        Couldn&rsquo;t load this puzzle ({error.message}).
      </div>
    );
  }
  if (!meta) {
    return <div className="empty-state">Loading puzzle&hellip;</div>;
  }

  return <SolverScreen meta={meta} onBack={onBack} />;
}

function SolverScreen({ meta, onBack }) {
  const solver = useCrosswordSolver(meta);

  return (
    <div className="solver">
      <div className="solver-screen">
        <div className="solver-toolbar-top">
          <button type="button" className="back-link" onClick={onBack}>
            &larr; All puzzles
          </button>
          <span className="solver-title">{meta.title}</span>
          <span className="progress-note" />
        </div>
        {solver.solvedBannerShown && (
          <SolvedBanner hintsUsed={solver.progress.hintsUsed} />
        )}
        <ClueBar solver={solver} />
        <CrosswordGrid meta={meta} solver={solver} />
        <HintToolbar solver={solver} onBack={onBack} />
      </div>
      <ClueRail meta={meta} solver={solver} />
    </div>
  );
}
