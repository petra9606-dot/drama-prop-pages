
import { getStore } from "@netlify/blobs";
import { isAdmin } from "../lib/auth.mjs";

export default async (req) => {
  if (!isAdmin(req)) return Response.json({ ok:false, error:"로그인이 필요합니다." }, { status:401 });
  const store = getStore("disolveworks-uploads");
  const { blobs } = await store.list();
  const items = [];
  for (const b of blobs) {
    const entry = await store.getMetadata(b.key);
    if (!entry) continue;
    items.push({
      key:b.key,
      ...(entry.metadata || {}),
      url:`/.netlify/functions/file?key=${encodeURIComponent(b.key)}`
    });
  }
  items.sort((a,b) => String(b.uploadedAt||"").localeCompare(String(a.uploadedAt||"")));
  return Response.json({ ok:true, items }, { headers:{ "Cache-Control":"no-store" }});
};
