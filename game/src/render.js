// render.js — draws the DOM: the two panels, the HUD, the markers and every
// overlay screen. It never owns game state; game.js passes the state in.

import { SCENES, LEVEL_SECONDS } from './scenes.js';

function $(id) {
  return document.getElementById(id);
}

function fmtTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function starRow(count) {
  return Array.from({ length: 3 }, (_, i) => `<span class="star ${i < count ? 'star-on' : 'star-off'}">★</span>`).join('');
}

/** Green ring + check for one found difference, at scene coordinates. */
function foundMarkMarkup(diff, changedSide) {
  const x = changedSide && diff.x2 !== undefined ? diff.x2 : diff.x;
  const y = changedSide && diff.y2 !== undefined ? diff.y2 : diff.y;
  return `<g class="found-mark" transform="translate(${x} ${y})"><g class="found-mark-pop"><circle r="${diff.r}" fill="rgba(34,197,94,0.18)" stroke="#22c55e" stroke-width="6"/><circle r="${diff.r - 10}" fill="none" stroke="#ffffff" stroke-width="2" opacity="0.8"/><path d="M -13 1 L -4 11 L 15 -11" fill="none" stroke="#15803d" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/></g></g>`;
}

/** Draw every found marker (and the hint ring) into both panels. */
export function renderMarkers(state) {
  const scene = SCENES[state.levelIndex];
  for (const side of ['left', 'right']) {
    const group = $(`markers-${side}`);
    if (!group) continue;
    const changedSide = side === 'right';
    let html = '';
    state.found.forEach((i) => {
      html += foundMarkMarkup(scene.diffs[i], changedSide);
    });
    if (state.hintTarget !== null && !state.found.has(state.hintTarget)) {
      const diff = scene.diffs[state.hintTarget];
      const x = changedSide && diff.x2 !== undefined ? diff.x2 : diff.x;
      const y = changedSide && diff.y2 !== undefined ? diff.y2 : diff.y;
      html += `<g class="hint-ring" transform="translate(${x} ${y})"><circle r="${diff.r + 6}" fill="none" stroke="#facc15" stroke-width="5"/></g>`;
    }
    group.innerHTML = html;
  }
  const toast = $('toast');
  if (toast) {
    if (state.lastFoundLabel) {
      toast.textContent = `Found! ${state.lastFoundLabel}`;
      toast.classList.add('toast-show');
    }
  }
}

/** A red X that flashes at the clicked spot on both panels, then fades. */
export function renderWrongMark(state, x, y) {
  for (const side of ['left', 'right']) {
    const group = $(`markers-${side}`);
    if (!group) continue;
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('class', 'wrong-mark');
    g.setAttribute('transform', `translate(${x} ${y})`);
    g.innerHTML = `<circle r="26" fill="rgba(239,68,68,0.18)" stroke="#ef4444" stroke-width="5"/><path d="M -12 -12 L 12 12 M 12 -12 L -12 12" stroke="#dc2626" stroke-width="7" stroke-linecap="round"/>`;
    group.appendChild(g);
    window.setTimeout(() => g.remove(), 750);
  }
  const toast = $('toast');
  if (toast) {
    toast.textContent = 'Miss! −3 seconds';
    toast.classList.add('toast-show');
  }
}

/** Pulse a hint ring around one unfound difference on both panels. */
export function renderHintRing(state) {
  renderMarkers(state);
}

/** Rebuild both scene panels for the current level. */
export function renderPanels(state) {
  const scene = SCENES[state.levelIndex];
  const left = $('panel-left');
  const right = $('panel-right');
  if (left) {
    left.innerHTML = `<svg viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid meet" aria-label="Original picture">${scene.build(false, 'L')}<g id="markers-left"></g></svg>`;
  }
  if (right) {
    right.innerHTML = `<svg viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid meet" aria-label="Changed picture">${scene.build(true, 'R')}<g id="markers-right"></g></svg>`;
  }
  const nameEl = $('level-name');
  if (nameEl) nameEl.textContent = scene.name;
  const subEl = $('level-sub');
  if (subEl) subEl.textContent = scene.sub;
  renderMarkers(state);
}

/** The HUD: level, found counter, timer, score, streak and buttons. */
export function renderHud(state) {
  const scene = SCENES[state.levelIndex];
  const set = (id, text) => {
    const el = $(id);
    if (el) el.textContent = text;
  };
  set('hud-level', `Level ${state.levelIndex + 1}/${SCENES.length}`);
  set('hud-scene', scene.name);
  set('hud-found', `Found ${state.found.size}/8`);
  set('hud-found-small', `${state.found.size} of 8 differences found`);
  set('hud-time', fmtTime(state.timeLeft));
  // During play the running total is this level's score plus banked levels;
  // once a level is complete, totalScore already includes it, so show it alone.
  const displayScore = (state.screen === 'level-done' || state.screen === 'game-done')
    ? state.totalScore
    : state.score + state.totalScore;
  set('hud-score', String(displayScore));
  set('hud-streak', state.streak > 1 ? `Streak ×${state.streak}` : 'Streak ×0');
  const bar = $('timer-fill');
  if (bar) {
    bar.style.width = `${(state.timeLeft / LEVEL_SECONDS) * 100}%`;
    bar.classList.toggle('timer-low', state.timeLeft <= 20);
  }
  const timeEl = $('hud-time');
  if (timeEl) timeEl.classList.toggle('time-low', state.timeLeft <= 20);
  const hintBtn = $('btn-hint');
  if (hintBtn) {
    hintBtn.textContent = `Hint (${state.hintsLeft})`;
    hintBtn.disabled = state.hintsLeft <= 0 || state.screen !== 'play' || state.paused;
  }
  const magBtn = $('btn-magnifier');
  if (magBtn) {
    magBtn.textContent = state.magnifierOn ? 'Magnifier: On' : 'Magnifier: Off';
    magBtn.classList.toggle('toggle-on', state.magnifierOn);
  }
  const pauseBtn = $('btn-pause');
  if (pauseBtn) pauseBtn.textContent = state.paused ? 'Resume' : 'Pause';
  const muteBtn = $('btn-mute');
  if (muteBtn) muteBtn.textContent = state.muted ? 'Sound: Off' : 'Sound: On';
  const streakEl = $('hud-streak');
  if (streakEl) streakEl.classList.toggle('streak-hot', state.streak >= 3);
}

export function renderAll(state) {
  renderPanels(state);
  renderHud(state);
}

// ---- Overlay screens ---------------------------------------------------------

export function hideOverlay() {
  const overlay = $('overlay');
  if (overlay) overlay.classList.add('hidden');
  const toast = $('toast');
  if (toast) toast.classList.remove('toast-show');
}

function showOverlay(html) {
  const overlay = $('overlay');
  const card = $('overlay-card');
  if (!overlay || !card) return;
  card.innerHTML = html;
  overlay.classList.remove('hidden');
}

export function showStartScreen(state) {
  const levels = SCENES.map((scene, i) => `
    <button class="level-card" data-action="start-level" data-level="${i}">
      <span class="level-num">${i + 1}</span>
      <span class="level-title">${scene.name}</span>
      <span class="level-desc">${scene.sub}</span>
      <span class="level-diffs">8 differences · 120s</span>
    </button>`).join('');
  showOverlay(`
    <h1 class="title">Twin Harbours</h1>
    <p class="subtitle">A spot-the-difference hunt across six hand-drawn harbours</p>
    <div class="howto">
      <div class="howto-item"><b>Look</b> — two pictures side by side, almost the same.</div>
      <div class="howto-item"><b>Click</b> — a difference on either picture to ring it on both.</div>
      <div class="howto-item"><b>Find all 8</b> — before the 120-second timer runs out.</div>
    </div>
    <p class="howto-keys">Mouse to click · Arrow keys move the crosshair, Enter checks · H hint · M magnifier · P pause</p>
    <div class="level-grid">${levels}</div>
    <p class="best-line">${state.totalScore > 0 ? `Best total score so far: ${state.totalScore}` : 'Six levels. Forty-eight differences. How sharp are your eyes?'}</p>
  `);
}

export function showLevelCompleteScreen(state, timeBonus) {
  const stars = state.timeLeft >= 60 ? 3 : state.timeLeft >= 30 ? 2 : 1;
  const last = state.levelIndex + 1 >= SCENES.length;
  showOverlay(`
    <p class="eyebrow">Level complete</p>
    <h1 class="title">${SCENES[state.levelIndex].name}</h1>
    <div class="stars">${starRow(stars)}</div>
    <p class="score-line">All 8 differences found with ${fmtTime(state.timeLeft)} to spare</p>
    <div class="score-breakdown">
      <div><span>Finds + streak</span><b>${state.score - timeBonus}</b></div>
      <div><span>Time bonus (${state.timeLeft}s × 5)</span><b>+${timeBonus}</b></div>
      <div><span>Level score</span><b>${state.score}</b></div>
      <div><span>Total score</span><b>${state.totalScore}</b></div>
    </div>
    <div class="btn-row">
      <button class="btn-primary" data-action="next-level">${last ? 'See your results' : 'Next harbour →'}</button>
      <button class="btn-ghost" data-action="retry-level">Replay level</button>
      <button class="btn-ghost" data-action="back-start">Level select</button>
    </div>
  `);
}

export function showGameCompleteScreen(state) {
  const totalClicks = state.clicks;
  const acc = totalClicks === 0 ? 100 : Math.round((state.correctClicks / totalClicks) * 100);
  const rows = SCENES.map((scene, i) => `
    <div><span>${scene.name}</span><b>${state.levelScores[i] ?? 0}</b></div>`).join('');
  showOverlay(`
    <p class="eyebrow">All six harbours cleared</p>
    <h1 class="title">You found them all!</h1>
    <div class="stars">${starRow(3)}</div>
    <p class="score-line">48 differences, six harbours, one sharp pair of eyes.</p>
    <div class="score-breakdown">
      <div><span>Total score</span><b>${state.totalScore}</b></div>
      <div><span>Accuracy</span><b>${acc}%</b></div>
      <div><span>Best streak</span><b>×${state.bestStreak}</b></div>
    </div>
    <div class="score-breakdown">${rows}</div>
    <div class="btn-row">
      <button class="btn-primary" data-action="back-start">Play again</button>
    </div>
  `);
}

export function showGameOverScreen(state) {
  showOverlay(`
    <p class="eyebrow">Out of time</p>
    <h1 class="title">The harbour fades…</h1>
    <p class="score-line">You found ${state.found.size} of 8 differences in ${SCENES[state.levelIndex].name}.</p>
    <p class="score-line">The ones you missed are still out there. Try again?</p>
    <div class="btn-row">
      <button class="btn-primary" data-action="retry-level">Retry level</button>
      <button class="btn-ghost" data-action="back-start">Level select</button>
    </div>
  `);
}

export function showPausedScreen(state) {
  showOverlay(`
    <p class="eyebrow">Paused</p>
    <h1 class="title">Take a breath</h1>
    <p class="score-line">${SCENES[state.levelIndex].name} · ${state.found.size}/8 found · ${fmtTime(state.timeLeft)} left</p>
    <div class="btn-row">
      <button class="btn-primary" data-action="pause">Resume</button>
      <button class="btn-ghost" data-action="back-start">Level select</button>
    </div>
  `);
}

/** Park the magnifier lens over an unfound difference (screenshot scene 3). */
export function showShotLens(state) {
  const lens = $('lens');
  const right = $('panel-right');
  if (!lens || !right) return;
  const rect = right.getBoundingClientRect();
  const scene = SCENES[state.levelIndex];
  const diff = scene.diffs[6];
  const cx = rect.left + (diff.x / 1000) * rect.width;
  const cy = rect.top + (diff.y / 600) * rect.height;
  positionLens(state, right, cx, cy);
}

/** Place the 2× magnifier lens centred on a point over one panel. */
export function positionLens(state, panelEl, clientX, clientY) {
  const lens = $('lens');
  if (!lens) return;
  const svg = panelEl.querySelector('svg');
  if (!svg) return;
  const rect = panelEl.getBoundingClientRect();
  const size = 220;
  const zoom = 2;
  const x = clientX - rect.left;
  const y = clientY - rect.top;
  lens.style.width = `${size}px`;
  lens.style.height = `${size}px`;
  lens.style.left = `${clientX - size / 2}px`;
  lens.style.top = `${clientY - size / 2}px`;
  lens.style.display = 'block';
  let inner = lens.querySelector('.lens-inner');
  if (!inner) {
    inner = document.createElement('div');
    inner.className = 'lens-inner';
    lens.appendChild(inner);
  }
  inner.innerHTML = '';
  const clone = svg.cloneNode(true);
  clone.setAttribute('width', String(rect.width * zoom));
  clone.setAttribute('height', String(rect.height * zoom));
  inner.appendChild(clone);
  inner.style.width = `${rect.width * zoom}px`;
  inner.style.height = `${rect.height * zoom}px`;
  inner.style.transform = `translate(${-(x * zoom - size / 2)}px, ${-(y * zoom - size / 2)}px)`;
}

export function hideLens() {
  const lens = $('lens');
  if (lens) lens.style.display = 'none';
}
