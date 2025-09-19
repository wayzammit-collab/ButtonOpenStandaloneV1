export const RANKS = ["A","K","Q","J","T","9","8","7","6","5","4","3","2"];
export const SUITS = ["s","h","d","c"];
export const SUIT_ICON = { s: "♠", h: "♥", d: "♦", c: "♣" };

export function asCard(x) {
  const c = Array.isArray(x) ? x[0] : x;
  return c && typeof c.rank === "string" && typeof c.suit === "string" ? { rank: c.rank, suit: c.suit } : null;
}
export function deckDeal() {
  const deck = [];
  for (const r of RANKS) for (const s of SUITS) deck.push({ rank: r, suit: s });
  const i = Math.floor(Math.random() * deck.length);
  const a = asCard(deck.splice(i, 1)[0]);
  const j = Math.floor(Math.random() * deck.length);
  const b = asCard(deck.splice(j, 1)[0]);
  return [a, b];
}
export function deckDealValid() {
  let [a, b] = deckDeal();
  if (!a || !b) [a, b] = deckDeal();
  if (!a || !b) return [{ rank: "A", suit: "s" }, { rank: "K", suit: "d" }];
  return [a, b];
}
export function comboKey(c1, c2) {
  const i1 = RANKS.indexOf(c1.rank);
  const i2 = RANKS.indexOf(c2.rank);
  if (i1 === i2) return c1.rank + c2.rank;
  const hi = i1 < i2 ? c1 : c2;
  const lo = i1 < i2 ? c2 : c1;
  return hi.rank + lo.rank + (c1.suit === c2.suit ? "s" : "o");
}
export function handLabelFromKey(k) {
  if (k.length === 2) return k;
  const r1 = k[0], r2 = k[1], t = k[2];
  return r1 + r2 + (t === "s" ? "s" : "o");
}
export function cardText(c) {
  return c.rank + " " + (SUIT_ICON[c.suit] || String(c.suit).toUpperCase());
}
export function colorForPct(pct) {
  const p = Math.max(0, Math.min(100, pct));
  const g = Math.round(40 + (p / 100) * 120);
  const r = Math.round(90 + ((100 - p) / 100) * 100);
  const b = 80;
  return `rgb(${r}, ${g}, ${b})`;
}
