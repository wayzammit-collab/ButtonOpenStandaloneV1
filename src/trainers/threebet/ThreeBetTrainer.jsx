import React, { useMemo, useState, useEffect } from "react";
import TrainerShell from "../../core/TrainerShell.jsx";
import { FREQ_3B_NESTED } from "./freqMaps.js";

export default function ThreeBetTrainer() {
  // Sanitize table from localStorage
  const allowedTables = Object.keys(FREQ_3B_NESTED);
  const storedTable = localStorage.getItem("three_table") || "6MAX";
  const initialTable = allowedTables.includes(storedTable) ? storedTable : "6MAX";
  const [table, setTable] = useState(initialTable);

  // Scope for current table
  const scope = FREQ_3B_NESTED[table];

  // Build initial hero/villain from scope + storage
  const heroAll = scope?.heroPositions || [];
  const vilAll  = scope?.villainPositions || [];

  const storedPos = localStorage.getItem("three_pos");
  const storedVs  = localStorage.getItem("three_vs");

  const [pos, setPos] = useState(() =>
    heroAll.includes(storedPos) ? storedPos : (heroAll[0] || "")
  );
  const [vsPos, setVsPos] = useState(() =>
    vilAll.includes(storedVs) ? storedVs : (vilAll[0] || "")
  );

  // Persist selections
  useEffect(() => { localStorage.setItem("three_table", table); }, [table]);
  useEffect(() => { if (pos) localStorage.setItem("three_pos", pos); }, [pos]);
  useEffect(() => { if (vsPos) localStorage.setItem("three_vs", vsPos); }, [vsPos]);

  // If table changes, or hero changes, keep both valid and different
  useEffect(() => {
    const s = FREQ_3B_NESTED[table];
    if (!s) return;

    // Ensure hero valid
    if (!s.heroPositions.includes(pos)) {
      setPos(s.heroPositions[0]);
      return; // next render will re-run and fix vs
    }

    // Ensure villain valid and not equal to hero
    const allowedVs = s.villainPositions.filter(v => v !== pos);
    if (!allowedVs.length) return;
    if (!allowedVs.includes(vsPos)) {
      setVsPos(allowedVs[0]);
    }
  }, [table, pos]);

  // Options for selects
  const tableOptions = useMemo(() => Object.keys(FREQ_3B_NESTED), []);
  const posOptions   = useMemo(() => (scope?.heroPositions || []), [scope]);
  // Filter villain list to exclude current hero pos
  const vsOptions    = useMemo(
    () => (scope?.villainPositions || []).filter(v => v !== (pos || "")),
    [scope, pos]
  );

  // Safe accessors
  function getFreq(t, p, v) {
    return FREQ_3B_NESTED[t]?.matrix?.[p]?.[v] || {};
  }
  function highKey(trainerId, t, p, v) {
    return `high_${trainerId}_${t}_${p}_vs_${v}`;
  }

  const title =
    FREQ_3B_NESTED[table]?.title?.(pos || "", vsPos || "") ||
    "3-Bet Trainer";

  // Minimal guard during first render
  if (!scope || !pos || !vsPos) {
    return <div style={{ color: "#e6ecff" }}>Loading 3-bet ranges…</div>;
  }

  return (
    <TrainerShell
      trainerId="THREEBET"
      title={title}
      table={table} setTable={setTable} tableOptions={tableOptions}
      pos={pos} setPos={setPos} posOptions={posOptions}
      vsPos={vsPos} setVsPos={setVsPos} vsOptions={vsOptions}
      getFreq={getFreq}
      highScoreKey={highKey}
    />
  );
}
