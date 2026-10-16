// 공개: 앱·게임 카드의 웹 화면(HTML)
import { uploadsStore } from "../lib/flags.mjs";
import { readCards, webKey } from "../lib/appcards.mjs";
import { siteDenied } from "../lib/site-gate.mjs";

export default async (req) => {
  const denied = siteDenied(req); if (denied) return denied; // 사이트 입장 비밀번호
  const id = new URL(req.url).searchParams.get("id") || "";
  const store = uploadsStore();
  const c = (await readCards(store)).find((x) => x.id === id);
  if (!c || !c.web) return new Response("Not found", { status: 404 });
  const data = await store.get(webKey(id), { type: "arrayBuffer" });
  if (data === null) return new Response("Not found", { status: 404 });
  const body = data.byteLength > 5 * 1024 * 1024 ? new Response(data).body : data;
  return new Response(body, { headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow, noarchive" } });
};
