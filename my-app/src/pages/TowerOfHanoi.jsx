import React, { useEffect, useRef, useState } from "react";
import "./hanoi.css";

/*
Robust Tower of Hanoi
- Bottom-to-top stacking (flex column-reverse)
- Drag & drop with strict validation
- Deterministic Auto-solve using precomputed move list (no nested recursion timeouts)
- Prevent changing disk count while running/solving
- Win detection and safe stop
*/

export default function TowerOfHanoi() {
  const [numDisks, setNumDisks] = useState(4);
  const [pegs, setPegs] = useState([[], [], []]);
  const [moves, setMoves] = useState(0);
  const [running, setRunning] = useState(false); // either auto-solve running or user playing (we disable certain controls when true)
  const [solving, setSolving] = useState(false); // specifically auto-solve state
  const [dragData, setDragData] = useState(null);
  const movesQueueRef = useRef([]); // for auto-solve play queue
  const solveTimerRef = useRef(null);

  // initialize pegs
  useEffect(() => {
    initGame(numDisks);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function initGame(n) {
    const start = [];
    for (let i = n; i >= 1; i--) start.push(i);
    setPegs([start, [], []]);
    setMoves(0);
    setDragData(null);
    setRunning(false);
    setSolving(false);
    movesQueueRef.current = [];
    clearTimeout(solveTimerRef.current);
  }

  // --- Safety helpers ---
  function isTopDisk(pegIndex, disk) {
    const peg = pegs[pegIndex];
    if (!peg || peg.length === 0) return false;
    return peg[peg.length - 1] === disk;
  }

  function canPlaceOnPeg(toPegIndex, disk) {
    const target = pegs[toPegIndex];
    if (!target || target.length === 0) return true;
    return target[target.length - 1] > disk;
  }

  // --- Drag & Drop handlers ---
  function onDragStart(e, disk, fromPeg) {
    if (running && !solving) {
      // when auto-solve not running: user allowed; when solving, no user drag
    }
    if (solving) {
      e.preventDefault();
      return;
    }

    // only allow dragging the top disk
    if (!isTopDisk(fromPeg, disk)) {
      e.preventDefault();
      return;
    }

    setDragData({ disk, fromPeg });
    // For Firefox dragImage fix: set data
    try {
      e.dataTransfer.setData("text/plain", `${disk},${fromPeg}`);
    } catch (err) {
      // ignore if unavailable
    }
  }

  function onDragEnd() {
    setDragData(null);
  }

  function onDrop(e, toPeg) {
    e.preventDefault();
    if (solving) return;
    let data = dragData;

    // If dragData missing, attempt to read from dataTransfer (fallback)
    if (!data) {
      try {
        const txt = e.dataTransfer.getData("text/plain");
        if (txt) {
          const [diskStr, fromStr] = txt.split(",");
          data = { disk: Number(diskStr), fromPeg: Number(fromStr) };
        }
      } catch (err) {
        // ignore
      }
    }
    if (!data) return;

    const { disk, fromPeg } = data;
    if (fromPeg === toPeg) {
      setDragData(null);
      return;
    }

    // Validate top disk still top
    if (!isTopDisk(fromPeg, disk)) {
      setDragData(null);
      return;
    }

    if (!canPlaceOnPeg(toPeg, disk)) {
      setDragData(null);
      return;
    }

    // Apply move
    setPegs((prev) => {
      const copy = prev.map((p) => [...p]);
      copy[fromPeg].pop();
      copy[toPeg].push(disk);
      return copy;
    });
    setMoves((m) => m + 1);
    setDragData(null);
    // After every user move, check win
    setTimeout(() => {
      checkWin();
    }, 10);
  }

  function onDragOver(e) {
    e.preventDefault();
  }

  // --- Auto-solve: build moves list then execute sequentially ---
  function buildHanoiMoves(n, from, to, aux, out) {
    if (n <= 0) return;
    buildHanoiMoves(n - 1, from, aux, to, out);
    out.push([from, to]);
    buildHanoiMoves(n - 1, aux, to, from, out);
  }

  function startAutoSolve() {
    if (solving) return;
    initGame(numDisks); // reset first
    setRunning(true);
    setSolving(true);

    // build deterministic move list
    const q = [];
    buildHanoiMoves(numDisks, 0, 2, 1, q);
    movesQueueRef.current = q;
    setMoves(0);

    // start playing moves one by one
    playNextAutoMove();
  }

  function playNextAutoMove() {
    if (!movesQueueRef.current.length) {
      // done
      setSolving(false);
      setRunning(false);
      checkWin();
      return;
    }
    const [from, to] = movesQueueRef.current.shift();
    // perform the move
    setPegs((prev) => {
      const copy = prev.map((p) => [...p]);
      const disk = copy[from].pop();
      copy[to].push(disk);
      return copy;
    });
    setMoves((m) => m + 1);

    // safety: if win reached early, stop
    if (checkWin()) {
      movesQueueRef.current = [];
      setSolving(false);
      setRunning(false);
      return;
    }

    // schedule next
    solveTimerRef.current = setTimeout(() => {
      playNextAutoMove();
    }, 260); // speed: 260ms per move (tweak for preference)
  }

  // Cancel solve safely
  function stopAutoSolve() {
    setSolving(false);
    setRunning(false);
    movesQueueRef.current = [];
    clearTimeout(solveTimerRef.current);
  }

  // --- Move by clicking: convenience (optional) ---
  // (Click top disk to pick, click a peg to drop)
  function clickPickTop(pegIndex) {
    if (solving) return;
    const peg = pegs[pegIndex];
    if (!peg.length) return;
    const disk = peg[peg.length - 1];
    // pick disk
    setDragData({ disk, fromPeg: pegIndex });
  }
  function clickDropTo(pegIndex) {
    if (solving) return;
    if (!dragData) return;
    // reuse same validation as onDrop
    const { disk, fromPeg } = dragData;
    if (fromPeg === pegIndex) {
      setDragData(null);
      return;
    }
    if (!isTopDisk(fromPeg, disk)) {
      setDragData(null);
      return;
    }
    if (!canPlaceOnPeg(pegIndex, disk)) {
      setDragData(null);
      return;
    }
    // perform move
    setPegs((prev) => {
      const copy = prev.map((p) => [...p]);
      copy[fromPeg].pop();
      copy[pegIndex].push(disk);
      return copy;
    });
    setMoves((m) => m + 1);
    setDragData(null);
    setTimeout(() => checkWin(), 10);
  }

  // --- Win detection --- returns true if won
  function checkWin() {
    // standard win: all disks on peg index 2 (rightmost)
    if (pegs[2].length === numDisks) {
      // stop solver if running
      if (solving) stopAutoSolve();
      setRunning(false);
      // keep UI responsive
      return true;
    }
    return false;
  }

  // protect changing number while solving
  function handleNumDisksChange(n) {
    if (solving) return;
    const v = Math.max(3, Math.min(8, Number(n) || 3));
    setNumDisks(v);
  }

  return (
    <div className="hanoi-root">
      <h1 className="hanoi-title">Tower of Hanoi</h1>

      <div className="hanoi-controls">
        <label>Disks: </label>
        <input
          type="number"
          value={numDisks}
          min="3"
          max="8"
          onChange={(e) => handleNumDisksChange(e.target.value)}
          disabled={solving}
        />
        <button onClick={() => initGame(numDisks)} disabled={solving}>Start</button>

        {solving ? (
          <button onClick={stopAutoSolve}>Stop Solve</button>
        ) : (
          <button onClick={startAutoSolve} disabled={solving}>Auto Solve</button>
        )}
      </div>

      <div className="moves">Moves: {moves}</div>

      <div className="hanoi-board">
        {pegs.map((peg, pegIndex) => (
          <div
            key={pegIndex}
            className={`peg ${dragData && dragData.fromPeg === pegIndex ? "picked-from" : ""}`}
            onDragOver={onDragOver}
            onDrop={(e) => onDrop(e, pegIndex)}
            onClick={() => {
              // click behavior: pick if no dragData, else drop
              if (dragData == null) clickPickTop(pegIndex);
              else clickDropTo(pegIndex);
            }}
          >
            <div className="pole" />

            {/* render disks in natural order; CSS column-reverse ensures bottom stacking */}
            {peg.map((disk, i) => (
              <div
                key={i}
                draggable={!solving}
                onDragStart={(e) => onDragStart(e, disk, pegIndex)}
                onDragEnd={onDragEnd}
                className={`disk disk-${disk} ${isTopDisk(pegIndex, disk) ? "disk-top" : ""}`}
                style={{
                  width: `${(disk / numDisks) * 88 + 12}%` // map 1..N to a good visible percentage
                }}
                title={`Disk ${disk}`}
              >
                <div className="disk-label">{disk}</div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
