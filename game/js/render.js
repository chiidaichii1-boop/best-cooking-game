// Dapur Kilat — all canvas drawing: kitchen, order board, stations, chef,
// HUD, title and game-over screens. No images are loaded; every icon is
// drawn with canvas paths so the game works offline from its own files.

import {
  BIN_ORDER,
  BURN_MS,
  CANVAS_H,
  CANVAS_W,
  CHOP_MS,
  COLORS,
  COOK_MS,
  DISHES,
  INGREDIENTS,
  SHIFT_SECONDS,
  STATIONS,
  binRect,
} from './config.js';
import { itemLabel, matchingOrder, orderProgress } from './state.js';

const FONT = '"Trebuchet MS", "Segoe UI", sans-serif';

function rr(ctx, x, y, w, h, r) {
  const rad = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rad, y);
  ctx.arcTo(x + w, y, x + w, y + h, rad);
  ctx.arcTo(x + w, y + h, x, y + h, rad);
  ctx.arcTo(x, y + h, x, y, rad);
  ctx.arcTo(x, y, x + w, y, rad);
  ctx.closePath();
}

function text(ctx, s, x, y, size, color, weight = 'bold', align = 'left') {
  ctx.fillStyle = color;
  ctx.font = `${weight} ${size}px ${FONT}`;
  ctx.textAlign = align;
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(s, x, y);
}

function progressRing(ctx, x, y, r, frac, color) {
  ctx.lineWidth = 7;
  ctx.strokeStyle = 'rgba(0,0,0,0.18)';
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.stroke();
  if (frac > 0) {
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Math.min(1, frac));
    ctx.stroke();
  }
  ctx.lineWidth = 1;
}

// ---- Ingredient icons (drawn, never loaded) -------------------------------

export function drawIcon(ctx, kind, x, y, r) {
  const ing = INGREDIENTS[kind];
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = ing.color;
  ctx.strokeStyle = ing.edge;
  ctx.lineWidth = 2;
  if (kind === 'rice') {
    ctx.beginPath();
    ctx.arc(0, 2, r * 0.85, Math.PI, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-r * 0.85, 2);
    ctx.lineTo(r * 0.85, 2);
    ctx.lineTo(r * 0.6, r * 0.75);
    ctx.lineTo(-r * 0.6, r * 0.75);
    ctx.closePath();
    ctx.fillStyle = '#b07d4f';
    ctx.fill();
  } else if (kind === 'noodle') {
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.9, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = '#a87b1f';
    ctx.lineWidth = 2.5;
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath();
      ctx.moveTo(-r * 0.55, i * r * 0.35);
      ctx.bezierCurveTo(-r * 0.2, i * r * 0.35 - r * 0.3, r * 0.2, i * r * 0.35 + r * 0.3, r * 0.55, i * r * 0.35);
      ctx.stroke();
    }
  } else if (kind === 'egg') {
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 0.95, r * 0.8, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#fffdf5';
    ctx.fill();
    ctx.strokeStyle = '#d9c25a';
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.42, 0, Math.PI * 2);
    ctx.fillStyle = '#f4b942';
    ctx.fill();
  } else if (kind === 'chicken') {
    ctx.beginPath();
    ctx.ellipse(-r * 0.1, -r * 0.1, r * 0.75, r * 0.55, -0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = '#f5f0e1';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(r * 0.45, r * 0.35);
    ctx.lineTo(r * 0.9, r * 0.8);
    ctx.stroke();
    ctx.fillStyle = '#f5f0e1';
    ctx.beginPath();
    ctx.arc(r * 0.95, r * 0.85, r * 0.18, 0, Math.PI * 2);
    ctx.arc(r * 0.75, r * 0.95, r * 0.18, 0, Math.PI * 2);
    ctx.fill();
  } else if (kind === 'chili') {
    ctx.beginPath();
    ctx.moveTo(-r * 0.7, -r * 0.2);
    ctx.quadraticCurveTo(0, -r * 1.1, r * 0.75, -r * 0.35);
    ctx.quadraticCurveTo(r * 0.95, r * 0.1, r * 0.5, r * 0.45);
    ctx.quadraticCurveTo(0, r * 0.75, -r * 0.7, -r * 0.2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = '#4d8a2f';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(r * 0.7, -r * 0.35);
    ctx.quadraticCurveTo(r * 1.05, -r * 0.6, r * 0.95, -r * 0.9);
    ctx.stroke();
  } else {
    // veg: three leaves
    for (let i = -1; i <= 1; i++) {
      ctx.save();
      ctx.rotate(i * 0.5);
      ctx.beginPath();
      ctx.ellipse(0, -r * 0.35, r * 0.34, r * 0.62, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
  }
  ctx.restore();
}

function drawHeart(ctx, x, y, r, filled) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(r / 10, r / 10);
  ctx.beginPath();
  ctx.moveTo(0, 8);
  ctx.bezierCurveTo(-11, -2, -7, -10, 0, -4);
  ctx.bezierCurveTo(7, -10, 11, -2, 0, 8);
  ctx.closePath();
  ctx.fillStyle = filled ? COLORS.red : 'rgba(0,0,0,0.15)';
  ctx.fill();
  ctx.restore();
}

function drawCheck(ctx, x, y, r) {
  ctx.fillStyle = COLORS.green;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(x - r * 0.45, y);
  ctx.lineTo(x - r * 0.1, y + r * 0.4);
  ctx.lineTo(x + r * 0.5, y - r * 0.4);
  ctx.stroke();
  ctx.lineWidth = 1;
}

// ---- Top bar and order board ----------------------------------------------

function drawTopBar(ctx, state) {
  ctx.fillStyle = COLORS.counterDark;
  ctx.fillRect(0, 0, CANVAS_W, 56);
  text(ctx, 'DAPUR KILAT', 24, 37, 26, '#ffe9b0');
  text(ctx, 'street-food kitchen rush', 218, 36, 14, '#e8c89a', 'normal');
  // Shift timer.
  const mm = Math.floor(state.timeLeft / 60);
  const ss = Math.floor(state.timeLeft % 60);
  const label = `${mm}:${String(ss).padStart(2, '0')}`;
  const frac = state.timeLeft / SHIFT_SECONDS;
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  rr(ctx, 520, 14, 240, 28, 14);
  ctx.fill();
  ctx.fillStyle = frac < 0.25 ? COLORS.red : COLORS.gold;
  rr(ctx, 522, 16, 236 * Math.max(0, frac), 24, 12);
  ctx.fill();
  text(ctx, label, 640, 35, 18, '#fff', 'bold', 'center');
  text(ctx, `SCORE ${state.score}`, 820, 36, 17, '#fff');
  text(ctx, `COINS ${state.coins}`, 950, 36, 17, COLORS.gold);
  for (let i = 0; i < 3; i++) drawHeart(ctx, 1105 + i * 30, 30, 11, i < state.hearts);
  text(ctx, `LV ${state.level}`, 1205, 36, 16, '#e8c89a', 'bold', 'center');
}

function drawOrders(ctx, state) {
  text(ctx, 'ORDER BOARD', 24, 84, 13, COLORS.muted);
  const match = matchingOrder(state);
  for (let i = 0; i < 4; i++) {
    const x = 24 + i * 308;
    const y = 92;
    const order = state.orders[i];
    if (!order) {
      ctx.strokeStyle = 'rgba(122,92,62,0.4)';
      ctx.setLineDash([6, 6]);
      ctx.lineWidth = 2;
      rr(ctx, x, y, 300, 84, 10);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.lineWidth = 1;
      text(ctx, 'waiting for orders…', x + 150, y + 48, 14, 'rgba(122,92,62,0.6)', 'normal', 'center');
      continue;
    }
    const dish = DISHES[order.dish];
    const isMatch = match !== null && match.id === order.id;
    ctx.fillStyle = isMatch ? '#fff3c4' : COLORS.ticket;
    rr(ctx, x, y, 300, 84, 10);
    ctx.fill();
    ctx.strokeStyle = isMatch ? COLORS.gold : COLORS.ticketEdge;
    ctx.lineWidth = isMatch ? 3 : 1.5;
    ctx.stroke();
    ctx.lineWidth = 1;
    text(ctx, dish.name, x + 12, y + 22, 17, COLORS.ink);
    text(ctx, `${dish.reward}c`, x + 288, y + 22, 15, '#b8860b', 'bold', 'right');
    const rows = orderProgress(order, state.plate);
    rows.forEach(([kind, stage, done], j) => {
      const cx = x + 30 + j * 92;
      drawIcon(ctx, kind, cx, y + 44, 13);
      if (done) drawCheck(ctx, cx + 11, y + 32, 7);
      else text(ctx, stage, cx, y + 62, 9, COLORS.muted, 'normal', 'center');
    });
    const pw = 276;
    const pf = Math.max(0, order.patience);
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.fillRect(x + 12, y + 76, pw, 5);
    ctx.fillStyle = pf > 0.5 ? COLORS.green : pf > 0.25 ? COLORS.gold : COLORS.red;
    ctx.fillRect(x + 12, y + 76, pw * pf, 5);
  }
}

// ---- Kitchen stations ------------------------------------------------------

function drawBins(ctx) {
  text(ctx, 'INGREDIENTS', STATIONS.bins.x + 4, STATIONS.bins.y - 8, 13, COLORS.muted);
  BIN_ORDER.forEach((kind, i) => {
    const r = binRect(i);
    ctx.fillStyle = COLORS.counterTop;
    rr(ctx, r.x, r.y, r.w, r.h, 10);
    ctx.fill();
    ctx.strokeStyle = COLORS.counterDark;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.lineWidth = 1;
    drawIcon(ctx, kind, r.x + 30, r.y + 30, 20);
    text(ctx, INGREDIENTS[kind].name, r.x + 58, r.y + 26, 15, COLORS.ink);
    text(ctx, INGREDIENTS[kind].chop && INGREDIENTS[kind].cook ? 'chop + cook' : INGREDIENTS[kind].chop ? 'chop' : 'cook', r.x + 58, r.y + 46, 11, COLORS.muted, 'normal');
    ctx.fillStyle = COLORS.tealDark;
    ctx.beginPath();
    ctx.arc(r.x + r.w - 14, r.y + 14, 10, 0, Math.PI * 2);
    ctx.fill();
    text(ctx, String(i + 1), r.x + r.w - 14, r.y + 18, 12, '#fff', 'bold', 'center');
  });
}

function drawBoard(ctx, state) {
  const b = STATIONS.board;
  text(ctx, 'CHOPPING BOARD', b.x + 4, b.y - 8, 13, COLORS.muted);
  ctx.fillStyle = '#c98f4e';
  rr(ctx, b.x, b.y, b.w, b.h, 12);
  ctx.fill();
  ctx.strokeStyle = '#8a5a33';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.lineWidth = 1;
  if (state.board.item) {
    drawIcon(ctx, state.board.item.kind, b.x + b.w / 2, b.y + b.h / 2 - 6, 26);
    const frac = Math.min(1, state.board.t / CHOP_MS);
    progressRing(ctx, b.x + b.w / 2, b.y + b.h / 2 - 6, 38, frac, COLORS.teal);
    text(ctx, 'CHOPPING…', b.x + b.w / 2, b.y + b.h - 12, 12, '#5d3a1a', 'bold', 'center');
  } else {
    text(ctx, 'click to chop', b.x + b.w / 2, b.y + b.h / 2 + 5, 14, '#5d3a1a', 'normal', 'center');
  }
}

function drawStove(ctx, state, which) {
  const s = which === 2 ? state.stove2 : state.stove1;
  const r = which === 2 ? STATIONS.stove2 : STATIONS.stove1;
  if (which === 1) text(ctx, 'STOVES', r.x + 4, r.y - 8, 13, COLORS.muted);
  ctx.fillStyle = '#5b4636';
  rr(ctx, r.x, r.y, r.w, r.h, 10);
  ctx.fill();
  ctx.strokeStyle = '#3b2a1a';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.lineWidth = 1;
  // Burner.
  ctx.fillStyle = s.item ? '#ff9f43' : '#3a3a3a';
  ctx.beginPath();
  ctx.arc(r.x + r.w / 2, r.y + 78, 26, 0, Math.PI * 2);
  ctx.fill();
  if (s.item) {
    // Pot.
    ctx.fillStyle = s.burnt ? '#222' : '#cfd8dc';
    rr(ctx, r.x + 22, r.y + 18, r.w - 44, 44, 8);
    ctx.fill();
    ctx.strokeStyle = '#78909c';
    ctx.stroke();
    drawIcon(ctx, s.item.kind, r.x + r.w / 2, r.y + 40, 15);
    const frac = Math.min(1, s.t / COOK_MS);
    progressRing(ctx, r.x + r.w / 2, r.y + 40, 30, frac, s.done ? COLORS.green : '#ff9f43');
    if (s.done && !s.burnt) text(ctx, 'READY', r.x + r.w / 2, r.y + r.h - 8, 11, '#7dff9e', 'bold', 'center');
    if (s.burnt) text(ctx, 'BURNT!', r.x + r.w / 2, r.y + r.h - 8, 11, '#ff8a80', 'bold', 'center');
  } else {
    text(ctx, 'click to cook', r.x + r.w / 2, r.y + r.h / 2 + 4, 12, '#d8cdb2', 'normal', 'center');
  }
}

function drawPlateStation(ctx, state) {
  const p = STATIONS.plate;
  const match = matchingOrder(state);
  text(ctx, 'PLATING', p.x + 4, p.y - 8, 13, COLORS.muted);
  ctx.fillStyle = match ? '#fff3c4' : COLORS.counterTop;
  rr(ctx, p.x, p.y, p.w, p.h, 12);
  ctx.fill();
  ctx.strokeStyle = match ? COLORS.gold : COLORS.counterDark;
  ctx.lineWidth = match ? 3 : 2;
  ctx.stroke();
  ctx.lineWidth = 1;
  ctx.fillStyle = '#fffdf5';
  ctx.beginPath();
  ctx.ellipse(p.x + p.w / 2, p.y + p.h / 2 - 4, 78, 44, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#d9c49a';
  ctx.stroke();
  state.plate.forEach((item, i) => {
    const cx = p.x + p.w / 2 - ((state.plate.length - 1) * 34) / 2 + i * 34;
    drawIcon(ctx, item.kind, cx, p.y + p.h / 2 - 4, 16);
  });
  if (state.plate.length === 0) text(ctx, 'click to plate', p.x + p.w / 2, p.y + p.h / 2, 13, '#7a5c3e', 'normal', 'center');
  if (match) text(ctx, `${DISHES[match.dish].name.toUpperCase()} READY!`, p.x + p.w / 2, p.y + p.h - 10, 13, '#8a6d00', 'bold', 'center');
}

function drawServe(ctx, state) {
  const s = STATIONS.serve;
  const match = matchingOrder(state);
  text(ctx, 'SERVING WINDOW', s.x + 4, s.y - 8, 13, COLORS.muted);
  ctx.fillStyle = match ? '#ffe9a8' : '#e8d5b0';
  rr(ctx, s.x, s.y, s.w, s.h, 12);
  ctx.fill();
  ctx.strokeStyle = match ? COLORS.gold : '#b89b6a';
  ctx.lineWidth = match ? 3 : 2;
  ctx.stroke();
  ctx.lineWidth = 1;
  // Striped awning.
  for (let i = 0; i < 5; i++) {
    ctx.fillStyle = i % 2 === 0 ? COLORS.red : '#fff6e0';
    ctx.fillRect(s.x + 8 + i * 30, s.y + 10, 30, 22);
  }
  ctx.fillStyle = '#3b2a1a';
  ctx.fillRect(s.x + 14, s.y + 96, s.w - 28, 10);
  // Bell.
  ctx.fillStyle = COLORS.gold;
  ctx.beginPath();
  ctx.arc(s.x + s.w / 2, s.y + 150, 22, Math.PI, 0);
  ctx.closePath();
  ctx.fill();
  ctx.fillRect(s.x + s.w / 2 - 26, s.y + 148, 52, 6);
  text(ctx, 'SERVE', s.x + s.w / 2, s.y + 205, 20, match ? '#8a6d00' : COLORS.ink, 'bold', 'center');
  if (match) text(ctx, 'ding the bell!', s.x + s.w / 2, s.y + 226, 12, '#8a6d00', 'normal', 'center');
}

function drawTrash(ctx) {
  const t = STATIONS.trash;
  ctx.fillStyle = '#9aa0a6';
  rr(ctx, t.x + 52, t.y + 8, 56, 44, 6);
  ctx.fill();
  ctx.strokeStyle = '#5f6368';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.lineWidth = 1;
  ctx.fillStyle = '#5f6368';
  ctx.fillRect(t.x + 46, t.y + 2, 68, 8);
  text(ctx, 'TRASH', t.x + 80, t.y + 34, 12, '#fff', 'bold', 'center');
}

function drawChef(ctx, state) {
  const { x, y } = state.chef;
  ctx.save();
  ctx.translate(x, y);
  // Body / apron.
  ctx.fillStyle = COLORS.chef;
  ctx.beginPath();
  ctx.ellipse(0, -18, 20, 24, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#cfd8dc';
  ctx.stroke();
  // Scarf.
  ctx.fillStyle = COLORS.scarf;
  ctx.fillRect(-20, -38, 40, 8);
  // Head.
  ctx.fillStyle = '#f2c89b';
  ctx.beginPath();
  ctx.arc(0, -50, 15, 0, Math.PI * 2);
  ctx.fill();
  // Toque.
  ctx.fillStyle = COLORS.chefHat;
  rr(ctx, -16, -78, 32, 18, 8);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(-10, -78, 8, 0, Math.PI * 2);
  ctx.arc(0, -82, 9, 0, Math.PI * 2);
  ctx.arc(10, -78, 8, 0, Math.PI * 2);
  ctx.fill();
  // Face.
  ctx.fillStyle = '#3b2a1a';
  ctx.beginPath();
  ctx.arc(-5, -52, 1.8, 0, Math.PI * 2);
  ctx.arc(5, -52, 1.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#3b2a1a';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(0, -46, 5, 0.15 * Math.PI, 0.85 * Math.PI);
  ctx.stroke();
  ctx.restore();
}

function drawTray(ctx, state) {
  ctx.fillStyle = 'rgba(59,42,26,0.9)';
  ctx.fillRect(0, 648, CANVAS_W, 72);
  text(ctx, 'IN HAND', 24, 690, 14, '#e8c89a');
  for (let i = 0; i < 3; i++) {
    const x = 120 + i * 64;
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    rr(ctx, x, 660, 52, 48, 8);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.35)';
    ctx.stroke();
    const item = state.tray[i];
    if (item) {
      drawIcon(ctx, item.kind, x + 26, 679, 14);
      text(ctx, item.stage === 'raw' ? '' : item.stage, x + 26, 704, 8, '#ffe9b0', 'normal', 'center');
    }
  }
  const hint = state.messageT > 0 && state.message ? state.message : 'Click a station to use it  ·  1-6 grab  ·  B chop  ·  C cook  ·  P plate  ·  S serve  ·  T trash';
  text(ctx, hint, 640, 690, 15, state.messageT > 0 && state.message ? '#ffe9a8' : '#d8cdb2', 'normal', 'center');
}

function drawFlash(ctx, state) {
  if (!state.flash) return;
  ctx.save();
  ctx.globalAlpha = Math.min(1, state.flash.t / 700);
  ctx.fillStyle = '#fff3c4';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  ctx.restore();
}

function drawTitle(ctx) {
  ctx.fillStyle = 'rgba(59,42,26,0.72)';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  ctx.fillStyle = COLORS.cream;
  rr(ctx, 290, 110, 700, 470, 18);
  ctx.fill();
  ctx.strokeStyle = COLORS.gold;
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.lineWidth = 1;
  text(ctx, 'DAPUR KILAT', 640, 190, 54, COLORS.ink, 'bold', 'center');
  text(ctx, 'Indonesian street-food kitchen rush', 640, 224, 19, COLORS.muted, 'normal', 'center');
  const lines = [
    'Orders land on the board — grab ingredients, chop, cook, plate, serve.',
    'Chopped chili, cooked rice, cooked egg  →  Nasi Goreng (25c)',
    'Cooked noodle, cooked chicken, chopped veg  →  Mie Goreng (30c)',
    'Cooked chicken, chopped chili  →  Sate Ayam (20c)',
    'Serve fast for tips. Let an order walk out and you lose a heart.',
    'Survive the 3-minute shift. 3 hearts. Combos pay extra.',
  ];
  lines.forEach((l, i) => text(ctx, l, 640, 272 + i * 30, 16, COLORS.ink, i === 0 ? 'bold' : 'normal', 'center'));
  text(ctx, 'CLICK TO START', 640, 500, 24, COLORS.tealDark, 'bold', 'center');
  text(ctx, 'Mouse to play  ·  1-6 grab  ·  B chop  ·  C cook  ·  P plate  ·  S serve', 640, 536, 14, COLORS.muted, 'normal', 'center');
}

function drawGameOver(ctx, state) {
  ctx.fillStyle = 'rgba(59,42,26,0.72)';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  ctx.fillStyle = COLORS.cream;
  rr(ctx, 340, 150, 600, 380, 18);
  ctx.fill();
  ctx.strokeStyle = COLORS.gold;
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.lineWidth = 1;
  const title = state.hearts <= 0 ? 'OUT OF HEARTS!' : 'SHIFT OVER!';
  text(ctx, title, 640, 230, 44, COLORS.ink, 'bold', 'center');
  text(ctx, `Score ${state.score}   ·   Coins ${state.coins}`, 640, 290, 22, COLORS.ink, 'bold', 'center');
  text(ctx, `Dishes served: ${state.served}    Best combo: x${state.bestCombo}`, 640, 330, 18, COLORS.muted, 'normal', 'center');
  text(ctx, `Orders lost: ${state.lost}`, 640, 362, 18, COLORS.muted, 'normal', 'center');
  text(ctx, 'CLICK OR PRESS SPACE TO PLAY AGAIN', 640, 450, 20, COLORS.tealDark, 'bold', 'center');
}

// ---- Full frame ------------------------------------------------------------

export function drawScene(ctx, state) {
  // Walls and floor.
  ctx.fillStyle = COLORS.wall;
  ctx.fillRect(0, 0, CANVAS_W, 168);
  ctx.fillStyle = COLORS.wallEdge;
  ctx.fillRect(0, 164, CANVAS_W, 4);
  ctx.fillStyle = COLORS.floor;
  ctx.fillRect(0, 168, CANVAS_W, 480);
  ctx.strokeStyle = COLORS.floorLine;
  ctx.lineWidth = 2;
  for (let y = 220; y < 648; y += 64) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(CANVAS_W, y);
    ctx.stroke();
  }
  ctx.lineWidth = 1;

  drawTopBar(ctx, state);
  drawOrders(ctx, state);
  drawBins(ctx);
  drawBoard(ctx, state);
  drawStove(ctx, state, 1);
  drawStove(ctx, state, 2);
  drawPlateStation(ctx, state);
  drawServe(ctx, state);
  drawTrash(ctx);
  drawChef(ctx, state);
  drawTray(ctx, state);
  drawFlash(ctx, state);
  if (state.screen === 'title') drawTitle(ctx);
  if (state.screen === 'over') drawGameOver(ctx, state);
}

export { itemLabel };
