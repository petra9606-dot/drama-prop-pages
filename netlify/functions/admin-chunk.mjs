// 관리자: 큰 파일 조각 받기 (조각당 최대 3MB) — 모두 받은 뒤 업로드/교체 요청에서 합친다
import { isAdmin } from "../lib/auth.mjs";
import { uploadsStore } from "../lib/flags.mjs";
import { saveChunk } from "../lib/chunks.mjs";

export default async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
  if (!isAdmin(req)) return Response.json({ ok: false, error: "로그인이 필요합니다." }, { status: 401 });
  const url = new URL(req.url);
  const data = await req.arrayBuffer();
  if (!data.byteLength || data.byteLength > 3.5 * 1024 * 1024) return Response.json({ ok: false, error: "조각 크기가 올바르지 않습니다." }, { status: 400 });
  try {
    await saveChunk(uploadsStore(), url.searchParams.get("id"), url.searchParams.get("i"), data);
    return Response.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    return Response.json({ ok: false, error: err?.message || String(err) }, { status: 500 });
  }
};
