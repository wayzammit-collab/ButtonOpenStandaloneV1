import React, { useMemo } from "react";

// Classic, minimal 13x13 chart like earlier builds.
// - Square cells, no gradients, no labels inside cells.
// - Colors: raise=teal, call=blue, fold=slate.
// - Optional "show" to filter to All/Raise/Call.

export default function RangeChart({
  raiseMap = {},
  callMap = {},
  show = "ALL"
}) {
  const ranks = ['A','K','Q','J','T','9','8','7','6','5','4','3','2'];
  const grid = useMemo(() => {
    const cells = [];
    for (let r=0; r<13; r++){
      for (let c=0; c<13; c++){
        const hi = ranks[r], lo = ranks[c];
        const key = r===c ? hi+hi : (r<c ? hi+lo+'s' : hi+lo+'o');
        const rv = raiseMap[key] || 0;
        const cv = callMap[key]  || 0;
        let cls = "fold";
        if (rv>0 && cv===0) cls = "raise";
        else if (cv>0 && rv===0) cls = "call";
        else if (rv>0 && cv>0) cls = "mix"; // treat mixed as raise color by default
        if (show==='RAISE' && cls!=='raise' && cls!=='mix') cls = "off";
        if (show==='CALL'  && cls!=='call'  && cls!=='mix') cls = "off";
        cells.push({ key, cls });
      }
    }
    return cells;
  }, [raiseMap, callMap, show]);

  return (
    <div style={{
      display:"grid",
      gridTemplateColumns:"repeat(13, 24px)",
      gap:"3px",
      background:"#0c1628",
      padding:"10px",
      border:"1px solid #20304c",
      borderRadius:"10px"
    }}>
      {grid.map((c,i)=>(
        <div key={c.key+i} title={c.key} style={{
          width:"24px", height:"24px", borderRadius:"4px",
          background:
            c.cls==="raise" || c.cls==="mix" ? "#14b8a6" :
            c.cls==="call" ? "#3b82f6" :
            c.cls==="off" ? "#0e1a30" : "#1a2438"
        }}/>
      ))}
    </div>
  );
}
