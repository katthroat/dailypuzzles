import ProgressBar from "../Components/ProgressBar.jsx";
import GameCard from "../Components/GameCard.jsx";
import placeholderImage from "../img/placeholder.png";
export default function Home() {
  return (
    <div>
      <header className="home-header">
        <h3>Selected-Date</h3>
        <ProgressBar />
        <button className="calender-button" data-nav-calendar>
          <span className="material-symbols-outlined">calendar_month</span>
        </button>
      </header>
      <div className="game-card-grid">
        <GameCard
          game={{
            title: "Crossword",
            image: placeholderImage,
          }}
        />
      </div>
    </div>
  );
}
