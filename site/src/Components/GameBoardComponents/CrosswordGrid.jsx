import CrosswordCell from "./CrosswordCell";

export default function CrosswordGrid({ meta, solver }) {
  const {
    size,
    cellInfo,
    sel,
    progress,
    inWordSet,
    isLocked,
    hiddenInputRef,
    selectCell,
    handleHiddenInput,
    handleKeyDown,
  } = solver;

  return (
    <div className="grid-pane">
      <div style={{ position: "relative" }}>
        <div
          className="crossword-grid"
          role="grid"
          aria-label={`${meta.title} crossword grid`}
          style={{
            gridTemplateColumns: `repeat(${size}, 1fr)`,
            gridTemplateRows: `repeat(${size}, 1fr)`,
          }}
          onClick={(e) => {
            if (
              e.currentTarget === e.target &&
              document.activeElement !== hiddenInputRef.current
            ) {
              hiddenInputRef.current?.focus({ preventScroll: true });
            }
          }}
        >
          {cellInfo.map((rowInfo, r) =>
            rowInfo.map((info, c) => (
              <CrosswordCell
                key={`${r}-${c}`}
                info={info}
                row={r}
                col={c}
                breakRight={meta.breaksRight?.[r]?.[c]}
                breakBottom={meta.breaksBottom?.[r]?.[c]}
                letter={progress.letters[r][c]}
                state={progress.states[r][c]}
                isActive={sel.row === r && sel.col === c}
                isInWord={inWordSet.has(`${r},${c}`)}
                isWordCorrect={isLocked(r, c)}
                onSelect={selectCell}
              />
            )),
          )}
        </div>
        <input
          ref={hiddenInputRef}
          type="text"
          className="sr-input"
          autoComplete="off"
          autoCapitalize="characters"
          autoCorrect="off"
          spellCheck="false"
          aria-hidden="true"
          onChange={(e) => {
            handleHiddenInput(e.target.value);
            e.target.value = "";
          }}
          onKeyDown={handleKeyDown}
        />
      </div>
    </div>
  );
}
