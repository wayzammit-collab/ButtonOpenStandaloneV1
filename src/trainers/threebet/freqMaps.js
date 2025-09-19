// Three-bet nested ranges: table -> heroPos -> vsPos -> frequency map
// Implementable baselines so the trainer runs end-to-end now.
// Replace or refine with solver charts anytime.

const LIN = {
  "AA":100,"KK":100,"QQ":100,"JJ":100,"TT":100,"99":90,"88":70,
  "AKs":100,"AQs":100,"AJs":80,"ATs":60,
  "AKo":100,"AQo":70,
};
const POL = { "A5s":60,"A4s":50,"KQs":50,"KJs":40,"QJs":30,"JTs":30,"T9s":25 };
const m = (...o) => Object.assign({}, ...o);

// Villain-specific adjustments (simple scaffold)
const vsUTG = base => m(base, { "AJo":20,"KQo":10 });
const vsHJ  = base => m(base, POL, { "AJo":40,"KQo":30,"KTs":30 });
const vsCO  = base => m(base, POL, { "AJo":60,"KQo":50,"KTs":40,"QTs":30,"98s":25 });
const vsBTN = base => m(base, POL, { "AJo":70,"KQo":60,"KTs":50,"QTs":40,"J9s":25 });
const vsSB  = base => m(base, POL, { "AJo":50,"KQo":40,"KTs":35,"QTs":30 });

// 6-max matrices
const HERO6 = ["UTG","HJ","CO","BTN","SB"];
const VIL6  = ["UTG","HJ","CO","BTN","SB"];
const MAP6 = {
  UTG: { UTG: vsUTG(LIN), HJ: vsHJ(LIN), CO: vsCO(LIN), BTN: vsBTN(LIN), SB: vsSB(LIN) },
  HJ:  { UTG: vsUTG(LIN), HJ: vsHJ(LIN), CO: vsCO(LIN), BTN: vsBTN(LIN), SB: vsSB(LIN) },
  CO:  { UTG: vsUTG(LIN), HJ: vsHJ(LIN), CO: vsCO(LIN), BTN: vsBTN(LIN), SB: vsSB(LIN) },
  BTN: { UTG: vsUTG(LIN), HJ: vsHJ(LIN), CO: vsCO(LIN), BTN: vsBTN(LIN), SB: vsSB(LIN) },
  SB:  { UTG: vsUTG(LIN), HJ: vsHJ(LIN), CO: vsCO(LIN), BTN: vsBTN(LIN), SB: vsSB(LIN) },
};

// 9-max matrices (earlier villains tighter)
const HERO9 = ["UTG","UTG1","MP","HJ","CO","BTN","SB"];
const VIL9  = ["UTG","UTG1","MP","HJ","CO","BTN","SB"];
const tighter = base => m(base, { "99":70,"88":50,"AJs":70,"ATs":40,"AJo":20,"KQo":10 });
const MAP9 = {
  UTG:  { UTG: tighter(LIN), UTG1: vsUTG(LIN), MP: vsHJ(LIN), HJ: vsHJ(LIN), CO: vsCO(LIN), BTN: vsBTN(LIN), SB: vsSB(LIN) },
  UTG1: { UTG: vsUTG(LIN),   UTG1: vsUTG(LIN), MP: vsHJ(LIN), HJ: vsHJ(LIN), CO: vsCO(LIN), BTN: vsBTN(LIN), SB: vsSB(LIN) },
  MP:   { UTG: vsUTG(LIN),   UTG1: vsUTG(LIN), MP: vsHJ(LIN), HJ: vsHJ(LIN), CO: vsCO(LIN), BTN: vsBTN(LIN), SB: vsSB(LIN) },
  HJ:   { UTG: vsUTG(LIN),   UTG1: vsUTG(LIN), MP: vsHJ(LIN), HJ: vsHJ(LIN), CO: vsCO(LIN), BTN: vsBTN(LIN), SB: vsSB(LIN) },
  CO:   { UTG: vsUTG(LIN),   UTG1: vsUTG(LIN), MP: vsHJ(LIN), HJ: vsHJ(LIN), CO: vsCO(LIN), BTN: vsBTN(LIN), SB: vsSB(LIN) },
  BTN:  { UTG: vsUTG(LIN),   UTG1: vsUTG(LIN), MP: vsHJ(LIN), HJ: vsHJ(LIN), CO: vsCO(LIN), BTN: vsBTN(LIN), SB: vsSB(LIN) },
  SB:   { UTG: vsUTG(LIN),   UTG1: vsUTG(LIN), MP: vsHJ(LIN), HJ: vsHJ(LIN), CO: vsCO(LIN), BTN: vsBTN(LIN), SB: vsSB(LIN) },
};

export const FREQ_3B_NESTED = {
  "6MAX": {
    heroPositions: HERO6,
    villainPositions: VIL6,
    matrix: MAP6,
    title: (hero, vil) => `${hero} 3-Bet vs ${vil} — 100bb Cash (6-max)`
  },
  "9MAX": {
    heroPositions: HERO9,
    villainPositions: VIL9,
    matrix: MAP9,
    title: (hero, vil) => `${hero} 3-Bet vs ${vil} — 100bb Cash (9-max)`
  }
};
