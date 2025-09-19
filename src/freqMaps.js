// src/freqMaps.js
// 6-max 100bb cash RFI baselines (implementable starting points).
// BTN: the wide opening range already used.
// UTG: tightest; HJ: slightly wider; CO: wider; SB: tight polar-ish open vs BB (single raise, no limps).

const BTN_FREQ_100BB = {
  "AA": 100, "KK": 100, "QQ": 100, "JJ": 100, "TT": 100, "99": 100, "88": 100,
  "AKs": 100, "AQs": 100, "AJs": 100, "ATs": 100, "KQs": 100, "KJs": 100, "QJs": 100,
  "AKo": 100, "AQo": 100, "KQo": 100,
  "A9s": 70, "A8s": 60, "A7s": 50, "A6s": 40, "A5s": 70, "A4s": 60, "A3s": 50, "A2s": 40,
  "KTs": 70, "K9s": 60, "QTs": 60, "JTs": 80, "T9s": 75, "98s": 65, "87s": 55, "76s": 45, "65s": 40,
  "KJo": 35, "QJo": 30, "KTo": 25, "QTo": 20, "JTo": 30, "A9o": 35, "A8o": 25,
  "K9o": 15, "Q9o": 10, "J9o": 10, "T9o": 15, "A5o": 10,
};

const UTG_FREQ_100BB = {
  "AA": 100, "KK": 100, "QQ": 100, "JJ": 100, "TT": 100, "99": 100, "88": 100, "77": 100, "66": 100,
  "AKs": 100, "AQs": 100, "AJs": 100, "ATs": 100, "A9s": 50, "A8s": 25,
  "KQs": 100, "KJs": 100, "KTs": 50,
  "QJs": 100, "JTs": 100, "T9s": 100, "98s": 50, "87s": 25,
  "AKo": 100, "AQo": 100, "AJo": 50,
  "KQo": 50,
};

const HJ_FREQ_100BB = {
  // Pairs
  "AA": 100, "KK": 100, "QQ": 100, "JJ": 100, "TT": 100, "99": 100, "88": 100, "77": 100, "66": 100, "55": 100,
  // Suited Ax
  "AKs": 100, "AQs": 100, "AJs": 100, "ATs": 100, "A9s": 70, "A8s": 50, "A7s": 40, "A6s": 35, "A5s": 60, "A4s": 50, "A3s": 40, "A2s": 35,
  // Suited Kx
  "KQs": 100, "KJs": 100, "KTs": 70, "K9s": 40,
  // Suited QJ/QT/JT/connectors
  "QJs": 100, "QTs": 70, "JTs": 100, "T9s": 90, "98s": 70, "87s": 50, "76s": 40, "65s": 35,
  // Offsuit broadways / Ax
  "AKo": 100, "AQo": 100, "AJo": 70, "ATo": 30,
  "KQo": 70, "KJo": 25, "QJo": 25, "JTo": 25,
};

const CO_FREQ_100BB = {
  // Pairs
  "AA": 100, "KK": 100, "QQ": 100, "JJ": 100, "TT": 100, "99": 100, "88": 100, "77": 100, "66": 100, "55": 100, "44": 100,
  // Suited Ax (wider)
  "AKs": 100, "AQs": 100, "AJs": 100, "ATs": 100, "A9s": 90, "A8s": 80, "A7s": 70, "A6s": 60, "A5s": 90, "A4s": 80, "A3s": 70, "A2s": 60,
  // Suited Kx/Qx/Jx/connectors
  "KQs": 100, "KJs": 100, "KTs": 90, "K9s": 70, "K8s": 40,
  "QJs": 100, "QTs": 90, "Q9s": 60,
  "JTs": 100, "J9s": 70, "T9s": 100, "98s": 90, "87s": 70, "76s": 60, "65s": 50, "54s": 40,
  // Offsuit
  "AKo": 100, "AQo": 100, "AJo": 90, "ATo": 60, "A9o": 25,
  "KQo": 100, "KJo": 60, "QJo": 50, "KTo": 40, "QTo": 35, "JTo": 40, "T9o": 25,
};

const SB_FREQ_100BB = {
  // Pairs
  "AA": 100, "KK": 100, "QQ": 100, "JJ": 100, "TT": 100, "99": 100, "88": 100, "77": 100, "66": 100, "55": 100, "44": 100, "33": 100, "22": 100,
  // Suited broadways / Ax (SB open vs BB, single raise, no limps)
  "AKs": 100, "AQs": 100, "AJs": 100, "ATs": 100, "A9s": 90, "A8s": 80, "A7s": 70, "A6s": 60, "A5s": 80, "A4s": 70, "A3s": 60, "A2s": 60,
  "KQs": 100, "KJs": 100, "KTs": 100, "K9s": 80, "K8s": 60,
  "QJs": 100, "QTs": 100, "Q9s": 80, "JTs": 100, "J9s": 80,
  // Suited connectors and gappers (looser heads-up vs BB)
  "T9s": 100, "98s": 100, "87s": 100, "76s": 90, "65s": 80, "54s": 70, "43s": 50,
  // Offsuit Ax/Broadways (reasonable opens)
  "AKo": 100, "AQo": 100, "AJo": 90, "ATo": 70, "A9o": 50,
  "KQo": 100, "KJo": 80, "KTo": 60, "QJo": 60, "QTo": 50, "JTo": 60,
  "T9o": 40,
};

export const FREQ_MAPS_6MAX_100BB = {
  UTG: UTG_FREQ_100BB,
  HJ: HJ_FREQ_100BB,
  CO: CO_FREQ_100BB,
  BTN: BTN_FREQ_100BB,
  SB: SB_FREQ_100BB,
};

export const POSITION_TITLES = {
  UTG: "UTG Open — 100bb Cash",
  HJ:  "HJ Open — 100bb Cash",
  CO:  "CO Open — 100bb Cash",
  BTN: "BTN Open — 100bb Cash",
  SB:  "SB Open — 100bb Cash",
};
