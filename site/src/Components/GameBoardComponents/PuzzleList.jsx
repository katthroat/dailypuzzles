import { usePuzzleManifest } from "../../Hooks/usePuzzleManifest";

export default function PuzzleList({ onSelect }) {
  const { puzzles, error } = usePuzzleManifest();

  return (
    <div className="puzzle-list-wrap">
      <h1 className="visually-hidden">Puzzle list</h1>
      {error && (
        <div className="empty-state">
          Couldn&rsquo;t load the puzzle list (data/manifest.json). If you just
          uploaded this site, make sure the data/ folder came along with it.
        </div>
      )}
      {!error && puzzles === null && (
        <div className="empty-state">Loading puzzles&hellip;</div>
      )}
      {!error && puzzles && puzzles.length === 0 && (
        <div className="empty-state">
          No puzzles yet. Add a puzzle file to <code>data/</code> and list its
          id in <code>data/manifest.json</code>.
        </div>
      )}
      {!error && puzzles && puzzles.length > 0 && (
        <ul className="puzzle-list">
          {puzzles.map((p) => (
            <li key={p.id} className="puzzle-card">
              <button
                type="button"
                className="puzzle-card__button"
                onClick={() => onSelect(p.id)}
              >
                <span className="puzzle-card__title">{p.title}</span>
                <span className="puzzle-card__meta">
                  {p.size}&times;{p.size}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
