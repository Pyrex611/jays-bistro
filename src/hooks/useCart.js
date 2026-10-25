import { useCallback, useMemo, useReducer, useState } from "react";
import { cartCount, cartReducer, cartTotal, initialCart, resolveCartLines } from "../lib/cart.js";

/**
 * Cart state for the storefront. `bump` increments whenever something is added,
 * so the header badge can replay its pop animation (use it as a React key).
 */
export function useCart(byId) {
  const [cart, dispatch] = useReducer(cartReducer, initialCart);
  const [bump, setBump] = useState(0);

  const lines = useMemo(() => resolveCartLines(cart, byId), [cart, byId]);
  const count = useMemo(() => cartCount(lines), [lines]);
  const total = useMemo(() => cartTotal(lines), [lines]);
  const quantities = useMemo(() => Object.fromEntries(lines.map((l) => [l.item.id, l.quantity])), [lines]);

  const add = useCallback((id, quantity = 1) => {
    dispatch({ type: "add", id, quantity });
    setBump((b) => b + 1);
  }, []);
  const decrement = useCallback((id) => dispatch({ type: "remove", id, quantity: 1 }), []);
  const removeLine = useCallback((id) => dispatch({ type: "removeLine", id }), []);
  const clear = useCallback(() => dispatch({ type: "clear" }), []);

  /** Apply already-sanitised chatbot actions: [{ action: 'add'|'remove', id, quantity }]. */
  const applyActions = useCallback((actions) => {
    if (!actions.length) return;
    actions.forEach((a) => dispatch({ type: a.action, id: a.id, quantity: a.quantity }));
    setBump((b) => b + 1);
  }, []);

  return { lines, count, total, quantities, bump, add, decrement, removeLine, clear, applyActions };
}
