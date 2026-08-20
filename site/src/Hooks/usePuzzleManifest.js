import { useEffect, useState } from "react";
import { fetchJSON } from "../utils/crossword";

// Loads data/manifest.json plus each listed puzzle's title/size for the
// puzzle list page.
export function usePuzzleManifest() {
  const [puzzles, setPuzzles] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    fetchJSON("/data/manifest.json")
      .then((data) => {
        const entries = data.map((item) =>
          typeof item === "string" ? { id: item } : item,
        );
        return Promise.all(
          entries.map((entry) =>
            fetchJSON(`/data/${entry.id}.json`)
              .then((raw) => ({
                id: entry.id,
                title: raw.title || entry.title || entry.id,
                size: raw.size,
              }))
              .catch((err) => {
                console.warn(`Skipping puzzle "${entry.id}": ${err.message}`);
                return null;
              }),
          ),
        );
      })
      .then((results) => {
        if (cancelled) return;
        setPuzzles(results.filter(Boolean));
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { puzzles, error };
}
