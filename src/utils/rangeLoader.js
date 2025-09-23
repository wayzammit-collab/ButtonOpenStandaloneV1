// Utility to load solver ranges from JSON/CSV and convert to combo->percent maps.
// Now also supports "opponentStyle" to auto-pick Exploit profile.
// Shapes:
// JSON array items:
// {
//   table: "6MAX", trainer: "THREEBET",
//   hero: "BTN", villain: "CO",
//   action: "RAISE" | "CALL",
//   opponentStyle: "OVERFOLD_3B",          // optional
//   combos: { "AKs": 100, "A5s": 40 }
// }
// CSV header:
// table,trainer,hero,villain,action,hand,percent,opponentStyle

export async function parseJSONFile(file) {
  const text = await file.text();
  let data = JSON.parse(text);
  if (!Array.isArray(data)) data = [data];
  return normalizeRecords(data, file.name);
}

export async function parseCSVFile(file) {
  const text = await file.text();
  const lines = text.split(/\r?\n/).filter(Boolean);
  if (!lines.length) return { grouped: {}, firstMeta: null, filename: file.name };
  const header = lines.shift().split(",").map(s => s.trim());
  const idx = (k) => header.indexOf(k);
  const out = [];
  for (const line of lines) {
    const cols = line.split(",").map(s => s.trim());
    if (!cols.length) continue;
    const rec = {
      table: cols[idx("table")] || "6MAX",
      trainer: cols[idx("trainer")] || "THREEBET",
      hero: cols[idx("hero")] || "BTN",
      villain: cols[idx("villain")] || "",
      action: (cols[idx("action")] || "RAISE").toUpperCase(),
      hand: cols[idx("hand")],
      percent: Number(cols[idx("percent")] || 0),
      opponentStyle: cols[idx("opponentStyle")] || ""
    };
    out.push(rec);
  }
  const { grouped, firstMeta } = groupRecords(out);
  return { grouped, firstMeta, filename: file.name };
}

function normalizeRecords(arr, filename) {
  const rows = [];
  for (const r of arr) {
    const base = {
      table: r.table || "6MAX",
      trainer: r.trainer || "THREEBET",
      hero: r.hero || "BTN",
      villain: r.villain || "",
      action: (r.action || "RAISE").toUpperCase(),
      opponentStyle: r.opponentStyle || ""
    };
    if (r.combos && typeof r.combos === "object") {
      for (const [hand, percent] of Object.entries(r.combos)) {
        rows.push({ ...base, hand, percent: Number(percent || 0) });
      }
    }
  }
  const { grouped, firstMeta } = groupRecords(rows);
  return { grouped, firstMeta, filename };
}

function groupRecords(rows) {
  // data[trainer][table][hero][villain][action] = { "AKs": 100, ... }
  const grouped = {};
  let firstMeta = null;
  for (const row of rows) {
    const tr = row.trainer;
    const tb = row.table;
    const he = row.hero;
    const vi = row.villain || "_";
    const ac = row.action.toUpperCase(); // RAISE | CALL | OPEN
    grouped[tr] ||= {};
    grouped[tr][tb] ||= {};
    grouped[tr][tb][he] ||= {};
    grouped[tr][tb][he][vi] ||= {};
    const bucket = grouped[tr][tb][he][vi];
    bucket[ac] ||= {};
    bucket[ac][row.hand] = Math.max(0, Math.min(100, Number(row.percent || 0)));
    if (!firstMeta) {
      firstMeta = {
        trainer: tr, table: tb, hero: he, villain: vi === "_" ? "" : vi,
        action: ac, opponentStyle: row.opponentStyle || ""
      };
    }
  }
  return { grouped, firstMeta };
}

// Merge imported maps into existing structures.
// trainer: "THREEBET" or "OPEN"
export function mergeImportedRanges(base, imported, trainer) {
  if (!imported || !base) return base;
  const out = JSON.parse(JSON.stringify(base));
  const tnode = imported[trainer] || {};
  for (const [table, posNode] of Object.entries(tnode)) {
    if (!out[table]) continue;
    for (const [hero, vilNode] of Object.entries(posNode)) {
      if (trainer === "THREEBET") {
        for (const [villain, acts] of Object.entries(vilNode)) {
          if (!out[table].matrix?.[hero]?.[villain]) continue;
          const slot = out[table].matrix[hero][villain];
          if (acts.RAISE) slot.raiseMap = { ...slot.raiseMap, ...acts.RAISE };
          if (acts.CALL)  slot.callMap  = { ...slot.callMap,  ...acts.CALL  };
        }
      } else if (trainer === "OPEN") {
        const slot = out[table].maps?.[hero];
        if (!slot) continue;
        const acts = vilNode["_"] || {};
        if (acts.OPEN) out[table].maps[hero] = { ...slot, ...acts.OPEN };
      }
    }
  }
  return out;
}
