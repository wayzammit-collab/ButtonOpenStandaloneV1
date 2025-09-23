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
          const angle = (2 * Math.PI * i) / n - Math.PI / 2;
          const rx = 0.78, ry = 0.62;
          const cx = 0.5 + rx * Math.cos(angle) * 0.5;
          const cy = 0.5 + ry * Math.sin(angle) * 0.5;
          const isHero = p === hero, isVillain = p === villain;

          return (
            <div
              key={p + i}
              title={p}
              style={{
                position: "absolute",
                left: `${cx * 100}%`,
                top: `${cy * 100}%`,
                transform: "translate(-50%, -50%)",
                width: 88,
                height: 34,
                background: isHero ? "#2b8a3e" : isVillain ? "#a61e4d" : "#111a2b",
                color: "#e6ecff",
                border: `1px solid ${isHero || isVillain ? "#ffda6b" : "#2a3245"}`,
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
  // Data source
  const [ranges3B, setRanges3B] = useState(BASE_3B);

  // Table
  const allowedTables = Object.keys(ranges3B);
  const storedTable = localStorage.getItem("three_table") || "6MAX";
  const [table, setTable] = useState(allowedTables.includes(storedTable) ? storedTable : "6MAX");

  // Mode/profile
  const storedMode = localStorage.getItem("three_mode") || "GTO";
  const storedProfile = localStorage.getItem("three_profile") || "TIGHT_EP";
  const [mode, setMode] = useState(storedMode === "EXPLOIT" ? "EXPLOIT" : "GTO");
  const [profile, setProfile] = useState(EXPLOIT_PROFILES.some(p => p.id === storedProfile) ? storedProfile : "TIGHT_EP");
  useEffect(() => { localStorage.setItem("three_mode", mode); }, [mode]);
  useEffect(() => { localStorage.setItem("three_profile", profile); }, [profile]);

  // Imported banner
  const [importBanner, setImportBanner] = useState(null);

  // Scope and positions
  const scope = ranges3B[table];
  const heroAll = scope?.heroPositions || [];
  const vilAll  = scope?.villainPositions || [];

  const storedPos = localStorage.getItem("three_pos");
  const storedVs  = localStorage.getItem("three_vs");
  const [pos, setPos] = useState(() => heroAll.includes(storedPos) ? storedPos : (heroAll[0] || ""));
  const [vsPos, setVsPos] = useState(() => vilAll.includes(storedVs) ? storedVs : (vilAll[0] || ""));
  useEffect(() => { localStorage.setItem("three_table", table); }, [table]);
  useEffect(() => { if (pos) localStorage.setItem("three_pos", pos); }, [pos]);
  useEffect(() => { if (vsPos) localStorage.setItem("three_vs", vsPos); }, [vsPos]);

  useEffect(() => {
    const s = ranges3B[table]; if (!s) return;
    if (!s.heroPositions.includes(pos)) { setPos(s.heroPositions[0]); return; }
    const allowedVs = s.villainPositions.filter(v => v !== pos);
    if (!allowedVs.includes(vsPos)) setVsPos(allowedVs[0] || s.villainPositions[0]);
  }, [table, pos, ranges3B]);

  const tableOptions = useMemo(() => Object.keys(ranges3B), [ranges3B]);
  const posOptions   = useMemo(() => heroAll, [heroAll]);
  const vsOptions    = useMemo(() => vilAll.filter(v => v !== (pos || "")), [vilAll, pos]);

  // Title
  const baseTitle = ranges3B[table]?.title?.(pos || "", vsPos || "") || "3-Bet/Call Trainer";
  const title = mode === "EXPLOIT" ? `${baseTitle} - Exploit` : baseTitle;

  // Frequencies (with exploit)
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

  // Import handler: merge, auto-navigate to the file’s spot, set mode/profile if provided
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
      } catch (e) {
        console.error("Import failed for", file.name, e);
      }
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
      setImportBanner({ filename: nav.filename || "import", table: t, hero: h, villain: v, profile: nav.opponentStyle || "" });
    }
  }

  // Session mode
  const [sessionOn, setSessionOn] = useState(false);
  const [sessionCount, setSessionCount] = useState(20);
  const [sessionDone, setSessionDone] = useState(0);
  const [sessionWrong, setSessionWrong] = useState([]);
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

  if (!scope || !pos || !vsPos) return <div style={{ color: "#e6ecff" }}>Loading 3-bet ranges…</div>;

  return (
    <>
      {/* Top controls */}
      <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", marginBottom: 6 }}>
        <label title="Training mode">
          Mode
          <select value={mode} onChange={e => setMode(e.target.value)}
                  style={{ marginLeft: 6, background: "#0b1220", color: "#e6ecff", border: "1px solid #2a3245", borderRadius: 6, padding: "4px 8px" }}>
            <option value="GTO">GTO</option>
            <option value="EXPLOIT">Exploit</option>
          </select>
        </label>

        {mode === "EXPLOIT" && (
          <label title="Opponent model">
            Opponent
            <select value={profile} onChange={e => setProfile(e.target.value)}
                    style={{ marginLeft: 6, background: "#0b1220", color: "#e6ecff", border: "1px solid #2a3245", borderRadius: 6, padding: "4px 8px" }}>
              {EXPLOIT_PROFILES.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
            </select>
          </label>
        )}

        <label title="Import solver ranges (CSV/JSON)">
          Import
          <input type="file" multiple accept=".csv,.json"
                 onChange={e => onImportFiles(Array.from(e.target.files || []))}
                 style={{ marginLeft: 6, background: "#0b1220", color: "#e6ecff", border: "1px solid #2a3245", borderRadius: 6, padding: "2px 6px" }} />
        </label>

        {/* Session controls */}
        <div style={{ marginLeft: "auto", display: "flex", gap: 10, alignItems: "center" }}>
          <label title="Questions in this session">
            Session
            <select value={sessionCount} onChange={e => setSessionCount(Number(e.target.value))}
                    style={{ marginLeft: 6, background: "#0b1220", color: "#e6ecff", border: "1px solid #2a3245", borderRadius: 6, padding: "4px 8px" }}>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={30}>30</option>
            </select>
          </label>
          {!sessionOn ? (
            <button onClick={() => { setSessionDone(0); setSessionWrong([]); setSessionOn(true); }} style={{ minHeight: 32 }}>
              Start
            </button>
          ) : (
            <div style={{ color: "#a8b2c7" }}>{sessionDone}/{sessionCount}</div>
          )}
        </div>
      </div>

      {importBanner && (
        <div style={{ margin: "6px 0 8px", background: "#0b1220", border: "1px solid #2a3245", borderRadius: 8, padding: "6px 10px", color: "#e6ecff" }}>
          Imported: {importBanner.filename} • {importBanner.table} {importBanner.hero} vs {importBanner.villain}
          {importBanner.profile ? ` • Opponent: ${importBanner.profile}` : ""}
        </div>
      )}

      <TrainerShell
        trainerId="THREEBET"
        title={title.replaceAll("—", "-")}
        table={table} setTable={setTable} tableOptions={tableOptions}
        pos={pos} setPos={setPos} posOptions={posOptions}
        vsPos={vsPos} setVsPos={setVsPos} vsOptions={vsOptions}
        getFreq={getFreq}
        highScoreKey={highKey}
        supportsCall
        allowSkip
      />

      <TableOval table={table} hero={pos} villain={vsPos} />

      {!sessionOn && sessionDone > 0 && (
        <div style={{ marginTop: 12, background: "#111a2b", border: "1px solid #2a3245", borderRadius: 10, padding: "10px 12px", color: "#e6ecff" }}>
          <div style={{ marginBottom: 6 }}>Session complete — {sessionDone} hands</div>
          <div style={{ marginBottom: 6, color: "#a8b2c7" }}>
            Accuracy: {Math.round(100 * (sessionDone - sessionWrong.length) / sessionDone)}%
          </div>
          {sessionWrong.length > 0 && (
            <button onClick={() => { setSessionDone(0); setSessionWrong([]); setSessionOn(true); }} style={{ minHeight: 34 }}>
              Retry mistakes
            </button>
          )}
        </div>
      )}
    </>
  );
}
