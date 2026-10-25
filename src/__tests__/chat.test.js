import { describe, expect, it } from "vitest";
import { buildContents, buildSystemPrompt, parseModelReply, sanitizeActions } from "../lib/chat.js";
import { MAX_QTY_PER_ITEM } from "../lib/cart.js";

const byId = { 1: { id: 1, name: "Party Jollof Rice", price: 1500 }, 2: { id: 2, name: "Isi-ewu", price: 6000 } };

describe("parseModelReply", () => {
  it("parses plain JSON", () => {
    expect(parseModelReply('{"message":"Hi","actions":[]}')).toEqual({ message: "Hi", actions: [] });
  });

  it("strips markdown fences", () => {
    const raw = '```json\n{"message":"Added!","actions":[{"action":"add","id":1,"quantity":2}]}\n```';
    expect(parseModelReply(raw).actions).toHaveLength(1);
  });

  it("returns null for invalid or malformed replies", () => {
    expect(parseModelReply("not json")).toBeNull();
    expect(parseModelReply('{"actions":[]}')).toBeNull();
    expect(parseModelReply(undefined)).toBeNull();
  });

  it("defaults actions to an empty array when missing", () => {
    expect(parseModelReply('{"message":"Hello"}')).toEqual({ message: "Hello", actions: [] });
  });
});

describe("sanitizeActions", () => {
  it("keeps valid add/remove actions", () => {
    const out = sanitizeActions(
      [{ action: "add", id: 1, quantity: 2 }, { action: "remove", id: 2, quantity: 1 }],
      byId,
    );
    expect(out).toEqual([
      { action: "add", id: 1, quantity: 2 },
      { action: "remove", id: 2, quantity: 1 },
    ]);
  });

  it("drops unknown items, unknown verbs and bad quantities", () => {
    const out = sanitizeActions(
      [
        { action: "add", id: 999, quantity: 1 },
        { action: "delete", id: 1, quantity: 1 },
        { action: "add", id: 1, quantity: 0 },
        { action: "add", id: 1, quantity: -2 },
        { action: "add", id: "abc", quantity: 1 },
        null,
      ],
      byId,
    );
    expect(out).toEqual([]);
  });

  it("clamps absurd quantities and defaults a missing quantity to 1", () => {
    const out = sanitizeActions([{ action: "add", id: 1, quantity: 5000 }, { action: "add", id: 2 }], byId);
    expect(out[0].quantity).toBe(MAX_QTY_PER_ITEM);
    expect(out[1].quantity).toBe(1);
  });

  it("tolerates non-array input", () => {
    expect(sanitizeActions(undefined, byId)).toEqual([]);
    expect(sanitizeActions("add", byId)).toEqual([]);
  });
});

describe("prompt + history", () => {
  it("lists the menu and the current cart in the system prompt", () => {
    const prompt = buildSystemPrompt(Object.values(byId), [{ item: byId[1], quantity: 2 }]);
    expect(prompt).toContain("ID 1: Party Jollof Rice (₦1500)");
    expect(prompt).toContain("ID 1: Party Jollof Rice (x2)");
    expect(buildSystemPrompt(Object.values(byId), [])).toContain("Empty");
  });

  it("maps history to Gemini roles and appends the new user turn", () => {
    const contents = buildContents([{ role: "user", text: "hi" }, { role: "model", text: "hello" }], "add jollof");
    expect(contents.map((c) => c.role)).toEqual(["user", "model", "user"]);
    expect(JSON.parse(contents[1].parts[0].text)).toEqual({ message: "hello", actions: [] });
    expect(contents[2].parts[0].text).toBe("add jollof");
  });
});
