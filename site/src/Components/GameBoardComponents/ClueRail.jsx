import ClueText from "./ClueText";

export default function ClueRail({ meta, solver }) {
  const { activeTab, setActiveTab, sel, activeClue, selectCell } = solver;

  return (
    <div className="clue-rail">
      <div className="clue-tabs" role="tablist">
        {["across", "down"].map((dir) => (
          <button
            key={dir}
            type="button"
            className="clue-tab"
            role="tab"
            aria-selected={activeTab === dir}
            onClick={() => setActiveTab(dir)}
          >
            {dir === "across" ? "Across" : "Down"}
          </button>
        ))}
      </div>
      <div className="clue-columns">
        {["across", "down"].map((dir) => (
          <div
            key={dir}
            className={`clue-group${activeTab === dir ? " is-visible" : ""}`}
            data-dir={dir}
          >
            <ul>
              {(dir === "across" ? meta.across : meta.down).map((clue) => (
                <li key={clue.number}>
                  <button
                    type="button"
                    className={`clue-item${activeClue?.number === clue.number && sel.dir === dir ? " is-active" : ""}`}
                    onClick={() => {
                      selectCell(clue.row, clue.col, false, dir);
                    }}
                  >
                    <span className="clue-item__num">{clue.number}</span>
                    <ClueText className="clue-item__text" text={clue.clue} />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
