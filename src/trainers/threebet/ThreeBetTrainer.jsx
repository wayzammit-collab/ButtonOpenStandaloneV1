import React, { useMemo, useState, useEffect } from "react";
import TrainerShell from "../../core/TrainerShell.jsx";
import { FREQ_3B_ACTIONS } from "./freqMaps.js";

export default function ThreeBetTrainer() {
  // Table
  const allowedTables = Object.keys(FREQ_3B_ACTIONS);
  const storedTable = localStorage.getItem("three_table") || "6MAX";
  const [table, setTable] = useState(allowedTables.includes(storedTable) ? storedTable : "6MAX");

  // Scope
  const scope = FREQ_3B_ACTIONS[table];

  // Position selections
  const heroList = scope?.heroPositions || [];
  const vilList  = scope?.villainPositions || [];

  const storedPos = localStorage.getItem("three_pos");
  const storedVs  = localStorage.getItem("three_vs");

  const [pos, setPos] = useState(() => heroList.includes(storedPos) ? storedPos : (heroList[0] || ""));
  const [vsPos, setVsPos] = useState(() => vilList.includes(storedVs) ? storedVs : (vilList[0] || ""));

  // Persist
  useEffect(() => { localStorage.setItem("three_table", table); }, [table]);
  useEffect(() => { if (pos) localStorage.setItem("three_pos", pos); }, [pos]);
  useEffect(() => { if (vsPos) localStorage.setItem("three_vs", vsPos); }, [vsPos]);

  // Keep values valid and different
  useEffect(() => {
    const s = FREQ_3B_ACTIONS[table];
    if (!s) return;
    if (!s.heroPositions.includes(pos)) {
      setPos(s.heroPositions[0]);
      return;
    }
    const allowedVs = s.villainPositions.filter(v => v !== pos);
    if (!allowedVs.length) return;
    if (!allowedVs.includes(vsPos)) setVsPos(allowedVs[0]);
  }, [table, pos]);

  // Options
  const tableOptions = useMemo(() => Object.keys(FREQ_3B_ACTIONS), []);
  const posOptions   = useMemo(() => (scope?.heroPositions || []), [scope]);
  const vsOptions    = useMemo(() => (scope?.villainPositions || []).filter(v => v !== (pos || "")), [scope, pos]);

  // Accessors for TrainerShell
  function getFreq(t, p, v) {
    const node = FREQ_3B_ACTIONS[t]?.matrix?.[p]?.[v];
    return {
      raiseMap: node?.raiseMap || {},
      callMap: node?.callMap || {}
    };
  }
  function highKey(trainerId, t, p, v) {
    // Separate highs per action set
    return `high_${trainerId}_${t}_${p}_vs_${v}`;
  }

  const title =
    FREQ_3B_ACTIONS[table]?.title?.(pos || "", vsPos || "") ||
    "3-Bet/Call Trainer";

  if (!scope || !pos || !vsPos) return <div style={{ color: "#e6ecff" }}>Loading 3-bet ranges…</div>;

  return (
    <TrainerShell
      trainerId="THREEBET"
      title={title}
      table={table} setTable={setTable} tableOptions={tableOptions}
      pos={pos} setPos={setPos} posOptions={posOptions}
      vsPos={vsPos} setVsPos={setVsPos} vsOptions={vsOptions}
      getFreq={getFreq}
      highScoreKey={highKey}
      // Tell the shell this trainer supports Call
      supportsCall
    />
  );
}
