// 관리자 페이지에서 교체한 깃허브 자료가 있으면 그 파일을, 없으면 원래 파일을 그대로 보여 준다.
import { getStore } from "@netlify/blobs";
import { gateOK } from "../lib/site-gate-edge.js";
import { renameCheongyakHome } from "../lib/cheongyak-brand.js";

let cache = { at: 0, map: null };

export default async (request) => {
  try {
    if (request.method !== "GET" && request.method !== "HEAD") return;
    if (!(await gateOK(request))) return; // 입장 전이면 site-gate 가 처리
    const store = getStore({ name: "disolveworks-uploads" });
    if (!cache.map || Date.now() - cache.at > 15000) {
      const map = await store.get("__meta/static-overrides.json", { type: "json" });
      cache = { at: Date.now(), map: map && typeof map === "object" ? map : {} };
    }
    let path = new URL(request.url).pathname;
    try { path = decodeURIComponent(path); } catch {}
    if (path.endsWith("/")) path += "index.html";
    const o = cache.map[path];
    if (!o || !o.key) return;
    let body = await store.get(o.key, { type: "stream" });
    if (!body) return;
    // Scene 1-4 also has an administrator-uploaded copy. Rename its branding
    // without discarding the custom form, winner animation or staff controls.
    if (request.method === "GET" && path === "/pyramid/part1/cheongyak/index.html" &&
        (!o.contentType || /text\/html/i.test(o.contentType))) {
      body = renameCheongyakHome(await new Response(body).text());
    }
    return new Response(request.method === "HEAD" ? null : body, {
      headers: {
        "Content-Type": o.contentType || "text/html; charset=utf-8",
        "Cache-Control": "no-store",
        "X-Robots-Tag": "noindex, nofollow, noarchive",
        "X-DW-Replaced": o.updatedAt || "1"
      }
    });
  } catch {
    return;
  }
};

export const config = {
  path: ["/pyramid/*", "/apps/*"],
  excludedPath: ["/*.css", "/*.js", "/*.json", "/*.png", "/*.jpg", "/*.jpeg", "/*.webp", "/*.gif", "/*.svg", "/*.mp4", "/*.webm", "/*.mp3", "/*.apk", "/*.zip", "/*.woff2", "/*.ttf"]
};
