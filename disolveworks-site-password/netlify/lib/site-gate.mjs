// 사이트 입장 비밀번호 — Netlify Functions(Node)용
// Edge 쪽(netlify/lib/site-gate-edge.js)과 같은 쿠키·같은 공식을 쓴다.
import { createHmac, timingSafeEqual } from "node:crypto";
import { isAdmin } from "./auth.mjs";

const COOKIE = "dw_site";
const MAX_AGE = 60 * 60 * 24 * 30;

const sitePassword = () => (process.env.DISOLVE_SITE_PASSWORD || "").trim();
const token = (pw) => createHmac("sha256", pw).update("site:disolveworks").digest("hex");

function cookieValue(req) {
  const raw = req.headers.get("cookie") || "";
  const found = raw.split(";").map((v) => v.trim()).find((v) => v.startsWith(COOKIE + "="));
  if (!found) return "";
  try { return decodeURIComponent(found.slice(COOKIE.length + 1)); } catch { return ""; }
}
function safeEqual(a, b) {
  try { const aa = Buffer.from(a), bb = Buffer.from(b); return aa.length === bb.length && timingSafeEqual(aa, bb); }
  catch { return false; }
}

export function isVisitor(req) {
  const pw = sitePassword();
  if (!pw) return true; // 잠금 기능 꺼짐
  return safeEqual(cookieValue(req), token(pw));
}

// 입장하지 않은 요청이면 401 응답을, 괜찮으면 null 을 돌려준다. (관리자 로그인 상태는 통과)
export function siteDenied(req) {
  if (isVisitor(req) || isAdmin(req)) return null;
  return new Response("Unauthorized", { status: 401, headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow" } });
}

// 관리자 로그인 시 사이트 입장 쿠키도 함께 준다 (비밀번호가 설정된 경우만)
export function makeSiteCookie() {
  const pw = sitePassword();
  return pw ? `${COOKIE}=${encodeURIComponent(token(pw))}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${MAX_AGE}` : "";
}
