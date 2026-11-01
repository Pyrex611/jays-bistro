import fs from "node:fs";
import path from "node:path";
import { loadEnv } from "vite";

/**
 * Dev-only: serves the /api/* functions from `npm run dev` (no `vercel dev` or login needed).
 * Reads .env.local into process.env, maps URLs to files in /api (supports [param] files), and serves
 * locally stored images from .local-data under /__local/. Not used in production builds.
 */
const TYPES = { ".webp": "image/webp", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg" };

function resolveRoute(pathname) {
  const segments = pathname.replace(/^\/api\/?/, "").split("/").filter(Boolean);
  let dir = path.resolve("api");
  const params = {};
  for (let i = 0; i < segments.length; i += 1) {
    const seg = segments[i];
    if (seg.startsWith("_")) return null;
    const last = i === segments.length - 1;
    const exactFile = path.join(dir, `${seg}.js`);
    const exactDir = path.join(dir, seg);
    if (last && fs.existsSync(exactFile)) return { file: exactFile, params };
    if (!last && fs.existsSync(exactDir) && fs.statSync(exactDir).isDirectory()) { dir = exactDir; continue; }
    const dynamicFile = fs.existsSync(dir) && fs.readdirSync(dir).find((f) => /^\[.+\]\.js$/.test(f));
    if (last && dynamicFile) return { file: path.join(dir, dynamicFile), params: { ...params, [dynamicFile.slice(1, -4)]: seg } };
    return null;
  }
  const index = path.join(dir, "index.js");
  return fs.existsSync(index) ? { file: index, params } : null;
}

export function apiDevPlugin() {
  return {
    name: "jb-api-dev",
    apply: "serve",
    configureServer(server) {
      for (const [k, v] of Object.entries(loadEnv("development", process.cwd(), ""))) {
        if (process.env[k] === undefined) process.env[k] = v;
      }

      server.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url, "http://localhost");

        if (url.pathname.startsWith("/__local/")) {
          const file = path.resolve(".local-data", url.pathname.replace("/__local/", ""));
          if (!file.startsWith(path.resolve(".local-data")) || !fs.existsSync(file)) return next();
          res.setHeader("Content-Type", TYPES[path.extname(file)] ?? "application/octet-stream");
          return fs.createReadStream(file).pipe(res);
        }
        if (!url.pathname.startsWith("/api/")) return next();

        const route = resolveRoute(url.pathname);
        if (!route) {
          res.statusCode = 404;
          res.setHeader("Content-Type", "application/json");
          return res.end(JSON.stringify({ error: "Not found" }));
        }

        const chunks = [];
        for await (const c of req) chunks.push(c);
        const raw = Buffer.concat(chunks).toString();
        if (raw && String(req.headers["content-type"] ?? "").includes("json")) {
          try { req.body = JSON.parse(raw); } catch { req.body = {}; }
        } else if (raw) req.body = raw;
        req.query = { ...Object.fromEntries(url.searchParams), ...route.params };

        try {
          const mod = await server.ssrLoadModule(route.file);
          await mod.default(req, res);
        } catch (e) {
          console.error(`[api] ${req.method} ${url.pathname} failed:`, e);
          if (!res.headersSent) {
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
          }
          res.end(JSON.stringify({ error: "Server error" }));
        }
      });
    },
  };
}
