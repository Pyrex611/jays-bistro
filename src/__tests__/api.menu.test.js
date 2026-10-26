import { beforeEach, describe, expect, it } from "vitest";
import auth from "../../api/merchant/auth.js";
import adminMenu from "../../api/merchant/menu.js";
import publicMenu from "../../api/menu.js";
import image from "../../api/merchant/image.js";
import { AJAX, call, freshEnv, signIn } from "./apiHelpers.js";

beforeEach(freshEnv);

describe("menu publishing", () => {
  it("serves the bundled default catalogue until the merchant publishes", async () => {
    const r = await call(publicMenu);
    expect(r.status).toBe(200);
    expect(r.json.source).toBe("default");
    expect(r.json.items).toHaveLength(64);
    expect(r.headers["cache-control"]).toContain("s-maxage=30");
  });

  it("publishes edits, bumps the version, and serves them publicly", async () => {
    const { cookie } = await signIn(auth);
    const current = (await call(adminMenu, { headers: { cookie } })).json;
    const doc = structuredClone(current);
    doc.items[0].price = 2222;
    doc.items.push({ id: 900, category: "Meals", name: "Test Dish", price: 1000, description: "x", image: "menu/party-jollof-rice.png", imageStyle: "cutout" });

    const saved = await call(adminMenu, { method: "PUT", headers: { ...AJAX, cookie }, body: { doc, baseVersion: current.version } });
    expect(saved.status).toBe(200);
    expect(saved.json.version).toBe(1);

    const pub = (await call(publicMenu)).json;
    expect(pub.source).toBe("storage");
    expect(pub.items.find((i) => i.id === 900).name).toBe("Test Dish");
    expect(pub.items[0].price).toBe(2222);
  });

  it("returns 409 when the menu changed since it was opened", async () => {
    const { cookie } = await signIn(auth);
    const base = (await call(adminMenu, { headers: { cookie } })).json;
    await call(adminMenu, { method: "PUT", headers: { ...AJAX, cookie }, body: { doc: base, baseVersion: 0 } });
    const stale = await call(adminMenu, { method: "PUT", headers: { ...AJAX, cookie }, body: { doc: base, baseVersion: 0 } });
    expect(stale.status).toBe(409);
    expect(stale.json.current.version).toBe(1);
  });

  it("rejects invalid documents with readable errors", async () => {
    const { cookie } = await signIn(auth);
    const doc = structuredClone((await call(adminMenu, { headers: { cookie } })).json);
    doc.items[0].price = -5;
    doc.items[1].image = "javascript:alert(1)";
    doc.items[2].category = "Nope";
    const r = await call(adminMenu, { method: "PUT", headers: { ...AJAX, cookie }, body: { doc, baseVersion: 0 } });
    expect(r.status).toBe(400);
    expect(r.json.errors.length).toBeGreaterThanOrEqual(3);
  });

  it("requires sign-in to publish", async () => {
    const r = await call(adminMenu, { method: "PUT", headers: AJAX, body: { doc: {}, baseVersion: 0 } });
    expect(r.status).toBe(401);
  });
});

describe("image upload", () => {
  const png = "data:image/png;base64," + Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0]).toString("base64");

  it("accepts a real image and returns a public URL", async () => {
    const { cookie } = await signIn(auth);
    const r = await call(image, { method: "POST", headers: { ...AJAX, cookie }, body: { dataUrl: png } });
    expect(r.status).toBe(200);
    expect(r.json.url).toMatch(/\/images\/.+\.png$/);
  });

  it("rejects files whose bytes are not an image, even with an image label", async () => {
    const { cookie } = await signIn(auth);
    const fake = "data:image/png;base64," + Buffer.from("<script>alert(1)</script>").toString("base64");
    expect((await call(image, { method: "POST", headers: { ...AJAX, cookie }, body: { dataUrl: fake } })).status).toBe(400);
  });

  it("rejects oversized uploads and anonymous callers", async () => {
    const { cookie } = await signIn(auth);
    const big = "data:image/png;base64," + Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0, 0, 0, 0]), Buffer.alloc(1_600_000)]).toString("base64");
    expect((await call(image, { method: "POST", headers: { ...AJAX, cookie }, body: { dataUrl: big } })).status).toBe(413);
    expect((await call(image, { method: "POST", headers: AJAX, body: { dataUrl: png } })).status).toBe(401);
  });
});
