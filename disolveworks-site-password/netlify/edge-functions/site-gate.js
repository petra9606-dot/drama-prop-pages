// 사이트 입장 비밀번호 화면.
// 환경변수 DISOLVE_SITE_PASSWORD 가 설정돼 있으면, 그 비밀번호를 입력한 기기만 사이트를 볼 수 있다.
// /admin/ 은 자체 관리자 로그인이 있으므로 그대로 열어 둔다.
import { getStore } from "@netlify/blobs";
import { sitePassword, gateOK, makeSiteCookie, clearSiteCookie, safeEqual } from "../lib/site-gate-edge.js";

const OPEN = [/^\/admin(\/|$)/, /^\/sw\.js$/, /^\/robots\.txt$/, /^\/favicon\.ico$/];
const MAX_FAILS = 10;               // 같은 IP에서
const LOCK_WINDOW = 15 * 60 * 1000; // 15분 안에 10번 틀리면 잠시 잠금

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const safeNext = (n) => (typeof n === "string" && n.startsWith("/") && !n.startsWith("//") && !n.startsWith("/__gate") ? n : "/");

function page(next, msg = "", status = 401) {
  const html = `<!doctype html><html lang="ko"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow,noarchive">
<title>DisolveWorks</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px;
background:#0e1424;color:#e7ecf6;font-family:'Apple SD Gothic Neo','Malgun Gothic',system-ui,sans-serif}
.card{width:100%;max-width:340px;background:#18213a;border:1px solid #2c3a5e;border-radius:16px;padding:28px 24px;
box-shadow:0 18px 50px rgba(0,0,0,.45)}
h1{font-size:15px;letter-spacing:.24em;color:#9fb0d4;font-weight:700;margin-bottom:6px}
p{font-size:13px;color:#8a97b5;margin-bottom:18px}
input{width:100%;padding:13px 14px;font-size:20px;letter-spacing:.35em;text-align:center;border-radius:10px;
border:1px solid #3a4d78;background:#0f1628;color:#fff;outline:none}
input:focus{border-color:#6f8fe0;box-shadow:0 0 0 3px rgba(111,143,224,.25)}
button{margin-top:12px;width:100%;padding:12px;border:0;border-radius:10px;background:#4a6fd1;color:#fff;
font-size:15px;font-weight:700;cursor:pointer}
button:hover{background:#5a7fe0}
.err{margin-top:12px;font-size:13px;color:#ff8a8a;min-height:18px}
</style></head><body>
<form class="card" method="post" action="/__gate" autocomplete="off">
<h1>DISOLVEWORKS</h1>
<p>비밀번호를 입력해야 볼 수 있는 사이트입니다.</p>
<input name="password" type="password" inputmode="numeric" autofocus required aria-label="비밀번호">
<input type="hidden" name="next" value="${esc(next)}">
<button type="submit">입장</button>
<div class="err">${esc(msg)}</div>
</form></body></html>`;
  return new Response(html, {
    status,
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow, noarchive" }
  });
}

async function failState(ip) {
  try {
    const s = getStore({ name: "disolveworks-gate" });
    const key = "fail/" + (ip || "unknown").replace(/[^0-9a-fA-F:.]/g, "_");
    const v = (await s.get(key, { type: "json" })) || { n: 0, at: 0 };
    if (Date.now() - v.at > LOCK_WINDOW) { v.n = 0; v.at = Date.now(); }
    return { s, key, v };
  } catch { return null; }
}

export default async (request, context) => {
  const pw = sitePassword();
  if (!pw) return; // 환경변수가 없으면 잠금 기능 꺼짐 (사이트 그대로)

  const url = new URL(request.url);

  if (url.pathname === "/__gate") {
    if (request.method === "GET" && url.searchParams.has("logout")) {
      return new Response(null, { status: 303, headers: { Location: "/", "Set-Cookie": clearSiteCookie(), "Cache-Control": "no-store" } });
    }
    if (request.method !== "POST") return page(safeNext(url.searchParams.get("next")), "", 200);

    const form = await request.formData().catch(() => null);
    const next = safeNext(form?.get("next"));
    const st = await failState(context?.ip);
    if (st && st.v.n >= MAX_FAILS) return page(next, "시도가 너무 많습니다. 잠시 후 다시 시도해 주세요.", 429);

    if (form && safeEqual(String(form.get("password") || "").trim(), pw)) {
      if (st && st.v.n) { try { await st.s.delete(st.key); } catch {} }
      return new Response(null, { status: 303, headers: { Location: next, "Set-Cookie": await makeSiteCookie(pw), "Cache-Control": "no-store" } });
    }
    if (st) { st.v.n += 1; try { await st.s.setJSON(st.key, st.v); } catch {} }
    await new Promise((r) => setTimeout(r, 600));
    return page(next, "비밀번호가 올바르지 않습니다.");
  }

  if (OPEN.some((r) => r.test(url.pathname))) return;
  if (await gateOK(request)) return;

  // 페이지 이동이면 입장 화면, 그 밖의 파일 요청은 그냥 401
  const accept = request.headers.get("accept") || "";
  if (request.method === "GET" && accept.includes("text/html")) return page(url.pathname + url.search);
  return new Response("Unauthorized", { status: 401, headers: { "Cache-Control": "no-store" } });
};

export const config = { path: "/*" };
