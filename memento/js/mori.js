/* ============================================================
   MORI — het karakter, als handgetekende schets
   7 evolutiefases, gerenderd als line-art studies van een
   marmeren figuur. Houtskool/potlood-lijnen op papier,
   arceringen voor schaduw, een subtiele hand-drawn wobble.
   Kleur volgt currentColor -> past zich aan licht/donker aan.
   ============================================================ */

/* --- helpers --- */
function skWrap(inner) {
  return `<svg viewBox="0 0 300 400" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <filter id="mSketch" x="-8%" y="-8%" width="116%" height="116%">
        <feTurbulence type="fractalNoise" baseFrequency="0.019" numOctaves="2" seed="7" result="n"/>
        <feDisplacementMap in="SourceGraphic" in2="n" scale="2.4" xChannelSelector="R" yChannelSelector="G"/>
      </filter>
    </defs>
    <g fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" filter="url(#mSketch)">
      ${inner}
    </g>
  </svg>`;
}

// arceringen: n parallelle lijntjes
function hatch(sx, sy, ex, ey, gx, gy, n, op) {
  let s = `<g stroke-width="1" opacity="${op == null ? .3 : op}">`;
  for (let i = 0; i < n; i++)
    s += `<line x1="${(sx+gx*i).toFixed(1)}" y1="${(sy+gy*i).toFixed(1)}" x2="${(ex+gx*i).toFixed(1)}" y2="${(ey+gy*i).toFixed(1)}"/>`;
  return s + `</g>`;
}

// stralende halo van korte lijntjes (L7)
function halo(cx, cy, rIn, rOut, n) {
  let s = `<g opacity=".32" stroke-width="1.2">`;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    s += `<line x1="${(cx+Math.cos(a)*rIn).toFixed(1)}" y1="${(cy+Math.sin(a)*rIn).toFixed(1)}" x2="${(cx+Math.cos(a)*rOut).toFixed(1)}" y2="${(cy+Math.sin(a)*rOut).toFixed(1)}"/>`;
  }
  return s + `</g>`;
}

// geschetste sokkel
const PLINTH = `
  <g>
    <path d="M74 356 L226 356"/>
    <path d="M84 356 L84 372 M216 356 L216 372"/>
    <path d="M74 372 L228 372"/>
    ${hatch(90,359, 98,368, 20,0, 7, .28)}
  </g>`;

const eyes = (x1, x2, y) => `<path d="M${x1-2} ${y} l4 0 M${x2-2} ${y} l4 0" stroke-width="2.4"/>`;

/* ---------- Level 1 — The Stone ---------- */
function moriL1() {
  const body = "M96 348 C74 322 78 276 92 236 C102 210 90 176 116 150 C143 121 187 126 205 158 C217 180 214 210 219 240 C225 283 214 327 190 346 C166 360 118 362 96 348 Z";
  return skWrap(`
    ${PLINTH}
    <path d="${body}" fill="currentColor" fill-opacity=".04" stroke="none"/>
    <path d="${body}"/>
    <path d="M150 152 C147 192 157 212 150 252 C146 288 150 314 147 342" stroke-width="1.4" opacity=".5"/>
    <path d="M181 168 L197 208" stroke-width="1.4" opacity=".5"/>
    <path d="M118 250 L157 258" stroke-width="1.4" opacity=".5"/>
    ${hatch(150,300, 180,270, 6,6, 8, .3)}
    ${hatch(120,246, 138,238, 4,7, 5, .24)}
    <ellipse cx="140" cy="206" rx="8" ry="11" opacity=".4"/>
    <ellipse cx="170" cy="210" rx="8" ry="11" opacity=".4"/>`);
}

/* ---------- Level 2 — The Shape ---------- */
function moriL2() {
  const body = "M104 348 C86 316 92 268 104 230 C90 206 98 172 120 152 C143 130 177 132 193 156 C209 180 204 210 196 230 C214 268 214 320 196 348 C176 360 124 360 104 348 Z";
  return skWrap(`
    ${PLINTH}
    <path d="${body}" fill="currentColor" fill-opacity=".04" stroke="none"/>
    <path d="${body}"/>
    <ellipse cx="150" cy="150" rx="30" ry="35"/>
    <path d="M150 150 C130 158 123 184 127 208"/>
    <path d="M173 150 C193 158 200 184 196 208"/>
    <path d="M127 208 C132 250 133 306 137 344" opacity=".7"/>
    <path d="M173 208 C168 250 167 306 163 344" opacity=".7"/>
    ${hatch(158,250, 184,236, 5,6, 6, .26)}
    <path d="M110 240 L150 250" stroke-width="1.4" opacity=".45"/>
    ${eyes(140,160,148)}`);
}

/* ---------- Level 3 — The Disciplined One ---------- */
function moriL3() {
  return skWrap(`
    ${PLINTH}
    <path d="M104 350 C98 306 104 274 116 254 C132 244 168 244 184 254 C196 274 202 306 196 350" fill="currentColor" fill-opacity=".04" stroke="none"/>
    <path d="M104 350 C98 306 104 274 116 254"/>
    <path d="M196 350 C202 306 196 274 184 254"/>
    <path d="M116 254 C132 244 168 244 184 254"/>
    <path d="M140 176 C139 186 139 194 138 202 M160 176 C161 186 161 194 162 202"/>
    <path d="M138 202 C146 210 154 210 162 202"/>
    <ellipse cx="150" cy="146" rx="29" ry="35"/>
    <path d="M121 142 C123 108 177 108 179 142"/>
    ${eyes(139,161,143)}
    <path d="M150 146 l1 12" />
    <path d="M143 168 q7 5 15 0"/>
    ${hatch(166,208, 188,238, 5,7, 6, .26)}
    ${hatch(118,300, 116,330, 0,8, 3, .22)}`);
}

/* ---------- Level 4 — The Warrior ---------- */
function moriL4() {
  return skWrap(`
    ${PLINTH}
    <path d="M92 350 C86 300 96 250 116 224 C140 214 160 214 184 224 C204 250 214 300 208 350" fill="currentColor" fill-opacity=".05" stroke="none"/>
    <path d="M92 350 C86 300 96 250 116 224"/>
    <path d="M208 350 C214 300 204 250 184 224"/>
    <path d="M116 224 C140 214 160 214 184 224"/>
    <path d="M150 232 L150 338"/>
    <path d="M132 250 q18 10 36 0"/>
    ${hatch(118,298, 114,336, 0,9, 3, .28)}
    ${hatch(186,298, 190,336, 0,9, 3, .28)}
    <path d="M140 176 L140 200 M160 176 L160 200"/>
    <ellipse cx="150" cy="150" rx="29" ry="33"/>
    <path d="M119 150 C117 104 139 84 150 84 C161 84 183 104 181 150"/>
    <path d="M133 150 L133 118 M167 150 L167 118"/>
    <path d="M133 118 C141 108 159 108 167 118"/>
    <path d="M150 120 L150 150"/>
    <path d="M150 84 C150 60 167 48 187 53 C177 67 173 83 173 97"/>
    ${hatch(154,60, 178,72, 4,5, 4, .3)}
    ${eyes(139,161,139)}`);
}

/* ---------- Level 5 — The Philosopher ---------- */
function moriL5() {
  return skWrap(`
    ${PLINTH}
    <path d="M104 350 C100 300 104 252 124 220 C140 234 160 234 176 220 C196 252 200 300 196 350" fill="currentColor" fill-opacity=".05" stroke="none"/>
    <path d="M104 350 C100 300 104 252 124 220"/>
    <path d="M196 350 C200 300 196 252 176 220"/>
    <path d="M124 220 C140 234 160 234 176 220"/>
    <path d="M120 262 q30 14 60 0"/>
    <path d="M116 302 q34 16 68 0"/>
    <path d="M128 332 q22 9 44 0"/>
    ${hatch(126,266, 120,300, -1,8, 4, .24)}
    <path d="M176 238 q26 6 30 42"/>
    <path d="M191 270 l35 0 M191 282 l35 0"/>
    <path d="M191 270 q-6 6 0 12 M226 270 q6 6 0 12"/>
    <path d="M140 176 L140 196 M160 176 L160 196"/>
    <ellipse cx="150" cy="146" rx="29" ry="35"/>
    <path d="M121 142 C123 106 177 106 179 142"/>
    <path d="M132 164 q18 24 36 0 q-3 22 -18 25 q-15 -3 -18 -25 Z"/>
    ${hatch(135,170, 165,170, 0,5, 4, .3)}
    ${eyes(139,161,143)}`);
}

/* ---------- Level 6 — The Architect ---------- */
function moriL6() {
  return skWrap(`
    ${PLINTH}
    <g opacity=".85">
      <path d="M186 150 L262 150 L224 120 Z"/>
      <path d="M186 158 L262 158"/>
      <path d="M196 158 L196 244 M214 158 L214 244 M232 158 L232 244 M250 158 L250 244"/>
      <path d="M184 244 L266 244"/>
      <path d="M180 252 L270 252"/>
      ${hatch(200,168, 200,240, 18,0, 3, .18)}
    </g>
    <path d="M74 350 C70 300 76 252 96 222 C112 236 132 236 146 222 C166 252 172 300 168 350" fill="currentColor" fill-opacity=".05" stroke="none"/>
    <path d="M74 350 C70 300 76 252 96 222"/>
    <path d="M168 350 C172 300 166 252 146 222"/>
    <path d="M96 222 C112 236 132 236 146 222"/>
    <path d="M90 272 q31 14 62 0"/>
    <path d="M86 312 q35 16 70 0"/>
    <path d="M146 236 q34 -4 44 -80"/>
    ${hatch(96,272, 92,306, -1,8, 3, .22)}
    <path d="M111 176 L111 196 M131 176 L131 196"/>
    <ellipse cx="121" cy="146" rx="28" ry="34"/>
    <path d="M93 142 C95 110 147 110 149 142"/>
    ${eyes(111,131,143)}`);
}

/* ---------- Level 7 — The Immortal Memory ---------- */
function moriL7() {
  return skWrap(`
    ${halo(150, 118, 66, 82, 26)}
    <circle cx="150" cy="118" r="60" opacity=".12"/>
    <circle cx="150" cy="118" r="90" opacity=".08"/>
    ${PLINTH}
    <path d="M108 352 C102 298 108 246 128 212 C142 226 158 226 172 212 C192 246 198 298 192 352" fill="currentColor" fill-opacity=".05" stroke="none"/>
    <path d="M108 352 C102 298 108 246 128 212"/>
    <path d="M192 352 C198 298 192 246 172 212"/>
    <path d="M128 212 C142 226 158 226 172 212"/>
    <path d="M122 252 q28 14 56 0"/>
    <path d="M118 296 q32 16 64 0"/>
    <path d="M126 330 q24 10 48 0"/>
    <path d="M128 226 q-24 18 -20 62"/>
    <path d="M172 226 q24 18 20 62"/>
    ${hatch(124,254, 120,288, -1,8, 3, .2)}
    <path d="M141 176 L141 194 M159 176 L159 194"/>
    <ellipse cx="150" cy="146" rx="30" ry="36"/>
    <path d="M120 142 C122 108 178 108 180 142"/>
    <path d="M120 116 q-16 -4 -20 8 q12 0 14 10 q-12 2 -12 12"/>
    <path d="M180 116 q16 -4 20 8 q-12 0 -14 10 q12 2 12 12"/>
    ${eyes(139,161,143)}
    <path d="M142 166 q8 5 16 0"/>`);
}

const MORI_STAGES = [
  { level: 1, name: "The Stone",           label: "Ongevormde potentie", render: moriL1 },
  { level: 2, name: "The Shape",           label: "De vorm verschijnt",  render: moriL2 },
  { level: 3, name: "The Disciplined One", label: "Controle",            render: moriL3 },
  { level: 4, name: "The Warrior",         label: "Discipline",          render: moriL4 },
  { level: 5, name: "The Philosopher",     label: "Wijsheid",            render: moriL5 },
  { level: 6, name: "The Architect",       label: "Je bouwt je leven",   render: moriL6 },
  { level: 7, name: "The Immortal Memory", label: "Legacy",              render: moriL7 },
];

const MORI_THRESHOLDS = [0, 150, 400, 900, 1800, 3200, 5200];

function moriLevelForVirtus(virtus) {
  let lvl = 1;
  for (let i = 0; i < MORI_THRESHOLDS.length; i++) if (virtus >= MORI_THRESHOLDS[i]) lvl = i + 1;
  return Math.min(lvl, 7);
}

function moriRender(level) {
  const stage = MORI_STAGES[Math.min(Math.max(level, 1), 7) - 1];
  return stage.render();
}

window.MORI = { STAGES: MORI_STAGES, THRESHOLDS: MORI_THRESHOLDS, levelFor: moriLevelForVirtus, render: moriRender };
