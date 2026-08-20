export default function CrosswordCell({
  info,
  row,
  col,
  breakRight,
  breakBottom,
  letter,
  state,
  isActive,
  isInWord,
  isWordCorrect,
  onSelect,
}) {
  if (info.block) {
    return <div className="cell block" />;
  }

  const classNames = ["cell"];
  if (isInWord) classNames.push("in-word");
  if (isActive) classNames.push("active-cell");
  if (state === "revealed") classNames.push("state-revealed");
  if (isWordCorrect) classNames.push("word-correct");
  if (breakRight) classNames.push("break-right");
  if (breakBottom) classNames.push("break-bottom");

  return (
    <div
      className={classNames.join(" ")}
      role="gridcell"
      tabIndex={-1}
      onClick={() => onSelect(row, col)}
    >
      {info.number && <span className="cell__number">{info.number}</span>}
      <span className="cell__letter">{letter}</span>
    </div>
  );
}
