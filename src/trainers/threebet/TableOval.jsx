import React from "react";

// Simple seat map per table size; order clockwise starting from UTG
const SEATS_6MAX = ["UTG","HJ","CO","BTN","SB","BB"];
const SEATS_9MAX = ["UTG","UTG1","MP","HJ","CO","BTN","SB","BB","BB2"]; // BB2 placeholder to fill 9 seats visually

function seatLabel(pos) {
  return pos;
}

export default function TableOval({ table = "6MAX", hero, villain }) {
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
          const rx = 0.78; // x radius factor
          const ry = 0.62; // y radius factor
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
              title={seatLabel(p)}
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
                opacity: p === "BB2" ? 0.35 : 1, // dim placeholder
              }}
            >
              {p === "BB2" ? "BB" : seatLabel(p)}
            </div>
          );
        })}
      </div>
    </div>
  );
}
