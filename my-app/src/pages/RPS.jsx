import React, { useState, useEffect } from "react";
import "./rps.css";

/*
 Premium Rock-Paper-Scissors — Soft Aesthetic Game Style
 - Horizontal premium layout: player card (left) vs bot card (right)
 - Big glossy buttons, soft neon glow, smooth animations
 - VS center animation, result banner, winner highlight
 - Responsive: stacks on small screens
*/

const OPTIONS = [
  { id: "rock", label: "Rock", emoji: "✊", color: "var(--pink)" },
  { id: "paper", label: "Paper", emoji: "✋", color: "var(--orange)" },
  { id: "scissor", label: "Scissor", emoji: "✌️", color: "var(--green)" },
];

function decideWinner(player, bot) {
  if (player === bot) return "draw";
  if (
    (player === "rock" && bot === "scissor") ||
    (player === "paper" && bot === "rock") ||
    (player === "scissor" && bot === "paper")
  ) return "player";
  return "bot";
}

export default function RockPaperScissor() {
  const [playerPick, setPlayerPick] = useState(null);
  const [botPick, setBotPick] = useState(null);
  const [result, setResult] = useState(null); // 'player' | 'bot' | 'draw' | null
  const [showResult, setShowResult] = useState(false);
  const [scores, setScores] = useState({ player: 0, bot: 0, draws: 0 });
  const [animateVs, setAnimateVs] = useState(false);

  useEffect(() => {
    if (result) {
      setShowResult(true);
      const t = setTimeout(() => setShowResult(false), 2000);
      return () => clearTimeout(t);
    }
  }, [result]);

  function play(choiceId) {
    // micro animation reset
    setAnimateVs(true);
    setPlayerPick(choiceId);
    setBotPick(null);
    setResult(null);

    // tiny delay to animate
    setTimeout(() => {
      const bot = OPTIONS[Math.floor(Math.random() * OPTIONS.length)].id;
      setBotPick(bot);
      const winner = decideWinner(choiceId, bot);
      setResult(winner);
      setAnimateVs(false);

      setScores((s) => {
        if (winner === "player") return { ...s, player: s.player + 1 };
        if (winner === "bot") return { ...s, bot: s.bot + 1 };
        return { ...s, draws: s.draws + 1 };
      });
    }, 420);
  }

  function resetMatch() {
    setPlayerPick(null);
    setBotPick(null);
    setResult(null);
    setShowResult(false);
    setAnimateVs(false);
    setScores({ player: 0, bot: 0, draws: 0 });
  }

  function getOption(optId) {
    return OPTIONS.find((o) => o.id === optId) || null;
  }

  return (
    <div className="rps-premium-root">
      <div className="rps-premium-card">
        {/* Header */}
        <header className="rps-premium-header">
          <div className="brand">
            <div className="logo">RPS</div>
            <div className="title">Rock • Paper • Scissors</div>
          </div>

          <div className="scoreboard">
            <div className="score score-player">
              <div className="score-label">You</div>
              <div className="score-value">{scores.player}</div>
            </div>
            <div className="score score-draws">
              <div className="score-label">Draws</div>
              <div className="score-value">{scores.draws}</div>
            </div>
            <div className="score score-bot">
              <div className="score-label">Bot</div>
              <div className="score-value">{scores.bot}</div>
            </div>
          </div>
        </header>

        {/* Main content: left player card, center vs, right bot card */}
        <main className="rps-main">
          {/* Player Card */}
          <section
            className={`card card-player ${result === "player" ? "winner" : ""} ${
              result === "bot" ? "loser" : ""
            }`}
            aria-live="polite"
          >
            <div className="card-title">You</div>

            <div className="pick-display">
              {playerPick ? (
                <>
                  <div className="pick-emoji">{getOption(playerPick).emoji}</div>
                  <div className="pick-label">{getOption(playerPick).label}</div>
                </>
              ) : (
                <div className="pick-empty">Make a pick</div>
              )}
            </div>

            <div className="controls">
              {OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  className={`control-btn control-${opt.id}`}
                  onClick={() => play(opt.id)}
                  aria-pressed={playerPick === opt.id}
                >
                  <div className="control-emoji">{opt.emoji}</div>
                  <div className="control-text">{opt.label}</div>
                </button>
              ))}
            </div>
          </section>

          {/* VS / Result Center */}
          <section className="center">
            <div className={`vs-bubble ${animateVs ? "pulse" : ""}`}>
              <div className="vs-text">⚡ VS ⚡</div>
            </div>

            <div className={`result-banner ${showResult ? "show" : ""} ${result ? result : ""}`}>
              {result === "player" && <div className="result-inner win">You Win!</div>}
              {result === "bot" && <div className="result-inner lose">You Lose</div>}
              {result === "draw" && <div className="result-inner draw">Draw</div>}
            </div>

            <div className="preview-row">
              <div className="preview-column">
                <div className="preview-title">You picked</div>
                <div className="preview-box">
                  {playerPick ? (
                    <>
                      <div className="preview-emoji">{getOption(playerPick).emoji}</div>
                      <div className="preview-label">{getOption(playerPick).label}</div>
                    </>
                  ) : (
                    <div className="preview-empty">—</div>
                  )}
                </div>
              </div>

              <div className="preview-column">
                <div className="preview-title">Bot picked</div>
                <div className="preview-box">
                  {botPick ? (
                    <>
                      <div className="preview-emoji">{getOption(botPick).emoji}</div>
                      <div className="preview-label">{getOption(botPick).label}</div>
                    </>
                  ) : (
                    <div className="preview-empty">—</div>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Bot Card */}
          <section
            className={`card card-bot ${result === "bot" ? "winner" : ""} ${
              result === "player" ? "loser" : ""
            }`}
            aria-live="polite"
          >
            <div className="card-title">Bot</div>

            <div className="pick-display">
              {botPick ? (
                <>
                  <div className="pick-emoji">{getOption(botPick).emoji}</div>
                  <div className="pick-label">{getOption(botPick).label}</div>
                </>
              ) : (
                <div className="pick-empty">Waiting</div>
              )}
            </div>

            <div className="bot-note">Smart-ish AI</div>
            <div className="muted-actions">
              <button className="muted-btn" onClick={() => play(OPTIONS[Math.floor(Math.random() * OPTIONS.length)].id)}>
                Quick Play
              </button>
              <button className="muted-btn" onClick={resetMatch}>
                Reset Match
              </button>
            </div>
          </section>
        </main>

        <footer className="rps-premium-footer">
          Premium Soft Aesthetic — smooth animations, responsive, bright accents.
        </footer>
      </div>
    </div>
  );
}
