import React, { useEffect, useState, useCallback } from "react";
import "./game2048.css";

/*
  2048 (React)
  - 4x4 grid
  - Keyboard (Arrow keys / WASD) + touch swipe
  - Score & Best score (localStorage)
  - New Game button
  - Smooth spawn & merge animations (scale)
*/

const SIZE = 4;
const START_TILES = 2;
const STORAGE_KEY = "r2048_best";

function emptyGrid() {
  return Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
}

function cloneGrid(g) {
  return g.map((r) => r.slice());
}

function randomInt(n) {
  return Math.floor(Math.random() * n);
}

function addRandomTile(grid) {
  const empties = [];
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (grid[r][c] === 0) empties.push([r, c]);
    }
  }
  if (empties.length === 0) return false;
  const [r, c] = empties[randomInt(empties.length)];
  grid[r][c] = Math.random() < 0.9 ? 2 : 4;
  return true;
}

function rotateGrid(grid) {
  const newGrid = emptyGrid();
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++) newGrid[c][SIZE - 1 - r] = grid[r][c];
  return newGrid;
}

// slide and merge one row to left; returns {row, scoreGained, moved}
function slideAndMergeRow(row) {
  const arr = row.filter((v) => v !== 0);
  let moved = false;
  let scoreGained = 0;
  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i] === arr[i + 1]) {
      arr[i] = arr[i] * 2;
      scoreGained += arr[i];
      arr.splice(i + 1, 1);
      arr.push(0); // keep length
      moved = true;
    }
  }
  const newRow = arr.concat(Array(SIZE - arr.length).fill(0));
  if (newRow.some((v, i) => v !== row[i])) moved = true;
  return { row: newRow, scoreGained, moved };
}

function move(grid, direction) {
  // direction: 'left' | 'right' | 'up' | 'down'
  let rotated = cloneGrid(grid);
  let rotatedTimes = 0;
  if (direction === "up") {
    rotated = rotateGrid(grid); // 90
    rotatedTimes = 1;
  } else if (direction === "right") {
    rotated = rotateGrid(rotateGrid(grid)); // 180
    rotatedTimes = 2;
  } else if (direction === "down") {
    rotated = rotateGrid(rotateGrid(rotateGrid(grid))); // 270
    rotatedTimes = 3;
  } else {
    rotated = cloneGrid(grid);
    rotatedTimes = 0;
  }

  let movedAny = false;
  let scoreGained = 0;
  const newGrid = rotated.map((row) => {
    const { row: newRow, scoreGained: s, moved } = slideAndMergeRow(row);
    if (moved) movedAny = true;
    scoreGained += s;
    return newRow;
  });

  // rotate back
  let result = newGrid;
  for (let i = 0; i < (4 - rotatedTimes) % 4; i++) result = rotateGrid(result);
  return { grid: result, moved: movedAny, scoreGained };
}

function canMove(grid) {
  // if any zero or any adjacent equal
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (grid[r][c] === 0) return true;
      if (c < SIZE - 1 && grid[r][c] === grid[r][c + 1]) return true;
      if (r < SIZE - 1 && grid[r][c] === grid[r + 1][c]) return true;
    }
  }
  return false;
}

export default function Game2048() {
  const [grid, setGrid] = useState(() => {
    const g = emptyGrid();
    for (let i = 0; i < START_TILES; i++) addRandomTile(g);
    return g;
  });
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(() => {
    const v = localStorage.getItem(STORAGE_KEY);
    return v ? Number(v) : 0;
  });
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [tick, setTick] = useState(0); // force re-render for animations

  // helper to set grid and manage local state updates
  const updateGrid = useCallback(
    (newGrid, gained = 0) => {
      setGrid(newGrid);
      if (gained > 0) {
        setScore((s) => {
          const n = s + gained;
          if (n > best) {
            setBest(n);
            localStorage.setItem(STORAGE_KEY, String(n));
          }
          return n;
        });
      }
      setTick((t) => t + 1);
    },
    [best]
  );

  function newGame() {
    const g = emptyGrid();
    for (let i = 0; i < START_TILES; i++) addRandomTile(g);
    setGrid(g);
    setScore(0);
    setGameOver(false);
    setWon(false);
    setTick((t) => t + 1);
  }

  // move handler
  const handleMove = useCallback(
    (dir) => {
      if (gameOver || won) return;
      const { grid: newGrid, moved, scoreGained } = move(grid, dir);
      if (!moved) return;
      // add random tile
      addRandomTile(newGrid);
      updateGrid(newGrid, scoreGained);
      // win condition: 2048 tile
      if (newGrid.flat().some((v) => v === 2048)) setWon(true);
      else if (!canMove(newGrid)) setGameOver(true);
    },
    [grid, gameOver, won, updateGrid]
  );

  // keyboard
  useEffect(() => {
    function onKey(e) {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "w", "a", "s", "d"].includes(e.key)) {
        e.preventDefault();
      }
      if (e.key === "ArrowUp" || e.key === "w") handleMove("up");
      if (e.key === "ArrowLeft" || e.key === "a") handleMove("left");
      if (e.key === "ArrowRight" || e.key === "d") handleMove("right");
      if (e.key === "ArrowDown" || e.key === "s") handleMove("down");
      if ((e.key === "r" || e.key === "R") && (gameOver || won)) newGame();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleMove, gameOver, won]);

  // touch (swipe)
  useEffect(() => {
    let startX = 0;
    let startY = 0;
    let moved = false;
    function touchStart(e) {
      const t = e.touches[0];
      startX = t.clientX;
      startY = t.clientY;
      moved = false;
    }
    function touchMove(e) {
      moved = true;
    }
    function touchEnd(e) {
      if (!moved) return;
      const end = e.changedTouches[0];
      const dx = end.clientX - startX;
      const dy = end.clientY - startY;
      const absX = Math.abs(dx);
      const absY = Math.abs(dy);
      const threshold = 30;
      if (Math.max(absX, absY) < threshold) return;
      if (absX > absY) {
        if (dx > 0) handleMove("right");
        else handleMove("left");
      } else {
        if (dy > 0) handleMove("down");
        else handleMove("up");
      }
    }
    const el = document;
    el.addEventListener("touchstart", touchStart, { passive: true });
    el.addEventListener("touchmove", touchMove, { passive: true });
    el.addEventListener("touchend", touchEnd, { passive: true });
    return () => {
      el.removeEventListener("touchstart", touchStart);
      el.removeEventListener("touchmove", touchMove);
      el.removeEventListener("touchend", touchEnd);
    };
  }, [handleMove]);

  // convenience: clickable arrows (for mouse)
  function ArrowControls() {
    return (
      <div className="arrows">
        <button onClick={() => handleMove("up")}>↑</button>
        <div className="row">
          <button onClick={() => handleMove("left")}>←</button>
          <button onClick={() => handleMove("down")}>↓</button>
          <button onClick={() => handleMove("right")}>→</button>
        </div>
      </div>
    );
  }

  // render tiles with simple scale animation for new/merged tiles
  // We can track appearance by comparing previous tick, but for simplicity we animate all non-zero tiles with CSS class
  return (
    <div className="g2048-root">
      <div className="g2048-card">
        <header className="g2048-header">
          <div className="title">2048</div>
          <div className="controls">
            <div className="score">Score<br /><strong>{score}</strong></div>
            <div className="best">Best<br /><strong>{best}</strong></div>
            <button className="btn" onClick={newGame}>New Game</button>
          </div>
        </header>

        <div className={`board ${gameOver ? "game-over" : ""} ${won ? "won" : ""}`} role="application" aria-label="2048 board">
          {grid.map((row, r) => (
            <div key={r} className="board-row">
              {row.map((value, c) => {
                const cls = value === 0 ? "tile empty" : `tile tile-${value}`;
                return (
                  <div key={c} className={cls}>
                    {value !== 0 && <div className="tile-inner animate">{value}</div>}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        <div className="g2048-footer">
          <div className="info">
            <p>Use arrow keys / WASD or swipe to move. Merge tiles to reach 2048.</p>
          </div>
          <ArrowControls />
        </div>

        {gameOver && (
          <div className="overlay">
            <div className="overlay-card">
              <h2>Game Over</h2>
              <p>Your Score: {score}</p>
              <button className="btn" onClick={newGame}>Try Again</button>
            </div>
          </div>
        )}

        {won && (
          <div className="overlay">
            <div className="overlay-card">
              <h2>You Win!</h2>
              <p>Nice job — you made 2048.</p>
              <button className="btn" onClick={() => { setWon(false); }}>Continue</button>
              <button className="btn" onClick={newGame}>New Game</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
