// Dapur Kilat — game state: orders, tray, plate, stations, and the fixed
// showcase scenes used for screenshots (?shot=cover|chop|serve|rush).

import {
  CHOP_MS,
  COOK_MS,
  BURN_MS,
  DISHES,
  DISH_ORDER,
  INGREDIENTS,
  MAX_HEARTS,
  ORDER_SPAWN_MS,
  PATIENCE_MS,
  SHIFT_SECONDS,
} from './config.js';

let nextOrderId = 1;

export function createItem(kind) {
  return { kind, stage: 'raw' };
}

export function itemLabel(item) {
  const base = INGREDIENTS[item.kind].name;
  if (item.stage === 'chopped') return `Chopped ${base}`;
  if (item.stage === 'cooked') return `Cooked ${base}`;
  if (item.stage === 'burnt') return `Burnt ${base}`;
  return base;
}

export function canChop(item) {
  return item.stage === 'raw' && INGREDIENTS[item.kind].chop;
}

export function canCook(item) {
  return (
    (item.stage === 'raw' && INGREDIENTS[item.kind].cook && !INGREDIENTS[item.kind].chop) ||
    (item.stage === 'chopped' && INGREDIENTS[item.kind].cook)
  );
}

function makeOrder(dishId) {
  return {
    id: nextOrderId++,
    dish: dishId,
    patience: 1,
    maxPatience: PATIENCE_MS,
  };
}

export function randomDish() {
  return DISH_ORDER[Math.floor(Math.random() * DISH_ORDER.length)];
}

export function createState() {
  return {
    screen: 'title', // title | playing | over
    frozen: false, // screenshot scenes freeze time
    timeLeft: SHIFT_SECONDS,
    elapsed: 0,
    level: 1,
    score: 0,
    coins: 0,
    combo: 0,
    bestCombo: 0,
    served: 0,
    lost: 0,
    hearts: MAX_HEARTS,
    orders: [],
    spawnIn: 2500,
    tray: [],
    plate: [],
    board: { item: null, t: 0, done: false },
    stove1: { item: null, t: 0, done: false, burnt: false },
    stove2: { item: null, t: 0, done: false, burnt: false },
    chef: { x: 640, y: 560, tx: 640, ty: 560 },
    message: '',
    messageT: 0,
    flash: null, // {kind: 'serve'|'error', t}
  };
}

export function startShift(state) {
  const fresh = createState();
  Object.assign(state, fresh, { screen: 'playing' });
  state.orders.push(makeOrder('nasgor'));
  state.orders.push(makeOrder('mie'));
}

// How much of an order the plate already covers, as [kind, stage, done] rows.
export function orderProgress(order, plate) {
  const remaining = plate.map((p) => `${p.kind}:${p.stage}`);
  return DISHES[order.dish].needs.map(([kind, stage]) => {
    const key = `${kind}:${stage}`;
    const i = remaining.indexOf(key);
    if (i >= 0) {
      remaining.splice(i, 1);
      return [kind, stage, true];
    }
    return [kind, stage, false];
  });
}

export function plateMatchesOrder(plate, order) {
  const rows = orderProgress(order, plate);
  const extra = plate.length - DISHES[order.dish].needs.length;
  return extra === 0 && rows.every((r) => r[2]);
}

export function matchingOrder(state) {
  return state.orders.find((o) => plateMatchesOrder(state.plate, o)) ?? null;
}

// One simulation step (dt in milliseconds). Frozen scenes skip this.
export function updateState(state, dt) {
  if (state.screen !== 'playing' || state.frozen) return;
  state.elapsed += dt;
  state.timeLeft -= dt / 1000;
  if (state.timeLeft <= 0) {
    state.timeLeft = 0;
    state.screen = 'over';
    return;
  }
  const level = 1 + Math.floor(state.elapsed / 45000);
  if (level !== state.level) state.level = level;

  // Order spawning.
  state.spawnIn -= dt;
  if (state.spawnIn <= 0) {
    if (state.orders.length < 4) state.orders.push(makeOrder(randomDish()));
    state.spawnIn = Math.max(6000, ORDER_SPAWN_MS - (state.level - 1) * 1500);
  }

  // Patience drains; an expired order costs a heart.
  for (let i = state.orders.length - 1; i >= 0; i--) {
    const o = state.orders[i];
    o.patience -= dt / (PATIENCE_MS - (state.level - 1) * 4000);
    if (o.patience <= 0) {
      state.orders.splice(i, 1);
      state.hearts -= 1;
      state.lost += 1;
      state.combo = 0;
      state.message = 'Order walked out!';
      state.messageT = 2000;
      if (state.hearts <= 0) {
        state.hearts = 0;
        state.screen = 'over';
        return;
      }
    }
  }

  // Chopping board.
  if (state.board.item) {
    state.board.t += dt;
    if (state.board.t >= CHOP_MS && !state.board.done) {
      state.board.done = true;
      state.board.item.stage = 'chopped';
      state.tray.push(state.board.item);
      state.board.item = null;
      state.message = 'Chopped!';
      state.messageT = 900;
    }
  }

  // Stoves: cook, then wait, then burn.
  for (const stove of [state.stove1, state.stove2]) {
    if (!stove.item) continue;
    stove.t += dt;
    if (stove.t >= COOK_MS && !stove.done) {
      stove.done = true;
      stove.item.stage = 'cooked';
    }
    if (stove.t >= COOK_MS + BURN_MS && !stove.burnt) {
      stove.burnt = true;
      stove.item.stage = 'burnt';
      state.message = 'Something burned!';
      state.messageT = 2000;
    }
  }

  if (state.messageT > 0) state.messageT -= dt;
  if (state.flash) {
    state.flash.t -= dt;
    if (state.flash.t <= 0) state.flash = null;
  }
}

// ---- Fixed showcase scenes for screenshots -------------------------------

function sceneOrder(dish, patience) {
  return { id: nextOrderId++, dish, patience, maxPatience: PATIENCE_MS };
}

export function loadScene(state, name) {
  const base = createState();
  Object.assign(state, base, { screen: 'playing', frozen: true });
  state.chef = { x: 470, y: 540, tx: 470, ty: 540 };
  if (name === 'cover') {
    state.timeLeft = 151;
    state.score = 145;
    state.coins = 145;
    state.combo = 3;
    state.bestCombo = 3;
    state.served = 4;
    state.orders = [sceneOrder('nasgor', 0.7), sceneOrder('mie', 0.5), sceneOrder('sate', 0.85)];
    state.tray = [createItem('chili'), createItem('rice')];
    state.tray[0].stage = 'chopped';
    state.plate = [createItem('rice'), createItem('egg')];
    state.plate[0].stage = 'cooked';
    state.plate[1].stage = 'cooked';
    state.board = { item: createItem('chicken'), t: CHOP_MS * 0.6, done: false };
    state.stove1 = { item: createItem('noodle'), t: COOK_MS * 0.5, done: false, burnt: false };
    state.stove2 = { item: null, t: 0, done: false, burnt: false };
  } else if (name === 'chop') {
    state.timeLeft = 132;
    state.score = 80;
    state.coins = 80;
    state.combo = 2;
    state.bestCombo = 2;
    state.served = 2;
    state.orders = [sceneOrder('mie', 0.8), sceneOrder('nasgor', 0.6)];
    state.tray = [createItem('egg'), createItem('chicken')];
    state.plate = [];
    state.board = { item: createItem('chili'), t: CHOP_MS * 0.7, done: false };
    state.stove1 = { item: null, t: 0, done: false, burnt: false };
    state.stove2 = { item: null, t: 0, done: false, burnt: false };
    state.chef = { x: 462, y: 512, tx: 462, ty: 512 };
  } else if (name === 'serve') {
    state.timeLeft = 118;
    state.score = 210;
    state.coins = 210;
    state.combo = 4;
    state.bestCombo = 4;
    state.served = 6;
    state.orders = [sceneOrder('nasgor', 0.8), sceneOrder('sate', 0.65)];
    state.tray = [];
    state.plate = [createItem('rice'), createItem('egg'), createItem('chili')];
    state.plate[0].stage = 'cooked';
    state.plate[1].stage = 'cooked';
    state.plate[2].stage = 'chopped';
    state.board = { item: null, t: 0, done: false };
    state.stove1 = { item: null, t: 0, done: false, burnt: false };
    state.stove2 = { item: null, t: 0, done: false, burnt: false };
    state.chef = { x: 964, y: 512, tx: 964, ty: 512 };
    state.message = 'Plate ready — serve it!';
    state.messageT = 999999;
  } else {
    // rush
    state.timeLeft = 64;
    state.score = 320;
    state.coins = 320;
    state.combo = 5;
    state.bestCombo = 5;
    state.served = 9;
    state.hearts = 2;
    state.orders = [
      sceneOrder('nasgor', 0.25),
      sceneOrder('mie', 0.4),
      sceneOrder('sate', 0.15),
      sceneOrder('nasgor', 0.6),
    ];
    state.tray = [createItem('chicken'), createItem('veg'), createItem('chili')];
    state.tray[0].stage = 'cooked';
    state.tray[1].stage = 'chopped';
    state.tray[2].stage = 'chopped';
    state.plate = [createItem('noodle')];
    state.plate[0].stage = 'cooked';
    state.board = { item: createItem('egg'), t: CHOP_MS * 0.4, done: false };
    state.stove1 = { item: createItem('rice'), t: COOK_MS * 0.8, done: false, burnt: false };
    state.stove2 = { item: createItem('chicken'), t: COOK_MS * 0.3, done: false, burnt: false };
    state.chef = { x: 700, y: 540, tx: 700, ty: 540 };
    state.message = 'Rush hour!';
    state.messageT = 999999;
  }
}
