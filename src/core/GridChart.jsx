import React, { useMemo, useState } from "react";

const RANKS = ["A","K","Q","J","T","9","8","7","6","5","4","3","2"];

function lerp(a,b,t){ return a+(b-a)*t; }
function toHex(x){ const h=Math.round(x).toString(16).padStart(2,"0"); return h; }
function rgb(r,g,b){ return `#${toHex(r)}${toHex(g)}${toHex(b)}`; }
function greenScale(p){ const t = p/100; return rgb(lerp(34,13,t), lerp(139,181,t), lerp(93,74,t)); }
function blueScale(p){ const t = p/100; return rgb(lerp(40,11,t), lerp(88,110,t), lerp(135,201,t)); }
const FOLD_COL = "#384055";
const BORDER_BASE = "#2a3245";
const BORDER_HILITE = "#ffd966";

function keyFrom(i,j){
  const hi = RANKS[i], lo = RANKS[j];
  if (i===j) return hi+lo;
  return i<j ? hi+lo+"s" : hi+lo+"o";
}
function bestAction(r,c){
  const R = Math.max(0,Math.min(100,r||0));
  const C = Math.max(0,Math.min(100,c||0));
  const F = Math.max(0,100 - Math.max(R,C));
  if (R >= C && R >= F) return { tag:"R", col: greenScale(R), pct:R };
  if (C >= R && C >= F) return { tag:"C", col: blueScale(C), pct:C };
  return { tag:"F", col: FOLD_COL, pct:F };
}

export default function GridChart({
  raiseMap = {},
  callMap = {},
  mode = "RAISE",
  compare = null,
  highlight = null,
  onCellClick = () => {},
}) {
  const cells = useMemo(() => {
    const arr = [];
    for (let i=0;i<13;i++){
      for (let j=0;j<13;j++){
        const k = keyFrom(i,j);
        const r = typeof raiseMap[k]==="number" ? raiseMap[k] : 0;
        const c = typeof callMap[k]==="number" ? callMap[k] : 0;
        let bg = FOLD_COL;
        if (mode==="RAISE") bg = greenScale(r);
        else if (mode==="CALL") bg = blueScale(c);
        else bg = bestAction(r,c).col;

        // Compare delta (right - left)
        let border = BORDER_BASE;
        if (compare){
          const Lr = compare.left?.raiseMap?.[k] ?? 0;
          const Lc = compare.left?.callMap?.[k] ?? 0;
          const Rr = compare.right?.raiseMap?.[k] ?? 0;
          const Rc = compare.right?.callMap?.[k] ?? 0;
          if (mode==="BEST") {
            const Lb = bestAction(Lr,Lc).tag, Rb = bestAction(Rr,Rc).tag;
            if (Lb !== Rb) border = "#ffda6b";
          } else if (mode==="RAISE") {
            const d = Rr - Lr;
            if (d > 5) border = "#8a6df5";
            else if (d < -5) border = "#ff9f59";
          } else {
            const d = Rc - Lc;
            if (d > 5) border = "#8a6df5";
            else if (d < -5) border = "#ff9f59";
          }
        }

        arr.push({ i,j,k, r, c, bg, border });
      }
    }
    return arr;
  }, [raiseMap, callMap, mode, compare]);

  const [hover, setHover] = useState(null);

  // Build grid with headers
  return (
    <div style={{ overflowX:"auto", border:"1px solid #2a3245", borderRadius: 10, marginTop: 10 }}>
      <div style={{ display:"grid", gridTemplateColumns:"28px repeat(13, 32px)", gridAutoRows:"32px", gap: 1, background:"#2a3245", padding: 6 }}>
        {/* Top-left empty corner */}
        <div style={{ width:28, height:32, background:"#0b1220" }} />
        {/* Column headers (lo rank) */}
        {RANKS.map(r => (
          <div key={"h-"+r} style={{ width:32, height:32, background:"#0b1220", color:"#a8b2c7",
                                      display:"flex", alignItems:"center", justifyContent:"center", fontSize:12 }}>{r}</div>
        ))}
        {/* Rows */}
        {RANKS.map((rSym, i) => (
          <React.Fragment key={"row-"+rSym}>
            {/* Row header (hi rank) */}
            <div style={{ width:28, height:32, background:"#0b1220", color:"#a8b2c7",
                          display:"flex", alignItems:"center", justifyContent:"center", fontSize:12 }}>{rSym}</div>
            {/* Cells */}
            {cells.slice(i*13, i*13+13).map(cell => {
              const isHi = highlight && cell.k === highlight;
              const label = cell.k;
              // deemphasize label if both raise and call are 0 (pure fold)
              const dim = (cell.r|0)===0 && (cell.c|0)===0;
              return (
                <div
                  key={cell.k}
                  role="button"
                  onMouseEnter={() => setHover({k: cell.k, r: cell.r, c: cell.c})}
                  onMouseLeave={() => setHover(null)}
                  onClick={() => onCellClick(cell.k, mode==="CALL" ? cell.c : cell.r)}
                  style={{
                    width: 32, height: 32,
                    background: cell.bg,
                    border: `1px solid ${isHi ? BORDER_HILITE : cell.border}`,
                    borderRadius: 4,
                    position:"relative",
                    cursor:"pointer",
                    display:"flex", alignItems:"center", justifyContent:"center",
                    color: dim ? "rgba(230,236,255,0.35)" : "rgba(230,236,255,0.9)",
                    fontSize: 10, fontWeight: 600
                  }}
                  title={`${cell.k} — 3‑Bet ${cell.r|0}% • Call ${cell.c|0}% • Fold ${(100 - Math.max(cell.r, cell.c))|0}%`}
                >
                  {label}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>

      <div style={{ padding:"6px 8px", color:"#a8b2c7", fontSize:13 }}>
        {hover
          ? `${hover.k} • 3‑Bet ${hover.r|0}% • Call ${hover.c|0}% • Fold ${(100 - Math.max(hover.r, hover.c))|0}%`
          : (compare ? "Compare on: purple = more than baseline, orange = less, gold = best‑action changed" : "Hover a cell for details")}
      </div>
    </div>
  );
}
