// 사이트 입장 비밀번호 — Edge Function(Deno)용 도우미
// 비밀번호는 저장소가 공개라서 코드에 쓰지 않고 Netlify 환경변수 DISOLVE_SITE_PASSWORD 에서 읽는다.

export const SITE_COOKIE = "dw_site";
const MAX_AGE = 60 * 60 * 24 * 30; // 30일

export function sitePassword() {
  try { return (globalThis.Netlify?.env?.get("DISOLVE_SITE_PASSWORD") || "").trim(); } catch { return ""; }
}

const enc = new TextEncoder();
const hex = (buf) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");

// Node 쪽(netlify/lib/site-gate.mjs)과 같은 공식: HMAC-SHA256(key=비밀번호, "site:disolveworks")
export async function siteToken(password) {
  const key = await crypto.subtle.importKey("raw", enc.encode(password), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return hex(await crypto.subtle.sign("HMAC", key, enc.encode("site:disolveworks")));
}

export function readCookie(request, name) {
  const raw = request.headers.get("cookie") || "";
  const found = raw.split(";").map((v) => v.trim()).find((v) => v.startsWith(name + "="));
  if (!found) return "";
  try { return decodeURIComponent(found.slice(name.length + 1)); } catch { return ""; }
}

export function safeEqual(a, b) {
  a = String(a); b = String(b);
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

// 비밀번호가 설정되지 않았으면 잠금 해제 상태(true)로 본다.
export async function gateOK(request) {
  const pw = sitePassword();
  if (!pw) return true;
  const got = readCookie(request, SITE_COOKIE);
  return !!got && safeEqual(got, await siteToken(pw));
}

export async function makeSiteCookie(password) {
  return `${SITE_COOKIE}=${encodeURIComponent(await siteToken(password))}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${MAX_AGE}`;
}
export function clearSiteCookie() {
  return `${SITE_COOKIE}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`;
}
