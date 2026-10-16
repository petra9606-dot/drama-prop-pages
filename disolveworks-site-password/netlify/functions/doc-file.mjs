// 공개: 소품 서류 파일 받기 / 미리보기 (?id=&kind=orig|preview&dl=1)
import { uploadsStore } from "../lib/flags.mjs";
import { readDocs, docKey } from "../lib/docs.mjs";
import { isAdmin } from "../lib/auth.mjs";
import { siteDenied } from "../lib/site-gate.mjs";

export default async (req) => {
  const denied = siteDenied(req); if (denied) return denied; // 사이트 입장 비밀번호
  const url = new URL(req.url);
  const id = url.searchParams.get("id") || "", k = url.searchParams.get("kind"), kind = k === "preview" || k === "thumb" ? k : "orig";
  const store = uploadsStore();
  const d = await readDocs(store);
  const f = d.files.find((x) => x.id === id);
  if (!f) return new Response("Not found", { status: 404 });
  if (f.visible === false && !isAdmin(req)) return new Response("Not found", { status: 404 });
  const meta = kind === "preview" ? f.preview : kind === "thumb" ? (f.thumb && { type: "image/jpeg" }) : f;
  if (!meta) return new Response("No preview", { status: 404 });
  const data = await store.get(docKey(id, kind), { type: "arrayBuffer" });
  if (data === null) return new Response("Not found", { status: 404 });
  const name = kind === "thumb" ? "thumb.jpg" : kind === "preview" ? (meta.name || f.name.replace(/\.[^.]+$/, "") + ".pdf") : f.name;
  const dl = url.searchParams.get("dl") === "1";
  const body = data.byteLength > 5 * 1024 * 1024 ? new Response(data).body : data;
  return new Response(body, { headers: {
    "Content-Type": meta.type || "application/octet-stream",
    "Content-Disposition": `${dl ? "attachment" : "inline"}; filename*=UTF-8''${encodeURIComponent(name)}`,
    "Cache-Control": kind === "thumb" ? "private, max-age=604800, immutable" : "private, max-age=300",
    "X-Robots-Tag": "noindex, nofollow, noarchive"
  } });
};
