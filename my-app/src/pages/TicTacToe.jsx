// TicTacToe.jsx (Plain CSS Version)
import React, { useState } from "react";
import "./ticTacToe.css";

export default function TicTacToe() {
  const emptyBoard = Array(9).fill(null);
  const [board, setBoard] = useState(emptyBoard);
  const [xIsNext, setXIsNext] = useState(true);
  const [history, setHistory] = useState([]);

  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  function calculateWinner(bd) {
    for (let [a, b, c] of lines) {
      if (bd[a] && bd[a] === bd[b] && bd[a] === bd[c]) {
        return { winner: bd[a], line: [a, b, c] };
      }
    }
    return null;
  }

  const result = calculateWinner(board);
  const isDraw = !result && board.every(Boolean);

  function handleClick(i) {
    if (board[i] || result) return;
    const newBoard = board.slice();
    newBoard[i] = xIsNext ? "X" : "O";
    setHistory(prev => [...prev, board.slice()]);
    setBoard(newBoard);
    setXIsNext(!xIsNext);
  }

  function restart() {
    setBoard(emptyBoard);
    setXIsNext(true);
    setHistory([]);
  }

  function undo() {
    if (!history.length) return;
    const prev = history[history.length - 1];
    setBoard(prev);
    setHistory(h => h.slice(0, h.length - 1));
    setXIsNext(prev => !prev);
  }

  return (
    <div className="ttt-container">
      <div className="ttt-card">
        <header className="ttt-header">
          <h1>Tic Tac Toe</h1>
          <div className="ttt-controls">
            <button onClick={undo}>Undo</button>
            <button onClick={restart} className="yellow-btn">Restart</button>
          </div>
        </header>

        <main className="ttt-main">
          <section className="ttt-board">
            <div className="grid-3">
              {board.map((_, i) => (
                <button
                  key={i}
                  onClick={() => handleClick(i)}
                  className={`square ${result && result.line.includes(i) ? "win" : ""}`}
                >
                  {board[i] === "X" && <span className="x-mark">X</span>}
                  {board[i] === "O" && <span className="o-mark">O</span>}
                </button>
              ))}
            </div>
          </section>

          <aside className="ttt-sidebar">
            {!result && !isDraw && (
              <div className="status-box">
                <p className="label">Next</p>
                <p className="status-text">{xIsNext ? "X (Yellow)" : "O (Blue)"}</p>
              </div>
            )}

            {result && (
              <div className="status-box">
                <p className="label">Winner</p>
                <p className="status-text winner-text">{result.winner} wins!</p>
              </div>
            )}

            {isDraw && (
              <div className="status-box">
                <p className="status-text">It's a draw!</p>
              </div>
            )}

            <div className="history-box">
              <p className="label">History</p>
              {history.length === 0 ? (
                <p className="no-moves">No moves yet</p>
              ) : (
                history.map((h, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setBoard(h.slice());
                      setHistory(history.slice(0, idx));
                    }}
                    className="history-btn"
                  >
                    Go to move {idx + 1}
                  </button>
                ))
              )}
            </div>
          </aside>
        </main>

        <footer className="ttt-footer">Tip: click a square to place. Undo reverts the last move.</footer>
      </div>
    </div>
  );
}




