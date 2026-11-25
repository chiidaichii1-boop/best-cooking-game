// Dapur Kilat — boot and game loop. Runs the kitchen: title screen, the
// 3-minute shift, game over, and the frozen ?shot= showcase scenes used for
// screenshots (cover, chop, serve, rush).

import { CANVAS_H, CANVAS_W, CHEF_SPEED } from './config.js';
import { createState, loadScene, updateState } from './state.js';
import { drawScene } from './render.js';
import { handleClick, handleKey } from './input.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const state = createState();

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
if (shot) {
  loadScene(state, ['cover', 'chop', 'serve', 'rush'].includes(shot) ? shot : 'cover');
}

function toCanvasCoords(event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((event.clientX - rect.left) / rect.width) * CANVAS_W,
    y: ((event.clientY - rect.top) / rect.height) * CANVAS_H,
  };
}

canvas.addEventListener('pointerdown', (event) => {
  const p = toCanvasCoords(event);
  handleClick(state, p.x, p.y);
});

window.addEventListener('keydown', (event) => {
  if (event.key === ' ') event.preventDefault();
  handleKey(state, event.key);
});

let last = performance.now();

function frame(now) {
  const dt = Math.min(100, now - last);
  last = now;
  if (!state.frozen) {
    updateState(state, dt);
    // Chef walks toward the clicked target.
    const dx = state.chef.tx - state.chef.x;
    const dy = state.chef.ty - state.chef.y;
    const dist = Math.hypot(dx, dy);
    const step = (CHEF_SPEED * dt) / 1000;
    if (dist > step) {
      state.chef.x += (dx / dist) * step;
      state.chef.y += (dy / dist) * step;
    } else {
      state.chef.x = state.chef.tx;
      state.chef.y = state.chef.ty;
    }
  }
  drawScene(ctx, state);
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
