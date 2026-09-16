
import { getStore } from "@netlify/blobs";
import { isAdmin } from "../lib/auth.mjs";

export default async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status:405 });
  if (!isAdmin(req)) return Response.json({ ok:false, error:"로그인이 필요합니다." }, { status:401 });
  const body = await req.json().catch(()=>({}));
  const key = String(body.key || "");
  const action = String(body.action || "trash");
  if (!key) return Response.json({ ok:false, error:"key가 없습니다." }, { status:400 });

  const store = getStore("disolveworks-uploads");
  if (action === "purge") {
    await store.delete(key);
    return Response.json({ ok:true });
  }

  const entry = await store.getMetadata(key);
  const blob = await store.get(key, { type:"arrayBuffer" });
  if (!entry || blob === null) return Response.json({ ok:false, error:"파일을 찾을 수 없습니다." }, { status:404 });

  const now = new Date().toISOString();
  const meta = {
    ...(entry.metadata || {}),
    deleted: action === "trash",
    deletedAt: action === "trash" ? now : null,
    updatedAt: now
  };
  await store.set(key, blob, { metadata:meta });
  return Response.json({ ok:true });
};
