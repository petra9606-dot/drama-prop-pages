import { isAdmin } from "../lib/auth.mjs";
import { uploadsStore, readStaticHidden, writeStaticHidden } from "../lib/flags.mjs";
import { logActivity } from "../lib/activity.mjs";

// 관리자용: 깃허브 자료 숨김/표시 전환. body = { id, hidden: true|false }
export default async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status:405 });
  if (!isAdmin(req)) return Response.json({ ok:false, error:"로그인이 필요합니다." }, { status:401 });
  const body = await req.json().catch(() => ({}));
  const id = String(body.id || "").trim().slice(0, 120);
  if (!id) return Response.json({ ok:false, error:"id가 없습니다." }, { status:400 });
  try {
    const store = uploadsStore();
    const set = new Set(await readStaticHidden(store));
    if (body.hidden) set.add(id); else set.delete(id);
    const hidden = [...set];
    await writeStaticHidden(store, hidden);
    await logActivity(store, { action: body.hidden ? "숨김" : "사이트에 표시", title: String(body.title || id).slice(0, 120), part: body.part, scene: body.scene, detail: "깃허브 자료" });
    return Response.json({ ok:true, hidden }, { headers:{ "Cache-Control":"no-store" }});
  } catch (err) {
    return Response.json({ ok:false, error:`서버 오류: ${err && err.message ? err.message : String(err)}` }, { status:500 });
  }
};
