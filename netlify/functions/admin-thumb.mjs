// 관리자: 카드 미리보기 사진 저장(POST, 본문=JPEG) / 지우기(DELETE)
import { isAdmin } from "../lib/auth.mjs";
import { uploadsStore } from "../lib/flags.mjs";
import { readThumbs, thumbKey, THUMBS_KEY } from "../lib/thumbs.mjs";

export default async (req) => {
  if (!isAdmin(req)) return Response.json({ ok: false, error: "로그인이 필요합니다." }, { status: 401 });
  const id = String(new URL(req.url).searchParams.get("id") || "").slice(0, 300);
  if (!/^[sua]:/.test(id)) return Response.json({ ok: false, error: "id가 올바르지 않습니다." }, { status: 400 });
  const store = uploadsStore();
  const map = await readThumbs(store);
  if (req.method === "DELETE") {
    await store.delete(thumbKey(id)).catch(() => {});
    delete map[id]; await store.setJSON(THUMBS_KEY, map);
    return Response.json({ ok: true });
  }
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
  const data = await req.arrayBuffer();
  if (!data.byteLength || data.byteLength > 1024 * 1024) return Response.json({ ok: false, error: "사진 크기가 올바르지 않습니다." }, { status: 400 });
  await store.set(thumbKey(id), data);
  map[id] = Date.now(); await store.setJSON(THUMBS_KEY, map);
  return Response.json({ ok: true, at: map[id] }, { headers: { "Cache-Control": "no-store" } });
};
