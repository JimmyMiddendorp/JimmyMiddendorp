/* ============================================================
   MEMENTO — Schermen: reflectie (stem), totaalbeeld, pad, spiegel
   Laadt vóór app.js; wordt pas aangeroepen nadat de app draait.
   ============================================================ */

/* ---------- extra iconen ---------- */
const VI = {
  mic:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v4M8 22h8"/></svg>`,
  stop: `<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>`,
  spark:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M18 6l-2.5 2.5M8.5 15.5L6 18"/><circle cx="12" cy="12" r="3"/></svg>`,
  minus:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14"/></svg>`,
  plus2:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>`,
};

/* ============================================================
   STEM — één tik opnemen, live meelezen
   ============================================================ */
let vState = { id: null, base: "" };

function joinTxt(a, b) {
  a = (a || "").trim(); b = (b || "").trim();
  if (!a) return b;
  if (!b) return a;
  return a + (/[.!?…]$/.test(a) ? " " : ". ") + b.charAt(0).toUpperCase() + b.slice(1);
}

function micHTML(fieldId) {
  const off = !Voice.supported();
  return `
    <div class="mic-wrap">
      <button type="button" class="mic-btn ${off ? "off" : ""}" data-mic="${fieldId}"
        aria-label="Spreek je antwoord in het Nederlands in">
        <span class="mic-ico">${VI.mic}</span>
        <span class="mic-txt">${off ? "Alleen typen" : "Spreek in"}</span>
      </button>
      <div class="mic-live" data-vlive="${fieldId}" hidden></div>
    </div>`;
}

function setMicUI(fieldId, on) {
  const btn = document.querySelector(`[data-mic="${fieldId}"]`);
  const live = document.querySelector(`[data-vlive="${fieldId}"]`);
  if (btn) {
    btn.classList.toggle("rec", on);
    const t = btn.querySelector(".mic-txt");
    const ic = btn.querySelector(".mic-ico");
    if (t) t.textContent = on ? "Stop" : "Spreek in";
    if (ic) ic.innerHTML = on ? VI.stop : VI.mic;
  }
  if (live) {
    live.hidden = !on;
    if (on) { live.textContent = "Luistert…"; live.classList.add("dim"); }
  }
}

function toggleMic(fieldId) {
  // dezelfde knop nog eens = stoppen
  if (Voice.isActive() && vState.id === fieldId) { Voice.stop(); return; }
  if (Voice.isActive()) Voice.stop();

  const ta = document.querySelector(`[data-vfield="${fieldId}"]`);
  if (!ta) return;
  if (!Voice.supported()) { toast(Voice.unavailableReason()); return; }

  vState = { id: fieldId, base: ta.value.trim() };
  setMicUI(fieldId, true);

  Voice.start({
    onUpdate: (fin, interim) => {
      ta.value = joinTxt(vState.base, fin);
      ta.scrollTop = ta.scrollHeight;
      const live = document.querySelector(`[data-vlive="${fieldId}"]`);
      if (live) {
        live.textContent = interim || "Luistert…";
        live.classList.toggle("dim", !interim);
      }
    },
    onDone: (text) => {
      ta.value = joinTxt(vState.base, text);
      setMicUI(fieldId, false);
      vState = { id: null, base: "" };
      if (text) toast("Opgeschreven. Je kunt nog bijschaven.");
    },
    onError: (msg) => {
      setMicUI(fieldId, false);
      vState = { id: null, base: "" };
      if (msg) toast(msg);
    },
  });
}

/* ============================================================
   REFLECTIE — typen én inspreken
   ============================================================ */
function viewReflect(when) {
  const qs = when === "morning" ? DATA.REFLECT_MORNING : DATA.REFLECT_EVENING;
  const today = todayStr();
  const saved = (S.reflections[today] && S.reflections[today][when]) || [];
  const sig = (S.signals && S.signals[today]) || {};
  const title = when === "morning" ? "Ochtendreflectie" : "Avondreflectie";
  const intro = when === "morning"
    ? "Bepaal je dag voordat hij jou bepaalt."
    : "Sluit de dag. Leer ervan.";
  const scales = when === "morning" ? ["energy"] : ["energy", "mood"];

  return `
    <button class="link-btn" data-nav="home">${I.back} Terug</button>
    <p class="eyebrow" style="margin-top:10px">${when === "morning" ? "Ochtend" : "Avond"}</p>
    <h2 class="serif" style="font-size:1.9rem;margin:4px 0 4px">${title}</h2>
    <p class="muted" style="margin-bottom:16px">${intro}</p>

    <div class="voice-hint">
      ${VI.mic}
      <div>
        <b>Praat gewoon Nederlands.</b> Tik op <i>Spreek in</i>, vertel je verhaal en tik op stop.
        MEMENTO schrijft het voor je op. Dertig seconden is genoeg.
      </div>
    </div>

    <div class="card scale-card">
      ${scales.map(k => {
        const def = LIFE.signalDef(k);
        const cur = sig[k] || 0;
        return `
        <div class="scale-row">
          <div class="scale-q">${def.q}</div>
          <div class="dots" role="group">
            ${[1,2,3,4,5].map(n => `
              <button type="button" class="dot ${cur === n ? "on" : ""}" data-sig-set="${k}" data-val="${n}"
                aria-label="${n} van 5">${n}</button>`).join("")}
          </div>
          <div class="scale-ends"><span>${def.low}</span><span>${def.high}</span></div>
        </div>`;
      }).join("")}
    </div>

    ${qs.map((q, i) => `
      <div class="reflect-q">
        <div class="q serif">${q}</div>
        <textarea data-reflect="${i}" data-vfield="r${i}" rows="3"
          placeholder="Schrijf kort en eerlijk — of spreek het in…">${esc(saved[i] || "")}</textarea>
        ${micHTML("r" + i)}
      </div>`).join("")}

    <button class="btn full" data-action="save-reflect" data-when="${when}">
      Bewaar reflectie · +${DATA.VIRTUS.review} Virtus
    </button>
    <p class="muted center" style="font-size:.78rem;margin-top:10px">
      Je stem wordt in je eigen browser omgezet naar tekst. Er wordt geen audio bewaard of verstuurd.
    </p>
  `;
}

/* opslaan: antwoorden + signalen van dit moment */
function saveReflectionFull(when) {
  const answers = [];
  document.querySelectorAll("[data-reflect]").forEach(ta => {
    answers[parseInt(ta.getAttribute("data-reflect"), 10)] = ta.value.trim();
  });
  const today = todayStr();
  if (!S.reflections[today]) S.reflections[today] = {};
  const already = !!S.reflections[today][when];
  S.reflections[today][when] = answers;

  const taskName = when === "morning" ? "Ochtendreflectie" : "Avondreview";
  const tk = S.tasks.find(t => t.title === taskName);
  if (tk && !tk.completed) { tk.completed = true; registerActivity(); noteTag("reflectie"); }
  if (!already) S.virtus += Math.round(DATA.VIRTUS.review * DATA.streakMultiplier(S.streak));

  save();
  checkFullDay();
  checkStageUp();
  toast("Reflectie bewaard. MORI schrijft een lijn op de boekrol.");
  route = "home";
  render();
}

/* ============================================================
   TOTAALBEELD — je persoonlijke én zakelijke leven in één plaat
   ============================================================ */
function viewTotal() {
  const today = todayStr();
  const sig = (S.signals && S.signals[today]) || {};
  const score = LIFE.lifeScore(S, 7);
  const tracked = S.tracked || LIFE.DEFAULT_TRACKED;

  const group = (g, label) => {
    const rows = LIFE.DOMAINS.filter(d => d.group === g).map(d => {
      const sc = LIFE.domainScore(S, d.key, 7);
      return `
        <div class="dom-row">
          <div class="dom-l">${d.label}</div>
          <div class="dom-bar"><span style="width:${sc == null ? 0 : sc}%"></span></div>
          <div class="dom-v">${sc == null ? "—" : sc}</div>
        </div>`;
    }).join("");
    return `<div class="section-title"><h3>${label}</h3></div><div class="card">${rows}</div>`;
  };

  return `
    <p class="eyebrow">Totaalbeeld</p>
    <h2 class="serif" style="font-size:1.9rem;margin:4px 0 6px">Je hele leven, één plaat</h2>
    <p class="muted" style="margin-bottom:18px">Persoonlijk en zakelijk naast elkaar. Eén been kan je leven niet dragen.</p>

    <div class="card life-score">
      <div class="ring-wrap">${progressRing(score == null ? 0 : score, 84)}<div class="pct">${score == null ? "—" : score}</div></div>
      <div class="grow">
        <div style="font-weight:600">Levensscore</div>
        <div class="muted" style="font-size:.85rem">
          ${score == null
            ? "Nog te weinig data. Vul hieronder je dagcheck in — één keer duurt tien seconden."
            : "Gemiddelde over je domeinen, laatste 7 dagen."}
        </div>
      </div>
    </div>

    <div class="section-title"><h3>Dagcheck · vandaag</h3>
      <span class="meta" data-nav="settings" style="cursor:pointer">Aanpassen →</span></div>
    <div class="card">
      <p class="muted" style="font-size:.85rem;margin-bottom:14px">Weinig en trouw verslaat veel en nooit. Tik of typ — klaar in tien seconden.</p>
      ${tracked.map(k => {
        const def = LIFE.signalDef(k);
        if (!def) return "";
        const cur = sig[k];
        if (def.type === "scale") {
          return `
            <div class="scale-row">
              <div class="scale-q">${def.label}</div>
              <div class="dots">
                ${[1,2,3,4,5].map(n => `<button type="button" class="dot ${cur === n ? "on" : ""}" data-sig-set="${k}" data-val="${n}">${n}</button>`).join("")}
              </div>
            </div>`;
        }
        const step = def.type === "hours" ? 0.5 : def.type === "euro" ? 50 : def.type === "minutes" ? 15 : 1;
        return `
          <div class="num-row">
            <div class="num-l">${def.label}<span class="num-u">${def.unit || ""}</span></div>
            <div class="stepper">
              <button type="button" class="st" data-sig-step="${k}" data-delta="${-step}">${VI.minus}</button>
              <input type="number" inputmode="decimal" data-sig-num="${k}" value="${cur == null ? "" : cur}" placeholder="0" step="${step}">
              <button type="button" class="st" data-sig-step="${k}" data-delta="${step}">${VI.plus2}</button>
            </div>
          </div>`;
      }).join("")}
    </div>

    ${group("personal", "Persoonlijk")}
    ${group("business", "Zakelijk")}

    <button class="btn full" data-nav="mirror" style="margin-top:18px">Wat betekent dit?</button>
    <p class="center" style="margin-top:12px"><button class="link-btn" data-nav="analytics">Liever de kale cijfers →</button></p>
  `;
}

/* ============================================================
   HET PAD — de fases waar je in groeit
   ============================================================ */
function viewPath() {
  const cur = LIFE.stageFor(S.virtus);
  const nxt = LIFE.nextStage(S.virtus);
  const prog = LIFE.stageProgress(S.virtus);

  return `
    <button class="link-btn" data-nav="home">${I.back} Terug</button>
    <p class="eyebrow" style="margin-top:10px">Het pad</p>
    <h2 class="serif" style="font-size:1.9rem;margin:4px 0 6px">Waar je in groeit</h2>
    <p class="muted" style="margin-bottom:18px">Je klimt op wat je déét, niet op een perfecte reeks. Je kunt hier nooit zakken.</p>

    <div class="card stage-now">
      <div class="stage-name serif">${cur.name}</div>
      <div class="stage-nl">${cur.nl}</div>
      <p class="stage-line">${cur.line}</p>
      ${nxt ? `
        <div class="stage-prog"><span style="width:${Math.round(prog * 100)}%"></span></div>
        <div class="stage-meta">${S.virtus.toLocaleString("nl-NL")} / ${nxt.at.toLocaleString("nl-NL")} Virtus naar ${nxt.name}</div>
      ` : `<div class="stage-meta">Je bent aan het einde van het pad. Nu is het onderhoud van meesterschap.</div>`}
    </div>

    <div class="section-title"><h3>Alle fases</h3></div>
    <div class="card stage-list">
      ${LIFE.STAGES.map((st, i) => {
        const reached = S.virtus >= st.at;
        const isNow = st.key === cur.key;
        return `
          <div class="stage-item ${reached ? "reached" : ""} ${isNow ? "now" : ""}">
            <div class="si-dot">${reached ? I.check : i + 1}</div>
            <div class="si-main">
              <div class="si-top"><b>${st.name}</b><span class="si-nl">${st.nl}</span></div>
              <div class="si-line">${st.line}</div>
              <div class="si-unlock">${reached ? "Ontgrendeld: " : "Bij " + st.at.toLocaleString("nl-NL") + " Virtus: "}${st.unlock}</div>
            </div>
          </div>`;
      }).join("")}
    </div>
  `;
}

/* fase-promotie vieren */
function checkStageUp() {
  const idx = LIFE.stageIndex(S.virtus);
  if (idx > (S.stageSeen || 0)) {
    S.stageSeen = idx;
    save();
    const st = LIFE.STAGES[idx];
    setTimeout(() => toast(`Nieuwe fase: ${st.name} — ${st.nl}. ${st.unlock}`), 700);
  }
}

/* ============================================================
   SPIEGEL — patronen en (optioneel) een echte AI-coach
   ============================================================ */
let aiBusy = false;

function viewMirror() {
  const ins = INSIGHTS.localInsights(S);
  const ai = (S.settings && S.settings.ai) || {};
  const hasKey = !!ai.key;
  const last = S.aiLast;

  return `
    <p class="eyebrow">Spiegel</p>
    <h2 class="serif" style="font-size:1.9rem;margin:4px 0 6px">Wat je data over je zegt</h2>
    <p class="muted" style="margin-bottom:18px">Geen oordeel. Alleen patronen die je zelf niet ziet omdat je er middenin zit.</p>

    ${ins.length ? ins.map(x => `
      <div class="insight ${x.level}">
        <div class="ins-title">${x.title}</div>
        <div class="ins-body">${x.body}</div>
        ${x.action ? `<div class="ins-action">→ ${x.action}</div>` : ""}
      </div>`).join("") : `
      <div class="card center muted">
        Nog te weinig data om patronen te zien. Reflecteer een paar dagen en vul je dagcheck in — dan wordt deze pagina scherp.
      </div>`}

    <div class="section-title"><h3>Claude als mentor</h3></div>
    ${hasKey ? `
      <div class="card">
        <p class="muted" style="font-size:.85rem;margin-bottom:12px">
          Claude leest je dromen, gedrag en reflecties en spiegelt je in het Nederlands.
        </p>
        <textarea data-vfield="aiq" id="ai-q" rows="2" placeholder="Stel je vraag… of laat leeg voor een volledige analyse">${esc(S._aiQ || "")}</textarea>
        ${micHTML("aiq")}
        <button class="btn full" data-action="ask-ai" ${aiBusy ? "disabled" : ""} style="margin-top:12px">
          ${aiBusy ? "Claude denkt na…" : "Vraag Claude"}
        </button>
      </div>
      ${last ? `
        <div class="card ai-answer">
          <div class="ai-head">${VI.spark} Claude · ${esc(last.when)}</div>
          <div class="ai-text"><p>${esc(last.text).replace(/\n{2,}/g, "</p><p>").replace(/\n/g, "<br>")}</p></div>
        </div>` : ""}
    ` : `
      <div class="card">
        <p class="muted" style="font-size:.88rem;margin-bottom:10px">
          De patronen hierboven werken zonder iets in te stellen. Wil je een échte mentor die met je meedenkt,
          dan koppel je je eigen Claude-sleutel. Die blijft op dit apparaat.
        </p>
        <button class="btn ghost full" data-nav="settings">Claude koppelen in Instellingen</button>
      </div>
    `}
  `;
}

async function askAI() {
  if (aiBusy) return;
  const q = (document.getElementById("ai-q") || {}).value || "";
  S._aiQ = q;
  aiBusy = true;
  render();
  try {
    const text = await INSIGHTS.askClaude(S, q.trim());
    S.aiLast = { text, when: new Date().toLocaleString("nl-NL", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) };
    save();
  } catch (e) {
    toast(e.message || "Claude kon niet antwoorden.");
  } finally {
    aiBusy = false;
    render();
  }
}

/* ============================================================
   Signalen loggen
   ============================================================ */
function setSignal(key, val) {
  const today = todayStr();
  if (!S.signals) S.signals = {};
  if (!S.signals[today]) S.signals[today] = {};
  if (val === "" || val == null || isNaN(val)) delete S.signals[today][key];
  else S.signals[today][key] = Number(val);
  save();
}

function noteTag(tag) {
  if (!tag) return;
  const today = todayStr();
  if (!S.history[today]) S.history[today] = { completed: 0, total: S.tasks.length, focusMinutes: 0 };
  if (!S.history[today].tags) S.history[today].tags = {};
  S.history[today].tags[tag] = (S.history[today].tags[tag] || 0) + 1;
}

/* home-kaart met je huidige fase */
function stageCardHTML() {
  const cur = LIFE.stageFor(S.virtus);
  const nxt = LIFE.nextStage(S.virtus);
  const prog = LIFE.stageProgress(S.virtus);
  return `
    <div class="card stage-card" data-nav="path">
      <div class="sc-left">
        <div class="sc-eyebrow">Jouw fase</div>
        <div class="sc-name serif">${cur.name}</div>
        <div class="sc-nl">${cur.nl}</div>
      </div>
      <div class="sc-right">
        <div class="stage-prog"><span style="width:${Math.round(prog * 100)}%"></span></div>
        <div class="sc-next">${nxt ? `Nog ${(nxt.at - S.virtus).toLocaleString("nl-NL")} naar ${nxt.name}` : "Meesterschap bereikt"}</div>
      </div>
    </div>`;
}

/* ---------- eigen listeners (naast die van app.js) ---------- */
document.addEventListener("click", (e) => {
  const mic = e.target.closest("[data-mic]");
  if (mic) { e.preventDefault(); toggleMic(mic.getAttribute("data-mic")); return; }

  const dot = e.target.closest("[data-sig-set]");
  if (dot) {
    const k = dot.getAttribute("data-sig-set");
    const v = parseInt(dot.getAttribute("data-val"), 10);
    const cur = (S.signals[todayStr()] || {})[k];
    setSignal(k, cur === v ? "" : v);   // nog eens tikken = weghalen
    dot.parentElement.querySelectorAll(".dot").forEach(d =>
      d.classList.toggle("on", d === dot && cur !== v));
    return;
  }

  const st = e.target.closest("[data-sig-step]");
  if (st) {
    const k = st.getAttribute("data-sig-step");
    const d = parseFloat(st.getAttribute("data-delta"));
    const input = document.querySelector(`[data-sig-num="${k}"]`);
    const cur = parseFloat(input && input.value ? input.value : 0) || 0;
    const next = Math.max(0, Math.round((cur + d) * 100) / 100);
    if (input) input.value = next;
    setSignal(k, next);
    return;
  }
});

document.addEventListener("change", (e) => {
  const n = e.target.closest("[data-sig-num]");
  if (n) { setSignal(n.getAttribute("data-sig-num"), n.value === "" ? "" : parseFloat(n.value)); return; }
  const ak = e.target.closest("[data-ai-key]");
  if (ak) {
    S.settings.ai.key = ak.value.trim();
    save();
    toast(S.settings.ai.key ? "Claude gekoppeld." : "Sleutel verwijderd.");
    return;
  }
  const am = e.target.closest("[data-ai-model]");
  if (am) { S.settings.ai.model = am.value; save(); toast("Model: " + am.value); return; }
  const tr = e.target.closest("[data-track]");
  if (tr) {
    const k = tr.getAttribute("data-track");
    if (!Array.isArray(S.tracked)) S.tracked = [];
    if (tr.checked) { if (!S.tracked.includes(k)) S.tracked.push(k); }
    else S.tracked = S.tracked.filter(x => x !== k);
    save();
    return;
  }
});

/* ---------- genadedag: één gemiste dag per week breekt je reeks niet ---------- */
function graceAvailable() {
  if (!Array.isArray(S.graceDays)) S.graceDays = [];
  const week = LIFE.lastDates(7);
  return !S.graceDays.some(d => week.includes(d));
}
function useGrace(day) {
  if (!Array.isArray(S.graceDays)) S.graceDays = [];
  S.graceDays.push(day);
  save();
  setTimeout(() => toast("Genadedag gebruikt — je reeks blijft staan. Eén dag missen is menselijk."), 900);
}

/* ============================================================
   DATA MEENEMEN — export van je telefoon hier weer inladen
   ============================================================ */
let importPayload = null;

function fileSummary(d) {
  const dates = new Set();
  const count = (obj) => { Object.keys(obj || {}).forEach(k => dates.add(k)); return Object.keys(obj || {}).length; };
  const refl = count(d.reflections);
  const sig = count(d.signals);
  count(d.history);
  const sorted = [...dates].sort();
  return {
    naam: (d.user && d.user.name) || "—",
    virtus: d.virtus || 0,
    streak: d.streak || 0,
    refl, sig,
    sessies: (d.focusSessions || []).length,
    van: sorted[0] || null,
    tot: sorted[sorted.length - 1] || null,
  };
}

function handleImportFile(file) {
  const reader = new FileReader();
  reader.onerror = () => toast("Kon dit bestand niet lezen.");
  reader.onload = () => {
    let data;
    try { data = JSON.parse(reader.result); }
    catch (e) { toast("Dit is geen geldig MEMENTO-exportbestand."); return; }
    if (!data || typeof data !== "object" || (data.virtus === undefined && !data.user)) {
      toast("Dit bestand lijkt niet van MEMENTO te komen.");
      return;
    }
    importPayload = data;
    showImportModal(fileSummary(data));
  };
  reader.readAsText(file);
}

function showImportModal(sum) {
  const here = fileSummary(S);
  const m = document.createElement("div");
  m.className = "modal-backdrop";
  m.id = "import-modal";
  m.innerHTML = `
    <div class="modal" role="dialog" aria-label="Data importeren">
      <h3>Data meenemen</h3>
      <p class="modal-sub">Je bestand is gelezen. Kies wat er met de data op dit apparaat gebeurt.</p>
      <div class="imp-cols">
        <div class="imp-col">
          <div class="imp-h">Uit het bestand</div>
          <div class="imp-l"><span>Naam</span><b>${esc(sum.naam)}</b></div>
          <div class="imp-l"><span>Virtus</span><b>${sum.virtus.toLocaleString("nl-NL")}</b></div>
          <div class="imp-l"><span>Reflectiedagen</span><b>${sum.refl}</b></div>
          <div class="imp-l"><span>Dagen signalen</span><b>${sum.sig}</b></div>
          <div class="imp-l"><span>Focussessies</span><b>${sum.sessies}</b></div>
          <div class="imp-l"><span>Periode</span><b>${sum.van ? sum.van + " → " + sum.tot : "—"}</b></div>
        </div>
        <div class="imp-col dim">
          <div class="imp-h">Nu op dit apparaat</div>
          <div class="imp-l"><span>Naam</span><b>${esc(here.naam)}</b></div>
          <div class="imp-l"><span>Virtus</span><b>${here.virtus.toLocaleString("nl-NL")}</b></div>
          <div class="imp-l"><span>Reflectiedagen</span><b>${here.refl}</b></div>
          <div class="imp-l"><span>Dagen signalen</span><b>${here.sig}</b></div>
          <div class="imp-l"><span>Focussessies</span><b>${here.sessies}</b></div>
          <div class="imp-l"><span>Periode</span><b>${here.van ? here.van + " → " + here.tot : "—"}</b></div>
        </div>
      </div>
      <p class="muted" style="font-size:.82rem;margin-top:14px">
        <b>Samenvoegen</b> houdt beide: per dag wordt alles bij elkaar gelegd.
        <b>Vervangen</b> gooit wat hier staat weg en zet het bestand ervoor in de plaats —
        dat is wat je wilt als je overstapt naar een nieuw apparaat.
      </p>
      <div class="modal-actions">
        <button class="btn ghost grow" data-action="import-cancel">Annuleer</button>
        <button class="btn ghost grow" data-action="import-replace">Vervangen</button>
        <button class="btn grow" data-action="import-merge">Samenvoegen</button>
      </div>
    </div>`;
  document.body.appendChild(m);
  m.addEventListener("click", (e) => { if (e.target === m) closeImport(); });
}

function closeImport() {
  const m = document.getElementById("import-modal");
  if (m) m.remove();
  importPayload = null;
  const f = document.getElementById("import-file");
  if (f) f.value = "";
}

/* per datum samenvoegen; bij twijfel wint de hoogste/volste waarde */
function mergeStates(local, inc) {
  const out = Object.assign({}, local);

  out.virtus = Math.max(local.virtus || 0, inc.virtus || 0);
  out.streak = Math.max(local.streak || 0, inc.streak || 0);
  out.bestStreak = Math.max(local.bestStreak || 0, inc.bestStreak || 0);
  out.stageSeen = Math.max(local.stageSeen || 0, inc.stageSeen || 0);
  out.lastActiveDate = [local.lastActiveDate, inc.lastActiveDate].filter(Boolean).sort().pop() || null;

  // profiel: pak het ingevulde profiel als hier nog niets staat
  if (!(local.user && local.user.name) && inc.user) out.user = inc.user;

  // reflecties: per dag en per moment, niet-leeg wint
  out.reflections = Object.assign({}, inc.reflections || {}, local.reflections || {});
  Object.keys(inc.reflections || {}).forEach(dt => {
    const a = (local.reflections || {})[dt] || {};
    const b = inc.reflections[dt] || {};
    const day = Object.assign({}, b, a);
    ["morning", "evening"].forEach(w => {
      const la = a[w], ib = b[w];
      const filled = x => Array.isArray(x) && x.some(v => v && String(v).trim());
      day[w] = filled(la) ? la : (filled(ib) ? ib : (la || ib));
      if (!day[w]) delete day[w];
    });
    out.reflections[dt] = day;
  });

  // signalen: per dag velden samenvoegen, lokale waarde wint
  out.signals = Object.assign({}, inc.signals || {});
  Object.keys(local.signals || {}).forEach(dt => {
    out.signals[dt] = Object.assign({}, inc.signals ? inc.signals[dt] : {}, local.signals[dt]);
  });

  // historie: hoogste telling per dag
  out.history = Object.assign({}, inc.history || {});
  Object.keys(local.history || {}).forEach(dt => {
    const a = local.history[dt] || {}, b = (inc.history || {})[dt] || {};
    const tags = Object.assign({}, b.tags || {});
    Object.keys(a.tags || {}).forEach(t => tags[t] = Math.max(tags[t] || 0, a.tags[t]));
    out.history[dt] = Object.assign({}, b, a, {
      completed: Math.max(a.completed || 0, b.completed || 0),
      total: Math.max(a.total || 0, b.total || 0),
      focusMinutes: Math.max(a.focusMinutes || 0, b.focusMinutes || 0),
      fullAwarded: !!(a.fullAwarded || b.fullAwarded),
    });
    if (Object.keys(tags).length) out.history[dt].tags = tags;
  });

  // focussessies: samenvoegen zonder dubbelen
  const seen = new Set();
  out.focusSessions = [].concat(local.focusSessions || [], inc.focusSessions || [])
    .filter(f => { const k = JSON.stringify([f.date, f.minutes, f.taskTitle]); if (seen.has(k)) return false; seen.add(k); return true; });

  // lijsten: vereniging
  const uniq = a => [...new Set(a)];
  out.strongWeeks = uniq([].concat(local.strongWeeks || [], inc.strongWeeks || []));
  out.graceDays = uniq([].concat(local.graceDays || [], inc.graceDays || []));
  out.tracked = uniq([].concat(local.tracked || [], inc.tracked || []));

  const byTitle = new Map();
  [].concat(inc.habits || [], local.habits || []).forEach(h => byTitle.set(h.title, h));
  out.habits = [...byTitle.values()];

  return out;
}

function applyImport(mode) {
  if (!importPayload) return;
  const inc = importPayload;
  const merged = mode === "merge" ? mergeStates(S, inc) : Object.assign(freshState(), inc);

  // instellingen van dit apparaat behouden (thema, API-sleutel)
  merged.settings = Object.assign({}, merged.settings || {}, {
    theme: S.settings.theme,
    ai: S.settings.ai && S.settings.ai.key ? S.settings.ai : (merged.settings && merged.settings.ai) || { key: "", model: "claude-sonnet-5" },
  });
  // de dag van vandaag opnieuw laten opbouwen
  merged.lastDayGenerated = null;
  merged.onboarded = true;

  S = merged;
  save();
  closeImport();
  toast(mode === "merge" ? "Data samengevoegd. Alles staat er weer." : "Data overgezet. Welkom terug.");
  route = "home";
  render();
}

/* bestand gekozen voor import */
document.addEventListener("change", (e) => {
  const f = e.target.closest("#import-file");
  if (f && f.files && f.files[0]) handleImportFile(f.files[0]);
});
