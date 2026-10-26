import fs from "node:fs/promises";
import path from "node:path";

/**
 * Storage abstraction. One tiny interface, three drivers:
 *   s3     — production (private bucket; only images/* is public)
 *   fs     — local development (.local-data/, git-ignored)
 *   memory — unit tests
 *
 * Interface: getJSON(key) · putJSON(key, obj) · remove(key) · list(prefix, max) · putBinary(key, buf, type) · publicUrl(key)
 */

const env = (k) => process.env[k]?.trim();

function s3Driver() {
  const bucket = env("S3_BUCKET");
  const region = env("S3_REGION") ?? "eu-west-1";
  let clientPromise;
  const sdk = () => import("@aws-sdk/client-s3");
  const client = () =>
    (clientPromise ??= sdk().then(
      ({ S3Client }) =>
        new S3Client({
          region,
          credentials: { accessKeyId: env("S3_ACCESS_KEY_ID") ?? "", secretAccessKey: env("S3_SECRET_ACCESS_KEY") ?? "" },
        }),
    ));

  return {
    name: "s3",
    async getJSON(key) {
      const { GetObjectCommand } = await sdk();
      try {
        const out = await (await client()).send(new GetObjectCommand({ Bucket: bucket, Key: key }));
        return JSON.parse(await out.Body.transformToString());
      } catch (e) {
        if (e?.name === "NoSuchKey" || e?.$metadata?.httpStatusCode === 404) return null;
        throw e;
      }
    },
    async putJSON(key, obj) {
      const { PutObjectCommand } = await sdk();
      await (await client()).send(
        new PutObjectCommand({ Bucket: bucket, Key: key, Body: JSON.stringify(obj), ContentType: "application/json", CacheControl: "no-store" }),
      );
    },
    async remove(key) {
      const { DeleteObjectCommand } = await sdk();
      await (await client()).send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
    },
    async list(prefix, max = 1000) {
      const { ListObjectsV2Command } = await sdk();
      const keys = [];
      let token;
      do {
        const out = await (await client()).send(new ListObjectsV2Command({ Bucket: bucket, Prefix: prefix, ContinuationToken: token, MaxKeys: Math.min(1000, max - keys.length) }));
        (out.Contents ?? []).forEach((o) => keys.push(o.Key));
        token = out.IsTruncated && keys.length < max ? out.NextContinuationToken : undefined;
      } while (token);
      return keys;
    },
    async putBinary(key, buffer, contentType) {
      const { PutObjectCommand } = await sdk();
      await (await client()).send(
        new PutObjectCommand({ Bucket: bucket, Key: key, Body: buffer, ContentType: contentType, CacheControl: "public, max-age=31536000, immutable" }),
      );
    },
    publicUrl(key) {
      const base = env("S3_PUBLIC_BASE_URL");
      return base ? `${base.replace(/\/$/, "")}/${key}` : `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
    },
  };
}

function fsDriver(root = path.resolve(".local-data")) {
  const file = (key) => path.join(root, ...key.split("/"));
  const walk = async (dir) => {
    const out = [];
    for (const e of await fs.readdir(dir, { withFileTypes: true }).catch(() => [])) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) out.push(...(await walk(p)));
      else out.push(p);
    }
    return out;
  };
  return {
    name: "fs",
    root,
    async getJSON(key) {
      try {
        return JSON.parse(await fs.readFile(file(key), "utf8"));
      } catch (e) {
        if (e.code === "ENOENT") return null;
        throw e;
      }
    },
    async putJSON(key, obj) {
      await fs.mkdir(path.dirname(file(key)), { recursive: true });
      await fs.writeFile(file(key), JSON.stringify(obj, null, 2));
    },
    async remove(key) {
      await fs.rm(file(key), { force: true });
    },
    async list(prefix, max = 1000) {
      const keys = (await walk(root)).map((p) => path.relative(root, p).split(path.sep).join("/")).filter((k) => k.startsWith(prefix));
      return keys.slice(0, max);
    },
    async putBinary(key, buffer) {
      await fs.mkdir(path.dirname(file(key)), { recursive: true });
      await fs.writeFile(file(key), buffer);
    },
    publicUrl: (key) => `/__local/${key}`,
  };
}

export function memoryDriver() {
  const store = new Map();
  return {
    name: "memory",
    store,
    async getJSON(key) {
      return store.has(key) ? JSON.parse(store.get(key)) : null;
    },
    async putJSON(key, obj) {
      store.set(key, JSON.stringify(obj));
    },
    async remove(key) {
      store.delete(key);
    },
    async list(prefix, max = 1000) {
      return [...store.keys()].filter((k) => k.startsWith(prefix)).slice(0, max);
    },
    async putBinary(key, buffer) {
      store.set(key, buffer);
    },
    publicUrl: (key) => `https://test.invalid/${key}`,
  };
}

let current;

export function getStorage() {
  if (current) return current;
  const wanted = env("STORAGE_DRIVER");
  const production = process.env.VERCEL_ENV === "production" || process.env.NODE_ENV === "production";
  if (wanted === "memory") current = memoryDriver();
  else if (wanted === "fs") current = fsDriver();
  else if (env("S3_BUCKET")) current = s3Driver();
  else if (!production) current = fsDriver();
  else throw new Error("Storage is not configured: set S3_BUCKET, S3_REGION, S3_ACCESS_KEY_ID and S3_SECRET_ACCESS_KEY.");
  return current;
}

/** Test hook. */
export function setStorageForTests(driver) {
  current = driver;
}
