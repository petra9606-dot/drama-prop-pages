// APK 내려받기: 관리자에서 조각으로 올린 큰 APK 파일을 순서대로 이어서 보낸다
import { getStore } from "@netlify/blobs";
import { gateOK } from "../lib/site-gate-edge.js";

export default async (request) => {
  try {
    if (!(await gateOK(request))) return; // 입장 전이면 site-gate 가 처리
    const m = new URL(request.url).pathname.match(/^\/dl\/([A-Za-z0-9]+)\//);
    if (!m) return new Response("Not found", { status: 404 });
    const store = getStore({ name: "disolveworks-uploads" });
    const cards = await store.get("__meta/appcards.json", { type: "json" });
    const c = Array.isArray(cards) ? cards.find((x) => x.id === m[1]) : null;
    if (!c || !c.apk || c.visible === false) return new Response("Not found", { status: 404 });
    const { chunkId, count, size, name } = c.apk;
    let i = 0;
    const body = new ReadableStream({
      async pull(ctrl) {
        if (i >= count) { ctrl.close(); return; }
        const buf = await store.get(`__meta/chunks/${chunkId}/${String(i).padStart(3, "0")}`, { type: "arrayBuffer" });
        i++;
        if (!buf) { ctrl.error(new Error("missing part")); return; }
        ctrl.enqueue(new Uint8Array(buf));
      }
    });
    return new Response(request.method === "HEAD" ? null : body, {
      headers: {
        "Content-Type": "application/vnd.android.package-archive",
        ...(size ? { "Content-Length": String(size) } : {}),
        "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(name || "app.apk")}`,
        "Cache-Control": "no-store",
        "X-Robots-Tag": "noindex, nofollow"
      }
    });
  } catch {
    return new Response("Download error", { status: 500 });
  }
};

export const config = { path: "/dl/*" };
