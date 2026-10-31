/* ============================================================
   MEMENTO — statische config: scoring, quotes, onboarding
   Extern simpel, intern mag het complex zijn.
   ============================================================ */

const LIFE_WEEKS = 4160;      // ~80 jaar
const LIFE_YEARS = 80;

// Virtus per actietype (PRD §13)
const VIRTUS = {
  small:      5,   // kleine taak
  habit:      10,  // habit voltooid
  focus25:    15,
  focus50:    30,
  workout:    40,
  deepwork90: 60,
  review:     10,  // ochtend-/avondreflectie
  fullDay:    50,  // bonus 100% dag
};

// focusduur -> virtus (per minuut interpolatie voor custom)
function virtusForFocus(minutes) {
  if (minutes >= 90) return VIRTUS.deepwork90;
  if (minutes >= 50) return VIRTUS.focus50;
  if (minutes >= 25) return VIRTUS.focus25;
  return Math.max(5, Math.round(minutes * 0.6));
}

// Streak multiplier (PRD §13)
function streakMultiplier(streak) {
  if (streak >= 30) return 2;
  if (streak >= 14) return 1.5;
  if (streak >= 7)  return 1.25;
  if (streak >= 3)  return 1.1;
  return 1;
}

// Memento mori quotes / brand voice (PRD §26)
const QUOTES = [
  "Je tijd loopt.",
  "Focus is respect voor je toekomst.",
  "Je hoeft geen perfect leven. Je moet vandaag winnen.",
  "Je droomleven vraagt om bewijs.",
  "MORI groeit als jij kiest.",
  "Je krijgt geen tweede leven. Bouw dit goed.",
  "Deze dag krijg je niet terug.",
  "Discipline is vrijheid.",
  "Consistentie verslaat motivatie.",
  "Je bouwt je leven, één gefocuste dag tegelijk.",
];

function quoteForToday() {
  const d = new Date();
  const day = Math.floor(d.getTime() / 86400000);
  return QUOTES[day % QUOTES.length];
}

// Onboarding config (PRD §9)
const DREAM_FIELDS = [
  { key: "health",      label: "Gezondheid",      ph: "fit, energiek, sterk lichaam…" },
  { key: "career",      label: "Werk / carrière", ph: "waar wil je staan in je werk?" },
  { key: "money",       label: "Geld",            ph: "financiële vrijheid, inkomen…" },
  { key: "relations",   label: "Relaties",        ph: "familie, vrienden, partner…" },
  { key: "environment", label: "Omgeving",        ph: "waar en hoe wil je leven?" },
  { key: "knowledge",   label: "Kennis",          ph: "wat wil je meesteren?" },
  { key: "spiritual",   label: "Spiritueel / mentaal", ph: "rust, helderheid, betekenis…" },
  { key: "freedom",     label: "Vrijheid",        ph: "hoe ziet vrijheid eruit?" },
];

const BLOCKERS = [
  "telefoonverslaving", "uitstelgedrag", "weinig energie", "geen structuur",
  "angst", "perfectionisme", "sociale afleiding", "geen duidelijk doel", "te veel ideeën",
];

const IDENTITY_TRAITS = [
  "gedisciplineerd", "kalm", "fit", "gefocust", "consistent", "moedig", "betrouwbaar",
];

const PRIORITIES = [
  "deep work", "fitness", "slaap", "geld verdienen", "studie",
  "content maken", "bedrijf bouwen", "lezen",
];

// Default Day Path generator (rule-based — geen AI in MVP, PRD §17/§21)
const TASK_LIBRARY = {
  "deep work":     { title: "Deep Work Block", duration: 50, type: "focus50", why: "Je toekomst wordt gebouwd in ononderbroken focus." },
  "fitness":       { title: "Workout",          duration: 45, type: "workout", why: "Een sterk lichaam draagt een sterke geest." },
  "slaap":         { title: "Avondroutine",     duration: 20, type: "small",   why: "Slaap is de basis van elke gefocuste dag." },
  "geld verdienen":{ title: "Geld-blok",        duration: 50, type: "focus50", why: "Vrijheid heeft een prijs. Betaal hem vandaag." },
  "studie":        { title: "Studie-sessie",    duration: 50, type: "focus50", why: "Kennis die je meesteren, verandert je pad." },
  "content maken": { title: "Content maken",    duration: 50, type: "focus50", why: "Bouwen in het openbaar bouwt je naam." },
  "bedrijf bouwen":{ title: "Bedrijf bouwen",   duration: 90, type: "deepwork90", why: "Elk uur hier is een steen in je tempel." },
  "lezen":         { title: "Lezen",            duration: 20, type: "small",   why: "20 minuten per dag = een ander mens per jaar." },
};

// leid een virtus-type af uit een gekozen duur
function typeForDuration(min) {
  if (min >= 90) return "deepwork90";
  if (min >= 50) return "focus50";
  if (min >= 25) return "focus25";
  return "small";
}

// bouw een dag op basis van prioriteiten + eigen dagelijkse acties (habits)
function generateDayPath(priorities, habits) {
  const tasks = [];
  tasks.push({ title: "Ochtendreflectie", duration: 5, type: "review", why: "Bepaal waarom vandaag telt.", tag: "reflectie" });
  const chosen = (priorities && priorities.length ? priorities : ["deep work", "fitness", "lezen"]).slice(0, 4);
  chosen.forEach((p) => {
    const t = TASK_LIBRARY[p] || TASK_LIBRARY["deep work"];
    tasks.push({ title: t.title, duration: t.duration, type: t.type, why: t.why, tag: p });
  });
  // eigen terugkerende acties
  (habits || []).forEach((h) => {
    tasks.push({ title: h.title, duration: h.duration, type: h.type || typeForDuration(h.duration), why: h.why || "Je koos deze actie zelf. Bewijs het.", tag: h.tag || "eigen actie", custom: true, habitId: h.id });
  });
  tasks.push({ title: "Avondreview", duration: 5, type: "review", why: "Sluit de dag. Leer ervan.", tag: "reflectie" });
  return tasks.map((t, i) => ({ id: "t" + Date.now() + "_" + i, ...t, completed: false }));
}

const REFLECT_MORNING = [
  "Waarom telt vandaag?",
  "Wat is de belangrijkste actie?",
  "Wat mag mij vandaag niet afleiden?",
];
const REFLECT_EVENING = [
  "Wat heb ik vandaag gebouwd?",
  "Waar verloor ik tijd?",
  "Wat verbeter ik morgen?",
];

const FOCUS_DURATIONS = [
  { min: 25, brk: 5,  label: "25 / 5" },
  { min: 50, brk: 10, label: "50 / 10" },
  { min: 90, brk: 15, label: "90 deep" },
];

window.DATA = {
  LIFE_WEEKS, LIFE_YEARS, VIRTUS, virtusForFocus, streakMultiplier,
  QUOTES, quoteForToday, DREAM_FIELDS, BLOCKERS, IDENTITY_TRAITS, PRIORITIES,
  generateDayPath, typeForDuration, REFLECT_MORNING, REFLECT_EVENING, FOCUS_DURATIONS,
};
