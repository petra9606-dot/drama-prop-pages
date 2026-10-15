// 큰 파일(4MB 초과)은 브라우저가 3MB 조각으로 나눠 보내고, 여기서 다시 합친다.
export const MAX_FILE = 20 * 1024 * 1024;
const PREFIX = "__meta/chunks/";
const safeId = (v) => String(v || "").replace(/[^A-Za-z0-9_-]/g, "").slice(0, 64);

export async function saveChunk(store, uploadId, index, data) {
  const id = safeId(uploadId); const i = Math.max(0, Math.min(99, parseInt(index, 10) || 0));
  if (!id) throw new Error("bad upload id");
  await store.set(`${PREFIX}${id}/${String(i).padStart(3, "0")}`, data, { metadata: { at: Date.now() } });
}

// form 에 file 이 있으면 그대로, 없으면 chunkId 로 조각을 모아 { name, type, size, data } 를 돌려준다
export async function fileFromForm(form, store) {
  const file = form.get("file");
  if (file instanceof File) return { name: file.name, type: file.type || "application/octet-stream", size: file.size, data: await file.arrayBuffer() };
  const id = safeId(form.get("chunkId"));
  const count = parseInt(form.get("chunkCount"), 10) || 0;
  if (!id || count < 1 || count > 100) return null;
  const parts = [];
  for (let i = 0; i < count; i++) {
    const buf = await store.get(`${PREFIX}${id}/${String(i).padStart(3, "0")}`, { type: "arrayBuffer" });
    if (buf === null) throw new Error("파일 조각이 빠졌습니다. 다시 올려 주세요.");
    parts.push(new Uint8Array(buf));
  }
  const size = parts.reduce((a, p) => a + p.byteLength, 0);
  const data = new Uint8Array(size); let o = 0; for (const p of parts) { data.set(p, o); o += p.byteLength; }
  for (let i = 0; i < count; i++) store.delete(`${PREFIX}${id}/${String(i).padStart(3, "0")}`).catch(() => {});
  return { name: String(form.get("fileName") || "file"), type: String(form.get("fileType") || "application/octet-stream"), size, data: data.buffer };
}

// 하루 넘게 남은 조각(올리다 만 것) 정리
export async function cleanupChunks(store) {
  const { blobs } = await store.list({ prefix: PREFIX });
  const old = Date.now() - 864e5;
  for (const b of blobs) {
    const m = await store.getMetadata(b.key).catch(() => null);
    if (!m || (m.metadata?.at || 0) < old) await store.delete(b.key).catch(() => {});
  }
}
