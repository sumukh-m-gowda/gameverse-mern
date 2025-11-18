import React, { useState, useEffect, useRef } from "react";
import "./minesweeper.css";

const presets = {
  Beginner: { rows: 9, cols: 9, mines: 10 },
  Intermediate: { rows: 16, cols: 16, mines: 40 },
  Expert: { rows: 16, cols: 30, mines: 99 },
};

export default function Minesweeper() {
  const [mode, setMode] = useState("Beginner");
  const { rows, cols, mines } = presets[mode];

  const [board, setBoard] = useState(() => createEmptyBoard(rows, cols));
  const [live, setLive] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [time, setTime] = useState(0);
  const [flagsLeft, setFlagsLeft] = useState(mines);
  const [status, setStatus] = useState("ready");
  const timerRef = useRef(null);

  useEffect(() => { resetBoard(); }, [mode]);

  useEffect(() => {
    if (live && startTime) {
      timerRef.current = setInterval(() => {
        setTime(Math.floor((Date.now() - startTime) / 1000));
      }, 200);
    } else clearInterval(timerRef.current);
    return () => clearInterval(timerRef.current);
  }, [live, startTime]);

  function createEmptyBoard(r, c) {
    return Array.from({ length: r }, () =>
      Array.from({ length: c }, () => ({
        revealed: false,
        flag: false,
        mine: false,
        adjacent: 0,
      }))
    );
  }

  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }

  function placeMines(seedR, seedC) {
    const b = createEmptyBoard(rows, cols);
    const cells = [];

    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++) {
        const dr = Math.abs(r - seedR);
        const dc = Math.abs(c - seedC);
        if (dr <= 1 && dc <= 1) continue;
        cells.push([r, c]);
      }

    shuffle(cells);

    for (let i = 0; i < mines; i++) {
      const [r, c] = cells[i];
      b[r][c].mine = true;
    }

    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++)
        if (!b[r][c].mine) b[r][c].adjacent = countAdj(b, r, c);

    return b;
  }

  function countAdj(b, r, c) {
    let n = 0;
    for (let i = r - 1; i <= r + 1; i++)
      for (let j = c - 1; j <= c + 1; j++)
        if (i >= 0 && i < rows && j >= 0 && j < cols && b[i][j].mine) n++;
    return n;
  }

  function revealCell(r, c) {
    if (status === "lost" || status === "won") return;

    if (!live) {
      const newBoard = placeMines(r, c);
      setBoard(newBoard);
      setLive(true);
      setStartTime(Date.now());
      setStatus("playing");
      revealInternal(newBoard, r, c);
      setBoard(newBoard.map(row => row.map(cell => ({ ...cell }))));
      return;
    }

    const copy = board.map(row => row.map(cell => ({ ...cell })));
    revealInternal(copy, r, c);
    setBoard(copy);
    checkWin(copy);
  }

  function revealInternal(b, r, c) {
    const cell = b[r][c];
    if (cell.revealed || cell.flag) return;

    cell.revealed = true;

    if (cell.mine) {
      revealAllMines(b);
      setStatus("lost");
      setLive(false);
      return;
    }

    if (cell.adjacent === 0) {
      for (let i = r - 1; i <= r + 1; i++)
        for (let j = c - 1; j <= c + 1; j++)
          if (i >= 0 && i < rows && j >= 0 && j < cols)
            if (!b[i][j].revealed && !b[i][j].mine)
              revealInternal(b, i, j);
    }
  }

  function revealAllMines(b) {
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++)
        if (b[r][c].mine) b[r][c].revealed = true;
  }

  function toggleFlag(e, r, c) {
    e.preventDefault();
    if (!live || status !== "playing") return;

    const copy = board.map(row => row.map(cell => ({ ...cell })));
    const cell = copy[r][c];

    if (cell.revealed) return;

    if (cell.flag) {
      cell.flag = false;
      setFlagsLeft(f => f + 1);
    } else {
      if (flagsLeft <= 0) return;
      cell.flag = true;
      setFlagsLeft(f => f - 1);
    }

    setBoard(copy);
    checkWin(copy);
  }

  function checkWin(b) {
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++)
        if (!b[r][c].mine && !b[r][c].revealed) return;

    setStatus("won");
    setLive(false);
  }

  function resetBoard() {
    setBoard(createEmptyBoard(rows, cols));
    setLive(false);
    setStartTime(null);
    setTime(0);
    setFlagsLeft(mines);
    setStatus("ready");
  }

  function renderCell(cell, r, c) {
    let cls = "ms-cell pastel-dark";
    if ((r + c) % 2 === 0) cls += " tone-a";
    else cls += " tone-b";

    if (cell.revealed) cls += " revealed";
    if (cell.flag) cls += " flagged";
    if (status === "lost" && cell.mine && !cell.flag) cls += " exploded";

    return (
      <div
        key={`${r}-${c}`}
        className={cls}
        onClick={() => revealCell(r, c)}
        onContextMenu={(e) => toggleFlag(e, r, c)}
      >
        {cell.revealed && cell.mine && <span className="mine">💣</span>}
        {cell.revealed && !cell.mine && cell.adjacent > 0 && (
          <span className={`num num-${cell.adjacent}`}>{cell.adjacent}</span>
        )}
        {cell.flag && !cell.revealed && <span className="flag">🚩</span>}
      </div>
    );
  }

  return (
    <div className="ms-root pastel-dark-theme">
      <div className="ms-card">

        <header className="ms-header">
          <div className="ms-title">Minesweeper</div>

          <div className="ms-controls">
            <select value={mode} onChange={(e) => setMode(e.target.value)} disabled={live}>
              {Object.keys(presets).map((m) => (
                <option key={m}>{m}</option>
              ))}
            </select>

            <button onClick={resetBoard} className="ms-btn">Reset</button>

            <div className="ms-info">Flags: {flagsLeft}</div>
            <div className="ms-timer">Time: {time}s</div>
          </div>
        </header>

        <div className="ms-board" style={{ gridTemplateColumns: `repeat(${cols}, 38px)` }}>
          {board.map((row, r) => row.map((cell, c) => renderCell(cell, r, c)))}
        </div>

        <footer className="ms-footer">Pastel Dark Minesweeper — smooth & aesthetic</footer>
      </div>
    </div>
  );
}
