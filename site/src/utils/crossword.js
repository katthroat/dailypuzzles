// Shared crossword data helpers: fetching puzzle JSON and normalizing it into
// the shape the solver needs (numbering, per-clue row/col, etc.)

export function fetchJSON(url) {
  return fetch(url, { cache: "no-store" }).then((res) => {
    if (!res.ok) throw new Error("Failed to load " + url);
    return res.json();
  });
}

/*
 * data/<id>.json can be either:
 *   (a) a raw export straight from a crossword-making program -
 *       just { size, grid, breaksRight, breaksBottom, across, down },
 *       where "across"/"down" clues only carry a number/length/answer/clue
 *       (no row/col yet), OR
 *   (b) an already-normalized puzzle, which already has "blocks",
 *       "numbers", and row/col on every clue.
 *
 * Either way, this derives the same in-memory shape the solver uses:
 * standard crossword numbering, computed purely from the grid's block
 * layout, with every clue matched up to its starting cell.
 */
export function normalizePuzzle(raw, id, titleOverride) {
  const size = raw.size;
  const grid = raw.grid;
  if (!size || !Array.isArray(grid)) {
    throw new Error("missing size/grid in data/" + id + ".json");
  }

  const alreadyNormalized =
    Array.isArray(raw.blocks) &&
    Array.isArray(raw.numbers) &&
    raw.across &&
    raw.across.length &&
    typeof raw.across[0].row === "number";

  let blocks, numbers, across, down;

  if (alreadyNormalized) {
    blocks = raw.blocks;
    numbers = raw.numbers;
    across = raw.across;
    down = raw.down || [];
  } else {
    const isBlock = (r, c) => grid[r][c] === "#";
    numbers = [];
    for (let r = 0; r < size; r++) numbers.push(new Array(size).fill(null));
    blocks = grid.map((row) => row.map((cell) => cell === "#"));

    let counter = 0;
    const acrossStarts = [];
    const downStarts = [];
    for (let rr = 0; rr < size; rr++) {
      for (let cc = 0; cc < size; cc++) {
        if (isBlock(rr, cc)) continue;
        const startsAcross =
          (cc === 0 || isBlock(rr, cc - 1)) &&
          cc + 1 < size &&
          !isBlock(rr, cc + 1);
        const startsDown =
          (rr === 0 || isBlock(rr - 1, cc)) &&
          rr + 1 < size &&
          !isBlock(rr + 1, cc);
        if (startsAcross || startsDown) {
          counter += 1;
          numbers[rr][cc] = counter;
          if (startsAcross)
            acrossStarts.push({ number: counter, row: rr, col: cc });
          if (startsDown)
            downStarts.push({ number: counter, row: rr, col: cc });
        }
      }
    }

    const attachPositions = (clueList, starts, dir) => {
      const byNumber = {};
      starts.forEach((s) => {
        byNumber[s.number] = s;
      });
      return (clueList || []).map((clue) => {
        const pos = byNumber[clue.number];
        if (!pos) {
          throw new Error(
            "couldn't match " +
              dir +
              " clue #" +
              clue.number +
              " in data/" +
              id +
              ".json to the grid - its block layout may not match the clue list",
          );
        }
        return {
          number: clue.number,
          row: pos.row,
          col: pos.col,
          length: clue.length,
          answer: clue.answer,
          clue: clue.clue,
        };
      });
    };

    across = attachPositions(raw.across, acrossStarts, "across");
    down = attachPositions(raw.down, downStarts, "down");
  }

  return {
    id,
    title: raw.title || titleOverride || id,
    size,
    blocks,
    breaksRight: raw.breaksRight || null,
    breaksBottom: raw.breaksBottom || null,
    numbers,
    across,
    down,
    grid,
  };
}

export function wordCells(clue, dir) {
  const cells = [];
  for (let i = 0; i < clue.length; i++) {
    cells.push(
      dir === "across" ? [clue.row, clue.col + i] : [clue.row + i, clue.col],
    );
  }
  return cells;
}

// Clue text markup: *word* or *phrase* -> italics. Returns an array of
// React-renderable parts instead of raw HTML, so no dangerouslySetInnerHTML
// is needed.
export function parseClueMarkup(text) {
  const parts = [];
  const source = text || "";
  const re = /\*([^*]+)\*/g;
  let lastIndex = 0;
  let match;
  while ((match = re.exec(source))) {
    if (match.index > lastIndex)
      parts.push({ type: "text", value: source.slice(lastIndex, match.index) });
    parts.push({ type: "em", value: match[1] });
    lastIndex = re.lastIndex;
  }
  if (lastIndex < source.length)
    parts.push({ type: "text", value: source.slice(lastIndex) });
  return parts;
}
