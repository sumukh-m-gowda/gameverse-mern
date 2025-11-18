import React, { useState, useEffect, useRef } from 'react';
import './sudoku.css';

// Sudoku.jsx — playable Sudoku with validation, solver and a UNIQUE-puzzle generator (integrated)
// Theme: black & grey. Plain CSS in sudoku.css (same as before, small additions included below)

export default function Sudoku() {
  // If you want a fixed starter puzzle, leave initialPuzzle; otherwise generator will create one.
  const starter = null; // set to null to generate at start, or set a 9x9 array like previous initialPuzzle

  const [board, setBoard] = useState(() => starter ? cloneBoard(starter) : emptyBoard());
  const [fixed, setFixed] = useState(() => starter ? getFixed(starter) : getFixed(emptyBoard()));
  const [selected, setSelected] = useState({ r: -1, c: -1 });
  const [message, setMessage] = useState('');
  const [solution, setSolution] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [difficulty, setDifficulty] = useState('medium');
  const generateAbortRef = useRef(false);

  useEffect(() => {
    if (starter) {
      const sol = solve(cloneBoard(starter));
      setSolution(sol);
    } else {
      // generate initial puzzle on mount
      generateNewPuzzle(difficulty);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // -------------------- helpers --------------------
  function emptyBoard() { return Array.from({ length: 9 }, () => Array(9).fill(0)); }
  function cloneBoard(b) { return b.map(row => row.slice()); }
  function getFixed(puzzle) { return puzzle.map(row => row.map(cell => (cell !== 0))); }

  // -------------------- solver (returns solved board or null) --------------------
  function solve(bd) {
    const boardCopy = cloneBoard(bd);
    function findEmpty() {
      for (let i = 0; i < 9; i++) for (let j = 0; j < 9; j++) if (boardCopy[i][j] === 0) return [i, j];
      return null;
    }
    function canPlace(r, c, v) {
      for (let k = 0; k < 9; k++) if (boardCopy[r][k] === v) return false;
      for (let k = 0; k < 9; k++) if (boardCopy[k][c] === v) return false;
      const br = Math.floor(r / 3) * 3, bc = Math.floor(c / 3) * 3;
      for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) if (boardCopy[br + i][bc + j] === v) return false;
      return true;
    }
    function backtrack() {
      const emp = findEmpty();
      if (!emp) return true;
      const [r, c] = emp;
      // random order for variety
      const vals = shuffleArray([1,2,3,4,5,6,7,8,9]);
      for (let v of vals) {
        if (canPlace(r, c, v)) {
          boardCopy[r][c] = v;
          if (backtrack()) return true;
          boardCopy[r][c] = 0;
        }
      }
      return false;
    }
    if (backtrack()) return boardCopy;
    return null;
  }

  // Count number of solutions up to a limit (early exit when count >= limit)
  function countSolutions(bd, limit = 2) {
    const boardCopy = cloneBoard(bd);
    let count = 0;
    function findEmpty() {
      for (let i = 0; i < 9; i++) for (let j = 0; j < 9; j++) if (boardCopy[i][j] === 0) return [i, j];
      return null;
    }
    function canPlace(r, c, v) {
      for (let k = 0; k < 9; k++) if (boardCopy[r][k] === v) return false;
      for (let k = 0; k < 9; k++) if (boardCopy[k][c] === v) return false;
      const br = Math.floor(r / 3) * 3, bc = Math.floor(c / 3) * 3;
      for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) if (boardCopy[br + i][bc + j] === v) return false;
      return true;
    }
    function backtrack() {
      if (count >= limit) return; // early stop
      const emp = findEmpty();
      if (!emp) {
        count++;
        return;
      }
      const [r, c] = emp;
      for (let v = 1; v <= 9; v++) {
        if (canPlace(r, c, v)) {
          boardCopy[r][c] = v;
          backtrack();
          boardCopy[r][c] = 0;
          if (count >= limit) return;
        }
      }
    }
    backtrack();
    return count;
  }

  // -------------------- generator --------------------
  // Generate a full valid solved board
  function generateFullSolution() {
    const b = emptyBoard();
    function canPlace(boardLocal, r, c, v) {
      for (let k = 0; k < 9; k++) if (boardLocal[r][k] === v) return false;
      for (let k = 0; k < 9; k++) if (boardLocal[k][c] === v) return false;
      const br = Math.floor(r / 3) * 3, bc = Math.floor(c / 3) * 3;
      for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) if (boardLocal[br + i][bc + j] === v) return false;
      return true;
    }
    function fillCell(boardLocal, idx = 0) {
      if (idx >= 81) return true;
      const r = Math.floor(idx / 9), c = idx % 9;
      // try numbers in random order
      const vals = shuffleArray([1,2,3,4,5,6,7,8,9]);
      for (let v of vals) {
        if (canPlace(boardLocal, r, c, v)) {
          boardLocal[r][c] = v;
          if (fillCell(boardLocal, idx + 1)) return true;
          boardLocal[r][c] = 0;
        }
      }
      return false;
    }
    fillCell(b, 0);
    return b;
  }

  // Remove cells while ensuring uniqueness
  async function generatePuzzleWithUniqueness(targetClues = 40) {
    // targetClues: number of filled cells to aim for (higher = easier)
    setGenerating(true);
    generateAbortRef.current = false;
    setMessage('Generating puzzle — this may take a few seconds...');

    // 1) get a full solution
    const solved = generateFullSolution();
    if (!solved) {
      setMessage('Failed to generate solution.');
      setGenerating(false);
      return null;
    }

    // 2) prepare removal order (shuffle cell indices)
    const cells = [];
    for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++) cells.push([r, c]);
    shuffleInPlace(cells);

    // start with full board
    const puzzle = cloneBoard(solved);
    let filled = 81;

    // remove one by one, but ensure uniqueness
    for (let idx = 0; idx < cells.length; idx++) {
      if (generateAbortRef.current) break;
      if (filled <= targetClues) break;
      const [r, c] = cells[idx];
      const backup = puzzle[r][c];
      puzzle[r][c] = 0;

      // quickly check whether still has a unique solution
      const count = countSolutions(puzzle, 2); // we only need to know if >=2
      if (count !== 1) {
        // revert removal
        puzzle[r][c] = backup;
      } else {
        filled--;
      }

      // occasionally yield control so UI updates (and abort possible)
      if (idx % 20 === 0) await tinyDelay(1);
    }

    setGenerating(false);
    setMessage('Generated puzzle.');
    return { puzzle, solution: solved };
  }

  // Public API to generate based on difficulty
  async function generateNewPuzzle(diff = 'medium') {
    const targets = { easy: 50, medium: 40, hard: 30 };
    const targetClues = targets[diff] || 40;
    setDifficulty(diff);
    generateAbortRef.current = false;
    const res = await generatePuzzleWithUniqueness(targetClues);
    if (res) {
      setBoard(res.puzzle.map(r => r.slice()));
      setFixed(getFixed(res.puzzle));
      setSolution(res.solution);
    }
  }

  function abortGeneration() {
    generateAbortRef.current = true;
    setMessage('Generation aborted.');
    setGenerating(false);
  }

  // -------------------- UI helpers --------------------
  function handleSelect(r, c) { setSelected({ r, c }); setMessage(''); }
  function onCellChange(r, c, value) {
    if (fixed[r][c]) return;
    const v = value === '' ? 0 : Math.max(0, Math.min(9, parseInt(value || '0', 10)));
    setBoard(prev => { const nb = cloneBoard(prev); if (Number.isNaN(v)) nb[r][c] = 0; else nb[r][c] = v; return nb; });
  }
  function cellHasConflict(r, c) {
    const val = board[r][c]; if (val === 0) return false; return !isValidMove(board, r, c, val);
  }
  function isValidMove(bd, r, c, val) {
    if (val === 0) return true;
    for (let j = 0; j < 9; j++) if (j !== c && bd[r][j] === val) return false;
    for (let i = 0; i < 9; i++) if (i !== r && bd[i][c] === val) return false;
    const br = Math.floor(r / 3) * 3, bc = Math.floor(c / 3) * 3;
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) { const rr = br + i, cc = bc + j; if ((rr !== r || cc !== c) && bd[rr][cc] === val) return false; }
    return true;
  }

  // keyboard input
  function handleKeyInput(e) {
    if (selected.r === -1) return;
    const key = e.key;
    if (key === 'Backspace' || key === 'Delete' || key === '0') {
      if (fixed[selected.r][selected.c]) return;
      setBoard(prev => { const nb = cloneBoard(prev); nb[selected.r][selected.c] = 0; return nb; });
      return;
    }
    if (key >= '1' && key <= '9') {
      const val = parseInt(key, 10);
      if (fixed[selected.r][selected.c]) return;
      setBoard(prev => { const nb = cloneBoard(prev); nb[selected.r][selected.c] = val; return nb; });
      return;
    }
  }
  useEffect(() => { window.addEventListener('keydown', handleKeyInput); return () => window.removeEventListener('keydown', handleKeyInput); }, [selected, fixed]);

  function autoSolve() { if (!solution) { setMessage('No solution available.'); return; } setBoard(solution.map(r => r.slice())); setMessage('Solved.'); }
  function validateBoard() {
    const conflicts = [];
    for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++) { const val = board[r][c]; if (val === 0) continue; if (!isValidMove(board, r, c, val)) conflicts.push([r, c]); }
    if (conflicts.length > 0) { setMessage('There are conflicts.'); return false; }
    if (solution) {
      let solved = true; for (let i = 0; i < 9; i++) for (let j = 0; j < 9; j++) if (board[i][j] !== solution[i][j]) solved = false;
      if (solved) { setMessage('Congratulations! You solved it.'); return true; }
      setMessage('No conflicts but puzzle not complete.'); return false;
    }
    setMessage('Validated (no conflicts).'); return true;
  }

  function reset() { setBoard(starter ? cloneBoard(starter) : emptyBoard()); setFixed(starter ? getFixed(starter) : getFixed(emptyBoard())); setSelected({ r: -1, c: -1 }); setMessage(''); }

  // -------------------- small utilities --------------------
  function shuffleArray(arr) { return arr.slice().sort(() => Math.random() - 0.5); }
  function shuffleInPlace(arr) { for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; } }
  function tinyDelay(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

  // -------------------- render --------------------
  return (
    <div className="sudoku-root">
      <div className="sudoku-card">
        <header className="sudoku-header">
          <h2>Sudoku</h2>
          <div className="sudoku-actions">
            <select value={difficulty} onChange={e => setDifficulty(e.target.value)} disabled={generating}>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>

            {!generating ? (
              <button onClick={() => generateNewPuzzle(difficulty)}>Generate</button>
            ) : (
              <button onClick={abortGeneration}>Abort</button>
            )}

            <button onClick={reset}>Reset</button>
            <button onClick={autoSolve}>Solve</button>
            <button onClick={validateBoard}>Validate</button>
          </div>
        </header>

        <div className="sudoku-body">
          <div className="sudoku-grid" role="grid">
            {board.map((row, r) => (
              <div key={r} className="sudoku-row" role="row">
                {row.map((cell, c) => {
                  const isFixed = fixed[r][c];
                  const sel = selected.r === r && selected.c === c;
                  const conflict = cellHasConflict(r, c);
                  const classes = ['sudoku-cell'];
                  if ((r+1) % 3 === 0 && r !== 8) classes.push('border-bottom-strong');
                  if ((c+1) % 3 === 0 && c !== 8) classes.push('border-right-strong');
                  if (isFixed) classes.push('fixed');
                  if (sel) classes.push('selected');
                  if (conflict) classes.push('conflict');
                  return (
                    <div
                      key={c}
                      className={classes.join(' ')}
                      onClick={() => handleSelect(r, c)}
                      role="gridcell"
                    >
                      {isFixed ? (
                        <div className="cell-value fixed-text">{cell}</div>
                      ) : (
                        <input
                          className="cell-input"
                          value={cell === 0 ? '' : cell}
                          onChange={e => onCellChange(r, c, e.target.value)}
                          onFocus={() => setSelected({ r, c })}
                          maxLength={1}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          <aside className="sudoku-side">
            <div className="meta">
              <div><strong>Theme:</strong> Black & Grey</div>
              <div className="message">{message}</div>
              <div style={{marginTop:8}}>Filled: {board.flat().filter(x=>x!==0).length}</div>
            </div>
            <div className="hint">
              <p><strong>Controls</strong></p>
              <ul>
                <li>Click a cell or use keyboard after selecting.</li>
                <li>Type numbers 1-9. Delete/Backspace clears.</li>
                <li>Generate ensures unique-solution puzzles.</li>
              </ul>
            </div>
          </aside>
        </div>

        <footer className="sudoku-footer">Generator guarantees exactly one solution. Generation may take a few seconds depending on difficulty.</footer>
      </div>
    </div>
  );
}

/* ===== sudoku.css (same as before with tiny additions) ===== */

/* Root */
