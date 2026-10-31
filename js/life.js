/* ============================================================
   MEMENTO — Leven: fases, domeinen en signalen
   Fases = waar je in groeit. Domeinen = het totaalbeeld van
   je persoonlijke én zakelijke leven. Signalen = wat je logt.
   ============================================================ */

/* ---------- Fases: waar MORI in groeit ----------
   Progressie zonder streak-angst: je klimt op Virtus (wat je
   dééd), niet op een perfecte reeks. Je kunt nooit zakken. */
const STAGES = [
  { key: "novicius",  name: "Novicius",  nl: "De Ontwaakte",   at: 0,
    line: "Je weet nu dat je tijd loopt. Dat is het begin.",
    unlock: "Day Path, focus en je eerste reflecties." },
  { key: "discipulus", name: "Discipulus", nl: "De Leerling",  at: 300,
    line: "Je komt terug. Ook op de dagen dat het niet uitkomt.",
    unlock: "Patronen: MEMENTO begint je ritme te herkennen." },
  { key: "miles",     name: "Miles",     nl: "De Soldaat",     at: 900,
    line: "Discipline is geen stemming meer. Het is een gewoonte.",
    unlock: "Domeinbalans over je hele leven." },
  { key: "custos",    name: "Custos",    nl: "De Wachter",     at: 2000,
    line: "Je bewaakt je aandacht. Afleiding komt niet meer binnen.",
    unlock: "Diepere analyses en verbanden tussen je domeinen." },
  { key: "faber",     name: "Faber",     nl: "De Bouwer",      at: 4000,
    line: "Je bouwt iets dat groter is dan je dag.",
    unlock: "Lange-termijn trends en kwartaalbeeld." },
  { key: "stoicus",   name: "Stoicus",   nl: "De Stoïcijn",    at: 7500,
    line: "Rust onder druk. Je handelt, je reageert niet.",
    unlock: "Volledig levensoverzicht en scherpe spiegel." },
  { key: "praetor",   name: "Praetor",   nl: "De Leider",      at: 13000,
    line: "Je leidt jezelf zó goed dat anderen volgen.",
    unlock: "Nalatenschap-weergave in MEMENTO MORI." },
  { key: "imperator", name: "Imperator", nl: "De Meester",     at: 22000,
    line: "Je leven is geen toeval meer. Het is een keuze, elke dag.",
    unlock: "Alles. Nu is het onderhoud van meesterschap." },
];

function stageFor(virtus) {
  let s = STAGES[0];
  for (const st of STAGES) if (virtus >= st.at) s = st;
  return s;
}
function stageIndex(virtus) {
  return STAGES.indexOf(stageFor(virtus));
}
function nextStage(virtus) {
  const i = stageIndex(virtus);
  return i < STAGES.length - 1 ? STAGES[i + 1] : null;
}
/* voortgang 0..1 richting de volgende fase */
function stageProgress(virtus) {
  const cur = stageFor(virtus);
  const nxt = nextStage(virtus);
  if (!nxt) return 1;
  const span = nxt.at - cur.at;
  return span <= 0 ? 1 : Math.max(0, Math.min(1, (virtus - cur.at) / span));
}

/* ---------- Signalen: wat je dagelijks kunt loggen ----------
   type: scale (1-5) · hours · minutes · count · euro
   Kies zelf wat je bijhoudt — weinig en trouw > veel en nooit. */
const SIGNALS = [
  { key: "energy",  label: "Energie",        group: "personal", type: "scale",   domain: "energie",
    q: "Hoeveel energie had je?", low: "leeg", high: "vol" },
  { key: "mood",    label: "Stemming",       group: "personal", type: "scale",   domain: "mentaal",
    q: "Hoe voelde je je?", low: "zwaar", high: "licht" },
  { key: "sleep",   label: "Slaap",          group: "personal", type: "hours",   domain: "gezondheid",
    q: "Hoeveel uur sliep je?", target: 7.5, unit: "u" },
  { key: "move",    label: "Beweging",       group: "personal", type: "minutes", domain: "gezondheid",
    q: "Hoeveel minuten bewoog je?", target: 45, unit: "min" },
  { key: "connect", label: "Tijd met mensen",group: "personal", type: "minutes", domain: "relaties",
    q: "Kwaliteitstijd met wie ertoe doet?", target: 60, unit: "min" },
  { key: "read",    label: "Lezen / leren",  group: "personal", type: "minutes", domain: "kennis",
    q: "Hoeveel minuten leerde je?", target: 30, unit: "min" },
  { key: "revenue", label: "Omzet",          group: "business", type: "euro",    domain: "geld",
    q: "Omzet vandaag?", target: 500, unit: "€" },
  { key: "sales",   label: "Salesgesprekken",group: "business", type: "count",   domain: "geld",
    q: "Hoeveel verkoopgesprekken?", target: 3, unit: "x" },
  { key: "leads",   label: "Nieuwe leads",   group: "business", type: "count",   domain: "onderneming",
    q: "Hoeveel nieuwe leads?", target: 3, unit: "x" },
  { key: "content", label: "Content gemaakt",group: "business", type: "count",   domain: "zichtbaarheid",
    q: "Hoeveel stukken content?", target: 1, unit: "x" },
];

const DEFAULT_TRACKED = ["energy", "mood", "sleep", "move", "revenue"];

function signalDef(key) { return SIGNALS.find(s => s.key === key) || null; }

/* ---------- Domeinen: het totaalbeeld ----------
   Elk domein krijgt een score 0-100 over de laatste 7 dagen,
   opgebouwd uit je signalen én wat je écht deed (taken/focus). */
const DOMAINS = [
  { key: "gezondheid",   label: "Gezondheid",   group: "personal", signals: ["sleep", "move"],  tags: ["fitness", "slaap"] },
  { key: "energie",      label: "Energie",      group: "personal", signals: ["energy"],         tags: [] },
  { key: "mentaal",      label: "Rust & hoofd", group: "personal", signals: ["mood"],           tags: ["reflectie"] },
  { key: "relaties",     label: "Relaties",     group: "personal", signals: ["connect"],        tags: [] },
  { key: "kennis",       label: "Kennis",       group: "personal", signals: ["read"],           tags: ["lezen", "studie"] },
  { key: "geld",         label: "Geld",         group: "business", signals: ["revenue", "sales"], tags: ["geld verdienen"] },
  { key: "onderneming",  label: "Onderneming",  group: "business", signals: ["leads"],          tags: ["bedrijf bouwen", "deep work"] },
  { key: "zichtbaarheid",label: "Zichtbaarheid",group: "business", signals: ["content"],        tags: ["content maken"] },
];

function domainDef(key) { return DOMAINS.find(d => d.key === key) || null; }

/* laatste n datums (jjjj-mm-dd), nieuwste eerst */
function lastDates(n) {
  const out = [];
  const d = new Date();
  for (let i = 0; i < n; i++) {
    const x = new Date(d);
    x.setDate(d.getDate() - i);
    out.push(x.toISOString().slice(0, 10));
  }
  return out;
}

/* alle waarden van één signaal over n dagen (alleen ingevulde) */
function signalValues(S, key, days) {
  const dates = lastDates(days || 7);
  const out = [];
  dates.forEach(dt => {
    const rec = S.signals && S.signals[dt];
    if (rec && rec[key] != null && rec[key] !== "") out.push(Number(rec[key]));
  });
  return out.filter(v => !isNaN(v));
}
function avgSignal(S, key, days) {
  const v = signalValues(S, key, days);
  return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null;
}
function sumSignal(S, key, days) {
  const v = signalValues(S, key, days);
  return v.length ? v.reduce((a, b) => a + b, 0) : null;
}

/* score 0-100 per domein over 7 dagen; null als er niets bekend is */
function domainScore(S, domainKey, days) {
  const d = domainDef(domainKey);
  if (!d) return null;
  const D = days || 7;
  const parts = [];
  let obs = 0;   // hoeveel losse waarnemingen dragen deze score?

  d.signals.forEach(sk => {
    const def = signalDef(sk);
    if (!def) return;
    const vals = signalValues(S, sk, D);
    if (!vals.length) return;
    obs += vals.length;
    const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
    if (def.type === "scale") parts.push(Math.max(0, Math.min(1, (avg - 1) / 4)));
    else if (def.target) parts.push(Math.max(0, Math.min(1, avg / def.target)));
  });

  // wat je écht deed telt mee: afgeronde taken met een passende tag
  if (d.tags.length) {
    const dates = lastDates(D);
    let done = 0;
    dates.forEach(dt => {
      const h = S.history && S.history[dt];
      if (h && h.tags) d.tags.forEach(t => { if (h.tags[t]) done += h.tags[t]; });
    });
    if (done > 0) { obs += done; parts.push(Math.max(0, Math.min(1, done / (D * 0.6)))); }
  }

  // Eén losse meting is geen patroon. Liever eerlijk "—" dan een zelfverzekerd getal.
  if (!parts.length || obs < 2) return null;
  return Math.round((parts.reduce((a, b) => a + b, 0) / parts.length) * 100);
}

/* het totaalbeeld: gemiddelde over domeinen die data hebben */
function lifeScore(S, days) {
  const scores = DOMAINS.map(d => domainScore(S, d.key, days)).filter(v => v != null);
  if (!scores.length) return null;
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
}

window.LIFE = {
  STAGES, stageFor, stageIndex, nextStage, stageProgress,
  SIGNALS, DEFAULT_TRACKED, signalDef,
  DOMAINS, domainDef, domainScore, lifeScore,
  lastDates, signalValues, avgSignal, sumSignal,
};
