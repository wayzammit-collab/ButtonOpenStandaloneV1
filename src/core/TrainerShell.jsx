import React, { useEffect, useMemo, useState } from "react";
import GridChart from "./GridChart.jsx";
import { deckDealValid, comboKey, cardText } from "./Deck.js";

function StatusBar({ result, msg }) {
  if (!result) return null;
  const ok = result === "correct";
  return (
    <div
      style={{
        marginTop: 8,
        padding: "6px 10px",
        borderRadius: 8,
        fontSize: 13,
        color: ok ? "#0f5132" : "#842029",
        background: ok ? "#d1e7dd" : "#f8d7da",
        border: `1px solid ${ok ? "#badbcc" : "#f5c2c7"}`
      }}
    >
      {msg}
    </div>
  );
}

export default function TrainerShell({
  trainerId,
  title,
  table, setTable, tableOptions,
  pos, setPos, posOptions,
  vsPos, setVsPos, vsOptions,
  getFreq,
  highScoreKey,
  supportsCall = false,
  autoNextDelay = 250,
}) {
  const [hand, setHand] = useState(() => {
    const [a, b] = deckDealValid();
    return { c1: a, c2: b, nonce: Math.random() };
  });
  const { c1, c2 } = hand;

  const [result, setResult] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [showChart, setShowChart] = useState(false);
  const [chartMode, setChartMode] = useState("RAISE");
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [mixPct, setMixPct] = useState(50);
  const [tolerance, setTolerance] = useState(10);
  const [cellInfo, setCellInfo] = useState(null);
  const [statusMsg, setStatusMsg] = useState("");

  const freqNode = getFreq(table, pos, vsPos) || {};
  const raiseMap = freqNode.raiseMap || freqNode;
  const callMap  = freqNode.callMap || {};
  const key = useMemo(() => comboKey(c1, c2), [c1, c2, hand.nonce]);
  const raiseFreq = typeof raiseMap[key] === "number" ? raiseMap[key] : 0;
  const callAllowed = typeof callMap[key] === "number" ? callMap[key] : 0;

  useEffect(() => { document.title = title; }, [title]);

  useEffect(() => {
    const savedTol = Number(localStorage.getItem("btn_tol") || "10");
    if (!Number.isNaN(savedTol)) setTolerance(savedTol);
  }, []);
  useEffect(() => { localStorage.setItem("btn_tol", String(tolerance)); }, [tolerance]);

  function hsKey() { return highScoreKey(trainerId, table, pos, vsPos); }
  useEffect(() => {
    const saved = Number(localStorage.getItem(hsKey()) || "0");
    setHighScore(Number.isNaN(saved) ? 0 : saved);
    setScore(0);
    setResult(null);
    setAnswered(false);
    setShowChart(false);
    setChartMode("RAISE");
    setCellInfo(null);
    setStatusMsg("");
  }, [trainerId, table, pos, vsPos]);

  function saveHigh(v) { localStorage.setItem(hsKey(), String(v)); }

  function next() {
    setResult(null);
    setAnswered(false);
    setShowChart(false);
    setChartMode("RAISE");
    setCellInfo(null);
    setStatusMsg("");
    const [a, b] = deckDealValid();
    setHand({ c1: a, c2: b, nonce: Math.random() });
  }

  function gradeRaisePercent(percent) {
    if (percent === "PURE_RAISE") return raiseFreq === 100;
    if (percent === "PURE_FOLD")  return raiseFreq === 0;
    if (raiseFreq === 0 || raiseFreq === 100) return false;
    return Math.abs(percent - raiseFreq) <= tolerance;
  }
  function gradeCall() { return callAllowed >= 100; }
  function gradeFold() { return raiseFreq <= 0 && callAllowed <= 0; }

  function finishAnswer(ok, label) {
    setResult(ok ? "correct" : "wrong");
    setAnswered(true);
    try { window.__trainer_on_answer?.(ok ? "correct" : "wrong", key, label); } catch {}
    if (ok) {
      setScore(s => {
        const ns = s + 1;
        if (ns > highScore) { setHighScore(ns); saveHigh(ns); }
        return ns;
      });
      if (label === "RAISE_PCT") setStatusMsg(`Correct — 3‑Bet ${raiseFreq}% (±${tolerance})`);
      else if (label === "CALL") setStatusMsg(`Correct — Best action: Call`);
      else if (label === "FOLD") setStatusMsg(`Correct — Best action: Fold`);
      setTimeout(next, autoNextDelay);
    } else {
      setShowChart(true);
      setChartMode("RAISE");
      let hint = "Wrong";
      if (raiseFreq >= 50) hint = `Wrong — Best: 3‑Bet ${raiseFreq}%`;
      else if (callAllowed >= 100) { hint = `Wrong — Best: Call`; if (supportsCall) setChartMode("CALL"); }
      else hint = `Wrong — Best: Fold`;
      setStatusMsg(hint);
      setScore(0);
    }
  }

  function pickRaise(percent) { if (!answered) finishAnswer(gradeRaisePercent(percent), typeof percent === "number" ? "RAISE_PCT" : "RAISE"); }
  function pickCall() { if (!answered) finishAnswer(gradeCall(), "CALL"); }
  function pickFold() { if (!answered) finishAnswer(gradeFold(), "FOLD"); }
  function submitManual() {
    if (answered) return;
    const p = Math.max(0, Math.min(100, Number(mixPct) || 0));
    finishAnswer(gradeRaisePercent(p), "RAISE_PCT");
  }

  useEffect(() => {
    function onKey(e) {
      if (e.repeat) return;
      const k = e.key.toLowerCase();
      if (k === "n" && result) return next();
      if (answered) return;
      if (k === "r") return pickRaise("PURE_RAISE");
      if (supportsCall && k === "c") return pickCall();
      if (k === "f") return pickFold();
      if (k === "1") return pickRaise(25);
      if (k === "2") return pickRaise(50);
      if (k === "3") return pickRaise(75);
      if (k === "enter") return submitManual();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [answered, supportsCall, mixPct, tolerance, raiseFreq, callAllowed, result]);

  return (
    <>
      <header className="head" style={{ gap: 10 }}>
        <div>{title.replaceAll("—", "-")}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginLeft: "auto" }}>
          <label title="Table">
            Tbl
            <select value={table} onChange={e => setTable(e.target.value)}
                    style={{ marginLeft: 6, background: "#0b1220", color: "#e6ecff", border: "1px solid #2a3245", borderRadius: 6, padding: "4px 8px" }}>
              {tableOptions.map(t => <option key={t} value={t}>{t === "6MAX" ? "6-max" : "9-max"}</option>)}
            </select>
          </label>
          <label title="Position">
            Pos
            <select value={pos} onChange={e => setPos(e.target.value)}
                    style={{ marginLeft: 6, background: "#0b1220", color: "#e6ecff", border: "1px solid #2a3245", borderRadius: 6, padding: "4px 8px" }}>
              {posOptions.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </label>
          {vsOptions && (
            <label title="Vs opener">
              Vs
              <select value={vsPos} onChange={e => setVsPos(e.target.value)}
                      style={{ marginLeft: 6, background: "#0b1220", color: "#e6ecff", border: "1px solid #2a3245", borderRadius: 6, padding: "4px 8px" }}>
                {vsOptions.map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </label>
          )}
          <div style={{ opacity: 0.9 }}>Score: {score}</div>
          <div style={{ opacity: 0.9 }}>High: {highScore}</div>
          <label title="Tolerance (±%)" style={{ display: "flex", alignItems: "center", gap: 6 }}>
            Tol
            <input type="number" min={1} max={30} value={tolerance}
                   onChange={e => setTolerance(Math.max(1, Math.min(30, Number(e.target.value) || 10)))}
                   style={{ width: 52, marginLeft: 4 }} />%
          </label>
        </div>
      </header>

      <div className="hand" style={{ gap: 12 }}>
        <span className="card" style={{ minWidth: 64, textAlign: "center" }}>{cardText(c1)}</span>
        <span className="card" style={{ minWidth: 64, textAlign: "center" }}>{cardText(c2)}</span>
      </div>

      <StatusBar result={result} msg={statusMsg} />

      <div className="actions" style={{ gap: 10, display: "flex", alignItems: "center", flexWrap: "wrap", marginTop: 10 }}>
        <button onClick={() => pickRaise("PURE_RAISE")} style={{ minHeight: 40, minWidth: 92 }} disabled={answered}>3‑Bet (R)</button>
        {supportsCall && <button onClick={pickCall} style={{ minHeight: 40, minWidth: 80 }} disabled={answered}>Call (C)</button>}
        <button onClick={pickFold} style={{ minHeight: 40, minWidth: 80 }} disabled={answered}>Fold (F)</button>

        <div style={{ display: "flex", alignItems: "center", gap: 8, borderRadius: 8, padding: "6px 10px", background: "#202634" }}>
          <span>Mixed</span>
          <button onClick={() => pickRaise(25)} style={{ minHeight: 36, minWidth: 44 }} disabled={answered}>25</button>
          <button onClick={() => pickRaise(50)} style={{ minHeight: 36, minWidth: 44 }} disabled={answered}>50</button>
          <button onClick={() => pickRaise(75)} style={{ minHeight: 36, minWidth: 44 }} disabled={answered}>75</button>
          <input type="number" min={0} max={100} value={mixPct} onChange={e => setMixPct(e.target.value)}
                 style={{ width: 72, height: 32 }} placeholder="0-100" disabled={answered} />
          <button className="primary" onClick={submitManual} style={{ minHeight: 36, minWidth: 80 }} disabled={answered}>Submit (Enter)</button>
        </div>

        <button onClick={next} style={{ minHeight: 40, minWidth: 70 }} disabled={!result}>
          Next (N)
        </button>
      </div>

      {answered && result === "wrong" && (
        <>
          <div style={{ display:"flex", gap:8, alignItems:"center", marginTop: 8 }}>
            <button onClick={() => setShowChart(s => !s)} style={{ minHeight: 36, minWidth: 84 }}>
              {showChart ? "Hide chart" : "Chart"}
            </button>
            {showChart && (
              <div style={{ display:"inline-flex", gap:4, background:"#111a2b", padding:4, borderRadius:8, border:"1px solid #2a3245" }}>
                <button onClick={() => setChartMode("RAISE")}
                        style={{ minHeight:30, minWidth:64, background: chartMode==="RAISE"?"#2a3245":"#0b1220", color:"#e6ecff", border:"1px solid #2a3245", borderRadius:6 }}>
                  3‑Bet
                </button>
                <button onClick={() => setChartMode("CALL")}
                        style={{ minHeight:30, minWidth:64, background: chartMode==="CALL"?"#2a3245":"#0b1220", color:"#e6ecff", border:"1px solid #2a3245", borderRadius:6 }}>
                  Call
                </button>
                <button onClick={() => setChartMode("BEST")}
                        style={{ minHeight:30, minWidth:64, background: chartMode==="BEST"?"#2a3245":"#0b1220", color:"#e6ecff", border:"1px solid #2a3245", borderRadius:6 }}>
                  Best
                </button>
              </div>
            )}
          </div>

          {showChart && (
            <GridChart
              highlight={key}
              mode={chartMode}
              raiseMap={raiseMap}
              callMap={callMap}
              compare={title.includes("Exploit") && window.__trainer_get_gto ? { left: { raiseMap, callMap }, right: window.__trainer_get_gto() } : null}
              onCellClick={(handLabel, pct) => setCellInfo({ hand: handLabel, pct })}
            />
          )}
          {cellInfo && showChart && (
            <div style={{ marginTop: 8, color: "#a8b2c7" }}>
              {cellInfo.hand} • {chartMode==="CALL" ? "Call" : chartMode==="BEST" ? "Best" : "3‑Bet"} {cellInfo.pct|0}%
            </div>
          )}
        </>
      )}
    </>
  );
}
