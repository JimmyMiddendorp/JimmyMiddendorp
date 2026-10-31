/* ============================================================
   MEMENTO — Spiegel
   Patronen uit je eigen data. Werkt volledig offline en zonder
   account. Wil je een échte AI-coach? Zet je eigen Claude-sleutel
   aan in Instellingen; dan denkt Claude met je mee in het Nederlands.
   ============================================================ */

(function () {
  /* ---------- statistiek ---------- */
  function pearson(xs, ys) {
    const n = xs.length;
    if (n < 4) return null;
    const mx = xs.reduce((a, b) => a + b, 0) / n;
    const my = ys.reduce((a, b) => a + b, 0) / n;
    let num = 0, dx = 0, dy = 0;
    for (let i = 0; i < n; i++) {
      const a = xs[i] - mx, b = ys[i] - my;
      num += a * b; dx += a * a; dy += b * b;
    }
    if (dx === 0 || dy === 0) return null;
    return num / Math.sqrt(dx * dy);
  }

  /* dagreeks met alles wat we van een dag weten */
  function dailySeries(S, days) {
    return LIFE.lastDates(days || 30).map(dt => {
      const h = (S.history && S.history[dt]) || null;
      const sig = (S.signals && S.signals[dt]) || {};
      const focus = (S.focusSessions || [])
        .filter(f => f.date === dt)
        .reduce((a, f) => a + f.minutes, 0);
      const rate = h && h.total ? h.completed / h.total : null;
      const refl = !!(S.reflections && S.reflections[dt]);
      return { date: dt, focus, rate, refl, sig, weekday: new Date(dt + "T00:00:00").getDay() };
    });
  }

  /* paren opbouwen voor correlatie (alleen dagen waar beide bekend zijn) */
  function pairs(series, aFn, bFn) {
    const xs = [], ys = [];
    series.forEach(d => {
      const a = aFn(d), b = bFn(d);
      if (a != null && b != null && !isNaN(a) && !isNaN(b)) { xs.push(a); ys.push(b); }
    });
    return { xs, ys };
  }

  const WEEKDAYS = ["zondag", "maandag", "dinsdag", "woensdag", "donderdag", "vrijdag", "zaterdag"];
  const fmtMin = m => (m >= 60 ? `${Math.floor(m / 60)}u ${m % 60}m` : `${m}m`);

  /* ---------- de spiegel: patronen in gewone taal ---------- */
  function localInsights(S) {
    const out = [];
    const S30 = dailySeries(S, 30);
    const S14 = S30.slice(0, 14);

    /* 1. slaap -> focus */
    const sf = pairs(S30, d => d.sig.sleep, d => d.focus);
    const rSF = pearson(sf.xs, sf.ys);
    if (rSF != null && Math.abs(rSF) >= 0.35) {
      const good = rSF > 0;
      out.push({
        level: good ? "good" : "warn",
        title: good ? "Slaap draagt je focus" : "Meer slaap, minder focus?",
        body: good
          ? `Op je goed-geslapen dagen focus je merkbaar langer. Dat is geen toeval — het is je sterkste hefboom.`
          : `Je focus zakt juist op dagen dat je lang slaapt. Vaak betekent dat: te laat naar bed, niet te weinig uren.`,
        action: good ? "Bescherm je bedtijd zoals je een meeting beschermt." : "Kijk naar je bedtijd in plaats van je wektijd.",
      });
    }

    /* 2. energie -> afmaken */
    const ef = pairs(S30, d => d.sig.energy, d => d.rate);
    const rEF = pearson(ef.xs, ef.ys);
    if (rEF != null && rEF >= 0.35) {
      out.push({
        level: "info",
        title: "Energie bepaalt je dag, niet je wilskracht",
        body: "Je maakt je dag structureel vaker af als je energie hoog is. Je probleem is dus zelden discipline — het is brandstof.",
        action: "Plan je zwaarste blok op je energiepiek, niet op je vrije uur.",
      });
    }

    /* 3. focus-trend: deze week vs vorige week */
    const f7 = S30.slice(0, 7).reduce((a, d) => a + d.focus, 0);
    const p7 = S30.slice(7, 14).reduce((a, d) => a + d.focus, 0);
    if (f7 + p7 > 0) {
      const diff = f7 - p7;
      const pct = p7 ? Math.round((diff / p7) * 100) : 100;
      if (Math.abs(pct) >= 20) {
        out.push({
          level: diff > 0 ? "good" : "warn",
          title: diff > 0 ? `Je focus stijgt (+${pct}%)` : `Je focus zakt (${pct}%)`,
          body: `Deze week ${fmtMin(f7)} diepe focus, vorige week ${fmtMin(p7)}.`,
          action: diff > 0 ? "Houd dit ritme vast — dit is hoe je fases doorbreekt." : "Zet morgen één blok van 50 minuten vast. Klein en zeker wint.",
        });
      }
    }

    /* 4. beste dag van de week */
    const byDay = {};
    S30.forEach(d => {
      if (d.rate == null) return;
      (byDay[d.weekday] = byDay[d.weekday] || []).push(d.rate);
    });
    const dayAvg = Object.keys(byDay)
      .filter(k => byDay[k].length >= 2)
      .map(k => ({ day: +k, avg: byDay[k].reduce((a, b) => a + b, 0) / byDay[k].length }));
    if (dayAvg.length >= 3) {
      dayAvg.sort((a, b) => b.avg - a.avg);
      const best = dayAvg[0], worst = dayAvg[dayAvg.length - 1];
      if (best.avg - worst.avg >= 0.25) {
        out.push({
          level: "info",
          title: `${cap(WEEKDAYS[best.day])} is je sterkste dag`,
          body: `Op ${WEEKDAYS[best.day]} maak je gemiddeld ${Math.round(best.avg * 100)}% van je dag af, op ${WEEKDAYS[worst.day]} ${Math.round(worst.avg * 100)}%.`,
          action: `Zet je belangrijkste werk op ${WEEKDAYS[best.day]}. Maak ${WEEKDAYS[worst.day]} bewust lichter.`,
        });
      }
    }

    /* 5. verwaarloosd domein */
    const scored = LIFE.DOMAINS
      .map(d => ({ d, score: LIFE.domainScore(S, d.key, 7) }))
      .filter(x => x.score != null);
    if (scored.length >= 3) {
      scored.sort((a, b) => a.score - b.score);
      const low = scored[0], high = scored[scored.length - 1];
      if (high.score - low.score >= 30) {
        out.push({
          level: "warn",
          title: `${low.d.label} blijft achter`,
          body: `${high.d.label} staat op ${high.score}, ${low.d.label} op ${low.score}. Een leven dat op één been staat, valt uiteindelijk om.`,
          action: `Geef ${low.d.label.toLowerCase()} deze week één echt blok. Niet meer, maar wel echt.`,
        });
      }
    }

    /* 6. domeinen zonder enige data */
    const blind = LIFE.DOMAINS.filter(d => LIFE.domainScore(S, d.key, 14) == null);
    if (blind.length >= 3 && blind.length < LIFE.DOMAINS.length) {
      out.push({
        level: "info",
        title: "Je blinde vlek",
        body: `Over ${blind.slice(0, 3).map(d => d.label.toLowerCase()).join(", ")} weet MEMENTO nog niets. Wat je niet meet, stuurt je zonder dat je het merkt.`,
        action: "Zet er één aan in je dagcheck. Eén getal per dag is genoeg.",
      });
    }

    /* 7. reflectie-consistentie */
    const reflDays = S14.filter(d => d.refl).length;
    if (S14.length >= 7) {
      if (reflDays >= 10) {
        out.push({
          level: "good",
          title: "Je kijkt jezelf recht aan",
          body: `${reflDays} van de laatste 14 dagen gereflecteerd. Dit is de gewoonte waar alle andere op rusten.`,
          action: "Blijf. Dit is wat je van je oude zelf onderscheidt.",
        });
      } else if (reflDays <= 3) {
        out.push({
          level: "warn",
          title: "Je leeft op automatisch",
          body: `Maar ${reflDays} reflectiemomenten in 14 dagen. Zonder terugkijken herhaal je je week in plaats van hem te bouwen.`,
          action: "Spreek vanavond 30 seconden in. Praten is sneller dan typen.",
        });
      }
    }

    /* 8. droom versus daden */
    const prio = (S.user && S.user.priorities) || [];
    if (prio.length) {
      const counts = {};
      LIFE.lastDates(14).forEach(dt => {
        const h = S.history && S.history[dt];
        if (h && h.tags) Object.keys(h.tags).forEach(t => counts[t] = (counts[t] || 0) + h.tags[t]);
      });
      const ignored = prio.filter(p => !counts[p]);
      if (ignored.length) {
        out.push({
          level: "warn",
          title: "Je droom en je dagen lopen uiteen",
          body: `Je koos "${ignored[0]}" als prioriteit, maar in 14 dagen staat daar geen enkele afgeronde actie tegenover.`,
          action: `Plan morgen één blok voor ${ignored[0]}. Een prioriteit zonder tijd is een wens.`,
        });
      }
    }

    /* 9. fase-voortgang */
    const st = LIFE.stageFor(S.virtus);
    const nx = LIFE.nextStage(S.virtus);
    if (nx) {
      const left = nx.at - S.virtus;
      out.push({
        level: "info",
        title: `Nog ${left} Virtus tot ${nx.name}`,
        body: `Je bent ${st.nl}. ${nx.line}`,
        action: `Dat is ongeveer ${Math.max(1, Math.ceil(left / 60))} sterke dagen. Blijf komen.`,
      });
    }

    return out;
  }

  function cap(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }

  /* ---------- compacte samenvatting voor de AI-coach ---------- */
  function buildContext(S) {
    const u = S.user || {};
    const series = dailySeries(S, 21);
    const domains = {};
    LIFE.DOMAINS.forEach(d => {
      const sc = LIFE.domainScore(S, d.key, 7);
      if (sc != null) domains[d.label] = sc;
    });
    const recentRefl = [];
    LIFE.lastDates(7).forEach(dt => {
      const r = S.reflections && S.reflections[dt];
      if (!r) return;
      ["morning", "evening"].forEach(w => {
        if (r[w] && r[w].some(x => x && x.trim())) {
          recentRefl.push({ datum: dt, moment: w === "morning" ? "ochtend" : "avond", antwoorden: r[w].filter(Boolean) });
        }
      });
    });
    return {
      naam: u.name || null,
      leeftijd: u.birthdate ? Math.floor((Date.now() - new Date(u.birthdate).getTime()) / 31557600000) : null,
      droom: u.dream || {},
      wil_worden: u.identity || [],
      blokkades: u.blockers || [],
      prioriteiten: u.priorities || [],
      fase: LIFE.stageFor(S.virtus).nl,
      virtus: S.virtus,
      streak_dagen: S.streak,
      domeinscores_0_100: domains,
      laatste_14_dagen: series.slice(0, 14).map(d => ({
        datum: d.date,
        focus_minuten: d.focus,
        dag_afgerond_pct: d.rate == null ? null : Math.round(d.rate * 100),
        signalen: d.sig,
      })),
      recente_reflecties: recentRefl.slice(0, 8),
    };
  }

  const SYSTEM_PROMPT = [
    "Je bent de mentor binnen MEMENTO / MORI, een Nederlandse memento-mori focus-app.",
    "Je spreekt ALTIJD Nederlands. Je toon: rustig, direct, warm maar zonder vleierij.",
    "Je bent een stoïcijnse spiegel, geen cheerleader en geen therapeut.",
    "Je krijgt de echte data van deze persoon: dromen, gedrag, signalen en reflecties.",
    "Benoem concrete patronen uit de data — noem getallen en dagen als je ze ziet.",
    "Wees eerlijk over wat niet goed gaat, maar altijd gericht op de volgende stap.",
    "Geef maximaal 3 inzichten en sluit af met precies één concrete actie voor morgen.",
    "Gebruik korte alinea's. Geen opsommingstekens-explosie, geen clichés, geen emoji.",
    "Verzin nooit data die er niet is. Weet je iets niet, zeg dat dan.",
  ].join(" ");

  /* Roept Claude aan met de sleutel van de gebruiker zelf.
     De sleutel blijft in localStorage op dit apparaat. */
  async function askClaude(S, userQuestion) {
    const ai = (S.settings && S.settings.ai) || {};
    if (!ai.key) throw new Error("Geen API-sleutel ingesteld.");
    const body = {
      model: ai.model || "claude-sonnet-5",
      max_tokens: 1200,
      system: SYSTEM_PROMPT,
      messages: [{
        role: "user",
        content:
          "Hier is mijn data uit MEMENTO als JSON:\n\n" +
          JSON.stringify(buildContext(S), null, 1) +
          "\n\n" + (userQuestion || "Analyseer mijn patronen en spiegel me. Waar loop ik vast en wat is mijn belangrijkste volgende stap?"),
      }],
    };
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": ai.key,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      let detail = "";
      try { const j = await res.json(); detail = (j.error && j.error.message) || ""; } catch (e) {}
      if (res.status === 401) throw new Error("Je API-sleutel wordt niet geaccepteerd. Controleer hem in Instellingen.");
      if (res.status === 429) throw new Error("Rustig aan — je hebt je limiet bij Anthropic geraakt. Probeer het zo weer.");
      throw new Error("Claude gaf een fout (" + res.status + "). " + detail);
    }
    const json = await res.json();
    return (json.content || []).filter(c => c.type === "text").map(c => c.text).join("\n").trim();
  }

  window.INSIGHTS = { localInsights, buildContext, askClaude, dailySeries };
})();
