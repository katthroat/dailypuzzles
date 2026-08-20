import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { wordCells } from "../utils/crossword";
import { freezeScrollBriefly } from "../utils/scrollFreeze";

function loadProgress(storageKey, size) {
  try {
    const raw = localStorage.getItem(storageKey);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore corrupt/unavailable storage */
  }
  return {
    letters: Array.from({ length: size }, () => new Array(size).fill("")),
    states: Array.from({ length: size }, () => new Array(size).fill("")),
    hintsUsed: 0,
    solved: false,
    highlightCorrect: false,
  };
}

function firstOpenCell(size, cellInfo) {
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (!cellInfo[r][c].block) return { row: r, col: c };
    }
  }
  return { row: 0, col: 0 };
}

// Owns all solver state (letters, selection, hints, highlighting) for a
// single normalized puzzle `meta`, mirroring the original vanilla-JS
// solver's behavior.
export function useCrosswordSolver(meta) {
  const size = meta.size;
  const storageKey = `xw-progress:${meta.id}`;
  const hiddenInputRef = useRef(null);

  const cellInfo = useMemo(() => {
    const info = [];
    for (let r = 0; r < size; r++) {
      info.push([]);
      for (let c = 0; c < size; c++) {
        info[r].push({
          block: meta.blocks[r][c],
          number: meta.numbers[r][c],
          across: null,
          down: null,
        });
      }
    }
    meta.across.forEach((clue) => {
      for (let i = 0; i < clue.length; i++)
        info[clue.row][clue.col + i].across = { clue, idx: i };
    });
    meta.down.forEach((clue) => {
      for (let i = 0; i < clue.length; i++)
        info[clue.row + i][clue.col].down = { clue, idx: i };
    });
    return info;
  }, [meta]);

  const [progress, setProgress] = useState(() =>
    loadProgress(storageKey, size),
  );
  const [sel, setSel] = useState(() => ({
    ...firstOpenCell(size, cellInfo),
    dir: "across",
  }));
  const [activeTab, setActiveTab] = useState("across");
  const [solvedBannerShown, setSolvedBannerShown] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(progress));
    } catch {
      /* storage unavailable */
    }
  }, [progress, storageKey]);

  useEffect(() => {
    if (progress.solved) setSolvedBannerShown(true);
  }, [progress.solved]);

  const answerAt = useCallback((row, col) => meta.grid[row][col], [meta]);

  // A cell is "locked" (uneditable, but still selectable) once
  // highlightCorrect is on and the word it belongs to is fully correct.
  const wordCorrectSet = useMemo(() => {
    const set = new Set();
    if (!progress.highlightCorrect) return set;
    [
      [meta.across, "across"],
      [meta.down, "down"],
    ].forEach(([clues, dir]) => {
      clues.forEach((clue) => {
        const cells = wordCells(clue, dir);
        const filled = cells.every(([r, c]) => !!progress.letters[r][c]);
        const correct =
          filled &&
          cells.every(([r, c]) => progress.letters[r][c] === answerAt(r, c));
        if (correct) cells.forEach(([r, c]) => set.add(`${r},${c}`));
      });
    });
    return set;
  }, [meta, progress.letters, progress.highlightCorrect, answerAt]);

  const isLocked = useCallback(
    (row, col) => wordCorrectSet.has(`${row},${col}`),
    [wordCorrectSet],
  );

  const activeClue = useMemo(() => {
    const info = cellInfo[sel.row]?.[sel.col];
    if (!info) return null;
    return sel.dir === "across"
      ? (info.across?.clue ?? null)
      : (info.down?.clue ?? null);
  }, [cellInfo, sel]);

  const inWordSet = useMemo(() => {
    const set = new Set();
    if (activeClue)
      wordCells(activeClue, sel.dir).forEach(([r, c]) => set.add(`${r},${c}`));
    return set;
  }, [activeClue, sel.dir]);

  function selectCell(row, col, allowToggle, forceDir) {
    if (cellInfo[row][col].block) return;
    freezeScrollBriefly();
    setSel((prev) => {
      const info = cellInfo[row][col];
      let dir = forceDir || prev.dir;
      if (!forceDir) {
        if (allowToggle && prev.row === row && prev.col === col) {
          if (dir === "across" && info.down) dir = "down";
          else if (dir === "down" && info.across) dir = "across";
        } else {
          if (dir === "across" && !info.across && info.down) dir = "down";
          if (dir === "down" && !info.down && info.across) dir = "across";
        }
      }
      return { row, col, dir };
    });
    if (hiddenInputRef.current) {
      hiddenInputRef.current.value = "";
      if (document.activeElement !== hiddenInputRef.current) {
        hiddenInputRef.current.focus({ preventScroll: true });
      }
    }
  }

  useEffect(() => {
    setActiveTab(sel.dir);
  }, [sel.dir]);

  function step(row, col, dRow, dCol) {
    let r = row + dRow;
    let c = col + dCol;
    while (r >= 0 && r < size && c >= 0 && c < size) {
      if (!cellInfo[r][c].block && !isLocked(r, c)) return [r, c];
      r += dRow;
      c += dCol;
    }
    return null;
  }

  function moveInDir(forward) {
    const dRow = sel.dir === "down" ? (forward ? 1 : -1) : 0;
    const dCol = sel.dir === "across" ? (forward ? 1 : -1) : 0;
    const next = step(sel.row, sel.col, dRow, dCol);
    if (next) {
      selectCell(next[0], next[1], false);
      return true;
    }
    return false;
  }

  function jumpClue(forward, landAtEnd) {
    const clues = activeTab === "across" ? meta.across : meta.down;
    const idx = activeClue
      ? clues.findIndex((c) => c.number === activeClue.number)
      : -1;
    for (let i = 1; i <= clues.length; i++) {
      const nextIdx =
        (((idx + (forward ? i : -i)) % clues.length) + clues.length) %
        clues.length;
      const target = clues[nextIdx];
      if (!isLocked(target.row, target.col)) {
        setSel((prev) => ({ ...prev, dir: activeTab }));
        if (landAtEnd) {
          const cells = wordCells(target, activeTab);
          const last = cells[cells.length - 1];
          selectCell(last[0], last[1], false);
        } else {
          selectCell(target.row, target.col, false);
        }
        return;
      }
    }
  }

  function moveArrow(key) {
    const deltas = {
      ArrowUp: [-1, 0, "down"],
      ArrowDown: [1, 0, "down"],
      ArrowLeft: [0, -1, "across"],
      ArrowRight: [0, 1, "across"],
    };
    const d = deltas[key];
    if (!d) return;
    setSel((prev) => ({ ...prev, dir: d[2] }));
    const next = step(sel.row, sel.col, d[0], d[1]);
    if (next) selectCell(next[0], next[1], false);
  }

  function setLetter(row, col, letter) {
    if (isLocked(row, col)) return;
    setProgress((prev) => {
      const letters = prev.letters.map((r) => r.slice());
      const states = prev.states.map((r) => r.slice());
      letters[row][col] = letter;
      states[row][col] = "";
      return { ...prev, letters, states };
    });
  }

  function advanceAfterEntry() {
    if (!moveInDir(true)) jumpClue(true);
  }

  function retreatBeforeDelete() {
    if (!moveInDir(false)) jumpClue(false, true);
  }

  function checkCompletion(letters) {
    let allFilled = true;
    for (let r = 0; r < size && allFilled; r++) {
      for (let c = 0; c < size; c++) {
        if (!cellInfo[r][c].block && !letters[r][c]) {
          allFilled = false;
          break;
        }
      }
    }
    if (!allFilled) return;
    let allCorrect = true;
    for (let r = 0; r < size && allCorrect; r++) {
      for (let c = 0; c < size; c++) {
        if (!cellInfo[r][c].block && letters[r][c] !== answerAt(r, c)) {
          allCorrect = false;
          break;
        }
      }
    }
    if (allCorrect) setProgress((prev) => ({ ...prev, solved: true }));
  }

  function handleHiddenInput(value) {
    freezeScrollBriefly();
    const letters = value.toUpperCase().replace(/[^A-Z]/g, "");
    if (!letters) return;
    const ch = letters.charAt(letters.length - 1);
    setLetter(sel.row, sel.col, ch);
    advanceAfterEntry();
    checkCompletion(
      progress.letters.map((r, ri) =>
        r.map((v, ci) => (ri === sel.row && ci === sel.col ? ch : v)),
      ),
    );
  }

  function handleKeyDown(e) {
    if (e.key === "Backspace") {
      e.preventDefault();
      if (!isLocked(sel.row, sel.col) && progress.letters[sel.row][sel.col]) {
        setLetter(sel.row, sel.col, "");
      } else {
        retreatBeforeDelete();
        setLetter(sel.row, sel.col, "");
      }
    } else if (e.key === "Delete") {
      e.preventDefault();
      setLetter(sel.row, sel.col, "");
    } else if (e.key.indexOf("Arrow") === 0) {
      e.preventDefault();
      moveArrow(e.key);
    } else if (e.key === "Tab") {
      e.preventDefault();
      jumpClue(!e.shiftKey);
    } else if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      selectCell(sel.row, sel.col, true);
    }
  }

  function revealCell(row, col) {
    if (isLocked(row, col)) return;
    const letter = answerAt(row, col);
    setProgress((prev) => {
      const letters = prev.letters.map((r) => r.slice());
      const states = prev.states.map((r) => r.slice());
      letters[row][col] = letter;
      states[row][col] = "revealed";
      return { ...prev, letters, states, hintsUsed: (prev.hintsUsed || 0) + 1 };
    });
  }

  function revealCurrent() {
    revealCell(sel.row, sel.col);
    advanceAfterEntry();
  }

  function toggleHighlight() {
    setProgress((prev) => ({
      ...prev,
      highlightCorrect: !prev.highlightCorrect,
    }));
  }

  useEffect(() => {
    checkCompletion(progress.letters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress.letters]);

  return {
    size,
    cellInfo,
    sel,
    activeTab,
    setActiveTab,
    activeClue,
    inWordSet,
    isLocked,
    progress,
    hiddenInputRef,
    solvedBannerShown,
    selectCell,
    moveArrow,
    jumpClue,
    handleHiddenInput,
    handleKeyDown,
    revealCurrent,
    toggleHighlight,
  };
}
