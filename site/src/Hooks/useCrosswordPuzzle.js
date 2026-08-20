import { useEffect, useState } from "react";
import { fetchJSON, normalizePuzzle } from "../utils/crossword";

// Fetches and normalizes a single puzzle by id.
export function useCrosswordPuzzle(id) {
  const [meta, setMeta] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setMeta(null);
    setError(null);

    fetchJSON("/data/manifest.json")
      .catch(() => null)
      .then((manifest) => {
        let titleOverride = null;
        if (manifest) {
          for (const item of manifest) {
            if (typeof item !== "string" && item.id === id) {
              titleOverride = item.title || null;
              break;
            }
          }
        }
        return fetchJSON(`/data/${id}.json`).then((raw) =>
          normalizePuzzle(raw, id, titleOverride),
        );
      })
      .then((normalized) => {
        if (!cancelled) setMeta(normalized);
      })
      .catch((err) => {
        if (!cancelled) setError(err);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  return { meta, error };
}
