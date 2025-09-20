import React, { useMemo, useState, useEffect } from "react";
import TrainerShell from "../../core/TrainerShell.jsx";
import { FREQ_3B_ACTIONS } from "./freqMaps.js";

// Inline visual: oval poker table with seats highlighted
function TableOval({ table = "6MAX", hero, villain }) {
  const SEATS_6MAX = ["UTG","HJ","CO","BTN","SB","BB"];
  const SEATS_9MAX = ["UTG","UTG1","MP","HJ","CO","BTN","SB","BB","BB2"]; // BB2 to fill 9 seats visually
  const seats = table === "9MAX" ? SEATS_9MAX : SEATS_6MAX;

  return (
    <div style={{ display: "flex", justifyContent: "center", marginTop: 10 }}>
      <div
        style={{
          width: 560,
          maxWidth: "98%",
          height: 220,
          background: "radial-gradient(ellipse at center, #0f1726 0%, #0b1220 70%)",
          border: "2px solid #2a3245",
          borderRadius: "50%/40%",
          position: "relative",
          boxShadow: "0 0 0 6px rgba(17,26,43,0.6) inset",
        }}
      >
        {seats.map((p, i) => {
          const n = seats.length;
          const angle = (2 * Math.PI * i) / n - Math.PI / 2; // start at top
          const rx = 0.78, ry = 0.62;
          const cx = 0.5 + rx * Math.cos(angle) * 0.5;
          const cy = 0.5 + ry * Math.sin(angle) * 0.5;
          const left = `${cx * 100}%`;
          const top = `${cy * 100}%`;

          const isHero = p === hero;
          const isVillain = p === villain;
          const bg = isHero ? "#2b8a3e" : isVillain ? "#a61e4d" : "#111a2b";
          const border = isHero || isVillain ? "#ffda6b" : "#2a3245";

          return (
            <div
              key={p + i}
              title={p}
              style={{
                position: "absolute",
                left,
                top,
                transform: "translate(-50%, -50%)",
                width: 88,
                height: 34,
                background: bg,
                color: "#e6ecff",
                border: `1px solid ${border}`,
                borderRadius: 18,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 13,
                boxShadow: isHero || isVillain ? "0 0 0 2px rgba(255,218,107,0.3)" : "none",
                opacity: p === "BB2" ? 0.35 : 1,
              }}
            >
              {p === "BB2" ? "BB" : p}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function ThreeBetTrainer() {
  // Table
  const allowedTables = Object.keys(FREQ_3B_ACTIONS);
  const storedTable = localStorage.getItem("three_table") || "6MAX";
  const [table, setTable] = useState(allowedTables.includes(storedTable) ? storedTable : "6MAX");

  // Scope
  const scope = FREQ_3B_ACTIONS[table];

  // Positions
  const heroAll = scope?.heroPositions || [];
  const vilAll  = scope?.villainPositions || [];

  // Stored picks
  const storedPos = localStorage.getItem("three_pos");
  const storedVs  = localStorage.getItem("three_vs");

  const [pos, setPos] = useState(() => heroAll.includes(storedPos) ? storedPos : (heroAll[0] || ""));
  const [vsPos, setVsPos] = useState(() => vilAll.includes(storedVs) ? storedVs : (vilAll[0] || ""));

  // Persist
  useEffect(() => { localStorage.setItem("three_table", table); }, [table]);
  useEffect(() => { if (pos) localStorage.setItem("three_pos", pos); }, [pos]);
  useEffect(() => { if (vsPos) localStorage.setItem("three_vs", vsPos); }, [vsPos]);

  // Keep valid and different
  useEffect(() => {
    const s = FREQ_3B_ACTIONS[table];
    if (!s) return;
    if (!s.heroPositions.includes(pos)) {
      setPos(s.heroPositions[0]); return;
    }
    const allowedVs = s.villainPositions.filter(v => v !== pos);
    if (!allowedVs.length) return;
    if (!allowedVs.includes(vsPos)) setVsPos(allowedVs[0]);
  }, [table, pos]);

  // Options for table select; keep dropdowns for pos/vs as before
  const tableOptions = useMemo(() => Object.keys(FREQ_3B_ACTIONS), []);
  const posOptions   = useMemo(() => heroAll, [heroAll]);
  const vsOptions    = useMemo(() => vilAll.filter(v => v !== (pos || "")), [vilAll, pos]);

  // Provide data to shell
  function getFreq(t, p, v) {
    const node = FREQ_3B_ACTIONS[t]?.matrix?.[p]?.[v];
    return { raiseMap: node?.raiseMap || {}, callMap: node?.callMap || {} };
  }
  function highKey(trainerId, t, p, v) { return `high_${trainerId}_${t}_${p}_vs_${v}`; }

  const title = FREQ_3B_ACTIONS[table]?.title?.(pos || "", vsPos || "") || "3-Bet/Call Trainer";

  if (!scope || !pos || !vsPos) return <div style={{ color: "#e6ecff" }}>Loading 3-bet ranges…</div>;

  return (
    <>
      <TrainerShell
        trainerId="THREEBET"
        title={title.replaceAll("—", "-")}
        table={table} setTable={setTable} tableOptions={tableOptions}
        pos={pos} setPos={setPos} posOptions={posOptions}
        vsPos={vsPos} setVsPos={setVsPos} vsOptions={vsOptions}
        getFreq={getFreq}
        highScoreKey={highKey}
        supportsCall
      />

      {/* Visual aid: static oval showing the current hero/villain seats */}
      <TableOval table={table} hero={pos} villain={vsPos} />
    </>
  );
}
