// Frequency maps for 100bb cash RFI by table size and position.
// Values are implementable baselines to make the trainer usable now.
// Replace with precise charts later; any missing hand defaults to 0.

const BTN_6 = {
  "AA":100,"KK":100,"QQ":100,"JJ":100,"TT":100,"99":100,"88":100,
  "AKs":100,"AQs":100,"AJs":100,"ATs":100,"KQs":100,"KJs":100,"QJs":100,
  "AKo":100,"AQo":100,"KQo":100,
  "A9s":70,"A8s":60,"A7s":50,"A6s":40,"A5s":70,"A4s":60,"A3s":50,"A2s":40,
  "KTs":70,"K9s":60,"QTs":60,"JTs":80,"T9s":75,"98s":65,"87s":55,"76s":45,"65s":40,
  "KJo":35,"QJo":30,"KTo":25,"QTo":20,"JTo":30,"A9o":35,"A8o":25,
  "K9o":15,"Q9o":10,"J9o":10,"T9o":15,"A5o":10,
};
const UTG_6 = {
  "AA":100,"KK":100,"QQ":100,"JJ":100,"TT":100,"99":100,"88":100,"77":100,"66":100,
  "AKs":100,"AQs":100,"AJs":100,"ATs":100,"A9s":50,"A8s":25,
  "KQs":100,"KJs":100,"KTs":50,
  "QJs":100,"JTs":100,"T9s":100,"98s":50,"87s":25,
  "AKo":100,"AQo":100,"AJo":50,
  "KQo":50,
};
const HJ_6 = {
  "AA":100,"KK":100,"QQ":100,"JJ":100,"TT":100,"99":100,"88":100,"77":100,"66":100,"55":100,
  "AKs":100,"AQs":100,"AJs":100,"ATs":100,"A9s":70,"A8s":50,"A7s":40,"A6s":35,"A5s":60,"A4s":50,"A3s":40,"A2s":35,
  "KQs":100,"KJs":100,"KTs":70,"K9s":40,
  "QJs":100,"QTs":70,"JTs":100,"T9s":90,"98s":70,"87s":50,"76s":40,"65s":35,
  "AKo":100,"AQo":100,"AJo":70,"ATo":30,
  "KQo":70,"KJo":25,"QJo":25,"JTo":25,
};
const CO_6 = {
  "AA":100,"KK":100,"QQ":100,"JJ":100,"TT":100,"99":100,"88":100,"77":100,"66":100,"55":100,"44":100,
  "AKs":100,"AQs":100,"AJs":100,"ATs":100,"A9s":90,"A8s":80,"A7s":70,"A6s":60,"A5s":90,"A4s":80,"A3s":70,"A2s":60,
  "KQs":100,"KJs":100,"KTs":90,"K9s":70,"K8s":40,
  "QJs":100,"QTs":90,"Q9s":60,
  "JTs":100,"J9s":70,"T9s":100,"98s":90,"87s":70,"76s":60,"65s":50,"54s":40,
  "AKo":100,"AQo":100,"AJo":90,"ATo":60,"A9o":25,
  "KQo":100,"KJo":60,"QJo":50,"KTo":40,"QTo":35,"JTo":40,"T9o":25,
};
const SB_6 = {
  "AA":100,"KK":100,"QQ":100,"JJ":100,"TT":100,"99":100,"88":100,"77":100,"66":100,"55":100,"44":100,"33":100,"22":100,
  "AKs":100,"AQs":100,"AJs":100,"ATs":100,"A9s":90,"A8s":80,"A7s":70,"A6s":60,"A5s":80,"A4s":70,"A3s":60,"A2s":60,
  "KQs":100,"KJs":100,"KTs":100,"K9s":80,"K8s":60,
  "QJs":100,"QTs":100,"Q9s":80,"JTs":100,"J9s":80,
  "T9s":100,"98s":100,"87s":100,"76s":90,"65s":80,"54s":70,"43s":50,
  "AKo":100,"AQo":100,"AJo":90,"ATo":70,"A9o":50,
  "KQo":100,"KJo":80,"KTo":60,"QJo":60,"QTo":50,"JTo":60,"T9o":40,
};

// 9-max baselines: UTG (tighter than 6-max UTG), UTG1 (aka UTG+1), MP, HJ, CO, BTN, SB.
// These are conservative starting points—expand with your preferred solver charts anytime.
const UTG_9 = {
  "AA":100,"KK":100,"QQ":100,"JJ":100,"TT":100,"99":100,"88":100,"77":100,
  "AKs":100,"AQs":100,"AJs":100,"ATs":70,
  "KQs":100,"KJs":60,
  "QJs":60,"JTs":60,
  "AKo":100,"AQo":70,
};
const UTG1_9 = {
  "AA":100,"KK":100,"QQ":100,"JJ":100,"TT":100,"99":100,"88":100,"77":100,"66":100,
  "AKs":100,"AQs":100,"AJs":100,"ATs":80,"A9s":40,
  "KQs":100,"KJs":80,"KTs":40,
  "QJs":80,"JTs":80,"T9s":40,
  "AKo":100,"AQo":80,"AJo":40,"KQo":40,
};
const MP_9 = {
  "AA":100,"KK":100,"QQ":100,"JJ":100,"TT":100,"99":100,"88":100,"77":100,"66":100,"55":100,
  "AKs":100,"AQs":100,"AJs":100,"ATs":100,"A9s":60,"A8s":40,
  "KQs":100,"KJs":100,"KTs":60,
  "QJs":100,"QTs":60,"JTs":100,"T9s":80,"98s":60,
  "AKo":100,"AQo":100,"AJo":60,"KQo":70,"QJo":30,
};
const HJ_9 = {
  "AA":100,"KK":100,"QQ":100,"JJ":100,"TT":100,"99":100,"88":100,"77":100,"66":100,"55":100,
  "AKs":100,"AQs":100,"AJs":100,"ATs":100,"A9s":70,"A8s":50,
  "KQs":100,"KJs":100,"KTs":70,"K9s":40,
  "QJs":100,"QTs":70,"JTs":100,"T9s":90,"98s":70,"87s":50,
  "AKo":100,"AQo":100,"AJo":70,"ATo":30,
  "KQo":70,"KJo":25,"QJo":25,"JTo":25,
};
const CO_9 = CO_6;   // Good baseline to reuse
const BTN_9 = BTN_6; // Good baseline to reuse
const SB_9 = SB_6;   // Heads-up vs BB; same as 6-max SB single-raise

export const FREQ_MAPS = {
  "6MAX": {
    positions: ["UTG","HJ","CO","BTN","SB"],
    maps: { UTG: UTG_6, HJ: HJ_6, CO: CO_6, BTN: BTN_6, SB: SB_6 },
    titles: {
      UTG: "UTG Open - 100bb Cash (6-max)",
      HJ:  "HJ Open - 100bb Cash (6-max)",
      CO:  "CO Open - 100bb Cash (6-max)",
      BTN: "BTN Open - 100bb Cash (6-max)",
      SB:  "SB Open - 100bb Cash (6-max)",
    }
  },
  "9MAX": {
    positions: ["UTG","UTG1","MP","HJ","CO","BTN","SB"],
    maps: { UTG: UTG_9, UTG1: UTG1_9, MP: MP_9, HJ: HJ_9, CO: CO_9, BTN: BTN_9, SB: SB_9 },
    titles: {
      UTG:  "UTG Open - 100bb Cash (9-max)",
      UTG1: "UTG+1 Open - 100bb Cash (9-max)",
      MP:   "MP Open - 100bb Cash (9-max)",
      HJ:   "HJ Open - 100bb Cash (9-max)",
      CO:   "CO Open - 100bb Cash (9-max)",
      BTN:  "BTN Open - 100bb Cash (9-max)",
      SB:   "SB Open - 100bb Cash (9-max)",
    }
  }
};
