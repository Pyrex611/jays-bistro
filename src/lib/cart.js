/**
 * Cart logic — pure and immutable so it is trivially testable.
 *
 * State shape: Array<{ id: number, quantity: number }>.
 * Name, price and image are NOT stored on the line; they are always resolved from the
 * menu at read time, so a price edit (Phase 2 dashboard) can never leave a stale price in a cart.
 */

export const MAX_QTY_PER_ITEM = 20;
export const initialCart = [];

const toQty = (value) => {
  const n = Math.trunc(Number(value));
  return Number.isFinite(n) && n > 0 ? n : 0;
};

export function cartReducer(state, action) {
  switch (action.type) {
    case "add": {
      const qty = toQty(action.quantity ?? 1);
      if (!qty) return state;
      const exists = state.some((line) => line.id === action.id);
      if (!exists) return [...state, { id: action.id, quantity: Math.min(qty, MAX_QTY_PER_ITEM) }];
      return state.map((line) =>
        line.id === action.id ? { ...line, quantity: Math.min(line.quantity + qty, MAX_QTY_PER_ITEM) } : line,
      );
    }
    case "remove": {
      const qty = toQty(action.quantity ?? 1);
      if (!qty) return state;
      return state
        .map((line) => (line.id === action.id ? { ...line, quantity: line.quantity - qty } : line))
        .filter((line) => line.quantity > 0);
    }
    case "removeLine":
      return state.filter((line) => line.id !== action.id);
    case "clear":
      return initialCart;
    default:
      return state;
  }
}

/** Resolve cart lines against the menu. Lines whose item no longer exists are dropped. */
export function resolveCartLines(cart, byId) {
  return cart
    .map((line) => {
      const item = byId[line.id];
      return item ? { item, quantity: line.quantity, lineTotal: item.price * line.quantity } : null;
    })
    .filter(Boolean);
}

export const cartCount = (lines) => lines.reduce((sum, line) => sum + line.quantity, 0);
export const cartTotal = (lines) => lines.reduce((sum, line) => sum + line.lineTotal, 0);
