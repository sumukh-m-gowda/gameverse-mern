import React, { useState, useEffect } from "react";
import "./dice.css";

// Rainbow palette for dice
const RAINBOW = [
  "#ff6b6b", // red
  "#ff9f43", // orange
  "#feca57", // yellow
  "#1dd1a1", // green
  "#54a0ff", // blue
  "#5f27cd"  // purple
];

export default function DiceGame() {
  const [playerScore, setPlayerScore] = useState(0);
  const [botScore, setBotScore] = useState(0);

  const [playerRoll, setPlayerRoll] = useState(null);
  const [botRoll, setBotRoll] = useState(null);

  const [playerColor, setPlayerColor] = useState("#fff");
  const [botColor, setBotColor] = useState("#fff");

  const [turn, setTurn] = useState("player"); // player or bot
  const [winner, setWinner] = useState(null);
  const [rolling, setRolling] = useState(false);

  const [spinClass, setSpinClass] = useState("");

  useEffect(() => {
    if (winner) return;
    if (turn === "bot") {
      setTimeout(() => rollDice("bot"), 600);
    }
  }, [turn]);

  function getRandomColor() {
    return RAINBOW[Math.floor(Math.random() * RAINBOW.length)];
  }

  function rollDice(who) {
    if (rolling || winner) return;

    setRolling(true);
    setSpinClass("spin-fast"); // add spin animation

    const value = Math.floor(Math.random() * 6) + 1;
    const color = getRandomColor();

    setTimeout(() => {
      if (who === "player") {
        setPlayerRoll(value);
        setPlayerColor(color);
        setPlayerScore((s) => {
          const total = s + value;
          if (total >= 50) setWinner("player");
          return total;
        });
        setTurn("bot");
      } else {
        setBotRoll(value);
        setBotColor(color);
        setBotScore((s) => {
          const total = s + value;
          if (total >= 50) setWinner("bot");
          return total;
        });
        setTurn("player");
      }

      setSpinClass(""); // remove animation
      setRolling(false);
    }, 450);
  }

  function resetGame() {
    setPlayerScore(0);
    setBotScore(0);
    setPlayerRoll(null);
    setBotRoll(null);
    setPlayerColor("#fff");
    setBotColor("#fff");
    setTurn("player");
    setWinner(null);
    setRolling(false);
  }

  return (
    <div className="dice-root">
      <div className="dice-card">

        <header className="dice-header">
          <h1 className="dice-title">Dice Battle</h1>
          <div className="dice-sub">Rainbow Dice • Fast Spin</div>
        </header>

        {winner && (
          <div className={`winner-banner ${winner}`}>
            {winner === "player" ? "You Win!" : "Bot Wins!"}
          </div>
        )}

        <div className="battle-area">

          {/* Player */}
          <div className={`side player ${turn === "player" ? "active" : ""}`}>
            <div className="side-title">You</div>

            <div className="dice-display">
              <div
                className={`dice-box ${spinClass}`}
                style={{ background: playerColor }}
              >
                {playerRoll || "–"}
              </div>
            </div>

            <div className="score-box">
              Score: <strong>{playerScore}</strong>
            </div>

            <button
              className="roll-btn player-btn"
              disabled={turn !== "player" || rolling || winner}
              onClick={() => rollDice("player")}
            >
              Roll Dice
            </button>
          </div>

          {/* VS */}
          <div className="vs">⚡</div>

          {/* Bot */}
          <div className={`side bot ${turn === "bot" ? "active" : ""}`}>
            <div className="side-title">Bot</div>

            <div className="dice-display">
              <div
                className={`dice-box ${spinClass}`}
                style={{ background: botColor }}
              >
                {botRoll || "–"}
              </div>
            </div>

            <div className="score-box">
              Score: <strong>{botScore}</strong>
            </div>

            <button className="roll-btn bot-btn" disabled>
              Bot Rolling...
            </button>
          </div>
        </div>

        <footer className="footer">
          <button className="reset-btn" onClick={resetGame}>
            Reset Game
          </button>
        </footer>

      </div>
    </div>
  );
}
