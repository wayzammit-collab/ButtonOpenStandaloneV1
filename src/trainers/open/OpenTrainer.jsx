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
    <TrainerShell
      trainerId="OPEN"
      title={title}
      table={table} setTable={setTable} tableOptions={tableOptions}
      pos={pos} setPos={setPos} posOptions={posOptions}
      getFreq={getFreq}
      highScoreKey={highKey}
    />
  );
}
