
import { createHmac, timingSafeEqual } from "node:crypto";

const COOKIE = "dw_admin";

function expectedToken() {
  const password = process.env.DISOLVE_ADMIN_PASSWORD || "";
  const site = process.env.NETLIFY_SITE_ID || "disolveworks";
  return createHmac("sha256", password).update(`admin:${site}`).digest("hex");
}
function cookieValue(req) {
  const raw = req.headers.get("cookie") || "";
  const found = raw.split(";").map(v => v.trim()).find(v => v.startsWith(COOKIE + "="));
  return found ? decodeURIComponent(found.slice(COOKIE.length + 1)) : "";
}
function safeEqual(a,b) {
  try {
    const aa = Buffer.from(a);
    const bb = Buffer.from(b);
    return aa.length === bb.length && timingSafeEqual(aa,bb);
  } catch { return false; }
}
export function isAdmin(req) {
  if (!process.env.DISOLVE_ADMIN_PASSWORD) return false;
  return safeEqual(cookieValue(req), expectedToken());
}
export function makeCookie() {
  return `${COOKIE}=${encodeURIComponent(expectedToken())}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=28800`;
}
export function clearCookie() {
  return `${COOKIE}=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0`;
}
export function passwordOK(value) {
  const expected = process.env.DISOLVE_ADMIN_PASSWORD || "";
  return expected.length > 0 && safeEqual(String(value || ""), expected);
}
