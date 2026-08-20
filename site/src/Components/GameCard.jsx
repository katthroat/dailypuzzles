import { NavLink } from "react-router";

export default function GameCard({ game }) {
  return (
    <NavLink to={"/"} className="game-card-link">
      <div className="game-card">
        <img src={game.image} alt={game.title + " icon"} />
        <h2>{game.title}</h2>
      </div>
    </NavLink>
  );
}
