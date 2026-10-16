// 관리자: 방문 통계 (최근 N일). 지난 날짜의 기록은 하루 요약으로 합치고 원본은 지운다.
import { isAdmin } from "../lib/auth.mjs";
import { uploadsStore } from "../lib/flags.mjs";
import { RAW, SUM, kstDay, summarize } from "../lib/stats.mjs";
const json = (o, status = 200) => Response.json(o, { status, headers: { "Cache-Control": "no-store" } });

async function rawEvents(store, day) {
  const { blobs } = await store.list({ prefix: `${RAW}${day}/` });
  const evs = (await Promise.all(blobs.map((b) => store.get(b.key, { type: "json" }).catch(() => null)))).filter(Boolean);
  return { evs, keys: blobs.map((b) => b.key) };
}
async function daySummary(store, day, today) {
  if (day < today) {
    const s = await store.get(`${SUM}${day}.json`, { type: "json" }).catch(() => null);
    if (s) return s;
  }
  const { evs, keys } = await rawEvents(store, day);
  const s = summarize(day, evs);
  if (day < today && keys.length) {
    await store.setJSON(`${SUM}${day}.json`, s);
    for (const k of keys) await store.delete(k).catch(() => {});
  }
  if (day === today) s.recent = evs.sort((a, b) => b.at - a.at).slice(0, 40);
  return s;
}

export default async (req) => {
  if (!isAdmin(req)) return json({ ok: false, error: "로그인이 필요합니다." }, 401);
  const store = uploadsStore();
  const url = new URL(req.url);
  const n = Math.min(Math.max(parseInt(url.searchParams.get("days"), 10) || 30, 1), 90);
  const today = kstDay();
  const days = [];
  for (let i = n - 1; i >= 0; i--) days.push(kstDay(Date.now() - i * 864e5));
  try {
    const sums = [];
    for (const d of days) sums.push(await daySummary(store, d, today));
    return json({ ok: true, today, days: sums });
  } catch (err) {
    return json({ ok: false, error: `서버 오류: ${err?.message || String(err)}` }, 500);
  }
};
