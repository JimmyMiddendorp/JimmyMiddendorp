/* ============================================================
   MEMENTO / MORI — app kern
   Vanilla JS SPA · localStorage · geen backend (MVP)
   ============================================================ */

const KEY = "memento_state_v1";

/* ---------- Icons (line style, 24x24) ---------- */
const I = {
  home:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/></svg>`,
  mori:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 3c3 0 5 2 5 5 0 2-1 3-1 5l1 8H7l1-8c0-2-1-3-1-5 0-3 2-5 5-5z"/></svg>`,
  clock:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l3 2M9 2h6"/></svg>`,
  grid:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>`,
  chart:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M4 20V10M10 20V4M16 20v-8M22 20H2"/></svg>`,
  play:   `<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M8 5v14l11-7z"/></svg>`,
  check:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M5 13l4 4L19 7"/></svg>`,
  gear:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/></svg>`,
  arrow:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M5 12h14M13 6l6 6-6 6"/></svg>`,
  back:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>`,
  pause:  `<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><rect x="6" y="5" width="4" height="14"/><rect x="14" y="5" width="4" height="14"/></svg>`,
  plus:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 5v14M5 12h14"/></svg>`,
  trash:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13"/></svg>`,
  x:      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M6 6l12 12M18 6L6 18"/></svg>`,
};
Object.keys(I).forEach(k => { if (!/stroke-width/.test(I[k]) && /stroke="currentColor"/.test(I[k])) I[k] = I[k].replace(/<svg /, '<svg stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" '); });

/* ---------- State ---------- */
function freshState() {
  return {
    version: 1,
    onboarded: false,
    user: { name: "", birthdate: "", dream: {}, blockers: [], identity: [], priorities: [], wakeTime: "07:00", sleepTime: "23:00" },
    virtus: 0, streak: 0, bestStreak: 0,
    lastActiveDate: null,
    lastDayGenerated: null,
    tasks: [],
    habits: [],
    strongWeeks: [],
    focusSessions: [],
    history: {},
    reflections: {},
    signals: {},
    tracked: (window.LIFE ? LIFE.DEFAULT_TRACKED.slice() : ["energy","mood","sleep","move","revenue"]),
    graceDays: [],
    stageSeen: 0,
    aiLast: null,
    settings: { theme: "light", notifications: true, defaultFocus: 50, ai: { key: "", model: "claude-sonnet-5" } },
  };
}

let S = load();
let route = S.onboarded ? "home" : "splash";
let onb = null;          // transient onboarding data
let focusCtx = null;     // active focus session

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return freshState();
    const fresh = freshState();
    const saved = JSON.parse(raw);
    const st = Object.assign(fresh, saved);
    st.settings = Object.assign({ theme: "light", notifications: true, defaultFocus: 50 }, saved.settings || {});
    st.settings.ai = Object.assign({ key: "", model: "claude-sonnet-5" }, (saved.settings && saved.settings.ai) || {});
    if (!st.signals) st.signals = {};
    if (!Array.isArray(st.graceDays)) st.graceDays = [];
    if (!Array.isArray(st.tracked) || !st.tracked.length) st.tracked = LIFE.DEFAULT_TRACKED.slice();
    return st;
  } catch (e) { return freshState(); }
}
function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }

/* ---------- Date helpers ---------- */
function todayStr(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}
function daysBetween(a, b) {
  const da = new Date(a + "T00:00:00"), db = new Date(b + "T00:00:00");
  return Math.round((db - da) / 86400000);
}
function prettyDate(d = new Date()) {
  return d.toLocaleDateString("nl-NL", { weekday: "long", day: "numeric", month: "long" });
}

/* ---------- Life math ---------- */
function weeksLived() {
  if (!S.user.birthdate) return 0;
  const b = new Date(S.user.birthdate + "T00:00:00");
  return Math.max(0, Math.floor((Date.now() - b.getTime()) / (7 * 86400000)));
}
function ageYears() {
  if (!S.user.birthdate) return 0;
  const b = new Date(S.user.birthdate + "T00:00:00");
  return Math.floor((Date.now() - b.getTime()) / (365.25 * 86400000));
}

/* ---------- Daily rollover ---------- */
function ensureToday() {
  const today = todayStr();
  if (S.lastDayGenerated === today) return;

  // finalize the previous generated day into history
  if (S.lastDayGenerated) {
    const done = S.tasks.filter(t => t.completed).length;
    const total = S.tasks.length || 1;
    const focusMin = S.focusSessions.filter(f => f.date === S.lastDayGenerated).reduce((a, f) => a + f.minutes, 0);
    const prev = S.history[S.lastDayGenerated] || {};
    S.history[S.lastDayGenerated] = Object.assign({}, prev, { completed: done, total, focusMinutes: focusMin });

    // Gemiste dag: één genadedag per week houdt je reeks heel (geen streak-angst).
    const gap = daysBetween(S.lastActiveDate || S.lastDayGenerated, today);
    if (S.lastActiveDate && gap > 1) {
      if (gap === 2 && graceAvailable()) useGrace(today);
      else S.streak = 0;
    }
  }

  // regenerate today's path
  S.tasks = DATA.generateDayPath(S.user.priorities, S.habits);
  S.lastDayGenerated = today;
  save();
}

/* ---------- Scoring ---------- */
function awardVirtus(base, x, y) {
  const mult = DATA.streakMultiplier(S.streak);
  const gained = Math.round(base * mult);
  S.virtus += gained;
  save();
  virtusPop(gained, x, y);
  return gained;
}

function registerActivity() {
  const today = todayStr();
  if (S.lastActiveDate === today) return;
  const gap = S.lastActiveDate ? daysBetween(S.lastActiveDate, today) : null;
  if (gap === 1 || gap === null) S.streak += 1;
  else if (gap === 2 && graceAvailable()) { useGrace(today); S.streak += 1; }
  else if (gap > 1) S.streak = 1;
  S.lastActiveDate = today;
  if (S.streak > S.bestStreak) S.bestStreak = S.streak;
  save();
}

function checkFullDay() {
  const all = S.tasks.length > 0 && S.tasks.every(t => t.completed);
  const today = todayStr();
  if (all && !(S.history[today] && S.history[today].fullAwarded)) {
    S.history[today] = Object.assign({ completed: S.tasks.length, total: S.tasks.length, focusMinutes: 0, fullAwarded: true }, S.history[today] || {}, { fullAwarded: true });
    const wk = weeksLived();
    if (!S.strongWeeks.includes(wk)) S.strongWeeks.push(wk);
    awardVirtus(DATA.VIRTUS.fullDay);
    toast("Dag voltooid — MORI staat rechter. +" + Math.round(DATA.VIRTUS.fullDay * DATA.streakMultiplier(S.streak)) + " Virtus");
    save();
  }
}

/* ============================================================
   RENDER
   ============================================================ */
const app = document.getElementById("app");

function render() {
  if (S.settings.theme === "dark") document.body.classList.add("theme-dark");
  else document.body.classList.remove("theme-dark");

  if (!S.onboarded) {
    if (route === "splash") return renderSplash();
    return renderOnboarding();
  }
  ensureToday();

  let inner = "";
  switch (route) {
    case "home":      inner = viewHome(); break;
    case "mori":      inner = viewMori(); break;
    case "timeline":  inner = viewTimeline(); break;
    case "analytics": inner = viewAnalytics(); break;
    case "settings":  inner = viewSettings(); break;
    case "total":     inner = viewTotal(); break;
    case "path":      inner = viewPath(); break;
    case "mirror":    inner = viewMirror(); break;
    case "reflect-morning": inner = viewReflect("morning"); break;
    case "reflect-evening": inner = viewReflect("evening"); break;
    default: inner = viewHome();
  }
  app.innerHTML = topbar() + `<main class="screen">${inner}</main>` + bottomNav();
  afterRender();
}

function topbar() {
  return `<header class="topbar">
    <span class="brand">MEMENTO</span>
    <span class="date">${prettyDate()}</span>
  </header>`;
}

function bottomNav() {
  const item = (r, icon, label) =>
    `<a href="#" data-nav="${r}" class="${route === r ? "active" : ""}">${icon}<span>${label}</span></a>`;
  return `<nav class="bottom-nav">
    ${item("home", I.home, "Vandaag")}
    ${item("total", I.grid, "Totaal")}
    ${item("mori", I.mori, "MORI")}
    ${item("mirror", I.chart, "Spiegel")}
    ${item("settings", I.gear, "Meer")}
  </nav>`;
}

/* ---------- SPLASH ---------- */
function renderSplash() {
  app.innerHTML = `
    <div class="splash">
      <div class="mori-mark" style="width:180px">${MORI.render(1)}</div>
      <div class="logo serif">MEMENTO<small>MORI</small></div>
      <p class="tagline">Remember to live.</p>
      <button class="btn lg" data-action="onb-start">Begin ${I.arrow}</button>
    </div>`;
}

/* ============================================================
   ONBOARDING (8 stappen)
   ============================================================ */
const ONB_STEPS = 8;

function renderOnboarding() {
  if (!onb) onb = { step: 1, dream: {}, blockers: [], identity: [], priorities: [], name: "", birthdate: "", wakeTime: "07:00", sleepTime: "23:00" };
  const pct = Math.round((onb.step / ONB_STEPS) * 100);
  app.innerHTML = `
    <div class="onb">
      <div class="onb-top">
        <div class="progress-rail"><div class="progress-fill" style="width:${pct}%"></div></div>
        <div class="onb-step-count">Stap ${onb.step} / ${ONB_STEPS}</div>
      </div>
      <div class="onb-body">${onbStep(onb.step)}</div>
      <div class="onb-nav">
        ${onb.step > 1 ? `<button class="link-btn" data-action="onb-back">${I.back} Terug</button>` : `<span></span>`}
        <button class="btn" data-action="onb-next">${onb.step === ONB_STEPS ? "Bouw mijn eerste dag" : "Verder"} ${I.arrow}</button>
      </div>
    </div>`;
  afterRender();
}

function onbStep(step) {
  switch (step) {
    case 1: return `
      <span class="eyebrow">Welkom</span>
      <h2>Je krijgt geen tweede leven. Bouw dit goed.</h2>
      <p class="sub">MEMENTO is geen takenlijst. Het is een systeem dat je elke dag terugbrengt naar wie je wilde worden.</p>
      <div class="field"><label>Je naam</label><input type="text" data-onb="name" value="${esc(onb.name)}" placeholder="Hoe heet je?"></div>`;

    case 2: return `
      <span class="eyebrow">Droomleven</span>
      <h2>Hoe ziet je ideale leven eruit over 3 jaar?</h2>
      <p class="sub">Wees concreet. Vaag ingevuld = vaag geleefd.</p>
      ${DATA.DREAM_FIELDS.map(f => `
        <div class="field">
          <label>${f.label}</label>
          <textarea data-dream="${f.key}" placeholder="${f.ph}">${esc(onb.dream[f.key] || "")}</textarea>
        </div>`).join("")}`;

    case 3: return `
      <span class="eyebrow">Blokkades</span>
      <h2>Wat houdt je nu tegen?</h2>
      <p class="sub">Benoem de vijand. Dan kun je hem verslaan.</p>
      <div class="chips">${DATA.BLOCKERS.map(b =>
        `<button class="chip ${onb.blockers.includes(b) ? "on" : ""}" data-toggle="blockers" data-val="${b}">${b}</button>`).join("")}</div>`;

    case 4: return `
      <span class="eyebrow">Identiteit</span>
      <h2>Wie moet je worden om dat leven te krijgen?</h2>
      <p class="sub">Je hebt geen takenprobleem. Je hebt een identiteitskeuze.</p>
      <div class="chips">${DATA.IDENTITY_TRAITS.map(t =>
        `<button class="chip ${onb.identity.includes(t) ? "on" : ""}" data-toggle="identity" data-val="${t}">${t}</button>`).join("")}</div>`;

    case 5: return `
      <span class="eyebrow">Ideale dag</span>
      <h2>Wanneer begint en eindigt je dag?</h2>
      <p class="sub">Je dag is de kleinste eenheid van je leven.</p>
      <div class="row">
        <div class="field grow"><label>Wakker worden</label><input type="time" data-onb="wakeTime" value="${onb.wakeTime}"></div>
        <div class="field grow"><label>Slapen</label><input type="time" data-onb="sleepTime" value="${onb.sleepTime}"></div>
      </div>`;

    case 6: return `
      <span class="eyebrow">Prioriteiten</span>
      <h2>Welke 3 gebieden veranderen je leven het meest?</h2>
      <p class="sub">Kies er precies 3. Focus is kiezen wat je níet doet.</p>
      <div class="chips">${DATA.PRIORITIES.map(p =>
        `<button class="chip ${onb.priorities.includes(p) ? "on" : ""}" data-toggle="priorities" data-val="${p}" data-max="3">${p}</button>`).join("")}</div>
      <p class="muted" style="margin-top:14px;font-size:.85rem">${onb.priorities.length}/3 gekozen</p>`;

    case 7: {
      const showLife = !!onb.birthdate;
      let lifeHtml = "";
      if (showLife) {
        const b = new Date(onb.birthdate + "T00:00:00");
        const wl = Math.max(0, Math.floor((Date.now() - b.getTime()) / (7 * 86400000)));
        const age = Math.floor((Date.now() - b.getTime()) / (365.25 * 86400000));
        lifeHtml = `
          <div class="life-preview">
            <div class="big-stat serif">${wl.toLocaleString("nl-NL")}</div>
            <p class="muted">weken geleefd · ${age} jaar oud</p>
            <div class="big-stat serif" style="margin-top:14px">${(DATA.LIFE_WEEKS - wl).toLocaleString("nl-NL")}</div>
            <p class="muted">weken tot ${DATA.LIFE_YEARS} — als je geluk hebt</p>
            ${miniWeeks(wl)}
            <p class="impact-text" style="margin-top:16px">Dit is geen angst.<br>Dit is helderheid.</p>
          </div>`;
      }
      return `
        <span class="eyebrow">Levensduur</span>
        <h2>Hoeveel tijd heb je nog?</h2>
        <p class="sub">Je leven in weken. Elk blok is één week.</p>
        <div class="field"><label>Geboortedatum</label><input type="date" data-onb="birthdate" value="${onb.birthdate}"></div>
        ${lifeHtml}`;
    }

    case 8: return `
      <span class="eyebrow">Klaar</span>
      <h2>Je eerste dag staat klaar.</h2>
      <p class="sub">MORI begint als ruwe steen. Elke gefocuste actie hakt hem verder vrij.</p>
      <div class="mori-stage" style="margin:10px 0"><div class="mori-svg-wrap" style="width:200px">${MORI.render(1)}</div></div>
      <p class="center muted">“Dit ben jij aan het begin. Potentie, nog niet gevormd.”</p>`;
  }
}

function miniWeeks(lived) {
  // compact 40x8 preview grid (not full life)
  const cols = 52, rows = 12, total = cols * rows;
  let cells = "";
  for (let i = 0; i < total; i++) {
    const cls = i < lived ? "lived" : (i === lived ? "current" : "future");
    cells += `<div class="wk ${cls}"></div>`;
  }
  return `<div class="weeks-grid" style="margin-top:16px">${cells}</div>`;
}

function onbNext() {
  // validate per step
  if (onb.step === 6 && onb.priorities.length !== 3) { toast("Kies precies 3 prioriteiten."); return; }
  if (onb.step === 7 && !onb.birthdate) { toast("Vul je geboortedatum in."); return; }
  if (onb.step < ONB_STEPS) { onb.step++; renderOnboarding(); window.scrollTo(0,0); return; }
  finishOnboarding();
}

function finishOnboarding() {
  S.user.name = onb.name.trim();
  S.user.birthdate = onb.birthdate;
  S.user.dream = onb.dream;
  S.user.blockers = onb.blockers;
  S.user.identity = onb.identity;
  S.user.priorities = onb.priorities;
  S.user.wakeTime = onb.wakeTime;
  S.user.sleepTime = onb.sleepTime;
  S.onboarded = true;
  S.tasks = DATA.generateDayPath(S.user.priorities, S.habits);
  S.lastDayGenerated = todayStr();
  onb = null;
  save();
  route = "home";
  render();
  toast("Welkom, " + (S.user.name || "bouwer") + ". Je tijd loopt.");
}

/* ============================================================
   HOME / DASHBOARD
   ============================================================ */
function viewHome() {
  const level = MORI.levelFor(S.virtus);
  const stage = MORI.STAGES[level - 1];
  const done = S.tasks.filter(t => t.completed).length;
  const total = S.tasks.length;
  const pct = total ? Math.round((done / total) * 100) : 0;
  const buildTrait = S.user.identity[0] || "Discipline";
  const focusWeek = focusMinutesThisWeek();
  const biggest = S.tasks.filter(t => !t.completed).sort((a,b) => b.duration - a.duration)[0];

  return `
    <p class="eyebrow">Vandaag bouw je</p>
    <h1 class="hero-quote serif">${cap(buildTrait)}</h1>
    <p class="building-line">“${DATA.quoteForToday()}”</p>

    <div class="stat-row">
      <div class="stat"><div class="v serif">${S.virtus.toLocaleString("nl-NL")}</div><div class="l">Virtus</div></div>
      <div class="stat"><div class="v serif">${S.streak}</div><div class="l">Streak</div></div>
      <div class="stat"><div class="v serif">${fmtHrs(focusWeek)}</div><div class="l">Focus/week</div></div>
    </div>

    ${stageCardHTML()}

    <div class="card" style="display:flex;align-items:center;gap:16px">
      <div class="ring-wrap">${progressRing(pct, 64)}<div class="pct">${pct}%</div></div>
      <div class="grow">
        <div style="font-weight:600">Dagprogressie</div>
        <div class="muted" style="font-size:.85rem">${done} van ${total} acties voltooid</div>
      </div>
      <div class="tag">${stage.name}</div>
    </div>

    ${biggest ? `
    <div class="section-title"><h3>Grootste taak</h3></div>
    <div class="focus-cta" data-focus-task="${biggest.id}">
      <div><div class="fc-label">Start focus</div><div class="fc-task serif">${esc(biggest.title)}</div>
        <div class="muted" style="font-size:.82rem;color:var(--stone-400)">${biggest.duration} min · ${esc(biggest.tag || "")}</div></div>
      <div class="fc-play">${I.play}</div>
    </div>` : `<div class="card center muted" style="margin-top:20px">Alles voltooid. MORI ademt rustig uit.</div>`}

    <div class="section-title"><h3>Day Path</h3>
      <button class="add-link" data-action="add-action-open">${I.plus} Actie</button></div>
    <div id="task-list">${S.tasks.map(taskRow).join("")}</div>
    <div class="meta muted" style="text-align:center;font-size:.78rem;margin-top:6px">${done}/${total} voltooid · voeg je eigen dagelijkse acties toe</div>

    <div class="section-title"><h3>Reflectie</h3><span class="meta">typen of inspreken</span></div>
    <button class="voice-cta" data-nav="${new Date().getHours() < 15 ? 'reflect-morning' : 'reflect-evening'}">
      <span class="vc-ico">${VI.mic}</span>
      <span class="vc-main"><span class="vc-t">Spreek je reflectie in</span>
        <span class="vc-s">In het Nederlands · dertig seconden is genoeg</span></span>
    </button>
    <div class="row" style="margin-top:10px">
      <button class="btn ghost grow" data-nav="reflect-morning">Ochtend</button>
      <button class="btn ghost grow" data-nav="reflect-evening">Avond</button>
    </div>

    <div class="section-title"><h3>Dagcheck</h3><span class="meta" data-nav="total" style="cursor:pointer">Totaalbeeld →</span></div>
    <div class="card dagcheck-nudge" data-nav="total">
      <div><b>${Object.keys((S.signals && S.signals[todayStr()]) || {}).length}</b> van ${(S.tracked || []).length} signalen ingevuld vandaag</div>
      <div class="muted" style="font-size:.85rem">Tien seconden. Zo ziet MEMENTO je hele leven, niet alleen je taken.</div>
    </div>

    <div class="section-title"><h3>Je leven in weken</h3><span class="meta" data-nav="timeline" style="cursor:pointer">Bekijk →</span></div>
    ${lifePreviewCard()}
  `;
}

function taskRow(t) {
  const isReflect = t.tag === "reflectie";
  const actionBtn = isReflect
    ? `<button class="task-act" data-nav="${t.title.toLowerCase().includes("ochtend") ? "reflect-morning" : "reflect-evening"}" title="Reflecteer">${I.arrow}</button>`
    : `<button class="task-act" data-focus-task="${t.id}" title="Start focus">${I.play}</button>`;
  const delBtn = t.custom ? `<button class="task-act del" data-del-task="${t.id}" title="Verwijder">${I.trash}</button>` : "";
  return `
    <div class="task ${t.completed ? "done" : ""}" data-task="${t.id}">
      <button class="task-check" data-toggle-task="${t.id}">${I.check}</button>
      <div class="task-main">
        <div class="task-title">${esc(t.title)} ${t.custom ? `<span class="custom-badge">${t.habitId ? "dagelijks" : "vandaag"}</span>` : ""}</div>
        <div class="task-sub">
          <span>⏱ ${t.duration} min</span>
          ${t.tag ? `<span>◆ ${esc(t.tag)}</span>` : ""}
        </div>
      </div>
      ${actionBtn}${delBtn}
    </div>`;
}

function lifePreviewCard() {
  const wl = weeksLived();
  const strong = S.strongWeeks.length;
  return `<div class="card">
    <p class="impact-text serif">Deze week is één blok in je leven. Vul hem goed.</p>
    <p class="muted" style="margin-top:6px">Je hebt ${wl.toLocaleString("nl-NL")} weken geleefd · ${strong} sterke week${strong === 1 ? "" : "en"} gebouwd.</p>
  </div>`;
}

/* ---------- progress ring SVG ---------- */
function progressRing(pct, size) {
  const r = size / 2 - 5, c = 2 * Math.PI * r, off = c * (1 - pct / 100);
  return `<svg width="${size}" height="${size}" style="transform:rotate(-90deg)">
    <circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="var(--line)" stroke-width="5"/>
    <circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="var(--text)" stroke-width="5"
      stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${off}" style="transition:stroke-dashoffset .6s var(--ease)"/>
  </svg>`;
}

/* ============================================================
   MORI PROGRESS
   ============================================================ */
function viewMori() {
  const level = MORI.levelFor(S.virtus);
  const stage = MORI.STAGES[level - 1];
  const nextThresh = MORI.THRESHOLDS[level] || null;
  const prevThresh = MORI.THRESHOLDS[level - 1] || 0;
  const prog = nextThresh ? Math.round(((S.virtus - prevThresh) / (nextThresh - prevThresh)) * 100) : 100;

  return `
    <span class="eyebrow center" style="display:block">MORI · niveau ${level} van 7</span>
    <div class="mori-stage"><div class="mori-svg-wrap mori-glow">${MORI.render(level)}</div></div>
    <div class="mori-title serif">${stage.name}</div>
    <div class="mori-level-label">${stage.label}</div>

    <div class="card" style="margin-top:20px">
      <div class="row" style="justify-content:space-between;align-items:baseline">
        <span style="font-weight:600">${S.virtus.toLocaleString("nl-NL")} Virtus</span>
        <span class="muted" style="font-size:.85rem">${nextThresh ? `nog ${(nextThresh - S.virtus).toLocaleString("nl-NL")} tot niveau ${level+1}` : "Maximale vorm bereikt"}</span>
      </div>
      <div class="mori-progress-bar"><div style="width:${Math.max(2, prog)}%"></div></div>
    </div>

    <div class="levels-list">
      ${MORI.STAGES.map(s => {
        const reached = level >= s.level;
        const cur = level === s.level;
        const req = MORI.THRESHOLDS[s.level - 1];
        return `<div class="level-item ${cur ? "current" : reached ? "unlocked" : "locked"}">
          <div class="lv-badge">${s.level}</div>
          <div class="grow"><div class="lv-name">${s.name}</div><div class="lv-desc">${s.label}</div></div>
          <div class="lv-req">${reached ? (cur ? "nu" : "✓") : req.toLocaleString("nl-NL") + " V"}</div>
        </div>`;
      }).join("")}
    </div>`;
}

/* ============================================================
   LIFE TIMELINE
   ============================================================ */
function viewTimeline() {
  const wl = weeksLived();
  const age = ageYears();
  const strongSet = new Set(S.strongWeeks);
  let cells = "";
  for (let i = 0; i < DATA.LIFE_WEEKS; i++) {
    let cls;
    if (strongSet.has(i)) cls = "strong";
    else if (i === wl) cls = "current";
    else if (i < wl) cls = "lived";
    else cls = "future";
    cells += `<div class="wk ${cls}"></div>`;
  }
  const focusHrs = Math.round(S.focusSessions.reduce((a, f) => a + f.minutes, 0) / 60);

  return `
    <p class="eyebrow">Life Timeline</p>
    <h2 class="serif" style="font-size:1.8rem;margin:4px 0 2px">Je leven in weken</h2>
    <p class="muted">80 jaar · ${DATA.LIFE_WEEKS.toLocaleString("nl-NL")} weken · elk blok is één week</p>

    <div class="weeks-grid">${cells}</div>

    <div class="legend">
      <span><i style="background:var(--stone-400)"></i> geleefd</span>
      <span><i style="background:var(--ink)"></i> sterke week</span>
      <span><i style="background:var(--gold)"></i> deze week</span>
      <span><i style="background:var(--stone-100);border:1px solid var(--stone-200)"></i> toekomst</span>
    </div>

    <hr class="divider">
    <p class="impact-text serif">Je hebt ${wl.toLocaleString("nl-NL")} weken geleefd.</p>
    <p class="impact-text serif">Je hebt ${focusHrs} gefocuste uren teruggewonnen.</p>
    <p class="muted" style="margin-top:10px">${age} jaar oud · nog ± ${(DATA.LIFE_WEEKS - wl).toLocaleString("nl-NL")} weken. Deze week telt.</p>
  `;
}

/* ============================================================
   ANALYTICS
   ============================================================ */
function viewAnalytics() {
  // last 7 days focus minutes
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const key = todayStr(d);
    const min = S.focusSessions.filter(f => f.date === key).reduce((a, f) => a + f.minutes, 0);
    days.push({ key, min, lbl: d.toLocaleDateString("nl-NL", { weekday: "short" }).slice(0,2) });
  }
  const max = Math.max(60, ...days.map(d => d.min));
  const totalFocus = S.focusSessions.reduce((a, f) => a + f.minutes, 0);
  const sessions = S.focusSessions.length;
  const totalTasks = Object.values(S.history).reduce((a, h) => a + (h.completed || 0), 0) + S.tasks.filter(t=>t.completed).length;

  // time reclaimed: elke focus minuut = teruggewonnen tijd
  const reclaimedHrs = totalFocus / 60;
  const perYear = Math.round((focusMinutesThisWeek() / 60) * 52);
  const workdays = Math.round(perYear / 8);
  const workweeks = Math.round(perYear / 40);

  return `
    <p class="eyebrow">Inzicht</p>
    <h2 class="serif" style="font-size:1.8rem;margin:4px 0 14px">Bewijs, geen gevoel.</h2>

    <div class="card">
      <div class="section-title" style="margin:0 0 6px"><h3 style="font-size:1.2rem">Focus deze week</h3><span class="meta">${fmtHrs(focusMinutesThisWeek())}</span></div>
      <div class="bars">
        ${days.map(d => `<div class="bar-col">
          <div class="bar" style="height:${Math.round((d.min / max) * 100)}%"></div>
          <div class="bar-lbl">${d.lbl}</div></div>`).join("")}
      </div>
    </div>

    <div class="stat-row" style="margin-top:16px">
      <div class="stat"><div class="v serif">${sessions}</div><div class="l">Sessies</div></div>
      <div class="stat"><div class="v serif">${totalTasks}</div><div class="l">Taken</div></div>
      <div class="stat"><div class="v serif">${S.bestStreak}</div><div class="l">Beste streak</div></div>
    </div>

    <div class="section-title"><h3>Tijd teruggewonnen</h3></div>
    <div class="card">
      <p class="impact-text serif">${reclaimedHrs.toFixed(1)} uur gefocust.</p>
      <p class="muted" style="margin:8px 0 14px">In dit tempo per jaar:</p>
      <div class="reclaimed-grid">
        <div class="stat"><div class="v serif">${perYear}</div><div class="l">uur / jaar</div></div>
        <div class="stat"><div class="v serif">${workdays}</div><div class="l">werkdagen</div></div>
        <div class="stat"><div class="v serif">${workweeks}</div><div class="l">werkweken</div></div>
        <div class="stat"><div class="v serif">${S.virtus.toLocaleString("nl-NL")}</div><div class="l">Virtus totaal</div></div>
      </div>
    </div>
    <p class="muted center" style="margin-top:20px;font-size:.85rem">“Focus is respect voor je toekomst.”</p>
  `;
}

/* ============================================================
   REFLECTION
   ============================================================ */

/* ============================================================
   SETTINGS
   ============================================================ */
function viewSettings() {
  const u = S.user;
  return `
    <p class="eyebrow">Meer</p>
    <h2 class="serif" style="font-size:1.9rem;margin:4px 0 18px">Instellingen</h2>

    <div class="card">
      <div class="set-row"><div><div class="lbl">Nachtmodus</div><div class="desc">De tempel bij nacht</div></div>
        <div class="switch ${S.settings.theme === "dark" ? "on" : ""}" data-action="toggle-theme"></div></div>
      <div class="set-row"><div><div class="lbl">Mentor-notificaties</div><div class="desc">Herinneringen die confronteren, niet zeuren</div></div>
        <div class="switch ${S.settings.notifications ? "on" : ""}" data-action="toggle-notif"></div></div>
      <div class="set-row"><div><div class="lbl">Standaard focusduur</div><div class="desc">Voorkeur voor nieuwe sessies</div></div>
        <select data-action="set-focus" style="padding:8px 12px;border:1px solid var(--line);border-radius:10px;background:var(--surface)">
          ${[25,50,90].map(m => `<option value="${m}" ${S.settings.defaultFocus===m?"selected":""}>${m} min</option>`).join("")}
        </select></div>
    </div>

    <div class="section-title"><h3>Mijn dagelijkse acties</h3>
      <button class="add-link" data-action="add-action-open">${I.plus} Nieuw</button></div>
    <div class="card">
      <p class="muted" style="font-size:.85rem;margin-bottom:${S.habits.length ? "12px" : "0"}">Terugkerende acties die elke dag automatisch in je Day Path verschijnen. Je 3 prioriteiten uit de onboarding staan er al standaard in — dit zijn je eigen extra's.</p>
      ${S.habits.length ? S.habits.map(h => `
        <div class="habit-row">
          <div class="h-main"><div class="h-title">${esc(h.title)}</div><div class="h-sub">${h.duration} min · ${esc(h.tag || "eigen actie")}</div></div>
          <button class="icon-btn" data-del-habit="${h.id}" title="Verwijder">${I.trash}</button>
        </div>`).join("") : `<p class="muted" style="font-size:.85rem;margin-top:6px">Nog geen eigen acties. Voeg er een toe met <b>Nieuw</b>.</p>`}
    </div>

    <div class="section-title"><h3>Jouw droom</h3></div>
    <div class="card">
      <p class="muted" style="font-size:.85rem;margin-bottom:10px">Je bouwt naar dit toe. Herlees het als je twijfelt.</p>
      ${DATA.DREAM_FIELDS.filter(f => u.dream[f.key]).map(f =>
        `<div style="margin-bottom:10px"><span class="tag">${f.label}</span><div style="margin-top:4px">${esc(u.dream[f.key])}</div></div>`
      ).join("") || `<p class="muted">Nog niets ingevuld.</p>`}
      <hr class="divider">
      <p><b>Word:</b> ${u.identity.map(t => `<span class="tag">${t}</span>`).join(" ") || "—"}</p>
      <p style="margin-top:8px"><b>Focus op:</b> ${u.priorities.map(t => `<span class="tag">${t}</span>`).join(" ") || "—"}</p>
    </div>

    <div class="section-title"><h3>Wat je dagelijks bijhoudt</h3></div>
    <div class="card">
      <p class="muted" style="font-size:.85rem;margin-bottom:12px">Kies je signalen. Hoe minder je aanvinkt, hoe groter de kans dat je het volhoudt.</p>
      ${["personal","business"].map(g => `
        <div class="track-group"><div class="tg-label">${g === "personal" ? "Persoonlijk" : "Zakelijk"}</div>
        ${LIFE.SIGNALS.filter(s => s.group === g).map(s => `
          <label class="track-row">
            <input type="checkbox" data-track="${s.key}" ${(S.tracked || []).includes(s.key) ? "checked" : ""}>
            <span>${s.label}</span><span class="tr-u">${s.unit || "1-5"}</span>
          </label>`).join("")}</div>`).join("")}
    </div>

    <div class="section-title"><h3>Claude als mentor</h3></div>
    <div class="card">
      <p class="muted" style="font-size:.85rem;margin-bottom:12px">
        Optioneel. Zonder sleutel werkt de Spiegel gewoon met je eigen patronen.
        Met je eigen Claude-sleutel denkt Claude in het Nederlands met je mee over je dromen, gedrag en reflecties.
        De sleutel blijft in dit apparaat staan; je data gaat alleen naar Anthropic op het moment dat jij op <i>Vraag Claude</i> tikt.
      </p>
      <input type="password" class="txt-input" data-ai-key placeholder="sk-ant-…" value="${esc(S.settings.ai.key || "")}" autocomplete="off">
      <select class="txt-input" data-ai-model style="margin-top:10px">
        ${[["claude-sonnet-5","Sonnet 5 · snel en scherp"],["claude-opus-5","Opus 5 · diepste analyse"],["claude-haiku-4-5-20251001","Haiku 4.5 · snelst en goedkoopst"]]
          .map(m => `<option value="${m[0]}" ${S.settings.ai.model === m[0] ? "selected" : ""}>${m[1]}</option>`).join("")}
      </select>
      <p class="muted" style="font-size:.78rem;margin-top:10px">Sleutel maken kan op console.anthropic.com. Kosten lopen via je eigen account.</p>
    </div>

    <div class="section-title"><h3>Privacy & data</h3></div>
    <div class="card">
      <p class="muted" style="font-size:.85rem;margin-bottom:12px">Je dromen en gedrag blijven op dit apparaat. Niets wordt verkocht.</p>
      <div class="row wrap">
        <button class="btn ghost" data-action="export">Exporteer data</button>
        <button class="btn ghost" data-action="reset">Reset alles</button>
      </div>
    </div>
    <p class="muted center" style="margin-top:24px;font-size:.8rem">MEMENTO · Remember you must live.</p>
  `;
}

/* ============================================================
   FOCUS MODE
   ============================================================ */
function openFocusPicker(taskId) {
  const task = S.tasks.find(t => t.id === taskId) || null;
  const def = task ? task.duration : S.settings.defaultFocus;
  focusCtx = { taskId, task, minutes: pickDuration(def), running: false, remaining: 0, timer: null };
  renderFocusPicker();
}

function pickDuration(def) {
  const opts = DATA.FOCUS_DURATIONS.map(d => d.min);
  return opts.reduce((best, m) => Math.abs(m - def) < Math.abs(best - def) ? m : best, opts[0]);
}

function renderFocusPicker() {
  const t = focusCtx.task;
  const overlay = document.createElement("div");
  overlay.className = "focus-overlay";
  overlay.id = "focus-overlay";
  overlay.innerHTML = `
    <div class="focus-mori-mini">${MORI.render(MORI.levelFor(S.virtus))}</div>
    <div class="f-task serif">${t ? esc(t.title) : "Vrije focus"}</div>
    <p class="f-why">${t ? esc(t.why || "Deze sessie bouwt je toekomst.") : "Deze sessie bouwt je toekomst."}</p>
    <p class="focus-line">Kies je focusduur</p>
    <div class="duration-picker">
      ${DATA.FOCUS_DURATIONS.map(d => `<button class="chip ${focusCtx.minutes===d.min?"on":""}" data-dur="${d.min}">${d.label}</button>`).join("")}
    </div>
    <div class="focus-actions">
      <button class="btn" data-action="focus-cancel">Sluit</button>
      <button class="btn primary" data-action="focus-begin">Start · ${focusCtx.minutes} min</button>
    </div>`;
  document.body.appendChild(overlay);
}

function beginFocus() {
  const o = document.getElementById("focus-overlay");
  focusCtx.remaining = focusCtx.minutes * 60;
  focusCtx.running = true;
  o.innerHTML = focusRunningHTML();
  o.classList.add("focus-done-anim");
  focusCtx.timer = setInterval(tickFocus, 1000);
  updateFocusUI();
}

function focusRunningHTML() {
  const t = focusCtx.task;
  return `
    <p class="focus-line">${t ? esc(t.tag || "") : "focus"}</p>
    <div class="f-task serif">${t ? esc(t.title) : "Vrije focus"}</div>
    <div class="focus-ring-wrap">
      <svg class="ring" viewBox="0 0 200 200">
        <circle cx="100" cy="100" r="92" fill="none" stroke="rgba(255,255,255,.12)" stroke-width="6"/>
        <circle id="focus-ring-fg" cx="100" cy="100" r="92" fill="none" stroke="#f5f4f1" stroke-width="6"
          stroke-linecap="round" stroke-dasharray="${2*Math.PI*92}" stroke-dashoffset="0"/>
      </svg>
      <div class="center">
        <div class="focus-mori-mini" style="width:56px">${MORI.render(MORI.levelFor(S.virtus))}</div>
        <div class="focus-timer" id="focus-time">${fmtTime(focusCtx.remaining)}</div>
      </div>
    </div>
    <p class="f-why">${t ? esc(t.why || "Deze 50 minuten zijn de prijs van je vrijheid.") : "Geen afleiding. Bouw."}</p>
    <div class="focus-actions">
      <button class="btn" id="focus-pause" data-action="focus-pause">Pauze</button>
      <button class="btn" data-action="focus-stop">Stop</button>
    </div>`;
}

function tickFocus() {
  if (!focusCtx || !focusCtx.running) return;
  focusCtx.remaining--;
  if (focusCtx.remaining <= 0) { completeFocus(); return; }
  updateFocusUI();
}

function updateFocusUI() {
  const el = document.getElementById("focus-time");
  if (el) el.textContent = fmtTime(focusCtx.remaining);
  const ring = document.getElementById("focus-ring-fg");
  if (ring) {
    const c = 2 * Math.PI * 92;
    const frac = focusCtx.remaining / (focusCtx.minutes * 60);
    ring.style.strokeDashoffset = String(c * (1 - frac));
  }
}

function pauseFocus() {
  focusCtx.running = !focusCtx.running;
  const b = document.getElementById("focus-pause");
  if (b) b.textContent = focusCtx.running ? "Pauze" : "Hervat";
}

function stopFocus(completed) {
  if (focusCtx && focusCtx.timer) clearInterval(focusCtx.timer);
  const o = document.getElementById("focus-overlay");
  if (o) o.remove();
  focusCtx = null;
}

function completeFocus() {
  clearInterval(focusCtx.timer);
  const mins = focusCtx.minutes;
  const t = focusCtx.task;
  // record session
  S.focusSessions.push({ date: todayStr(), minutes: mins, taskTitle: t ? t.title : "Vrije focus" });
  registerActivity();
  const base = DATA.virtusForFocus(mins);
  // mark linked task completed
  if (t) { const tk = S.tasks.find(x => x.id === t.id); if (tk && !tk.completed) tk.completed = true; }
  save();

  const o = document.getElementById("focus-overlay");
  if (o) {
    o.innerHTML = `
      <div class="focus-mori-mini" style="width:120px" class="focus-done-anim">${MORI.render(MORI.levelFor(S.virtus))}</div>
      <div class="f-task serif">Sessie voltooid.</div>
      <p class="f-why">MORI hakt een stuk steen weg. Je toekomst is ${mins} minuten dichterbij.</p>
      <div class="focus-actions"><button class="btn primary" data-action="focus-finish">Klaar</button></div>`;
  }
  const gained = Math.round(base * DATA.streakMultiplier(S.streak));
  S.virtus += gained; save();
  checkFullDay();
}

/* ============================================================
   ADD ACTION (eigen dagelijkse acties)
   ============================================================ */
let addForm = null;

function openAddAction() {
  addForm = { duration: 25, repeat: false };
  const m = document.createElement("div");
  m.className = "modal-backdrop";
  m.id = "add-modal";
  m.innerHTML = `
    <div class="modal" role="dialog" aria-label="Actie toevoegen">
      <h3>Eigen actie toevoegen</h3>
      <p class="modal-sub">Wat wil je vandaag — of elke dag — doen? Dit komt in je Day Path.</p>
      <div class="field"><label>Wat ga je doen?</label>
        <input type="text" id="add-title" placeholder="bv. Mediteren, Wandelen, Journalen" autocomplete="off"></div>
      <div class="field"><label>Hoelang</label>
        <div class="dur-chips">
          ${[10,15,25,45,50,90].map(d => `<button type="button" class="chip ${d===25?"on":""}" data-add-dur="${d}">${d} min</button>`).join("")}
        </div>
      </div>
      <div class="repeat-row">
        <div><div class="lbl" style="font-weight:600">Elke dag herhalen</div>
          <div class="desc muted" style="font-size:.82rem">Zet 'm vast als dagelijkse actie</div></div>
        <div class="switch" id="add-repeat" data-action="add-toggle-repeat"></div>
      </div>
      <div class="modal-actions">
        <button class="btn ghost grow" data-action="add-action-cancel">Annuleer</button>
        <button class="btn grow" data-action="add-action-save">Toevoegen</button>
      </div>
    </div>`;
  document.body.appendChild(m);
  m.addEventListener("click", (e) => { if (e.target === m) closeAddAction(); });
  setTimeout(() => { const i = document.getElementById("add-title"); if (i) i.focus(); }, 60);
}

function closeAddAction() {
  const m = document.getElementById("add-modal");
  if (m) m.remove();
  addForm = null;
}

function saveAddAction() {
  const title = (document.getElementById("add-title").value || "").trim();
  if (!title) { toast("Geef je actie een naam."); return; }
  const dur = addForm.duration;
  const repeat = addForm.repeat;
  const type = DATA.typeForDuration(dur);
  const base = { title, duration: dur, type, why: "Je koos deze actie zelf. Bewijs het.", tag: "eigen actie", custom: true, completed: false };
  if (repeat) {
    const habit = { id: "h" + Date.now(), title, duration: dur, type, tag: "eigen actie" };
    S.habits.push(habit);
    base.habitId = habit.id;
  }
  // voeg vandaag toe, net vóór de avondreview
  S.tasks.splice(Math.max(0, S.tasks.length - 1), 0, Object.assign({ id: "t" + Date.now() }, base));
  save();
  closeAddAction();
  toast(title + " toegevoegd" + (repeat ? " · elke dag" : ""));
  render();
}

/* ============================================================
   EVENT HANDLING
   ============================================================ */
function afterRender() {
  // bind textareas/inputs live (onboarding + reflect via delegation below)
}

// delegated clicks
document.addEventListener("click", (e) => {
  const nav = e.target.closest("[data-nav]");
  if (nav) { e.preventDefault(); route = nav.getAttribute("data-nav"); render(); window.scrollTo(0,0); return; }

  const ft = e.target.closest("[data-focus-task]");
  if (ft) { openFocusPicker(ft.getAttribute("data-focus-task")); return; }

  const tt = e.target.closest("[data-toggle-task]");
  if (tt) { toggleTask(tt.getAttribute("data-toggle-task")); return; }

  const dtk = e.target.closest("[data-del-task]");
  if (dtk) { delTask(dtk.getAttribute("data-del-task")); return; }

  const dhb = e.target.closest("[data-del-habit]");
  if (dhb) { delHabit(dhb.getAttribute("data-del-habit")); return; }

  const adur = e.target.closest("[data-add-dur]");
  if (adur && addForm) {
    addForm.duration = parseInt(adur.getAttribute("data-add-dur"), 10);
    document.querySelectorAll("[data-add-dur]").forEach(c => c.classList.toggle("on", c === adur));
    return;
  }

  const toggle = e.target.closest("[data-toggle]");
  if (toggle) { toggleChip(toggle); return; }

  const dur = e.target.closest("[data-dur]");
  if (dur && focusCtx) {
    focusCtx.minutes = parseInt(dur.getAttribute("data-dur"), 10);
    document.querySelectorAll("[data-dur]").forEach(c => c.classList.toggle("on", c === dur));
    const b = document.querySelector('[data-action="focus-begin"]');
    if (b) b.textContent = `Start · ${focusCtx.minutes} min`;
    return;
  }

  const act = e.target.closest("[data-action]");
  if (act) { handleAction(act.getAttribute("data-action"), act, e); return; }
});

// delegated input (onboarding + reflect + settings select)
document.addEventListener("input", (e) => {
  const t = e.target;
  if (t.hasAttribute("data-onb")) { onb[t.getAttribute("data-onb")] = t.value; if (t.getAttribute("data-onb")==="birthdate") renderOnboarding(); }
  else if (t.hasAttribute("data-dream")) { onb.dream[t.getAttribute("data-dream")] = t.value; }
});
document.addEventListener("change", (e) => {
  const t = e.target;
  if (t.hasAttribute("data-action") && t.getAttribute("data-action") === "set-focus") {
    S.settings.defaultFocus = parseInt(t.value, 10); save(); toast("Standaard focus: " + t.value + " min");
  }
});

function handleAction(action, el, e) {
  switch (action) {
    case "onb-start": route = "onb"; S.onboarded = false; onb = null; renderOnboarding(); break;
    case "onb-next": onbNext(); break;
    case "onb-back": if (onb.step > 1) { onb.step--; renderOnboarding(); window.scrollTo(0,0); } break;

    case "focus-cancel": stopFocus(false); break;
    case "focus-begin": beginFocus(); break;
    case "focus-pause": pauseFocus(); break;
    case "focus-stop":
      if (focusCtx) {
        // partial credit + record
        const elapsed = Math.round((focusCtx.minutes * 60 - focusCtx.remaining) / 60);
        if (elapsed >= 5) { S.focusSessions.push({ date: todayStr(), minutes: elapsed, taskTitle: focusCtx.task ? focusCtx.task.title : "Vrije focus" }); registerActivity(); S.virtus += DATA.virtusForFocus(elapsed); save(); toast("Sessie afgebroken — " + elapsed + " min telt mee."); }
      }
      stopFocus(false); render(); break;
    case "focus-finish": stopFocus(true); toast("+" + Math.round(DATA.virtusForFocus(1)) + " Virtus verdiend"); render(); break;

    case "save-reflect": saveReflectionFull(el.getAttribute("data-when")); break;
    case "ask-ai": askAI(); break;

    case "toggle-theme": S.settings.theme = S.settings.theme === "dark" ? "light" : "dark"; save(); render(); break;
    case "toggle-notif": S.settings.notifications = !S.settings.notifications; save(); render(); if (S.settings.notifications) requestNotify(); break;

    case "export": exportData(); break;
    case "reset": resetAll(); break;

    case "add-action-open": openAddAction(); break;
    case "add-action-cancel": closeAddAction(); break;
    case "add-action-save": saveAddAction(); break;
    case "add-toggle-repeat":
      if (addForm) { addForm.repeat = !addForm.repeat; el.classList.toggle("on", addForm.repeat); }
      break;
  }
}

function delTask(id) {
  const t = S.tasks.find(x => x.id === id);
  S.tasks = S.tasks.filter(x => x.id !== id);
  save();
  toast((t ? t.title : "Actie") + " verwijderd");
  render();
}

function delHabit(id) {
  const h = S.habits.find(x => x.id === id);
  S.habits = S.habits.filter(x => x.id !== id);
  // verwijder ook de instantie van vandaag
  S.tasks = S.tasks.filter(x => x.habitId !== id);
  save();
  toast((h ? h.title : "Actie") + " gestopt als dagelijkse actie");
  render();
}

function toggleChip(el) {
  const group = el.getAttribute("data-toggle");
  const val = el.getAttribute("data-val");
  const max = el.getAttribute("data-max") ? parseInt(el.getAttribute("data-max"), 10) : null;
  const arr = onb[group];
  const idx = arr.indexOf(val);
  if (idx >= 0) arr.splice(idx, 1);
  else {
    if (max && arr.length >= max) { toast("Maximaal " + max + " kiezen."); return; }
    arr.push(val);
  }
  renderOnboarding();
}

function toggleTask(id) {
  const t = S.tasks.find(x => x.id === id);
  if (!t) return;
  t.completed = !t.completed;
  if (t.completed) {
    registerActivity();
    const base = t.type === "review" ? DATA.VIRTUS.review
      : t.type === "workout" ? DATA.VIRTUS.workout
      : t.type === "deepwork90" ? DATA.VIRTUS.deepwork90
      : t.type === "focus50" ? DATA.VIRTUS.focus50
      : t.type === "focus25" ? DATA.VIRTUS.focus25
      : t.type === "habit" ? DATA.VIRTUS.habit
      : DATA.VIRTUS.small;
    noteTag(t.tag);
    const rect = document.querySelector(`[data-task="${id}"]`)?.getBoundingClientRect();
    awardVirtus(base, rect ? rect.right - 40 : null, rect ? rect.top : null);
    checkFullDay();
    checkStageUp();
  }
  save();
  // update just the list + stats without full nav reset
  render();
}


/* ---------- Data ops ---------- */
function exportData() {
  const blob = new Blob([JSON.stringify(S, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "memento-data.json"; a.click();
  URL.revokeObjectURL(url);
  toast("Data geëxporteerd.");
}
function resetAll() {
  if (!confirm("Alles resetten? Je droom, MORI en voortgang worden gewist.")) return;
  localStorage.removeItem(KEY);
  S = freshState(); onb = null; route = "splash"; render();
}

function requestNotify() {
  if ("Notification" in window && Notification.permission === "default") {
    Notification.requestPermission();
  }
}

/* ---------- Helpers ---------- */
function focusMinutesThisWeek() {
  const now = new Date();
  const day = (now.getDay() + 6) % 7; // monday=0
  const monday = new Date(now); monday.setDate(now.getDate() - day); monday.setHours(0,0,0,0);
  return S.focusSessions.filter(f => new Date(f.date + "T00:00:00") >= monday).reduce((a, f) => a + f.minutes, 0);
}
function fmtHrs(min) { const h = Math.floor(min/60), m = min%60; return h ? `${h}u ${m}m` : `${m}m`; }
function fmtTime(sec) { const m = Math.floor(sec/60), s = sec%60; return `${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`; }
function cap(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }
function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;" }[c])); }

function toast(msg) {
  let el = document.querySelector(".toast");
  if (!el) { el = document.createElement("div"); el.className = "toast"; document.body.appendChild(el); }
  el.textContent = msg;
  requestAnimationFrame(() => el.classList.add("show"));
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove("show"), 2600);
}

function virtusPop(amount, x, y) {
  const el = document.createElement("div");
  el.className = "virtus-pop serif";
  el.textContent = "+" + amount;
  el.style.left = (x != null ? x : window.innerWidth / 2) + "px";
  el.style.top = (y != null ? y : window.innerHeight / 2) + "px";
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1100);
}

/* ---------- boot ---------- */
// eerste keer: volg de systeemvoorkeur (licht blijft de default-signatuur)
if (!localStorage.getItem(KEY) && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
  S.settings.theme = "dark";
}
render();
