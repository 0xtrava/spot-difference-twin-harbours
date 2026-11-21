// game.js — game state, timer, scoring, levels and screenshot staging.
// Owns the single state object; render.js draws it, input.js feeds it clicks.

import { SCENES, LEVEL_SECONDS, DIFFS_PER_LEVEL } from './scenes.js';
import {
  renderAll, renderHud, renderPanels, renderMarkers, renderWrongMark,
  renderHintRing, showStartScreen, showLevelCompleteScreen,
  showGameCompleteScreen, showGameOverScreen, showPausedScreen, hideOverlay,
  showShotLens,
} from './render.js';
import {
  playFindChime, playWrongBuzz, playClickTick, playHintShimmer,
  playLevelFanfare, playLowTimeTick, setMuted, isMuted,
} from './audio.js';

export const SCREEN_START = 'start';
export const SCREEN_PLAY = 'play';
export const SCREEN_LEVEL_DONE = 'level-done';
export const SCREEN_GAME_DONE = 'game-done';
export const SCREEN_GAME_OVER = 'game-over';

export const state = {
  screen: SCREEN_START,
  levelIndex: 0,
  found: new Set(),
  score: 0,
  totalScore: 0,
  streak: 0,
  bestStreak: 0,
  timeLeft: LEVEL_SECONDS,
  hintsLeft: 3,
  magnifierOn: false,
  paused: false,
  muted: false,
  clicks: 0,
  correctClicks: 0,
  levelScores: [],
  timerId: null,
  lastTickSecond: LEVEL_SECONDS,
  hintTarget: null,
  shotMode: false,
};

export function currentScene() {
  return SCENES[state.levelIndex];
}

export function foundCount() {
  return state.found.size;
}

export function levelStars() {
  if (state.timeLeft >= 60) return 3;
  if (state.timeLeft >= 30) return 2;
  return 1;
}

/** Start (or restart) a level fresh: empty finds, full timer, three hints. */
export function startLevel(index) {
  state.levelIndex = index;
  state.found = new Set();
  state.score = 0;
  state.streak = 0;
  state.timeLeft = LEVEL_SECONDS;
  state.hintsLeft = 3;
  state.paused = false;
  state.screen = SCREEN_PLAY;
  state.hintTarget = null;
  state.lastTickSecond = LEVEL_SECONDS;
  hideOverlay();
  renderAll(state);
  startTimer();
}

/** The one-second countdown; freezes while paused or in a screenshot. */
function startTimer() {
  stopTimer();
  if (state.shotMode) return;
  state.timerId = window.setInterval(() => {
    if (state.paused || state.screen !== SCREEN_PLAY) return;
    state.timeLeft = Math.max(0, state.timeLeft - 1);
    if (state.timeLeft <= 10 && state.timeLeft < state.lastTickSecond) {
      playLowTimeTick();
    }
    state.lastTickSecond = state.timeLeft;
    renderHud(state);
    if (state.timeLeft === 0) timeUp();
  }, 1000);
}

function stopTimer() {
  if (state.timerId !== null) {
    window.clearInterval(state.timerId);
    state.timerId = null;
  }
}

function timeUp() {
  stopTimer();
  state.screen = SCREEN_GAME_OVER;
  playWrongBuzz();
  showGameOverScreen(state);
}

/** A click at scene coordinates (x, y) on either panel. */
export function checkSceneClick(x, y) {
  if (state.screen !== SCREEN_PLAY || state.paused) return;
  state.clicks += 1;
  const scene = currentScene();
  const hit = scene.diffs.findIndex((diff, i) => {
    if (state.found.has(i)) return false;
    const dx = x - diff.x;
    const dy = y - diff.y;
    if (dx * dx + dy * dy <= diff.r * diff.r) return true;
    if (diff.x2 !== undefined) {
      const dx2 = x - diff.x2;
      const dy2 = y - diff.y2;
      if (dx2 * dx2 + dy2 * dy2 <= diff.r * diff.r) return true;
    }
    return false;
  });
  if (hit >= 0) {
    state.found.add(hit);
    state.correctClicks += 1;
    state.streak += 1;
    state.bestStreak = Math.max(state.bestStreak, state.streak);
    const gained = 100 + 10 * (state.streak - 1);
    state.score += gained;
    state.lastFoundLabel = scene.diffs[hit].label;
    playFindChime();
    renderMarkers(state);
    renderHud(state);
    if (state.found.size === DIFFS_PER_LEVEL) completeLevel();
  } else {
    state.streak = 0;
    state.timeLeft = Math.max(0, state.timeLeft - 3);
    playWrongBuzz();
    renderWrongMark(state, x, y);
    renderHud(state);
    if (state.timeLeft === 0) timeUp();
  }
}

/** All eight found: time bonus, stars, fanfare, level-complete screen. */
function completeLevel() {
  stopTimer();
  const timeBonus = state.timeLeft * 5;
  state.score += timeBonus;
  state.levelScores[state.levelIndex] = state.score;
  state.totalScore += state.score;
  state.screen = SCREEN_LEVEL_DONE;
  playLevelFanfare();
  renderHud(state);
  showLevelCompleteScreen(state, timeBonus);
}

/** Move on to the next level, or the game-complete screen after the last. */
export function nextLevel() {
  playClickTick();
  if (state.levelIndex + 1 >= SCENES.length) {
    state.screen = SCREEN_GAME_DONE;
    showGameCompleteScreen(state);
  } else {
    startLevel(state.levelIndex + 1);
  }
}

/** Replay the current level from scratch. */
export function retryLevel() {
  playClickTick();
  startLevel(state.levelIndex);
}

/** Back to the start screen; totals reset. */
export function backToStart() {
  stopTimer();
  playClickTick();
  state.screen = SCREEN_START;
  state.totalScore = 0;
  state.levelScores = [];
  state.bestStreak = 0;
  state.clicks = 0;
  state.correctClicks = 0;
  showStartScreen(state);
}

/** Spend a hint: pulse a ring around one difference the player has not found. */
export function useHint() {
  if (state.screen !== SCREEN_PLAY || state.paused || state.hintsLeft <= 0) return;
  const scene = currentScene();
  const remaining = scene.diffs.map((_, i) => i).filter((i) => !state.found.has(i));
  if (remaining.length === 0) return;
  state.hintsLeft -= 1;
  state.hintTarget = remaining[Math.floor(Math.random() * remaining.length)];
  playHintShimmer();
  renderHintRing(state);
  renderHud(state);
  window.setTimeout(() => {
    if (state.hintTarget !== null) {
      state.hintTarget = null;
      renderMarkers(state);
    }
  }, 2600);
}

export function togglePause() {
  if (state.screen !== SCREEN_PLAY) return;
  state.paused = !state.paused;
  playClickTick();
  if (state.paused) showPausedScreen(state);
  else hideOverlay();
  renderHud(state);
}

export function toggleMute() {
  state.muted = !state.muted;
  setMuted(state.muted);
  if (!state.muted) playClickTick();
  renderHud(state);
}

export function toggleMagnifier() {
  state.magnifierOn = !state.magnifierOn;
  playClickTick();
  renderHud(state);
  renderPanels(state);
}

export function accuracy() {
  if (state.clicks === 0) return 100;
  return Math.round((state.correctClicks / state.clicks) * 100);
}

// ---- Screenshot staging ----------------------------------------------------
/**
 * Deterministic states for ?shot= URLs. Each one renders a real mid-game
 * frame (or the level-complete screen) and then sets window.__shotReady so
 * the capture script knows the frame is settled.
 */
export function stageShot(name) {
  state.shotMode = true;
  stopTimer();
  if (name === 'cover') {
    state.levelIndex = 0;
    state.found = new Set([0, 1, 2, 3]);
    state.score = 460;
    state.streak = 4;
    state.bestStreak = 4;
    state.timeLeft = 78;
    state.hintsLeft = 2;
    state.screen = SCREEN_PLAY;
  } else if (name === 'scene2') {
    state.levelIndex = 1;
    state.found = new Set([0, 1, 2]);
    state.score = 330;
    state.streak = 3;
    state.bestStreak = 3;
    state.timeLeft = 91;
    state.hintsLeft = 3;
    state.screen = SCREEN_PLAY;
  } else if (name === 'scene3') {
    state.levelIndex = 2;
    state.found = new Set([0, 1, 2, 3, 4]);
    state.score = 600;
    state.streak = 5;
    state.bestStreak = 5;
    state.timeLeft = 64;
    state.hintsLeft = 1;
    state.magnifierOn = true;
    state.screen = SCREEN_PLAY;
  } else if (name === 'victory') {
    state.levelIndex = 0;
    state.found = new Set([0, 1, 2, 3, 4, 5, 6, 7]);
    state.score = 850;
    state.totalScore = 850;
    state.streak = 8;
    state.bestStreak = 8;
    state.timeLeft = 78;
    state.hintsLeft = 2;
    state.screen = SCREEN_LEVEL_DONE;
    state.levelScores = [850];
  } else {
    return;
  }
  hideOverlay();
  renderAll(state);
  // Staged markers must be fully visible the instant __shotReady fires.
  // The pop entrance animation only advances while the compositor produces
  // frames, which an idle headless page may not do before the screenshot,
  // so a capture can catch the markers at opacity 0 (the committed cover
  // shipped that way while scene 3, captured later, showed them). Freeze
  // the staged markers at their final state; real gameplay finds still
  // animate, because renderMarkers creates fresh animated elements then.
  document.querySelectorAll('.found-mark-pop').forEach((el) => {
    el.style.animation = 'none';
  });
  if (name === 'victory') showLevelCompleteScreen(state, 390);
  if (name === 'scene3') {
    // Park the magnifier over an unfound difference on the right panel.
    window.setTimeout(() => showShotLens(state), 60);
  }
  window.__shotReady = true;
}

/** Boot: start screen, or a staged screenshot when ?shot= is present. */
export function initGame() {
  const params = new URLSearchParams(window.location.search);
  const shot = params.get('shot');
  if (shot) {
    stageShot(shot);
    return;
  }
  showStartScreen(state);
  renderAll(state);
}
