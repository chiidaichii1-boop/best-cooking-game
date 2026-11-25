// Dapur Kilat — input: mouse clicks on stations and keyboard shortcuts.
// Clicking a station both walks the chef there and uses it at once, so the
// kitchen answers immediately while the chef catches up visually.

import { BIN_ORDER, STATIONS, binRect } from './config.js';
import { grabIngredient, say, useBoard, usePlate, useServe, useStove, useTrash } from './actions.js';
import { startShift } from './state.js';
import { initAudio, sfx, toggleMute } from './audio.js';

function inside(x, y, r) {
  return x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;
}

export function handleClick(state, x, y) {
  initAudio();
  if (state.screen === 'title') {
    startShift(state);
    sfx('start');
    return;
  }
  if (state.screen === 'over') {
    startShift(state);
    sfx('start');
    return;
  }
  if (state.frozen) return;

  // Ingredient bins.
  for (let i = 0; i < BIN_ORDER.length; i++) {
    const r = binRect(i);
    if (inside(x, y, r)) {
      state.chef.tx = r.x + r.w / 2;
      state.chef.ty = r.y + r.h + 90;
      grabIngredient(state, i);
      return;
    }
  }
  if (inside(x, y, STATIONS.board)) {
    state.chef.tx = STATIONS.board.x + STATIONS.board.w / 2;
    state.chef.ty = STATIONS.board.y + STATIONS.board.h + 80;
    useBoard(state);
    return;
  }
  if (inside(x, y, STATIONS.stove1)) {
    state.chef.tx = STATIONS.stove1.x + STATIONS.stove1.w / 2;
    state.chef.ty = STATIONS.stove1.y + STATIONS.stove1.h + 80;
    useStove(state, 1);
    return;
  }
  if (inside(x, y, STATIONS.stove2)) {
    state.chef.tx = STATIONS.stove2.x + STATIONS.stove2.w / 2;
    state.chef.ty = STATIONS.stove2.y + STATIONS.stove2.h + 80;
    useStove(state, 2);
    return;
  }
  if (inside(x, y, STATIONS.plate)) {
    state.chef.tx = STATIONS.plate.x + STATIONS.plate.w / 2;
    state.chef.ty = STATIONS.plate.y + STATIONS.plate.h + 80;
    usePlate(state);
    return;
  }
  if (inside(x, y, STATIONS.serve)) {
    state.chef.tx = STATIONS.serve.x + STATIONS.serve.w / 2;
    state.chef.ty = STATIONS.serve.y + STATIONS.serve.h + 60;
    useServe(state);
    return;
  }
  if (inside(x, y, STATIONS.trash)) {
    state.chef.tx = STATIONS.trash.x + STATIONS.trash.w / 2;
    state.chef.ty = STATIONS.trash.y + STATIONS.trash.h + 60;
    useTrash(state);
    return;
  }
  // Clicking the open floor just walks the chef there.
  state.chef.tx = x;
  state.chef.ty = Math.min(630, Math.max(470, y));
}

export function handleKey(state, key) {
  initAudio();
  if (key === ' ') {
    if (state.screen === 'title' || state.screen === 'over') {
      startShift(state);
      sfx('start');
    }
    return;
  }
  if (key === 'm' || key === 'M') {
    const muted = toggleMute();
    say(state, muted ? 'Sound off' : 'Sound on');
    return;
  }
  if (state.screen !== 'playing' || state.frozen) return;
  if (key >= '1' && key <= '6') {
    grabIngredient(state, Number(key) - 1);
    return;
  }
  if (key === 'b' || key === 'B') useBoard(state);
  else if (key === 'c' || key === 'C') useStove(state, 1);
  else if (key === 'p' || key === 'P') usePlate(state);
  else if (key === 's' || key === 'S') useServe(state);
  else if (key === 't' || key === 'T') useTrash(state);
}
