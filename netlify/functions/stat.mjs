// 공개: 방문 1건 기록 (관리자 로그인 상태는 세지 않음)
import { uploadsStore } from "../lib/flags.mjs";
import { isAdmin } from "../lib/auth.mjs";
import { RAW, kstDay } from "../lib/stats.mjs";
const ok = () => new Response(null, { status: 204, headers: { "Cache-Control": "no-store" } });
const clip = (v, n) => String(v ?? "").slice(0, n);
export default async (req) => {
  if (req.method !== "POST") return ok();
  if (isAdmin(req)) return ok();
  if (/bot|crawl|spider|headless/i.test(req.headers.get("user-agent") || "")) return ok();
  let b; try { b = JSON.parse(await req.text()); } catch { return ok(); }
  if (!b || typeof b.v !== "string" || !/^[a-z0-9]{6,40}$/.test(b.v) || typeof b.p !== "string" || !b.p.startsWith("/")) return ok();
  const e = { v: b.v, n: b.n ? 1 : 0, p: clip(b.p, 300), t: clip(b.t, 120), d: ["pc", "phone", "tablet"].includes(b.d) ? b.d : "pc", r: clip(b.r, 80), a: clip(b.a, 10), at: Date.now() };
  try { await uploadsStore().setJSON(`${RAW}${kstDay(e.at)}/${e.at}-${Math.random().toString(36).slice(2, 8)}`, e); } catch {}
  return ok();
};
