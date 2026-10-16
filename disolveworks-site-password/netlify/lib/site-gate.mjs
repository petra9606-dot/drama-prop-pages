// 사이트 입장 비밀번호 — Netlify Functions(Node)용
// Edge 쪽(netlify/lib/site-gate-edge.js)과 같은 쿠키·같은 공식을 쓴다.
import { createHmac, timingSafeEqual } from "node:crypto";
import { isAdmin } from "./auth.mjs";

const COOKIE = "dw_pass";
const env = (k) => (process.env[k] || "").trim();
const pwFor = (kind) => (kind === "m" ? env("DISOLVE_SITE_PASSWORD") : kind === "g" ? env("DISOLVE_GUEST_PASSWORD") : "");
const gateEnabled = () => !!(env("DISOLVE_SITE_PASSWORD") || env("DISOLVE_GUEST_PASSWORD"));
const sign = (pw, kind, exp) => createHmac("sha256", pw).update(`site:${kind}:${exp}`).digest("hex");

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
  if (!gateEnabled()) return true; // 잠금 기능 꺼짐
  const parts = cookieValue(req).split(".");
  if (parts.length !== 3) return false;
  const [kind, expStr, sig] = parts;
  const pw = pwFor(kind), exp = Number(expStr);
  if (!pw || !Number.isFinite(exp) || exp < Date.now() / 1000) return false;
  return safeEqual(sig, sign(pw, kind, exp));
}

// 입장하지 않은 요청이면 401 응답을, 괜찮으면 null 을 돌려준다. (관리자 로그인 상태는 통과)
export function siteDenied(req) {
  if (isVisitor(req) || isAdmin(req)) return null;
  return new Response("Unauthorized", { status: 401, headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow" } });
}

// 관리자 로그인 시 멤버 입장 쿠키도 함께 준다 (브라우저를 닫으면 사라짐)
export function makeSiteCookie() {
  const pw = pwFor("m");
  if (!pw) return "";
  const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24;
  return `${COOKIE}=${encodeURIComponent(`m.${exp}.${sign(pw, "m", exp)}`)}; HttpOnly; Secure; SameSite=Lax; Path=/`;
}
