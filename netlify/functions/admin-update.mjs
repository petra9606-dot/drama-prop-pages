
import { getStore } from "@netlify/blobs";
import { isAdmin } from "../lib/auth.mjs";

function cleanText(v, max=120) { return String(v || "").trim().slice(0,max); }

export default async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status:405 });
  if (!isAdmin(req)) return Response.json({ ok:false, error:"로그인이 필요합니다." }, { status:401 });

  const body = await req.json().catch(()=>({}));
  const key = String(body.key || "");
  if (!key) return Response.json({ ok:false, error:"key가 없습니다." }, { status:400 });

  const store = getStore("disolveworks-uploads");
  const entry = await store.getMetadata(key);
  if (!entry) return Response.json({ ok:false, error:"파일을 찾을 수 없습니다." }, { status:404 });

  const m = entry.metadata || {};
  const partNum = Math.max(1, Math.min(12, parseInt(body.partNum ?? m.partNum,10) || 1));
  const sceneRaw = cleanText(body.sceneRaw ?? m.sceneRaw ?? m.scene, 20).replace(/씬$/,"").replace(/[^0-9A-Za-z가-힣._-]/g,"");
  const updated = {
    ...m,
    partNum,
    part:`${partNum}부`,
    sceneRaw,
    scene: sceneRaw ? `${sceneRaw}씬` : m.scene,
    title: cleanText(body.title ?? m.title, 100) || m.title,
    visible: body.visible === undefined ? m.visible !== false : !!body.visible,
    pinned: body.pinned === undefined ? !!m.pinned : !!body.pinned,
    updatedAt: new Date().toISOString()
  };

  const blob = await store.get(key, { type:"arrayBuffer" });
  if (blob === null) return Response.json({ ok:false, error:"파일 본문을 찾을 수 없습니다." }, { status:404 });
  await store.set(key, blob, { metadata:updated });

  return Response.json({ ok:true, item:{ key, ...updated } }, { headers:{ "Cache-Control":"no-store" }});
};
