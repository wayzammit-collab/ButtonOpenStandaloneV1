import React, { useState } from "react";
import OpenTrainer from "./trainers/open/OpenTrainer.jsx";
import ThreeBetTrainer from "./trainers/threebet/ThreeBetTrainer.jsx";
import "./styles.css";

export default function App() {
  const [mode, setMode] = useState(() => localStorage.getItem("trainer_mode") || "OPEN");
  function setModePersist(m) { setMode(m); localStorage.setItem("trainer_mode", m); }

  return (
    <div className="wrap">
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
        <label>
          Trainer
          <select
            value={mode}
            onChange={e => setModePersist(e.target.value)}
            style={{ marginLeft: 8, background: "#0b1220", color: "#e6ecff", border: "1px solid #2a3245", borderRadius: 6, padding: "4px 8px" }}
          >
            <option value="OPEN">Open (RFI)</option>
            <option value="THREEBET">3-Bet</option>
          </select>
        </label>
      </div>

      {mode === "OPEN" ? <OpenTrainer /> : <ThreeBetTrainer />}
    </div>
  );
}
