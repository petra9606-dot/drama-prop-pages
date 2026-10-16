// 사이트 입장 비밀번호 — Edge Function(Deno)용 도우미
// 저장소가 공개라서 비밀번호는 코드에 쓰지 않고 Netlify 환경변수에서 읽는다.
//   DISOLVE_SITE_PASSWORD   멤버 비밀번호  — "기억하기"를 켜면 계속 기억 (1년)
//   DISOLVE_GUEST_PASSWORD  손님 비밀번호  — "기억하기"를 켜도 최대 하루만 기억
// 쿠키 값: "<m|g>.<만료시각(초)>.<서명>"  — 서명은 그 종류의 비밀번호로 만든 HMAC 이라
// 비밀번호를 바꾸면 그 종류로 들어온 사람은 모두 다시 입력해야 한다.

export const SITE_COOKIE = "dw_pass";
export const DAY = 60 * 60 * 24;
export const MEMBER_REMEMBER = DAY * 365;
export const GUEST_REMEMBER = DAY;

const envGet = (k) => { try { return (globalThis.Netlify?.env?.get(k) || "").trim(); } catch { return ""; } };
export const memberPassword = () => envGet("DISOLVE_SITE_PASSWORD");
export const guestPassword = () => envGet("DISOLVE_GUEST_PASSWORD");
export const gateEnabled = () => !!(memberPassword() || guestPassword());
const pwFor = (kind) => (kind === "m" ? memberPassword() : kind === "g" ? guestPassword() : "");

const enc = new TextEncoder();
const hex = (buf) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");

// Node 쪽(netlify/lib/site-gate.mjs)과 같은 공식
export async function sign(password, kind, exp) {
  const key = await crypto.subtle.importKey("raw", enc.encode(password), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return hex(await crypto.subtle.sign("HMAC", key, enc.encode(`site:${kind}:${exp}`)));
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

// 입장한 상태면 "m"/"g", 아니면 "" (잠금 기능이 꺼져 있으면 "open")
export async function gateKind(request) {
  if (!gateEnabled()) return "open";
  const parts = readCookie(request, SITE_COOKIE).split(".");
  if (parts.length !== 3) return "";
  const [kind, expStr, sig] = parts;
  const pw = pwFor(kind);
  const exp = Number(expStr);
  if (!pw || !Number.isFinite(exp) || exp < Date.now() / 1000) return "";
  return safeEqual(sig, await sign(pw, kind, exp)) ? kind : "";
}
export const gateOK = async (request) => !!(await gateKind(request));

// 입력한 비밀번호가 멤버/손님 중 무엇인지 ("" = 틀림)
export function matchPassword(input) {
  const v = String(input || "").trim();
  if (!v) return "";
  const m = memberPassword(), g = guestPassword();
  if (m && safeEqual(v, m)) return "m";
  if (g && safeEqual(v, g)) return "g";
  return "";
}

// remember=false 면 브라우저를 닫을 때까지만(세션 쿠키). 손님은 어떤 경우든 서명 자체가 하루 뒤 만료.
export async function makeSiteCookie(kind, remember) {
  const life = kind === "m" ? MEMBER_REMEMBER : GUEST_REMEMBER;
  const exp = Math.floor(Date.now() / 1000) + life;
  const value = `${kind}.${exp}.${await sign(pwFor(kind), kind, exp)}`;
  return `${SITE_COOKIE}=${encodeURIComponent(value)}; HttpOnly; Secure; SameSite=Lax; Path=/` + (remember ? `; Max-Age=${life}` : "");
}
export function clearSiteCookie() {
  return `${SITE_COOKIE}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`;
}
