import { useLayoutEffect, useRef } from "react";
import ClueText from "./ClueText";

const CLUE_TEXT_MIN_PX = 12;

export default function ClueBar({ solver }) {
  const { sel, activeClue, cellInfo, selectCell } = solver;
  const textRef = useRef(null);

  // Shrink-to-fit instead of wrap, matching the original solver's behavior.
  useLayoutEffect(() => {
    const el = textRef.current;
    if (!el) return;
    el.classList.remove("wrap");
    el.style.fontSize = "";
    let size = parseFloat(getComputedStyle(el).fontSize);
    let guard = 0;
    while (
      el.scrollWidth > el.clientWidth + 1 &&
      size > CLUE_TEXT_MIN_PX &&
      guard < 40
    ) {
      size -= 0.5;
      el.style.fontSize = size + "px";
      guard++;
    }
    if (el.scrollWidth > el.clientWidth + 1) el.classList.add("wrap");
  }, [activeClue, sel.dir]);

  const info = cellInfo[sel.row]?.[sel.col];
  const otherDir = sel.dir === "across" ? "down" : "across";
  const hasOther = sel.dir === "across" ? !!info?.down : !!info?.across;

  return (
    <div className="clue-bar">
      <span className="clue-bar__num">
        {activeClue ? activeClue.number : ""}
      </span>
      <span className="clue-bar__dir">{activeClue ? sel.dir : ""}</span>
      <ClueText
        className="clue-bar__text"
        text={activeClue ? activeClue.clue : ""}
      />
      <button
        type="button"
        className="dir-toggle"
        style={{ visibility: hasOther ? "visible" : "hidden" }}
        onClick={() => selectCell(sel.row, sel.col, true)}
      >
        Switch to {otherDir === "across" ? "\u2192" : "\u2193"}
      </button>
    </div>
  );
}
