// Remove OOP "Fold" when first to act; keep legal sets elsewhere.

const rand = (a,b)=>a+Math.floor(Math.random()*(b-a+1));
const pick = arr => arr[Math.floor(Math.random()*arr.length)];
const suits = ["♠","♥","♦","♣"];
const ranksAll = ["A","K","Q","J","T","9","8","7","6","5","4","3","2"];

export const SCENARIO_VILLAIN_STYLES = [
  { id:"STD", label:"Standard pool" },
  { id:"PASSIVE", label:"Passive caller" },
  { id:"AGGRO", label:"Aggressive" },
  { id:"FOLDY", label:"Overfolds" }
];

const PREFLOP_FORMS = [
  { id:"SRP_BTN_vs_BB", opener:"BTN", caller:"BB", threeBet:false },
  { id:"SRP_CO_vs_BB",  opener:"CO",  caller:"BB", threeBet:false },
  { id:"SRP_SB_vs_BB",  opener:"SB",  caller:"BB", threeBet:false },
  { id:"3BP_CO_vs_BB",  opener:"CO",  caller:"BB", threeBet:true, threeBettor:"BB" },
  { id:"3BP_BTN_vs_BB", opener:"BTN", caller:"BB", threeBet:true, threeBettor:"BB" },
  { id:"3BP_SB_vs_BTN", opener:"SB",  caller:"BTN", threeBet:true, threeBettor:"BTN" }
];

const flopBuckets = {
  low_paired: [ ["7","7","3"], ["6","6","2"], ["5","5","8"] ],
  high_dry: [ ["A","9","3"], ["K","7","2"], ["Q","8","4"] ],
  middling_two_tone: [ ["J","9","5"], ["T","8","4"], ["9","7","6"] ],
  dynamic_broadway: [ ["K","Q","T"], ["A","J","T"], ["Q","J","9"] ]
};

function sampleFlop(bucket) {
  const ranks = pick(flopBuckets[bucket] || flopBuckets.high_dry);
  const s1 = pick(suits), s2 = pick(suits.filter(s=>s!==s1));
  const s3 = Math.random() < 0.5 ? s1 : pick(suits.filter(s=>s!==s1 && s!==s2));
  return { ranks, suits:[s1,s2,s3] };
}
function sampleTurnRiver() {
  const r4 = pick(ranksAll), r5 = pick(ranksAll);
  const s4 = pick(suits), s5 = pick(suits);
  return { r4,s4,r5,s5 };
}
function joinBoard(street, flop, tr) {
  const c1 = `${flop.ranks[0]}${flop.suits[0]}`;
  const c2 = `${flop.ranks[1]}${flop.suits[1]}`;
  const c3 = `${flop.ranks[2]}${flop.suits[2]}`;
  if (street==="Flop") return [c1,c2,c3];
  const c4 = `${tr.r4}${tr.s4}`;
  if (street==="Turn") return [c1,c2,c3,c4];
  const c5 = `${tr.r5}${tr.s5}`;
  return [c1,c2,c3,c4,c5];
}

function sampleHeroHand({ flop }) {
  const [r1,r2,r3] = flop.ranks;
  const bSet = new Set(flop.ranks);
  const off = ranksAll.filter(r => !bSet.has(r));
  const c=(r,s)=>`${r}${s}`, HF=(a,b)=>`${a} ${b}`;
  const choice = pick(["top_pair","second_pair","weak_pair","over_bdfd","oesd","gs_bdfd","air"]);
  let hand="", tags=[];
  switch (choice) {
    case "top_pair": { const hit=pick(flop.ranks), k=pick(off); hand=HF(c(hit,"♥"),c(k,"♣")); tags=["top_pair"]; break; }
    case "second_pair": { hand=HF(c(r2,"♦"),c(pick(off),"♠")); tags=["second_pair"]; break; }
    case "weak_pair": { hand=HF(c(r3,"♣"),c(pick(off),"♥")); tags=["weak_pair"]; break; }
    case "over_bdfd": { const a=pick(off), b=pick(off.filter(x=>x!==a)); hand=HF(c(a,"♥"),c(b,"♥")); tags=["overcards","bdfd"]; break; }
    case "oesd": { const ix=ranksAll.indexOf(r2); const a=ranksAll[Math.max(0,ix-1)], b=ranksAll[Math.min(ranksAll.length-1,ix+1)];
      hand=HF(c(a,"♠"),c(b,"♦")); tags=["oesd"]; break; }
    case "gs_bdfd": { hand=HF(c(r1,"♣"),c(pick(off),"♣")); tags=["gutshot","bdfd"]; break; }
    default: { const a=pick(off), b=pick(off.filter(x=>x!==a)); hand=HF(c(a,"♦"),c(b,"♠")); tags=["air"]; }
  }
  return { hand, tags, classId: tags.join("_") || "air" };
}

// Mixes
const THEORY = {
  FlopFirstToAct:  { BET25:65, BET75:10, CHECK:25 },
  TurnFirstToAct:  { BET33:40, BET75:20, CHECK:40 },
  RiverFacingBet:  { CALL:45, FOLD:50, RAISE:5 },
  RiverAfterCheck: { BET33:55, BET50:25, BET75:10, CHECK:10 },
  FacingBet:       { CALL:55, FOLD:30, RAISE:15 }
};

// Strict IP/OOP mapping (BTN always IP; SB always OOP vs BB)
function formationToPositions(form) {
  if (form.opener === "BTN" || form.caller === "BTN") return { ip:"BTN", oop: (form.opener==="BTN"?form.caller:form.opener) };
  if ((form.opener==="SB" && form.caller==="BB") || (form.opener==="BB" && form.caller==="SB")) return { ip:"BB", oop:"SB" };
  if (form.caller==="BB") return { ip:form.opener, oop:"BB" };
  return { ip:form.opener, oop:form.caller };
}

// Decision builder honoring your rule
function streetDecision({ street, heroSeat, ipSeat, oopSeat }) {
  const heroIsIP = heroSeat === ipSeat;
  const actStrings = street==="River" ? ["checks","bets 75%","jams"] : (street==="Turn" ? ["checks","bets 33%","bets 75%"] : ["checks","bets 33%","bets 50%"]);
  if (heroIsIP) {
    const oopAct = pick(actStrings);
    return {
      toAct: ipSeat, lastAction: oopAct, oopAggressive: !oopAct.startsWith("checks"),
      storyLine: `${street}: ${oopSeat} ${oopAct}. Decision for ${ipSeat} (IP).`,
      heroIsFirst:false
    };
  } else {
    // Hero OOP, first to act: NO FOLD OPTION
    return {
      toAct: oopSeat, lastAction: "is first to act", oopAggressive: false,
      storyLine: `${street}: ${oopSeat} to act — decision for ${oopSeat} (OOP).`,
      heroIsFirst:true
    };
  }
}

// Actions: never include Fold when heroIsFirst (OOP first to act)
function expandedActionsFor(street, ctx) {
  if (ctx?.heroIsFirst) {
    // first to act: only lead sizes + check
    const sizes = street==="Turn" ? [0.33,0.5,0.75] : [0.25,0.33,0.5,0.75];
    return [
      ...sizes.map(s=>({ id:`BET${Math.round(s*100)}`, label:`Bet ${Math.round(s*100)}%`, kind:"BET", size:s })),
      { id:"CHECK", label:"Check", kind:"CHECK" }
    ];
  }
  if (street === "River") {
    if (ctx?.lastAction?.startsWith("checks")) {
      return [
        { id:"BET33", label:"Bet 33%", kind:"BET", size:0.33 },
        { id:"BET50", label:"Bet 50%", kind:"BET", size:0.50 },
        { id:"BET75", label:"Bet 75%", kind:"BET", size:0.75 },
        { id:"CHECK", label:"Check",   kind:"CHECK" }
      ];
    }
    return [
      { id:"FOLD", label:"Fold", kind:"FOLD" },
      { id:"CALL", label:"Call", kind:"CALL" },
      { id:"RAISE", label:"Jam",  kind:"RAISE" }
    ];
  }
  if (ctx?.oopAggressive) {
    return [
      { id:"FOLD", label:"Fold", kind:"FOLD" },
      { id:"CALL", label:"Call", kind:"CALL" },
      { id:"RAISE", label:"Raise", kind:"RAISE" }
    ];
  }
  const sizes = street==="Turn" ? [0.33,0.5,0.75] : [0.25,0.33,0.5,0.75];
  return [
    ...sizes.map(s=>({ id:`BET${Math.round(s*100)}`, label:`Bet ${Math.round(s*100)}%`, kind:"BET", size:s })),
    { id:"CHECK", label:"Check", kind:"CHECK" }
  ];
}

export function sampleScenario() {
  const tpl = pick([
    { street:"Flop",  boardBucket:"high_dry" },
    { street:"Turn",  boardBucket:"middling_two_tone" },
    { street:"River", boardBucket:"dynamic_broadway" }
  ]);
  const formation = pick(PREFLOP_FORMS);
  const positions = formationToPositions(formation);
  const pre = { open: pick([2.2,2.5,3.0]), three: pick([8.5,9.5,10.5]) };

  // Hero can be IP or OOP
  const heroSeat = pick([positions.ip, positions.oop]);
  const villainSeat = heroSeat === positions.ip ? positions.oop : positions.ip;

  const flop = sampleFlop(tpl.boardBucket);
  const tr = tpl.street === "Flop" ? null : sampleTurnRiver();
  const boardSt = joinBoard(tpl.street, flop, tr);

  const steps = [];
  if (!formation.threeBet) steps.push(`${formation.opener} opened to ${pre.open}bb, ${formation.caller} called.`);
  else steps.push(`${formation.opener} opened to ${pre.open}bb, ${formation.caller} 3‑bet to ${pre.three}bb, ${formation.opener} called.`);

  const ipSeat = positions.ip, oopSeat = positions.oop;
  const rnd = a=>pick(a);
  const flopOOP = rnd(["checks","bets 33%","bets 50%"]);
  const turnOOP = rnd(["checks","bets 33%","bets 75%"]);
  if (tpl.street !== "Flop") steps.push(`Flop: ${oopSeat} ${flopOOP}, ${flopOOP.startsWith("checks") ? `${ipSeat} c‑bet small, ${oopSeat} called.` : `${ipSeat} called.`}`);
  if (tpl.street === "River") steps.push(`Turn: ${oopSeat} ${turnOOP}${turnOOP.startsWith("checks") ? `, ${ipSeat} checked back.` : `, ${ipSeat} called.`}`);

  const dec = streetDecision({ street: tpl.street, heroSeat, ipSeat, oopSeat });
  steps.push(dec.storyLine);

  const actions = expandedActionsFor(tpl.street, { lastAction: dec.lastAction, oopAggressive: dec.oopAggressive, heroIsFirst: dec.heroIsFirst });

  // Theory
  let theory;
  if (dec.heroIsFirst) {
    theory = tpl.street==="Turn" ? { BET33:45, BET50:25, BET75:10, CHECK:20 } : { BET25:45, BET33:25, BET50:15, BET75:5, CHECK:10 };
  } else if (tpl.street === "River") {
    theory = dec.lastAction.startsWith("checks") ? { BET33:55, BET50:25, BET75:10, CHECK:10 } : { CALL:45, FOLD:50, RAISE:5 };
  } else if (dec.oopAggressive) theory = { CALL:55, FOLD:30, RAISE:15 };
  else theory = tpl.street==="Turn" ? { BET33:40, BET75:20, CHECK:40 } : { BET25:65, BET75:10, CHECK:25 };

  const spr = (tpl.street==="River" ? 1.2 : tpl.street==="Turn" ? 4.2 : 6.5) + (Math.random()*0.4-0.2);
  const potBB = formation.threeBet ? 12 : 5.5;
  const heroBB = 78 + rand(-3,3), villBB = heroBB;

  const hero = sampleHeroHand({ flop });

  return {
    id: "SCN",
    street: tpl.street,
    potType: formation.threeBet ? "3BP" : "SRP",
    positions: { ip: ipSeat, oop: oopSeat, hero: heroSeat, villain: villainSeat },
    boardSt,
    toAct: dec.toAct,
    lastAction: dec.lastAction,
    story: steps.join(" "),
    spr: Number(spr.toFixed(1)),
    potBB,
    heroBB, villBB,
    actions,
    theory,
    ev: null,
    notesTags: [],
    heroHints: [],
    heroHand: hero.hand, handTags: hero.tags, handClassId: hero.classId
  };
}

export function gradeAction(scn, actionId) {
  let theory = { ...scn.theory };
  // If hero is first to act (OOP), Fold should never be graded
  const heroIsFirst = scn.lastAction === "is first to act";
  if (heroIsFirst) delete theory.FOLD;
  // Facing bet on flop/turn -> no Check
  const facingBetFT = (scn.street==="Flop" || scn.street==="Turn") && scn.lastAction && !scn.lastAction.startsWith("checks") && !heroIsFirst;
  if (facingBetFT) delete theory.CHECK;
  // River after check -> no Fold/Call
  if (scn.street==="River" && scn.lastAction?.startsWith("checks")) { delete theory.FOLD; delete theory.CALL; }

  const pct = theory[actionId] || 0;
  const bestId = Object.entries(theory).sort((a,b)=>b[1]-a[1])[0]?.[0];
  const bestPct = theory[bestId] || 0;
  const ok = actionId === bestId || (pct > 0 && pct >= (bestPct - 10));
  return { ok, pct, bestId, bestPct, evDelta: null };
}
