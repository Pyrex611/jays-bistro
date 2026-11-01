import { describe, expect, it } from "vitest";
import { MAX_QTY_PER_ITEM, cartCount, cartReducer, cartTotal, initialCart, resolveCartLines } from "../lib/cart.js";

const byId = {
  1: { id: 1, name: "Party Jollof Rice", price: 1500 },
  2: { id: 2, name: "Isi-ewu", price: 6000 },
};

describe("cartReducer", () => {
  it("adds a new line and increments an existing one", () => {
    let cart = cartReducer(initialCart, { type: "add", id: 1 });
    cart = cartReducer(cart, { type: "add", id: 1, quantity: 2 });
    expect(cart).toEqual([{ id: 1, quantity: 3 }]);
  });

  it("never mutates the previous state (safe under React StrictMode double-invocation)", () => {
    const before = [{ id: 1, quantity: 1 }];
    const snapshot = JSON.parse(JSON.stringify(before));
    cartReducer(before, { type: "add", id: 1 });
    cartReducer(before, { type: "remove", id: 1 });
    expect(before).toEqual(snapshot);
  });

  it("caps quantity per item", () => {
    const cart = cartReducer([{ id: 1, quantity: MAX_QTY_PER_ITEM - 1 }], { type: "add", id: 1, quantity: 50 });
    expect(cart[0].quantity).toBe(MAX_QTY_PER_ITEM);
  });

  it("decrements and drops the line at zero", () => {
    let cart = [{ id: 1, quantity: 2 }];
    cart = cartReducer(cart, { type: "remove", id: 1 });
    expect(cart).toEqual([{ id: 1, quantity: 1 }]);
    cart = cartReducer(cart, { type: "remove", id: 1 });
    expect(cart).toEqual([]);
  });

  it("ignores invalid quantities", () => {
    const start = [{ id: 1, quantity: 1 }];
    expect(cartReducer(start, { type: "add", id: 1, quantity: -3 })).toBe(start);
    expect(cartReducer(start, { type: "add", id: 1, quantity: "abc" })).toBe(start);
    expect(cartReducer(start, { type: "remove", id: 1, quantity: 0 })).toBe(start);
  });

  it("removes a whole line and clears", () => {
    const start = [{ id: 1, quantity: 4 }, { id: 2, quantity: 1 }];
    expect(cartReducer(start, { type: "removeLine", id: 1 })).toEqual([{ id: 2, quantity: 1 }]);
    expect(cartReducer(start, { type: "clear" })).toEqual([]);
  });
});

describe("cart selectors", () => {
  it("resolves lines from the menu, drops unknown items and totals correctly", () => {
    const lines = resolveCartLines(
      [{ id: 1, quantity: 2 }, { id: 2, quantity: 1 }, { id: 999, quantity: 5 }],
      byId,
    );
    expect(lines).toHaveLength(2);
    expect(cartCount(lines)).toBe(3);
    expect(cartTotal(lines)).toBe(2 * 1500 + 6000);
  });
});
