// Dapur Kilat — player actions: grabbing ingredients, chopping, cooking,
// plating and serving. Each action answers at once (sound + message) so the
// kitchen feels responsive even while a timer is running.

import { BIN_ORDER, CHOP_MS, COOK_MS, DISHES, INGREDIENTS, TRAY_MAX } from './config.js';
import { canChop, canCook, createItem, itemLabel, matchingOrder } from './state.js';
import { sfx } from './audio.js';

export function say(state, text, ms = 1600) {
  state.message = text;
  state.messageT = ms;
}

export function grabIngredient(state, index) {
  if (state.screen !== 'playing' || state.frozen) return;
  const kind = BIN_ORDER[index];
  if (!kind) return;
  if (state.tray.length >= TRAY_MAX) {
    say(state, 'Hands full — plate or trash something first');
    sfx('error');
    return;
  }
  state.tray.push(createItem(kind));
  sfx('grab');
}

export function useBoard(state) {
  if (state.screen !== 'playing' || state.frozen) return;
  if (state.board.item) {
    say(state, state.board.done ? 'Chopping done — it is back in your hands' : 'Still chopping…');
    return;
  }
  const i = state.tray.findIndex((it) => canChop(it));
  if (i < 0) {
    say(state, 'Bring something to chop: egg, chicken, chili or veg');
    sfx('error');
    return;
  }
  state.board.item = state.tray.splice(i, 1)[0];
  state.board.t = 0;
  state.board.done = false;
  sfx('chop');
}

export function useStove(state, which) {
  if (state.screen !== 'playing' || state.frozen) return;
  const stove = which === 2 ? state.stove2 : state.stove1;
  if (!stove.item) {
    const i = state.tray.findIndex((it) => canCook(it));
    if (i < 0) {
      say(state, 'Bring something to cook: rice, noodle, chopped egg or chicken');
      sfx('error');
      return;
    }
    stove.item = state.tray.splice(i, 1)[0];
    stove.t = 0;
    stove.done = false;
    stove.burnt = false;
    sfx('sizzle');
    return;
  }
  if (stove.burnt) {
    say(state, 'Burnt! Cleared to the bin');
    stove.item = null;
    stove.t = 0;
    stove.done = false;
    stove.burnt = false;
    sfx('trash');
    return;
  }
  if (!stove.done) {
    say(state, 'Still cooking… watch the ring');
    return;
  }
  if (state.tray.length >= TRAY_MAX) {
    say(state, 'Hands full — plate something first');
    sfx('error');
    return;
  }
  state.tray.push(stove.item);
  stove.item = null;
  stove.t = 0;
  stove.done = false;
  sfx('grab');
}

export function usePlate(state) {
  if (state.screen !== 'playing' || state.frozen) return;
  if (state.tray.length === 0) {
    say(state, 'Nothing in hand to plate');
    sfx('error');
    return;
  }
  if (state.plate.length >= 4) {
    say(state, 'Plate is full — serve it or trash it');
    sfx('error');
    return;
  }
  const item = state.tray.shift();
  state.plate.push(item);
  sfx('plate');
  const match = matchingOrder(state);
  if (match) say(state, `${DISHES[match.dish].name} ready — serve it!`, 2200);
}

export function useServe(state) {
  if (state.screen !== 'playing' || state.frozen) return;
  const match = matchingOrder(state);
  if (!match) {
    say(state, 'No order matches this plate yet');
    sfx('error');
    return;
  }
  const dish = DISHES[match.dish];
  const tip = Math.round(10 * match.patience);
  const comboBonus = Math.min(state.combo, 5) * 2;
  const earned = dish.reward + tip + comboBonus;
  state.coins += earned;
  state.score += earned;
  state.combo += 1;
  state.bestCombo = Math.max(state.bestCombo, state.combo);
  state.served += 1;
  state.orders = state.orders.filter((o) => o.id !== match.id);
  state.plate = [];
  state.flash = { kind: 'serve', t: 700 };
  say(state, `Served ${dish.name}! +${earned} coins`, 2200);
  sfx('serve');
}

export function useTrash(state) {
  if (state.screen !== 'playing' || state.frozen) return;
  if (state.tray.length > 0) {
    const item = state.tray.pop();
    say(state, `Trashed ${itemLabel(item)}`);
    sfx('trash');
    return;
  }
  if (state.plate.length > 0) {
    state.plate = [];
    say(state, 'Plate cleared');
    sfx('trash');
    return;
  }
  say(state, 'Nothing to trash');
}

export function chopDuration() {
  return CHOP_MS;
}

export function cookDuration() {
  return COOK_MS;
}

export { INGREDIENTS };
