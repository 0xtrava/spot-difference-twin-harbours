// input.js — mouse clicks on the panels, keyboard play, the magnifier lens
// and the delegated buttons. Converts every click into scene coordinates and
// hands it to game.js; nothing here owns game state.

import {
  state, checkSceneClick, useHint, togglePause, toggleMute, toggleMagnifier,
  startLevel, nextLevel, retryLevel, backToStart,
} from './game.js';
import { positionLens, hideLens } from './render.js';

const CROSSHAIR_STEP = 24;

function sceneCoordsFromEvent(panelEl, event) {
  const rect = panelEl.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * 1000;
  const y = ((event.clientY - rect.top) / rect.height) * 600;
  return { x, y, panelEl };
}

function handlePanelClick(event) {
  const panelEl = event.currentTarget;
  const { x, y } = sceneCoordsFromEvent(panelEl, event);
  checkSceneClick(x, y);
}

function handleButtonAction(event) {
  const btn = event.target.closest('[data-action]');
  if (!btn) return;
  const action = btn.dataset.action;
  if (action === 'start-level') startLevel(Number(btn.dataset.level));
  else if (action === 'next-level') nextLevel();
  else if (action === 'retry-level') retryLevel();
  else if (action === 'back-start') backToStart();
  else if (action === 'hint') useHint();
  else if (action === 'pause') togglePause();
  else if (action === 'mute') toggleMute();
  else if (action === 'magnifier') toggleMagnifier();
}

function crosshairPosition() {
  const el = document.getElementById('crosshair');
  if (!el) return null;
  const stage = document.getElementById('stage');
  const stageRect = stage.getBoundingClientRect();
  const rect = el.getBoundingClientRect();
  return {
    x: rect.left + rect.width / 2 - stageRect.left,
    y: rect.top + rect.height / 2 - stageRect.top,
    stageRect,
  };
}

function moveCrosshair(dx, dy) {
  const el = document.getElementById('crosshair');
  const stage = document.getElementById('stage');
  if (!el || !stage) return;
  const stageRect = stage.getBoundingClientRect();
  const rect = el.getBoundingClientRect();
  let cx = rect.left + rect.width / 2 + dx;
  let cy = rect.top + rect.height / 2 + dy;
  cx = Math.max(stageRect.left, Math.min(stageRect.right, cx));
  cy = Math.max(stageRect.top, Math.min(stageRect.bottom, cy));
  el.style.display = 'block';
  el.style.left = `${cx - stageRect.left}px`;
  el.style.top = `${cy - stageRect.top}px`;
}

function checkCrosshair() {
  const pos = crosshairPosition();
  if (!pos) return;
  const stage = document.getElementById('stage');
  const panels = [document.getElementById('panel-left'), document.getElementById('panel-right')];
  for (const panel of panels) {
    if (!panel) continue;
    const rect = panel.getBoundingClientRect();
    const stageRect = stage.getBoundingClientRect();
    const clientX = pos.x + stageRect.left;
    const clientY = pos.y + stageRect.top;
    if (clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom) {
      const x = ((clientX - rect.left) / rect.width) * 1000;
      const y = ((clientY - rect.top) / rect.height) * 600;
      checkSceneClick(x, y);
      return;
    }
  }
}

function handleKeyDown(event) {
  if (state.screen !== 'play') {
    if (event.key === 'Enter' && state.screen === 'start') {
      startLevel(0);
    }
    return;
  }
  if (event.key === 'ArrowLeft') { moveCrosshair(-CROSSHAIR_STEP, 0); event.preventDefault(); }
  else if (event.key === 'ArrowRight') { moveCrosshair(CROSSHAIR_STEP, 0); event.preventDefault(); }
  else if (event.key === 'ArrowUp') { moveCrosshair(0, -CROSSHAIR_STEP); event.preventDefault(); }
  else if (event.key === 'ArrowDown') { moveCrosshair(0, CROSSHAIR_STEP); event.preventDefault(); }
  else if (event.key === 'Enter' || event.key === ' ') { checkCrosshair(); event.preventDefault(); }
  else if (event.key === 'h' || event.key === 'H') useHint();
  else if (event.key === 'm' || event.key === 'M') toggleMagnifier();
  else if (event.key === 'p' || event.key === 'P' || event.key === 'Escape') togglePause();
}

function handlePanelMouseMove(event) {
  if (!state.magnifierOn || state.screen !== 'play' || state.paused) {
    hideLens();
    return;
  }
  positionLens(state, event.currentTarget, event.clientX, event.clientY);
}

function handlePanelMouseLeave() {
  hideLens();
}

export function attachInput() {
  document.addEventListener('click', handleButtonAction);
  for (const id of ['panel-left', 'panel-right']) {
    const panel = document.getElementById(id);
    if (!panel) continue;
    panel.addEventListener('click', handlePanelClick);
    panel.addEventListener('mousemove', handlePanelMouseMove);
    panel.addEventListener('mouseleave', handlePanelMouseLeave);
  }
  document.addEventListener('keydown', handleKeyDown);
}
