
import { isAdmin } from "../lib/auth.mjs";
import { uploadsStore, readFlags, merge, isInternalKey } from "../lib/flags.mjs";

export default async (req) => {
  if (!isAdmin(req)) return Response.json({ ok:false, error:"로그인이 필요합니다." }, { status:401 });
  try {
    const store = uploadsStore();
    const [{ blobs }, flags] = await Promise.all([ store.list(), readFlags(store) ]);
    const items = [];
    for (const b of blobs) {
      if (isInternalKey(b.key)) continue;
      const entry = await store.getMetadata(b.key);
      if (!entry) continue;
      items.push({
        key:b.key,
        ...merge(entry.metadata, flags[b.key]),
        url:`/.netlify/functions/file?key=${encodeURIComponent(b.key)}`
      });
    }
    items.sort((a,b) => {
      if (!!a.deleted !== !!b.deleted) return a.deleted ? 1 : -1;
      if (!!a.pinned !== !!b.pinned) return a.pinned ? -1 : 1;
      return String(b.updatedAt||b.uploadedAt||"").localeCompare(String(a.updatedAt||a.uploadedAt||""));
    });
    return Response.json({ ok:true, items }, { headers:{ "Cache-Control":"no-store" }});
  } catch (err) {
    return Response.json({ ok:false, error:`목록을 불러오지 못했습니다: ${err && err.message ? err.message : String(err)}` }, { status:500 });
  }
};
