// Dapur Kilat — configuration: dishes, recipes, stations, colors, timings.
// Everything the other modules need lives here so the rules of the kitchen
// are in one place and easy to tune.

export const CANVAS_W = 1280;
export const CANVAS_H = 720;
export const SHIFT_SECONDS = 180;
export const MAX_HEARTS = 3;
export const TRAY_MAX = 3;

export const CHOP_MS = 1200;
export const COOK_MS = 3000;
export const BURN_MS = 5000;
export const ORDER_SPAWN_MS = 14000;
export const PATIENCE_MS = 45000;
export const CHEF_SPEED = 460; // px per second

// An ingredient's journey: raw -> chopped (board) and/or raw -> cooked (stove).
export const INGREDIENTS = {
  rice: { name: 'Rice', short: 'Rice', color: '#f5f0e1', edge: '#d8cdb2', chop: false, cook: true },
  noodle: { name: 'Noodle', short: 'Noodle', color: '#f2c14e', edge: '#c99a2e', chop: false, cook: true },
  egg: { name: 'Egg', short: 'Egg', color: '#fff3b0', edge: '#d9c25a', chop: true, cook: true },
  chicken: { name: 'Chicken', short: 'Chicken', color: '#e07a5f', edge: '#b0543c', chop: true, cook: true },
  chili: { name: 'Chili', short: 'Chili', color: '#e63946', edge: '#a11f2b', chop: true, cook: false },
  veg: { name: 'Veg', short: 'Veg', color: '#70c24a', edge: '#4d8a2f', chop: true, cook: false },
};

export const BIN_ORDER = ['rice', 'noodle', 'egg', 'chicken', 'chili', 'veg'];

// A dish is a set of finished ingredients: [kind, stage] pairs.
export const DISHES = {
  nasgor: {
    name: 'Nasi Goreng',
    needs: [['rice', 'cooked'], ['egg', 'cooked'], ['chili', 'chopped']],
    reward: 25,
    color: '#f4a261',
  },
  mie: {
    name: 'Mie Goreng',
    needs: [['noodle', 'cooked'], ['chicken', 'cooked'], ['veg', 'chopped']],
    reward: 30,
    color: '#e9c46a',
  },
  sate: {
    name: 'Sate Ayam',
    needs: [['chicken', 'cooked'], ['chili', 'chopped']],
    reward: 20,
    color: '#e76f51',
  },
};

export const DISH_ORDER = ['nasgor', 'mie', 'sate'];

// Station rectangles (canvas coordinates) for drawing and hit-testing.
export const STATIONS = {
  bins: { x: 24, y: 192, w: 300, h: 214 },
  board: { x: 352, y: 300, w: 220, h: 132 },
  stove1: { x: 600, y: 300, w: 108, h: 120 },
  stove2: { x: 722, y: 300, w: 108, h: 120 },
  plate: { x: 866, y: 300, w: 196, h: 132 },
  serve: { x: 1096, y: 196, w: 160, h: 236 },
  trash: { x: 1096, y: 448, w: 160, h: 60 },
};

// Ingredient bin rects inside STATIONS.bins: 2 columns x 3 rows.
export function binRect(index) {
  const col = index % 2;
  const row = Math.floor(index / 2);
  return { x: STATIONS.bins.x + 4 + col * 148, y: STATIONS.bins.y + 6 + row * 68, w: 140, h: 60 };
}

export const COLORS = {
  wall: '#f7e8c9',
  wallEdge: '#e0c79b',
  floor: '#e9c795',
  floorLine: '#d9b47e',
  counter: '#b07d4f',
  counterDark: '#8a5a33',
  counterTop: '#d9a066',
  ticket: '#fff8e7',
  ticketEdge: '#d9c49a',
  ink: '#3b2a1a',
  muted: '#7a5c3e',
  teal: '#2a9d8f',
  tealDark: '#1f7a6e',
  gold: '#f4b942',
  red: '#e63946',
  green: '#43aa5b',
  cream: '#fff6e0',
  chef: '#ffffff',
  chefHat: '#f8f8f8',
  scarf: '#e63946',
};
