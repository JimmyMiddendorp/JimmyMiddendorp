/* ============================================================
   MORI — het karakter
   7 marmeren evolutiefases, gerenderd als SVG.
   Van ruwe steen (L1) naar onsterfelijk standbeeld (L7).
   Alles grijswaarden: steen, marmer, schaduw.
   ============================================================ */

const MORI_DEFS = `
  <defs>
    <linearGradient id="marble" x1="0" y1="0" x2="0.4" y2="1">
      <stop offset="0" stop-color="#fbfbf9"/>
      <stop offset="0.45" stop-color="#e7e6e1"/>
      <stop offset="1" stop-color="#c3c2bd"/>
    </linearGradient>
    <linearGradient id="marbleDark" x1="0" y1="0" x2="0.4" y2="1">
      <stop offset="0" stop-color="#d9d8d3"/>
      <stop offset="1" stop-color="#a3a29c"/>
    </linearGradient>
    <linearGradient id="stone" x1="0" y1="0" x2="0.3" y2="1">
      <stop offset="0" stop-color="#9a9992"/>
      <stop offset="0.5" stop-color="#7c7b74"/>
      <stop offset="1" stop-color="#57564f"/>
    </linearGradient>
    <radialGradient id="halo" cx="0.5" cy="0.4" r="0.6">
      <stop offset="0" stop-color="#fff8e6" stop-opacity="0.9"/>
      <stop offset="0.5" stop-color="#f0ead6" stop-opacity="0.35"/>
      <stop offset="1" stop-color="#f0ead6" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="plinth" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#d0cfc9"/>
      <stop offset="1" stop-color="#9c9b94"/>
    </linearGradient>
  </defs>`;

function svg(inner) {
  return `<svg viewBox="0 0 300 400" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    ${MORI_DEFS}${inner}</svg>`;
}

// shared marble pedestal
const PLINTH = `
  <ellipse cx="150" cy="372" rx="96" ry="12" fill="rgba(0,0,0,.10)"/>
  <rect x="70" y="352" width="160" height="24" rx="3" fill="url(#plinth)"/>
  <rect x="60" y="366" width="180" height="12" rx="3" fill="#8a897f"/>`;

const CRACK = (d) => `<path d="${d}" stroke="#3f3e38" stroke-width="1.4" fill="none" stroke-linecap="round" opacity=".55"/>`;

/* ---------- Level 1 — The Stone ---------- */
function moriL1(cracks = 0) {
  const extraCracks = cracks > 0
    ? CRACK("M150 150 l14 40 -8 34") + CRACK("M120 210 l24 12")
    : "";
  return svg(`
    ${PLINTH}
    <path d="M96 330
             C70 300 74 250 92 210
             C104 182 96 150 122 128
             C150 104 184 110 200 140
             C214 166 214 196 218 226
             C224 268 216 312 190 332
             C168 348 118 350 96 330 Z"
          fill="url(#stone)"/>
    <path d="M122 128 C150 104 184 110 200 140 C206 152 208 166 208 180
             C180 170 150 176 128 190 C120 168 116 146 122 128 Z"
          fill="#8f8e86" opacity=".6"/>
    ${CRACK("M150 132 l-10 44 6 40 -12 40")}
    ${CRACK("M176 150 l16 34")}
    ${CRACK("M120 240 l40 6")}
    ${extraCracks}
    <ellipse cx="140" cy="200" rx="9" ry="12" fill="#4a4942" opacity=".35"/>
    <ellipse cx="170" cy="204" rx="9" ry="12" fill="#4a4942" opacity=".35"/>`);
}

/* ---------- Level 2 — The Shape ---------- */
function moriL2() {
  return svg(`
    ${PLINTH}
    <path d="M104 344 C86 312 90 262 104 224 C92 200 96 168 118 150
             C140 132 172 134 190 154 C208 174 206 204 198 224
             C214 260 214 312 196 344 C176 358 124 358 104 344 Z"
          fill="url(#stone)"/>
    <!-- emerging head -->
    <ellipse cx="150" cy="150" rx="34" ry="40" fill="url(#marbleDark)"/>
    <path d="M150 150 q-30 8 -30 60 q0 40 6 70 l48 0 q6 -30 6 -70 q0 -52 -30 -60 Z"
          fill="url(#marbleDark)"/>
    ${CRACK("M126 176 l-8 40")}
    ${CRACK("M188 200 l10 40")}
    <ellipse cx="138" cy="146" rx="5" ry="7" fill="#5c5b53" opacity=".5"/>
    <ellipse cx="162" cy="146" rx="5" ry="7" fill="#5c5b53" opacity=".5"/>`);
}

/* ---------- Level 3 — The Disciplined One ---------- */
function moriL3() {
  return svg(`
    ${PLINTH}
    <!-- rough shoulders remnants -->
    <path d="M100 344 C92 300 98 270 108 250 L192 250 C202 270 208 300 200 344 Z"
          fill="url(#stone)" opacity=".9"/>
    <!-- torso -->
    <path d="M118 250 C112 214 118 190 132 180 L168 180 C182 190 188 214 182 250
             C176 300 176 330 172 344 L128 344 C124 330 124 300 118 250 Z"
          fill="url(#marble)"/>
    <!-- neck + head -->
    <rect x="140" y="150" width="20" height="34" fill="url(#marbleDark)"/>
    <ellipse cx="150" cy="132" rx="30" ry="36" fill="url(#marble)"/>
    <path d="M120 132 q0 -34 30 -34 q30 0 30 34 q-6 -14 -30 -14 q-24 0 -30 14 Z" fill="#c9c8c2"/>
    <!-- eyes -->
    <ellipse cx="138" cy="132" rx="4" ry="5" fill="#57564f"/>
    <ellipse cx="162" cy="132" rx="4" ry="5" fill="#57564f"/>
    <path d="M150 138 l0 12" stroke="#a3a29c" stroke-width="2" fill="none"/>
    <path d="M142 158 q8 6 16 0" stroke="#8f8e86" stroke-width="2" fill="none"/>
    ${CRACK("M160 210 l6 40")}`);
}

/* ---------- Level 4 — The Warrior ---------- */
function moriL4() {
  return svg(`
    ${PLINTH}
    <!-- cloak / stronger silhouette -->
    <path d="M96 348 C88 300 96 250 116 224 L184 224 C204 250 212 300 204 348 Z"
          fill="url(#marbleDark)"/>
    <path d="M116 224 L184 224 L176 348 L124 348 Z" fill="url(#marble)"/>
    <!-- chest lines (discipline) -->
    <path d="M150 236 l0 96" stroke="#a3a29c" stroke-width="2"/>
    <path d="M132 250 q18 12 36 0" stroke="#b6b5af" stroke-width="2" fill="none"/>
    <!-- neck -->
    <rect x="140" y="150" width="20" height="26" fill="url(#marbleDark)"/>
    <ellipse cx="150" cy="128" rx="30" ry="36" fill="url(#marble)"/>
    <!-- corinthian helmet -->
    <path d="M118 128 C118 92 138 78 150 78 C162 78 182 92 182 128
             C182 118 176 112 168 112 L168 132 L132 132 L132 112 C124 112 118 118 118 128 Z"
          fill="url(#marbleDark)"/>
    <path d="M150 74 C168 74 176 88 176 100 C158 92 142 92 124 100 C124 88 132 74 150 74 Z" fill="#b6b5af"/>
    <!-- crest -->
    <path d="M150 66 C150 52 160 44 176 46 C170 58 168 70 168 80 C160 74 154 70 150 66 Z" fill="#7c7b74"/>
    <!-- eyes in shadow -->
    <ellipse cx="139" cy="122" rx="4" ry="5" fill="#3f3e38"/>
    <ellipse cx="161" cy="122" rx="4" ry="5" fill="#3f3e38"/>`);
}

/* ---------- Level 5 — The Philosopher ---------- */
function moriL5() {
  return svg(`
    ${PLINTH}
    <!-- draped robe, calm stance -->
    <path d="M104 348 C100 300 104 252 124 220 L176 220 C196 252 200 300 196 348 Z"
          fill="url(#marble)"/>
    <path d="M124 220 q26 20 52 0 l-6 128 -40 0 Z" fill="url(#marbleDark)" opacity=".7"/>
    <path d="M120 260 q30 16 60 0" stroke="#b6b5af" stroke-width="2" fill="none"/>
    <path d="M116 300 q34 18 68 0" stroke="#b6b5af" stroke-width="2" fill="none"/>
    <!-- arm holding scroll -->
    <path d="M176 232 q26 6 30 40" stroke="url(#marbleDark)" stroke-width="16" fill="none" stroke-linecap="round"/>
    <rect x="196" y="266" width="30" height="12" rx="6" fill="#e7e6e1" stroke="#a3a29c"/>
    <line x1="200" y1="272" x2="222" y2="272" stroke="#9a9992" stroke-width="1"/>
    <!-- head -->
    <rect x="140" y="150" width="20" height="24" fill="url(#marbleDark)"/>
    <ellipse cx="150" cy="128" rx="29" ry="35" fill="url(#marble)"/>
    <!-- philosopher hair/beard -->
    <path d="M121 126 q2 -32 29 -32 q27 0 29 32 q-6 -16 -29 -16 q-23 0 -29 16 Z" fill="#c9c8c2"/>
    <path d="M132 150 q18 26 36 0 q-4 22 -18 24 q-14 -2 -18 -24 Z" fill="#d3d2cc"/>
    <ellipse cx="139" cy="126" rx="3.5" ry="4.5" fill="#57564f"/>
    <ellipse cx="161" cy="126" rx="3.5" ry="4.5" fill="#57564f"/>`);
}

/* ---------- Level 6 — The Architect (naast tempel) ---------- */
function moriL6() {
  return svg(`
    ${PLINTH}
    <!-- temple behind, to the right -->
    <g opacity=".92">
      <polygon points="188,150 262,150 225,120" fill="url(#marbleDark)"/>
      <rect x="188" y="150" width="74" height="8" fill="#c9c8c2"/>
      <rect x="194" y="158" width="8" height="86" fill="url(#marble)"/>
      <rect x="212" y="158" width="8" height="86" fill="url(#marbleDark)"/>
      <rect x="230" y="158" width="8" height="86" fill="url(#marble)"/>
      <rect x="248" y="158" width="8" height="86" fill="url(#marbleDark)"/>
      <rect x="186" y="244" width="80" height="8" fill="#b6b5af"/>
    </g>
    <!-- figure -->
    <path d="M74 348 C70 300 76 252 96 222 L146 222 C166 252 172 300 168 348 Z" fill="url(#marble)"/>
    <path d="M96 222 q25 18 50 0 l-6 126 -38 0 Z" fill="url(#marbleDark)" opacity=".7"/>
    <path d="M90 272 q31 16 62 0" stroke="#b6b5af" stroke-width="2" fill="none"/>
    <!-- extended arm toward temple -->
    <path d="M146 236 q34 -6 44 -78" stroke="url(#marbleDark)" stroke-width="15" fill="none" stroke-linecap="round"/>
    <rect x="140" y="150" width="20" height="24" x2="0" transform="translate(-30,0)" fill="url(#marbleDark)"/>
    <ellipse cx="121" cy="128" rx="28" ry="34" fill="url(#marble)"/>
    <path d="M93 126 q2 -30 28 -30 q26 0 28 30 q-6 -14 -28 -14 q-22 0 -28 14 Z" fill="#c9c8c2"/>
    <ellipse cx="111" cy="126" rx="3.5" ry="4.5" fill="#57564f"/>
    <ellipse cx="131" cy="126" rx="3.5" ry="4.5" fill="#57564f"/>`);
}

/* ---------- Level 7 — The Immortal Memory ---------- */
function moriL7() {
  return svg(`
    <ellipse cx="150" cy="200" rx="150" ry="200" fill="url(#halo)"/>
    ${PLINTH}
    <!-- full statue, luminous marble -->
    <path d="M108 350 C102 296 108 244 128 210 L172 210 C192 244 198 296 192 350 Z" fill="url(#marble)"/>
    <path d="M128 210 q22 18 44 0 l-5 140 -34 0 Z" fill="url(#marbleDark)" opacity=".55"/>
    <path d="M122 250 q28 16 56 0" stroke="#cfcec8" stroke-width="2" fill="none"/>
    <path d="M118 296 q32 18 64 0" stroke="#cfcec8" stroke-width="2" fill="none"/>
    <!-- both arms, calm -->
    <path d="M128 224 q-24 20 -20 60" stroke="url(#marble)" stroke-width="16" fill="none" stroke-linecap="round"/>
    <path d="M172 224 q24 20 20 60" stroke="url(#marble)" stroke-width="16" fill="none" stroke-linecap="round"/>
    <!-- neck + head -->
    <rect x="141" y="150" width="18" height="22" fill="url(#marbleDark)"/>
    <ellipse cx="150" cy="128" rx="30" ry="36" fill="url(#marble)"/>
    <path d="M120 126 q2 -34 30 -34 q28 0 30 34 q-8 -18 -30 -18 q-22 0 -30 18 Z" fill="#e2e1db"/>
    <!-- laurel wreath -->
    <path d="M122 108 q-14 -6 -18 4 q10 2 12 10 q-10 0 -12 10 q10 0 16 -4" fill="none" stroke="#b6b5af" stroke-width="3"/>
    <path d="M178 108 q14 -6 18 4 q-10 2 -12 10 q10 0 12 10 q-10 0 -16 -4" fill="none" stroke="#b6b5af" stroke-width="3"/>
    <ellipse cx="139" cy="126" rx="3.5" ry="5" fill="#6b6a63"/>
    <ellipse cx="161" cy="126" rx="3.5" ry="5" fill="#6b6a63"/>
    <path d="M142 150 q8 5 16 0" stroke="#a3a29c" stroke-width="2" fill="none"/>`);
}

const MORI_STAGES = [
  { level: 1, name: "The Stone",           label: "Ongevormde potentie",      render: moriL1 },
  { level: 2, name: "The Shape",           label: "De vorm verschijnt",        render: moriL2 },
  { level: 3, name: "The Disciplined One", label: "Controle",                  render: moriL3 },
  { level: 4, name: "The Warrior",         label: "Discipline",                render: moriL4 },
  { level: 5, name: "The Philosopher",     label: "Wijsheid",                  render: moriL5 },
  { level: 6, name: "The Architect",       label: "Je bouwt je leven",         render: moriL6 },
  { level: 7, name: "The Immortal Memory", label: "Legacy",                    render: moriL7 },
];

// Virtus thresholds to reach each level
const MORI_THRESHOLDS = [0, 150, 400, 900, 1800, 3200, 5200];

function moriLevelForVirtus(virtus) {
  let lvl = 1;
  for (let i = 0; i < MORI_THRESHOLDS.length; i++) {
    if (virtus >= MORI_THRESHOLDS[i]) lvl = i + 1;
  }
  return Math.min(lvl, 7);
}

function moriRender(level, cracks = 0) {
  const stage = MORI_STAGES[Math.min(level, 7) - 1];
  if (level === 1) return moriL1(cracks);
  return stage.render();
}

window.MORI = { STAGES: MORI_STAGES, THRESHOLDS: MORI_THRESHOLDS, levelFor: moriLevelForVirtus, render: moriRender };
