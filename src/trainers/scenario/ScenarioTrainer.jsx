import React, { useEffect, useState } from "react";
import { sampleScenario, gradeAction } from "./scenarioEngine.js";

function MiniTable({ hero, villain, board, heroCards }) {
  const seats = ["UTG","HJ","CO","BTN","SB","BB"];
  return (
    <div className="scn-table-wrap">
      <div className="scn-table">
        <div className="scn-board-center">{board}</div>
        {seats.map((p,i)=>{
          const angle=(2*Math.PI*i)/seats.length - Math.PI/2, rx=0.78, ry=0.62;
          const cx=0.5 + rx*Math.cos(angle)*0.5, cy=0.5 + ry*Math.sin(angle)*0.5;
          const cls = p===hero ? "scn-seat hero" : p===villain ? "scn-seat villain" : "scn-seat";
          return (
            <div key={p} className={cls} style={{ left:`${cx*100}%`, top:`${cy*100}%` }}>
              {p}{p===hero && <span className="hero-cards">{heroCards}</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
function Chip({ children }) { return <span className="chip">{children}</span>; }

export default function ScenarioTrainer() {
  const [scenario, setScenario] = useState(null);
  const [result, setResult] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [hi, setHi] = useState(Number(localStorage.getItem("scn_hi")||"0")||0);
  const [actions, setActions] = useState([]);

  function next() {
    setResult(null); setAnswered(false);
    const scn = sampleScenario();
    setScenario(scn);
    const arr=[...scn.actions]; for(let i=arr.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [arr[i],arr[j]]=[arr[j],arr[i]]; }
    setActions(arr);
  }
  useEffect(()=>{ next(); }, []);

  function label(a){
    if (a.kind==="BET") {
      const pct=a.size?Math.round(a.size*100):(a.id.includes("25")?25:a.id.includes("33")?33:a.id.includes("50")?50:75);
      const isOOPActing = scenario?.toAct === scenario?.positions?.oop;
      return isOOPActing ? `Lead ${pct}%` : `Bet ${pct}%`;
    }
    return a.label || a.id;
  }

  function onPick(id){
    if (answered) return;
    const g = gradeAction(scenario, id);
    const best = label(scenario.actions.find(a=>a.id===g.bestId) || { id:g.bestId });
    const pickL = label(scenario.actions.find(a=>a.id===id) || { id });
    let msg = g.ok ? `Correct — ${pickL} (${g.pct}%)` : `Wrong — Best: ${best} (${g.bestPct}%)`;
    setResult({ ok:g.ok, msg }); setAnswered(true);
    if (g.ok) { setScore(s=>{ const ns=s+1; if (ns>hi){ setHi(ns); localStorage.setItem("scn_hi",String(ns)); } return ns; }); setTimeout(next,250); } else setScore(0);
  }

  if (!scenario) return <div style={{ color:"#e6ecff", padding:12 }}>Loading…</div>;

  const header = `${scenario.street} — ${scenario.potType} — Hero: ${scenario.positions.hero} vs Villain: ${scenario.positions.villain}`;
  const board = (scenario.boardSt||[]).join(" ");
  const mixText = Object.entries(scenario.theory).sort((a,b)=>b[1]-a[1]).slice(0,3).map(([k,v])=>{
    const act = scenario.actions.find(x=>x.id===k) || { id:k, label:k };
    return `${label(act)} — ${v}%`;
  }).join(" • ");

  return (
    <div className="scn-root scn-singlecol">
      <div className="scn-titlebar">
        <div className="scn-titleline">
          <span className="scn-strong">{header}</span>
          <Chip>Mix: {mixText}</Chip>
          <Chip>To act: {scenario.toAct}</Chip>
          <Chip>OOP action: {scenario.lastAction}</Chip>
        </div>
        <div className="scn-rightline">
          <span className="meta-dim">SPR {scenario.spr}</span>
          <span className="meta-dim">Pot ~ {scenario.potBB}bb</span>
          <span className="meta-dim">Score: {score} • High: {hi}</span>
        </div>
      </div>

      <div className="card scn-card">
        <div className="scn-story">{scenario.story}</div>
        <div className="scn-chips">
          <span>Board: <span className="scn-strong">{board}</span></span>
          <span>Hero: <span className="scn-strong">{scenario.heroHand}</span></span>
          <span className="meta-dim">Hero stack: {scenario.heroBB}bb</span>
          <span className="meta-dim">Villain stack: {scenario.villBB}bb</span>
        </div>
        {result && <div className={`scn-pill ${result.ok?"ok":"bad"}`}>{result.msg}</div>}
      </div>

      <div className="scn-panel">
        <MiniTable hero={scenario.positions.hero} villain={scenario.positions.villain} board={board} heroCards={scenario.heroHand} />
      </div>

      <div className="scn-actions">
        {actions.map(a=>(
          <button key={a.id} onClick={()=>onPick(a.id)} disabled={answered} className="btn">{label(a)}</button>
        ))}
        <button onClick={next} className="btn primary" disabled={!answered}>Next</button>
      </div>
    </div>
  );
}
