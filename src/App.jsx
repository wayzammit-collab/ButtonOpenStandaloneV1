import React, { useEffect, useMemo, useState } from "react";
import BTN_FREQ_100BB from "./btnFreq.js";

const RANKS = ["A","K","Q","J","T","9","8","7","6","5","4","3","2"];
const SUITS = ["s","h","d","c"];
const SUIT_ICON = { s: "♠", h: "♥", d: "♦", c: "♣" };

function asCard(x) {
  const c = Array.isArray(x) ? x[0] : x;
  return c && typeof c.rank === "string" && typeof c.suit === "string" ? { rank: c.rank, suit: c.suit } : null;
}
function deckDeal() {
  const deck = [];
  for (const r of RANKS) for (const s of SUITS) deck.push({ rank: r, suit: s });
  const i = Math.floor(Math.random() * deck.length);
  const a = asCard(deck.splice(i, 1)[0]);
  const j = Math.floor(Math.random() * deck.length);
  const b = asCard(deck.splice(j, 1)[0]);
  return [a, b];
}
function deckDealValid() {
  let [a, b] = deckDeal();
  if (!a || !b) [a, b] = deckDeal();
  if (!a || !b) return [{ rank: "A", suit: "s" }, { rank: "K", suit: "d" }];
  return [a, b];
}
function comboKey(c1, c2) {
  const i1 = RANKS.indexOf(c1.rank);
  const i2 = RANKS.indexOf(c2.rank);
  if (i1 === i2) return c1.rank + c2.rank;
  const hi = i1 < i2 ? c1 : c2;
  const lo = i1 < i2 ? c2 : c1;
  return hi.rank + lo.rank + (c1.suit === c2.suit ? "s" : "o");
}
function handLabelFromKey(k) {
  if (k.length === 2) return k;
  const r1 = k[0], r2 = k[1], t = k[2];
  return r1 + r2 + (t === "s" ? "s" : "o");
}
function cardText(c) { return c.rank + " " + (SUIT_ICON[c.suit] || c.suit.toUpperCase()); }
function colorForPct(pct) {
  const p = Math.max(0, Math.min(100, pct));
  const g = Math.round(40 + (p / 100) * 120);
  const r = Math.round(90 + ((100 - p) / 100) * 100);
  const b = 80;
  return `rgb(${r}, ${g}, ${b})`;
}

function Card({ card, onClick }) {
  return (
    <span className="card" onClick={onClick} style={{ cursor: "pointer", fontSize: 20, letterSpacing: 1 }}>
      {cardText(card)}
    </span>
  );
}
function MiniChart({ highlight, freqMap }) {
  return (
    <div className="chart" style={{ marginTop: 10 }}>
      <div className="grid">
        {RANKS.map((r1, i) => (
          <div className="row" key={r1}>
            {RANKS.map((r2, j) => {
              let k;
              if (i === j) k = r1 + r2;
              else if (i < j) k = r1 + r2 + "s";
              else k = r2 + r1 + "o";
              const f = typeof freqMap[k] === "number" ? freqMap[k] : 0;
              const isHL = k === highlight;
              const style = {
                background: colorForPct(f),
                border: isHL ? "2px solid #ffda6b" : "1px solid #2a3245",
                color: "#fff",
                fontSize: 12,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              };
              return (
                <div key={k} className="cell" style={style} title={`${handLabelFromKey(k)}: raise ${Math.round(f)}%`}>
                  {handLabelFromKey(k)}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  // Hand with nonce
  const [hand, setHand] = useState(() => {
    const [a, b] = deckDealValid();
    return { c1: a, c2: b, nonce: Math.random() };
  });
  const { c1, c2 } = hand;

  // Trainer state
  const [result, setResult] = useState(null);           // "correct" | "wrong" | null
  const [answered, setAnswered] = useState(false);      // disables inputs after answer
  const [showChart, setShowChart] = useState(false);    // now controlled by answered
  const [score, setScore] = useState(0);                // current streak
  const [highScore, setHighScore] = useState(0);        // best streak (persisted)
  const [mixPct, setMixPct] = useState(50);
  const [tolerance, setTolerance] = useState(10);

  // Load persisted settings
  useEffect(() => {
    const savedTol = Number(localStorage.getItem("btn_tol") || "10");
    if (!Number.isNaN(savedTol)) setTolerance(savedTol);
    const savedHigh = Number(localStorage.getItem("btn_high_score") || "0");
    if (!Number.isNaN(savedHigh)) setHighScore(savedHigh);
  }, []);
  useEffect(() => {
    localStorage.setItem("btn_tol", String(tolerance));
  }, [tolerance]);
  useEffect(() => {
    localStorage.setItem("btn_high_score", String(highScore));
  }, [highScore]);

  function next() {
    setResult(null);
    setAnswered(false);
    setShowChart(false); // chart only after answering
    setHand(() => {
      const [a, b] = deckDealValid();
      const obj = { c1: a, c2: b, nonce: Math.random() };
      console.log("Next ->", obj);
      return obj;
    });
  }

  const key = useMemo(() => comboKey(c1, c2), [c1, c2, hand.nonce]);
  const raiseFreq = typeof BTN_FREQ_100BB[key] === "number" ? BTN_FREQ_100BB[key] : 0;

  function gradePercent(percent) {
    if (percent === "PURE_RAISE") return raiseFreq === 100;
    if (percent === "PURE_FOLD") return raiseFreq === 0;
    if (raiseFreq === 0 || raiseFreq === 100) return false;
    return Math.abs(percent - raiseFreq) <= tolerance;
  }

  function finishAnswer(ok) {
    setResult(ok ? "correct" : "wrong");
    setAnswered(true);
    setShowChart(true); // reveal chart only after answer
    if (ok) {
      setScore(s => {
        const ns = s + 1;
        setHighScore(hs => (ns > hs ? ns : hs));
        return ns;
      });
    } else {
      setScore(0); // reset streak on wrong
    }
  }

  function acceptImmediate(percent) {
    if (answered) return; // lock after first answer
    const ok = gradePercent(percent);
    finishAnswer(ok);
    // No auto-next now; user decides to view chart then click Next
  }

  function submitManual() {
    if (answered) return; // lock after first answer
    const p = Math.max(0, Math.min(100, Number(mixPct) || 0));
    const ok = gradePercent(p);
    finishAnswer(ok);
  }

  return (
    <div className="wrap">
      <header className="head">
        <div>BTN RFI Trainer</div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div>Score: {score}</div>
          <div>High: {highScore}</div>
          <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
            Tol ±
            <input type="number" min={1} max={30} value={tolerance}
                   onChange={e => setTolerance(Math.max(1, Math.min(30, Number(e.target.value) || 10)))}
                   style={{ width: 52 }} />%
          </label>
        </div>
      </header>

      <div className="hand">
        <Card card={c1} onClick={answered ? undefined : next} />
        <Card card={c2} onClick={answered ? undefined : next} />
        {result === "correct" && <span className="mark good">✔</span>}
        {result === "wrong" && <span className="mark bad">✘</span>}
      </div>

      <div className="actions" style={{ gap: 10, display: "flex", alignItems: "center", flexWrap: "wrap" }}>
        {/* Disable inputs after answer; only Next remains */}
        <button disabled={answered} onClick={() => acceptImmediate("PURE_RAISE")}>Pure Raise</button>
        <button disabled={answered} onClick={() => acceptImmediate("PURE_FOLD")}>Pure Fold</button>

        <div style={{ display: "flex", alignItems: "center", gap: 8, borderRadius: 6, padding: "4px 8px", background: "#202634" }}>
          <span>Mixed</span>
          <button disabled={answered} onClick={() => acceptImmediate(25)}>25</button>
          <button disabled={answered} onClick={() => acceptImmediate(50)}>50</button>
          <button disabled={answered} onClick={() => acceptImmediate(75)}>75</button>
          <input
            type="number"
            min={0}
            max={100}
            value={mixPct}
            onChange={e => setMixPct(e.target.value)}
            style={{ width: 64 }}
            placeholder="0-100"
            disabled={answered}
          />
          <button className="primary" disabled={answered} onClick={submitManual}>Submit</button>
        </div>

        <button onClick={next}>Next</button>
        {/* Remove Chart toggle before answer; show only after answer */}
        {answered && <button onClick={() => setShowChart(s => !s)}>{showChart ? "Hide chart" : "Chart"}</button>}
      </div>

      {answered && showChart && <MiniChart highlight={key} freqMap={BTN_FREQ_100BB} />}
    </div>
  );
}
