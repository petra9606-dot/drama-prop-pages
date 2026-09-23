
import { isAdmin } from "../lib/auth.mjs";
import { uploadsStore, dropFlags } from "../lib/flags.mjs";

export default async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status:405 });
  if (!isAdmin(req)) return Response.json({ ok:false, error:"로그인이 필요합니다." }, { status:401 });
  const body = await req.json().catch(() => ({}));
  const key = String(body.key || "");
  if (!key) return Response.json({ ok:false, error:"key가 없습니다." }, { status:400 });
  try {
    const store = uploadsStore();
    await store.delete(key);
    await dropFlags(store, key);
    return Response.json({ ok:true }, { headers:{ "Cache-Control":"no-store" }});
  } catch (err) {
    return Response.json({ ok:false, error:`서버 오류: ${err && err.message ? err.message : String(err)}` }, { status:500 });
  }
};
