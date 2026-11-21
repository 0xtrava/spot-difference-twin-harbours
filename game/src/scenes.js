// scenes.js — the six hand-drawn SVG scenes of Twin Harbours.
// Every scene is built by one function buildScene(changed, prefix) that returns
// the inner SVG markup for a 1000x600 panel. The `changed` panel applies all
// eight of the scene's differences; the original panel applies none. Each
// difference is listed in the scene's `diffs` with scene coordinates, a click
// radius, a kind, and (for moved objects) the changed-panel position x2/y2.

function cloud(x, y, s, fill, opacity) {
  return `<g fill="${fill}" opacity="${opacity ?? 0.95}"><ellipse cx="${x}" cy="${y}" rx="${46 * s}" ry="${18 * s}"/><ellipse cx="${x - 28 * s}" cy="${y + 6 * s}" rx="${30 * s}" ry="${14 * s}"/><ellipse cx="${x + 30 * s}" cy="${y + 5 * s}" rx="${32 * s}" ry="${15 * s}"/></g>`;
}

function bird(x, y, s, colour) {
  return `<path d="M ${x - 12 * s} ${y} Q ${x - 4 * s} ${y - 10 * s} ${x} ${y} Q ${x + 4 * s} ${y - 10 * s} ${x + 12 * s} ${y}" fill="none" stroke="${colour}" stroke-width="${3 * s}" stroke-linecap="round"/>`;
}

function pine(x, y, s, dark) {
  const g = dark ? '#1d5c33' : '#2a7a44';
  const g2 = dark ? '#2f7a45' : '#3a9a58';
  return `<g><rect x="${x - 4 * s}" y="${y - 8 * s}" width="${8 * s}" height="${22 * s}" fill="#6b4423"/><polygon points="${x},${y - 78 * s} ${x - 30 * s},${y - 22 * s} ${x + 30 * s},${y - 22 * s}" fill="${g}"/><polygon points="${x},${y - 98 * s} ${x - 24 * s},${y - 52 * s} ${x + 24 * s},${y - 52 * s}" fill="${g2}"/><polygon points="${x},${y - 116 * s} ${x - 17 * s},${y - 78 * s} ${x + 17 * s},${y - 78 * s}" fill="${g}"/></g>`;
}

function fish(x, y, s, body, tail, flip) {
  const dir = flip ? -1 : 1;
  return `<g transform="translate(${x} ${y}) scale(${dir * s} ${s})"><ellipse cx="0" cy="0" rx="34" ry="20" fill="${body}"/><polygon points="-30,0 -52,-16 -52,16" fill="${tail}"/><polygon points="-6,-18 8,-34 14,-16" fill="${tail}"/><circle cx="18" cy="-5" r="5" fill="#fff"/><circle cx="19" cy="-5" r="2.5" fill="#111"/><path d="M -8 8 Q 4 14 16 8" stroke="#00000055" stroke-width="2" fill="none"/></g>`;
}

function lantern(x, y, s, body, glow) {
  return `<g><line x1="${x}" y1="${y - 34 * s}" x2="${x}" y2="${y - 14 * s}" stroke="#3a2a1a" stroke-width="2"/><rect x="${x - 10 * s}" y="${y - 16 * s}" width="${20 * s}" height="${6 * s}" rx="2" fill="#d4a017"/><ellipse cx="${x}" cy="${y + 12 * s}" rx="${26 * s}" ry="${30 * s}" fill="${body}"/><ellipse cx="${x}" cy="${y + 12 * s}" rx="${26 * s}" ry="${30 * s}" fill="url(#${glow})" opacity="0.35"/><path d="M ${x - 26 * s} ${y + 12 * s} Q ${x} ${y - 22 * s} ${x + 26 * s} ${y + 12 * s}" stroke="#00000033" stroke-width="2" fill="none"/><path d="M ${x - 20 * s} ${y - 4 * s} Q ${x} ${y - 14 * s} ${x + 20 * s} ${y - 4 * s}" stroke="#00000033" stroke-width="2" fill="none"/><rect x="${x - 8 * s}" y="${y + 40 * s}" width="${16 * s}" height="${6 * s}" rx="2" fill="#d4a017"/><line x1="${x}" y1="${y + 46 * s}" x2="${x}" y2="${y + 62 * s}" stroke="#d4a017" stroke-width="2"/></g>`;
}

function house(x, y, s, wall, roof, lit) {
  return `<g><rect x="${x}" y="${y}" width="${70 * s}" height="${52 * s}" fill="${wall}"/><polygon points="${x - 6 * s},${y} ${x + 35 * s},${y - 26 * s} ${x + 76 * s},${y}" fill="${roof}"/><rect x="${x + 12 * s}" y="${y + 14 * s}" width="${14 * s}" height="${14 * s}" fill="${lit ? '#ffd76a' : '#334155'}"/><rect x="${x + 44 * s}" y="${y + 14 * s}" width="${14 * s}" height="${14 * s}" fill="${lit ? '#ffd76a' : '#334155'}"/><rect x="${x + 28 * s}" y="${y + 26 * s}" width="${14 * s}" height="${26 * s}" fill="#5b3a1e"/></g>`;
}

function boat(x, y, s, hull, sail, flag, flagScale) {
  const fs = flagScale ?? 1;
  return `<g><path d="M ${x - 62 * s} ${y} L ${x + 62 * s} ${y} L ${x + 44 * s} ${y + 24 * s} L ${x - 44 * s} ${y + 24 * s} Z" fill="${hull}"/><rect x="${x + 20 * s}" y="${y + 6 * s}" width="16" height="8" fill="#fff" opacity="0.7"/><line x1="${x}" y1="${y}" x2="${x}" y2="${y - 78 * s}" stroke="#5b3a1e" stroke-width="4"/><polygon points="${x + 2 * s},${y - 76 * s} ${x + 2 * s},${y - 12 * s} ${x + 52 * s},${y - 12 * s}" fill="${sail}"/><polygon points="${x - 2 * s},${y - 70 * s} ${x - 2 * s},${y - 16 * s} ${x - 34 * s},${y - 16 * s}" fill="${sail}" opacity="0.85"/><polygon points="${x},${y - 78 * s} ${x + 26 * fs * s},${y - 70 * s} ${x},${y - 62 * s}" fill="${flag}"/></g>`;
}

function star(x, y, r, fill) {
  return `<polygon points="${x},${y - r} ${x + r * 0.3},${y - r * 0.3} ${x + r},${y} ${x + r * 0.3},${y + r * 0.3} ${x},${y + r} ${x - r * 0.3},${y + r * 0.3} ${x - r},${y} ${x - r * 0.3},${y - r * 0.3}" fill="${fill}"/>`;
}

// ---- Scene 1: Dawn Harbour -------------------------------------------------
function buildDawnHarbour(changed, p) {
  const sun = changed ? '#ff7fb0' : '#ffcf3f';
  const stripe = changed ? '#0e7490' : '#dc2626';
  const sail = changed ? '#e11d48' : '#fdf6e3';
  const windowLit = !changed;
  return `
  <defs><linearGradient id="${p}sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe3b3"/><stop offset="0.55" stop-color="#ffb37a"/><stop offset="1" stop-color="#ff8f6b"/></linearGradient>
  <linearGradient id="${p}sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3d9db8"/><stop offset="1" stop-color="#1d5f7a"/></linearGradient></defs>
  <rect width="1000" height="400" fill="url(#${p}sky)"/>
  <circle cx="850" cy="92" r="52" fill="${sun}" opacity="0.9"/><circle cx="850" cy="92" r="70" fill="${sun}" opacity="0.25"/>
  ${cloud(180, 78, 1, '#fff7ea')}${cloud(500, 52, 0.8, '#fff7ea')}${cloud(700, 150, 0.7, '#ffe9d6')}
  ${changed ? cloud(520, 96, 0.9, '#fff7ea') : ''}
  ${bird(250, 118, 1, '#7c4a2d')}${bird(300, 96, 0.8, '#7c4a2d')}${changed ? '' : bird(210, 150, 0.9, '#7c4a2d')}
  ${bird(450, 140, 0.9, '#7c4a2d')}${bird(600, 108, 0.8, '#7c4a2d')}${bird(560, 150, 0.7, '#7c4a2d')}
  <rect x="0" y="392" width="1000" height="14" fill="#e8c98f"/>
  <g fill="#f7e6c2"><ellipse cx="120" cy="398" rx="90" ry="8"/><ellipse cx="620" cy="398" rx="120" ry="8"/><ellipse cx="880" cy="398" rx="80" ry="8"/></g>
  <g><rect x="86" y="180" width="52" height="216" fill="#f8f4ec"/><rect x="86" y="216" width="52" height="26" fill="${stripe}"/><rect x="86" y="288" width="52" height="26" fill="${stripe}"/><rect x="80" y="150" width="64" height="32" rx="6" fill="#334155"/><rect x="92" y="158" width="40" height="16" fill="#fde68a"/><polygon points="78,150 146,150 138,132 86,132" fill="#b91c1c"/><circle cx="112" cy="166" r="7" fill="#fff7cc"/><polygon points="146,158 196,142 196,174" fill="#fde68a" opacity="0.55"/></g>
  ${house(560, 330, 1, '#f5d0a9', '#b45309', true)}
  ${house(650, 338, 0.9, '#fde68a', '#92400e', windowLit)}
  ${house(730, 326, 1.05, '#fcd34d', '#7c2d12', true)}
  ${house(820, 340, 0.9, '#fca5a5', '#7f1d1d', true)}
  <rect x="0" y="400" width="1000" height="200" fill="url(#${p}sea)"/>
  <g stroke="#ffffff" stroke-width="3" opacity="0.35" fill="none"><path d="M 40 440 Q 90 432 140 440 T 240 440"/><path d="M 520 470 Q 570 462 620 470 T 720 470"/><path d="M 760 520 Q 810 512 860 520 T 960 520"/><path d="M 120 540 Q 170 532 220 540 T 320 540"/></g>
  ${boat(320, 452, 1, '#7c2d12', sail, '#dc2626', changed ? 1.9 : 1)}
  ${boat(660, 486, 0.85, '#14532d', '#fef3c7', '#2563eb')}
  ${boat(480, 520, 0.6, '#3f3f46', '#e0e7ff', '#059669')}
  <g><ellipse cx="${changed ? 690 : 600}" cy="540" rx="16" ry="10" fill="#f59e0b"/><rect x="${changed ? 686 : 596}" y="522" width="8" height="18" fill="#92400e"/><polygon points="${changed ? 694 : 604},522 ${changed ? 712 : 622},527 ${changed ? 694 : 604},532" fill="#dc2626"/></g>
  <g fill="#ffffff" opacity="0.5"><circle cx="140" cy="470" r="3"/><circle cx="220" cy="500" r="2.5"/><circle cx="560" cy="440" r="3"/><circle cx="900" cy="480" r="2.5"/></g>`;
}

const DAWN_DIFFS = [
  { x: 850, y: 92, r: 52, kind: 'colour', label: 'The sun turned pink' },
  { x: 112, y: 252, r: 34, kind: 'colour', label: 'The lighthouse stripes changed colour' },
  { x: 348, y: 412, r: 40, kind: 'colour', label: 'The big sail turned red' },
  { x: 520, y: 96, r: 42, kind: 'added', label: 'A cloud appeared' },
  { x: 664, y: 352, r: 22, kind: 'removed', label: 'A harbour window went dark' },
  { x: 600, y: 532, x2: 690, y2: 532, r: 30, kind: 'moved', label: 'The buoy drifted right' },
  { x: 210, y: 150, r: 24, kind: 'removed', label: 'A seagull flew away' },
  { x: 336, y: 384, r: 30, kind: 'size', label: 'The boat flag grew bigger' },
];

// ---- Scene 2: Lantern Night Market ----------------------------------------
function buildNightMarket(changed, p) {
  const lanternColour = changed ? '#22c55e' : '#ef4444';
  const awning = changed ? '#7c3aed' : '#f59e0b';
  const teaSign = changed ? '#fb7185' : '#fde68a';
  return `
  <defs><linearGradient id="${p}night" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0f172a"/><stop offset="0.6" stop-color="#1e2a4a"/><stop offset="1" stop-color="#3b2d5c"/></linearGradient>
  <radialGradient id="${p}glow" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#ffd76a" stop-opacity="0.9"/><stop offset="1" stop-color="#ffd76a" stop-opacity="0"/></radialGradient></defs>
  <rect width="1000" height="600" fill="url(#${p}night)"/>
  <circle cx="880" cy="80" r="34" fill="#fef3c7"/><circle cx="880" cy="80" r="46" fill="#fef3c7" opacity="0.12"/>
  ${star(120, 60, 7, '#fff')}${star(240, 110, 5, '#fff')}${star(420, 50, 6, '#fff')}${star(640, 90, 5, '#fff')}${star(760, 40, 6, '#fff')}${star(60, 180, 4, '#fff')}${star(960, 150, 5, '#fff')}
  ${star(30, 90, 4, '#fff')}${star(170, 45, 5, '#fff')}${star(560, 45, 4, '#fff')}${star(700, 140, 5, '#fff')}${star(980, 220, 4, '#fff')}${star(40, 260, 4, '#fff')}
  <g fill="#131c33"><path d="M 322 330 L 322 306 L 350 292 L 378 306 L 378 330 Z"/><rect x="344" y="310" width="10" height="12" fill="#fde68a" opacity="0.85"/><path d="M 642 330 L 642 300 L 670 286 L 698 300 L 698 330 Z"/><rect x="664" y="304" width="10" height="12" fill="#fde68a" opacity="0.85"/><path d="M 0 330 L 0 308 L 28 296 L 58 308 L 58 330 Z"/><path d="M 950 330 L 950 304 L 975 292 L 1000 304 L 1000 330 Z"/></g>
  <path d="M 0 40 Q 250 90 500 45 T 1000 55" stroke="#3a2a1a" stroke-width="3" fill="none"/>
  <g>${[90, 190, 290, 390, 490, 590, 690, 790, 890].map((x, i) => {
    if (changed && i === 4) return `<circle cx="${x}" cy="62" r="4" fill="#334155"/>`;
    return `<circle cx="${x}" cy="62" r="7" fill="${i % 2 ? '#fbbf24' : '#f472b6'}"/><circle cx="${x}" cy="62" r="14" fill="url(#${p}glow)"/>`;
  }).join('')}</g>
  ${lantern(300, 150, 1, lanternColour, p + 'glow')}
  ${lantern(150, 170, 0.85, '#f97316', p + 'glow')}
  ${lantern(470, 140, 0.9, '#eab308', p + 'glow')}
  ${changed ? '' : lantern(850, 180, 0.9, '#dc2626', p + 'glow')}
  ${lantern(620, 165, 0.8, '#f97316', p + 'glow')}
  <g><rect x="60" y="330" width="260" height="16" fill="${awning}"/><rect x="60" y="346" width="260" height="130" fill="#7c2d12"/><rect x="80" y="380" width="220" height="60" fill="#451a03"/><g fill="#fbbf24"><circle cx="110" cy="410" r="10"/><circle cx="160" cy="410" r="10"/><circle cx="210" cy="410" r="10"/><circle cx="260" cy="410" r="10"/></g><rect x="120" y="300" width="140" height="30" rx="6" fill="#f87171"/><text x="190" y="321" font-size="18" font-weight="bold" text-anchor="middle" fill="#7f1d1d">DUMPLINGS</text></g>
  <g><rect x="380" y="330" width="260" height="16" fill="#0ea5e9"/><rect x="380" y="346" width="260" height="130" fill="#0c4a6e"/><rect x="400" y="380" width="220" height="60" fill="#082f49"/><g fill="#a5f3fc"><rect x="410" y="392" width="40" height="36" rx="4"/><rect x="470" y="392" width="40" height="36" rx="4"/><rect x="530" y="392" width="40" height="36" rx="4"/></g><rect x="440" y="300" width="140" height="30" rx="6" fill="${teaSign}"/><text x="510" y="321" font-size="18" font-weight="bold" text-anchor="middle" fill="#713f12">TEA HOUSE</text></g>
  <g><rect x="700" y="330" width="240" height="16" fill="#ec4899"/><rect x="700" y="346" width="240" height="130" fill="#831843"/><rect x="720" y="380" width="200" height="60" fill="#500724"/><g fill="#fda4af"><circle cx="760" cy="410" r="12"/><circle cx="830" cy="410" r="12"/><circle cx="900" cy="410" r="12"/></g><rect x="760" y="300" width="140" height="30" rx="6" fill="#fde68a"/><text x="830" y="321" font-size="18" font-weight="bold" text-anchor="middle" fill="#713f12">FLOWERS</text></g>
  <g fill="#3f2d1e"><rect x="60" y="346" width="8" height="130"/><rect x="312" y="346" width="8" height="130"/><rect x="380" y="346" width="8" height="130"/><rect x="632" y="346" width="8" height="130"/><rect x="700" y="346" width="8" height="130"/><rect x="932" y="346" width="8" height="130"/></g>
  <g fill="#3f2d1e">${[60, 380, 700].map((x) => Array.from({ length: 13 }, (_, i) => `<circle cx="${x + 10 + i * 20}" cy="350" r="10"/>`).join('')).join('')}</g>
  ${changed ? '<g><ellipse cx="820" cy="330" rx="26" ry="10" fill="#1f2937"/><circle cx="800" cy="322" r="10" fill="#1f2937"/><polygon points="794,314 798,302 804,314" fill="#1f2937"/><polygon points="802,314 806,302 812,314" fill="#1f2937"/><circle cx="797" cy="320" r="1.6" fill="#fbbf24"/></g>' : ''}
  <rect x="0" y="476" width="1000" height="124" fill="#2e2118"/>
  <g fill="#fbbf24" opacity="0.08"><ellipse cx="150" cy="548" rx="72" ry="26"/><ellipse cx="300" cy="548" rx="72" ry="26"/><ellipse cx="470" cy="548" rx="72" ry="26"/><ellipse cx="620" cy="548" rx="72" ry="26"/><ellipse cx="850" cy="548" rx="72" ry="26"/></g>
  <g fill="#3d2c1d" opacity="0.8">${[494, 518, 590].map((y, row) => { const off = row % 2 ? 42 : 0; return Array.from({ length: 12 }, (_, i) => `<ellipse cx="${off + 42 + i * 84}" cy="${y}" rx="36" ry="8"/>`).join(''); }).join('')}</g>
  <g fill="#000" opacity="0.3"><ellipse cx="180" cy="560" rx="22" ry="5"/><ellipse cx="270" cy="558" rx="20" ry="5"/><ellipse cx="430" cy="570" rx="20" ry="5"/><ellipse cx="700" cy="560" rx="22" ry="5"/><ellipse cx="880" cy="563" rx="20" ry="5"/></g>
  <g><ellipse cx="100" cy="560" rx="34" ry="12" fill="#6b4423"/><ellipse cx="100" cy="554" rx="28" ry="10" fill="#8a5a2b"/><g fill="#f97316"><circle cx="86" cy="550" r="7"/><circle cx="100" cy="546" r="7"/><circle cx="114" cy="550" r="7"/></g><g fill="#facc15"><circle cx="93" cy="556" r="6"/><circle cx="107" cy="556" r="6"/></g></g>
  <g><rect x="340" y="542" width="34" height="28" fill="#8a5a2b"/><rect x="376" y="542" width="34" height="28" fill="#7c4a21"/><rect x="358" y="514" width="34" height="28" fill="#8a5a2b"/><line x1="340" y1="556" x2="374" y2="556" stroke="#6b4423" stroke-width="2"/><line x1="376" y1="556" x2="410" y2="556" stroke="#5b3a1e" stroke-width="2"/><line x1="358" y1="528" x2="392" y2="528" stroke="#6b4423" stroke-width="2"/></g>
  <g><rect x="578" y="556" width="16" height="10" rx="2" fill="#3f2d1e"/><rect x="580" y="538" width="12" height="18" rx="5" fill="#f59e0b"/><circle cx="586" cy="547" r="13" fill="#fbbf24" opacity="0.3"/><circle cx="586" cy="547" r="5" fill="#fef3c7"/></g>
  <g><rect x="947" y="556" width="16" height="10" rx="2" fill="#3f2d1e"/><rect x="949" y="538" width="12" height="18" rx="5" fill="#f59e0b"/><circle cx="955" cy="547" r="13" fill="#fbbf24" opacity="0.3"/><circle cx="955" cy="547" r="5" fill="#fef3c7"/></g>
  <g><ellipse cx="270" cy="540" rx="13" ry="24" fill="#0e7490"/><circle cx="270" cy="510" r="11" fill="#fcd9b8"/><path d="M 259 501 Q 270 489 281 501 L 281 506 L 259 506 Z" fill="#0ea5e9"/><rect x="284" y="530" width="7" height="24" fill="#fcd9b8"/><rect x="252" y="530" width="7" height="24" fill="#fcd9b8"/></g>
  <g><ellipse cx="880" cy="545" rx="13" ry="24" fill="#7c3aed"/><circle cx="880" cy="515" r="11" fill="#fcd9b8"/><path d="M 869 506 Q 880 494 891 506 L 891 511 L 869 511 Z" fill="#f43f5e"/><rect x="894" y="535" width="7" height="24" fill="#fcd9b8"/><rect x="862" y="535" width="7" height="24" fill="#fcd9b8"/></g>
  <g><ellipse cx="180" cy="540" rx="14" ry="26" fill="#2563eb"/><circle cx="180" cy="506" r="12" fill="#fcd9b8"/><path d="M 168 496 Q 180 482 192 496 L 192 502 L 168 502 Z" fill="#dc2626"/><rect x="196" y="530" width="8" height="26" fill="#fcd9b8"/><rect x="162" y="530" width="8" height="26" fill="#fcd9b8"/></g>
  <g><ellipse cx="700" cy="540" rx="14" ry="26" fill="#059669"/><circle cx="700" cy="506" r="12" fill="#fcd9b8"/><path d="M 688 496 Q 700 484 712 496 L 712 502 L 688 502 Z" fill="#f59e0b"/>${changed ? '<ellipse cx="700" cy="488" rx="20" ry="7" fill="#7c3aed"/><rect x="694" y="478" width="12" height="10" fill="#7c3aed"/>' : ''}<rect x="716" y="530" width="8" height="26" fill="#fcd9b8"/><rect x="682" y="530" width="8" height="26" fill="#fcd9b8"/></g>
  <g><ellipse cx="430" cy="552" rx="12" ry="22" fill="#db2777"/><circle cx="430" cy="524" r="10" fill="#fcd9b8"/><rect x="444" y="544" width="7" height="22" fill="#fcd9b8"/></g>
  <g><circle cx="905" cy="330" r="26" fill="${changed ? '#38bdf8' : '#f43f5e'}"/><polygon points="905,356 898,372 912,372" fill="#f43f5e"/><line x1="905" y1="372" x2="905" y2="410" stroke="#94a3b8" stroke-width="2"/></g>
  <g fill="#fbbf24" opacity="0.8"><circle cx="60" cy="560" r="3"/><circle cx="320" cy="580" r="3"/><circle cx="560" cy="560" r="3"/><circle cx="960" cy="570" r="3"/></g>`;
}

const MARKET_DIFFS = [
  { x: 300, y: 162, r: 36, kind: 'colour', label: 'A lantern turned green' },
  { x: 190, y: 338, r: 34, kind: 'colour', label: 'The dumpling awning turned purple' },
  { x: 490, y: 62, r: 20, kind: 'removed', label: 'A string light went out' },
  { x: 700, y: 488, r: 26, kind: 'added', label: 'A shopper gained a purple hat' },
  { x: 850, y: 180, r: 36, kind: 'removed', label: 'A red lantern vanished' },
  { x: 510, y: 315, r: 30, kind: 'colour', label: 'The tea sign turned pink' },
  { x: 820, y: 326, r: 28, kind: 'added', label: 'A cat appeared on the flower stall' },
  { x: 905, y: 330, r: 34, kind: 'colour', label: 'The balloon changed colour' },
];

// ---- Scene 3: Coral Reef ----------------------------------------------------
function buildCoralReef(changed, p) {
  const fishColour = changed ? '#a855f7' : '#fb923c';
  const eye = changed ? '#f43f5e' : '#111827';
  return `
  <defs><linearGradient id="${p}water" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7dd3fc"/><stop offset="0.55" stop-color="#38bdf8"/><stop offset="1" stop-color="#0369a1"/></linearGradient></defs>
  <rect width="1000" height="600" fill="url(#${p}water)"/>
  <g fill="#ffffff" opacity="0.55"><ellipse cx="200" cy="60" rx="70" ry="12"/><ellipse cx="700" cy="40" rx="90" ry="14"/><ellipse cx="520" cy="110" rx="60" ry="10"/></g>
  ${fish(200, 200, 1, fishColour, '#f97316', false)}
  ${fish(420, 130, 0.8, '#38bdf8', '#0284c7', true)}
  ${fish(620, 240, 0.9, '#facc15', '#eab308', false)}
  ${fish(820, 140, 0.75, '#f472b6', '#db2777', true)}
  ${fish(330, 320, 0.65, '#4ade80', '#16a34a', false)}
  <g fill="#ffffff" opacity="0.7"><circle cx="150" cy="120" r="9"/><circle cx="168" cy="96" r="6"/><circle cx="150" cy="70" r="4"/><circle cx="560" cy="180" r="8"/><circle cx="574" cy="156" r="5"/><circle cx="900" cy="230" r="7"/><circle cx="912" cy="208" r="5"/>${changed ? '<circle cx="136" cy="146" r="7"/><circle cx="128" cy="168" r="5"/>' : ''}</g>
  <g><ellipse cx="120" cy="560" rx="120" ry="40" fill="#f59e0b" opacity="0.9"/><ellipse cx="120" cy="545" rx="80" ry="26" fill="#fb923c"/></g>
  <g><path d="M 760 600 L 760 470 Q 745 430 760 400 Q 775 430 760 470" fill="#ec4899"/><path d="M 800 600 L 800 500 Q 815 460 830 440 Q 820 480 815 520 L 815 600" fill="#f472b6"/><path d="M 720 600 L 720 520 Q 700 480 690 460 Q 712 490 716 530 L 716 600" fill="#db2777"/><circle cx="760" cy="400" r="8" fill="#f9a8d4"/><circle cx="830" cy="440" r="7" fill="#f9a8d4"/><circle cx="690" cy="460" r="6" fill="#f9a8d4"/></g>
  ${changed ? '' : '<g><path d="M 700 600 L 700 520 Q 685 480 668 462 Q 690 490 694 530 L 694 600" fill="#ec4899"/><circle cx="668" cy="462" r="6" fill="#f9a8d4"/></g>'}
  <g><path d="M 60 600 L 60 520 Q 50 470 40 440 Q 62 470 66 510 L 66 600" fill="#16a34a"/><path d="M 90 600 L 90 500 Q 100 460 112 430 Q 96 470 94 510 L 94 600" fill="#22c55e"/></g>
  <g><path d="M 650 600 L 650 500 Q 640 450 630 420 Q 652 460 656 500 L 656 600" fill="#15803d"/><path d="M 676 600 L 676 480 Q 686 440 698 410 Q 686 450 684 490 L 684 600" fill="#16a34a"/></g>
  ${changed ? '<g><path d="M 640 600 L 640 470 Q 626 410 612 380 Q 636 420 640 470 L 640 600" fill="#15803d"/></g>' : ''}
  <g transform="translate(500 520)"><polygon points="0,-34 10,-10 34,-10 15,4 22,28 0,14 -22,28 -15,4 -34,-10 -10,-10" fill="#f97316"/><circle cx="0" cy="0" r="4" fill="#ea580c"/></g>
  ${changed ? '<g transform="translate(560 520)"><polygon points="0,-34 10,-10 34,-10 15,4 22,28 0,14 -22,28 -15,4 -34,-10 -10,-10" fill="#f97316"/><circle cx="0" cy="0" r="4" fill="#ea580c"/></g>' : ''}
  <g><ellipse cx="350" cy="545" rx="26" ry="16" fill="#fda4af"/><ellipse cx="350" cy="540" rx="16" ry="10" fill="#fbcfe8"/>${changed ? '<ellipse cx="380" cy="552" rx="18" ry="12" fill="#c4b5fd"/><ellipse cx="380" cy="549" rx="11" ry="7" fill="#ddd6fe"/>' : ''}</g>
  <g><rect x="770" y="520" width="90" height="60" rx="6" fill="#92400e"/><rect x="770" y="520" width="90" height="14" rx="6" fill="${changed ? '#78350f' : '#b45309'}"/><rect x="806" y="540" width="18" height="18" rx="4" fill="#facc15"/><g fill="#fde68a"><circle cx="786" cy="560" r="4"/><circle cx="846" cy="566" r="4"/><circle cx="820" cy="570" r="4"/></g>${changed ? '<path d="M 770 520 L 800 492 L 860 492 L 860 520 Z" fill="#b45309"/>' : ''}</g>
  <g><circle cx="850" cy="300" r="34" fill="#7c3aed"/><circle cx="838" cy="292" r="8" fill="#fff"/><circle cx="840" cy="292" r="4" fill="${eye}"/><circle cx="862" cy="292" r="8" fill="#fff"/><circle cx="864" cy="292" r="4" fill="${eye}"/><path d="M 828 322 Q 850 332 872 322" stroke="#4c1d95" stroke-width="3" fill="none"/><path d="M 820 330 Q 810 360 818 380 M 838 334 Q 834 362 840 382 M 858 334 Q 862 362 858 382 M 876 330 Q 886 358 880 378" stroke="#7c3aed" stroke-width="7" fill="none" stroke-linecap="round"/></g>
  <ellipse cx="500" cy="585" rx="500" ry="30" fill="#fde68a" opacity="0.85"/>
  <g fill="#ffffff" opacity="0.45"><circle cx="260" cy="80" r="3"/><circle cx="480" cy="60" r="2.5"/><circle cx="740" cy="150" r="3"/><circle cx="80" cy="300" r="2.5"/><circle cx="950" cy="90" r="3"/></g>`;
}

const REEF_DIFFS = [
  { x: 200, y: 200, r: 40, kind: 'colour', label: 'The big fish turned purple' },
  { x: 668, y: 462, r: 28, kind: 'removed', label: 'A coral branch vanished' },
  { x: 500, y: 520, x2: 560, y2: 520, r: 34, kind: 'moved', label: 'The starfish swam right' },
  { x: 380, y: 552, r: 24, kind: 'added', label: 'A violet shell appeared' },
  { x: 136, y: 146, r: 22, kind: 'added', label: 'Two bubbles appeared' },
  { x: 850, y: 292, r: 30, kind: 'colour', label: 'The octopus eyes turned red' },
  { x: 612, y: 380, r: 30, kind: 'size', label: 'A seaweed frond grew tall' },
  { x: 815, y: 500, r: 30, kind: 'colour', label: 'The treasure chest opened' },
];

// ---- Scene 4: Mountain Tea Garden -----------------------------------------
function buildTeaGarden(changed, p) {
  const roof = changed ? '#15803d' : '#b91c1c';
  const moon = changed ? '#fda4af' : '#fef3c7';
  const bridge = changed ? '#2563eb' : '#b91c1c';
  return `
  <defs><linearGradient id="${p}msk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#bae6fd"/><stop offset="0.6" stop-color="#dbeafe"/><stop offset="1" stop-color="#fef3c7"/></linearGradient></defs>
  <rect width="1000" height="600" fill="url(#${p}msk)"/>
  <circle cx="850" cy="82" r="36" fill="${moon}"/><circle cx="850" cy="82" r="52" fill="${moon}" opacity="0.25"/>
  ${cloud(180, 70, 0.9, '#ffffff')}${cloud(620, 50, 0.7, '#ffffff')}
  <polygon points="0,420 220,180 420,420" fill="#93c5fd"/><polygon points="180,420 420,140 660,420" fill="#60a5fa"/><polygon points="480,420 720,200 960,420 1000,420 1000,600 0,600" fill="#3b82f6"/>
  <polygon points="180,240 220,180 260,240" fill="#ffffff"/><polygon points="380,200 420,140 460,200" fill="#ffffff"/><polygon points="680,260 720,200 760,260" fill="#ffffff"/>
  ${changed ? '<path d="M 240 260 L 228 330 L 216 360 L 252 360 L 240 330 Z" fill="#dbeafe"/><path d="M 252 330 L 246 380 L 258 380 L 252 330" fill="#bfdbfe"/>' : ''}
  <g><rect x="0" y="420" width="1000" height="180" fill="#86c98a"/><path d="M 0 480 Q 250 460 500 480 T 1000 480 L 1000 600 L 0 600 Z" fill="#6db377"/></g>
  <g><rect x="470" y="300" width="60" height="120" fill="#92400e"/><polygon points="440,300 530,300 560,268 410,268" fill="${roof}"/><rect x="480" y="240" width="40" height="28" fill="#92400e"/><polygon points="456,240 514,240 538,214 432,214" fill="${roof}"/><rect x="488" y="192" width="24" height="22" fill="#92400e"/><polygon points="470,192 530,192 548,170 452,170" fill="${roof}"/><circle cx="500" cy="160" r="8" fill="#facc15"/><rect x="492" y="330" width="16" height="90" fill="#451a03"/><rect x="478" y="360" width="44" height="40" fill="#fde68a"/></g>
  ${pine(150, 420, 1.1, false)}
  ${changed ? '' : pine(90, 440, 0.9, true)}
  ${pine(880, 430, 1.2, false)}
  ${pine(800, 460, 0.85, true)}
  ${bird(800, 118, 1, '#334155')}${bird(740, 90, 0.8, '#334155')}${changed ? bird(700, 140, 0.9, '#334155') : ''}
  <g><rect x="300" y="430" width="26" height="60" fill="#9ca3af"/><rect x="292" y="418" width="42" height="14" rx="4" fill="#6b7280"/><rect x="296" y="402" width="34" height="14" rx="4" fill="#9ca3af"/><rect x="304" y="452" width="18" height="16" fill="#fde68a" opacity="0.85"/></g>
  ${changed ? '<g><rect x="360" y="430" width="26" height="60" fill="#9ca3af"/><rect x="352" y="418" width="42" height="14" rx="4" fill="#6b7280"/><rect x="356" y="402" width="34" height="14" rx="4" fill="#9ca3af"/><rect x="364" y="452" width="18" height="16" fill="#fde68a" opacity="0.85"/></g>' : '<g><rect x="240" y="430" width="26" height="60" fill="#9ca3af"/><rect x="232" y="418" width="42" height="14" rx="4" fill="#6b7280"/><rect x="236" y="402" width="34" height="14" rx="4" fill="#9ca3af"/><rect x="244" y="452" width="18" height="16" fill="#fde68a" opacity="0.85"/></g>'}
  <g fill="#3f7d44"><ellipse cx="640" cy="520" rx="70" ry="22"/><ellipse cx="760" cy="530" rx="80" ry="24"/><ellipse cx="560" cy="540" rx="60" ry="20"/></g>
  <g fill="#4c9a52"><ellipse cx="${changed ? 700 : 640}" cy="506" rx="${changed ? 92 : 70}" ry="24"/><ellipse cx="760" cy="516" rx="80" ry="24"/></g>
  <path d="M 380 600 Q 420 540 500 540 Q 580 540 620 600" fill="#7dd3fc"/><path d="M 420 600 Q 450 560 500 560 Q 550 560 580 600" fill="#38bdf8"/>
  <g><path d="M 430 560 Q 500 520 570 560 L 570 576 Q 500 540 430 576 Z" fill="${bridge}"/><line x1="440" y1="552" x2="440" y2="530" stroke="#7f1d1d" stroke-width="3"/><line x1="500" y1="546" x2="500" y2="524" stroke="#7f1d1d" stroke-width="3"/><line x1="560" y1="552" x2="560" y2="530" stroke="#7f1d1d" stroke-width="3"/></g>
  <g fill="#ffffff"><circle cx="120" cy="520" r="4"/><circle cx="220" cy="560" r="3"/><circle cx="900" cy="520" r="4"/><circle cx="60" cy="470" r="3"/></g>`;
}

const TEA_DIFFS = [
  { x: 500, y: 240, r: 40, kind: 'colour', label: 'The pagoda roofs turned green' },
  { x: 90, y: 400, r: 40, kind: 'removed', label: 'A pine tree vanished' },
  { x: 700, y: 140, r: 24, kind: 'added', label: 'A third bird appeared' },
  { x: 253, y: 445, x2: 373, y2: 445, r: 30, kind: 'moved', label: 'A stone lantern moved right' },
  { x: 850, y: 82, r: 40, kind: 'colour', label: 'The sun turned pink' },
  { x: 500, y: 560, r: 34, kind: 'colour', label: 'The little bridge turned blue' },
  { x: 700, y: 506, r: 36, kind: 'size', label: 'A tea bush grew bigger' },
  { x: 234, y: 300, r: 30, kind: 'added', label: 'A waterfall appeared' },
];

// ---- Scene 5: Clocktower Square -------------------------------------------
function buildClockSquare(changed, p) {
  const balloon = changed ? '#22c55e' : '#f43f5e';
  const water = changed ? '#f472b6' : '#38bdf8';
  const hands = changed ? 'M 500 150 L 536 132 M 500 150 L 500 116' : 'M 500 150 L 474 124 M 500 150 L 526 124';
  return `
  <defs><linearGradient id="${p}sq" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a5f3fc"/><stop offset="0.7" stop-color="#e0f2fe"/><stop offset="1" stop-color="#fef9c3"/></linearGradient></defs>
  <rect width="1000" height="600" fill="url(#${p}sq)"/>
  ${cloud(150, 80, 1, '#ffffff')}${cloud(820, 100, 0.8, '#ffffff')}${changed ? cloud(420, 60, 0.7, '#ffffff') : ''}
  <g><rect x="420" y="520" width="160" height="80" fill="#fde68a"/><rect x="120" y="540" width="140" height="60" fill="#fca5a5"/><rect x="740" y="530" width="150" height="70" fill="#a7f3d0"/><g fill="#334155"><rect x="440" y="540" width="18" height="18"/><rect x="480" y="540" width="18" height="18"/><rect x="520" y="540" width="18" height="18"/><rect x="140" y="556" width="16" height="16"/><rect x="180" y="556" width="16" height="16"/>${changed ? '' : '<rect x="760" y="548" width="16" height="16"/>' }<rect x="800" y="548" width="16" height="16"/><rect x="840" y="548" width="16" height="16"/></g></g>
  <g><rect x="460" y="180" width="80" height="340" fill="#f8f4ec"/><rect x="440" y="480" width="120" height="40" fill="#d6d3d1"/><polygon points="440,180 560,180 540,140 460,140" fill="#b91c1c"/><circle cx="500" cy="150" r="58" fill="#ffffff" stroke="#334155" stroke-width="6"/><g stroke="#334155" stroke-width="3"><line x1="500" y1="96" x2="500" y2="106"/><line x1="500" y1="194" x2="500" y2="204"/><line x1="446" y1="150" x2="456" y2="150"/><line x1="544" y1="150" x2="554" y2="150"/></g><path d="${hands}" stroke="#111827" stroke-width="5" stroke-linecap="round"/><circle cx="500" cy="150" r="6" fill="#dc2626"/><rect x="486" y="240" width="28" height="60" fill="#fde68a"/><rect x="486" y="330" width="28" height="60" fill="#fde68a"/><rect x="478" y="440" width="44" height="80" fill="#5b3a1e"/></g>
  <g><rect x="60" y="400" width="180" height="14" fill="#f59e0b"/><rect x="70" y="414" width="160" height="86" fill="#92400e"/><g fill="#fbbf24"><circle cx="100" cy="440" r="9"/><circle cx="140" cy="440" r="9"/><circle cx="180" cy="440" r="9"/><circle cx="210" cy="440" r="9"/></g><rect x="100" y="372" width="100" height="28" rx="6" fill="#fde68a"/><text x="150" y="391" font-size="16" font-weight="bold" text-anchor="middle" fill="#713f12">FRUIT</text></g>
  <g><rect x="760" y="400" width="180" height="14" fill="#0ea5e9"/><rect x="770" y="414" width="160" height="86" fill="#0c4a6e"/><g fill="#a5f3fc"><rect x="790" y="428" width="36" height="32" rx="4"/><rect x="840" y="428" width="36" height="32" rx="4"/></g><rect x="800" y="372" width="100" height="28" rx="6" fill="#fde68a"/><text x="850" y="391" font-size="16" font-weight="bold" text-anchor="middle" fill="#713f12">BOOKS</text>${changed ? '<polygon points="850,372 862,344 874,372" fill="#dc2626"/><line x1="862" y1="372" x2="862" y2="344" stroke="#7f1d1d" stroke-width="3"/>' : ''}</g>
  <ellipse cx="500" cy="560" rx="130" ry="26" fill="#94a3b8"/><ellipse cx="500" cy="552" rx="100" ry="18" fill="${water}"/><ellipse cx="500" cy="548" rx="60" ry="10" fill="#e0f2fe"/><path d="M 500 548 Q 492 520 500 500 Q 508 520 500 548" fill="${water}"/><path d="M 470 540 Q 460 516 470 500 Q 478 520 470 540" fill="${water}" opacity="0.7"/><path d="M 530 540 Q 540 516 530 500 Q 522 520 530 540" fill="${water}" opacity="0.7"/>
  <g><circle cx="200" cy="120" r="28" fill="${balloon}"/><polygon points="200,148 192,166 208,166" fill="${balloon}"/><line x1="200" y1="166" x2="200" y2="210" stroke="#94a3b8" stroke-width="2"/></g>
  <g><circle cx="880" cy="180" r="22" fill="#facc15"/><polygon points="880,202 874,216 886,216" fill="#facc15"/><line x1="880" y1="216" x2="880" y2="250" stroke="#94a3b8" stroke-width="2"/></g>
  <g><ellipse cx="350" cy="530" rx="16" ry="12" fill="#94a3b8"/><circle cx="338" cy="516" r="9" fill="#94a3b8"/><polygon points="330,510 336,500 340,510" fill="#f97316"/><circle cx="335" cy="514" r="1.5" fill="#111"/></g>
  ${changed ? '' : '<g><ellipse cx="300" cy="545" rx="14" ry="11" fill="#64748b"/><circle cx="290" cy="533" r="8" fill="#64748b"/><polygon points="283,527 288,518 292,527" fill="#f97316"/><circle cx="287" cy="531" r="1.4" fill="#111"/></g>'}
  <g><rect x="640" y="500" width="70" height="12" rx="4" fill="#92400e"/><rect x="646" y="512" width="8" height="22" fill="#78350f"/><rect x="696" y="512" width="8" height="22" fill="#78350f"/></g>
  ${changed ? '<g><rect x="700" y="500" width="70" height="12" rx="4" fill="#92400e"/><rect x="706" y="512" width="8" height="22" fill="#78350f"/><rect x="756" y="512" width="8" height="22" fill="#78350f"/></g>' : ''}
  <g fill="#ffffff"><circle cx="90" cy="480" r="3"/><circle cx="920" cy="460" r="3"/><circle cx="620" cy="470" r="3"/></g>`;
}

const SQUARE_DIFFS = [
  { x: 500, y: 150, r: 46, kind: 'colour', label: 'The clock hands moved to 3 o’clock' },
  { x: 200, y: 120, r: 34, kind: 'colour', label: 'The balloon turned green' },
  { x: 300, y: 540, r: 26, kind: 'removed', label: 'A pigeon flew away' },
  { x: 500, y: 548, r: 40, kind: 'colour', label: 'The fountain water turned pink' },
  { x: 862, y: 356, r: 24, kind: 'added', label: 'A flag appeared on the book stall' },
  { x: 768, y: 556, r: 22, kind: 'removed', label: 'A window vanished' },
  { x: 675, y: 512, x2: 735, y2: 512, r: 30, kind: 'moved', label: 'The bench slid right' },
  { x: 420, y: 60, r: 34, kind: 'added', label: 'A cloud appeared' },
];

// ---- Scene 6: Snowy Station -----------------------------------------------
function buildSnowyStation(changed, p) {
  const windowLight = changed ? '#60a5fa' : '#fde68a';
  const smoke = changed ? '#f9a8d4' : '#cbd5e1';
  const bench = changed ? '#dc2626' : '#92400e';
  const signColour = changed ? '#1d4ed8' : '#7f1d1d';
  return `
  <defs><linearGradient id="${p}sn" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#cbd5e1"/><stop offset="0.6" stop-color="#e2e8f0"/><stop offset="1" stop-color="#f1f5f9"/></linearGradient></defs>
  <rect width="1000" height="600" fill="url(#${p}sn)"/>
  ${cloud(200, 70, 1, '#ffffff')}${cloud(700, 50, 0.8, '#ffffff')}
  <g fill="#ffffff"><circle cx="120" cy="120" r="4"/><circle cx="260" cy="80" r="3"/><circle cx="420" cy="140" r="4"/><circle cx="600" cy="90" r="3"/><circle cx="780" cy="130" r="4"/><circle cx="920" cy="80" r="3"/><circle cx="60" cy="240" r="3"/><circle cx="940" cy="220" r="4"/></g>
  ${pine(150, 420, 1.1, true)}
  <g><polygon points="150,342 133,378 167,378" fill="#ffffff"/><polygon points="150,322 138,348 162,348" fill="#ffffff"/></g>
  ${changed ? pine(220, 430, 1.5, false) : pine(220, 430, 1.1, false)}
  <g><polygon points="220,352 203,388 237,388" fill="#ffffff"/><polygon points="220,332 208,358 232,358" fill="#ffffff"/></g>
  <g><rect x="380" y="180" width="240" height="16" fill="${signColour}"/><rect x="396" y="196" width="208" height="54" fill="#f8f4ec"/><rect x="396" y="196" width="208" height="54" fill="none" stroke="${signColour}" stroke-width="3"/><text x="500" y="232" font-size="26" font-weight="bold" text-anchor="middle" fill="${signColour}" letter-spacing="3">TWIN HARBOUR</text><rect x="430" y="250" width="8" height="70" fill="#5b3a1e"/><rect x="562" y="250" width="8" height="70" fill="#5b3a1e"/></g>
  <rect x="0" y="420" width="1000" height="180" fill="#e8eef5"/>
  <rect x="0" y="420" width="1000" height="26" fill="#f8fafc"/>
  <g><rect x="180" y="330" width="420" height="90" rx="14" fill="#b91c1c"/><rect x="180" y="330" width="420" height="90" rx="14" fill="none" stroke="#7f1d1d" stroke-width="4"/><rect x="600" y="350" width="200" height="70" rx="10" fill="#dc2626"/><rect x="600" y="350" width="200" height="70" rx="10" fill="none" stroke="#7f1d1d" stroke-width="4"/><g fill="${windowLight}"><rect x="210" y="352" width="44" height="34" rx="4"/><rect x="272" y="352" width="44" height="34" rx="4"/><rect x="334" y="352" width="44" height="34" rx="4"/><rect x="396" y="352" width="44" height="34" rx="4"/><rect x="458" y="352" width="44" height="34" rx="4"/><rect x="520" y="352" width="44" height="34" rx="4"/><rect x="630" y="368" width="34" height="26" rx="4"/><rect x="690" y="368" width="34" height="26" rx="4"/></g><rect x="580" y="330" width="30" height="90" fill="#7f1d1d"/><circle cx="270" cy="330" r="16" fill="#334155"/><circle cx="270" cy="330" r="7" fill="#fde68a"/><circle cx="330" cy="330" r="10" fill="#fde68a" opacity="0.8"/><path d="M 250 306 Q 240 280 252 262 Q 244 240 256 222" stroke="${smoke}" stroke-width="10" fill="none" stroke-linecap="round" opacity="0.8"/><circle cx="256" cy="216" r="14" fill="${smoke}" opacity="0.7"/></g>
  <g fill="#334155"><circle cx="210" cy="404" r="14"/><circle cx="300" cy="404" r="14"/><circle cx="390" cy="404" r="14"/><circle cx="480" cy="404" r="14"/><circle cx="560" cy="404" r="14"/><circle cx="660" cy="404" r="12"/><circle cx="740" cy="404" r="12"/></g>
  <rect x="0" y="446" width="1000" height="10" fill="#64748b"/>
  <g><rect x="700" y="300" width="10" height="140" fill="#334155"/><ellipse cx="705" cy="292" rx="20" ry="16" fill="#1e293b"/><circle cx="705" cy="292" r="10" fill="${changed ? '#fb923c' : '#fef9c3'}"/><circle cx="705" cy="292" r="${changed ? 30 : 18}" fill="#f59e0b" opacity="${changed ? 0.45 : 0.25}"/></g>
  ${changed ? '' : '<g><rect x="760" y="300" width="10" height="140" fill="#334155"/><ellipse cx="765" cy="292" rx="20" ry="16" fill="#1e293b"/><circle cx="765" cy="292" r="10" fill="#fef9c3"/><circle cx="765" cy="292" r="18" fill="#fde68a" opacity="0.25"/></g>'}
  <g><rect x="580" y="470" width="90" height="14" rx="4" fill="${bench}"/><rect x="588" y="484" width="10" height="26" fill="#78350f"/><rect x="652" y="484" width="10" height="26" fill="#78350f"/><rect x="580" y="448" width="90" height="10" rx="4" fill="${bench}"/></g>
  ${changed ? '<g><circle cx="850" cy="470" r="26" fill="#ffffff"/><circle cx="850" cy="428" r="20" fill="#ffffff"/><circle cx="850" cy="396" r="14" fill="#ffffff"/><circle cx="844" cy="392" r="2.5" fill="#111"/><circle cx="856" cy="392" r="2.5" fill="#111"/><polygon points="850,396 862,400 850,404" fill="#f97316"/><rect x="836" y="376" width="28" height="8" rx="3" fill="#1e293b"/><rect x="842" y="364" width="16" height="14" fill="#1e293b"/><line x1="828" y1="424" x2="810" y2="410" stroke="#92400e" stroke-width="3"/><line x1="872" y1="424" x2="890" y2="410" stroke="#92400e" stroke-width="3"/></g>' : ''}
  <g fill="#ffffff"><circle cx="80" cy="500" r="5"/><circle cx="180" cy="540" r="4"/><circle cx="340" cy="500" r="5"/><circle cx="520" cy="540" r="4"/><circle cx="700" cy="520" r="5"/><circle cx="940" cy="500" r="4"/></g>`;
}

const STATION_DIFFS = [
  { x: 300, y: 369, r: 34, kind: 'colour', label: 'The train windows turned blue' },
  { x: 765, y: 360, r: 34, kind: 'removed', label: 'A platform lamp vanished' },
  { x: 500, y: 213, r: 40, kind: 'colour', label: 'The station sign changed colour' },
  { x: 850, y: 428, r: 36, kind: 'added', label: 'A snowman appeared' },
  { x: 220, y: 380, r: 40, kind: 'size', label: 'A pine tree grew taller' },
  { x: 252, y: 250, r: 30, kind: 'colour', label: 'The train smoke turned pink' },
  { x: 625, y: 477, r: 34, kind: 'colour', label: 'The bench turned red' },
  { x: 705, y: 292, r: 26, kind: 'colour', label: 'A lamp glowed warmer' },
];

// ---- Scene registry --------------------------------------------------------
export const SCENES = [
  { id: 'dawn', name: 'Dawn Harbour', sub: 'Level 1 · Sunrise over the fishing boats', build: buildDawnHarbour, diffs: DAWN_DIFFS },
  { id: 'market', name: 'Lantern Night Market', sub: 'Level 2 · Lanterns, stalls and shoppers', build: buildNightMarket, diffs: MARKET_DIFFS },
  { id: 'reef', name: 'Coral Reef', sub: 'Level 3 · Under the waves', build: buildCoralReef, diffs: REEF_DIFFS },
  { id: 'tea', name: 'Mountain Tea Garden', sub: 'Level 4 · Pagoda above the tea bushes', build: buildTeaGarden, diffs: TEA_DIFFS },
  { id: 'square', name: 'Clocktower Square', sub: 'Level 5 · The old clocktower at noon', build: buildClockSquare, diffs: SQUARE_DIFFS },
  { id: 'station', name: 'Snowy Station', sub: 'Level 6 · The last train in the snow', build: buildSnowyStation, diffs: STATION_DIFFS },
];

export const LEVEL_SECONDS = 120;
export const DIFFS_PER_LEVEL = 8;
