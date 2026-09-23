
import { isAdmin } from "../lib/auth.mjs";
import { uploadsStore, patchFlags, readFlags, merge } from "../lib/flags.mjs";

function cleanText(v, max=120) { return String(v || "").trim().slice(0,max); }

export default async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status:405 });
  if (!isAdmin(req)) return Response.json({ ok:false, error:"로그인이 필요합니다." }, { status:401 });

  const body = await req.json().catch(()=>({}));
  const key = String(body.key || "");
  if (!key) return Response.json({ ok:false, error:"key가 없습니다." }, { status:400 });

  try {
    const store = uploadsStore();
    const entry = await store.getMetadata(key);
    if (!entry) return Response.json({ ok:false, error:"파일을 찾을 수 없습니다." }, { status:404 });

    const flags = await readFlags(store);
    const m = merge(entry.metadata, flags[key]);

    const patch = { updatedAt: new Date().toISOString() };

    if (body.partNum !== undefined || body.sceneRaw !== undefined || body.title !== undefined) {
      const partNum = Math.max(1, Math.min(12, parseInt(body.partNum ?? m.partNum,10) || 1));
      const sceneRaw = cleanText(body.sceneRaw ?? m.sceneRaw ?? m.scene, 20)
        .replace(/씬$/,"").replace(/[^0-9A-Za-z가-힣._-]/g,"");
      patch.partNum = partNum;
      patch.part = `${partNum}부`;
      patch.sceneRaw = sceneRaw;
      patch.scene = sceneRaw ? `${sceneRaw}씬` : m.scene;
      patch.title = cleanText(body.title ?? m.title, 100) || m.title;
    }
    if (body.visible !== undefined) patch.visible = !!body.visible;
    if (body.pinned  !== undefined) patch.pinned  = !!body.pinned;

    const state = await patchFlags(store, key, patch);
    return Response.json({ ok:true, item:{ key, ...merge(m, state) } }, { headers:{ "Cache-Control":"no-store" }});
  } catch (err) {
    return Response.json({ ok:false, error:`서버 오류: ${err && err.message ? err.message : String(err)}` }, { status:500 });
  }
};
