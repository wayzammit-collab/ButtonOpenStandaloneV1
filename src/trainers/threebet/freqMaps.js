// Three-bet trainer frequencies for 100bb cash (baseline scaffolds)
// Nested: table -> heroPos -> vsPos -> { raiseMap, callMap }

const LIN = { "AA":100,"KK":100,"QQ":100,"JJ":100,"TT":100,"99":90,"88":70,"AKs":100,"AQs":100,"AJs":80,"ATs":60,"AKo":100,"AQo":70 };
const POL = { "A5s":60,"A4s":50,"KQs":50,"KJs":40,"QJs":30,"JTs":30,"T9s":25 };
const m = (...o) => Object.assign({}, ...o);

// Raise baselines by opener seat
const vsUTG_R = b => m(b, { "AJo":20,"KQo":10 });
const vsHJ_R  = b => m(b, POL, { "AJo":40,"KQo":30,"KTs":30 });
const vsCO_R  = b => m(b, POL, { "AJo":60,"KQo":50,"KTs":40,"QTs":30,"98s":25 });
const vsBTN_R = b => m(b, POL, { "AJo":70,"KQo":60,"KTs":50,"QTs":40,"J9s":25 });
const vsSB_R  = b => m(b, POL, { "AJo":50,"KQo":40,"KTs":35,"QTs":30 });
const vsBB_R  = b => m(b, POL, { "AJo":45,"KQo":35,"KTs":30,"QTs":25 }); // opener is BB only in special cases; keep similar to SB

// Call baselines
const CALL_TIGHT = { "AKs":0,"AQs":0,"AJs":0,"ATs":0,"KQs":0,"QJs":0,"JTs":0,"TT":0,"99":0,"88":0 };
const CALL_LATE = { "KQs":100,"QJs":100,"JTs":100,"TT":100,"99":100,"88":100,"AJs":60,"ATs":40,"AQs":40,"KJs":40,"T9s":60,"98s":40 };

// Generic builder for a seat pair
function raiseByVillain(v) {
  if (v === "UTG" || v === "UTG1") return vsUTG_R(LIN);
  if (v === "MP" || v === "HJ")    return vsHJ_R(LIN);
  if (v === "CO")                  return vsCO_R(LIN);
  if (v === "BTN")                 return vsBTN_R(LIN);
  if (v === "SB")                  return vsSB_R(LIN);
  return vsBB_R(LIN);
}
function callByMatchup(hero, villain, tableTag) {
  // IP flats mainly BTN/BB vs late opens; SB vs BTN some flats.
  const late = ["CO","BTN"];
  const ipHero = (hero === "BTN" || hero === "CO" || hero === "BB");
  const vsLate = late.includes(villain);
  if ((ipHero && vsLate) || (hero === "SB" && villain === "BTN")) return CALL_LATE;
  return CALL_TIGHT;
}

// 6-max with BB added as hero seat
const HERO6 = ["UTG","HJ","CO","BTN","SB","BB"];
const VIL6  = ["UTG","HJ","CO","BTN","SB","BB"];
function build6() {
  const map = {};
  for (const h of HERO6) {
    map[h] = {};
    for (const v of VIL6) {
      map[h][v] = { raiseMap: raiseByVillain(v), callMap: callByMatchup(h, v, "6MAX") };
    }
  }
  return map;
}

// 9-max with BB added (and UTG1/MP lanes)
const HERO9 = ["UTG","UTG1","MP","HJ","CO","BTN","SB","BB"];
const VIL9  = ["UTG","UTG1","MP","HJ","CO","BTN","SB","BB"];
function build9() {
  const map = {};
  for (const h of HERO9) {
    map[h] = {};
    for (const v of VIL9) {
      map[h][v] = { raiseMap: raiseByVillain(v), callMap: callByMatchup(h, v, "9MAX") };
    }
  }
  return map;
}

export const FREQ_3B_ACTIONS = {
  "6MAX": {
    heroPositions: HERO6,
    villainPositions: VIL6,
    matrix: build6(),
    title: (hero, vil) => `${hero} vs ${vil} - 3-Bet/Call - 100bb Cash (6-max)`
  },
  "9MAX": {
    heroPositions: HERO9,
    villainPositions: VIL9,
    matrix: build9(),
    title: (hero, vil) => `${hero} vs ${vil} - 3-Bet/Call - 100bb Cash (9-max)`
  }
};
