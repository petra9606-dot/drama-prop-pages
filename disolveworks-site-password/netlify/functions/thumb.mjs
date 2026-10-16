// 공개: 카드 미리보기 사진 목록(?index=1) / 사진(?id=)
import { uploadsStore } from "../lib/flags.mjs";
import { readThumbs, thumbKey } from "../lib/thumbs.mjs";
import { siteDenied } from "../lib/site-gate.mjs";

export default async (req) => {
  const denied = siteDenied(req); if (denied) return denied; // 사이트 입장 비밀번호
  const url = new URL(req.url);
  const store = uploadsStore();
  if (url.searchParams.get("index")) {
    return Response.json({ ok: true, thumbs: await readThumbs(store) }, { headers: { "Cache-Control": "private, max-age=60", "X-Robots-Tag": "noindex" } });
  }
  const id = url.searchParams.get("id") || "";
  if (!id) return new Response("Missing id", { status: 400 });
  const data = await store.get(thumbKey(id), { type: "arrayBuffer" });
  if (data === null) return new Response("Not found", { status: 404 });
  return new Response(data, { headers: { "Content-Type": "image/jpeg", "Cache-Control": "private, max-age=604800, immutable", "X-Robots-Tag": "noindex" } });
};
