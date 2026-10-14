const PREFIX = "__meta/backups/";
export const BACKUP_RETENTION_MS = 7 * 24 * 60 * 60 * 1000;

function safePart(value) {
  return Buffer.from(String(value || ""), "utf8").toString("base64url");
}

export async function createBackup(store, sourceKey, metadata = {}) {
  const data = await store.get(sourceKey, { type:"arrayBuffer" });
  if (data === null) return null;

  const createdAt = new Date();
  const expiresAt = new Date(createdAt.getTime() + BACKUP_RETENTION_MS);
  const key = `${PREFIX}${safePart(sourceKey)}/${createdAt.getTime()}-${crypto.randomUUID()}`;
  const backupMeta = {
    sourceKey,
    createdAt:createdAt.toISOString(),
    expiresAt:expiresAt.toISOString(),
    filename:metadata.filename || "file",
    contentType:metadata.contentType || "application/octet-stream",
    size:Number(metadata.size || data.byteLength || 0),
    sourceMetadata:metadata
  };
  await store.set(key, data, { metadata:backupMeta });
  return { key, ...backupMeta };
}

export async function listBackups(store, sourceKey) {
  const prefix = `${PREFIX}${safePart(sourceKey)}/`;
  const { blobs } = await store.list({ prefix });
  const now = Date.now();
  const versions = [];
  for (const blob of blobs) {
    const entry = await store.getMetadata(blob.key);
    if (!entry) continue;
    const meta = entry.metadata || {};
    if (Date.parse(meta.expiresAt || 0) <= now) {
      await store.delete(blob.key);
      continue;
    }
    versions.push({ id:blob.key, ...meta });
  }
  return versions.sort((a,b) => String(b.createdAt).localeCompare(String(a.createdAt)));
}

export async function getBackup(store, id, sourceKey = "") {
  if (!String(id).startsWith(PREFIX)) return null;
  const entry = await store.getMetadata(id);
  if (!entry) return null;
  const metadata = entry.metadata || {};
  if (sourceKey && metadata.sourceKey !== sourceKey) return null;
  if (Date.parse(metadata.expiresAt || 0) <= Date.now()) {
    await store.delete(id);
    return null;
  }
  const data = await store.get(id, { type:"arrayBuffer" });
  return data === null ? null : { id, metadata, data };
}

export async function cleanupExpiredBackups(store) {
  const { blobs } = await store.list({ prefix:PREFIX });
  const now = Date.now();
  let deleted = 0;
  for (const blob of blobs) {
    const entry = await store.getMetadata(blob.key);
    if (!entry || Date.parse(entry.metadata?.expiresAt || 0) <= now) {
      await store.delete(blob.key);
      deleted++;
    }
  }
  return deleted;
}
