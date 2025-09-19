import React, { useEffect, useMemo, useState } from "react";
import GridChart from "./GridChart.jsx";
import { deckDealValid, comboKey, cardText } from "./Deck.js";

export default function TrainerShell({
  trainerId,                                // "OPEN" | "THREEBET"
  title,
  table, setTable, tableOptions,
  pos, setPos, posOptions,
  // Optional second selector (villain position) for 3-bet trainer
  vsPos, setVsPos, vsOptions,
  // Provide active frequency
  getFreq,                                   // (table, pos, vsPos?) => freqMap
  // High score key builder
  highScoreKey,                              // (trainerId, table, pos, vsPos?) => string
}) {
  const [hand, setHand] = useState(() => {
    const [a, b] = deckDealValid();
    return { c1: a, c2: b, nonce: Math.random() };
  });
  const { c1, c2 } = hand;

  const [result, setResult] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [showChart, setShowChart] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [mixPct, setMixPct] = useState(50);
  const [tolerance, setTolerance] = useState(10);
  const [cellInfo, setCellInfo] = useState(null);

  const freqMap = getFreq(table, pos, vsPos) || {};
  const key = useMemo(() => comboKey(c1, c2), [c1, c2, hand.nonce]);
  const raiseFreq = typeof freqMap[key] === "number" ? freqMap[key] : 0;

  useEffect(() => { document.title = title; }, [title]);
  useEffect(() => {
    const savedTol = Number(localStorage.getItem("btn_tol") || "10");
    if (!Number.isNaN(savedTol)) setTolerance(savedTol);
  }, []);
  useEffect(() => { localStorage.setItem("btn_tol", String(tolerance)); }, [tolerance]);

  // Read high on any scope change
  function hsKey() { return highScoreKey(trainerId, table, pos, vsPos); }
  useEffect(() => {
    const saved = Number(localStorage.getItem(hsKey()) || "0");
    setHighScore(Number.isNaN(saved) ? 0 : saved);
    setScore(0);
    setResult(null);
    setAnswered(false);
    setShowChart(false);
    setCellInfo(null);
  }, [trainerId, table, pos, vsPos]);

  function saveHigh(v) {
    localStorage.setItem(hsKey(), String(v));
  }

  function next() {
    setResult(null);
    setAnswered(false);
    setShowChart(false);
    setCellInfo(null);
    const [a, b] = deckDealValid();
    setHand({ c1: a, c2: b, nonce: Math.random() });
  }

  function gradePercent(percent) {
    if (percent === "PURE_RAISE") return raiseFreq === 100;
    if (percent === "PURE_FOLD") return raiseFreq === 0;
    if (raiseFreq === 0 || raiseFreq === 100) return false;
    return Math.abs(percent - raiseFreq) <= tolerance;
  }

  function finishAnswer(ok) {
    setResult(ok ? "correct" : "wrong");
    setAnswered(true);
    if (ok) {
      setScore(s => {
        const ns = s + 1;
        if (ns > highScore) { setHighScore(ns); saveHigh(ns); }
        return ns;
      });
      setTimeout(next, 200);
    } else {
      setScore(0);
      setShowChart(true);
    }
  }

  function acceptImmediate(percent) {
    if (answered) return;
    finishAnswer(gradePercent(percent));
  }
  function submitManual() {
    if (answered) return;
    const p = Math.max(0, Math.min(100, Number(mixPct) || 0));
    finishAnswer(gradePercent(p));
  }

  return (
    <>
      <header className="head">
        <div>{title}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <label>
            Table
            <select value={table} onChange={e => setTable(e.target.value)}
                    style={{ marginLeft: 8, background: "#0b1220", color: "#e6ecff", border: "1px solid #2a3245", borderRadius: 6, padding: "4px 8px" }}>
              {tableOptions.map(t => <option key={t} value={t}>{t === "6MAX" ? "6-max" : "9-max"}</option>)}
            </select>
          </label>
          <label>
            Position
            <select value={pos} onChange={e => setPos(e.target.value)}
                    style={{ marginLeft: 8, background: "#0b1220", color: "#e6ecff", border: "1px solid #2a3245", borderRadius: 6, padding: "4px 8px" }}>
              {posOptions.map(p => <option key={p} value={p}>{p} {trainerId === "OPEN" ? "Open" : "3-Bet"}</option>)}
            </select>
          </label>

          {vsOptions && (
            <label>
              Vs open
              <select value={vsPos} onChange={e => setVsPos(e.target.value)}
                      style={{ marginLeft: 8, background: "#0b1220", color: "#e6ecff", border: "1px solid #2a3245", borderRadius: 6, padding: "4px 8px" }}>
                {vsOptions.map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </label>
          )}

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
  <span className="card">{cardText(c1)}</span>
  <span className="card">{cardText(c2)}</span>
  {result === "correct" && <span className="mark good">✔</span>}
  {result === "wrong" && <span className="mark bad">✘</span>}
</div>


      <div className="actions" style={{ gap: 10, display: "flex", alignItems: "center", flexWrap: "wrap" }}>
        <button disabled={answered} onClick={() => acceptImmediate("PURE_RAISE")}>Pure Raise</button>
        <button disabled={answered} onClick={() => acceptImmediate("PURE_FOLD")}>Pure Fold</button>
        <div style={{ display: "flex", alignItems: "center", gap: 8, borderRadius: 6, padding: "4px 8px", background: "#202634" }}>
          <span>Mixed</span>
          <button disabled={answered} onClick={() => acceptImmediate(25)}>25</button>
          <button disabled={answered} onClick={() => acceptImmediate(50)}>50</button>
          <button disabled={answered} onClick={() => acceptImmediate(75)}>75</button>
          <input type="number" min={0} max={100} value={mixPct}
                 onChange={e => setMixPct(e.target.value)} style={{ width: 64 }} placeholder="0-100" disabled={answered} />
          <button className="primary" disabled={answered} onClick={submitManual}>Submit</button>
        </div>
        <button onClick={next}>Next</button>
        {answered && result === "wrong" && (
          <button onClick={() => setShowChart(s => !s)}>{showChart ? "Hide chart" : "Chart"}</button>
        )}
      </div>

      {answered && result === "wrong" && (
        <>
          {showChart && (
            <GridChart
              highlight={key}
              freqMap={freqMap}
              onCellClick={(handLabel, pct) => setCellInfo({ hand: handLabel, pct })}
            />
          )}
          {cellInfo && (
            <div style={{ marginTop: 8, color: "#a8b2c7" }}>
              {cellInfo.hand} • Raise {cellInfo.pct}%
            </div>
          )}
        </>
      )}
    </>
  );
}
