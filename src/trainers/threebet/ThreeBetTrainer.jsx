import React, { useMemo, useState, useEffect } from "react";
import TrainerShell from "../../core/TrainerShell.jsx";
import { FREQ_3B_ACTIONS as BASE_3B } from "./freqMaps.js";
import { EXPLOIT_PROFILES, adjustRanges } from "./exploitProfiles.js";
import { parseJSONFile, parseCSVFile, mergeImportedRanges } from "../../utils/rangeLoader.js";

function TableOval({ table = "6MAX", hero, villain }) {
  const SEATS_6MAX = ["UTG","HJ","CO","BTN","SB","BB"];
  const SEATS_9MAX = ["UTG","UTG1","MP","HJ","CO","BTN","SB","BB","BB2"];
  const seats = table === "9MAX" ? SEATS_9MAX : SEATS_6MAX;
  return (
    <div className="scn-table-wrap">
      <div className="scn-table">
        <div className="scn-board-center">3‑Bet Trainer</div>
        {seats.map((p, i) => {
          const n = seats.length;
          const angle = (2 * Math.PI * i) / n - Math.PI / 2;
          const rx = 0.78, ry = 0.62;
          const cx = 0.5 + rx * Math.cos(angle) * 0.5;
          const cy = 0.5 + ry * Math.sin(angle) * 0.5;
          const isHero = p === hero, isVillain = p === villain;
          return (
            <div key={p+i}
                 className={`scn-seat ${isHero ? "hero" : isVillain ? "villain" : ""}`}
                 style={{ left:`${cx*100}%`, top:`${cy*100}%`, opacity: p==="BB2"?0.35:1 }}>
              {p==="BB2"?"BB":p}
              {isHero && <span className="hero-cards">H</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function ThreeBetTrainer() {
  const [ranges3B, setRanges3B] = useState(BASE_3B);

  const allowedTables = Object.keys(ranges3B);
  const [table, setTable] = useState(() => {
    const t = localStorage.getItem("three_table") || "6MAX";
    return allowedTables.includes(t) ? t : "6MAX";
  });

  const storedMode = localStorage.getItem("three_mode") || "GTO";
  const storedProfile = localStorage.getItem("three_profile") || "TIGHT_EP";
  const [mode, setMode] = useState(storedMode === "EXPLOIT" ? "EXPLOIT" : "GTO");
  const [profile, setProfile] = useState(EXPLOIT_PROFILES.some(p => p.id === storedProfile) ? storedProfile : "TIGHT_EP");
  useEffect(()=>{ localStorage.setItem("three_mode", mode); },[mode]);
  useEffect(()=>{ localStorage.setItem("three_profile", profile); },[profile]);

  const scope = ranges3B[table];
  const heroAll = scope?.heroPositions || [];
  const vilAll  = scope?.villainPositions || [];
  const [pos, setPos] = useState(() => {
    const s = localStorage.getItem("three_pos");
    return heroAll.includes(s) ? s : (heroAll[0] || "");
  });
  const [vsPos, setVsPos] = useState(() => {
    const s = localStorage.getItem("three_vs");
    return vilAll.includes(s) ? s : (vilAll[0] || "");
  });

  useEffect(()=>{ localStorage.setItem("three_table", table); },[table]);
  useEffect(()=>{ if(pos) localStorage.setItem("three_pos", pos); },[pos]);
  useEffect(()=>{ if(vsPos) localStorage.setItem("three_vs", vsPos); },[vsPos]);

  useEffect(() => {
    const s = ranges3B[table]; if (!s) return;
    if (!s.heroPositions.includes(pos)) { setPos(s.heroPositions[0]); return; }
    const allowedVs = s.villainPositions.filter(v => v !== pos);
    if (!allowedVs.includes(vsPos)) setVsPos(allowedVs[0] || s.villainPositions[0]);
  }, [table, pos, ranges3B]);

  const tableOptions = useMemo(() => Object.keys(ranges3B), [ranges3B]);
  const posOptions   = useMemo(() => heroAll, [heroAll]);
  const vsOptions    = useMemo(() => vilAll.filter(v => v !== (pos || "")), [vilAll, pos]);

  const baseTitle = ranges3B[table]?.title?.(pos || "", vsPos || "") || "3‑Bet/Call Trainer";
  const title = mode === "EXPLOIT" ? `${baseTitle} - Exploit` : baseTitle;

  function getFreq(t, p, v) {
    const node = ranges3B[t]?.matrix?.[p]?.[v];
    const baseRaise = node?.raiseMap || {};
    const baseCall  = node?.callMap || {};
    if (mode !== "EXPLOIT") return { raiseMap: baseRaise, callMap: baseCall };
    return adjustRanges({ table: t, hero: p, villain: v, raiseMap: baseRaise, callMap: baseCall, profileId: profile });
  }
  function highKey(trainerId, t, p, v) {
    const suffix = mode === "EXPLOIT" ? `_M_EXP_${profile}` : `_M_GTO`;
    return `high_${trainerId}_${t}_${p}_vs_${v}${suffix}`;
  }

  useEffect(() => {
    window.__trainer_get_gto = () => {
      const node = ranges3B[table]?.matrix?.[pos]?.[vsPos];
      if (!node) return null;
      return { raiseMap: node.raiseMap || {}, callMap: node.callMap || {} };
    };
    return () => { delete window.__trainer_get_gto; };
  }, [ranges3B, table, pos, vsPos]);

  async function onImportFiles(files) {
    let mergedData = {};
    let nav = null;
    for (const file of files) {
      try {
        const ext = file.name.toLowerCase().split(".").pop();
        const parsed = ext === "json" ? await parseJSONFile(file) : await parseCSVFile(file);
        mergedData = { ...mergedData, ...parsed.grouped };
        if (!nav && parsed.firstMeta && parsed.firstMeta.trainer === "THREEBET") {
          nav = { ...parsed.firstMeta, filename: parsed.filename };
        }
      } catch (e) { console.error("Import failed for", file.name, e); }
    }
    const newRanges = mergeImportedRanges(ranges3B, mergedData, "THREEBET");
    setRanges3B(newRanges);
    if (nav) {
      const t = nav.table || "6MAX";
      const h = nav.hero || "BTN";
      const v = nav.villain || "CO";
      if (Object.keys(newRanges).includes(t)) setTable(t);
      setPos(h);
      if (h !== v) setVsPos(v);
      if (nav.opponentStyle && EXPLOIT_PROFILES.some(p => p.id === nav.opponentStyle)) {
        setMode("EXPLOIT");
        setProfile(nav.opponentStyle);
      }
    }
  }

  // Session
  const [sessionOn, setSessionOn] = useState(false);
  const [sessionCount, setSessionCount] = useState(20);
  const [sessionDone, setSessionDone] = useState(0);
  const [sessionWrong, setSessionWrong] = useState([]);
  function startSession(){ setSessionDone(0); setSessionWrong([]); setSessionOn(true); }
  function markQuestion(result, handKey, bestLabel) {
    if (!sessionOn) return;
    setSessionDone(d => {
      const nd = d + 1;
      if (result !== "correct") setSessionWrong(w => [...w, { table, pos, vs: vsPos, handKey, best: bestLabel }]);
      if (nd >= sessionCount) setSessionOn(false);
      return nd;
    });
  }
  useEffect(() => {
    window.__trainer_on_answer = (res, key, best) => markQuestion(res, key, best);
    return () => { delete window.__trainer_on_answer; };
  }, [sessionOn, table, pos, vsPos, sessionCount]);

  if (!scope || !pos || !vsPos) return <div style={{ color:"#e6ecff", padding:12 }}>Loading 3‑bet ranges…</div>;

  return (
    <div className="trainer-wrap content">
      {/* Header controls row (separate from actions/table) */}
      <div className="tb-wrap">
        <div className="tb-row">
          <div className="tb-stat">Table</div>
          <select className="select" value={table} onChange={e => setTable(e.target.value)} style={{ width:120 }}>
            {tableOptions.map(t => <option key={t} value={t}>{t}</option>)}
          </select>

          <div className="tb-stat">Hero</div>
          <select className="select" value={pos} onChange={e => setPos(e.target.value)} style={{ width:140 }}>
            {posOptions.map(p => <option key={p} value={p}>{p}</option>)}
          </select>

          <div className="tb-stat">Vs</div>
          <select className="select" value={vsPos} onChange={e => setVsPos(e.target.value)} style={{ width:140 }}>
            {vsOptions.map(v => <option key={v} value={v}>{v}</option>)}
          </select>

          <div className="tb-stat">Mode</div>
          <select className="select" value={mode} onChange={e => setMode(e.target.value)} style={{ width:120 }}>
            <option value="GTO">GTO</option>
            <option value="EXPLOIT">Exploit</option>
          </select>

          {mode === "EXPLOIT" && (
            <>
              <div className="tb-stat">Opponent</div>
              <select className="select" value={profile} onChange={e => setProfile(e.target.value)} style={{ width:200 }}>
                {EXPLOIT_PROFILES.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
              </select>
            </>
          )}

          <div className="tb-stat">Import</div>
          <input className="input" type="file" multiple accept=".csv,.json"
                 onChange={e => onImportFiles(Array.from(e.target.files || []))}
                 style={{ padding:"4px 6px", maxWidth:280 }} />

          <div className="spacer" />

          <div className="tb-stat">Session</div>
          <select className="select" value={sessionCount} onChange={e => setSessionCount(Number(e.target.value))} style={{ width:84 }}>
            <option value={10}>10</option><option value={20}>20</option><option value={30}>30</option>
          </select>
          {!sessionOn ? (
            <button className="btn primary" onClick={startSession}>Start</button>
          ) : (
            <div className="tb-stat">{sessionDone}/{sessionCount}</div>
          )}
        </div>
      </div>

      {/* TrainerShell row with action bar and banner hooks */}
      <TrainerShell
        trainerId="THREEBET"
        title={title.replaceAll("—", "-")}
        table={table} setTable={setTable} tableOptions={tableOptions}
        pos={pos} setPos={setPos} posOptions={posOptions}
        vsPos={vsPos} setVsPos={setVsPos} vsOptions={vsOptions}
        getFreq={getFreq}
        highScoreKey={highKey}
        supportsCall
        autoNextDelay={250}
        classNames={{ actions:"action-bar", banner:"result-banner" }}
      />

      {/* Table row — keeps separate so no overlap with text/cards */}
      <TableOval table={table} hero={pos} villain={vsPos} />

      {!sessionOn && sessionDone > 0 && (
        <div className="chart-wrap">
          <div style={{ color:"#e6ecff", marginBottom:6 }}>Session complete — {sessionDone} hands</div>
          <div style={{ color:"#9fb0d1", marginBottom:8 }}>
            Accuracy: {Math.round(100 * (sessionDone - sessionWrong.length) / sessionDone)}%
          </div>
          {sessionWrong.length > 0 && (
            <button className="btn good" onClick={startSession}>Retry mistakes</button>
          )}
        </div>
      )}
    </div>
  );
}
