
import { uploadsStore, readFlags, merge, isInternalKey } from "../lib/flags.mjs";
import { injectBytes } from "../lib/inject.mjs";
import { siteDenied } from "../lib/site-gate.mjs";

export default async (req) => {
  const denied = siteDenied(req); if (denied) return denied; // 사이트 입장 비밀번호
  const url = new URL(req.url);
  const key = url.searchParams.get("key") || "";
  if (!key) return new Response("Missing key", { status:400 });
  if (isInternalKey(key)) return new Response("Not found", { status:404 });

  const store = uploadsStore();
  const metaEntry = await store.getMetadata(key);
  if (!metaEntry) return new Response("Not found", { status:404 });
  const flags = await readFlags(store);
  const m = merge(metaEntry.metadata, flags[key]);
  if (m.deleted) return new Response("This file is in trash.", { status:410 });

  let data = await store.get(key, { type:"arrayBuffer" });
  if (data === null) return new Response("Not found", { status:404 });

  const type = m.contentType || "application/octet-stream";
  const inline = type.startsWith("text/html") || type.startsWith("image/") || type === "application/pdf";
  const filename = String(m.filename || "file").replace(/[\r\n"]/g,"_");

  // 검색 차단 · 오프라인 지원 · 방문 통계(Google Analytics) 코드 삽입 — 촬영 소품 HTML에도 적용
  if (type.startsWith("text/html")) data = injectBytes(data);
  // 5MB 넘는 파일은 나눠서 보낸다 (Netlify 응답 크기 제한 대응)
  const body = data.byteLength > 5 * 1024 * 1024 ? new Response(data).body : data;

  return new Response(body, {
    headers: {
      "Content-Type": type,
      "Content-Disposition": `${inline ? "inline" : "attachment"}; filename*=UTF-8''${encodeURIComponent(filename)}`,
      "Cache-Control":"no-store",
      "X-Content-Type-Options":"nosniff",
      "X-Robots-Tag":"noindex, nofollow, noarchive"
    }
  });
};
