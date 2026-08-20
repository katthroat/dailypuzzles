import { parseClueMarkup } from "../../utils/crossword";

// Renders clue text with *word* markup as <em>, without dangerouslySetInnerHTML.
export default function ClueText({ text, className }) {
  const parts = parseClueMarkup(text);
  return (
    <span className={className}>
      {parts.map((part, i) =>
        part.type === "em" ? (
          <em key={i}>{part.value}</em>
        ) : (
          <span key={i}>{part.value}</span>
        ),
      )}
    </span>
  );
}
