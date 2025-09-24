import React, { useMemo, useState, useEffect } from "react";
import TrainerShell from "../../core/TrainerShell.jsx";
import { FREQ_MAPS as OPEN_MAPS } from "../../freqMaps.js";

export default function OpenTrainer() {
  const [table, setTable] = useState(() => localStorage.getItem("open_table") || "6MAX");
  const [pos, setPos] = useState(() => {
    const saved = localStorage.getItem("open_pos");
    const fallback = OPEN_MAPS[table].positions[0];
    return saved && OPEN_MAPS[table].positions.includes(saved) ? saved : fallback;
  });

  useEffect(() => { localStorage.setItem("open_table", table); }, [table]);
  useEffect(() => { localStorage.setItem("open_pos", pos); }, [pos]);

  const tableOptions = useMemo(() => Object.keys(OPEN_MAPS), []);
  const posOptions = useMemo(() => OPEN_MAPS[table].positions, [table]);

  function getFreq(t, p) { return OPEN_MAPS[t].maps[p]; }
  function highKey(trainerId, t, p) { return `high_${trainerId}_${t}_${p}`; }

  const title = OPEN_MAPS[table].titles[pos];

  return (
    <div className="trainer-wrap content">
      {/* Header controls row */}
      <div className="tb-wrap">
        <div className="tb-row">
          <div className="tb-stat">Table</div>
          <select className="select" value={table} onChange={e => setTable(e.target.value)} style={{ width:140 }}>
            {tableOptions.map(t => <option key={t} value={t}>{t}</option>)}
          </select>

          <div className="tb-stat">Pos</div>
          <select className="select" value={pos} onChange={e => setPos(e.target.value)} style={{ width:140 }}>
            {posOptions.map(p => <option key={p} value={p}>{p}</option>)}
          </select>

          <div className="spacer" />
          <div className="tb-stat">Open Trainer</div>
        </div>
      </div>

      {/* TrainerShell handles action bar and result banner; ensure it is its own row */}
      <TrainerShell
        trainerId="OPEN"
        title={title}
        table={table} setTable={setTable} tableOptions={tableOptions}
        pos={pos} setPos={setPos} posOptions={posOptions}
        getFreq={getFreq}
        highScoreKey={highKey}
        classNames={{ actions: "action-bar", banner: "result-banner" }}
      />

      {/* Any chart should live below in its own row to avoid overlap */}
      {/* If TrainerShell renders a chart container, wrap it with chart-wrap class */}
    </div>
  );
}
