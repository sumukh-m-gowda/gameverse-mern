// src/pages/Home.jsx
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import "./Home.css";

export default function Home() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const username = localStorage.getItem("username");

    if (!token || !username) {
      navigate("/login");
    }
  }, [navigate]);

  const allGames = [
    { name: "Tic Tac Toe", icon: "/tictactoe.png", route: "/tictactoe" },
    { name: "Sudoku", icon: "/sudoku.png", route: "/sudoku" },
    { name: "Minesweeper", icon: "/minesweeper.jpg", route: "/minesweeper" },
    { name: "Rock Paper Scissors", icon: "/rockpaperscissor.png", route: "/rps" },
    { name: "Dice Roll", icon: "/dice.png", route: "/dice" },
    { name: "2048", icon: "/2048.png", route: "/2048" },
    { name: "Tower Defense", icon: "/tower.jpg", route: "/tower" },
    { name: "Hand Cricket", icon: "/handcricket.png", route: "/handcricket" }
  ];

  const getRandomGames = (count) => {
    const shuffled = [...allGames].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  const recentlyPlayedGames = getRandomGames(3);
  const topPicksGames = getRandomGames(3);

  return (
    <div className="home-container">

      <button
        onClick={() => {
          localStorage.removeItem("token");
          localStorage.removeItem("username");
          navigate("/login");
        }}
        className="logout-btn"
      >
        Logout
      </button>

      <div className="header">
        <h1>Pixel Playground</h1>
        <p>Explore. Play. Compete.</p>
      </div>

      <div className="section fade">
        <h3 className="sec-title">RECENTLY PLAYED</h3>
        <div className="game-row">
          {recentlyPlayedGames.map((game, i) => (
            <div
              key={i}
              className="game-card"
              onClick={() => navigate(game.route)}
              style={{ backgroundImage: `url(${game.icon})` }}
            >
              <div className="card-title">{game.name}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="section section-blue fade">
        <h3 className="sec-title">TOP PICKS FOR YOU</h3>
        <div className="game-row">
          {topPicksGames.map((game, i) => (
            <div
              key={i}
              className="game-card"
              onClick={() => navigate(game.route)}
              style={{ backgroundImage: `url(${game.icon})` }}
            >
              <div className="card-title">{game.name}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="section section-green fade">
        <h2 className="sec-title">ALL GAMES</h2>
        <div className="game-grid">
          {allGames.map((game, i) => (
            <div
              key={i}
              className="game-card"
              onClick={() => navigate(game.route)}
              style={{ backgroundImage: `url(${game.icon})` }}
            >
              <div className="card-title">{game.name}</div>
            </div>
          ))}
        </div>
      </div>

      <button
        className="back-btn"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      >
        Back to Top ↑
      </button>
    </div>
  );
}
