
import { isAdmin } from "../lib/auth.mjs";
import { uploadsStore, patchFlags, dropFlags, readFlags, merge } from "../lib/flags.mjs";

export default async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status:405 });
  if (!isAdmin(req)) return Response.json({ ok:false, error:"로그인이 필요합니다." }, { status:401 });

  const body = await req.json().catch(()=>({}));
  const key = String(body.key || "");
  const action = String(body.action || "trash");
  if (!key) return Response.json({ ok:false, error:"key가 없습니다." }, { status:400 });

  try {
    const store = uploadsStore();

    if (action === "purge") {
      await store.delete(key);
      await dropFlags(store, key);
      return Response.json({ ok:true, action }, { headers:{ "Cache-Control":"no-store" }});
    }

    const entry = await store.getMetadata(key);
    if (!entry) return Response.json({ ok:false, error:"파일을 찾을 수 없습니다." }, { status:404 });

    const now = new Date().toISOString();
    const state = await patchFlags(store, key, {
      deleted: action === "trash",
      deletedAt: action === "trash" ? now : null,
      updatedAt: now
    });

    const flags = await readFlags(store);
    return Response.json(
      { ok:true, action, item: merge(entry.metadata, flags[key]), state },
      { headers:{ "Cache-Control":"no-store" }}
    );
  } catch (err) {
    return Response.json({ ok:false, error:`서버 오류: ${err && err.message ? err.message : String(err)}` }, { status:500 });
  }
};
