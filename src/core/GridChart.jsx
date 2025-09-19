import React from "react";
import { RANKS, colorForPct, handLabelFromKey } from "./Deck.js";

export default function GridChart({ highlight, freqMap, onCellClick }) {
  return (
    <div className="chart" style={{ marginTop: 10 }}>
      <div className="grid">
        {RANKS.map((r1, i) => (
          <div className="row" key={r1}>
            {RANKS.map((r2, j) => {
              let k;
              if (i === j) k = r1 + r2;
              else if (i < j) k = r1 + r2 + "s";
              else k = r2 + r1 + "o";
              const f = typeof freqMap[k] === "number" ? freqMap[k] : 0;
              const isHL = k === highlight;
              const style = {
                background: colorForPct(f),
                border: isHL ? "2px solid #ffda6b" : "1px solid #2a3245",
                color: "#fff",
                fontSize: 12,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                userSelect: "none",
                touchAction: "manipulation",
              };
              const label = handLabelFromKey(k);
              return (
                <div
                  key={k}
                  className="cell"
                  style={style}
                  title={`${label}: raise ${Math.round(f)}%`}
                  onClick={() => onCellClick?.(label, Math.round(f))}
                >
                  {label}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
