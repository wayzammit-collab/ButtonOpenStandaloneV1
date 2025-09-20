// Three-bet trainer frequencies for 100bb cash
// Nested by table -> heroPos -> vsPos -> { raiseMap, callMap }
// Implementable baselines; refine with solver data later.

const LIN = { "AA":100,"KK":100,"QQ":100,"JJ":100,"TT":100,"99":90,"88":70,"AKs":100,"AQs":100,"AJs":80,"ATs":60,"AKo":100,"AQo":70 };
const POL = { "A5s":60,"A4s":50,"KQs":50,"KJs":40,"QJs":30,"JTs":30,"T9s":25 };
const m = (...o) => Object.assign({}, ...o);

// Villain-specific raise tweaks (3-bet)
const vsUTG_R = base => m(base, { "AJo":20,"KQo":10 });
const vsHJ_R  = base => m(base, POL, { "AJo":40,"KQo":30,"KTs":30 });
const vsCO_R  = base => m(base, POL, { "AJo":60,"KQo":50,"KTs":40,"QTs":30,"98s":25 });
const vsBTN_R = base => m(base, POL, { "AJo":70,"KQo":60,"KTs":50,"QTs":40,"J9s":25 });
const vsSB_R  = base => m(base, POL, { "AJo":50,"KQo":40,"KTs":35,"QTs":30 });

// Simple call baselines (binary for now: 100=call allowed, 0=never)
// BTN/BB flats more vs late; early vs early mostly no flats in rakey games.
const CALL_TIGHT = {
  // mostly no-calls vs very early seats
  "AKs":0,"AQs":0,"AJs":0,"ATs":0,"KQs":0,"QJs":0,"JTs":0,"TT":0,"99":0,"88":0
};
const CALL_LATE = {
  // example BTN/BB vs CO/BTN flats
  "KQs":100,"QJs":100,"JTs":100,"TT":100,"99":100,"88":100,"AJs":60,"ATs":40,"AQs":40,"KJs":40,"T9s":60,"98s":40
};

// Build 6-max matrices
const HERO6 = ["UTG","HJ","CO","BTN","SB"];
const VIL6  = ["UTG","HJ","CO","BTN","SB"];
function build6() {
  const map = {};
  for (const h of HERO6) {
    map[h] = {};
    for (const v of VIL6) {
      // Raise map
      let raise;
      if (v === "UTG") raise = vsUTG_R(LIN);
      else if (v === "HJ") raise = vsHJ_R(LIN);
      else if (v === "CO") raise = vsCO_R(LIN);
      else if (v === "BTN") raise = vsBTN_R(LIN);
      else raise = vsSB_R(LIN);

      // Call map heuristic
      let call = CALL_TIGHT;
      if ((h === "BTN" && (v === "CO" || v === "HJ")) || (h === "BB" && (v === "SB" || v === "BTN")) || (h === "SB" && v === "BTN") || (h === "CO" && v === "BTN")) {
        call = CALL_LATE;
      }
      map[h][v] = { raiseMap: raise, callMap: call };
    }
  }
  return map;
}

// 9-max matrices (earlier villains tighter for raises; calls even tighter early)
const HERO9 = ["UTG","UTG1","MP","HJ","CO","BTN","SB"];
const VIL9  = ["UTG","UTG1","MP","HJ","CO","BTN","SB"];
const tighterR = base => m(base, { "99":70,"88":50,"AJs":70,"ATs":40,"AJo":20,"KQo":10 });
function build9() {
  const map = {};
  for (const h of HERO9) {
    map[h] = {};
    for (const v of VIL9) {
      // Raise
      let raise;
      if (v === "UTG" || v === "UTG1") raise = tighterR(LIN);
      else if (v === "MP" || v === "HJ") raise = vsHJ_R(LIN);
      else if (v === "CO") raise = vsCO_R(LIN);
      else if (v === "BTN") raise = vsBTN_R(LIN);
      else raise = vsSB_R(LIN);

      // Call
      let call = CALL_TIGHT;
      const lateOpen = (v === "CO" || v === "BTN");
      const heroLate = (h === "HJ" || h === "CO" || h === "BTN" || h === "SB" || h === "BB");
      if (lateOpen && heroLate) call = CALL_LATE;
      map[h][v] = { raiseMap: raise, callMap: call };
    }
  }
  return map;
}

export const FREQ_3B_ACTIONS = {
  "6MAX": {
    heroPositions: HERO6,
    villainPositions: VIL6,
    matrix: build6(),
    title: (hero, vil) => `${hero} vs ${vil} — 3-Bet/Call — 100bb Cash (6-max)`
  },
  "9MAX": {
    heroPositions: HERO9,
    villainPositions: VIL9,
    matrix: build9(),
    title: (hero, vil) => `${hero} vs ${vil} — 3-Bet/Call — 100bb Cash (9-max)`
  }
};
