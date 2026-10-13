import { uploadsStore, readUpdates, readFlags, merge, readStaticHidden } from "../lib/flags.mjs";

// 공개: 최근 업데이트 목록 (지워졌거나 숨긴 자료는 빼고 보여 준다)
export default async (req) => {
  const url = new URL(req.url);
  const limit = Math.max(1, Math.min(100, parseInt(url.searchParams.get("limit"), 10) || 40));
  const store = uploadsStore();
  const [list, flags, hidden] = await Promise.all([readUpdates(store), readFlags(store), readStaticHidden(store)]);
  const hid = new Set(hidden);
  const out = [];
  const metaCache = new Map();
  for (const u of list) {
    if (out.length >= limit) break;
    if (u.sid && hid.has(u.sid)) continue;
    if (u.key) {
      let meta = metaCache.get(u.key);
      if (meta === undefined) {
        const entry = await store.getMetadata(u.key).catch(() => null);
        meta = entry ? merge(entry.metadata, flags[u.key]) : null;
        metaCache.set(u.key, meta);
      }
      if (!meta || meta.deleted || meta.visible === false) continue;
      out.push({ ...u, title: meta.title || u.title, part: meta.part || u.part, scene: meta.scene || u.scene });
      continue;
    }
    out.push(u);
  }
  return Response.json({ ok: true, items: out }, { headers: { "Cache-Control": "no-store" } });
};
