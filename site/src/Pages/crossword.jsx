import { useEffect, useState } from "react";
import PuzzleList from "../Components/GameBoardComponents/PuzzleList";
import CrosswordSolver from "../Components/GameBoardComponents/CrosswordSolver";

export default function Crossword() {
  const [puzzleId, setPuzzleId] = useState(null);

  useEffect(() => {
    document.body.classList.toggle("is-puzzle-view", !!puzzleId);
    return () => document.body.classList.remove("is-puzzle-view");
  }, [puzzleId]);

  return (
    <div id="app" aria-live="polite">
      {puzzleId ? (
        <CrosswordSolver puzzleId={puzzleId} onBack={() => setPuzzleId(null)} />
      ) : (
        <PuzzleList onSelect={setPuzzleId} />
      )}
    </div>
  );
}
