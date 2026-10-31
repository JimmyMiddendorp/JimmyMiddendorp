/* ============================================================
   MEMENTO — Stem (nl-NL)
   Spraak-naar-tekst voor reflectie. Eén tik = opnemen.
   Web Speech API: volledig in de browser. Je audio gaat niet
   naar MEMENTO en wordt nergens opgeslagen — alleen de tekst.
   ============================================================ */

(function () {
  var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  var isIOS = /iP(hone|ad|od)/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  var isStandalone = window.navigator.standalone === true ||
    (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches);

  var rec = null;
  var active = false;
  var stoppedByUser = false;
  var committed = "";      // definitieve tekst van deze sessie
  var h = {};              // handlers
  var restartTimer = null;
  var guardTimer = null;

  function supported() { return !!SR; }

  /* Waarom kan het niet? (alleen als er écht geen API is) */
  function unavailableReason() {
    if (SR) return null;
    if (isIOS) {
      return "Spraakherkenning zit niet in deze browser. Op iPhone werkt het in Safari. Typen kan altijd.";
    }
    return "Deze browser kent geen spraakherkenning. Gebruik Chrome, Edge of Safari — of typ je reflectie.";
  }

  /* Foutcodes -> menselijke Nederlandse taal */
  function friendlyError(code) {
    switch (code) {
      case "not-allowed":
      case "service-not-allowed":
        if (isIOS && isStandalone) {
          return "De microfoon is geblokkeerd. Op iPhone werkt inspreken het best in Safari zelf — open MEMENTO daar, of typ gewoon.";
        }
        return "Geen toegang tot je microfoon. Sta het toe in je browserinstellingen en tik opnieuw.";
      case "audio-capture":
        return "Geen microfoon gevonden.";
      case "network":
        return "Spraakherkenning heeft internet nodig. Typen werkt wel offline.";
      case "aborted":
        return null; // gewoon gestopt, geen melding
      default:
        return "De opname stopte onverwacht. Tik opnieuw, of typ je reflectie.";
    }
  }

  function joinText(a, b) {
    a = (a || "").trim();
    b = (b || "").trim();
    if (!a) return b;
    if (!b) return a;
    return a + " " + b;
  }

  /* Lichte oppoetsing: witruimte normaliseren + eerste letter groot.
     Bewust minimaal — we verzinnen niets bij wat jij niet zei. */
  function polish(t) {
    var s = (t || "").replace(/\s+/g, " ").trim();
    if (!s) return "";
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  function clearTimers() {
    if (restartTimer) { clearTimeout(restartTimer); restartTimer = null; }
    if (guardTimer) { clearTimeout(guardTimer); guardTimer = null; }
  }

  function finish() {
    clearTimers();
    active = false;
    var out = polish(committed);
    var done = h.onDone;
    h = {};
    rec = null;
    if (done) done(out);
  }

  /* start({ onUpdate(finalSoFar, interim), onDone(text), onError(msg) }) */
  function start(opts) {
    h = opts || {};
    if (!SR) {
      if (h.onError) h.onError(unavailableReason());
      h = {};
      return false;
    }
    if (active) stop();

    committed = "";
    stoppedByUser = false;

    try { rec = new SR(); }
    catch (e) {
      if (h.onError) h.onError("Spraak kon niet starten in deze browser.");
      h = {}; return false;
    }

    rec.lang = "nl-NL";          // Nederlands: spreken én vastleggen in het Nederlands
    rec.continuous = true;       // blijf luisteren tot jij stopt
    rec.interimResults = true;   // live meelezen tijdens het praten
    rec.maxAlternatives = 1;

    rec.onresult = function (e) {
      var interim = "";
      // Vanaf resultIndex itereren voorkomt de dubbele tekst die Safari anders geeft
      for (var i = e.resultIndex; i < e.results.length; i++) {
        var r = e.results[i];
        var txt = (r[0] && r[0].transcript) ? r[0].transcript : "";
        if (r.isFinal) committed = joinText(committed, txt);
        else interim += txt;
      }
      if (h.onUpdate) h.onUpdate(polish(committed), interim.trim());
    };

    rec.onerror = function (e) {
      // "no-speech" is geen fout: je dacht even na. Blijf luisteren.
      if (e.error === "no-speech") return;
      var msg = friendlyError(e.error);
      stoppedByUser = true;
      if (msg && h.onError) h.onError(msg);
    };

    rec.onend = function () {
      // Chrome kapt een sessie af na stilte. Herstart stil door,
      // zodat "één tik" ook echt blijft opnemen tot jij stopt.
      if (!stoppedByUser) {
        restartTimer = setTimeout(function () {
          try { rec.start(); }
          catch (err) { finish(); }
        }, 250);
        return;
      }
      finish();
    };

    try { rec.start(); }
    catch (e) {
      if (h.onError) h.onError("Spraak kon niet starten. Tik nog eens.");
      h = {}; rec = null; return false;
    }

    active = true;
    // veiligheidsrem: nooit oneindig door blijven luisteren
    guardTimer = setTimeout(function () { stop(); }, 5 * 60 * 1000);
    return true;
  }

  function stop() {
    if (!rec) { if (active) finish(); return; }
    stoppedByUser = true;
    clearTimers();
    try { rec.stop(); }
    catch (e) { finish(); }
  }

  window.Voice = {
    supported: supported,
    unavailableReason: unavailableReason,
    isActive: function () { return active; },
    start: start,
    stop: stop,
    polish: polish,
  };
})();
