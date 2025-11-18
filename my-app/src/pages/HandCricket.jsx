import React, { useState } from "react";
import "./handcricket.css";

/*
Rewritten Hand Cricket with correct innings logic:
- Toss -> winner chooses bat/bowl (bot auto chooses if it wins)
- First innings: chosen batter bats until OUT -> score recorded
- Second innings: other player bats to chase target (firstScore + 1)
- If chaser surpasses target -> immediate win
- If chaser gets OUT before surpassing -> compare scores -> decide winner
- Moves: 1..6 only. No fists.
*/

const MOVES = [
  { id: "1", emoji: "☝️" }, // 1
  { id: "2", emoji: "✌️" }, // 2
  { id: "3", emoji: "🤟" }, // 3
  { id: "4", emoji: "🤚" }, // 4
  { id: "5", emoji: "✋" }, // 5
  { id: "6", emoji: "6️⃣" } // 6
];

function randChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export default function HandCricket() {
  // Stage: preToss, tossing, tossResult, chooseRole, playing, gameOver
  const [stage, setStage] = useState("preToss");

  // toss
  const [tossPick, setTossPick] = useState(null); // 'heads' or 'tails'
  const [coinFace, setCoinFace] = useState(null); // 'heads'|'tails' for animation
  const [tossWinner, setTossWinner] = useState(null); // 'you'|'bot'

  // who bats first after toss: 'you' or 'bot'
  const [firstBatter, setFirstBatter] = useState(null);

  // innings control
  const [firstInningsCompleted, setFirstInningsCompleted] = useState(false);
  const [battingNow, setBattingNow] = useState(null); // 'you'|'bot' (current batter in playing stage)

  // scores
  const [yourScore, setYourScore] = useState(0);
  const [botScore, setBotScore] = useState(0);

  // last moves for display
  const [lastYourMove, setLastYourMove] = useState("-");
  const [lastBotMove, setLastBotMove] = useState("-");

  // messages
  const [resultText, setResultText] = useState("");
  const [target, setTarget] = useState(null); // target for second innings (firstScore + 1)

  // helpers
  const toVal = (mid) => Number(mid);

  // ---------- TOSS FLOW ----------
  function startToss(userPick) {
    setTossPick(userPick);
    setStage("tossing");
    setCoinFace(null);
    setTossWinner(null);
    setResultText("Flipping coin...");
    setTimeout(() => {
      const faces = ["heads", "tails"];
      const face = randChoice(faces);
      setCoinFace(face);
      const userWon = face === userPick;
      setTossWinner(userWon ? "you" : "bot");
      setStage("tossResult");
      setResultText(userWon ? "You won the toss!" : "Bot won the toss.");
    }, 900);
  }

  function userChooseRole(role) {
    // role = 'bat' or 'bowl' (user's choice when user won toss)
    const first = role === "bat" ? "you" : "bot";
    setFirstBatter(first);
    setBattingNow(first);
    setFirstInningsCompleted(false);
    setStage("playing");
    setResultText(first === "you" ? "You will bat first." : "Bot will bat first.");
    // initial small delay then set playing messages
    setTimeout(() => {
      setResultText(first === "you" ? "You are batting." : "Bot is batting.");
    }, 400);
  }

  function botChooseRoleAutomatically() {
    // bot chooses randomly
    const choice = randChoice(["bat", "bowl"]); // bot chooses to bat or bowl
    const first = choice === "bat" ? "bot" : "you";
    setFirstBatter(first);
    setBattingNow(first);
    setFirstInningsCompleted(false);
    setStage("playing");
    setResultText(first === "you" ? "You will bat first." : "Bot will bat first.");
    setTimeout(() => {
      setResultText(first === "you" ? "You are batting." : "Bot is batting.");
    }, 400);
  }

  // ---------- PLAYING LOGIC ----------
  // When YOU bat (first innings or second innings if user is chaser)
  function yourBat(moveId) {
    if (stage !== "playing" || battingNow !== "you" || stage === "gameOver") return;

    const botBall = randChoice(MOVES).id;
    setLastYourMove(moveId);
    setLastBotMove(botBall);

    const batVal = toVal(moveId);
    const bowlVal = toVal(botBall);

    // OUT
    if (batVal === bowlVal) {
      // if first innings not completed -> finish first innings and start second with other batting
      if (!firstInningsCompleted) {
        setResultText(`OUT! You are out on ${yourScore} runs. Now bot will bat to chase.`);
        // finalize first innings
        setFirstInningsCompleted(true);
        const newTarget = yourScore + 1;
        setTarget(newTarget);
        // reset last moves? keep them visible
        setBattingNow("bot"); // bot will bat now (second innings)
        // stage remains playing
      } else {
        // second innings: user was batting as chaser (unlikely because when user chases battingNow would be 'you')
        // User got OUT while chasing: compare scores -> end match
        setResultText(`OUT while chasing! You scored ${yourScore}.`);
        setStage("gameOver");
        decideWinner();
      }
      return;
    }

    // scored runs
    setYourScore((s) => {
      const n = s + batVal;
      // If this was second innings (user chasing) check for surpass
      if (firstInningsCompleted && battingNow === "you") {
        // user is chasing bot's first innings score (target)
        if (n >= target) {
          // user reached or surpassed target -> immediate win
          setResultText(`You scored ${batVal} and reached the target! You win!`);
          setYourScore(n); // apply and then end game
          setStage("gameOver");
          return n;
        }
      }
      setResultText(`You scored ${batVal}`);
      return n;
    });

    // If it was first innings, user continues batting until OUT (no change of battingNow)
    // If it was second innings and not yet reached target, continue batting (no change)
  }

  // When BOT bats (you bowl by selecting a number)
  function bowlToBot(yourBowlId) {
    if (stage !== "playing" || battingNow !== "bot" || stage === "gameOver") return;

    const botShot = randChoice(MOVES).id;
    setLastYourMove(yourBowlId);
    setLastBotMove(botShot);

    const batVal = toVal(botShot);
    const bowlVal = toVal(yourBowlId);

    // OUT
    if (batVal === bowlVal) {
      if (!firstInningsCompleted) {
        // bot out in second half? Actually if firstInningsCompleted is false and bot got out then bot was batting first? Handle generically:
        // If bot was batting in first innings (i.e., bot batted first), then on OUT we finish first innings and set target for user to chase.
        if (firstBatter === "bot" && !firstInningsCompleted) {
          // bot was first innings batter and is now OUT -> set target and let user chase
          setResultText(`You got the bot OUT! Bot scored ${botScore} runs. Now you chase.`);
          setFirstInningsCompleted(true);
          const newTarget = botScore + 1;
          setTarget(newTarget);
          setBattingNow("you");
        } else if (!firstInningsCompleted) {
          // generic: if it was first innings and bot got out, switch to user batting second
          setFirstInningsCompleted(true);
          const newTarget = botScore + 1;
          setTarget(newTarget);
          setBattingNow("you");
          setResultText(`You got the bot OUT! Bot scored ${botScore}. You need ${newTarget} to win.`);
        } else {
          // second innings: bot was chasing and got OUT -> compare scores and finish
          setResultText(`You got the bot OUT while chasing! Bot scored ${botScore}.`);
          setStage("gameOver");
          decideWinner();
        }
        return;
      } else {
        // second innings and bot got OUT -> decide winner
        setResultText(`You got the bot OUT while chasing! Bot scored ${botScore}.`);
        setStage("gameOver");
        decideWinner();
        return;
      }
    }

    // bot scored runs
    setBotScore((s) => {
      const n = s + batVal;

      // If this was first innings (bot batting first), they keep batting until OUT
      // If this was second innings (bot chasing), check if they surpass target
      if (firstInningsCompleted && battingNow === "bot") {
        if (n >= target) {
          // bot chased successfully -> immediate win
          setResultText(`Bot scored ${batVal} and reached the target! Bot wins!`);
          setBotScore(n); // set then finish
          setStage("gameOver");
          // setBotScore done via setBotScore's returned value
          return n;
        }
      }

      setResultText(`Bot scored ${batVal}`);
      return n;
    });

    // After scoring in first innings, if first innings not completed and bot was first innings batter, they continue batting.
    // If bot is in second innings and hasn't reached target yet, they continue.
  }

  function decideWinner() {
    // Called after second innings end (gameOver)
    const you = yourScore;
    const bot = botScore;
    // If target set, second innings happened
    if (target !== null) {
      if (bot > you) setResultText("Bot wins the match!");
      else if (you > bot) setResultText("You win the match!");
      else setResultText("Match tied!");
    } else {
      // If for some reason target wasn't set, fallback compare
      if (you > bot) setResultText("You win the match!");
      else if (bot > you) setResultText("Bot wins the match!");
      else setResultText("Match tied!");
    }
  }

  function newMatchReset() {
    setStage("preToss");
    setTossPick(null);
    setCoinFace(null);
    setTossWinner(null);
    setFirstBatter(null);
    setFirstInningsCompleted(false);
    setBattingNow(null);
    setYourScore(0);
    setBotScore(0);
    setLastYourMove("-");
    setLastBotMove("-");
    setResultText("");
    setTarget(null);
  }

  // Helper to render move buttons (1..6) with emoji
  function renderMoveButtons(handler, disabled = false) {
    return (
      <div className="hc-move-grid" role="group" aria-label="moves">
        {MOVES.map((m) => (
          <button key={m.id} disabled={disabled} className="hc-move-btn" onClick={() => handler(m.id)}>
            <div className="hc-move-emoji">{m.emoji}</div>
            <div className="hc-move-label">{m.id}</div>
          </button>
        ))}
      </div>
    );
  }

  // ---------- UI ----------
  return (
    <div className="hc-root stadium-theme">
      <div className="hc-card">
        <header className="hc-header">
          <div className="hc-logo">🏏</div>
          <div>
            <h1 className="hc-title">Hand Cricket — Stadium</h1>
            <div className="hc-sub">Toss → First Innings → Second Innings (Chase)</div>
          </div>

          <div className="hc-scoreboard">
            <div className="sb-item">
              <div className="sb-label">You</div>
              <div className="sb-value">{yourScore}</div>
            </div>
            <div className="sb-item">
              <div className="sb-label">Bot</div>
              <div className="sb-value">{botScore}</div>
            </div>
          </div>
        </header>

        {/* TOSS */}
        {stage === "preToss" && (
          <div className="hc-toss">
            <h3 className="section-title">Toss: Choose Heads or Tails</h3>
            <div className="toss-buttons">
              <button className="toss-btn" onClick={() => startToss("heads")}>Heads</button>
              <button className="toss-btn" onClick={() => startToss("tails")}>Tails</button>
            </div>
            <div className="hint">Winner of toss chooses to bat or bowl.</div>
          </div>
        )}

        {stage === "tossing" && (
          <div className="hc-tossing">
            <div className={`coin ${coinFace ? ("show-" + coinFace) : "spinning"}`}>
              <div className="face heads">H</div>
              <div className="face tails">T</div>
            </div>
            <div className="hint">Flipping coin...</div>
          </div>
        )}

        {stage === "tossResult" && (
          <div className="hc-toss-result">
            <div className="result-text">{resultText}</div>

            {tossWinner === "you" ? (
              <div className="choose-role">
                <h4>Pick: Bat or Bowl?</h4>
                <div className="role-buttons">
                  <button className="role-btn" onClick={() => userChooseRole("bat")}>Bat</button>
                  <button className="role-btn" onClick={() => userChooseRole("bowl")}>Bowl</button>
                </div>
              </div>
            ) : (
              <div className="bot-choose">
                <div className="result-text">Bot chooses now...</div>
                <button className="role-btn" onClick={() => { setResultText("Bot chose."); botChooseRoleAutomatically(); }}>Proceed</button>
              </div>
            )}
          </div>
        )}

        {/* PLAYING AREA */}
        {stage === "playing" && (
          <>
            <div className="hc-status-row">
              <div className="status-pill">
                { !firstInningsCompleted ? "First Innings" : "Second Innings (Chase)" }
              </div>

              <div className="last-moves">
                <div><span className="lm-label">You:</span> <span className="lm-val">{lastYourMove}</span></div>
                <div><span className="lm-label">Bot:</span> <span className="lm-val">{lastBotMove}</span></div>
              </div>
            </div>

            <div className="hc-play-area">
              <div className="hc-panel hc-left">
                <h4 className="section-title">
                  { battingNow === "you" ? "You're batting — choose 1–6" :
                    battingNow === "bot" ? "You're bowling — choose 1–6" : "Ready" }
                </h4>
                <div className="result-display">{resultText}</div>

                { battingNow === "you" && renderMoveButtons(yourBat) }
                { battingNow === "bot" && renderMoveButtons(bowlToBot) }

                <div style={{ marginTop: 12 }}>
                  { firstInningsCompleted && <div className="target-line">Target: {target}</div> }
                </div>
              </div>

              <div className="hc-panel hc-right">
                <div className="stadium">
                  <div className="pitch" />
                  <div className="stands">
                    <div className="stand-row" />
                    <div className="stand-row" />
                    <div className="stand-row" />
                  </div>
                </div>

                <div className="target">
                  <div className="target-label">First Innings Score</div>
                  <div className="target-value">{ firstInningsCompleted ? (firstBatter === "you" ? yourScore : botScore) : "—" }</div>
                  <div className="target-sub">{ firstInningsCompleted ? `Target: ${target}` : "Play first innings" }</div>
                </div>
              </div>
            </div>
          </>
        )}

        {stage === "gameOver" && (
          <div className="hc-end">
            <div className="result-text" style={{ marginBottom: 12 }}>{resultText}</div>
            <div className="final-scores" style={{ marginBottom: 12 }}>
              <div>You: {yourScore}</div>
              <div>Bot: {botScore}</div>
            </div>
            <div>
              <button className="big-btn" onClick={newMatchReset}>New Match</button>
            </div>
          </div>
        )}

        <footer className="hc-footer">
          <div className="small">Tip: bowl carefully — matching numbers get OUT.</div>
          <div className="credits">Stadium Theme • Emojis • Toss</div>
        </footer>
      </div>
    </div>
  );
}

